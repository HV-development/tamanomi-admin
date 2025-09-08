'use client';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import type { RequestPasswordResetFormData } from '@/types/auth';
import { requestPasswordResetSchema } from '@/validations/auth-validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { InputField } from './form-field';

interface RequestPasswordResetFormProps {
  role: 'operation' | 'facility' | 'care-manager';
  onSuccess?: () => void;
}

export function RequestPasswordResetForm({ role, onSuccess }: RequestPasswordResetFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const form = useForm<RequestPasswordResetFormData>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: {
      email: '',
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

  const handleSubmit = async (data: RequestPasswordResetFormData) => {
    setLoading(true);

    try {
      // ここで実際のパスワードリセット要求APIを呼び出す
      console.log(`Password reset request for ${getRoleLabel()} with email: ${data.email}`);

      // 模擬的な処理
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmittedEmail(data.email);
      setSubmitted(true);
      onSuccess?.();
    } catch (error) {
      console.error('Password reset request failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-6">
        {/* 成功アイコンと見出し */}
        <div className="space-y-3 border border-blue-200 bg-blue-50 rounded-lg p-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-blue-600 text-lg font-semibold">
            パスワードリセットのご案内を送信しました
          </h2>

          {/* 送信先メールアドレス */}
          <div className="bg-white border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-blue-700 font-medium text-sm">{submittedEmail}</span>
            </div>
          </div>

          <div className="text-left space-y-2 text-sm text-muted-foreground">
            <p className="font-medium">次の手順:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>メールボックスをご確認ください</li>
              <li>受信したメール内のリンクをクリック</li>
              <li>新しいパスワードを設定</li>
            </ol>
          </div>
        </div>

        {/* 有効期限の注意 */}
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-orange-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-orange-700 font-medium text-sm">
              リンクの有効期限は送信から24時間以内です
            </span>
          </div>
        </div>

        {/* 追加の注意事項 */}
        <div className="text-sm text-gray-500 space-y-2">
          <p className="font-medium text-red-500">メールが届かない場合は、以下をご確認ください</p>
          <ul className="text-left space-y-1 max-w-md mx-auto">
            <li>• メールはすぐに届かない場合があります</li>
            <li>• 迷惑メールフォルダに振り分けられていないか</li>
            <li>• メールアドレスに間違いがないか</li>
            <li>• 受信設定でブロックされていないか</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-2">
          <p className="text-muted-foreground">
            ご登録いただいているメールアドレスを入力してください。
            パスワードリセット用のリンクをお送りします。
          </p>
        </div>

        <InputField
          name="email"
          label="メールアドレス"
          type="email"
          placeholder="mail@example.com"
          required
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? '送信中...' : 'パスワードリセットのご案内を送信'}
        </Button>
      </form>
    </Form>
  );
}
