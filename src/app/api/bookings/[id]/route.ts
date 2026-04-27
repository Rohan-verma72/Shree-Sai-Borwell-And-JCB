import { NextResponse } from 'next/server';
import { updateBookingStatus } from '@/data/db';
import { updateExternalBookingStatus } from '@/lib/backend';
import { validateBookingStatusPayload } from '@/lib/validation';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = validateBookingStatusPayload(await request.json());

    const externalResponse = await updateExternalBookingStatus(id, body);

    if (externalResponse) {
      return NextResponse.json(externalResponse);
    }

    const booking = await updateBookingStatus(id, body.status);
    return NextResponse.json({ success: true, booking });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update booking';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
