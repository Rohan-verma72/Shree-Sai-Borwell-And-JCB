import 'server-only';

import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import type { Booking, Equipment, Stats } from '@/data/types';

export type { Booking, Equipment, Stats } from '@/data/types';

// ── Check if MongoDB is configured ───────────────────────────────────────────
const useMongo = Boolean(process.env.MONGODB_URI);

// ── Lazy import MongoDB client (only when MONGODB_URI is set) ────────────────
async function getMongoDb() {
  if (!useMongo) throw new Error('MongoDB not configured');
  const { getDb } = await import('@/lib/mongodb');
  return getDb();
}

// ── Local JSON fallback (used when MONGODB_URI is not set) ───────────────────
const DB_PATH = path.join(process.cwd(), 'src/data/db.json');

type DbData = {
  equipment: Equipment[];
  bookings: Booking[];
  enquiries: unknown[];
  gallery: unknown[];
  stats: Stats;
};

async function readLocal(): Promise<DbData> {
  const raw = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(raw) as DbData;
}

async function writeLocal(data: DbData): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

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

function autoExpireBookings(bookings: Booking[]): Booking[] {
  const now = Date.now();
  const gracePeriodMs = 24 * 60 * 60 * 1000;
  return bookings.map((b) => {
    if (b.status === 'Pending') {
      const overdue = now - new Date(b.endDate).getTime();
      if (overdue > gracePeriodMs) {
        return { ...b, status: 'Completed' as Booking['status'] };
      }
    }
    return b;
  });
}

