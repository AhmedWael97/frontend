"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ShieldAlert, X } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { adminApi } from "@/lib/api";
import { useState } from "react";

export function ImpersonationBanner() {
  const { impersonating, setToken, setUser, setImpersonating } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();
  const [loading, setLoading] = useState(false);

  if (!impersonating) return null;

  const handleExit = async () => {
    setLoading(true);
    try {
      await adminApi.endImpersonation();
    } catch {
      // Token may already be expired — continue with local cleanup regardless
    }

    // Restore the admin's original token
    const adminToken = localStorage.getItem("eye_token_admin_backup");
    localStorage.removeItem("eye_token_admin_backup");

    setToken(adminToken ?? null);
    setUser(null);
    setImpersonating(false);

    router.push(`/${locale}/admin/users`);
  };

  return (
    <div className="bg-warning/10 border-b border-warning/30 px-4 py-2 flex items-center gap-3 text-sm">
      <ShieldAlert className="w-4 h-4 text-warning shrink-0" />
      <span className="text-on-surface flex-1">
        You are viewing this dashboard as another user.
      </span>
      <button
        onClick={handleExit}
        disabled={loading}
        className="flex items-center gap-1.5 text-warning font-medium hover:underline disabled:opacity-50"
      >
        <X className="w-3.5 h-3.5" />
        {loading ? "Exiting…" : "Exit Impersonation"}
      </button>
    </div>
  );
}
