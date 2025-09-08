'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import type { Admin } from '@/types/admin';
import { Edit, MoreHorizontal, Trash2, UserCheck, UserX } from 'lucide-react';
import Link from 'next/link';

interface AdminTableRowProps {
  admin: Admin;
  onDelete: (id: string) => void;
  onStatusToggle: (admin: Admin) => void;
  isToggling?: boolean;
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

export function AdminTableRow({
  admin,
  onDelete,
  onStatusToggle,
  isToggling = false,
}: AdminTableRowProps) {
  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="py-4">
        <div className="space-y-1">
          <div className="font-medium text-foreground">{admin.name}</div>
          <div className="text-sm text-muted-foreground">{admin.nameKana}</div>
          <div className="text-xs text-muted-foreground font-mono">{admin.email}</div>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="space-y-1">
          <div className="text-sm font-mono">{admin.phoneNumber}</div>
          {admin.department && (
            <div className="text-xs text-muted-foreground">{admin.department}</div>
          )}
        </div>
      </TableCell>

      <TableCell className="py-4">{getStatusBadge(admin.status)}</TableCell>

      <TableCell className="py-4">
        <div className="text-sm text-muted-foreground">{formatDateTime(admin.lastLoginAt)}</div>
      </TableCell>

      <TableCell className="py-4">
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
              onClick={() => onStatusToggle(admin)}
              disabled={isToggling}
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
              onClick={() => onDelete(admin.id)}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
