import { FacilityManagerForm } from '@/components/2_molecules/forms/facility-manager-form';
import { DeleteConfirmationModal } from '@/components/2_molecules/modals/delete-confirmation-modal';
import { EditModal } from '@/components/2_molecules/modals/edit-modal';
import { PasswordResetConfirmationModal } from '@/components/2_molecules/modals/password-reset-confirmation-modal';
import { PasswordResetResultModal } from '@/components/2_molecules/modals/password-reset-result-modal';
import { FacilityManagerTable } from '@/components/3_organisms/tables/facility-manager-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { FacilityManager } from '@/types/facility-manager';
import type { FacilityManagerFormData } from '@/validations/facility-manager-validation';
import { UserCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface FacilityManagersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  officeName: string;
  managers: FacilityManager[];
  loading?: boolean;
  error?: string | null;
  onPasswordReset: (managerId: string) => Promise<{
    success: boolean;
    message: string;
    newPassword: string;
    manager: FacilityManager;
  }>;
  onDelete?: (managerId: string) => Promise<void>;
  onEdit?: (managerId: string, data: FacilityManagerFormData) => Promise<void>;
  onStatusToggle?: (managerId: string, status: FacilityManager['status']) => Promise<void>;
}

export function FacilityManagersModal({
  open,
  onOpenChange,
  officeName,
  managers,
  loading = false,
  error,
  onPasswordReset,
  onDelete,
  onEdit,
  onStatusToggle,
}: FacilityManagersModalProps) {
  const [passwordResetResult, setPasswordResetResult] = useState<{
    manager: FacilityManager;
    newPassword: string;
  } | null>(null);
  const [passwordResetConfirmation, setPasswordResetConfirmation] = useState<{
    isOpen: boolean;
    manager: FacilityManager | null;
    loading: boolean;
  }>({
    isOpen: false,
    manager: null,
    loading: false,
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    manager: FacilityManager | null;
    loading: boolean;
  }>({
    isOpen: false,
    manager: null,
    loading: false,
  });
  const [editState, setEditState] = useState<{
    isOpen: boolean;
    manager: FacilityManager | null;
    loading: boolean;
  }>({
    isOpen: false,
    manager: null,
    loading: false,
  });

  const handlePasswordResetClick = (managerId: string) => {
    const manager = managers.find((m) => m.id === managerId);
    if (manager) {
      setPasswordResetConfirmation({
        isOpen: true,
        manager,
        loading: false,
      });
    }
  };

  const handlePasswordResetConfirm = async () => {
    if (!passwordResetConfirmation.manager) return;

    try {
      setPasswordResetConfirmation((prev) => ({ ...prev, loading: true }));
      const result = await onPasswordReset(passwordResetConfirmation.manager.id);
      setPasswordResetResult({
        manager: result.manager,
        newPassword: result.newPassword,
      });
      setPasswordResetConfirmation({
        isOpen: false,
        manager: null,
        loading: false,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'パスワード再発行に失敗しました');
      setPasswordResetConfirmation((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteClick = (managerId: string) => {
    const manager = managers.find((m) => m.id === managerId);
    if (manager) {
      setDeleteConfirmation({
        isOpen: true,
        manager,
        loading: false,
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.manager || !onDelete) return;

    try {
      setDeleteConfirmation((prev) => ({ ...prev, loading: true }));
      await onDelete(deleteConfirmation.manager.id);
      toast.success('管理者を削除しました');
      setDeleteConfirmation({
        isOpen: false,
        manager: null,
        loading: false,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '削除に失敗しました');
      setDeleteConfirmation((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleEditClick = (managerId: string) => {
    const manager = managers.find((m) => m.id === managerId);
    if (manager) {
      setEditState({
        isOpen: true,
        manager,
        loading: false,
      });
    }
  };

  const handleEditSubmit = async (data: FacilityManagerFormData) => {
    if (!editState.manager || !onEdit) return;

    try {
      setEditState((prev) => ({ ...prev, loading: true }));
      await onEdit(editState.manager.id, data);
      toast.success('管理者情報を更新しました');
      setEditState({
        isOpen: false,
        manager: null,
        loading: false,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '更新に失敗しました');
      setEditState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleStatusToggle = async (managerId: string, status: FacilityManager['status']) => {
    if (!onStatusToggle) return;

    try {
      await onStatusToggle(managerId, status);
      toast.success('ステータスを更新しました');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ステータス更新に失敗しました');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                事業所管理者
              </div>
            </DialogTitle>
          </DialogHeader>

          <FacilityManagerTable
            managers={managers}
            loading={loading}
            error={error}
            onPasswordReset={handlePasswordResetClick}
            onEdit={onEdit ? handleEditClick : undefined}
            onDelete={onDelete ? handleDeleteClick : undefined}
            onStatusToggle={onStatusToggle ? handleStatusToggle : undefined}
          />
        </DialogContent>
      </Dialog>

      <PasswordResetConfirmationModal
        open={passwordResetConfirmation.isOpen}
        onOpenChange={(open) =>
          !open && setPasswordResetConfirmation({ isOpen: false, manager: null, loading: false })
        }
        managerName={passwordResetConfirmation.manager?.name || ''}
        onConfirm={handlePasswordResetConfirm}
        loading={passwordResetConfirmation.loading}
      />

      <PasswordResetResultModal
        open={!!passwordResetResult}
        onOpenChange={(open) => !open && setPasswordResetResult(null)}
        managerName={passwordResetResult?.manager.name || ''}
        managerEmail={passwordResetResult?.manager.email || ''}
        newPassword={passwordResetResult?.newPassword || ''}
      />

      <DeleteConfirmationModal
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) =>
          !open && setDeleteConfirmation({ isOpen: false, manager: null, loading: false })
        }
        title="管理者の削除"
        description="この管理者を削除しますか？"
        itemName={deleteConfirmation.manager?.name || ''}
        onConfirm={handleDeleteConfirm}
        loading={deleteConfirmation.loading}
      />

      <EditModal
        open={editState.isOpen}
        onOpenChange={(open) =>
          !open && setEditState({ isOpen: false, manager: null, loading: false })
        }
        title="管理者情報の編集"
      >
        <FacilityManagerForm
          manager={editState.manager}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditState({ isOpen: false, manager: null, loading: false })}
          loading={editState.loading}
        />
      </EditModal>
    </>
  );
}
