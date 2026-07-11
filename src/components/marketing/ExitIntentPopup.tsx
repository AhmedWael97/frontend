"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Gift, CheckCircle2 } from "lucide-react";
import client from "@/api/client";
import { useAuthStore } from "@/store/auth";

const SHOWN_KEY = "_eye_exit_shown";
const TIME_FALLBACK_MS = 45000;
const SCROLL_DEEP_RATIO = 0.5;
const SCROLL_UP_JUMP_PX = 60;
const NEAR_TOP_PX = 400;

/**
 * Exit-intent popup — landing + pricing only, guests only, once per session.
 * Desktop: classic mouseleave-toward-tab-bar. Mobile (~95% of traffic):
 * true exit-intent doesn't exist, so we approximate — scrolled past 50% of
 * the page, then scrolled back up fast near the top (about to hit
 * back/close) — plus a 45s time-on-page fallback so it isn't desktop-only.
 */
export default function ExitIntentPopup() {
  const locale = useLocale();
  const ar = locale === "ar";
  const pathname = usePathname();
  const { token } = useAuthStore();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const maxScrollRatio = useRef(0);
  const lastScrollY = useRef(0);
  const triggered = useRef(false);

  const eligiblePath = pathname === `/${locale}` || pathname === `/${locale}/pricing`;

  useEffect(() => {
    if (!eligiblePath || token) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SHOWN_KEY)) return;

    const trigger = () => {
      if (triggered.current) return;
      triggered.current = true;
      sessionStorage.setItem(SHOWN_KEY, "1");
      setOpen(true);
      cleanup();
    };

    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) trigger();
    };

    const onScroll = () => {
      const doc = document.documentElement;
      const ratio = (window.scrollY + window.innerHeight) / Math.max(1, doc.scrollHeight);
      maxScrollRatio.current = Math.max(maxScrollRatio.current, ratio);
      const jumpedUp = lastScrollY.current - window.scrollY > SCROLL_UP_JUMP_PX;
      if (maxScrollRatio.current >= SCROLL_DEEP_RATIO && jumpedUp && window.scrollY < NEAR_TOP_PX) {
        trigger();
      }
      lastScrollY.current = window.scrollY;
    };

    const timer = window.setTimeout(trigger, TIME_FALLBACK_MS);

    function cleanup() {
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    }

    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("scroll", onScroll, { passive: true });
    return cleanup;
  }, [eligiblePath, token]);

  const submit = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError(ar ? "أدخل بريدًا إلكترونيًا صحيحًا." : "Enter a valid email.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await client.post("/marketing/exit-intent", { email });
      setDone(true);
    } catch (e: any) {
      setError(e?.message ?? (ar ? "تعذّر الإرسال." : "Could not send."));
    } finally {
      setSubmitting(false);
    }
  };

  if (!eligiblePath || token) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md" dir={ar ? "rtl" : "ltr"}>
        <DialogHeader>
          <div className="w-11 h-11 rounded-full bg-indigo-500/10 flex items-center justify-center mb-2">
            <Gift className="w-5 h-5 text-indigo-500" />
          </div>
          <DialogTitle>{ar ? "قبل أن تذهب…" : "Before you go…"}</DialogTitle>
          <DialogDescription>
            {ar
              ? "اترك بريدك ونرسل لك كود خصم 10% لتجربة EYE — بدون التزام، استخدمه متى شئت."
              : "Leave your email and we'll send you a 10% discount code for EYE — no rush, use it whenever you're ready."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          {done ? (
            <p className="flex items-center gap-2 text-sm text-emerald-500 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              {ar ? "تحقق من بريدك الوارد!" : "Check your inbox!"}
            </p>
          ) : (
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={ar ? "بريدك الإلكتروني" : "you@company.com"}
                className="w-full h-11 rounded-lg border border-outline-variant/30 bg-surface px-3 text-base sm:text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {error && <p className="text-xs text-rose-400">{error}</p>}
              <Button onClick={submit} disabled={submitting || !email.trim()} className="w-full gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                {ar ? "أرسل لي الكود" : "Send me the code"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
