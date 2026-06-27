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
import { trackSignup } from "@/lib/track";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const isAr = locale === "ar";
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
    <div className="w-full max-w-[480px]">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="text-xl font-black text-primary uppercase tracking-tighter">EYE</div>
        <Link href={`/${locale}/auth/login`} className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
          {t("signIn")}
        </Link>
      </header>

      <div className="glass-panel rounded-xl border border-outline-variant/15 p-8 md:p-10 shadow-2xl space-y-7">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Create your account</h1>
          <p className="text-on-surface-variant text-sm">Start tracking your website visitors in minutes.</p>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            {isAr ? "تجربة مجانية 30 يومًا · بدون بطاقة ائتمان" : "30-day free trial · No credit card required"}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-error-container/30 border border-error/20 px-4 py-3 text-sm text-error">{error}</div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant ml-1">{t("name")}</label>
            <Input placeholder="Alex Rivera" {...register("name")} autoComplete="name" />
            {errors.name && <p className="text-xs text-error ml-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant ml-1">{t("email")}</label>
            <Input type="email" placeholder="alex@company.com" {...register("email")} autoComplete="email" />
            {errors.email && <p className="text-xs text-error ml-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant ml-1">{t("password")}</label>
            <div className="relative">
              <Input type={showPw ? "text" : "password"} placeholder="••••••••" {...register("password")} className="pr-10" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute inset-y-0 right-3 flex items-center text-on-surface-variant hover:text-on-surface">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-error ml-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant ml-1">{t("confirmPassword")}</label>
            <Input type="password" placeholder="••••••••" {...register("password_confirmation")} />
            {errors.password_confirmation && <p className="text-xs text-error ml-1">{errors.password_confirmation.message}</p>}
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 mt-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            Get Started
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-on-surface-variant">
          {(isAr
            ? ["بدون بطاقة ائتمان", "متوافق مع GDPR", "إلغاء في أي وقت"]
            : ["No credit card", "GDPR-compliant", "Cancel anytime"]
          ).map((item) => (
            <span key={item} className="inline-flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" /> {item}
            </span>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-on-surface-variant mt-6">
        {t("hasAccount")}{" "}
        <Link href={`/${locale}/auth/login`} className="text-primary font-bold hover:text-secondary transition-colors ml-1">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}
