import { NextResponse } from 'next/server';
import { getGallery, addGalleryItem } from '@/data/db';

export async function GET() {
  const gallery = await getGallery();
  return NextResponse.json(gallery);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.imageUrl || !body.title) {
      return NextResponse.json({ error: 'Image URL and Title are required' }, { status: 400 });
    }
    const newItem = await addGalleryItem(body);
    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add gallery item' }, { status: 500 });
  }
}
