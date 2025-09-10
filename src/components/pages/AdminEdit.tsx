'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../templates/DashboardLayout';
import Button from '../atoms/Button';

interface AdminFormData {
  role: string;
  name: string;
  email: string;
  password: string;
}

// サンプルデータ（実際はAPIから取得）
const sampleAdminData: Record<string, AdminFormData> = {
  'ADM001': {
    role: '1',
    name: '管理者太郎',
    email: 'admin@tamanomi.com',
    password: 'password123',
  },
  'ADM002': {
    role: '2',
    name: '一般花子',
    email: 'general@tamanomi.com',
    password: 'password456',
  },
  'ADM003': {
    role: '1',
    name: '管理者次郎',
    email: 'admin2@tamanomi.com',
    password: 'password789',
  },
  'ADM004': {
    role: '2',
    name: '一般美咲',
    email: 'general2@tamanomi.com',
    password: 'password012',
  },
};

export default function AdminEdit() {
  const params = useParams();
  const router = useRouter();
  const adminId = params.id as string;

  const [formData, setFormData] = useState<AdminFormData>({
    role: '',
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<AdminFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 実際はAPIから管理者データを取得
    const adminData = sampleAdminData[adminId];
    if (adminData) {
      setFormData(adminData);
    }
    setIsLoading(false);
  }, [adminId]);

  const handleInputChange = (field: keyof AdminFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // リアルタイムバリデーション
    validateField(field, value);
  };

  const validateField = (field: keyof AdminFormData, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'role':
        if (!value) {
          newErrors.role = '権限を選択してください';
        } else {
          delete newErrors.role;
        }
        break;

      case 'name':
        if (!value.trim()) {
          newErrors.name = '氏名を入力してください';
        } else if (value.length > 50) {
          newErrors.name = '氏名は50文字以内で入力してください';
        } else {
          delete newErrors.name;
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = 'メールアドレスを入力してください';
        } else if (value.length > 255) {
          newErrors.email = 'メールアドレスは255文字以内で入力してください';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'メールアドレスの形式が正しくありません';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value.trim()) {
          newErrors.password = 'パスワードを入力してください';
        } else if (value.length > 255) {
          newErrors.password = 'パスワードは255文字以内で入力してください';
        } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(value)) {
          newErrors.password = '英数字混在で入力してください';
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
  };

  const validateAllFields = (): boolean => {
    const newErrors: Partial<AdminFormData> = {};

    // 必須チェック
    if (!formData.role) newErrors.role = '権限を選択してください';
    if (!formData.name.trim()) newErrors.name = '氏名を入力してください';
    if (!formData.email.trim()) newErrors.email = 'メールアドレスを入力してください';
    if (!formData.password.trim()) newErrors.password = 'パスワードを入力してください';

    // 文字数チェック
    if (formData.name.length > 50) newErrors.name = '氏名は50文字以内で入力してください';
    if (formData.email.length > 255) newErrors.email = 'メールアドレスは255文字以内で入力してください';
    if (formData.password.length > 255) newErrors.password = 'パスワードは255文字以内で入力してください';

    // フォーマットチェック
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'メールアドレスの形式が正しくありません';
    }

    if (formData.password && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(formData.password)) {
      newErrors.password = '英数字混在で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    if (validateAllFields()) {
      // 編集確認画面に遷移
      const queryParams = new URLSearchParams({
        id: adminId,
        role: formData.role,
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      
      router.push(`/admins/${adminId}/confirm?${queryParams.toString()}`);
    } else {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admins');
  };

  if (isLoading) {
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
            <h1 className="text-2xl font-bold text-gray-900">管理者アカウント編集</h1>
            <p className="text-gray-600">
              管理者アカウント情報を編集します
            </p>
            </div>
            <div className="text-sm text-gray-600">
              <div className="flex items-start space-x-2 leading-none">
                <Icon name="admin" size="sm" className="text-gray-600" />
                <span className="font-medium text-gray-900">管理者太郎</span>
              </div>
            </div>
          </div>
        </div>

        {/* 編集フォーム */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-6">
            {/* 権限 */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                権限 <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.role ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">権限を選択してください</option>
                <option value="1">管理者</option>
                <option value="2">一般</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-500">{errors.role}</p>
              )}
            </div>

            {/* 氏名 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                氏名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                placeholder="氏名を入力（最大50文字）"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={50}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                placeholder="xxxxxx@xxx.xxx（最大255文字）"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={255}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                placeholder="英数字混在で入力"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={255}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

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
    </DashboardLayout>
  );
}