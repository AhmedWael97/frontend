"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Mail, Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";

function VerifyEmailContent() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const locale = useLocale();
  const isAr = locale === "ar";
  const hasError = searchParams?.get("error") === "invalid";

  const handleResend = async () => {
    setLoading(true);
    try {
      await authApi.resendVerification();
      setSent(true);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-md text-center">
      <div className="glass-card rounded-xl p-10 shadow-2xl border border-outline-variant/15 space-y-6">
        {hasError ? (
          <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-primary" />
          </div>
        )}

        <div>
          {hasError ? (
            <>
              <h1 className="text-2xl font-bold text-on-surface">Invalid link</h1>
              <p className="text-on-surface-variant text-sm mt-2">
                This verification link is invalid or has expired. Request a new one below.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-on-surface">Check your inbox</h1>
              <p className="text-on-surface-variant text-sm mt-2">
                We sent a verification link to your email address. Click the link to activate your account.
              </p>
            </>
          )}
        </div>

        {sent ? (
          <div className="flex items-center gap-2 justify-center text-emerald-600 dark:text-emerald-400 text-sm font-medium">
            <CheckCircle className="w-4 h-4" /> Email sent — check your inbox!
          </div>
        ) : (
          <Button variant="outline" onClick={handleResend} disabled={loading} className="gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Resend verification email
          </Button>
        )}

        <p className="text-xs text-on-surface-variant/60">
          Didn&apos;t get the email? Check your spam folder or click above to resend.
        </p>

        {/* Verification is not enforced, but this page should not read as an
            optional step either — "Verify later" invited people to treat a
            confirmed address as busywork, and it is what password resets and
            every alert depend on. The way onward is still here, phrased as
            carrying on with setup rather than as skipping something. */}
        <div className="pt-2 border-t border-outline-variant/15">
          <p className="text-sm text-on-surface">
            {isAr
              ? "تأكيد بريدك يحمي حسابك ويتيح استعادة كلمة المرور والتنبيهات."
              : "Confirming your address protects your account and switches on password resets and alerts."}
          </p>
          <Link
            href={`/${locale}/connect`}
            className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            {isAr ? "متابعة إعداد موقعك" : "Continue setting up your site"}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  // useSearchParams() must be inside a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
