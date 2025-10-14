import DashboardLayout from '@/components/templates/dashboard-layout';
import ShopForm from '@/components/pages/ShopForm';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export default function EditShopPage({ params }: { params: { id: string; shopId: string } }) {
  return (
    <DashboardLayout>
      <ShopForm merchantId={params.id} />
    </DashboardLayout>
  );
}

