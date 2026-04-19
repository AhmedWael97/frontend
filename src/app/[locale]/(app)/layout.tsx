"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { useAuthStore } from "@/store/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const locale = useLocale();
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
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user, locale, hydrated]);

  if (!hydrated || !token) return null;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-surface">
        <AppSidebar />
        <div className="ltr:pl-64 rtl:pr-64 flex flex-col min-h-screen">
          <AppHeader />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
      <ToastViewport />
    </ToastProvider>
  );
}
