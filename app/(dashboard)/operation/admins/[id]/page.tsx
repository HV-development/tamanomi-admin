'use client';

import { AdminForm } from '@/components/2_molecules/forms/admin-form';
import { Button } from '@/components/ui/button';
import { useAdmin, useAdmins } from '@/hooks/use-admins';
import type { AdminFormData } from '@/validations/admin-validation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { toast } from 'sonner';

interface AdminEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AdminEditPage({ params }: AdminEditPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { updateAdmin } = useAdmins();
  const { data: admin, loading, error } = useAdmin(id);

  const handleSubmit = async (data: AdminFormData) => {
    if (!id) {
      toast.error('管理者IDが指定されていません。');
      return;
    }

    try {
      await updateAdmin(id, data);
      toast.success('運営管理者の情報を更新しました。');
      router.push('/operation/admins');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '更新に失敗しました。');
      throw error; // AdminFormでエラー表示するため再スロー
    }
  };

  const handleCancel = () => {
    router.push('/operation/admins');
  };

  if (!id) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/operation/admins">
              <ArrowLeft className="h-4 w-4" />
              戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">運営管理者の編集</h1>
            <p className="text-muted-foreground">運営管理者の情報を編集します</p>
          </div>
        </div>

        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">管理者IDが指定されていません。</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/operation/admins">
              <ArrowLeft className="h-4 w-4" />
              戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">運営管理者の編集</h1>
            <p className="text-muted-foreground">運営管理者の情報を編集します</p>
          </div>
        </div>

        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">エラーが発生しました: {error}</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/operation/admins">
              <ArrowLeft className="h-4 w-4" />
              戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">運営管理者の編集</h1>
            <p className="text-muted-foreground">運営管理者の情報を編集します</p>
          </div>
        </div>

        <div className="rounded-lg border bg-white">
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
            <p className="mt-3 text-sm text-muted-foreground">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/operation/admins">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">運営管理者の編集</h1>
          <p className="text-muted-foreground">運営管理者の情報を編集します</p>
        </div>
      </div>

      <AdminForm
        admin={admin ?? undefined}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={false}
      />
    </div>
  );
}
