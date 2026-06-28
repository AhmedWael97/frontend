"use client";

import { useTranslations } from "next-intl";
import { Radio, MousePointerClick, Sparkles, Lock, TrendingUp, ShieldCheck } from "lucide-react";

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
    <div className="hidden lg:flex flex-col justify-between relative overflow-hidden p-10 xl:p-12 text-white bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-black/10 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 backdrop-blur">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <div className="text-xl font-black uppercase tracking-tighter leading-none">EYE</div>
            <div className="text-[11px] font-medium text-white/70">{t("tagline")}</div>
          </div>
        </div>

        <h2 className="mt-10 text-3xl xl:text-4xl font-black leading-tight tracking-tight">
          {ts("headline")}
        </h2>
        <p className="mt-3 text-sm text-white/80 leading-relaxed max-w-sm">
          {ts("subheadline")}
        </p>

        <ul className="mt-9 space-y-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex gap-3.5">
              <span className="mt-0.5 inline-flex shrink-0 items-center justify-center w-9 h-9 rounded-lg bg-white/15 backdrop-blur">
                <Icon className="w-5 h-5" />
              </span>
              <div>
                <p className="text-sm font-bold leading-tight">{title}</p>
                <p className="text-xs text-white/70 leading-snug mt-0.5">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 mt-10 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-4 py-2 text-xs font-semibold w-fit">
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
      <p className="text-center text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
        {ts("whyTitle")}
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {features.slice(0, 4).map(({ icon: Icon, title }) => (
          <div
            key={title}
            className="flex items-center gap-2.5 rounded-xl border border-outline-variant/20 bg-surface-container/40 px-3 py-2.5"
          >
            <span className="inline-flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
              <Icon className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-on-surface leading-tight">{title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
