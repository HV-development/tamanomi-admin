'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '../templates/DashboardLayout';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

interface AdminData {
  role: string;
  name: string;
  email: string;
  password: string;
}

export default function AdminRegistrationConfirmation() {
  const searchParams = useSearchParams();
  const [adminData, setAdminData] = useState<AdminData | null>(null);

  useEffect(() => {
    const data: AdminData = {
      role: searchParams.get('role') || '',
      name: searchParams.get('name') || '',
      email: searchParams.get('email') || '',
      password: searchParams.get('password') || '',
    };
    setAdminData(data);
  }, [searchParams]);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case '1':
        return '管理者';
      case '2':
        return '一般';
      default:
        return '';
    }
  };

  const handleModify = () => {
    // 管理者アカウント登録画面に戻る（データを保持）
    const queryParams = new URLSearchParams({
      role: adminData?.role || '',
      name: adminData?.name || '',
      email: adminData?.email || '',
      password: adminData?.password || '',
    });
    
    window.location.href = `/admins/new?${queryParams.toString()}`;
  };

  const handleRegister = () => {
    // 実際の登録処理（APIコール等）
    console.log('管理者アカウント登録:', adminData);
    alert('管理者アカウントを登録しました');
    // 登録後は管理者アカウント一覧画面に遷移
    window.location.href = '/admins';
  };

  if (!adminData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">データを読み込んでいます...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                権限
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{getRoleLabel(adminData.role)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                氏名
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{adminData.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">{adminData.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">
                {'*'.repeat(adminData.password.length)}
              </p>
            </div>
          </div>

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
            >
              登録する
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}