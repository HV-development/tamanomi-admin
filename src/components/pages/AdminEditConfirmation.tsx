'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import DashboardLayout from '../templates/DashboardLayout';
import Button from '../atoms/Button';

interface AdminData {
  role: string;
  name: string;
  email: string;
  password: string;
}

export default function AdminEditConfirmation() {
  const searchParams = useSearchParams();
  const params = useParams();
  const adminId = params.id as string;
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
    // 管理者アカウント編集画面に戻る
    window.history.back();
  };

  const handleUpdate = () => {
    // 実際の更新処理（APIコール等）
    console.log('管理者アカウント更新:', adminData);
    alert('管理者アカウントを更新しました');
    // 更新後は管理者アカウント一覧画面に遷移
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
          <h1 className="text-3xl font-bold text-gray-900">管理者アカウント変更内容確認</h1>
          <p className="mt-2 text-gray-600">
            変更内容を確認してください
          </p>
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
              変更内容を修正する
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleUpdate}
              className="px-8"
            >
              変更する
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}