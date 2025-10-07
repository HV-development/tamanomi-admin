import DashboardLayout from '@/components/templates/dashboard-layout';
import ShopDetail from '@/components/pages/ShopDetail';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export default function ShopDetailPage() {
  return (
    <DashboardLayout>
      <ShopDetail />
    </DashboardLayout>
  );
}
