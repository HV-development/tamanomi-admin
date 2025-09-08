'use client';

import { AdminTable } from '@/components/3_organisms/tables/admin-table';
import { Button } from '@/components/ui/button';
import { useAdmins } from '@/hooks/use-admins';
import type { AdminStatus } from '@/types/admin';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminsPage() {
  const { data: admins, loading, error, deleteAdmin, updateStatus } = useAdmins();

  const handleDelete = async (id: string) => {
    try {
      await deleteAdmin(id);
      toast.success('管理者を削除しました。');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '削除に失敗しました。');
    }
  };

  const handleStatusToggle = async (id: string, status: AdminStatus) => {
    try {
      await updateStatus(id, status);
      toast.success(`管理者のステータスを${status === 'active' ? '有効' : '無効'}に変更しました。`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ステータス変更に失敗しました。');
    }
  };

  const registerButton = (
    <Button asChild>
      <Link href="/operation/admins/register">
        <Plus className="mr-2 h-4 w-4" />
        管理者を登録
      </Link>
    </Button>
  );

  return (
    <AdminTable
      admins={admins}
      loading={loading}
      onDelete={handleDelete}
      onStatusToggle={handleStatusToggle}
      actionArea={registerButton}
    />
  );
}
