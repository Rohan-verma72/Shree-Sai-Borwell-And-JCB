import { NextResponse } from 'next/server';
import { createInquiry, getEnquiries } from '@/data/db';
import { applyRateLimit } from '@/lib/rate-limit';
import { validateInquiryPayload } from '@/lib/validation';

export async function GET() {
  try {
    const enquiries = await getEnquiries();
    return NextResponse.json(enquiries);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch enquiries';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const rateLimit = applyRateLimit(request, 'enquiries-create');
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many enquiries. Please try again shortly.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        },
      );
    }

    const body = validateInquiryPayload(await request.json());
    const inquiry = await createInquiry(body);
    return NextResponse.json({ success: true, inquiry });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save inquiry';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

