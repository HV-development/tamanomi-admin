'use client';

import { StaffTable } from '@/components/3_organisms/tables/staff-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStaff, useStaffStats } from '@/hooks/use-staff';
import type { StaffFilters } from '@/types/staff';
import { Clock, Plus, TrendingUp, UserCheck, Users as UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// 初期フィルター値
const initialFilters: Partial<StaffFilters> = {
  search: '',
  role: undefined,
  status: undefined,
  employmentType: undefined,
};

export default function StaffPage() {
  const [filters, setFilters] = useState<Partial<StaffFilters>>(initialFilters);
  const [mounted, setMounted] = useState(false);

  // 検索パラメータをメモ化して、不要な再レンダリングを防ぐ
  const searchParams = useMemo(() => {
    if (!mounted) return {};

    const params: Partial<StaffFilters> = {};

    // 検索テキスト
    if (filters.search?.trim()) {
      params.search = filters.search.trim();
    }

    // 職種
    if (filters.role && filters.role !== 'all') {
      params.role = filters.role;
    }

    // ステータス
    if (filters.status && filters.status !== 'all') {
      params.status = filters.status;
    }

    // 雇用形態
    if (filters.employmentType && filters.employmentType !== 'all') {
      params.employmentType = filters.employmentType;
    }

    return params;
  }, [mounted, filters]);

  const { data: staff, loading, error, search, deleteStaff, updateStatus } = useStaff();

  const { data: stats } = useStaffStats();

  // コンポーネントのマウント完了後に検索を有効化
  useEffect(() => {
    setMounted(true);
  }, []);

  // フィルターが変更された時に検索を実行
  useEffect(() => {
    if (mounted) {
      search(searchParams);
    }
  }, [mounted, searchParams, search]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteStaff(id);
        toast.success('職員が削除されました');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '職員の削除に失敗しました');
      }
    },
    [deleteStaff]
  );

  const handleStatusToggle = useCallback(
    async (id: string, currentStatus: string) => {
      try {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        await updateStatus(id, newStatus as any);
        toast.success('ステータスが更新されました');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'ステータスの更新に失敗しました');
      }
    },
    [updateStatus]
  );

  const handleEdit = useCallback((id: string) => {
    // 編集機能（今後実装）
    console.log('Edit staff:', id);
    toast.info('編集機能は今後実装予定です');
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const registerButton = (
    <Button asChild>
      <Link href="/facility/staff/new">
        <Plus className="mr-2 h-4 w-4" />
        職員を登録
      </Link>
    </Button>
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">職員管理</h1>
            <p className="text-muted-foreground">職員の管理を行います。</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive">エラーが発生しました: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 統計カード */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総職員数</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStaff}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">在職中</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeStaff}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalStaff > 0
                  ? Math.round((stats.activeStaff / stats.totalStaff) * 100)
                  : 0}
                % の職員
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">休職中</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.onLeaveStaff}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均勤続年数</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageExperience}年</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* テーブル */}
      <StaffTable
        staff={staff}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusToggle={handleStatusToggle}
        actionArea={registerButton}
      />
    </div>
  );
}
