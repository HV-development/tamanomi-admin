import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface PasswordResetConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  managerName: string;
  onConfirm: () => void;
  loading?: boolean;
}

export function PasswordResetConfirmationModal({
  open,
  onOpenChange,
  managerName,
  onConfirm,
  loading = false,
}: PasswordResetConfirmationModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <AlertDialogTitle>パスワード再発行の確認</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>以下の管理者のパスワードを再発行しますか？</p>
            <p className="font-medium text-gray-900">対象管理者: {managerName}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3">
              <p className="text-sm text-yellow-800">
                <strong>注意:</strong>
              </p>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                <li>• 新しいパスワードが生成されます</li>
                <li>• 現在のパスワードは無効になります</li>
                <li>• 管理者には新しいパスワードを通知する必要があります</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {loading ? '処理中...' : 'パスワードを再発行する'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
