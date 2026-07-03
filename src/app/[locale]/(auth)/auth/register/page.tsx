"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/lib/use-toast";
import { trackSignup, eyeTrack } from "@/lib/track";
import { AuthShowcase, MobileFeatureStrip } from "@/components/auth/AuthShowcase";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
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
      const res = await authApi.register(data);
      setToken(res.data.token);
      setUser(res.data.user);
      trackSignup(); // TikTok CompleteRegistration + Google Ads sign_up
      // Dogfooding: measure our own activation funnel via EYE's tracker.
      eyeTrack("register_complete", { email: data.email });
      if (res.data.user?.email_verified_at) {
        toast.success("Account created! Let's set up your first website.");
        router.push(`/${locale}/settings/domains?welcome=1`);
      } else {
        toast.success("Account created! Check your inbox to verify your email.");
        router.push(`/${locale}/auth/verify-email`);
      }
    } catch (e: any) {
      const fieldErrors = (e as any).errors;
      setError(
        fieldErrors ? Object.values(fieldErrors).flat().join(" ") : (e.message || "Registration failed.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl">
      <div className="grid lg:grid-cols-2 rounded-2xl overflow-hidden border border-outline-variant/15 shadow-2xl glass-panel">
        <AuthShowcase />

        {/* Form column */}
        <div className="p-6 sm:p-9 lg:p-11 flex flex-col bg-surface/60">
          <header className="flex items-center justify-between mb-7">
            <div className="lg:hidden text-xl font-black text-primary uppercase tracking-tighter">EYE</div>
            <div className="hidden lg:block" />
            <Link href={`/${locale}/auth/login`} className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
              {t("signIn")}
            </Link>
          </header>

          <div className="space-y-2 mb-6">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-on-surface">{t("createTitle")}</h1>
            <p className="text-on-surface-variant text-sm">{t("createSubtitle")}</p>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t("trialBadge")}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-error-container/30 border border-error/20 px-4 py-3 text-sm text-error">{error}</div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">{t("name")}</label>
              <Input placeholder="Alex Rivera" {...register("name")} autoComplete="name" />
              {errors.name && <p className="text-xs text-error ml-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">{t("email")}</label>
              <Input type="email" placeholder="alex@company.com" {...register("email")} autoComplete="email" />
              {errors.email && <p className="text-xs text-error ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">{t("password")}</label>
              <div className="relative">
                <Input type={showPw ? "text" : "password"} placeholder="••••••••" autoComplete="new-password" {...register("password")} className="pr-11" />
                <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Hide password" : "Show password"} className="absolute inset-y-0 right-2 rtl:right-auto rtl:left-2 flex items-center justify-center w-8 text-on-surface-variant hover:text-on-surface">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-error ml-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 mt-2 gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4 rtl:rotate-180" />}
              {t("getStarted")}
            </Button>

            <p className="text-[11px] text-center text-on-surface-variant/80 leading-relaxed pt-1">
              {locale === "ar" ? "بإنشائك حسابًا فأنت توافق على " : "By creating an account you agree to our "}
              <Link href={`/${locale}/terms`} className="text-primary hover:underline">{locale === "ar" ? "شروط الاستخدام" : "Terms of Use"}</Link>
              {locale === "ar" ? " و" : " and "}
              <Link href={`/${locale}/privacy`} className="text-primary hover:underline">{locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}</Link>
              .
            </p>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pt-5 text-[11px] text-on-surface-variant">
            {[t("trustNoCard"), t("trustGdpr"), t("trustCancel")].map((item) => (
              <span key={item} className="inline-flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" /> {item}
              </span>
            ))}
          </div>

          <MobileFeatureStrip />
        </div>
      </div>

      <p className="text-center text-sm text-on-surface-variant mt-6">
        {t("hasAccount")}{" "}
        <Link href={`/${locale}/auth/login`} className="text-primary font-bold hover:text-secondary transition-colors ml-1 rtl:ml-0 rtl:mr-1">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}
