import { NextResponse } from 'next/server';
import { addEquipment, getEquipment } from '@/data/db';
import { createExternalEquipment, getExternalEquipment } from '@/lib/backend';

export async function GET() {
  try {
    const equipment = (await getExternalEquipment()) ?? (await getEquipment());
    return NextResponse.json(equipment);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const externalResponse = await createExternalEquipment(body);
    if (externalResponse) return NextResponse.json(externalResponse, { status: 201 });
    
    const newEquipment = await addEquipment(body);
    return NextResponse.json(newEquipment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add equipment' },
      { status: 400 },
    );
  }
}
