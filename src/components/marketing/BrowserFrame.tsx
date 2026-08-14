import type { ReactNode } from "react";

/** Shared "browser chrome" frame for product-preview mockups on marketing pages. */
export function BrowserFrame({ url, children, live = true }: { url: string; children: ReactNode; live?: boolean }) {
  return (
    <div className="relative z-10 rounded-none border border-[#262626] bg-[#0A0A0A] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#262626] bg-[#171717]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-neutral-700" />
          <div className="w-3 h-3 rounded-full bg-neutral-700" />
          <div className="w-3 h-3 rounded-full bg-neutral-700" />
        </div>
        <div className="flex-1 mx-4 h-6 rounded-none bg-black border border-[#262626] flex items-center px-3 gap-2">
          <span className="text-[11px] text-neutral-500 truncate" style={{ fontFamily: "var(--font-mono-marketing)" }}>{url}</span>
        </div>
        {live && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-none border border-green-500/30 bg-green-500/10 text-green-400" style={{ fontFamily: "var(--font-mono-marketing)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Sample data
          </span>
        )}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}
