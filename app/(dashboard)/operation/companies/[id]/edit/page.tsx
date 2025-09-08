'use client';

import { CompanyForm } from '@/components/2_molecules/forms/company-form';
import { Button } from '@/components/ui/button';
import { useCompanies, useCompany } from '@/hooks/use-companies';
import type { EditCompanyFormData } from '@/types/company';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { toast } from 'sonner';

interface EditCompanyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditCompanyPage({ params }: EditCompanyPageProps) {
  const { id: companyId } = use(params);
  const router = useRouter();
  const { company, loading, error } = useCompany(companyId);
  const { updateCompany } = useCompanies();
  const [formLoading, setFormLoading] = useState(false);

  const handleSubmit = async (data: EditCompanyFormData) => {
    try {
      setFormLoading(true);
      const updatedCompany = await updateCompany(companyId, data);
      if (updatedCompany) {
        toast.success('会社情報を更新しました');
        router.push(`/operation/companies/${companyId}`);
      }
    } catch (error) {
      toast.error('会社情報の更新に失敗しました');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="text-red-600 text-lg font-medium">エラーが発生しました</div>
          <p className="text-muted-foreground">{error || '会社情報を取得できませんでした'}</p>
          <Button asChild>
            <Link href="/operation/companies">会社一覧に戻る</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/operation/companies/${companyId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">会社編集</h1>
          <p className="text-muted-foreground text-sm">{company.name}の情報を編集します</p>
        </div>
      </div>

      <CompanyForm
        mode="edit"
        initialData={company}
        onSubmit={handleSubmit}
        loading={formLoading}
        submitLabel="更新する"
      />
    </div>
  );
}
