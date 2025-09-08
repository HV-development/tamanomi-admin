import { ResetPasswordForm } from '@/components/2_molecules/forms/reset-password-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense } from 'react';

export default function CareManagerResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">ケアマネージャーパスワード再設定</CardTitle>
          <CardDescription>
            ケアマネージャーアカウントの新しいパスワードを入力してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm role="care-manager" redirectPath="/care-manager" />
        </CardContent>
      </Card>
    </Suspense>
  );
}
