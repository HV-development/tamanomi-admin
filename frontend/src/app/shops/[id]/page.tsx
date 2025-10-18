import AdminLayout from '@/components/templates/admin-layout';
import ShopDetail from '@/components/pages/ShopDetail';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export default function ShopDetailPage() {
  return (
    <AdminLayout>
      <ShopDetail />
    </AdminLayout>
  );
}
