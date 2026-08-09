"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Loader2 } from "lucide-react";
import { domainsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

/**
 * Old bookmarked/linked URL for the static fixture demo page. Now redirects
 * into the real sandbox (selects the seeded demo domain, sends them to the
 * real dashboard) instead of a separate hand-built page.
 */
export default function DemoDashboardRedirect() {
  const router = useRouter();
  const locale = useLocale();
  const { setSelectedDomainId } = useAuthStore();

  useEffect(() => {
    let cancelled = false;
    domainsApi.demo().then((r) => {
      if (cancelled) return;
      const demo = (r.data?.data ?? r.data) as { id: number };
      setSelectedDomainId(demo.id);
      router.replace(`/${locale}/dashboard`);
    }).catch(() => {
      router.replace(`/${locale}/dashboard`);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
}
