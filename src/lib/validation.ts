import type { Booking } from '@/data/types';

export type BookingStatus = Booking['status'];

const BOOKING_STATUSES: BookingStatus[] = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
const CUSTOMER_TYPES: Booking['customerType'][] = ['Construction', 'Farmer'];
const BOOKING_TYPES: Booking['bookingType'][] = ['Hourly', 'Daily', 'Monthly'];

function isNonEmptyString(value: unknown, minLength = 1, maxLength = 200): value is string {
  return typeof value === 'string' && value.trim().length >= minLength && value.trim().length <= maxLength;
}

function isPositiveFiniteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isValidDateString(value: unknown) {
  if (typeof value !== 'string') {
    return false;
  }

  const date = new Date(value);
  return Number.isFinite(date.getTime());
}

export type CreateBookingPayload = {
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

export function validateCreateBookingPayload(payload: unknown): CreateBookingPayload {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid booking payload');
  }

  const body = payload as Record<string, unknown>;

  if (!isNonEmptyString(body.equipmentId, 2, 100)) throw new Error('Equipment is required');
  if (!isNonEmptyString(body.customer, 2, 80)) throw new Error('Customer name is invalid');
  if (body.phone && !isNonEmptyString(body.phone, 7, 20)) throw new Error('Phone number is invalid (minimum 7 digits)');
  if (!isValidDateString(body.startDate)) throw new Error('Start date is invalid');
  if (!isValidDateString(body.endDate)) throw new Error('End date is invalid');
  if (!isPositiveFiniteNumber(body.total)) throw new Error('Total amount is invalid');
  if (!isNonEmptyString(body.duration, 1, 80)) throw new Error('Duration is invalid');
  // notes are optional - only validate if non-empty
  if (body.notes && typeof body.notes === 'string' && body.notes.trim().length > 0 && body.notes.trim().length > 500) {
    throw new Error('Notes are too long (max 500 characters)');
  }

  if (!CUSTOMER_TYPES.includes(body.customerType as Booking['customerType'])) {
    throw new Error('Customer type is invalid');
  }

  if (!BOOKING_TYPES.includes(body.bookingType as Booking['bookingType'])) {
    throw new Error('Booking type is invalid');
  }

  const startDate = new Date(body.startDate as string);
  const endDate = new Date(body.endDate as string);
  if (endDate < startDate) {
    throw new Error('End date cannot be before start date');
  }

  return {
    equipmentId: (body.equipmentId as string).trim(),
    customer: (body.customer as string).trim(),
    phone: typeof body.phone === 'string' ? body.phone.trim() : undefined,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    total: body.total as number,
    customerType: body.customerType as Booking['customerType'],
    bookingType: body.bookingType as Booking['bookingType'],
    hours: typeof body.hours === 'number' ? body.hours : undefined,
    duration: (body.duration as string).trim(),
    notes: typeof body.notes === 'string' && body.notes.trim().length > 0 ? body.notes.trim() : undefined,
  };
}

export function validateBookingStatusPayload(payload: unknown): { status: BookingStatus } {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid status payload');
  }

  const status = (payload as Record<string, unknown>).status;
  if (!BOOKING_STATUSES.includes(status as BookingStatus)) {
    throw new Error('Status is invalid');
  }

  return { status: status as BookingStatus };
}

export type CreateInquiryPayload = {
  name: string;
  phone: string;
  industry: string;
  message: string;
};

export function validateInquiryPayload(payload: unknown): CreateInquiryPayload {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid enquiry payload');
  }

  const body = payload as Record<string, unknown>;
  if (!isNonEmptyString(body.name, 2, 80)) throw new Error('Name is invalid');
  if (!isNonEmptyString(body.phone, 8, 20)) throw new Error('Phone is invalid');
  if (!isNonEmptyString(body.industry, 2, 60)) throw new Error('Industry is invalid');
  if (!isNonEmptyString(body.message, 5, 1000)) throw new Error('Message is invalid');

  return {
    name: (body.name as string).trim(),
    phone: (body.phone as string).trim(),
    industry: (body.industry as string).trim(),
    message: (body.message as string).trim(),
  };
}
