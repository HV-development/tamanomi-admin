import AdminLayout from '@/components/templates/admin-layout';
import ShopManagement from '@/components/pages/ShopManagement';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export default function ShopsPage() {
  return (
    <AdminLayout>
      <ShopManagement />
    </AdminLayout>
  );
}
