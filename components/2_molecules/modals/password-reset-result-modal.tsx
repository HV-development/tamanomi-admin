import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Copy, Eye, EyeOff, Key } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PasswordResetResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  managerName: string;
  managerEmail: string;
  newPassword: string;
}

export function PasswordResetResultModal({
  open,
  onOpenChange,
  managerName,
  managerEmail,
  newPassword,
}: PasswordResetResultModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label}をクリップボードにコピーしました`);
    } catch (error) {
      toast.error('コピーに失敗しました');
    }
  };

  const copyCredentials = async () => {
    const credentials = `ログイン情報
メールアドレス: ${managerEmail}
パスワード: ${newPassword}`;

    try {
      await navigator.clipboard.writeText(credentials);
      toast.success('ログイン情報をクリップボードにコピーしました');
    } catch (error) {
      toast.error('コピーに失敗しました');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            パスワード再発行完了
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto">
              <Key className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">{managerName}</span>{' '}
              さんの新しいパスワードを発行しました
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="flex">
                <Input id="email" value={managerEmail} readOnly className="flex-1" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="ml-2"
                  onClick={() => copyToClipboard(managerEmail, 'メールアドレス')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">新しいパスワード</Label>
              <div className="flex">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    readOnly
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="ml-2"
                  onClick={() => copyToClipboard(newPassword, 'パスワード')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Button onClick={copyCredentials} className="w-full" variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              ログイン情報をまとめてコピー
            </Button>

            <Button onClick={() => onOpenChange(false)} className="w-full">
              閉じる
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• このパスワードは一時的なものです</p>
            <p>• 初回ログイン時にパスワードの変更を促してください</p>
            <p>• セキュリティのため、安全な方法で共有してください</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
