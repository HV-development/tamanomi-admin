import DashboardLayout from '@/components/templates/dashboard-layout';
import ShopManagement from '@/components/pages/ShopManagement';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export default function ShopsPage() {
  return (
    <DashboardLayout>
      <ShopManagement />
    </DashboardLayout>
  );
}
