'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/templates/admin-layout';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import AdminConfirmationFields from '@/components/molecules/admin-confirmation-fields';
import { apiClient } from '@/lib/api';
import { type AdminFormData, type AdminAccountInput } from '@hv-development/schemas';
import { handleAdminError } from '@/hooks/use-admin-error-handler';

export const dynamic = 'force-dynamic';

function AdminConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [adminData, setAdminData] = useState<AdminFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const data: AdminFormData = {
      role: searchParams.get('role') || '',
      firstName: searchParams.get('firstName') || '',
      lastName: searchParams.get('lastName') || '',
      email: searchParams.get('email') || '',
      password: searchParams.get('password') || '',
      passwordConfirm: searchParams.get('passwordConfirm') || '',
    };
    setAdminData(data);
  }, [searchParams]);

  const handleModify = () => {
    // 管理者アカウント登録画面に戻る（データを保持）
    const queryParams = new URLSearchParams({
      role: adminData?.role || '',
      firstName: adminData?.firstName || '',
      lastName: adminData?.lastName || '',
      email: adminData?.email || '',
      password: adminData?.password || '',
      passwordConfirm: adminData?.passwordConfirm || '',
    });

    window.location.href = `/admins/new?${queryParams.toString()}`;
  };

  const handleRegister = async () => {
    if (!adminData) return;

    setIsSubmitting(true);
    try {
      const adminAccountData: AdminAccountInput = {
        email: adminData.email,
        password: adminData.password,
        role: adminData.role,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        status: "active",
        sendInvite: true, // TODO: 管理者アカウント登録時に招待メールを送信するかどうかを設定する
        inviteTemplate: "default", // TODO: 管理者アカウント登録時に招待メールのテンプレートを設定する
        metadata: {"note": "新規入社"}, // TODO: 管理者アカウント登録時に任意のメモを設定する
      };

      await apiClient.createAdminAccount(adminAccountData);
      alert('管理者アカウントを登録しました');
      router.push('/admins');
    } catch (error: unknown) {
      const errorInfo = handleAdminError(error);
      
      if (errorInfo.isEmailConflict) {
        alert(errorInfo.message);
        setIsSubmitting(false);
        return;
      }
      
      console.error('管理者アカウントの作成に失敗しました:', error);
      alert('管理者アカウントの作成に失敗しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };

  if (!adminData) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">データを読み込んでいます...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ページタイトル */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">管理者アカウント登録内容確認</h1>
            <p className="text-gray-600">
              入力内容を確認してください
            </p>
            </div>
            <div className="text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Icon name="admin" size="sm" className="text-gray-600" />
                <span className="font-medium text-gray-900">管理者太郎</span>
              </div>
            </div>
          </div>
        </div>

        {/* 確認内容 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <AdminConfirmationFields adminData={adminData} />

          {/* アクションボタン */}
          <div className="flex justify-center space-x-4 pt-6 mt-6 border-t border-gray-200">
            <Button
              variant="outline"
              size="lg"
              onClick={handleModify}
              className="px-8"
            >
              登録内容を修正する
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleRegister}
              className="px-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? '登録中...' : '登録する'}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminConfirmPage() {
  return (
    <Suspense fallback={
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">データを読み込んでいます...</p>
        </div>
      </AdminLayout>
    }>
      <AdminConfirmationContent />
    </Suspense>
  );
}
