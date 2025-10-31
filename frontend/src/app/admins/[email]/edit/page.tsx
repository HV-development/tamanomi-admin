'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/templates/admin-layout';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import AdminFormFields from '@/components/molecules/admin-form-fields';
import { useAdminForm } from '@/hooks/use-admin-form';
import { type AdminFormData } from '@hv-development/schemas';
import { apiClient } from '@/lib/api';

function AdminEditForm() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const adminEmail = params.email as string;

  const initialFormData: AdminFormData = {
    role: '',
    lastName: '',
    firstName: '',
    email: '',
    password: '',
    passwordConfirm: '',
  };

  const {
    formData,
    setFormData,
    errors,
    isSubmitting,
    setIsSubmitting,
    handleInputChange,
    validateAllFields,
  } = useAdminForm<AdminFormData>(initialFormData);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminAccount = async () => {
      try {
        setIsLoading(true);
        const adminData = (await apiClient.getAdminAccount(adminEmail)) as AdminFormData;
        if (adminData) {
          adminData.password = '';
          adminData.passwordConfirm = '';
          setFormData(adminData);
        }

        // URLパラメータから値を取得してフォームに設定
        if (searchParams) {
          const urlData: AdminFormData = {
            role: searchParams.get('role') || '',
            lastName: searchParams.get('lastName') || '',
            firstName: searchParams.get('firstName') || '',
            email: searchParams.get('email') || '',
            password: searchParams.get('password') || '',
            passwordConfirm: searchParams.get('passwordConfirm') || '',
          };
          if (Object.values(urlData).some((value) => value !== '')) {
            setFormData((prev: AdminFormData) => ({ ...prev, ...urlData }));
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('管理者アカウント情報の取得に失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminAccount();
  }, [adminEmail, searchParams, setFormData]);

  const handleSubmit = () => {
    setIsSubmitting(true);
    if (validateAllFields()) {
      // 編集確認画面に遷移
      const queryParams = new URLSearchParams({
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName || '',
        formEmail: formData.email || '',
        paramsEmail: adminEmail || '',
        password: formData.password || '',
        passwordConfirm: formData.passwordConfirm || '',
      });

      router.push(`/admins/${adminEmail}/confirm?${queryParams.toString()}`);
    } else {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admins');
  };

  if (isLoading) {
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
              <h1 className="text-2xl font-bold text-gray-900">管理者アカウント編集</h1>
              <p className="text-gray-600">管理者アカウント情報を編集します</p>
            </div>
            <div className="text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Icon name="admin" size="sm" className="text-gray-600" />
                <span className="font-medium text-gray-900">管理者太郎</span>
              </div>
            </div>
          </div>
        </div>
        {/* 編集フォーム */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-6">
            <AdminFormFields
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
            />

            {/* アクションボタン */}
            <div className="flex justify-center space-x-4 pt-6">
              <Button
                variant="outline"
                size="lg"
                onClick={handleCancel}
                className="px-8"
              >
                キャンセル
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8"
              >
                {isSubmitting ? '処理中...' : '変更内容を確認する'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminEditPage() {
  return (
    <Suspense fallback={
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">データを読み込んでいます...</p>
        </div>
      </AdminLayout>
    }>
      <AdminEditForm />
    </Suspense>
  );
}
