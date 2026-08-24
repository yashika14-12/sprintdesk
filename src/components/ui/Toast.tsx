import type { ToastItem } from './toastStore';

const VARIANT_CLASSES: Record<ToastItem['variant'], string> = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-gray-800',
};

export interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <div
      role="status"
      className={`flex items-center justify-between gap-3 rounded-md px-4 py-3 text-sm text-white shadow-lg ${VARIANT_CLASSES[toast.variant]}`}
    >
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="text-white/80 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
