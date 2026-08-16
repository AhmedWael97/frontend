"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2, ArrowRight, Check, ShieldCheck, Globe } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/lib/use-toast";
import { trackSignup, trackDomainAdded, eyeTrack } from "@/lib/track";
import GoogleOneTap from "@/components/auth/GoogleOneTap";

export default function RegisterSimpleVariant() {
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
  const [phone, setPhone] = useState<string | undefined>();
  const [phoneErr, setPhoneErr] = useState("");
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

  useEffect(() => { eyeTrack("register_view", { variant: "simple" }); }, []);
  const [googleHref, setGoogleHref] = useState("");
  const [facebookHref, setFacebookHref] = useState("");
  const ref = searchParams?.get("ref") || "";

  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const callback = `${origin}/${locale}/auth/callback${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`;
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    setGoogleHref(`${api}/api/v1/auth/google/redirect?redirect=${encodeURIComponent(callback)}`);
    setFacebookHref(`${api}/api/v1/auth/facebook/redirect?redirect=${encodeURIComponent(callback)}`);
  }, [locale, ref]);

  const onFieldFocus = (field: string) => {
    if (focused.current[field]) return;
    focused.current[field] = true;
    eyeTrack("register_focus", { field, variant: "simple" });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      first_name: String(fd.get("first_name") || "").trim(),
      last_name: String(fd.get("last_name") || "").trim(),
      phone: phone || "",
      email: String(fd.get("email") || "").trim(),
      password: String(fd.get("password") || ""),
      domain: String(fd.get("domain") || "").trim(),
      ...(ref ? { referral_code: ref } : {}),
    };
    eyeTrack("register_submit", { variant: "simple" });
    if (!data.first_name || !data.last_name) {
      setError("Enter your first and last name.");
      eyeTrack("register_error", { reason: "validation", variant: "simple" });
      return;
    }
    if (!phone) {
      setPhoneErr("Phone number is required.");
      eyeTrack("register_error", { reason: "validation", variant: "simple" });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(data.email) || data.password.length < 8) {
      setError("Enter a valid email and an 8+ character password.");
      eyeTrack("register_error", { reason: "validation", variant: "simple" });
      return;
    }
    if (!data.domain) {
      setError("Enter your website's domain.");
      eyeTrack("register_error", { reason: "validation", variant: "simple" });
      return;
    }
    setError("");
    setPhoneErr("");
    setLoading(true);
    try {
      const res = await authApi.register(data);
      setToken(res.data.token);
      setUser(res.data.user);
      trackSignup(res.data.user?.id, data.email);
      trackDomainAdded(data.domain);
      eyeTrack("register_complete", { email: data.email, variant: "simple" });
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
        eyeTrack("register_error", { reason: "email_taken", variant: "simple" });
      } else {
        setError(fieldErrors ? Object.values(fieldErrors).flat().join(" ") : (e.message || "Registration failed."));
        eyeTrack("register_error", { reason: fieldErrors ? "validation_server" : "server", variant: "simple" });
      }
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
          <h1 className="text-2xl font-black tracking-tight text-on-surface">{t("createTitle")}</h1>
          <p className="text-on-surface-variant text-sm mt-1">{t("createSubtitle")}</p>
        </div>

        {/* Trust signals up top, right under the headline — not buried after the form */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 mb-6 text-[11px] text-on-surface-variant">
          {[t("trustNoCard"), t("trustGdpr"), t("trustCancel")].map((item) => (
            <span key={item} className="inline-flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" /> {item}</span>
          ))}
        </div>

        <a
          href={googleHref}
          onClick={() => eyeTrack("register_google_click", { variant: "simple" })}
          className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-primary/30 bg-surface h-12 text-base font-bold text-on-surface shadow-md transition hover:bg-surface-container hover:border-primary/50 mb-2"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.35 11.1H12v2.8h5.35c-.2 1.35-1.4 3.95-5.35 3.95-3.2 0-5.8-2.65-5.8-5.9s2.6-5.9 5.8-5.9c1.85 0 3.1.8 3.8 1.5l2.55-2.45C17.3 3.1 15.05 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10c5.8 0 9.7-4.05 9.7-9.75 0-.65-.05-1.15-.35-1.45Z" fill="#4285F4"/>
          </svg>
          {locale === "ar" ? "التسجيل بحساب Google" : "Sign up with Google"}
        </a>
        <a
          href={facebookHref}
          onClick={() => eyeTrack("register_facebook_click", { variant: "simple" })}
          className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-primary/30 bg-surface h-12 text-base font-bold text-on-surface shadow-md transition hover:bg-surface-container hover:border-primary/50 mb-2"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06C2 17.06 5.66 21.2 10.44 22v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22C18.34 21.2 22 17.06 22 12.06Z"/>
          </svg>
          {locale === "ar" ? "التسجيل بحساب Facebook" : "Sign up with Facebook"}
        </a>
        <p className="text-center text-[11px] text-on-surface-variant/70 mb-4">
          {locale === "ar" ? "الأسرع — بدون كلمة مرور، وبدون تأكيد بريد" : "Fastest — no password, no email to verify"}
        </p>

        <div className="flex items-center gap-3 text-xs text-on-surface-variant/70 mb-4">
          <span className="h-px flex-1 bg-outline-variant/50" />
          {locale === "ar" ? "أو بالبريد" : "or use email"}
          <span className="h-px flex-1 bg-outline-variant/50" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {error && <div className="rounded-lg bg-error-container/30 border border-error/20 px-4 py-3 text-sm text-error">{error}</div>}
          {emailTaken && (
            <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-on-surface">
              {locale === "ar" ? "هذا البريد لديه حساب بالفعل. " : "This email already has an account. "}
              <Link href={`/${locale}/auth/login`} className="font-bold text-primary hover:underline">
                {locale === "ar" ? "تسجيل الدخول" : "Log in instead"}
              </Link>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Input name="first_name" type="text" placeholder={locale === "ar" ? "الاسم الأول" : "First name"} autoComplete="given-name" required onFocus={() => onFieldFocus("first_name")} />
            <Input name="last_name" type="text" placeholder={locale === "ar" ? "اسم العائلة" : "Last name"} autoComplete="family-name" required onFocus={() => onFieldFocus("last_name")} />
          </div>

          <PhoneInput
            international
            defaultCountry="EG"
            value={phone}
            onChange={setPhone}
            onFocus={() => onFieldFocus("phone")}
            placeholder={locale === "ar" ? "رقم هاتفك" : "Phone number"}
            className="eye-phone-input"
            numberInputProps={{ className: "PhoneInputInput" }}
          />
          {phoneErr && <p className="text-xs text-error ml-1">{phoneErr}</p>}

          <Input name="email" type="email" placeholder={locale === "ar" ? "بريدك الإلكتروني" : "Email address"} autoComplete="email" required onFocus={() => onFieldFocus("email")} onChange={(e) => validateEmail(e.target.value)} onBlur={(e) => validateEmail(e.target.value)} aria-invalid={!!emailErr} />
          {emailErr && <p className="text-xs text-error ml-1">{emailErr}</p>}

          <div className="relative">
            <Input name="password" type={showPw ? "text" : "password"} placeholder={locale === "ar" ? "كلمة المرور" : "Password"} autoComplete="new-password" required minLength={8} className="pr-11" onFocus={() => onFieldFocus("password")} onChange={(e) => validatePw(e.target.value)} onBlur={(e) => validatePw(e.target.value)} aria-invalid={!!pwErr} />
            <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Hide password" : "Show password"} className="absolute inset-y-0 right-2 rtl:right-auto rtl:left-2 flex items-center justify-center w-8 text-on-surface-variant hover:text-on-surface">
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {pwErr && <p className="text-xs text-error ml-1">{pwErr}</p>}

          <div className="relative">
            <Globe className="absolute inset-y-0 left-3 rtl:left-auto rtl:right-3 my-auto w-4 h-4 text-on-surface-variant" />
            <Input name="domain" type="text" placeholder="yoursite.com" autoComplete="off" required onFocus={() => onFieldFocus("domain")} className="pl-9 rtl:pl-4 rtl:pr-9" />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 mt-1 gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4 rtl:rotate-180" />}
            {t("getStarted")}
          </Button>

          <p className="text-[11px] text-center text-on-surface-variant/80 leading-relaxed pt-1">
            {locale === "ar" ? "بإنشائك حسابًا فأنت توافق على " : "By creating an account you agree to our "}
            <Link href={`/${locale}/terms`} className="text-primary hover:underline">{locale === "ar" ? "شروط الاستخدام" : "Terms of Use"}</Link>
            {locale === "ar" ? " و" : " and "}
            <Link href={`/${locale}/privacy`} className="text-primary hover:underline">{locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}</Link>.
          </p>
        </form>
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
