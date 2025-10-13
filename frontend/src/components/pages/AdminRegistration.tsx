'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/templates/dashboard-layout';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import { 
  validateRequired, 
  validateMaxLength, 
  validateEmail, 
  validatePassword 
} from '@/utils/validation';

interface AdminFormData {
  role: string;
  name: string;
  email: string;
  password: string;
}

export default function AdminRegistration() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState<AdminFormData>({
    role: '',
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<AdminFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // URLパラメータから値を取得してフォームに設定
    if (searchParams) {
      const urlData = {
        role: searchParams.get('role') || '',
        name: searchParams.get('name') || '',
        email: searchParams.get('email') || '',
        password: searchParams.get('password') || '',
      };
      
      // いずれかの値が存在する場合のみフォームデータを更新
      if (Object.values(urlData).some(value => value !== '')) {
        setFormData(urlData);
      }
    }
  }, [searchParams]);

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
        const roleError = validateRequired(value, '権限');
        if (roleError) {
          newErrors.role = roleError;
        } else {
          delete newErrors.role;
        }
        break;

      case 'name':
        const nameError = validateRequired(value, '氏名') || validateMaxLength(value, 50, '氏名');
        if (nameError) {
          newErrors.name = nameError;
        } else {
          delete newErrors.name;
        }
        break;

      case 'email':
        const emailError = validateRequired(value, 'メールアドレス') || validateMaxLength(value, 255, 'メールアドレス') || validateEmail(value);
        if (emailError) {
          newErrors.email = emailError;
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        const passwordError = validateRequired(value, 'パスワード') || validateMaxLength(value, 255, 'パスワード') || validatePassword(value);
        if (passwordError) {
          newErrors.password = passwordError;
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
    const roleError = validateRequired(formData.role, '権限');
    if (roleError) newErrors.role = roleError;

    const nameError = validateRequired(formData.name, '氏名') || validateMaxLength(formData.name, 50, '氏名');
    if (nameError) newErrors.name = nameError;

    const emailError = validateRequired(formData.email, 'メールアドレス') || validateMaxLength(formData.email, 255, 'メールアドレス') || validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validateRequired(formData.password, 'パスワード') || validateMaxLength(formData.password, 255, 'パスワード') || validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    if (validateAllFields()) {
      // 登録内容確認画面に遷移
      const queryParams = new URLSearchParams({
        role: formData.role,
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      
      router.push(`/admins/confirm?${queryParams.toString()}`);
    } else {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admins');
  };

  const _getRoleLabel = (role: string) => {
    switch (role) {
      case '1':
        return '管理者';
      case '2':
        return '一般';
      default:
        return '';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ページタイトル */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">管理者アカウント新規登録</h1>
            <p className="text-gray-600">
              新しい管理者アカウントを登録します
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

        {/* 登録フォーム */}
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
                placeholder="英数字混在で8文字以上"
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
                {isSubmitting ? '処理中...' : '登録内容を確認する'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}