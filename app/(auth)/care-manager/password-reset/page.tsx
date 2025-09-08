import { RequestPasswordResetForm } from '@/components/2_molecules/forms/request-password-reset-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CareManagerPasswordResetPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">ケアマネージャーパスワードリセット</CardTitle>
        <CardDescription>
          ケアマネージャーアカウントのメールアドレスを入力してください。パスワード再設定用のリンクを記載したメールを送信します。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RequestPasswordResetForm role="care-manager" />
      </CardContent>
    </Card>
  );
}
