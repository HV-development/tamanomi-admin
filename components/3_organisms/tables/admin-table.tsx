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
import type { Admin } from '@/types/admin';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Trash2, UserCheck, UserX, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

interface AdminTableProps {
  admins: Admin[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
  onStatusToggle: (id: string, status: Admin['status']) => Promise<void>;
  actionArea?: React.ReactNode;
}

const getStatusBadge = (status: Admin['status']) => {
  switch (status) {
    case 'active':
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-xs">
          有効
        </Badge>
      );
    case 'inactive':
      return (
        <Badge variant="secondary" className="text-xs">
          無効
        </Badge>
      );
    case 'suspended':
      return (
        <Badge variant="destructive" className="text-xs">
          停止
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          {status}
        </Badge>
      );
  }
};

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return '-';
  }
};

export function AdminTable({
  admins,
  loading,
  onDelete,
  onStatusToggle,
  actionArea,
}: AdminTableProps) {
  const [deleteAdminId, setDeleteAdminId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (deleteAdminId) {
      await onDelete(deleteAdminId);
      setDeleteAdminId(null);
    }
  };

  const handleStatusToggle = async (admin: Admin) => {
    try {
      setTogglingId(admin.id);
      const newStatus = admin.status === 'active' ? 'inactive' : 'active';
      await onStatusToggle(admin.id, newStatus);
    } catch (error) {
      console.error('ステータス変更エラー:', error);
    } finally {
      setTogglingId(null);
    }
  };

  const columns = useMemo<ColumnDef<Admin>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <SortableHeader onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            管理者情報
          </SortableHeader>
        ),
        cell: ({ row }) => {
          const admin = row.original;
          return (
            <div className="space-y-1">
              <Link
                href={`/operation/admins/${admin.id}`}
                className="font-medium text-foreground hover:text-primary hover:underline transition-colors"
              >
                {admin.name}
              </Link>
              <div className="text-sm text-muted-foreground">{admin.nameKana}</div>
              <div className="text-xs text-muted-foreground font-mono">{admin.email}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'phoneNumber',
        header: '連絡先',
        cell: ({ row }) => {
          const admin = row.original;
          return (
            <div className="space-y-1">
              <div className="text-sm font-mono">{admin.phoneNumber}</div>
              {admin.department && (
                <div className="text-xs text-muted-foreground">{admin.department}</div>
              )}
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
        cell: ({ row }) => getStatusBadge(row.getValue('status')),
      },
      {
        accessorKey: 'lastLoginAt',
        header: ({ column }) => (
          <SortableHeader onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            最終ログイン
          </SortableHeader>
        ),
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {formatDateTime(row.getValue('lastLoginAt'))}
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const admin = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">メニューを開く</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/operation/admins/${admin.id}`} className="cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" />
                    編集
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusToggle(admin)}
                  disabled={togglingId === admin.id}
                  className="cursor-pointer"
                >
                  {admin.status === 'active' ? (
                    <>
                      <UserX className="mr-2 h-4 w-4" />
                      無効化
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" />
                      有効化
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteAdminId(admin.id)}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
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
    [togglingId]
  );

  const emptyState = (
    <div className="p-12 text-center">
      <Users className="mx-auto h-16 w-16 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold text-foreground">管理者が見つかりません</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        検索条件を変更するか、新しい管理者を登録してください。
      </p>
    </div>
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={admins}
        searchKey="name"
        searchPlaceholder="管理者名で検索..."
        loading={loading}
        emptyState={emptyState}
        enablePagination={true}
        pageSize={10}
        actionArea={actionArea}
      />

      <AlertDialog open={!!deleteAdminId} onOpenChange={() => setDeleteAdminId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>管理者を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消すことができません。管理者に関連するすべてのデータが削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
