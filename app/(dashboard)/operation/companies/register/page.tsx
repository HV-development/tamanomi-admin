'use client';

import { CompanyForm } from '@/components/2_molecules/forms/company-form';
import { useCompanies } from '@/hooks/use-companies';
import type { CreateCompanyFormData } from '@/types/company';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function RegisterCompanyPage() {
  const router = useRouter();
  const { createCompany } = useCompanies();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateCompanyFormData) => {
    try {
      setLoading(true);
      const company = await createCompany(data);
      if (company) {
        toast.success('会社を登録しました');
        router.push('/operation/companies');
      }
    } catch (error) {
      toast.error('会社の登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <CompanyForm mode="create" onSubmit={handleSubmit} loading={loading} submitLabel="登録する" />
    </div>
  );
}
