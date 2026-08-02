"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/lib/use-toast";
import GoogleOneTap from "@/components/auth/GoogleOneTap";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export default function LoginSimpleVariant() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const { setToken, setUser, setTwoFactorChallenge } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [googleHref, setGoogleHref] = useState("");

  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    setGoogleHref(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/auth/google/redirect?redirect=${encodeURIComponent(`${origin}/${locale}/auth/callback`)}`);
  }, [locale]);

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(data);
      if (res.data.two_factor) {
        setTwoFactorChallenge(res.data.challenge || null);
        router.push(`/${locale}/auth/two-factor-challenge`);
        return;
      }
      setTwoFactorChallenge(null);
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
      <GoogleOneTap />
      <div className="rounded-2xl border border-outline-variant/15 shadow-2xl glass-panel bg-surface/60 p-6 sm:p-8">
        <div className="text-center mb-6">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-4" aria-label="EYE home">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </span>
            <span className="text-lg font-black tracking-tighter text-primary uppercase">EYE</span>
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-on-surface">{t("loginTitle")}</h1>
          <p className="text-on-surface-variant text-sm mt-1">{t("loginSubtitle")}</p>
        </div>

        <div className="flex items-center justify-center gap-1.5 mb-6 text-[11px] text-on-surface-variant">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          {locale === "ar" ? "اتصال آمن ومشفّر — بياناتك محمية دائمًا" : "Secure, encrypted connection — your data stays private"}
        </div>

        <a
          href={googleHref}
          className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-primary/30 bg-surface h-12 text-base font-bold text-on-surface shadow-md transition hover:bg-surface-container hover:border-primary/50 mb-2"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.35 11.1H12v2.8h5.35c-.2 1.35-1.4 3.95-5.35 3.95-3.2 0-5.8-2.65-5.8-5.9s2.6-5.9 5.8-5.9c1.85 0 3.1.8 3.8 1.5l2.55-2.45C17.3 3.1 15.05 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10c5.8 0 9.7-4.05 9.7-9.75 0-.65-.05-1.15-.35-1.45Z" fill="#4285F4"/>
          </svg>
          {locale === "ar" ? "الدخول بحساب Google" : "Continue with Google"}
        </a>
        <p className="text-center text-[11px] text-on-surface-variant/70 mb-4">
          {locale === "ar" ? "الأسرع — بدون كلمة مرور" : "Fastest — no password to remember"}
        </p>

        <div className="flex items-center gap-3 text-xs text-on-surface-variant/70 mb-4">
          <span className="h-px flex-1 bg-outline-variant/50" />
          {locale === "ar" ? "أو بالبريد" : "or use email"}
          <span className="h-px flex-1 bg-outline-variant/50" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {error && <div className="rounded-lg bg-error-container/30 border border-error/20 px-4 py-3 text-sm text-error">{error}</div>}

          <Input type="email" placeholder={locale === "ar" ? "بريدك الإلكتروني" : "Email address"} {...register("email")} autoComplete="email" />
          {errors.email && <p className="text-xs text-error ml-1">{errors.email.message}</p>}

          <div className="relative">
            <Input type={showPw ? "text" : "password"} placeholder={locale === "ar" ? "كلمة المرور" : "Password"} {...register("password")} autoComplete="current-password" className="pr-11" />
            <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Hide password" : "Show password"} className="absolute inset-y-0 right-2 rtl:right-auto rtl:left-2 flex items-center justify-center w-8 text-on-surface-variant hover:text-on-surface">
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-error ml-1">{errors.password.message}</p>}

          <div className="text-end">
            <Link href={`/${locale}/auth/forgot-password`} className="text-xs font-semibold text-primary hover:text-secondary transition-colors">
              {t("forgotPassword")}
            </Link>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 mt-1 gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4 rtl:rotate-180" />}
            {t("loginCta")}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-on-surface-variant mt-6">
        {t("noAccount")}{" "}
        <Link href={`/${locale}/auth/register`} className="text-primary font-bold hover:text-secondary transition-colors ml-1 rtl:ml-0 rtl:mr-1">
          {t("signUp")}
        </Link>
      </p>
    </div>
  );
}
