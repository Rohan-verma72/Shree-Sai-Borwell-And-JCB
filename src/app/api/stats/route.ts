import { NextResponse } from 'next/server';
import { getStats } from '@/data/db';
import { getExternalStats } from '@/lib/backend';

export async function GET() {
  try {
    const stats = (await getExternalStats()) ?? (await getStats());
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
