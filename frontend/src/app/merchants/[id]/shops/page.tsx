import AdminLayout from '@/components/templates/admin-layout';
import ShopManagement from '@/components/pages/ShopManagement';

export const dynamic = 'force-dynamic';

export default function MerchantShopsPage({ params }: { params: { id: string } }) {
  return (
    <AdminLayout>
      <ShopManagement merchantId={params.id} />
    </AdminLayout>
  );
}
