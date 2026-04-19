"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/lib/use-toast";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(data);
      if (res.data.two_factor) {
        router.push(`/${locale}/auth/two-factor-challenge`);
        return;
      }
      setToken(res.data.token);
      setUser(res.data.user);
      if (res.data.user?.role === "superadmin") {
        toast.success("Welcome back, Admin! Redirecting...");
        router.push(`/${locale}/admin`);
      } else {
        toast.success("Welcome back! Redirecting to dashboard...");
        router.push(`/${locale}/dashboard`);
      }
    } catch (e: any) {
      setError(e.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Brand */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-container mb-4 shadow-lg">
          <span className="material-symbols-outlined text-3xl text-on-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tighter text-primary uppercase">EYE</h1>
        <p className="text-on-surface-variant text-sm mt-1.5 font-medium tracking-wide">Intelligent Visitor Tracking</p>
      </div>

      {/* Card */}
      <div className="glass-card rounded-xl p-8 shadow-2xl border border-outline-variant/15">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-error-container/30 border border-error/20 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[0.6875rem] font-bold tracking-[0.05em] uppercase text-on-surface-variant ml-1">
              {t("email")}
            </label>
            <Input type="email" placeholder="name@company.com" {...register("email")} autoComplete="email" />
            {errors.email && <p className="text-xs text-error ml-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[0.6875rem] font-bold tracking-[0.05em] uppercase text-on-surface-variant">
                {t("password")}
              </label>
              <Link href={`/${locale}/auth/forgot-password`} className="text-xs font-semibold text-primary hover:text-secondary transition-colors">
                {t("forgotPassword")}
              </Link>
            </div>
            <div className="relative">
              <Input type={showPw ? "text" : "password"} placeholder="••••••••" {...register("password")} autoComplete="current-password" className="pr-10" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute inset-y-0 right-3 flex items-center text-on-surface-variant hover:text-on-surface">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-error ml-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" disabled={loading} className="w-full py-3 h-auto">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("login")} to EYE
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-on-surface-variant mt-6">
        {t("noAccount")}{" "}
        <Link href={`/${locale}/auth/register`} className="text-primary font-bold hover:text-secondary transition-colors ml-1">
          {t("signUp")}
        </Link>
      </p>
    </div>
  );
}
