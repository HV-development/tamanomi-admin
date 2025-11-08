'use client';

import UserDetail from '@/components/pages/UserDetail';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export default function UserDetailPage() {
  return <UserDetail />;
}