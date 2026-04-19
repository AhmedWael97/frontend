"use client";

import {
  ToastProvider, ToastViewport, Toast, ToastTitle, ToastClose,
} from "@/components/ui/toast";
import { useToastStore } from "@/lib/use-toast";

export function Toaster() {
  const { toasts, remove } = useToastStore();

  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant}
          open
          onOpenChange={(open) => { if (!open) remove(t.id); }}
        >
          <ToastTitle>{t.message}</ToastTitle>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
