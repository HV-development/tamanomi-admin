'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { teamService } from '@/services/team-service';
import type { TeamWithDetails } from '@/types/team';
import type { ColumnDef } from '@tanstack/react-table';
import { Calendar, Edit, MoreHorizontal, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface TeamsTableProps {
  teams: TeamWithDetails[];
  loading: boolean;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  actionArea?: React.ReactNode;
}

const getStatusBadge = (status: 'active' | 'inactive') => {
  switch (status) {
    case 'active':
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          アクティブ
        </Badge>
      );
    case 'inactive':
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          非アクティブ
        </Badge>
      );
    default:
      return <Badge variant="outline">不明</Badge>;
  }
};

export function TeamsTable({ teams, loading, onDelete, onEdit, actionArea }: TeamsTableProps) {
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);
  const [deletePermissions, setDeletePermissions] = useState<
    Record<string, { canDelete: boolean; reason?: string }>
  >({});

  // 削除権限の確認
  useEffect(() => {
    const checkDeletePermissions = async () => {
      const permissions: Record<string, { canDelete: boolean; reason?: string }> = {};

      for (const team of teams) {
        try {
          const result = await teamService.canDeleteTeam(team.id);
          permissions[team.id] = result;
        } catch (error) {
          permissions[team.id] = { canDelete: false, reason: '権限確認に失敗しました' };
        }
      }

      setDeletePermissions(permissions);
    };

    if (teams.length > 0) {
      checkDeletePermissions();
    }
  }, [teams]);

  const handleDeleteClick = (id: string) => {
    setDeleteTeamId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteTeamId) {
      onDelete(deleteTeamId);
      setDeleteTeamId(null);
    }
  };

  const columns: ColumnDef<TeamWithDetails>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <SortableHeader onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            チーム名
          </SortableHeader>
        ),
        size: 300,
        minSize: 250,
        cell: ({ row }) => {
          const team = row.original;
          return (
            <div className="flex items-center gap-3 min-w-0">
              {team.color && (
                <div
                  className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: team.color }}
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{team.name}</div>
                {team.description && (
                  <div className="text-sm text-muted-foreground mt-1 truncate">
                    {team.description}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'groupName',
        header: ({ column }) => (
          <SortableHeader onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            グループ
          </SortableHeader>
        ),
        size: 150,
        cell: ({ row }) => {
          const groupName = row.getValue('groupName') as string;
          return (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{groupName || '未設定'}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <SortableHeader onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            ステータス
          </SortableHeader>
        ),
        size: 120,
        cell: ({ row }) => getStatusBadge(row.getValue('status')),
      },
      {
        accessorKey: 'memberCount',
        header: ({ column }) => (
          <SortableHeader onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            メンバー数
          </SortableHeader>
        ),
        size: 110,
        cell: ({ row }) => {
          const memberCount = row.getValue('memberCount') as number;
          return (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{memberCount}名</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <SortableHeader onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            作成日
          </SortableHeader>
        ),
        size: 130,
        cell: ({ row }) => {
          const date = new Date(row.getValue('createdAt'));
          return (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{date.toLocaleDateString('ja-JP')}</span>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'アクション',
        size: 100,
        cell: ({ row }) => {
          const team = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">メニューを開く</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(team.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    編集
                  </DropdownMenuItem>
                )}

                {onEdit && <DropdownMenuSeparator />}

                <DropdownMenuItem
                  onClick={() => handleDeleteClick(team.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onEdit]
  );

  const emptyState = (
    <div className="text-center py-8">
      <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-semibold text-muted-foreground">チームがありません</h3>
      <p className="mt-2 text-sm text-muted-foreground">チームが登録されていません。</p>
    </div>
  );

  return (
    <>
      <div style={{ minWidth: '860px' }}>
        <DataTable
          columns={columns}
          data={teams}
          searchKey="name"
          searchPlaceholder="チーム名で検索..."
          loading={loading}
          emptyState={emptyState}
          enablePagination={true}
          pageSize={10}
          actionArea={actionArea}
        />
      </div>

      <AlertDialog open={!!deleteTeamId} onOpenChange={() => setDeleteTeamId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>チームを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription asChild>
              {deleteTeamId && deletePermissions[deleteTeamId]?.canDelete === false ? (
                <div className="space-y-2">
                  <div className="text-destructive font-medium">
                    {deletePermissions[deleteTeamId]?.reason}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    チームを削除するには、まず非アクティブにして、紐付くメンバーを削除してください。
                  </div>
                </div>
              ) : (
                <p>
                  この操作は取り消すことができません。チームに関連するすべてのデータが削除されます。
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {deleteTeamId && deletePermissions[deleteTeamId]?.canDelete === false
                ? '閉じる'
                : 'キャンセル'}
            </AlertDialogCancel>
            {deleteTeamId && deletePermissions[deleteTeamId]?.canDelete !== false && (
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                削除する
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
