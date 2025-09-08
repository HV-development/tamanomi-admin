'use client';

import { GroupModal } from '@/components/2_molecules/modals/group-modal';
import { GroupsTable } from '@/components/3_organisms/tables/groups-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGroups, useGroupStats } from '@/hooks/use-groups';
import type { Group } from '@/types/group';
import type { GroupSearchParams } from '@/validations/group-validation';
import { Plus, Users as UsersIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// 初期フィルター値
const initialFilters: Partial<GroupSearchParams> = {
  query: '',
  status: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export default function GroupsPage() {
  const [filters, setFilters] = useState<Partial<GroupSearchParams>>(initialFilters);
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | undefined>(undefined);

  // 検索パラメータをメモ化して、不要な再レンダリングを防ぐ
  const searchParams = useMemo(() => {
    if (!mounted) return {};

    const params: Partial<GroupSearchParams> = {};

    // 検索テキスト
    if (filters.query?.trim()) {
      params.query = filters.query.trim();
    }

    // ステータス
    if (filters.status && filters.status !== 'all') {
      params.status = filters.status;
    }

    // ソート
    if (filters.sortBy) {
      params.sortBy = filters.sortBy;
    }

    if (filters.sortOrder) {
      params.sortOrder = filters.sortOrder;
    }

    return params;
  }, [mounted, filters]);

  const { data: groups, loading, error, updateParams, deleteGroup } = useGroups(searchParams);

  const { data: stats } = useGroupStats();

  // コンポーネントのマウント完了後に検索を有効化
  useEffect(() => {
    setMounted(true);
  }, []);

  // フィルターが変更された時にパラメータを更新
  useEffect(() => {
    if (mounted) {
      updateParams(searchParams);
    }
  }, [mounted, searchParams, updateParams]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteGroup(id);
        toast.success('グループが削除されました');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'グループの削除に失敗しました');
      }
    },
    [deleteGroup]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const handleCreateGroup = useCallback(() => {
    setEditingGroupId(undefined);
    setModalOpen(true);
  }, []);

  const handleEditGroup = useCallback((id: string) => {
    setEditingGroupId(id);
    setModalOpen(true);
  }, []);

  const handleModalSuccess = useCallback((group: Group) => {
    // データを再取得して最新状態を反映
    // useGroupsフックが自動的に更新を検知するため、特別な処理は不要
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setEditingGroupId(undefined);
  }, []);

  const registerButton = (
    <Button onClick={handleCreateGroup}>
      <Plus className="mr-2 h-4 w-4" />
      グループを作成
    </Button>
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">グループ管理</h1>
            <p className="text-muted-foreground">職員グループの管理を行います。</p>
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
              <CardTitle className="text-sm font-medium">総グループ数</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGroups}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">アクティブグループ</CardTitle>
              <UsersIcon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeGroups}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総メンバー数</CardTitle>
              <UsersIcon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                平均 {stats.averageMembersPerGroup}名/グループ
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => (window.location.href = '/facility/settings/teams')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総チーム数</CardTitle>
              <UsersIcon className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeams}</div>
              <p className="text-xs text-blue-600">チーム管理へ →</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* テーブル */}
      <GroupsTable
        groups={groups}
        loading={loading}
        onDelete={handleDelete}
        onEdit={handleEditGroup}
        actionArea={registerButton}
      />

      {/* グループ作成・編集モーダル */}
      <GroupModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        groupId={editingGroupId}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
