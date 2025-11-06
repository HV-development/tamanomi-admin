'use client';

import dynamicImport from 'next/dynamic';

const UserDetail = dynamicImport(() => import('@/components/pages/UserDetail'), {
  loading: () => <div className="flex items-center justify-center p-8">読み込み中...</div>,
  ssr: false,
});

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export default function UserDetailPage() {
  return <UserDetail />;
}