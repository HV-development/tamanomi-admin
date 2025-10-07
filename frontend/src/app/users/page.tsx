import UserManagement from '@/components/pages/UserManagement';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export default function UsersPage() {
  return <UserManagement />;
}