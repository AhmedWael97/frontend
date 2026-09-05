"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Eye, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth";

/**
 * Distraction-free connect wizard — no sidebar, no top nav, nothing to click
 * except the flow itself. Same auth guard as the main app (shared token),
 * but deliberately doesn't reuse the (app) layout's chrome: the whole point
 * is one path forward, not a dashboard full of other places to wander off to.
 */
export default function ConnectLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const router = useRouter();
  const { token, logout } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) { setHydrated(true); return; }
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    // Email verification is deliberately NON-blocking (see VerifyEmailBanner):
    // an unverified user keeps full access and is nudged by a banner. Bouncing
    // them here trapped new signups — the setup gate sends them to /connect and
    // this sent them straight back out to verify-email, with no way to finish
    // installing the tracker.
    if (!token) router.replace(`/${locale}/auth/login`);
  }, [token, locale, hydrated, router]);

  if (!hydrated || !token) return null;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="flex items-center justify-between px-5 sm:px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black tracking-tighter text-primary uppercase">EYE</span>
        </div>
        {/* Log out is the only way off this screen. No "Skip for now" and no
            Settings link: skipping the install is what produced accounts
            sitting on a dashboard of zeros, and a Settings link is a door into
            the rest of the app. Changing the domain is handled inside the
            wizard, where the pending one can be removed first — the free plan
            allows a single domain, so "add another" would just fail. */}
        <button
          type="button"
          onClick={() => {
            logout();
            router.replace(`/${locale}/auth/login`);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface"
        >
          <LogOut className="w-3.5 h-3.5" /> {locale === "ar" ? "تسجيل الخروج" : "Log out"}
        </button>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 pb-16">{children}</main>
    </div>
  );
}
