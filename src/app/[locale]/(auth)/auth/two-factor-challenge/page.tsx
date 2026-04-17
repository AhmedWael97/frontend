"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function TwoFactorChallengePage() {
  const locale = useLocale();
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = useBackup ? { recovery_code: code } : { code };
      const res = await authApi.twoFactorChallenge(payload);
      setToken(res.data.token);
      setUser(res.data.user);
      router.push(`/${locale}/dashboard`);
    } catch (e: any) {
      setError(e.response?.data?.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-on-surface">Two-Factor Authentication</h1>
        <p className="text-on-surface-variant text-sm mt-1.5">
          {useBackup ? "Enter one of your 8-character backup codes." : "Enter the 6-digit code from your authenticator app."}
        </p>
      </div>

      <div className="glass-card rounded-xl p-8 shadow-2xl border border-outline-variant/15">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="rounded-lg bg-error-container/30 border border-error/20 px-4 py-3 text-sm text-error">{error}</div>}
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={useBackup ? "XXXXXXXX" : "000000"}
            maxLength={useBackup ? 8 : 6}
            className="text-center text-xl tracking-widest font-mono"
            autoFocus
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Verify
          </Button>
        </form>
        <button
          type="button"
          onClick={() => { setUseBackup(!useBackup); setCode(""); }}
          className="mt-4 w-full text-center text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          {useBackup ? "Use authenticator code instead" : "Use a backup code instead"}
        </button>
      </div>
    </div>
  );
}
