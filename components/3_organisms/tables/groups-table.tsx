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
import { groupService } from '@/services/group-service';
import type { GroupWithDetails } from '@/types/group';
import type { ColumnDef } from '@tanstack/react-table';
import { Calendar, Edit, MoreHorizontal, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface GroupsTableProps {
  groups: GroupWithDetails[];
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

export function GroupsTable({ groups, loading, onDelete, onEdit, actionArea }: GroupsTableProps) {
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [deletePermissions, setDeletePermissions] = useState<
    Record<string, { canDelete: boolean; reason?: string }>
  >({});

  // 削除権限の確認
  useEffect(() => {
    const checkDeletePermissions = async () => {
      const permissions: Record<string, { canDelete: boolean; reason?: string }> = {};

      for (const group of groups) {
        try {
          const result = await groupService.canDeleteGroup(group.id);
          permissions[group.id] = result;
        } catch (error) {
          permissions[group.id] = { canDelete: false, reason: '権限確認に失敗しました' };
        }
      }

      setDeletePermissions(permissions);
    };

    if (groups.length > 0) {
      checkDeletePermissions();
    }
  }, [groups]);

  const handleDeleteClick = (id: string) => {
    setDeleteGroupId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteGroupId) {
      onDelete(deleteGroupId);
      setDeleteGroupId(null);
    }
  };

  const columns: ColumnDef<GroupWithDetails>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <SortableHeader onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            グループ名
          </SortableHeader>
        ),
        size: 300,
        minSize: 250,
        cell: ({ row }) => {
          const group = row.original;
          return (
            <div className="flex items-center gap-3 min-w-0">
              {group.color && (
                <div
                  className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: group.color }}
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{group.name}</div>
                {group.description && (
                  <div className="text-sm text-muted-foreground mt-1 truncate">
                    {group.description}
                  </div>
                )}
              </div>
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
        accessorKey: 'teamCount',
        header: ({ column }) => (
          <SortableHeader onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            チーム数
          </SortableHeader>
        ),
        size: 110,
        cell: ({ row }) => {
          const teamCount = row.getValue('teamCount') as number;
          return (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{teamCount}チーム</span>
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
          const group = row.original;

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
                  <DropdownMenuItem onClick={() => onEdit(group.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    編集
                  </DropdownMenuItem>
                )}

                {onEdit && <DropdownMenuSeparator />}

                <DropdownMenuItem
                  onClick={() => handleDeleteClick(group.id)}
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
      <h3 className="mt-4 text-lg font-semibold text-muted-foreground">グループがありません</h3>
      <p className="mt-2 text-sm text-muted-foreground">グループが登録されていません。</p>
    </div>
  );

  return (
    <>
      <div style={{ minWidth: '900px' }}>
        <DataTable
          columns={columns}
          data={groups}
          searchKey="name"
          searchPlaceholder="グループ名で検索..."
          loading={loading}
          emptyState={emptyState}
          enablePagination={true}
          pageSize={10}
          actionArea={actionArea}
        />
      </div>

      <AlertDialog open={!!deleteGroupId} onOpenChange={() => setDeleteGroupId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>グループを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription asChild>
              {deleteGroupId && deletePermissions[deleteGroupId]?.canDelete === false ? (
                <div className="space-y-2">
                  <div className="text-destructive font-medium">
                    {deletePermissions[deleteGroupId]?.reason}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    グループを削除するには、まず非アクティブにして、紐付くチームとメンバーを削除してください。
                  </div>
                </div>
              ) : (
                <p>
                  この操作は取り消すことができません。グループに関連するすべてのデータが削除されます。
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {deleteGroupId && deletePermissions[deleteGroupId]?.canDelete === false
                ? '閉じる'
                : 'キャンセル'}
            </AlertDialogCancel>
            {deleteGroupId && deletePermissions[deleteGroupId]?.canDelete !== false && (
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
