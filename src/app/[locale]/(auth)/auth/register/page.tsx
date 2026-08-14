"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/lib/use-toast";
import { trackSignup, eyeTrack } from "@/lib/track";
import { AuthShowcase, MobileFeatureStrip } from "@/components/auth/AuthShowcase";
import GoogleOneTap from "@/components/auth/GoogleOneTap";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken, setUser } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [emailTaken, setEmailTaken] = useState(false);
  const focused = useRef<Record<string, boolean>>({});

  const validateEmail = (v: string) => {
    const ok = /^\S+@\S+\.\S+$/.test(v.trim());
    setEmailErr(v && !ok ? (locale === "ar" ? "أدخل بريدًا إلكترونيًا صحيحًا" : "Enter a valid email address") : "");
    setEmailTaken(false);
    return ok;
  };
  const validatePw = (v: string) => {
    const ok = v.length >= 8;
    setPwErr(v && !ok ? (locale === "ar" ? "8 أحرف على الأقل" : "At least 8 characters") : "");
    return ok;
  };

  // Instrument the register funnel — see the exact quit point.
  useEffect(() => { eyeTrack("register_view", {}); }, []);
  const [googleHref, setGoogleHref] = useState("");
  const [facebookHref, setFacebookHref] = useState("");

  const ref = searchParams?.get("ref") || "";

  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    // The referral code rides inside the callback URL itself (survives the
    // OAuth round-trip through Google's/Facebook's `state` param unchanged).
    const callback = `${origin}/${locale}/auth/callback${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`;
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    setGoogleHref(`${api}/api/v1/auth/google/redirect?redirect=${encodeURIComponent(callback)}`);
    setFacebookHref(`${api}/api/v1/auth/facebook/redirect?redirect=${encodeURIComponent(callback)}`);
  }, [locale, ref]);

  const onFieldFocus = (field: string) => {
    if (focused.current[field]) return;
    focused.current[field] = true;
    eyeTrack("register_focus", { field });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      email: String(fd.get("email") || "").trim(),
      password: String(fd.get("password") || ""),
      ...(ref ? { referral_code: ref } : {}),
    };
    eyeTrack("register_submit", {});
    if (!/^\S+@\S+\.\S+$/.test(data.email) || data.password.length < 8) {
      setError("Enter a valid email and an 8+ character password.");
      eyeTrack("register_error", { reason: "validation" });
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await authApi.register(data);
      setToken(res.data.token);
      setUser(res.data.user);
      trackSignup(res.data.user?.id, data.email); // TikTok CompleteRegistration + Google Ads sign_up (+ enhanced conversions)
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
      const emailMsg = String(fieldErrors?.email?.[0] || "") + " " + String(e.message || "");
      if (/taken|already|unique|exist/i.test(emailMsg)) {
        setEmailTaken(true);
        setError("");
        eyeTrack("register_error", { reason: "email_taken" });
      } else {
        setError(fieldErrors ? Object.values(fieldErrors).flat().join(" ") : (e.message || "Registration failed."));
        eyeTrack("register_error", { reason: fieldErrors ? "validation_server" : "server" });
      }
    } finally {
      setLoading(false);
    }
  };

  const mono = { fontFamily: "var(--font-mono-marketing, inherit)" };

  return (
    <div className="w-full max-w-5xl">
      <GoogleOneTap />
      <div className="grid lg:grid-cols-2 rounded-none overflow-hidden border border-[#262626]">
        <AuthShowcase />

        {/* Form column */}
        <div className="p-6 sm:p-9 lg:p-11 flex flex-col bg-black">
          <header className="flex items-center justify-between mb-7">
            <div className="lg:hidden text-xl font-bold text-white uppercase tracking-tighter">EYE<span className="text-[#00E5FF]">.</span></div>
            <div className="hidden lg:block" />
            <Link href={`/${locale}/auth/login`} className="text-sm text-neutral-400 hover:text-white transition-colors">
              {t("signIn")}
            </Link>
          </header>

          <div className="space-y-2 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{t("createTitle")}</h1>
            <p className="text-neutral-400 text-sm">{t("createSubtitle")}</p>
            <div className="inline-flex items-center gap-1.5 rounded-none border border-green-500/25 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400" style={mono}>
              <ShieldCheck className="w-3.5 h-3.5" />
              {t("trialBadge")}
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={googleHref}
              onClick={() => eyeTrack("register_google_click", {})}
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-none border border-[#262626] bg-[#0A0A0A] h-12 text-base font-bold text-white transition hover:bg-[#171717] hover:border-neutral-600"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.35 11.1H12v2.8h5.35c-.2 1.35-1.4 3.95-5.35 3.95-3.2 0-5.8-2.65-5.8-5.9s2.6-5.9 5.8-5.9c1.85 0 3.1.8 3.8 1.5l2.55-2.45C17.3 3.1 15.05 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10c5.8 0 9.7-4.05 9.7-9.75 0-.65-.05-1.15-.35-1.45Z" fill="#4285F4"/>
              </svg>
              {locale === "ar" ? "التسجيل بحساب Google" : "Sign up with Google"}
            </a>
            <a
              href={facebookHref}
              onClick={() => eyeTrack("register_facebook_click", {})}
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-none border border-[#262626] bg-[#0A0A0A] h-12 text-base font-bold text-white transition hover:bg-[#171717] hover:border-neutral-600"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06C2 17.06 5.66 21.2 10.44 22v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22C18.34 21.2 22 17.06 22 12.06Z"/>
              </svg>
              {locale === "ar" ? "التسجيل بحساب Facebook" : "Sign up with Facebook"}
            </a>
            <p className="text-center text-[11px] text-neutral-500">{locale === "ar" ? "الأسرع — بدون كلمة مرور، وبدون تأكيد بريد" : "Fastest — no password, no email to verify"}</p>
            <div className="flex items-center gap-3 text-xs text-neutral-500" style={mono}>
              <span className="h-px flex-1 bg-[#262626]" />
              {locale === "ar" ? "أو بالبريد" : "or use email"}
              <span className="h-px flex-1 bg-[#262626]" />
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="rounded-none bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400">{error}</div>
            )}

            {emailTaken && (
              <div className="rounded-none bg-[#00E5FF]/10 border border-[#00E5FF]/25 px-4 py-3 text-sm text-white">
                {locale === "ar" ? "هذا البريد لديه حساب بالفعل. " : "This email already has an account. "}
                <Link href={`/${locale}/auth/login`} className="font-bold text-[#00E5FF] hover:underline">
                  {locale === "ar" ? "تسجيل الدخول" : "Log in instead"}
                </Link>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 ml-1" style={mono}>{t("email")}</label>
              <Input name="email" type="email" placeholder="alex@company.com" autoComplete="email" required onFocus={() => onFieldFocus("email")} onChange={(e) => validateEmail(e.target.value)} onBlur={(e) => validateEmail(e.target.value)} aria-invalid={!!emailErr} className="rounded-none bg-[#0A0A0A] border border-[#262626] text-white focus:ring-[#00E5FF]/40 focus:border-[#00E5FF]/50" />
              {emailErr && <p className="text-xs text-red-400 ml-1">{emailErr}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 ml-1" style={mono}>{t("password")}</label>
              <div className="relative">
                <Input name="password" type={showPw ? "text" : "password"} placeholder="••••••••" autoComplete="new-password" required minLength={8} className="pr-11 rounded-none bg-[#0A0A0A] border border-[#262626] text-white focus:ring-[#00E5FF]/40 focus:border-[#00E5FF]/50" onFocus={() => onFieldFocus("password")} onChange={(e) => validatePw(e.target.value)} onBlur={(e) => validatePw(e.target.value)} aria-invalid={!!pwErr} />
                <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Hide password" : "Show password"} className="absolute inset-y-0 right-2 rtl:right-auto rtl:left-2 flex items-center justify-center w-8 text-neutral-500 hover:text-white">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {pwErr ? <p className="text-xs text-red-400 ml-1">{pwErr}</p> : <p className="text-[11px] text-neutral-500 ml-1">{locale === "ar" ? "8 أحرف على الأقل" : "8+ characters"}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 mt-2 gap-2 rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none font-bold">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4 rtl:rotate-180" />}
              {t("getStarted")}
            </Button>

            <p className="text-[11px] text-center text-neutral-500 leading-relaxed pt-1">
              {locale === "ar" ? "بإنشائك حسابًا فأنت توافق على " : "By creating an account you agree to our "}
              <Link href={`/${locale}/terms`} className="text-[#00E5FF] hover:underline">{locale === "ar" ? "شروط الاستخدام" : "Terms of Use"}</Link>
              {locale === "ar" ? " و" : " and "}
              <Link href={`/${locale}/privacy`} className="text-[#00E5FF] hover:underline">{locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}</Link>
              .
            </p>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pt-5 text-[11px] text-neutral-500">
            {[t("trustNoCard"), t("trustGdpr"), t("trustCancel")].map((item) => (
              <span key={item} className="inline-flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" /> {item}
              </span>
            ))}
          </div>

          <MobileFeatureStrip />
        </div>
      </div>

      <p className="text-center text-sm text-neutral-400 mt-6">
        {t("hasAccount")}{" "}
        <Link href={`/${locale}/auth/login`} className="text-[#00E5FF] font-bold hover:underline ml-1 rtl:ml-0 rtl:mr-1">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}
