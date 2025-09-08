'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { FacilityManager } from '@/types/facility-manager';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Edit,
  Mail,
  MoreHorizontal,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Trash2,
  UserCheck,
} from 'lucide-react';

interface FacilityManagerTableProps {
  managers: FacilityManager[];
  loading?: boolean;
  error?: string | null;
  onPasswordReset: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStatusToggle?: (id: string, status: FacilityManager['status']) => void;
}

const getStatusBadge = (status: FacilityManager['status']) => {
  const variants = {
    active: { label: '有効', className: 'bg-green-100 text-green-800' },
    inactive: { label: '無効', className: 'bg-gray-100 text-gray-800' },
    suspended: { label: '停止中', className: 'bg-yellow-100 text-yellow-800' },
  };

  const config = variants[status] || variants.active;
  return <Badge className={config.className}>{config.label}</Badge>;
};

export function FacilityManagerTable({
  managers,
  loading = false,
  error,
  onPasswordReset,
  onEdit,
  onDelete,
  onStatusToggle,
}: FacilityManagerTableProps) {
  const columns: ColumnDef<FacilityManager>[] = [
    {
      accessorKey: 'name',
      header: '氏名',
      cell: ({ row }) => {
        const manager = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <UserCheck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium">{manager.name}</div>
              <div className="text-sm text-muted-foreground">{manager.nameKana}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'officeName',
      header: '事業所・役職',
      cell: ({ row }) => {
        const manager = row.original;
        return (
          <div>
            <div className="font-medium">{manager.officeName}</div>
            <div className="text-sm text-muted-foreground">{manager.position || '管理者'}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'メールアドレス',
      cell: ({ row }) => {
        const manager = row.original;
        return (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{manager.email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'phoneNumber',
      header: '電話番号',
      cell: ({ row }) => {
        const manager = row.original;
        return <div className="text-sm">{manager.phoneNumber}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: 'ステータス',
      cell: ({ row }) => {
        const manager = row.original;
        return getStatusBadge(manager.status);
      },
    },
    {
      accessorKey: 'createdAt',
      header: '登録日',
      cell: ({ row }) => {
        const manager = row.original;
        return (
          <div className="text-sm text-muted-foreground">
            {new Date(manager.createdAt).toLocaleDateString('ja-JP')}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const manager = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">メニューを開く</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPasswordReset(manager.id)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                パスワード再発行
              </DropdownMenuItem>

              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(manager.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  編集
                </DropdownMenuItem>
              )}

              {onStatusToggle && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      onStatusToggle(
                        manager.id,
                        manager.status === 'active' ? 'inactive' : 'active'
                      )
                    }
                  >
                    {manager.status === 'active' ? (
                      <>
                        <ToggleLeft className="mr-2 h-4 w-4" />
                        無効にする
                      </>
                    ) : (
                      <>
                        <ToggleRight className="mr-2 h-4 w-4" />
                        有効にする
                      </>
                    )}
                  </DropdownMenuItem>
                </>
              )}

              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onDelete(manager.id)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    削除
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const emptyState = (
    <div className="text-center py-8">
      <UserCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-semibold text-muted-foreground">事業所管理者がいません</h3>
      <p className="mt-2 text-sm text-muted-foreground">事業所管理者が登録されていません。</p>
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={managers}
      searchKey="name"
      searchPlaceholder="管理者名で検索..."
      loading={loading}
      emptyState={emptyState}
      enablePagination={true}
      pageSize={10}
    />
  );
}
