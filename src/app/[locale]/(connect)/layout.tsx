"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Eye } from "lucide-react";
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
  const { token, user } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) { setHydrated(true); return; }
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) router.replace(`/${locale}/auth/login`);
    else if (user && !user.email_verified_at) router.replace(`/${locale}/auth/verify-email`);
  }, [token, user, locale, hydrated, router]);

  if (!hydrated || !token) return null;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* No "Skip for now" — adding a working domain is mandatory before the
          dashboard is reachable at all (enforced server-side too, see the
          has_domain middleware), so there's nowhere useful to skip to. */}
      <header className="flex items-center justify-center px-5 sm:px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black tracking-tighter text-primary uppercase">EYE</span>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 pb-16">{children}</main>
    </div>
  );
}
