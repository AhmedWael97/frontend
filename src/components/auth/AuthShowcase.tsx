"use client";

import { useTranslations } from "next-intl";
import { Radio, MousePointerClick, Sparkles, Lock, TrendingUp, ShieldCheck } from "lucide-react";

const mono = { fontFamily: "var(--font-mono-marketing, inherit)" };

/** Feature list shared by the desktop panel and the mobile strip. */
function useFeatures() {
  const t = useTranslations("auth.showcase");
  return [
    { icon: Radio, title: t("realtimeTitle"), desc: t("realtimeDesc") },
    { icon: MousePointerClick, title: t("replayTitle"), desc: t("replayDesc") },
    { icon: Sparkles, title: t("aiTitle"), desc: t("aiDesc") },
    { icon: TrendingUp, title: t("revenueTitle"), desc: t("revenueDesc") },
    { icon: Lock, title: t("privacyTitle"), desc: t("privacyDesc") },
  ];
}

/**
 * Rich brand/feature panel shown on the left of the auth card (desktop only).
 * Communicates EYE's value while the user signs up / logs in.
 */
export function AuthShowcase() {
  const t = useTranslations("auth");
  const ts = useTranslations("auth.showcase");
  const features = useFeatures();

  return (
    <div className="hidden lg:flex flex-col justify-between relative overflow-hidden p-10 xl:p-12 text-white bg-[#0A0A0A] border-r border-[#262626]">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-none border border-[#262626] bg-black">
            <ShieldCheck className="w-5 h-5 text-[#00E5FF]" />
          </span>
          <div>
            <div className="text-xl font-bold uppercase tracking-tighter leading-none">EYE<span className="text-[#00E5FF]">.</span></div>
            <div className="text-[11px] font-medium text-neutral-500" style={mono}>{t("tagline")}</div>
          </div>
        </div>

        <h2 className="mt-10 text-3xl xl:text-4xl font-bold leading-tight tracking-tight text-white">
          {ts("headline")}
        </h2>
        <p className="mt-3 text-sm text-neutral-400 leading-relaxed max-w-sm">
          {ts("subheadline")}
        </p>

        <ul className="mt-9 space-y-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex gap-3.5">
              <span className="mt-0.5 inline-flex shrink-0 items-center justify-center w-9 h-9 rounded-none border border-[#262626] bg-black text-[#00E5FF]">
                <Icon className="w-5 h-5" />
              </span>
              <div>
                <p className="text-sm font-bold leading-tight text-white">{title}</p>
                <p className="text-xs text-neutral-500 leading-snug mt-0.5">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 mt-10 inline-flex items-center gap-2 rounded-none border border-green-500/25 bg-green-500/10 px-4 py-2 text-xs font-semibold w-fit text-green-400" style={mono}>
        <ShieldCheck className="w-4 h-4" />
        {t("trialBadge")}
      </div>
    </div>
  );
}

/**
 * Compact "Why EYE" feature grid for mobile, rendered below the form so the
 * form stays the first thing visible on a phone while still selling the product.
 */
export function MobileFeatureStrip() {
  const ts = useTranslations("auth.showcase");
  const features = useFeatures();

  return (
    <div className="lg:hidden mt-7">
      <p className="text-center text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-3" style={mono}>
        {ts("whyTitle")}
      </p>
      <div className="grid grid-cols-2 gap-px bg-[#262626] border border-[#262626]">
        {features.slice(0, 4).map(({ icon: Icon, title }) => (
          <div
            key={title}
            className="flex items-center gap-2.5 bg-black px-3 py-2.5"
          >
            <span className="inline-flex shrink-0 items-center justify-center w-8 h-8 rounded-none border border-[#262626] text-[#00E5FF]">
              <Icon className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-white leading-tight">{title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
