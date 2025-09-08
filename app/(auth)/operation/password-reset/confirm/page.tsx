import { ResetPasswordForm } from '@/components/2_molecules/forms/reset-password-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense } from 'react';

export default function OperationResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">運営者パスワード再設定</CardTitle>
          <CardDescription>運営者アカウントの新しいパスワードを入力してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm role="operation" redirectPath="/operation" />
        </CardContent>
      </Card>
    </Suspense>
  );
}
