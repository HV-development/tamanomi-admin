'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../atoms/Button';
import Logo from '../atoms/Logo';

interface LoginFormData {
  id: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<LoginFormData>({
    id: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // リアルタイムバリデーション
    validateField(field, value);
  };

  const validateField = (field: keyof LoginFormData, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'id':
        if (!value.trim()) {
          newErrors.id = 'IDを入力してください';
        } else if (value.length > 255) {
          newErrors.id = 'IDは255文字以内で入力してください';
        } else if (!/^[A-Za-z0-9]+$/.test(value)) {
          newErrors.id = 'IDは英数字のみで入力してください';
        } else {
          delete newErrors.id;
        }
        break;

      case 'password':
        if (!value.trim()) {
          newErrors.password = 'パスワードを入力してください';
        } else if (value.length > 255) {
          newErrors.password = 'パスワードは255文字以内で入力してください';
        } else if (value.length < 8) {
          newErrors.password = 'パスワードは8文字以上で入力してください';
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
  };

  const validateAllFields = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    // 必須チェック
    if (!formData.id.trim()) {
      newErrors.id = 'IDを入力してください';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'パスワードを入力してください';
    }

    // 文字数チェック
    if (formData.id.length > 255) {
      newErrors.id = 'IDは255文字以内で入力してください';
    }
    if (formData.password.length > 255) {
      newErrors.password = 'パスワードは255文字以内で入力してください';
    } else if (formData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上で入力してください';
    }

    // フォーマットチェック
    if (formData.id && !/^[A-Za-z0-9]+$/.test(formData.id)) {
      newErrors.id = 'IDは英数字のみで入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    setIsSubmitting(true);
    
    if (validateAllFields()) {
      try {
        // 認証処理（実際はAPIコール）
        console.log('ログイン処理:', formData);
        
        // 簡単な認証チェック（実際の実装では適切な認証APIを使用）
        if (formData.id === 'admin' && formData.password === 'password123') {
          // 認証成功
          // クーポン一覧画面に遷移
          router.push('/coupons');
        } else {
          // 認証失敗
          alert('IDまたはパスワードが正しくありません');
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error('ログインエラー:', error);
        alert('ログインに失敗しました');
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          {/* ロゴ */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>
          
          {/* ページタイトル */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">ログイン</h1>
          </div>
        </div>

        {/* ログインフォーム */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-6">
            {/* ID */}
            <div>
              <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-2">
                ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="id"
                placeholder="IDを入力（英数字のみ、最大255文字）"
                value={formData.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
                onKeyPress={handleKeyPress}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.id ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={255}
                disabled={isSubmitting}
              />
              {errors.id && (
                <p className="mt-1 text-sm text-red-500">{errors.id}</p>
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
                placeholder="パスワードを入力（8文字以上、最大255文字）"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onKeyPress={handleKeyPress}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={255}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* ログインボタン */}
            <div className="pt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={handleLogin}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'ログイン中...' : 'ログイン'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}