'use client';

import { OfficeTable } from '@/components/3_organisms/tables/office-table';
import { Button } from '@/components/ui/button';
import { useOfficeActions, useOffices } from '@/hooks/use-offices';
import type { OfficeFilters } from '@/types/office';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// 初期フィルター値
const initialFilters: Partial<OfficeFilters> = {
  search: '',
  serviceType: undefined,
  isDisabled: false, // デフォルトで稼働中のみ表示
  companyId: '',
  city: '',
  hasVacancy: false,
};

export default function OfficesPage() {
  const [filters, setFilters] = useState<Partial<OfficeFilters>>(initialFilters);
  const [mounted, setMounted] = useState(false);

  // 検索パラメータをメモ化して、不要な再レンダリングを防ぐ
  const searchParams = useMemo(() => {
    if (!mounted) return {};

    const params: Partial<OfficeFilters> = {};

    // 検索テキスト
    if (filters.search?.trim()) {
      params.search = filters.search.trim();
    }

    // サービス種別
    if (filters.serviceType && filters.serviceType !== 'all') {
      params.serviceType = filters.serviceType;
    }

    // 利用停止フィルター
    if (filters.isDisabled !== undefined) {
      params.isDisabled = filters.isDisabled;
    }

    // 空きあり
    if (filters.hasVacancy) {
      params.hasVacancy = filters.hasVacancy;
    }

    return params;
  }, [mounted, filters]);

  const { offices, loading: officesLoading, refetch } = useOffices(searchParams);
  const { deleteOffice, disableOffice, enableOffice } = useOfficeActions();

  // コンポーネントのマウント完了後に検索を有効化
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const success = await deleteOffice(id);
        if (success) {
          await refetch();
          toast.success('事業所を削除しました');
        }
      } catch (error) {
        // エラーは useOfficeActions フック内で処理される
        console.error('削除エラー:', error);
      }
    },
    [deleteOffice, refetch]
  );

  const handleDisable = useCallback(
    async (id: string) => {
      const office = await disableOffice(id, '管理者による利用停止');
      if (office) {
        await refetch();
        toast.success(`${office.name}を利用停止しました`);
      }
    },
    [disableOffice, refetch]
  );

  const handleEnable = useCallback(
    async (id: string) => {
      const office = await enableOffice(id);
      if (office) {
        await refetch();
        toast.success(`${office.name}の利用を復元しました`);
      }
    },
    [enableOffice, refetch]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const registerButton = (
    <Button asChild>
      <Link href="/operation/offices/register">
        <Plus className="mr-2 h-4 w-4" />
        事業所を登録
      </Link>
    </Button>
  );

  return (
    <>
      <OfficeTable
        offices={offices}
        loading={officesLoading}
        onDelete={handleDelete}
        onDisable={handleDisable}
        onEnable={handleEnable}
        actionArea={registerButton}
      />
    </>
  );
}
