'use client';

import { OfficeWithManagerForm } from '@/components/2_molecules/forms/office-with-manager-form';
import { OfficeRegistrationSuccessModal } from '@/components/2_molecules/modals/office-registration-success-modal';
import { Button } from '@/components/ui/button';
import { useCompanies } from '@/hooks/use-companies';
import type {
  OfficeRegistrationResponse,
  OfficeWithManagerRegistration,
} from '@/types/facility-manager';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function RegisterOfficePage() {
  const router = useRouter();
  const { companies, loading: companiesLoading } = useCompanies();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrationData, setRegistrationData] = useState<OfficeRegistrationResponse | null>(null);

  const handleSubmit = async (data: OfficeWithManagerRegistration) => {
    try {
      setLoading(true);

      // TODO: 実際のAPI呼び出しに置き換える
      // 現在はモックデータを使用
      const mockResponse: OfficeRegistrationResponse = {
        office: {
          id: `office_${Date.now()}`,
          name: data.office.name,
        },
        manager: {
          id: `manager_${Date.now()}`,
          name: data.manager.name,
          email: data.manager.email,
          temporaryPassword: generateTemporaryPassword(),
        },
      };

      // APIコールのシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setRegistrationData(mockResponse);
      setShowSuccessModal(true);
      toast.success('事業所と管理者を登録しました');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('事業所の登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const generateTemporaryPassword = (): string => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGoToOfficeList = () => {
    setShowSuccessModal(false);
    router.push('/operation/offices');
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  if (companiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* ページヘッダー */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/operation/offices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">事業所登録</h1>
            <p className="text-muted-foreground text-sm">
              新しい事業所と事業所管理者を同時に登録します
            </p>
          </div>
        </div>

        <OfficeWithManagerForm companies={companies} onSubmit={handleSubmit} loading={loading} />
      </div>

      <OfficeRegistrationSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        registrationData={registrationData}
        onGoToOfficeList={handleGoToOfficeList}
      />
    </>
  );
}
