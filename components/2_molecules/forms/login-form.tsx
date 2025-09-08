'use client';

import { Logo } from '@/components/1_atoms/common/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import type { LoginFormData } from '@/types/auth';
import { loginFormSchema } from '@/validations/auth-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { InputField, PasswordField } from './form-field';

interface LoginFormProps {
  roleName: string;
  redirectPath: string;
}

export function LoginForm({ roleName, redirectPath }: LoginFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (data: LoginFormData) => {
    setError('');
    setLoading(true);

    try {
      // ここで実際の認証処理を呼び出す (今回はモック)
      // console.log(`Login attempt for ${roleName} with email: ${data.email}`);

      // 簡単なバリデーション（実際の実装では適切な認証処理を行う）
      if (data.email && data.password) {
        // 認証成功後、指定されたパスにリダイレクト
        router.push(redirectPath);
      } else {
        setError('メールアドレスとパスワードを入力してください。');
      }
    } catch (err) {
      setError('ログインに失敗しました。再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordResetPath = () => {
    if (redirectPath === '/operation') {
      return '/operation/password-reset';
    } else if (redirectPath === '/facility') {
      return '/facility/password-reset';
    }
    return '/404';
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* ロゴ */}
      <div className="flex justify-center">
        <Logo size="lg" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{roleName} ログイン</CardTitle>
          <CardDescription>
            メールアドレスとパスワードを入力してログインしてください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <InputField
                name="email"
                label="メールアドレス"
                type="email"
                placeholder="mail@example.com"
                required
              />

              <div className="space-y-2">
                <PasswordField name="password" label="パスワード" required />
                <Link
                  href={getPasswordResetPath()}
                  className="ml-auto inline-block text-sm underline"
                >
                  パスワードをお忘れですか？
                </Link>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'ログイン中...' : 'ログイン'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
