import { NextResponse } from 'next/server';
import { createBooking, getBookings } from '@/data/db';
import { createExternalBooking, getExternalBookings } from '@/lib/backend';
import { applyRateLimit } from '@/lib/rate-limit';
import { validateCreateBookingPayload } from '@/lib/validation';

export async function GET() {
  try {
    const bookings = (await getExternalBookings()) ?? (await getBookings());
    return NextResponse.json(bookings);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const rateLimit = applyRateLimit(request, 'bookings-create');
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many booking requests. Please try again shortly.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        },
      );
    }

    const bookingData = validateCreateBookingPayload(await request.json());
    const externalResponse = await createExternalBooking(bookingData);

    if (externalResponse) {
      return NextResponse.json(externalResponse);
    }

    const newBooking = await createBooking(bookingData);

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create booking';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
