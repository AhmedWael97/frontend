"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/lib/use-toast";
import { onboardingApi } from "@/api/onboarding";

const QUIZ_PENDING_KEY = "eye_quiz_pending";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useSearchParams();
  const { setToken, setUser } = useAuthStore();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      toast.error("Google sign-in failed. Please try again.");
      router.replace(`/${locale}/auth/login`);
      return;
    }

    setToken(token);

    // If they arrived here from the "get started" questionnaire (Continue
    // with Google), finish it now that we have an authenticated user — this
    // is the only way to attach the wizard's domains/plan to a Google-created
    // account, since Google's own redirect can't carry that state itself.
    const pending = localStorage.getItem(QUIZ_PENDING_KEY);
    if (pending) {
      localStorage.removeItem(QUIZ_PENDING_KEY);
      onboardingApi
        .submitQuiz(JSON.parse(pending))
        .then((r) => {
          const data = r.data?.data ?? r.data;
          setUser(data.user);
          toast.success(`Signed in — ${data.plan?.name ?? "your plan"} activated, 1 month free!`);
          router.replace(`/${locale}/dashboard`);
        })
        .catch(() => {
          toast.success("Signed in with Google. Redirecting...");
          router.replace(`/${locale}/dashboard`);
        });
      return;
    }

    toast.success("Signed in with Google. Redirecting...");
    router.replace(`/${locale}/dashboard`);
  }, [locale, params, router, setToken, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-high p-10 text-center shadow-xl">
        <p className="text-base font-semibold text-on-surface">Signing you in with Google...</p>
      </div>
    </div>
  );
}
