"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/lib/use-toast";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useSearchParams();
  const { setToken } = useAuthStore();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      toast.error("Google sign-in failed. Please try again.");
      router.replace(`/${locale}/auth/login`);
      return;
    }

    setToken(token);
    toast.success("Signed in with Google. Redirecting...");
    router.replace(`/${locale}/dashboard`);
  }, [locale, params, router, setToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-high p-10 text-center shadow-xl">
        <p className="text-base font-semibold text-on-surface">Signing you in with Google...</p>
      </div>
    </div>
  );
}
