import { create } from "zustand";

interface ToastItem {
  id: string;
  message: string;
  variant?: "default" | "success" | "error";
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  add: (t: Omit<ToastItem, "id">) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (t) => {
    const id = Math.random().toString(36).slice(2, 9);
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
      t.duration ?? 4000
    );
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

/** Call this anywhere — no hook required */
export const toast = {
  success: (message: string) =>
    useToastStore.getState().add({ message, variant: "success" }),
  error: (message: string) =>
    useToastStore.getState().add({ message, variant: "error" }),
  info: (message: string) =>
    useToastStore.getState().add({ message, variant: "default" }),
};
