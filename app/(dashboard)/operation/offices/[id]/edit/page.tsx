'use client';

import { OfficeForm } from '@/components/2_molecules/forms/office-form';
import { Button } from '@/components/ui/button';
import { useCompanies } from '@/hooks/use-companies';
import { useOffice, useOfficeActions } from '@/hooks/use-offices';
import type { EditOfficeFormData } from '@/types/office';
import { UpdateOfficeRequest } from '@/types/office';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { toast } from 'sonner';

interface EditOfficePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditOfficePage({ params }: EditOfficePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { office, loading: officeLoading, error } = useOffice(id);
  const { companies, loading: companiesLoading } = useCompanies();
  const { updateOffice } = useOfficeActions();
  const [formLoading, setFormLoading] = useState(false);

  const handleSubmit = async (data: EditOfficeFormData) => {
    try {
      setFormLoading(true);

      // EditOfficeFormDataからUpdateOfficeRequestへの型変換
      const updateData: UpdateOfficeRequest = {
        id: id,
        ...data,
        // 編集フォームから取得したnotesをdescriptionにマップ
        description: data.notes,
        // 編集フォームにはない項目のデフォルト値
        faxNumber: '',
        website: '',
        certifications: [],
      };

      const updatedOffice = await updateOffice(updateData);
      if (updatedOffice) {
        toast.success('事業所情報を更新しました');
        router.push(`/operation/offices/${id}`);
      }
    } catch (error) {
      toast.error('事業所情報の更新に失敗しました');
    } finally {
      setFormLoading(false);
    }
  };

  if (officeLoading || companiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !office) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="text-red-600 text-lg font-medium">エラーが発生しました</div>
          <p className="text-muted-foreground">{error || '事業所情報を取得できませんでした'}</p>
          <Button asChild>
            <Link href="/operation/offices">事業所一覧に戻る</Link>
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
          <Link href={`/operation/offices/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">事業所編集</h1>
          <p className="text-muted-foreground text-sm">{office.name}の情報を編集します</p>
        </div>
      </div>

      <OfficeForm
        mode="edit"
        companies={companies}
        initialData={office}
        onSubmit={handleSubmit}
        loading={formLoading}
        submitLabel="更新する"
      />
    </div>
  );
}
