import { create } from "zustand";

export type ToastVariant = "info" | "success" | "warning" | "error";

export type Toast = {
  id: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  timeoutMs?: number; // auto-dismiss; undefined means manual
};

type ToastState = {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id"> & { id?: string }) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 9);

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = toast.id ?? uid();
    const entry: Toast = { variant: "info", ...toast, id };
    set((s) => ({ toasts: [...s.toasts, entry] }));
    const timeout = !entry.timeoutMs ? 3000 : entry.timeoutMs;

    setTimeout(() => get().dismiss(id), timeout);

    return id;
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

export const toast = {
  info: (
    message: string,
    opts: Partial<Omit<Toast, "message" | "variant">> = {}
  ) =>
    useToastStore
      .getState()
      .push({ message, variant: "info", timeoutMs: 4000, ...opts }),
  success: (
    message: string,
    opts: Partial<Omit<Toast, "message" | "variant">> = {}
  ) =>
    useToastStore
      .getState()
      .push({ message, variant: "success", timeoutMs: 3000, ...opts }),
  warning: (
    message: string,
    opts: Partial<Omit<Toast, "message" | "variant">> = {}
  ) =>
    useToastStore
      .getState()
      .push({ message, variant: "warning", timeoutMs: 5000, ...opts }),
  error: (
    message: string,
    opts: Partial<Omit<Toast, "message" | "variant">> = {}
  ) =>
    useToastStore
      .getState()
      .push({ message, variant: "error", timeoutMs: 6000, ...opts }),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
  clear: () => useToastStore.getState().clear(),
};

export default useToastStore;
