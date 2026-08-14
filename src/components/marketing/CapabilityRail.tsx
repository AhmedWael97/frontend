"use client";

import { useRef, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale } from "next-intl";

/**
 * Horizontal scroll-snap capability rail — drag or use the nav arrows.
 * Cards are rendered by the caller (server component) and passed as children,
 * since icon components (functions) can't cross the server/client boundary as props.
 */
export default function CapabilityRail({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const rtl = useLocale() === "ar";

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const amount = (rtl ? -1 : 1) * dir * (el.clientWidth * 0.8);
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex gap-px bg-[#262626] border border-[#262626] overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {children}
      </div>
      <div className="flex justify-end gap-px mt-px bg-[#262626] border-x border-b border-[#262626] w-fit ml-auto">
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className="bg-black hover:bg-[#171717] text-neutral-400 hover:text-white p-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className="bg-black hover:bg-[#171717] text-neutral-400 hover:text-white p-3 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