function syncAvailability(equipment: Equipment[], bookings: Booking[]): Equipment[] {
  return equipment.map((item) => {
    const reserved = bookings.filter(
      (b) =>
        (b.equipmentId === item.id || b.equipment === item.name) &&
        RESERVED_BOOKING_STATUSES.includes(b.status),
    ).length;
    return { ...item, availability: Math.max((item.stock ?? 1) - reserved, 0) > 0 };
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// EQUIPMENT
// ══════════════════════════════════════════════════════════════════════════════

export async function getEquipment(): Promise<Equipment[]> {
  if (useMongo) {
    const db = await getMongoDb();
    const [equipmentDocs, bookingDocs] = await Promise.all([
      db.collection<Equipment>(COL.equipment).find().toArray(),
      db.collection<Booking>(COL.bookings).find().toArray(),
    ]);
    const bookings = autoExpireBookings(bookingDocs as Booking[]);
    return syncAvailability(
      equipmentDocs.map(({ _id: _i, ...rest }) => rest as Equipment),
      bookings,
    );
  }

  const data = await readLocal();
  const bookings = autoExpireBookings(data.bookings);
  return syncAvailability(data.equipment, bookings);
}

export async function getEquipmentById(id: string): Promise<Equipment | null> {
  const all = await getEquipment();
  return all.find((e) => e.id === id) ?? null;
}

export async function updateEquipment(id: string, updates: Partial<Equipment>): Promise<Equipment> {
  if (!id) throw new Error('ID is required');

  if (useMongo) {
    const db = await getMongoDb();
    const result = await db
      .collection<Equipment>(COL.equipment)
      .findOneAndUpdate({ id }, { $set: updates }, { returnDocument: 'after' });
    if (!result) throw new Error('Equipment not found');
    const { _id: _i, ...rest } = result as Equipment & { _id?: unknown };
    return rest as Equipment;
  }

  const data = await readLocal();
  const idx = data.equipment.findIndex((e) => e.id.toLowerCase() === id.toLowerCase());
  if (idx === -1) throw new Error('Equipment not found');
  data.equipment[idx] = { ...data.equipment[idx], ...updates };
  await writeLocal(data);
  return data.equipment[idx];
}

export async function addEquipment(input: Omit<Equipment, 'id' | 'availability'>): Promise<Equipment> {
  const newEq: Equipment = { id: `eq-${Date.now()}`, ...input, availability: true };

  if (useMongo) {
    const db = await getMongoDb();
    await db.collection(COL.equipment).insertOne({ ...newEq });
    return newEq;
  }

  const data = await readLocal();
  data.equipment.push(newEq);
  await writeLocal(data);
  return newEq;
}

export async function deleteEquipment(id: string): Promise<void> {
  if (!id) throw new Error('ID is required');

  if (useMongo) {
    const db = await getMongoDb();
    const result = await db.collection(COL.equipment).deleteOne({ id });
    if (result.deletedCount === 0) throw new Error('Equipment not found');
    return;
  }

  const data = await readLocal();
  const idx = data.equipment.findIndex((e) => e.id.toLowerCase() === id.toLowerCase());
  if (idx === -1) throw new Error('Equipment not found');
  data.equipment.splice(idx, 1);
  await writeLocal(data);
}

// ══════════════════════════════════════════════════════════════════════════════
// BOOKINGS
// ══════════════════════════════════════════════════════════════════════════════

export async function getBookings(): Promise<Booking[]> {
  if (useMongo) {
    const db = await getMongoDb();
    const docs = await db
      .collection<Booking>(COL.bookings)
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    const expired = autoExpireBookings(docs as Booking[]);
    // Fire-and-forget update expired ones
    expired.forEach((b, i) => {
      if (b.status !== (docs[i] as Booking).status) {
        void db.collection(COL.bookings).updateOne({ id: b.id }, { $set: { status: b.status } });
      }
    });
    return expired.map(({ _id: _i, ...rest }: Booking & { _id?: unknown }) => rest as Booking);
  }

  const data = await readLocal();
  return autoExpireBookings(data.bookings);
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
  const newBooking: Booking = {
    id: createEntityId('BK'),
    equipmentId: input.equipmentId,
    customer: input.customer.trim(),
    phone: input.phone?.trim(),
    equipment: '',
    location: '',
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

  if (useMongo) {
    const db = await getMongoDb();
    const equipment = await db.collection<Equipment>(COL.equipment).findOne({ id: input.equipmentId });
    if (!equipment) throw new Error('Equipment not found');
    newBooking.equipment = equipment.name;
    newBooking.location = equipment.location;
    await db.collection(COL.bookings).insertOne({ ...newBooking });
    return newBooking;
  }

  const data = await readLocal();
  const equipment = data.equipment.find((e) => e.id === input.equipmentId);
  if (!equipment) throw new Error('Equipment not found');
  newBooking.equipment = equipment.name;
  newBooking.location = equipment.location;
  data.bookings.unshift(newBooking);
  await writeLocal(data);
  return newBooking;
}

export async function updateBookingStatus(id: string, status: Booking['status']): Promise<Booking> {
  if (useMongo) {
    const db = await getMongoDb();
    const result = await db
      .collection<Booking>(COL.bookings)
      .findOneAndUpdate({ id }, { $set: { status } }, { returnDocument: 'after' });
    if (!result) throw new Error('Booking not found');
    const { _id: _i, ...rest } = result as Booking & { _id?: unknown };
    return rest as Booking;
  }

  // Local fallback — read raw, update, write raw (no auto-expire override)
  const raw = await fs.readFile(DB_PATH, 'utf-8');
  const data = JSON.parse(raw) as DbData;
  const idx = data.bookings.findIndex((b) => b.id === id);
  if (idx === -1) throw new Error('Booking not found');
  data.bookings[idx] = { ...data.bookings[idx], status };
  await writeLocal(data);
  return data.bookings[idx];
}

// ══════════════════════════════════════════════════════════════════════════════
// STATS
// ══════════════════════════════════════════════════════════════════════════════

export async function getStats(): Promise<Stats> {
  const [equipmentList, bookings] = await Promise.all([getEquipment(), getBookings()]);

  const totalMachines = equipmentList.reduce((s, e) => s + (e.stock ?? 1), 0);
  const reservedUnits = equipmentList.reduce(
    (s, item) =>
      s +
      bookings.filter(
        (b) =>
          (b.equipmentId === item.id || b.equipment === item.name) &&
          RESERVED_BOOKING_STATUSES.includes(b.status),
      ).length,
    0,
  );
  const activeBookings = bookings.filter((b) => RESERVED_BOOKING_STATUSES.includes(b.status)).length;
  const totalRevenue = bookings
    .filter((b) => REVENUE_BOOKING_STATUSES.includes(b.status))
    .reduce((s, b) => s + b.total, 0);

  return {
    totalRevenue,
    activeBookings,
    utilization: totalMachines > 0 ? Math.round((reservedUnits / totalMachines) * 100) : 0,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ENQUIRIES
// ══════════════════════════════════════════════════════════════════════════════

export async function createInquiry(input: {
  name: string;
  phone: string;
  industry: string;
  message: string;
}) {
  const newInquiry = { id: createEntityId('ENQ'), ...input, createdAt: new Date().toISOString() };

  if (useMongo) {
    const db = await getMongoDb();
    await db.collection(COL.enquiries).insertOne({ ...newInquiry });
    return newInquiry;
  }

  const data = await readLocal();
  if (!data.enquiries) data.enquiries = [];
  (data.enquiries as typeof newInquiry[]).unshift(newInquiry);
  await writeLocal(data);
  return newInquiry;
}

export async function getEnquiries() {
  if (useMongo) {
    const db = await getMongoDb();
    const docs = await db.collection(COL.enquiries).find().sort({ createdAt: -1 }).toArray();
    return docs.map(({ _id: _i, ...rest }) => rest);
  }

  const data = await readLocal();
  return (data.enquiries ?? []) as unknown[];
}

// ══════════════════════════════════════════════════════════════════════════════
// GALLERY
// ══════════════════════════════════════════════════════════════════════════════

export async function getGallery() {
  if (useMongo) {
    const db = await getMongoDb();
    const docs = await db.collection(COL.gallery).find().sort({ createdAt: -1 }).toArray();
    return docs.map(({ _id: _i, ...rest }) => rest);
  }

  const data = await readLocal();
  return (data.gallery ?? []) as unknown[];
}

export async function addGalleryItem(input: { imageUrl: string; title: string; location: string }) {
  const newItem = { id: `gal-${Date.now()}`, ...input, createdAt: new Date().toISOString() };

  if (useMongo) {
    const db = await getMongoDb();
    await db.collection(COL.gallery).insertOne({ ...newItem });
    return newItem;
  }

  const data = await readLocal();
  if (!data.gallery) data.gallery = [];
  (data.gallery as typeof newItem[]).unshift(newItem);
  await writeLocal(data);
  return newItem;
}

// ══════════════════════════════════════════════════════════════════════════════
// SEED (one-time migration from db.json → MongoDB)
// ══════════════════════════════════════════════════════════════════════════════

export async function seedFromJson(data: {
  equipment: Equipment[];
  bookings: Booking[];
  enquiries?: unknown[];
  gallery?: unknown[];
}) {
  if (!useMongo) return { ok: false, reason: 'MongoDB not configured' };
  const db = await getMongoDb();

  if ((await db.collection(COL.equipment).countDocuments()) === 0 && data.equipment.length > 0) {
    await db.collection(COL.equipment).insertMany(data.equipment as unknown[]);
  }
  if ((await db.collection(COL.bookings).countDocuments()) === 0 && data.bookings.length > 0) {
    await db.collection(COL.bookings).insertMany(data.bookings as unknown[]);
  }
  if (data.enquiries?.length && (await db.collection(COL.enquiries).countDocuments()) === 0) {
    await db.collection(COL.enquiries).insertMany(data.enquiries as unknown[]);
  }

  return { ok: true };
}
