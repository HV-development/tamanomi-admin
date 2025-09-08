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
import type { Company } from '@/types/company';
import {
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

interface CompanyTableRowProps {
  company: Company;
  onDelete: (id: string) => void;
}

export function CompanyTableRow({ company, onDelete }: CompanyTableRowProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'アクティブ';
      case 'inactive':
        return '非アクティブ';
      case 'suspended':
        return '一時停止';
      default:
        return status;
    }
  };

  return (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="py-2">
        <div className="space-y-1">
          <Link
            href={`/operation/companies/${company.id}`}
            className="font-medium text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            {company.name}
          </Link>
          <div className="space-y-0.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{company.address}</span>
            </div>
            {company.phoneNumber && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 flex-shrink-0" />
                <span>{company.phoneNumber}</span>
              </div>
            )}
            {company.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{company.email}</span>
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="py-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="font-medium text-sm text-foreground">
              {company.representativeName}
            </span>
          </div>
          {company.representativePosition && (
            <div className="text-xs text-muted-foreground">{company.representativePosition}</div>
          )}
        </div>
      </TableCell>
      <TableCell className="py-2">
        <div className="text-xs">{company.businessType}</div>
      </TableCell>
      <TableCell className="py-2">
        <Badge className={`text-xs ${getStatusColor(company.status)}`}>
          {getStatusText(company.status)}
        </Badge>
      </TableCell>
      <TableCell className="py-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span>{new Date(company.createdAt).toLocaleDateString('ja-JP')}</span>
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
              <Link href={`/operation/companies/${company.id}`} className="flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                詳細を見る
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/operation/companies/${company.id}/edit`} className="flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                編集
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(company.id)}
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
