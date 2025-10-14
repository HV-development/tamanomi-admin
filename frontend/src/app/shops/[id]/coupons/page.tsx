import CouponManagement from '@/components/pages/CouponManagement';

export const dynamic = 'force-dynamic';

export default function ShopCouponsPage({ params }: { params: { id: string } }) {
  return <CouponManagement shopId={params.id} />;
}

