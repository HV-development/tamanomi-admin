'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';

function SetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [accountInfo, setAccountInfo] = useState<{
    email?: string;
    displayName?: string;
  }>({});

  // トークン検証
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('無効なリンクです');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3002/api/v1/password/verify-token?token=${token}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          setError(
            errorData.error?.message || 'トークンが無効または期限切れです'
          );
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setAccountInfo({
          email: data.data.email,
          displayName: data.data.displayName,
        });
        setIsLoading(false);
      } catch (err) {
        console.error('トークン検証エラー:', err);
        setError('トークンの検証中にエラーが発生しました');
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const validatePassword = (pwd: string): string | null => {
    if (!pwd) {
      return 'パスワードを入力してください';
    }
    if (pwd.length < 8) {
      return 'パスワードは8文字以上で入力してください';
    }
    if (!/[A-Za-z]/.test(pwd)) {
      return 'パスワードには英字を含めてください';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'パスワードには数字を含めてください';
    }
    return null;
  };

  const validateConfirmPassword = (
    pwd: string,
    confirmPwd: string
  ): string | null => {
    if (!confirmPwd) {
      return '確認用パスワードを入力してください';
    }
    if (pwd !== confirmPwd) {
      return 'パスワードが一致しません';
    }
    return null;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const error = validatePassword(value);
    setValidationErrors((prev) => ({
      ...prev,
      password: error || undefined,
    }));

    // 確認用パスワードも再検証
    if (confirmPassword) {
      const confirmError = validateConfirmPassword(value, confirmPassword);
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: confirmError || undefined,
      }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    const error = validateConfirmPassword(password, value);
    setValidationErrors((prev) => ({
      ...prev,
      confirmPassword: error || undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // バリデーション
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(
      password,
      confirmPassword
    );

    if (passwordError || confirmPasswordError) {
      setValidationErrors({
        password: passwordError || undefined,
        confirmPassword: confirmPasswordError || undefined,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        'http://localhost:3002/api/v1/password/set-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(
          errorData.error?.message || 'パスワードの設定に失敗しました'
        );
        setIsSubmitting(false);
        return;
      }

      // 成功: ログインページにリダイレクト
      alert('パスワードが設定されました。ログインしてください。');
      router.push('/login');
    } catch (err) {
      console.error('パスワード設定エラー:', err);
      setError('パスワードの設定中にエラーが発生しました');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">トークンを検証中...</p>
        </div>
      </div>
    );
  }

  if (error && !accountInfo.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <Icon name="alert" size="lg" className="text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              リンクが無効です
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button variant="primary" onClick={() => router.push('/login')}>
              ログインページへ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              パスワード設定
            </h1>
            <p className="text-gray-600">
              {accountInfo.displayName && `${accountInfo.displayName} 様`}
            </p>
            <p className="text-sm text-gray-500">{accountInfo.email}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <Icon name="alert" size="sm" className="text-red-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* パスワード */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                新しいパスワード <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10 ${
                    validationErrors.password
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="8文字以上（英字・数字を含む）"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.password}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                • 8文字以上<br />
                • 英字を含む<br />
                • 数字を含む
              </p>
            </div>

            {/* 確認用パスワード */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                パスワード（確認用） <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10 ${
                    validationErrors.confirmPassword
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="パスワードを再入力"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? '設定中...' : 'パスワードを設定'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              ログインページは
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-green-600 hover:text-green-700 ml-1 underline"
              >
                こちら
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    }>
      <SetPasswordContent />
    </Suspense>
  );
}





