import DashboardLayout from '@/components/templates/dashboard-layout';
import ShopForm from '@/components/pages/ShopForm';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export default function NewShopPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <ShopForm merchantId={params.id} />
    </DashboardLayout>
  );
}

