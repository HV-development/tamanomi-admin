'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';

interface PasswordResetSuccessProps {
  role: 'operation' | 'facility' | 'care-manager';
}

export function PasswordResetSuccess({ role }: PasswordResetSuccessProps) {
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

  const getLoginPath = () => {
    switch (role) {
      case 'operation':
        return '/operation/login';
      case 'facility':
        return '/facility/login';
      case 'care-manager':
        return '/care-manager/login';
      default:
        return '/';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* 成功メッセージカード */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center space-y-4">
        {/* チェックアイコン */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
          </div>
        </div>

        {/* メッセージ */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-green-900">パスワード更新完了</h2>
          <p className="text-green-700 leading-relaxed">
            {getRoleLabel()}アカウントのパスワードが正常に更新されました。
          </p>
        </div>
      </div>

      {/* ログインボタン */}
      <Button
        asChild
        className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 text-base font-medium"
      >
        <Link href={getLoginPath()}>{getRoleLabel()}ログインページへ</Link>
      </Button>
    </div>
  );
}
