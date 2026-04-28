import 'server-only';

import { randomUUID } from 'crypto';
import type { Booking, Equipment, Stats } from '@/data/types';
import { getDb } from '@/lib/mongodb';

export type { Booking, Equipment, Stats } from '@/data/types';

// ── Collection names ──────────────────────────────────────────────────────────
const COL = {
  equipment: 'equipment',
  bookings: 'bookings',
  enquiries: 'enquiries',
  gallery: 'gallery',
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
function createEntityId(prefix: 'BK' | 'ENQ') {
  return `${prefix}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

const RESERVED_BOOKING_STATUSES: Booking['status'][] = ['Confirmed', 'Pending'];
const REVENUE_BOOKING_STATUSES: Booking['status'][] = ['Confirmed', 'Completed'];

// ── Equipment ─────────────────────────────────────────────────────────────────
export async function getEquipment(): Promise<Equipment[]> {
  const db = await getDb();
  const bookings = await db
    .collection<Booking>(COL.bookings)
    .find()
    .toArray();

  const equipment = await db
    .collection<Equipment>(COL.equipment)
    .find()
    .toArray();

  // Sync availability based on active bookings
  return equipment.map((item) => {
    const reserved = bookings.filter(
      (b) =>
        (b.equipmentId === item.id || b.equipment === item.name) &&
        RESERVED_BOOKING_STATUSES.includes(b.status),
    ).length;
    const available = Math.max((item.stock ?? 1) - reserved, 0);
    return { ...item, availability: available > 0, _id: undefined } as Equipment;
  });
}

export async function getEquipmentById(id: string): Promise<Equipment | null> {
  const all = await getEquipment();
  return all.find((e) => e.id === id) ?? null;
}

export async function updateEquipment(id: string, updates: Partial<Equipment>): Promise<Equipment> {
  if (!id) throw new Error('ID is required');
  const db = await getDb();
  const result = await db
    .collection<Equipment>(COL.equipment)
    .findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after' },
    );
  if (!result) throw new Error('Equipment not found');
  const { _id: _ignored, ...rest } = result as Equipment & { _id?: unknown };
  return rest as Equipment;
}

export async function addEquipment(input: Omit<Equipment, 'id' | 'availability'>): Promise<Equipment> {
  const db = await getDb();
  const newEquipment: Equipment = {
    id: `eq-${Date.now()}`,
    ...input,
    availability: true,
  };
  await db.collection<Equipment>(COL.equipment).insertOne(newEquipment as Equipment & { _id?: unknown });
  return newEquipment;
}

export async function deleteEquipment(id: string): Promise<void> {
  if (!id) throw new Error('ID is required');
  const db = await getDb();
  const result = await db.collection(COL.equipment).deleteOne({ id });
  if (result.deletedCount === 0) throw new Error('Equipment not found');
}

// ── Bookings ──────────────────────────────────────────────────────────────────
export async function getBookings(): Promise<Booking[]> {
  const db = await getDb();
  const bookings = await db
    .collection<Booking>(COL.bookings)
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  // Auto-expire: pending bookings overdue by more than 24 hours → Completed
  const now = Date.now();
  const gracePeriodMs = 24 * 60 * 60 * 1000;

  const processed = bookings.map((b) => {
    if (b.status === 'Pending') {
      const overdue = now - new Date(b.endDate).getTime();
      if (overdue > gracePeriodMs) {
        // Fire-and-forget update (don't await — keeps response fast)
        void db
          .collection<Booking>(COL.bookings)
          .updateOne({ id: b.id }, { $set: { status: 'Completed' } });
        return { ...b, status: 'Completed' as Booking['status'] };
      }
    }
    return b;
  });

  return processed.map(({ _id: _ignored, ...rest }) => rest) as Booking[];
}

export type CreateBookingInput = {
  equipmentId: string;
  customer: string;
  phone?: string;
  startDate: string;
  endDate: string;
  total: number;
  customerType: Booking['customerType'];
  bookingType: Booking['bookingType'];
  hours?: number;
  duration: string;
  notes?: string;
};

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const db = await getDb();
  const equipment = await db
    .collection<Equipment>(COL.equipment)
    .findOne({ id: input.equipmentId });

  if (!equipment) throw new Error('Equipment not found');

  const newBooking: Booking = {
    id: createEntityId('BK'),
    equipmentId: equipment.id,
    customer: input.customer.trim(),
    phone: input.phone?.trim(),
    equipment: equipment.name,
    location: equipment.location,
    startDate: input.startDate,
    endDate: input.endDate,
    total: input.total,
    customerType: input.customerType,
    bookingType: input.bookingType,
    hours: input.hours,
    duration: input.duration,
    createdAt: new Date().toISOString(),
    status: 'Pending',
    notes: input.notes?.trim(),
  };

  await db.collection(COL.bookings).insertOne({ ...newBooking });
  return newBooking;
}

export async function updateBookingStatus(
  id: string,
  status: Booking['status'],
): Promise<Booking> {
  const db = await getDb();
  const result = await db
    .collection<Booking>(COL.bookings)
    .findOneAndUpdate(
      { id },
      { $set: { status } },
      { returnDocument: 'after' },
    );
  if (!result) throw new Error('Booking not found');
  const { _id: _ignored, ...rest } = result as Booking & { _id?: unknown };
  return rest as Booking;
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export async function getStats(): Promise<Stats> {
  const [equipmentList, bookings] = await Promise.all([
    getEquipment(),
    getBookings(),
  ]);

  const totalMachines = equipmentList.reduce((s, e) => s + (e.stock ?? 1), 0);
  const reservedUnits = equipmentList.reduce((s, item) => {
    return (
      s +
      bookings.filter(
        (b) =>
          (b.equipmentId === item.id || b.equipment === item.name) &&
          RESERVED_BOOKING_STATUSES.includes(b.status),
      ).length
    );
  }, 0);

  const activeBookings = bookings.filter((b) =>
    RESERVED_BOOKING_STATUSES.includes(b.status),
  ).length;

  const totalRevenue = bookings
    .filter((b) => REVENUE_BOOKING_STATUSES.includes(b.status))
    .reduce((s, b) => s + b.total, 0);

  return {
    totalRevenue,
    activeBookings,
    utilization: totalMachines > 0 ? Math.round((reservedUnits / totalMachines) * 100) : 0,
  };
}

// ── Enquiries ─────────────────────────────────────────────────────────────────
export async function createInquiry(input: {
  name: string;
  phone: string;
  industry: string;
  message: string;
}) {
  const db = await getDb();
  const newInquiry = {
    id: createEntityId('ENQ'),
    ...input,
    createdAt: new Date().toISOString(),
  };
  await db.collection(COL.enquiries).insertOne({ ...newInquiry });
  return newInquiry;
}

export async function getEnquiries() {
  const db = await getDb();
  const docs = await db
    .collection(COL.enquiries)
    .find()
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(({ _id: _ignored, ...rest }) => rest);
}

// ── Gallery ───────────────────────────────────────────────────────────────────
export async function getGallery() {
  const db = await getDb();
  const docs = await db
    .collection(COL.gallery)
    .find()
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(({ _id: _ignored, ...rest }) => rest);
}

export async function addGalleryItem(input: {
  imageUrl: string;
  title: string;
  location: string;
}) {
  const db = await getDb();
  const newItem = {
    id: `gal-${Date.now()}`,
    ...input,
    createdAt: new Date().toISOString(),
  };
  await db.collection(COL.gallery).insertOne({ ...newItem });
  return newItem;
}

// ── Seed (one-time migration from db.json) ────────────────────────────────────
export async function seedFromJson(data: {
  equipment: Equipment[];
  bookings: Booking[];
  enquiries?: unknown[];
  gallery?: unknown[];
}) {
  const db = await getDb();

  const eqCount = await db.collection(COL.equipment).countDocuments();
  if (eqCount === 0 && data.equipment.length > 0) {
    await db.collection(COL.equipment).insertMany(data.equipment as unknown as Document[]);
  }

  const bkCount = await db.collection(COL.bookings).countDocuments();
  if (bkCount === 0 && data.bookings.length > 0) {
    await db.collection(COL.bookings).insertMany(data.bookings as unknown as Document[]);
  }

  if (data.enquiries && data.enquiries.length > 0) {
    const enqCount = await db.collection(COL.enquiries).countDocuments();
    if (enqCount === 0) {
      await db.collection(COL.enquiries).insertMany(data.enquiries as unknown as Document[]);
    }
  }

  return { ok: true };
}
