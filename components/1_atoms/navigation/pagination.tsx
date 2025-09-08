'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // ページ番号の配列を生成
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // 総ページ数が少ない場合は全て表示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 現在のページを中心にページ番号を表示
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {/* 表示件数情報 */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          {totalCount > 0 ? (
            <>
              {startItem}～{endItem}件 / 全{totalCount}件
            </>
          ) : (
            '0件'
          )}
        </div>

        {/* ページサイズ選択 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">表示件数:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 px-2 text-sm border rounded-md bg-background"
          >
            <option value={10}>10件</option>
            <option value={20}>20件</option>
            <option value={50}>50件</option>
            <option value={100}>100件</option>
          </select>
        </div>
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* 最初のページへ */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
            aria-label="最初のページへ"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* 前のページへ */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
            aria-label="前のページへ"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* ページ番号 */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((page, index) => (
              <div key={index}>
                {page === '...' ? (
                  <div className="flex h-8 w-8 items-center justify-center">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </div>
                ) : (
                  <Button
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(page as number)}
                    className="h-8 w-8 p-0"
                    aria-label={`ページ${page}へ`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* 次のページへ */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
            aria-label="次のページへ"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* 最後のページへ */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
            aria-label="最後のページへ"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
