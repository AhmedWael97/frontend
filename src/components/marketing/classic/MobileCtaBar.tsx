"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

/**
 * Sticky bottom CTA for mobile only. Appears once the visitor scrolls past the
 * hero, so the "Start free" action is always one tap away no matter how far
 * they scroll — directly counters the "excessive scrolling, never converts"
 * pattern seen in EYE's own analytics. Hidden on md+ (desktop has the navbar CTA).
 */
export default function MobileCtaBar() {
  const locale = useLocale();
  const t = useTranslations("landing");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`md:hidden fixed bottom-0 inset-x-0 z-40 p-3 transition-transform duration-300 ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="rounded-2xl bg-surface/90 backdrop-blur-xl border border-outline-variant/20 shadow-lg shadow-black/20 p-2">
        <Link href={`/${locale}/auth/register`}>
          <span className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-base">
            {t("nav.startFree")} — {t("hero.trustFree")}
            <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>
    </div>
  );
}
