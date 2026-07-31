import type { ReactNode } from "react";

/** Shared "browser chrome" frame for product-preview mockups on marketing pages. */
export function BrowserFrame({ url, children, live = true }: { url: string; children: ReactNode; live?: boolean }) {
  return (
    <div className="relative z-10 rounded-2xl sm:rounded-3xl border border-outline-variant/30 bg-surface-container/85 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/15 dark:shadow-black/50 ring-1 ring-black/5 dark:ring-white/5">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-outline-variant/20 bg-surface-container-high/60">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
          <div className="w-3 h-3 rounded-full bg-green-400/70" />
        </div>
        <div className="flex-1 mx-4 h-6 rounded-md bg-surface-container-high flex items-center px-3 gap-2">
          <span className="text-[11px] text-on-surface-variant/80 font-mono truncate">{url}</span>
        </div>
        {live && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Sample data
          </span>
        )}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}
