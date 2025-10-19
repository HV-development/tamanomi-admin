import AdminLayout from '@/components/templates/admin-layout';
import ShopForm from '@/components/organisms/ShopForm';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export default function EditShopPage() {
  return (
    <AdminLayout>
      <ShopForm />
    </AdminLayout>
  );
}
