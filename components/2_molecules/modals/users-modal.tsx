import { UserForm } from '@/components/2_molecules/forms/user-form';
import { UserTable } from '@/components/3_organisms/tables/user-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { User } from '@/types/user';
import type { UserFormData } from '@/validations/user-validation';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmationModal } from './delete-confirmation-modal';
import { EditModal } from './edit-modal';

interface UsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  officeName: string;
  users: User[];
  loading?: boolean;
  error?: string | null;
  onDelete?: (userId: string) => Promise<void>;
  onEdit?: (userId: string, data: UserFormData) => Promise<void>;
  onStatusToggle?: (userId: string, status: User['status']) => Promise<void>;
}

export function UsersModal({
  open,
  onOpenChange,
  officeName,
  users,
  loading = false,
  error,
  onDelete,
  onEdit,
  onStatusToggle,
}: UsersModalProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    user: User | null;
    loading: boolean;
  }>({
    isOpen: false,
    user: null,
    loading: false,
  });
  const [editState, setEditState] = useState<{
    isOpen: boolean;
    user: User | null;
    loading: boolean;
  }>({
    isOpen: false,
    user: null,
    loading: false,
  });

  const handleDeleteClick = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setDeleteConfirmation({
        isOpen: true,
        user,
        loading: false,
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.user || !onDelete) return;

    try {
      setDeleteConfirmation((prev) => ({ ...prev, loading: true }));
      await onDelete(deleteConfirmation.user.id);
      toast.success('利用者を削除しました');
      setDeleteConfirmation({
        isOpen: false,
        user: null,
        loading: false,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '削除に失敗しました');
      setDeleteConfirmation((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleEditClick = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setEditState({
        isOpen: true,
        user,
        loading: false,
      });
    }
  };

  const handleEditSubmit = async (data: UserFormData) => {
    if (!editState.user || !onEdit) return;

    try {
      setEditState((prev) => ({ ...prev, loading: true }));
      await onEdit(editState.user.id, data);
      toast.success('利用者情報を更新しました');
      setEditState({
        isOpen: false,
        user: null,
        loading: false,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '更新に失敗しました');
      setEditState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleStatusToggle = async (userId: string, status: User['status']) => {
    if (!onStatusToggle) return;

    try {
      await onStatusToggle(userId, status);
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
                <Heart className="h-5 w-5" />
                利用者
              </div>
            </DialogTitle>
          </DialogHeader>

          <UserTable
            users={users}
            loading={loading}
            error={error}
            onEdit={onEdit ? handleEditClick : undefined}
            onDelete={onDelete ? handleDeleteClick : undefined}
            onStatusToggle={onStatusToggle ? handleStatusToggle : undefined}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) =>
          !open && setDeleteConfirmation({ isOpen: false, user: null, loading: false })
        }
        title="利用者の削除"
        description="この利用者を削除しますか？"
        itemName={deleteConfirmation.user?.name || ''}
        onConfirm={handleDeleteConfirm}
        loading={deleteConfirmation.loading}
      />

      <EditModal
        open={editState.isOpen}
        onOpenChange={(open) =>
          !open && setEditState({ isOpen: false, user: null, loading: false })
        }
        title="利用者情報の編集"
      >
        <UserForm
          user={editState.user}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditState({ isOpen: false, user: null, loading: false })}
          loading={editState.loading}
        />
      </EditModal>
    </>
  );
}
