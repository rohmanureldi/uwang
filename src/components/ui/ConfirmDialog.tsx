import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-300 mb-6">{message}</p>
      <div className="flex gap-3">
        <Button
          onClick={onConfirm}
          variant={variant}
          className="flex-1"
        >
          {confirmText}
        </Button>
        <Button
          onClick={onClose}
          variant="secondary"
          className="flex-1"
        >
          {cancelText}
        </Button>
      </div>
    </Modal>
  );
}