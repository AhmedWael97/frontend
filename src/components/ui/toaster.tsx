"use client";

import { useToastStore } from "@/lib/use-toast";
import { X, CheckCircle, AlertCircle } from "lucide-react";

export function Toaster() {
  const { toasts, remove } = useToastStore();

  if (!toasts.length) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={[
            "flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl border pointer-events-auto",
            "min-w-[280px] max-w-sm transition-all",
            t.variant === "error"
              ? "bg-red-950 border-red-500/40 text-red-100"
              : t.variant === "success"
              ? "bg-green-950 border-green-500/40 text-green-100"
              : "bg-gray-900 border-gray-700 text-gray-100",
          ].join(" ")}
        >
          {t.variant === "error" && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />}
          {t.variant === "success" && <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-green-400" />}
          <span className="flex-1 text-sm font-medium leading-snug">{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity mt-0.5"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
