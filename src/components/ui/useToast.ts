import { useCallback, useSyncExternalStore } from 'react';
import { addToast, getSnapshot, removeToast, subscribe, type ToastVariant } from './toastStore';

export function useToast() {
  const toasts = useSyncExternalStore(subscribe, getSnapshot);

  const showToast = useCallback(
    (message: string, variant?: ToastVariant, duration?: number) => addToast(message, variant, duration),
    [],
  );

  const dismissToast = useCallback((id: string) => removeToast(id), []);

  return { toasts, showToast, dismissToast };
}
