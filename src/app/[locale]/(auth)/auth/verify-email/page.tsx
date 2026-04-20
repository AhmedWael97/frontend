"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";

export default function VerifyEmailPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

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
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Check your inbox</h1>
          <p className="text-on-surface-variant text-sm mt-2">
            We sent a verification link to your email address. Click the link to activate your account.
          </p>
        </div>
        {sent ? (
          <div className="flex items-center gap-2 justify-center text-green-700 dark:text-green-400 text-sm font-medium">
            <CheckCircle className="w-4 h-4" /> Email resent!
          </div>
        ) : (
          <Button variant="outline" onClick={handleResend} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Resend verification email
          </Button>
        )}
      </div>
    </div>
  );
}
