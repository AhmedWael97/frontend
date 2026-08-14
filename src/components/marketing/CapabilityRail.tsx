"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight, type LucideIcon } from "lucide-react";
import { useLocale } from "next-intl";

export interface CapabilityItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

/** Horizontal scroll-snap capability rail — drag or use the nav arrows. Replaces the generic centered-icon 3-col grid. */
export default function CapabilityRail({ items }: { items: CapabilityItem[] }) {
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
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="snap-start shrink-0 w-[78%] sm:w-[42%] lg:w-[30%] bg-black p-6 flex flex-col"
            >
              <span className="text-[11px] text-neutral-600 mb-4" style={{ fontFamily: "var(--font-mono-marketing)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="w-11 h-11 rounded-none bg-[#171717] border border-[#262626] flex items-center justify-center mb-5 text-[#00E5FF]">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
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
