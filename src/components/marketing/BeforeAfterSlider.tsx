"use client";

import { useState } from "react";

const BEFORE_DOTS = [
  { top: "20%", left: "92%" }, { top: "35%", left: "96%" }, { top: "50%", left: "90%" },
  { top: "62%", left: "97%" }, { top: "28%", left: "88%" }, { top: "70%", left: "94%" },
  { top: "45%", left: "99%" }, { top: "80%", left: "91%" },
];
const AFTER_DOTS = [
  { top: "18%", left: "22%" }, { top: "34%", left: "58%" }, { top: "48%", left: "14%" },
  { top: "60%", left: "70%" }, { top: "26%", left: "84%" }, { top: "68%", left: "38%" },
  { top: "42%", left: "46%" }, { top: "78%", left: "62%" },
];

/** Drag slider comparing the pre-fix (raw viewport pixels) vs post-fix (% of document) heatmap coordinate systems — real bug, real fix, see CLAUDE.md §5. */
export default function BeforeAfterSlider() {
  const [pct, setPct] = useState(50);

  return (
    <div className="relative rounded-none border border-[#262626] bg-black overflow-hidden select-none">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#262626] bg-[#171717]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
        </div>
        <span className="text-[11px] text-neutral-500 ltr:ml-2 rtl:mr-2" style={{ fontFamily: "var(--font-mono-marketing)" }}>
          heatmap.coords — drag to compare
        </span>
      </div>

      <div className="relative h-64 sm:h-72">
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        {/* BEFORE layer — clustered near the edge (raw viewport-pixel bug) */}
        <div className="absolute inset-0">
          {BEFORE_DOTS.map((d, i) => (
            <div key={i} className="absolute w-8 h-8 rounded-full bg-red-500 blur-md opacity-60" style={{ top: d.top, left: d.left }} />
          ))}
        </div>

        {/* AFTER layer — spread across the page (% of scrollWidth), revealed left of the handle */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pct}%)` }}>
          {AFTER_DOTS.map((d, i) => (
            <div key={i} className="absolute w-8 h-8 rounded-full bg-[#00E5FF] blur-md opacity-60" style={{ top: d.top, left: d.left }} />
          ))}
        </div>

        <span className="absolute top-3 ltr:left-3 rtl:right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-red-500/10 border border-red-500/30 text-red-400" style={{ fontFamily: "var(--font-mono-marketing)" }}>
          before · viewport px
        </span>
        <span className="absolute top-3 ltr:right-3 rtl:left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF]" style={{ fontFamily: "var(--font-mono-marketing)" }}>
          after · % of page
        </span>

        {/* Handle */}
        <div className="absolute inset-y-0 w-px bg-white/70 pointer-events-none" style={{ left: `${pct}%` }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center pointer-events-none"
          style={{ left: `${pct}%` }}
        >
          <div className="flex gap-0.5">
            <div className="w-0.5 h-3 bg-black" />
            <div className="w-0.5 h-3 bg-black" />
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
          aria-label="Compare before and after heatmap coordinates"
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
      </div>
    </div>
  );
}
