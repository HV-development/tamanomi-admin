import AdminLayout from '@/components/templates/admin-layout';
import ShopForm from '@/components/organisms/ShopForm';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export default async function EditShopPage({ params }: { params: Promise<{ id: string; shopId: string }> }) {
  const { id } = await params;
  return (
    <AdminLayout>
      <ShopForm merchantId={id} />
    </AdminLayout>
  );
}

