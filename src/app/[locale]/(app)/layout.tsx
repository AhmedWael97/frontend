"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { AiChatBubble } from "@/components/AiChatBubble";
import { useAuthStore } from "@/store/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const { token, user } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // useAuthStore.persist is only available client-side
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace(`/${locale}/auth/login`);
      return;
    }
    if (user && !user.email_verified_at) {
      router.replace(`/${locale}/auth/verify-email`);
      return;
    }
    // New users who haven't added a domain yet → send them to domains setup
    // Only redirect when navigating away from settings pages so they can add a domain
    const isOnDomainsPage = pathname?.includes("/settings/domains");
    const isOnSettingsPage = pathname?.includes("/settings/");
    if (user?.onboarding && !user.onboarding.domain_added && !isOnDomainsPage && !isOnSettingsPage) {
      router.replace(`/${locale}/settings/domains?welcome=1`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user, locale, hydrated, pathname]);

  if (!hydrated || !token) return null;

  return (
    <div className="min-h-screen bg-surface">
      <AppSidebar />
      <div className="md:ltr:pl-64 md:rtl:pr-64 flex flex-col min-h-screen">
        <ImpersonationBanner />
        <AppHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <AiChatBubble />
    </div>
  );
}
