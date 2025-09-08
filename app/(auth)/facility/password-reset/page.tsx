import { RequestPasswordResetForm } from '@/components/2_molecules/forms/request-password-reset-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FacilityPasswordResetPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">施設管理者パスワードリセット</CardTitle>
        <CardDescription>
          施設管理者アカウントのメールアドレスを入力してください。パスワード再設定用のリンクを記載したメールを送信します。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RequestPasswordResetForm role="facility" />
      </CardContent>
    </Card>
  );
}
