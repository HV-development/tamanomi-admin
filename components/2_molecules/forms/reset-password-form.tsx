'use client';

import { PasswordResetSuccess } from '@/components/2_molecules/cards/password-reset-success';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import type { ResetPasswordFormData } from '@/types/auth';
import { resetPasswordSchema } from '@/validations/auth-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PasswordField } from './form-field';

interface ResetPasswordFormProps {
  role: 'operation' | 'facility' | 'care-manager';
  redirectPath?: string;
}

export function ResetPasswordForm({ role, redirectPath = '/' }: ResetPasswordFormProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const getRoleLabel = () => {
    switch (role) {
      case 'operation':
        return '運営者';
      case 'facility':
        return '施設管理者';
      case 'care-manager':
        return 'ケアマネージャー';
      default:
        return '';
    }
  };

  const handleSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);

    try {
      // ここで実際のパスワードリセットAPIを呼び出す
      // console.log(`Resetting password for ${getRoleLabel()} with token:`, token);

      // 模擬的な処理
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmitted(true);
    } catch (error) {
      console.error('Password reset failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return <PasswordResetSuccess role={role} />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <PasswordField
          name="password"
          label="新しいパスワード"
          placeholder="8文字以上で入力してください"
          required
        />

        <PasswordField
          name="confirmPassword"
          label="新しいパスワード（確認）"
          placeholder="上記と同じパスワードを入力してください"
          required
        />

        <div className="text-xs text-muted-foreground">
          <p>パスワードの要件:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>8文字以上</li>
            <li>英数字を含むことを推奨</li>
          </ul>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? '更新中...' : 'パスワードをリセット'}
        </Button>
      </form>
    </Form>
  );
}
