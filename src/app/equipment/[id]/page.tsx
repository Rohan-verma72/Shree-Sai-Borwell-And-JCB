import EquipmentDetailClient from '@/components/equipment/EquipmentDetailClient';
import { getEquipmentById } from '@/data/db';
import { getExternalEquipment } from '@/lib/backend';

export const dynamic = 'force-dynamic';

type EquipmentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EquipmentDetailPage({
  params,
}: EquipmentDetailPageProps) {
  const { id } = await params;
  const externalEquipment = await getExternalEquipment();
  const equipment = externalEquipment?.find((item) => item.id === id) ?? (await getEquipmentById(id));

  return <EquipmentDetailClient equipment={equipment} />;
}

