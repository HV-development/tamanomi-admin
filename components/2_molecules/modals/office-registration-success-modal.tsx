'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { OfficeRegistrationResponse } from '@/types/facility-manager';
import { CheckCircle, Copy, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface OfficeRegistrationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrationData: OfficeRegistrationResponse | null;
  onGoToOfficeList: () => void;
}

export function OfficeRegistrationSuccessModal({
  isOpen,
  onClose,
  registrationData,
  onGoToOfficeList,
}: OfficeRegistrationSuccessModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (!registrationData) return null;

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label}をクリップボードにコピーしました`);
    } catch (error) {
      toast.error('コピーに失敗しました');
    }
  };

  const handleCopyAllInfo = async () => {
    const info = `事業所管理者ログイン情報
事業所名: ${registrationData.office.name}
管理者名: ${registrationData.manager.name}
メールアドレス: ${registrationData.manager.email}
仮パスワード: ${registrationData.manager.temporaryPassword}

※初回ログイン時にパスワードの変更が必要です。`;

    try {
      await navigator.clipboard.writeText(info);
      toast.success('ログイン情報をすべてコピーしました');
    } catch (error) {
      toast.error('コピーに失敗しました');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <DialogTitle className="text-green-700">事業所の登録が完了しました</DialogTitle>
          </div>
          <DialogDescription>
            事業所管理者のログイン情報が自動で発行されました。
            <br />
            この情報を管理者に共有してください。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <h3 className="font-semibold text-sm text-foreground">事業所情報</h3>
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-muted-foreground">事業所名</Label>
                <div className="font-medium">{registrationData.office.name}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-blue-50 p-4 space-y-3">
            <h3 className="font-semibold text-sm text-blue-900">管理者ログイン情報</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-blue-700">管理者名</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={registrationData.manager.name}
                    readOnly
                    className="bg-white text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyToClipboard(registrationData.manager.name, '管理者名')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-blue-700">メールアドレス（ログインID）</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={registrationData.manager.email}
                    readOnly
                    className="bg-white text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopyToClipboard(registrationData.manager.email, 'メールアドレス')
                    }
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-blue-700">仮パスワード</Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={registrationData.manager.temporaryPassword}
                      readOnly
                      className="bg-white text-sm pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopyToClipboard(
                        registrationData.manager.temporaryPassword,
                        'パスワード'
                      )
                    }
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-blue-200">
              <Button variant="outline" size="sm" onClick={handleCopyAllInfo} className="w-full">
                <Copy className="mr-2 h-3 w-3" />
                すべての情報をコピー
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-amber-100 p-1">
                <div className="h-2 w-2 rounded-full bg-amber-600" />
              </div>
              <div className="text-xs text-amber-800">
                <p className="font-medium">重要事項</p>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  <li>初回ログイン時にパスワードの変更が必要です</li>
                  <li>この情報は再表示できませんので、必ず保存してください</li>
                  <li>管理者へのログイン情報の共有をお忘れなく</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            閉じる
          </Button>
          <Button onClick={onGoToOfficeList} className="w-full sm:w-auto">
            事業所一覧に戻る
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
