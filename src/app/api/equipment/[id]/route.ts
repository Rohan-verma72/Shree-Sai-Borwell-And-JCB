import { NextResponse } from 'next/server';
import { deleteEquipment, updateEquipment } from '@/data/db';
import { updateExternalEquipment } from '@/lib/backend';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const externalResponse = await updateExternalEquipment(id, body);
    if (externalResponse) return NextResponse.json(externalResponse);

    const updated = await updateEquipment(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update equipment' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteEquipment(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete equipment' },
      { status: 400 }
    );
  }
}
