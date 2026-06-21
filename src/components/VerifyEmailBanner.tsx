"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { MailWarning, X } from "lucide-react";
import { authApi } from "@/lib/api";
import { toast } from "@/lib/use-toast";
import { useAuthStore } from "@/store/auth";

/**
 * Non-blocking reminder shown at the top of the app when the signed-in user
 * hasn't verified their email yet. They can still use the dashboard — this just
 * nudges them and offers a one-click resend. Dismissable for the session.
 */
export function VerifyEmailBanner() {
  const { user } = useAuthStore();
  const locale = useLocale();
  const isAr = locale === "ar";
  const [dismissed, setDismissed] = useState(false);

  const resend = useMutation({
    mutationFn: () => authApi.resendVerification(),
    onSuccess: () =>
      toast.success(isAr ? "تم إرسال رابط التحقق إلى بريدك." : "Verification link sent to your email."),
    onError: () =>
      toast.error(isAr ? "تعذّر إرسال البريد، حاول لاحقًا." : "Couldn't send the email — try again shortly."),
  });

  // Only for signed-in, still-unverified users.
  if (dismissed || !user || user.email_verified_at) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-sm text-amber-700 dark:text-amber-400">
      <MailWarning className="w-4 h-4 shrink-0" />
      <span className="flex-1 min-w-[12rem]">
        {isAr
          ? "لم يتم تأكيد بريدك الإلكتروني بعد. يمكنك متابعة الاستخدام، لكن يُفضّل تأكيده."
          : "Your email isn't verified yet. You can keep using EYE, but please confirm it."}
      </span>
      <button
        type="button"
        onClick={() => resend.mutate()}
        disabled={resend.isPending}
        className="font-semibold underline underline-offset-2 hover:opacity-80 disabled:opacity-50"
      >
        {resend.isPending
          ? isAr ? "جارٍ الإرسال…" : "Sending…"
          : isAr ? "إعادة إرسال رابط التحقق" : "Resend verification email"}
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={isAr ? "إغلاق" : "Dismiss"}
        className="p-1 hover:opacity-70"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
