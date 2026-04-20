"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Reset your password</h1>
        <p className="text-on-surface-variant text-sm mt-1.5">Enter your email and we&apos;ll send a reset link.</p>
      </div>

      <div className="glass-card rounded-xl p-8 shadow-2xl border border-outline-variant/15">
        {sent ? (
          <div className="text-center py-4 space-y-3">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto" />
            <p className="text-on-surface font-medium">Check your email</p>
            <p className="text-sm text-on-surface-variant">We&apos;ve sent a password reset link to <strong>{email}</strong></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="rounded-lg bg-error-container/30 border border-error/20 px-4 py-3 text-sm text-error">{error}</div>}
            <div className="space-y-1.5">
              <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant ml-1">{t("email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="pl-9" required />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Reset Link
            </Button>
          </form>
        )}
      </div>

      <p className="text-center text-sm text-on-surface-variant mt-6">
        <Link href={`/${locale}/auth/login`} className="text-primary font-bold hover:text-secondary transition-colors">
          ← Back to Sign In
        </Link>
      </p>
    </div>
  );
}
