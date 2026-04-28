"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";

export default function VerifyEmailPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
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
      </div>
    </div>
  );
}
