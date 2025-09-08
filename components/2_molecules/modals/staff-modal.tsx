import { StaffForm } from '@/components/2_molecules/forms/staff-form';
import { StaffTable } from '@/components/3_organisms/tables/staff-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Staff } from '@/types/staff';
import type { StaffFormData } from '@/validations/staff-validation';
import { Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmationModal } from './delete-confirmation-modal';
import { EditModal } from './edit-modal';

interface StaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  officeName: string;
  staff: Staff[];
  loading?: boolean;
  error?: string | null;
  onDelete?: (staffId: string) => Promise<void>;
  onEdit?: (staffId: string, data: StaffFormData) => Promise<void>;
  onStatusToggle?: (staffId: string, status: Staff['status']) => Promise<void>;
}

export function StaffModal({
  open,
  onOpenChange,
  officeName,
  staff,
  loading = false,
  error,
  onDelete,
  onEdit,
  onStatusToggle,
}: StaffModalProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    staff: Staff | null;
    loading: boolean;
  }>({
    isOpen: false,
    staff: null,
    loading: false,
  });
  const [editState, setEditState] = useState<{
    isOpen: boolean;
    staff: Staff | null;
    loading: boolean;
  }>({
    isOpen: false,
    staff: null,
    loading: false,
  });

  const handleDeleteClick = (staffId: string) => {
    const staffMember = staff.find((s) => s.id === staffId);
    if (staffMember) {
      setDeleteConfirmation({
        isOpen: true,
        staff: staffMember,
        loading: false,
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.staff || !onDelete) return;

    try {
      setDeleteConfirmation((prev) => ({ ...prev, loading: true }));
      await onDelete(deleteConfirmation.staff.id);
      toast.success('職員を削除しました');
      setDeleteConfirmation({
        isOpen: false,
        staff: null,
        loading: false,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '削除に失敗しました');
      setDeleteConfirmation((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleEditClick = (staffId: string) => {
    const staffMember = staff.find((s) => s.id === staffId);
    if (staffMember) {
      setEditState({
        isOpen: true,
        staff: staffMember,
        loading: false,
      });
    }
  };

  const handleEditSubmit = async (data: StaffFormData) => {
    if (!editState.staff || !onEdit) return;

    try {
      setEditState((prev) => ({ ...prev, loading: true }));
      await onEdit(editState.staff.id, data);
      toast.success('職員情報を更新しました');
      setEditState({
        isOpen: false,
        staff: null,
        loading: false,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '更新に失敗しました');
      setEditState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleStatusToggle = async (staffId: string, status: Staff['status']) => {
    if (!onStatusToggle) return;

    try {
      await onStatusToggle(staffId, status);
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
                <Users className="h-5 w-5" />
                職員
              </div>
            </DialogTitle>
          </DialogHeader>

          <StaffTable
            staff={staff}
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
          !open && setDeleteConfirmation({ isOpen: false, staff: null, loading: false })
        }
        title="職員の削除"
        description="この職員を削除しますか？"
        itemName={deleteConfirmation.staff?.name || ''}
        onConfirm={handleDeleteConfirm}
        loading={deleteConfirmation.loading}
      />

      <EditModal
        open={editState.isOpen}
        onOpenChange={(open) =>
          !open && setEditState({ isOpen: false, staff: null, loading: false })
        }
        title="職員情報の編集"
      >
        <StaffForm
          staff={editState.staff}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditState({ isOpen: false, staff: null, loading: false })}
          loading={editState.loading}
        />
      </EditModal>
    </>
  );
}
