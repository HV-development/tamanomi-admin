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

import { Button } from '@/components/ui/button';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { companyService } from '@/services/company-service';
import type { Company } from '@/types/company';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Building2,
  Calendar,
  Edit,
  Eye,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Trash2,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

interface CompanyTableProps {
  companies: Company[];
  loading: boolean;
  onDelete: (id: string) => void;
  actionArea?: React.ReactNode;
}

export function CompanyTable({ companies, loading, onDelete, actionArea }: CompanyTableProps) {
  const [deleteCompanyId, setDeleteCompanyId] = useState<string | null>(null);
  const [deletePermissions, setDeletePermissions] = useState<
    Record<string, { canDelete: boolean; reason?: string }>
  >({});

  // 各会社の削除可能性をチェック
  useEffect(() => {
    const checkDeletePermissions = async () => {
      const permissions: Record<string, { canDelete: boolean; reason?: string }> = {};

      for (const company of companies) {
        try {
          const result = await companyService.canDeleteCompany(company.id);
          permissions[company.id] = result;
        } catch (error) {
          permissions[company.id] = { canDelete: false, reason: 'エラーが発生しました' };
        }
      }

      setDeletePermissions(permissions);
    };

    if (companies.length > 0) {
      checkDeletePermissions();
    }
  }, [companies]);

  const handleDeleteConfirm = () => {
    if (deleteCompanyId) {
      onDelete(deleteCompanyId);
      setDeleteCompanyId(null);
    }
  };

  const columns = useMemo<ColumnDef<Company>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <SortableHeader onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            会社名
          </SortableHeader>
        ),
        cell: ({ row }) => {
          const company = row.original;
          return (
            <div className="space-y-1">
              <Link
                href={`/operation/companies/${company.id}`}
                className="font-medium text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {company.name}
              </Link>
              <div className="text-xs text-muted-foreground">{company.nameKana}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{company.address}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'contact',
        header: '連絡先',
        cell: ({ row }) => {
          const company = row.original;
          return (
            <div className="space-y-0.5">
              {company.phoneNumber && (
                <div className="flex items-center gap-1 text-xs">
                  <Phone className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                  <span>{company.phoneNumber}</span>
                </div>
              )}
              {company.email && (
                <div className="flex items-center gap-1 text-xs">
                  <Mail className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate">{company.email}</span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'representativeName',
        header: ({ column }) => (
          <SortableHeader onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            代表者情報
          </SortableHeader>
        ),
        cell: ({ row }) => {
          const company = row.original;
          return (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="font-medium text-sm text-foreground">
                  {company.representativeName}
                </span>
              </div>
              {company.representativePosition && (
                <div className="text-xs text-muted-foreground">
                  {company.representativePosition}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'businessType',
        header: ({ column }) => (
          <SortableHeader onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            事業種別
          </SortableHeader>
        ),
        cell: ({ row }) => <div className="text-xs">{row.getValue('businessType')}</div>,
      },

      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <SortableHeader onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            登録日
          </SortableHeader>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span>{new Date(row.getValue('createdAt')).toLocaleDateString('ja-JP')}</span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const company = row.original;
          const permission = deletePermissions[company.id];

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-muted">
                  <span className="sr-only">メニューを開く</span>
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <Link href={`/operation/companies/${company.id}`} className="flex items-center">
                    <Eye className="mr-2 h-4 w-4" />
                    詳細を見る
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/operation/companies/${company.id}/edit`}
                    className="flex items-center"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    編集
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className={`${
                    permission?.canDelete === false
                      ? 'text-muted-foreground cursor-not-allowed opacity-50'
                      : 'text-destructive focus:text-destructive'
                  }`}
                  onClick={() => {
                    if (permission?.canDelete !== false) {
                      setDeleteCompanyId(company.id);
                    }
                  }}
                  disabled={permission?.canDelete === false}
                  title={permission?.canDelete === false ? permission.reason : undefined}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除
                  {permission?.canDelete === false && <span className="ml-auto text-xs">不可</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [deletePermissions]
  );

  const emptyState = (
    <div className="p-12 text-center">
      <Building2 className="mx-auto h-16 w-16 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold text-foreground">会社が見つかりません</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        検索条件を変更するか、新しい会社を登録してください。
      </p>
    </div>
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={companies}
        searchKey="name"
        searchPlaceholder="会社名で検索..."
        loading={loading}
        emptyState={emptyState}
        enablePagination={true}
        pageSize={10}
        actionArea={actionArea}
      />

      <AlertDialog open={!!deleteCompanyId} onOpenChange={() => setDeleteCompanyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>会社を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteCompanyId && deletePermissions[deleteCompanyId]?.canDelete === false ? (
                <div className="space-y-2">
                  <div className="text-destructive font-medium">
                    {deletePermissions[deleteCompanyId]?.reason}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    会社を削除するには、まず紐付く事業所をすべて削除してください。
                  </div>
                </div>
              ) : (
                'この操作は取り消すことができません。会社に関連するすべてのデータが削除されます。'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {deleteCompanyId && deletePermissions[deleteCompanyId]?.canDelete === false
                ? '閉じる'
                : 'キャンセル'}
            </AlertDialogCancel>
            {deleteCompanyId && deletePermissions[deleteCompanyId]?.canDelete !== false && (
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
