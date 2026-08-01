"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { X, Eye, Check, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackInitiateCheckout } from "@/lib/track";

const DISMISS_KEY = "eye_signup_popup_dismissed_at";
const DISMISS_DAYS = 14;
const SHOW_DELAY_MS = 6000;

const COPY = {
  en: {
    badge: "30-day free trial",
    title: "Your website has a story.",
    titleAccent: "Start reading it — free.",
    body: "See live visitors, click heatmaps, and session replay on your own site in about 2 minutes. No credit card, no cookies.",
    cta: "Start free trial",
    dismiss: "Maybe later",
  },
  ar: {
    badge: "تجربة مجانية 30 يومًا",
    title: "لموقعك قصة.",
    titleAccent: "ابدأ بقراءتها — مجانًا.",
    body: "شاهد الزوّار المباشرين وخرائط النقر الحرارية وإعادة تشغيل الجلسات على موقعك خلال دقيقتين تقريبًا. بدون بطاقة ائتمان، بدون كوكيز.",
    cta: "ابدأ التجربة المجانية",
    dismiss: "ربما لاحقًا",
  },
} as const;

function isDismissedRecently(): boolean {
  if (typeof window === "undefined") return true;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (!dismissedAt) return false;
  const daysSince = (Date.now() - dismissedAt) / 86400000;
  return daysSince < DISMISS_DAYS;
}

export default function SignupPopup() {
  const locale = useLocale();
  const ar = locale === "ar";
  const t = COPY[ar ? "ar" : "en"];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Skip entirely for already-authenticated visitors, or anyone dismissed recently.
    if (localStorage.getItem("eye_token")) return;
    if (isDismissedRecently()) return;

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
          />
          <motion.div
            dir={ar ? "rtl" : "ltr"}
            role="dialog"
            aria-modal="true"
            className="fixed z-[101] inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-6 sm:end-6 sm:w-[380px] rounded-2xl border border-outline-variant/25 bg-surface shadow-2xl shadow-black/30 overflow-hidden"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <div className="relative isolate overflow-hidden p-5 sm:p-6">
              <div className="absolute inset-0 pointer-events-none" aria-hidden>
                <div className="absolute -top-10 ltr:-left-10 rtl:-right-10 w-40 h-40 rounded-full bg-indigo-500/25 blur-[60px]" />
                <div className="absolute -bottom-10 ltr:-right-10 rtl:-left-10 w-32 h-32 rounded-full bg-violet-500/20 blur-[50px]" />
              </div>

              <button
                onClick={dismiss}
                aria-label="Close"
                className="absolute top-3 ltr:right-3 rtl:left-3 z-10 p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
                    <Eye className="w-3.5 h-3.5 text-white" />
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <Check className="w-3 h-3" /> {t.badge}
                  </span>
                </div>

                <h3 className="text-lg font-black text-on-surface leading-snug mb-1.5">
                  {t.title}{" "}
                  <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                    {t.titleAccent}
                  </span>
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{t.body}</p>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/${locale}/auth/register`}
                    onClick={() => { trackInitiateCheckout(); dismiss(); }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2.5 text-sm font-bold transition-colors"
                  >
                    {t.cta} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </Link>
                  <button
                    onClick={dismiss}
                    className="shrink-0 px-3 py-2.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    {t.dismiss}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
