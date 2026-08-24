export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

let toasts: ToastItem[] = [];
let nextId = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): ToastItem[] {
  return toasts;
}

export function addToast(message: string, variant: ToastVariant = 'info', duration = 4000): string {
  const id = String(nextId++);
  toasts = [...toasts, { id, message, variant }];
  emit();

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }

  return id;
}

export function removeToast(id: string): void {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

export function __resetToastStore(): void {
  toasts = [];
  nextId = 0;
}
