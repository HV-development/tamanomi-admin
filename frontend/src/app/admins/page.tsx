import AdminManagement from '@/components/pages/AdminManagement';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export default function AdminsPage() {
  return <AdminManagement />;
}