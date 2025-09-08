'use client';

import { ServiceTypeBadge } from '@/components/1_atoms/badges/service-type-badge';
import { StatusBadge } from '@/components/1_atoms/badges/status-badge';
import { CapacityIndicator } from '@/components/1_atoms/indicators/capacity-indicator';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import type { Office } from '@/types/office';
import {
  Ban,
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

interface OfficeTableRowProps {
  office: Office;
  onDelete: (id: string) => void;
  onDisable?: (id: string) => void;
  onEnable?: (id: string) => void;
}

export function OfficeTableRow({ office, onDelete, onDisable, onEnable }: OfficeTableRowProps) {
  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="py-2">
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
      </TableCell>
      <TableCell className="py-2">
        <div className="space-y-0.5">
          <div className="font-medium text-sm text-foreground">{office.companyName}</div>
          {office.managerName && (
            <div className="text-xs text-muted-foreground">管理者: {office.managerName}</div>
          )}
        </div>
      </TableCell>
      <TableCell className="py-2">
        <ServiceTypeBadge serviceType={office.serviceType} className="text-xs" />
      </TableCell>
      <TableCell className="py-2">
        <StatusBadge status={office.status} className="text-xs" />
      </TableCell>
      <TableCell className="py-2">
        <CapacityIndicator
          current={office.currentUsers}
          capacity={office.capacity}
          className="space-y-0"
        />
      </TableCell>
      <TableCell className="py-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span>{new Date(office.createdAt).toLocaleDateString('ja-JP')}</span>
        </div>
      </TableCell>
      <TableCell className="py-2">
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
                    onClick={() => onEnable(office.id)}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    利用復元
                  </DropdownMenuItem>
                )
              : onDisable && (
                  <DropdownMenuItem
                    className="text-orange-600 focus:text-orange-600"
                    onClick={() => onDisable(office.id)}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    利用停止
                  </DropdownMenuItem>
                )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(office.id)}
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
