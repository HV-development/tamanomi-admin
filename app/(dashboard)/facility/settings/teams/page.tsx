'use client';

import { TeamModal } from '@/components/2_molecules/modals/team-modal';
import { TeamsTable } from '@/components/3_organisms/tables/teams-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGroupStats } from '@/hooks/use-groups';
import { useTeams, useTeamStats } from '@/hooks/use-teams';
import type { Team } from '@/types/team';
import type { TeamSearchParams } from '@/validations/team-validation';
import { Plus, Users as UsersIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// 初期フィルター値
const initialFilters: Partial<TeamSearchParams> = {
  query: '',
  status: 'all',
  groupId: undefined,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export default function TeamsPage() {
  const [filters, setFilters] = useState<Partial<TeamSearchParams>>(initialFilters);
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | undefined>(undefined);

  // 検索パラメータをメモ化して、不要な再レンダリングを防ぐ
  const searchParams = useMemo(() => {
    if (!mounted) return {};

    const params: Partial<TeamSearchParams> = {};

    // 検索テキスト
    if (filters.query?.trim()) {
      params.query = filters.query.trim();
    }

    // ステータス
    if (filters.status && filters.status !== 'all') {
      params.status = filters.status;
    }

    // グループ
    if (filters.groupId) {
      params.groupId = filters.groupId;
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

  const { data: teams, loading, error, updateParams, deleteTeam } = useTeams(searchParams);

  const { data: stats } = useTeamStats();
  const { data: groupStats } = useGroupStats();

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
        await deleteTeam(id);
        toast.success('チームが削除されました');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'チームの削除に失敗しました');
      }
    },
    [deleteTeam]
  );

  const handleCreateTeam = useCallback(() => {
    setEditingTeamId(undefined);
    setModalOpen(true);
  }, []);

  const handleEditTeam = useCallback((id: string) => {
    setEditingTeamId(id);
    setModalOpen(true);
  }, []);

  const handleModalSuccess = useCallback((team: Team) => {
    // データを再取得して最新状態を反映
    // useTeamsフックが自動的に更新を検知するため、特別な処理は不要
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setEditingTeamId(undefined);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const registerButton = (
    <Button onClick={handleCreateTeam}>
      <Plus className="mr-2 h-4 w-4" />
      チームを作成
    </Button>
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">チーム管理</h1>
            <p className="text-muted-foreground">職員チームの管理を行います。</p>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => (window.location.href = '/facility/settings/groups')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総グループ数</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groupStats?.totalGroups || 0}</div>
              <p className="text-xs text-blue-600">グループ管理へ →</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総チーム数</CardTitle>
              <UsersIcon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeams}</div>
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
                平均 {stats.averageMembersPerTeam}名/チーム
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* テーブル */}
      <TeamsTable
        teams={teams}
        loading={loading}
        onDelete={handleDelete}
        onEdit={handleEditTeam}
        actionArea={registerButton}
      />

      {/* チーム作成・編集モーダル */}
      <TeamModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        teamId={editingTeamId}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
