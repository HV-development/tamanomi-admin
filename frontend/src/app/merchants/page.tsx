import MerchantManagement from '@/components/pages/MerchantManagement';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export default function MerchantsPage() {
  return <MerchantManagement />;
}