import CouponManagement from '@/components/pages/CouponManagement';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export default function CouponsPage() {
  return <CouponManagement />;
}