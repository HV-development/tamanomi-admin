'use client';

import { AdminForm } from '@/components/2_molecules/forms/admin-form';
import { AdminRegistrationSuccessModal } from '@/components/2_molecules/modals/admin-registration-success-modal';
import { useAdmins } from '@/hooks/use-admins';
import type { AdminRegistrationResponse } from '@/types/admin';
import type { AdminFormData } from '@/validations/admin-validation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminRegisterPage() {
  const router = useRouter();
  const { addAdmin } = useAdmins();
  const [registrationData, setRegistrationData] = useState<AdminRegistrationResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (data: AdminFormData) => {
    try {
      const response = await addAdmin(data);
      setRegistrationData(response);
      setIsModalOpen(true);
      toast.success('運営管理者を登録しました。');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '登録に失敗しました。');
      throw error; // AdminFormでエラー表示するため再スロー
    }
  };

  const handleCancel = () => {
    router.push('/operation/admins');
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleGoToAdminList = () => {
    setIsModalOpen(false);
    router.push('/operation/admins');
  };

  return (
    <div className="space-y-6">
      <AdminForm onSubmit={handleSubmit} onCancel={handleCancel} loading={false} />

      <AdminRegistrationSuccessModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        registrationData={registrationData}
        onGoToAdminList={handleGoToAdminList}
      />
    </div>
  );
}
