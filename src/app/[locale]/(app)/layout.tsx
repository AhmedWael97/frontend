"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { VerifyEmailBanner } from "@/components/VerifyEmailBanner";
import { FeedbackModal } from "@/components/FeedbackModal";
import { NpsWidget } from "@/components/NpsWidget";
import { TourGuide } from "@/components/onboarding/TourGuide";
import { SandboxBanner } from "@/components/SandboxBanner";
import { useAuthStore } from "@/store/auth";
import { useDemoDomain } from "@/lib/useDemoDomain";
import { useSetupGate } from "@/lib/useSetupGate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const { token, user, selectedDomainId } = useAuthStore();
  const demo = useDemoDomain();
  const { needsSetup } = useSetupGate();
  const isDemoSelected = !!demo && selectedDomainId === demo.id;
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
    // Email verification is NON-blocking: unverified users can still use the
    // dashboard. They're nudged via <VerifyEmailBanner /> instead of being
    // redirected to the verify-email page.
    // Setup gate. Previously this only asked whether a domain had been ADDED,
    // so anyone who typed a URL landed on a dashboard of zeros and — having
    // watched the free audit produce real results during signup — never
    // realised a tag still had to go on their site. The gate now holds until an
    // event has actually arrived.
    //
    // Settings stays reachable throughout: the way out of this screen is to
    // finish the install, swap the domain, sort out billing, or log out, and
    // none of those should be behind the thing being gated. The demo sandbox is
    // exempt so the product can still be evaluated before installing.
    const isOnSettingsPage = pathname?.includes("/settings/");
    const isOnConnectPage = pathname?.includes("/connect");
    if (needsSetup && !isOnSettingsPage && !isOnConnectPage && !isDemoSelected) {
      router.replace(`/${locale}/connect`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user, locale, hydrated, pathname, isDemoSelected, needsSetup]);

  if (!hydrated || !token) return null;

  return (
    <div className="min-h-screen bg-surface">
      <div className="print:hidden"><AppSidebar /></div>
      <div className="md:ltr:pl-64 md:rtl:pr-64 print:!pl-0 print:!pr-0 flex flex-col min-h-screen overflow-x-clip">
        <div className="print:hidden">
          <ImpersonationBanner />
          <VerifyEmailBanner />
          <SandboxBanner />
          <AppHeader />
        </div>
        <main className="flex-1 p-6 print:p-0">{children}</main>
      </div>
      <FeedbackModal />
      <NpsWidget />
      <TourGuide />
    </div>
  );
}
