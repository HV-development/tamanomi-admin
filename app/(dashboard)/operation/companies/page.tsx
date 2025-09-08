'use client';

import { CompanyTable } from '@/components/3_organisms/tables/company-table';
import { Button } from '@/components/ui/button';
import { useCompanies } from '@/hooks/use-companies';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  // 検索クエリをメモ化して、不要な再レンダリングを防ぐ
  const searchParams = useMemo(() => {
    if (!mounted) return {};
    return {
      search: searchQuery.trim() || undefined,
    };
  }, [mounted, searchQuery]);

  const { companies, loading, deleteCompany } = useCompanies(searchParams);

  // コンポーネントのマウント完了後に検索を有効化
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteCompany(id);
      if (success) {
        // 削除成功時の処理（必要に応じてトースト表示など）
      }
    } catch (error) {
      // エラーは useCompanies フック内で処理される
      console.error('削除エラー:', error);
    }
  };

  const registerButton = (
    <Button asChild>
      <Link href="/operation/companies/register">
        <Plus className="mr-2 h-4 w-4" />
        会社を登録
      </Link>
    </Button>
  );

  return (
    <CompanyTable
      companies={companies}
      loading={loading}
      onDelete={handleDelete}
      actionArea={registerButton}
    />
  );
}
