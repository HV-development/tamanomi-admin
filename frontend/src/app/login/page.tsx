'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/atoms/Button';
import Logo from '@/components/atoms/Logo';
import { useAuth } from '@/components/contexts/auth-context';
import { type AdminLoginInput, adminLoginSchema } from '@hv-development/schemas';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

type LoginFormData = AdminLoginInput;

// SearchParamsを使用する部分を分離
function LoginFormWithParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const { login } = auth || {};
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // セッション切れメッセージの表示
  useEffect(() => {
    const sessionExpired = searchParams.get('session');
    if (sessionExpired === 'expired') {
      setLoginError('セッションの有効期限が切れました。再度ログインしてください。');
      setIsSessionExpired(true);
      // クエリは残しておく（リダイレクト連鎖を防止）
    }
  }, [searchParams]);

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev: LoginFormData) => ({
      ...prev,
      [field]: value
    }));
    
    // ログインエラーをクリア
    if (loginError) {
      setLoginError('');
      setIsSessionExpired(false);
    }
    
    // リアルタイムバリデーション
    validateField(field, value);
  };

  const validateField = (field: keyof LoginFormData, value: string) => {
    const newErrors = { ...errors };

    try {
      // Zodスキーマを使用した個別フィールドバリデーション
      const fieldSchema = adminLoginSchema.shape[field];
      fieldSchema.parse(value);
      delete newErrors[field];
    } catch (error) {
      if (error instanceof Error && 'errors' in error) {
        const zodError = error as { errors: Array<{ message: string }> };
        newErrors[field] = zodError.errors[0]?.message || 'バリデーションエラー';
      }
    }

    setErrors(newErrors);
  };

  const validateAllFields = (): boolean => {
    try {
      // Zodスキーマを使用した全フィールドバリデーション
      adminLoginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Error && 'errors' in error) {
        const zodError = error as { errors: Array<{ path: string[]; message: string }> };
        const newErrors: Partial<LoginFormData> = {};
        
        zodError.errors.forEach((err) => {
          const field = err.path[0] as keyof LoginFormData;
          if (field) {
            newErrors[field] = err.message;
          }
        });
        
        setErrors(newErrors);
        return false;
      }
      
      return false;
    }
  };

  const handleLogin = async () => {
    setIsSubmitting(true);
    setLoginError(''); // エラーをクリア
    setIsSessionExpired(false); // セッション切れフラグもクリア
    
    if (validateAllFields()) {
      try {
        console.log('🔑 LoginPage: Starting login process', formData.email);
        
        // login関数が利用可能かチェック
        if (!login) {
          throw new Error('認証システムが利用できません。ページを再読み込みしてください。');
        }
        
        // API経由でログイン
        await login({ email: formData.email, password: formData.password });
        console.log('✅ LoginPage: Login successful, preparing redirect...');
        const userDataStr = sessionStorage.getItem('userData') || localStorage.getItem('userData');
        
        // アカウントタイプに応じてリダイレクト先を決定
        let redirectPath = '/merchants';
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            if (userData.accountType === 'shop') {
              redirectPath = '/shops';
              console.log('🚀 LoginPage: Redirecting shop account to /shops');
            } else {
              console.log('🚀 LoginPage: Redirecting to /merchants');
            }
          } catch (error) {
            console.error('Failed to parse user data:', error);
          }
        }
        
        // 認証成功時はアカウントタイプに応じた画面に遷移
        router.push(redirectPath);
      } catch (error: unknown) {
        console.error('❌ LoginPage: Login error', error);
        
        // エラーメッセージを設定
        let errorMessage = 'メールアドレスまたはパスワードが正しくありません';
        
        if (error && typeof error === 'object' && 'response' in error) {
          const errorWithResponse = error as { response?: { data?: { error?: { message?: string } } } };
          if (errorWithResponse.response?.data?.error?.message) {
            errorMessage = errorWithResponse.response.data.error.message;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        setLoginError(errorMessage);
        setIsSessionExpired(false); // ログイン失敗時はセッション切れではない
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
            {/* ログインエラー表示 */}
            {loginError && (
              <div className={`border rounded-lg p-4 ${
                isSessionExpired 
                  ? 'bg-yellow-50 border-yellow-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {isSessionExpired ? (
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm ${
                      isSessionExpired ? 'text-yellow-800' : 'text-red-800'
                    }`}>{loginError}</p>
                  </div>
                </div>
              </div>
            )}
            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                placeholder="メールアドレスを入力"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onKeyPress={handleKeyPress}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={255}
                disabled={isSubmitting}
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
                placeholder="パスワードを入力（8文字以上）"
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    }>
      <LoginFormWithParams />
    </Suspense>
  );
}
