import HomePageClient from '@/components/home/HomePageClient';
import { getEquipment, getGallery } from '@/data/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [equipment, gallery] = await Promise.all([
    getEquipment(),
    getGallery()
  ]);
  
  // Show first few items as featured
  const featuredEquipment = equipment.slice(0, 3);
  
  return <HomePageClient featuredEquipment={featuredEquipment} recentGallery={gallery.slice(0, 6)} />;
}
