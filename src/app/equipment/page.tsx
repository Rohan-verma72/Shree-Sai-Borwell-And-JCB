import EquipmentListingClient from '@/components/equipment/EquipmentListingClient';
import { getEquipment } from '@/data/db';
import { getExternalEquipment } from '@/lib/backend';

export const dynamic = 'force-dynamic';

export default async function EquipmentPage() {
  const equipmentData = (await getExternalEquipment()) ?? (await getEquipment());

  return <EquipmentListingClient equipmentData={equipmentData} />;
}

