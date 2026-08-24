import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export interface DeleteConfirmDialogProps {
  isOpen: boolean;
  taskTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({ isOpen, taskTitle, isDeleting, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Delete task">
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
        Are you sure you want to delete <span className="font-medium">{taskTitle}</span>? This cannot be undone.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isDeleting}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}
