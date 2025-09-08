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
import type { User } from '@/types/user';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Edit,
  MoreHorizontal,
  Phone,
  ToggleLeft,
  ToggleRight,
  Trash2,
  User as UserIcon,
} from 'lucide-react';

interface UserTableProps {
  users: User[];
  loading?: boolean;
  error?: string | null;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStatusToggle?: (id: string, status: User['status']) => void;
  actionArea?: React.ReactNode;
}

const getStatusBadge = (status: User['status']) => {
  const variants = {
    active: { label: '利用中', className: 'bg-green-100 text-green-800' },
    inactive: { label: '休止中', className: 'bg-yellow-100 text-yellow-800' },
    discharged: { label: '退所', className: 'bg-gray-100 text-gray-800' },
    deceased: { label: '死亡', className: 'bg-red-100 text-red-800' },
  };

  const config = variants[status] || variants.active;
  return <Badge className={config.className}>{config.label}</Badge>;
};

const getCareLevelLabel = (careLevel?: User['careLevel']) => {
  if (!careLevel) return '-';

  const labels = {
    support1: '要支援1',
    support2: '要支援2',
    care1: '要介護1',
    care2: '要介護2',
    care3: '要介護3',
    care4: '要介護4',
    care5: '要介護5',
  };
  return labels[careLevel] || careLevel;
};

const getGenderLabel = (gender: User['gender']) => {
  const labels = {
    male: '男性',
    female: '女性',
    other: 'その他',
  };
  return labels[gender] || gender;
};

export function UserTable({
  users,
  loading = false,
  error,
  onEdit,
  onDelete,
  onStatusToggle,
  actionArea,
}: UserTableProps) {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: '氏名',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <UserIcon className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.nameKana}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'age',
      header: '年齢・性別',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="space-y-1">
            <div className="text-sm">{user.age}歳</div>
            <div className="text-sm text-muted-foreground">{getGenderLabel(user.gender)}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'careLevel',
      header: '要介護度',
      cell: ({ row }) => {
        const user = row.original;
        return <Badge variant="outline">{getCareLevelLabel(user.careLevel)}</Badge>;
      },
    },
    {
      accessorKey: 'contact',
      header: '連絡先・保険証',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="space-y-1">
            {user.phoneNumber && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span>{user.phoneNumber}</span>
              </div>
            )}
            <div className="text-sm text-muted-foreground">保険証: {user.insuranceNumber}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'emergencyContact',
      header: '緊急連絡先',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="max-w-xs">
            <div className="text-sm font-medium">{user.emergencyContact.name}</div>
            <div className="text-xs text-muted-foreground">
              {user.emergencyContact.relationship} / {user.emergencyContact.phoneNumber}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'ステータス',
      cell: ({ row }) => {
        const user = row.original;
        return getStatusBadge(user.status);
      },
    },
    {
      accessorKey: 'startDate',
      header: '利用開始日',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="text-sm text-muted-foreground">
            {new Date(user.startDate).toLocaleDateString('ja-JP')}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const user = row.original;
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
                <DropdownMenuItem onClick={() => onEdit(user.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  編集
                </DropdownMenuItem>
              )}

              {onStatusToggle && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      onStatusToggle(user.id, user.status === 'active' ? 'inactive' : 'active')
                    }
                  >
                    {user.status === 'active' ? (
                      <>
                        <ToggleLeft className="mr-2 h-4 w-4" />
                        利用停止
                      </>
                    ) : (
                      <>
                        <ToggleRight className="mr-2 h-4 w-4" />
                        利用再開
                      </>
                    )}
                  </DropdownMenuItem>
                </>
              )}

              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onDelete(user.id)} className="text-red-600">
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
      <UserIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-semibold text-muted-foreground">利用者がいません</h3>
      <p className="mt-2 text-sm text-muted-foreground">利用者が登録されていません。</p>
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={users}
      searchKey="name"
      searchPlaceholder="利用者名で検索..."
      loading={loading}
      emptyState={emptyState}
      enablePagination={true}
      pageSize={10}
      actionArea={actionArea}
    />
  );
}
