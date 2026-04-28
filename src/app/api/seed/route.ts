import { NextResponse } from 'next/server';
import { seedFromJson } from '@/data/db';
import dbJson from '@/data/db.json';

// One-time migration endpoint: POST /api/seed
// Call this once after setting up MongoDB to import existing db.json data.
// Protected by a secret token set in SEED_SECRET env variable.
export async function POST(request: Request) {
  try {
    const secret = process.env.SEED_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'SEED_SECRET not configured' }, { status: 403 });
    }

    const { token } = (await request.json().catch(() => ({}))) as { token?: string };
    if (token !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await seedFromJson(dbJson as unknown as Parameters<typeof seedFromJson>[0]);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Seed failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
