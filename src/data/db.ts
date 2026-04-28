import 'server-only';

import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import type { Booking, DbData, Equipment, Stats } from '@/data/types';

export type { Booking, DbData, Equipment, Stats } from '@/data/types';

const DB_PATH = path.join(process.cwd(), 'src/data/db.json');

const RESERVED_BOOKING_STATUSES: Booking['status'][] = ['Confirmed', 'Pending'];
const REVENUE_BOOKING_STATUSES: Booking['status'][] = ['Confirmed', 'Completed'];

function createEntityId(prefix: 'BK' | 'ENQ') {
  return `${prefix}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function countReservedUnits(bookings: Booking[], equipmentId: string, equipmentName: string) {
  return bookings.filter(
    (booking) =>
      (booking.equipmentId === equipmentId || booking.equipment === equipmentName) &&
      RESERVED_BOOKING_STATUSES.includes(booking.status),
  ).length;
}

function syncEquipmentAvailability(data: DbData) {
  data.equipment = data.equipment.map((item) => {
    const reservedUnits = countReservedUnits(data.bookings, item.id, item.name);
    const availableUnits = Math.max(item.stock - reservedUnits, 0);

    return {
      ...item,
      availability: availableUnits > 0,
    };
  });
}

function calculateStats(data: DbData): Stats {
  const reservedUnits = data.equipment.reduce((sum, item) => {
    return sum + countReservedUnits(data.bookings, item.id, item.name);
  }, 0);
  const totalMachines = data.equipment.reduce((sum, item) => sum + item.stock, 0);
  const activeBookings = data.bookings.filter((booking) =>
    RESERVED_BOOKING_STATUSES.includes(booking.status),
  ).length;
  const totalRevenue = data.bookings
    .filter((booking) => REVENUE_BOOKING_STATUSES.includes(booking.status))
    .reduce((sum, booking) => sum + booking.total, 0);

  return {
    totalRevenue,
    activeBookings,
    utilization: totalMachines > 0 ? Math.round((reservedUnits / totalMachines) * 100) : 0,
  };
}

function autoExpireOldBookings(data: DbData) {
  const now = new Date();
  // Grace period: only auto-expire bookings that ended more than 24 hours ago
  // This prevents same-day bookings from being auto-completed during admin actions
  const gracePeriodMs = 24 * 60 * 60 * 1000;
  data.bookings = data.bookings.map((booking) => {
    if (booking.status === 'Pending') {
      const endDate = new Date(booking.endDate);
      const msOverdue = now.getTime() - endDate.getTime();
      if (msOverdue > gracePeriodMs) {
        return { ...booking, status: 'Completed' as Booking['status'] };
      }
    }
    return booking;
  });
}

function syncDerivedData(data: DbData) {
  autoExpireOldBookings(data);
  syncEquipmentAvailability(data);
  data.stats = calculateStats(data);
}

export async function readDb(): Promise<DbData> {
  const fileContents = await fs.readFile(DB_PATH, 'utf-8');
  const data = JSON.parse(fileContents) as DbData;
  syncDerivedData(data);
  return data;
}

export async function writeDb(data: DbData) {
  syncDerivedData(data);
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

export async function getEquipment() {
  const data = await readDb();
  return data.equipment;
}

export async function getEquipmentById(id: string) {
  const equipment = await getEquipment();
  return equipment.find((item) => item.id === id) ?? null;
}

export async function getBookings() {
  const data = await readDb();
  return data.bookings;
}

export async function getStats() {
  const data = await readDb();
  return data.stats;
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

export async function createBooking(input: CreateBookingInput) {
  const data = await readDb();
  const equipment = data.equipment.find((item) => item.id === input.equipmentId);

  if (!equipment) {
    throw new Error('Equipment not found');
  }

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

  data.bookings.unshift(newBooking);
  await writeDb(data);

  return newBooking;
}

export async function updateBookingStatus(id: string, status: Booking['status']) {
  const raw = await fs.readFile(DB_PATH, 'utf-8');
  const data = JSON.parse(raw) as DbData;
  const bookingIndex = data.bookings.findIndex((item) => item.id === id);

  if (bookingIndex === -1) {
    throw new Error('Booking not found');
  }

  const updatedBooking: Booking = {
    ...data.bookings[bookingIndex],
    status,
  };

  data.bookings[bookingIndex] = updatedBooking;
  // Sync derived data AFTER setting the explicit status so auto-expire
  // does not override the admin's chosen status during the same write.
  syncDerivedData(data);
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));

  return updatedBooking;
}

export async function createInquiry(input: {
  name: string;
  phone: string;
  industry: string;
  message: string;
}) {
  const data = await readDb();
  const newInquiry = {
    id: createEntityId('ENQ'),
    ...input,
    createdAt: new Date().toISOString(),
  };

  if (!data.enquiries) data.enquiries = [];
  data.enquiries.unshift(newInquiry);
  await writeDb(data);

  return newInquiry;
}

export async function updateEquipment(id: string, updates: Partial<Equipment>) {
  if (!id) throw new Error('ID is required');
  const data = await readDb();
  const targetId = id.trim();
  const index = data.equipment.findIndex((item) => item.id.toLowerCase() === targetId.toLowerCase());

  if (index === -1) {
    throw new Error('Equipment not found');
  }

  data.equipment[index] = {
    ...data.equipment[index],
    ...updates,
  };

  await writeDb(data);
  return data.equipment[index];
}

export async function addEquipment(input: Omit<Equipment, 'id' | 'availability'>) {
  const data = await readDb();
  const newEquipment: Equipment = {
    id: `eq-${Date.now()}`,
    ...input,
    availability: true,
  };

  data.equipment.push(newEquipment);
  await writeDb(data);
  return newEquipment;
}

export async function deleteEquipment(id: string) {
  if (!id) throw new Error('ID is required');
  const data = await readDb();
  const targetId = id.trim();
  const index = data.equipment.findIndex((item) => item.id.toLowerCase() === targetId.toLowerCase());

  if (index === -1) {
    throw new Error('Equipment not found');
  }

  data.equipment.splice(index, 1);
  await writeDb(data);
}

export async function getGallery() {
  const data = await readDb();
  return data.gallery || [];
}

export async function addGalleryItem(input: { imageUrl: string; title: string; location: string }) {
  const data = await readDb();
  if (!data.gallery) data.gallery = [];
  
  const newItem = {
    id: `gal-${Date.now()}`,
    ...input,
    createdAt: new Date().toISOString()
  };
  
  data.gallery.unshift(newItem);
  await writeDb(data);
  return newItem;
}
