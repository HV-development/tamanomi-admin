import DashboardLayout from '@/components/templates/dashboard-layout';
import ShopManagement from '@/components/pages/ShopManagement';

export const dynamic = 'force-dynamic';

export default function MerchantShopsPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <ShopManagement merchantId={params.id} />
    </DashboardLayout>
  );
}
