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
import type { Staff } from '@/types/staff';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Edit,
  Mail,
  MoreHorizontal,
  Phone,
  ToggleLeft,
  ToggleRight,
  Trash2,
  UserCheck,
} from 'lucide-react';

interface StaffTableProps {
  staff: Staff[];
  loading?: boolean;
  error?: string | null;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStatusToggle?: (id: string, status: Staff['status']) => void;
  actionArea?: React.ReactNode;
}

const getStatusBadge = (status: Staff['status']) => {
  const variants = {
    active: { label: '在職', className: 'bg-green-100 text-green-800' },
    inactive: { label: '退職', className: 'bg-gray-100 text-gray-800' },
    'on-leave': { label: '休職中', className: 'bg-yellow-100 text-yellow-800' },
    terminated: { label: '解雇', className: 'bg-red-100 text-red-800' },
  };

  const config = variants[status] || variants.active;
  return <Badge className={config.className}>{config.label}</Badge>;
};

const getRoleLabel = (role: Staff['role']) => {
  const labels = {
    nurse: '看護師',
    'care-worker': '介護福祉士',
    'physical-therapist': '理学療法士',
    'occupational-therapist': '作業療法士',
    'speech-therapist': '言語聴覚士',
    'social-worker': '社会福祉士',
    nutritionist: '栄養士',
    admin: '事務員',
    other: 'その他',
  };
  return labels[role] || role;
};

const getEmploymentTypeLabel = (type: Staff['employmentType']) => {
  const labels = {
    'full-time': '正社員',
    'part-time': 'パート',
    contract: '契約社員',
    temporary: '派遣',
  };
  return labels[type] || type;
};

export function StaffTable({
  staff,
  loading = false,
  error,
  onEdit,
  onDelete,
  onStatusToggle,
  actionArea,
}: StaffTableProps) {
  const columns: ColumnDef<Staff>[] = [
    {
      accessorKey: 'name',
      header: '氏名',
      size: 200,
      cell: ({ row }) => {
        const staffMember = row.original;
        return (
          <div className="flex items-center gap-3 min-w-[180px]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 flex-shrink-0">
              <UserCheck className="h-4 w-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate">{staffMember.name}</div>
              <div className="text-sm text-muted-foreground truncate">{staffMember.nameKana}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: '職種・役職',
      size: 150,
      cell: ({ row }) => {
        const staffMember = row.original;
        return (
          <div className="min-w-[120px]">
            <div className="font-medium text-sm">{getRoleLabel(staffMember.role)}</div>
            {staffMember.position && (
              <div className="text-sm text-muted-foreground truncate">{staffMember.position}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'employmentType',
      header: '雇用形態',
      size: 100,
      cell: ({ row }) => {
        const staffMember = row.original;
        return (
          <div className="min-w-[80px]">
            <Badge variant="outline" className="text-xs">
              {getEmploymentTypeLabel(staffMember.employmentType)}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'contact',
      header: '連絡先',
      size: 250,
      cell: ({ row }) => {
        const staffMember = row.original;
        return (
          <div className="space-y-1 min-w-[200px]">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{staffMember.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{staffMember.phoneNumber}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'qualifications',
      header: '資格',
      size: 180,
      cell: ({ row }) => {
        const staffMember = row.original;
        if (!staffMember.qualifications || staffMember.qualifications.length === 0) {
          return <div className="text-sm text-muted-foreground min-w-[120px]">-</div>;
        }
        return (
          <div className="space-y-1 min-w-[120px]">
            {staffMember.qualifications.slice(0, 2).map((qualification, index) => (
              <div key={index}>
                <Badge variant="secondary" className="text-xs truncate max-w-[160px]">
                  {qualification}
                </Badge>
              </div>
            ))}
            {staffMember.qualifications.length > 2 && (
              <div className="text-xs text-muted-foreground">
                他{staffMember.qualifications.length - 2}件
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'ステータス',
      size: 100,
      cell: ({ row }) => {
        const staffMember = row.original;
        return <div className="min-w-[80px]">{getStatusBadge(staffMember.status)}</div>;
      },
    },
    {
      accessorKey: 'hireDate',
      header: '入職日',
      size: 120,
      cell: ({ row }) => {
        const staffMember = row.original;
        return (
          <div className="text-sm text-muted-foreground min-w-[100px]">
            {new Date(staffMember.hireDate).toLocaleDateString('ja-JP')}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      size: 50,
      cell: ({ row }) => {
        const staffMember = row.original;
        return (
          <div className="min-w-[50px]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">メニューを開く</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(staffMember.id)}>
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
                          staffMember.id,
                          staffMember.status === 'active' ? 'inactive' : 'active'
                        )
                      }
                    >
                      {staffMember.status === 'active' ? (
                        <>
                          <ToggleLeft className="mr-2 h-4 w-4" />
                          退職処理
                        </>
                      ) : (
                        <>
                          <ToggleRight className="mr-2 h-4 w-4" />
                          復職処理
                        </>
                      )}
                    </DropdownMenuItem>
                  </>
                )}

                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(staffMember.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      削除
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const emptyState = (
    <div className="text-center py-8">
      <UserCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-semibold text-muted-foreground">職員がいません</h3>
      <p className="mt-2 text-sm text-muted-foreground">職員が登録されていません。</p>
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={staff}
      searchKey="name"
      searchPlaceholder="職員名で検索..."
      loading={loading}
      emptyState={emptyState}
      enablePagination={true}
      pageSize={10}
      actionArea={actionArea}
    />
  );
}
