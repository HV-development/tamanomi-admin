import ShopManagement from '@/components/pages/ShopManagement';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export default function ShopsPage({ params }: { params: { id: string } }) {
  return <ShopManagement merchantId={params.id} />;
}

