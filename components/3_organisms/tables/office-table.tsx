'use client';

import { ServiceTypeBadge } from '@/components/1_atoms/badges/service-type-badge';
import { StatusBadge } from '@/components/1_atoms/badges/status-badge';
import { CapacityIndicator } from '@/components/1_atoms/indicators/capacity-indicator';
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
import { officeService } from '@/services/office-service';
import type { Office } from '@/types/office';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Ban,
  Building2,
  Calendar,
  Edit,
  Eye,
  MapPin,
  MoreHorizontal,
  Phone,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

interface OfficeTableProps {
  offices: Office[];
  loading: boolean;
  onDelete: (id: string) => void;
  onDisable?: (id: string) => void;
  onEnable?: (id: string) => void;
  hideSearch?: boolean;
  actionArea?: React.ReactNode;
}

export function OfficeTable({
  offices,
  loading,
  onDelete,
  onDisable,
  onEnable,
  hideSearch = false,
  actionArea,
}: OfficeTableProps) {
  const [deleteOfficeId, setDeleteOfficeId] = useState<string | null>(null);
  const [disableOfficeId, setDisableOfficeId] = useState<string | null>(null);
  const [enableOfficeId, setEnableOfficeId] = useState<string | null>(null);
  const [deletePermissions, setDeletePermissions] = useState<
    Record<string, { canDelete: boolean; reason?: string }>
  >({});

  // 各事業所の削除可能性をチェック
  useEffect(() => {
    const checkDeletePermissions = async () => {
      const permissions: Record<string, { canDelete: boolean; reason?: string }> = {};

      for (const office of offices) {
        try {
          const result = await officeService.canDeleteOffice(office.id);
          permissions[office.id] = result;
        } catch (error) {
          permissions[office.id] = { canDelete: false, reason: 'エラーが発生しました' };
        }
      }

      setDeletePermissions(permissions);
    };

    if (offices.length > 0) {
      checkDeletePermissions();
    }
  }, [offices]);

  const handleDeleteConfirm = () => {
    if (deleteOfficeId) {
      onDelete(deleteOfficeId);
      setDeleteOfficeId(null);
    }
  };

  const handleDisableConfirm = () => {
    if (disableOfficeId && onDisable) {
      onDisable(disableOfficeId);
      setDisableOfficeId(null);
    }
  };

  const handleEnableConfirm = () => {
    if (enableOfficeId && onEnable) {
      onEnable(enableOfficeId);
      setEnableOfficeId(null);
    }
  };

  // 選択された事業所の情報を取得
  const selectedOfficeForDisable = offices.find((office) => office.id === disableOfficeId);
  const selectedOfficeForEnable = offices.find((office) => office.id === enableOfficeId);
  const selectedOfficeForDelete = offices.find((office) => office.id === deleteOfficeId);

  const columns = useMemo<ColumnDef<Office>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <SortableHeader onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            事業所名
          </SortableHeader>
        ),
        cell: ({ row }) => {
          const office = row.original;
          return (
            <div className="space-y-1">
              <Link
                href={`/operation/offices/${office.id}`}
                className="font-medium text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {office.name}
              </Link>
              <div className="space-y-0.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{office.address}</span>
                </div>
                {office.phoneNumber && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 flex-shrink-0" />
                    <span>{office.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'companyName',
        header: ({ column }) => (
          <SortableHeader onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            法人名
          </SortableHeader>
        ),
        cell: ({ row }) => {
          const office = row.original;
          return (
            <div className="space-y-0.5">
              <div className="font-medium text-sm text-foreground">{office.companyName}</div>
              {office.managerName && (
                <div className="text-xs text-muted-foreground">管理者: {office.managerName}</div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'serviceType',
        header: 'サービス種別',
        cell: ({ row }) => (
          <ServiceTypeBadge serviceType={row.getValue('serviceType')} className="text-xs" />
        ),
      },
      {
        accessorKey: 'status',
        header: 'ステータス',
        cell: ({ row }) => <StatusBadge status={row.getValue('status')} className="text-xs" />,
      },
      {
        accessorKey: 'currentUsers',
        header: ({ column }) => (
          <SortableHeader onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            利用状況
          </SortableHeader>
        ),
        cell: ({ row }) => {
          const office = row.original;
          return (
            <CapacityIndicator
              current={office.currentUsers}
              capacity={office.capacity}
              className="space-y-0"
            />
          );
        },
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
          const office = row.original;
          const permission = deletePermissions[office.id];

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
                  <Link href={`/operation/offices/${office.id}`} className="flex items-center">
                    <Eye className="mr-2 h-4 w-4" />
                    詳細を見る
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/operation/offices/${office.id}/edit`} className="flex items-center">
                    <Edit className="mr-2 h-4 w-4" />
                    編集
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {office.status === 'disabled'
                  ? onEnable && (
                      <DropdownMenuItem
                        className="text-green-600 focus:text-green-600"
                        onClick={() => setEnableOfficeId(office.id)}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        利用復元
                      </DropdownMenuItem>
                    )
                  : onDisable && (
                      <DropdownMenuItem
                        className="text-orange-600 focus:text-orange-600"
                        onClick={() => setDisableOfficeId(office.id)}
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        利用停止
                      </DropdownMenuItem>
                    )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className={`${
                    permission?.canDelete === false
                      ? 'text-muted-foreground cursor-not-allowed opacity-50'
                      : 'text-destructive focus:text-destructive'
                  }`}
                  onClick={() => {
                    if (permission?.canDelete !== false) {
                      setDeleteOfficeId(office.id);
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
    [deletePermissions, onDisable, onEnable]
  );

  const emptyState = (
    <div className="p-12 text-center">
      <Building2 className="mx-auto h-16 w-16 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold text-foreground">事業所が見つかりません</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        検索条件を変更するか、新しい事業所を登録してください。
      </p>
      <div className="mt-8">
        <Button asChild>
          <Link href="/operation/offices/register">
            <Building2 className="mr-2 h-4 w-4" />
            事業所を登録
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={offices}
        searchKey={hideSearch ? undefined : 'name'}
        searchPlaceholder="事業所名で検索..."
        loading={loading}
        emptyState={emptyState}
        enablePagination={true}
        pageSize={10}
        actionArea={actionArea}
      />

      {/* 削除確認ダイアログ */}
      <AlertDialog open={!!deleteOfficeId} onOpenChange={() => setDeleteOfficeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedOfficeForDelete
                ? `「${selectedOfficeForDelete.name}」を削除しますか？`
                : '事業所を削除しますか？'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteOfficeId && deletePermissions[deleteOfficeId]?.canDelete === false ? (
                <div className="space-y-2">
                  <div className="text-destructive font-medium">
                    {deletePermissions[deleteOfficeId]?.reason}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>事業所を削除するには以下の条件を満たす必要があります：</div>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>事業所が利用停止中であること</li>
                      <li>紐付く利用者がいないこと</li>
                      <li>紐付く職員がいないこと</li>
                    </ul>
                  </div>
                </div>
              ) : (
                'この操作は取り消すことができません。事業所に関連するすべてのデータが削除されます。'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {deleteOfficeId && deletePermissions[deleteOfficeId]?.canDelete === false
                ? '閉じる'
                : 'キャンセル'}
            </AlertDialogCancel>
            {deleteOfficeId && deletePermissions[deleteOfficeId]?.canDelete !== false && (
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

      {/* 利用停止確認ダイアログ */}
      <AlertDialog open={!!disableOfficeId} onOpenChange={() => setDisableOfficeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedOfficeForDisable
                ? `「${selectedOfficeForDisable.name}」を利用停止しますか？`
                : '事業所を利用停止しますか？'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              この事業所の利用を停止します。利用停止後は、事業所管理者や職員、利用者はシステムにアクセスできなくなります。
              <br />
              <br />
              利用停止は後から復元することができます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableConfirm}
              className="bg-orange-600 text-white hover:bg-orange-600/90"
            >
              利用停止する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 利用復元確認ダイアログ */}
      <AlertDialog open={!!enableOfficeId} onOpenChange={() => setEnableOfficeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedOfficeForEnable
                ? `「${selectedOfficeForEnable.name}」の利用を復元しますか？`
                : '事業所の利用を復元しますか？'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              この事業所の利用を復元します。復元後は、事業所管理者や職員、利用者が再びシステムにアクセスできるようになります。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEnableConfirm}
              className="bg-green-600 text-white hover:bg-green-600/90"
            >
              利用復元する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
