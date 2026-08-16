"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  ArrowRight, ArrowLeft, Check, X, Loader2, Megaphone, Globe,
  ScanSearch, Gauge, Layers, PartyPopper, Sparkles, Eye, Sun, Moon, Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { onboardingApi, type QuizDomain } from "@/api/onboarding";
import { toolsApi } from "@/api/tools";
import { useAuthStore } from "@/store/auth";
import { localePath } from "@/lib/seo";
import { trackSignup, trackDomainAdded, eyeTrack, readAcquisitionCookie } from "@/lib/track";

const mono = { fontFamily: "var(--font-mono-marketing)" };

/** Minimal header: logo + Home on the start side, language + theme toggle on
 * the end side. No full nav — same reasoning as the see-why ad page, every
 * extra link here is a way to leave the wizard before finishing it. */
function MinimalHeader({ locale }: { locale: string }) {
  const router = useRouter();
  const ar = locale === "ar";
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("eye-appearance", next ? "dark" : "light"); } catch {}
  };

  const switchLocale = () => router.push(`/${ar ? "en" : "ar"}/get-started`);

  return (
    <header className="py-4 border-b border-[#262626]">
      <div className="max-w-2xl mx-auto px-5 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={localePath(locale)} className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-none border border-[#262626] bg-[#0A0A0A] flex items-center justify-center">
              <Eye className="w-4 h-4 text-[#00E5FF]" />
            </span>
            <span className="text-lg font-bold tracking-tight text-white">EYE<span className="text-[#00E5FF]">.</span></span>
          </Link>
          <Link href={localePath(locale)} className="text-sm font-semibold text-neutral-400 hover:text-white transition-colors">
            {ar ? "الرئيسية" : "Home"}
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={switchLocale} className="inline-flex items-center gap-1.5 rounded-none px-2.5 py-2 text-xs font-bold text-neutral-400 hover:bg-[#171717] hover:text-white transition-colors">
            <Languages className="w-4 h-4" /> {ar ? "EN" : "عربي"}
          </button>
          <button onClick={toggleTheme} aria-label="Toggle theme" className="rounded-none p-2 text-neutral-400 hover:bg-[#171717] hover:text-white transition-colors">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}

const LANGUAGES = ["PHP", "JavaScript", "TypeScript", "Python", "Ruby", "Java", "C#/.NET", "Go", "WordPress", "Shopify", "Other"];

const FEATURES = [
  "Live Visitor Tracking", "Click Heatmaps", "Session Replay", "Conversion Funnels",
  "A/B Testing", "AI Insights & Reports", "Campaign Attribution & ROAS", "Cohort Retention",
  "Lifetime Value (LTV)", "SEO Rank Tracking", "Warm Leads / Outreach",
  "Alerts & Anomaly Detection", "Multi-site Portfolio", "Team / Agency Collaboration",
  "Cookieless Privacy Analytics",
];

const TOTAL_STEPS = 6;

type TestedDomain = QuizDomain & { testing?: boolean; testError?: string };

export default function GetStartedWizard({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const ar = useLocale() === "ar";
  const { setToken, setUser } = useAuthStore();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"site_owner" | "marketer" | null>(null);
  const [sitesManaged, setSitesManaged] = useState<string>("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [domainInput, setDomainInput] = useState("");
  const [domains, setDomains] = useState<TestedDomain[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<{ domains: { domain: string }[]; plan: { name: string } | null; trial_ends_at: string | null } | null>(null);
  const [visitorId, setVisitorId] = useState("");

  const t = (en: string, arText: string) => (ar ? arText : en);

  // Stable per-browser id so an abandoned attempt can still be autosaved and
  // matched back up if they return — independent of EYE's own visitor
  // tracking, so it works even if that script is blocked.
  useEffect(() => {
    let id = "";
    try { id = localStorage.getItem("eye_quiz_visitor_id") || ""; } catch {}
    if (!id) {
      id = `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      try { localStorage.setItem("eye_quiz_visitor_id", id); } catch {}
    }
    setVisitorId(id);
  }, []);

  const toggle = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const addDomain = () => {
    let host = domainInput.trim().replace(/^https?:\/\//i, "").split("/")[0];
    if (!host || domains.length >= 5) return;
    if (domains.some((d) => d.domain === host)) { setDomainInput(""); return; }
    setDomains([...domains, { domain: host }]);
    setDomainInput("");
  };

  const removeDomain = (host: string) => setDomains(domains.filter((d) => d.domain !== host));

  const runTests = async () => {
    eyeTrack("quiz_domains_tested", { count: domains.length });
    const updated = [...domains];
    await Promise.all(
      updated.map(async (d, i) => {
        updated[i] = { ...d, testing: true };
        setDomains([...updated]);
        const full = `https://${d.domain}`;
        try {
          const [seo, speed, sitemap] = await Promise.allSettled([
            toolsApi.seoCheckPublic(full),
            toolsApi.speedCheck(full),
            toolsApi.sitemapCheck(full),
          ]);
          const seoScore = seo.status === "fulfilled" ? (seo.value.data?.data ?? seo.value.data)?.score : null;
          const speedScore = speed.status === "fulfilled" ? (speed.value.data?.data ?? speed.value.data)?.score : null;
          const pages = sitemap.status === "fulfilled" ? (sitemap.value.data?.data ?? sitemap.value.data)?.pages_crawled : null;
          updated[i] = { domain: d.domain, seo_score: seoScore, speed_score: speedScore, pages_found: pages, testing: false };
        } catch {
          updated[i] = { domain: d.domain, testing: false, testError: t("Couldn't test this site.", "تعذّر فحص هذا الموقع.") };
        }
        setDomains([...updated]);
      })
    );
  };

  const canNext = useMemo(() => {
    if (step === 1) return role !== null;
    if (step === 2) return sitesManaged !== "" && Number(sitesManaged) >= 0;
    if (step === 3) return languages.length > 0;
    if (step === 4) return domains.length > 0;
    if (step === 5) return true; // features optional
    return false;
  }, [step, role, sitesManaged, languages, domains]);

  const buildPayload = () => ({
    role: role!,
    sites_managed: Number(sitesManaged) || 0,
    languages,
    features,
    domains: domains.map(({ domain, seo_score, speed_score, pages_found }) => ({ domain, seo_score, speed_score, pages_found })),
    ...readAcquisitionCookie(),
  });

  // Autosave on every step change so an abandoned attempt still shows up for
  // the superadmin — who started, how far they got, whatever they'd answered.
  useEffect(() => {
    if (!visitorId) return;
    onboardingApi
      .saveQuizProgress({
        visitor_id: visitorId,
        step_reached: step > TOTAL_STEPS ? TOTAL_STEPS : step,
        role: role ?? undefined,
        sites_managed: sitesManaged !== "" ? Number(sitesManaged) : undefined,
        languages,
        features,
        domains: domains.map(({ domain, seo_score, speed_score, pages_found }) => ({ domain, seo_score, speed_score, pages_found })),
      })
      .catch(() => {}); // best-effort — never blocks the wizard
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, visitorId]);

  const submitWithEmail = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || submitting) return;
    if (password !== passwordConfirm) {
      setSubmitError(t("Passwords don't match.", "كلمتا المرور غير متطابقتين."));
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const r = await onboardingApi.submitQuiz({
        ...buildPayload(),
        visitor_id: visitorId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirm,
      });
      const data = r.data?.data ?? r.data;
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        trackSignup(data.user?.id, email.trim());
      }
      eyeTrack("quiz_completed", { role, domains: domains.length, plan: data.plan?.slug });
      // One domain_added per REAL domain the server actually created — not
      // per domain the visitor typed, only the ones that survived validation.
      (data.domains ?? []).forEach((d: { domain: string }) => trackDomainAdded(d.domain));
      setResult({ domains: data.domains, plan: data.plan, trial_ends_at: data.trial_ends_at });
      setStep(7);
    } catch (e: any) {
      setSubmitError(e?.message || t("Something went wrong. Try again.", "حدث خطأ. حاول مرة أخرى."));
    } finally {
      setSubmitting(false);
    }
  };

  const continueWithGoogle = () => {
    localStorage.setItem("eye_quiz_pending", JSON.stringify(buildPayload()));
    const origin = window.location.origin;
    const callback = `${origin}/${locale}/auth/callback`;
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    window.location.href = `${api}/api/v1/auth/google/redirect?redirect=${encodeURIComponent(callback)}`;
  };

  const progress = Math.round(((step > TOTAL_STEPS ? TOTAL_STEPS : step) / TOTAL_STEPS) * 100);
  const optionCls = (active: boolean) =>
    active
      ? "border-[#00E5FF] bg-[#00E5FF]/10"
      : "border-[#262626] hover:border-neutral-600";

  return (
    <div dir={ar ? "rtl" : "ltr"} className="min-h-screen bg-black flex flex-col">
      <MinimalHeader locale={locale} />
      <main className="flex-1">
        <section className="py-10 sm:py-16">
          <div className="max-w-2xl mx-auto px-5 sm:px-6">
            {step <= TOTAL_STEPS && (
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-2" style={mono}>
                  <span>{t("Get started", "ابدأ الآن")}</span>
                  <span>{step}/{TOTAL_STEPS}</span>
                </div>
                <div className="h-1.5 bg-[#171717] overflow-hidden">
                  <div className="h-full bg-[#00E5FF] transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="border border-[#262626] bg-[#0A0A0A] p-6 sm:p-9">
              {step === 1 && (
                <div>
                  <h1 className="text-2xl font-bold text-white mb-6">{t("Who are you?", "من أنت؟")}</h1>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "site_owner" as const, icon: Globe, label: t("Site Owner", "صاحب موقع") },
                      { key: "marketer" as const, icon: Megaphone, label: t("Marketer", "مسوّق") },
                    ].map((o) => (
                      <button
                        key={o.key}
                        onClick={() => setRole(o.key)}
                        className={`rounded-none border-2 p-6 text-center transition-all ${optionCls(role === o.key)}`}
                      >
                        <o.icon className="w-8 h-8 mx-auto mb-3 text-[#00E5FF]" />
                        <p className="font-bold text-white">{o.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h1 className="text-2xl font-bold text-white mb-6">{t("How many sites do you manage?", "كم عدد المواقع التي تديرها؟")}</h1>
                  <Input
                    type="number"
                    min={0}
                    value={sitesManaged}
                    onChange={(e) => setSitesManaged(e.target.value)}
                    placeholder="1"
                    className="h-14 text-2xl text-center font-bold max-w-[160px] mx-auto rounded-none bg-black border border-[#262626] text-white focus:ring-[#00E5FF]/40 focus:border-[#00E5FF]/50"
                  />
                </div>
              )}

              {step === 3 && (
                <div>
                  <h1 className="text-2xl font-bold text-white mb-6">{t("What are your sites mostly built with?", "بماذا مبنية مواقعك غالباً؟")}</h1>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => toggle(languages, setLanguages, lang)}
                        className={`rounded-none border-2 px-4 py-3 text-sm font-semibold text-white transition-all ${optionCls(languages.includes(lang))}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{t("Enter your domain(s)", "أدخل موقعك أو مواقعك")}</h1>
                  <p className="text-sm text-neutral-400 mb-5">{t("Add up to 5, then test them — SEO, speed, and sitemap, in one shot.", "أضف حتى 5 مواقع، ثم افحصها — سيو، سرعة، وخريطة الموقع دفعة واحدة.")}</p>

                  <div className="flex gap-2 mb-4">
                    <Input
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDomain(); } }}
                      placeholder="yoursite.com"
                      className="h-12 flex-1 rounded-none bg-black border border-[#262626] text-white focus:ring-[#00E5FF]/40 focus:border-[#00E5FF]/50"
                    />
                    <Button type="button" onClick={addDomain} disabled={domains.length >= 5} className="h-12 px-5 rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none">{t("Add", "إضافة")}</Button>
                  </div>

                  {domains.length > 0 && (
                    <div className="space-y-3 mb-5">
                      {domains.map((d) => (
                        <div key={d.domain} className="border border-[#262626] px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm flex-1 truncate text-white" style={mono}>{d.domain}</span>
                            {d.testing && <Loader2 className="w-4 h-4 animate-spin text-[#00E5FF]" />}
                            <button onClick={() => removeDomain(d.domain)} aria-label="remove"><X className="w-4 h-4 text-neutral-500 hover:text-red-400" /></button>
                          </div>
                          {d.testError && <p className="text-xs text-red-400 mt-2">{d.testError}</p>}
                          {!d.testing && (d.seo_score != null || d.speed_score != null || d.pages_found != null) && (
                            <div className="flex flex-wrap items-center gap-2 mt-2.5">
                              {d.seo_score != null && (
                                <span className="inline-flex items-center gap-1.5 rounded-none border border-[#00E5FF]/25 bg-[#00E5FF]/10 px-2.5 py-1.5 text-xs font-bold text-[#00E5FF]" style={mono}>
                                  <ScanSearch className="w-3.5 h-3.5" /> {t("SEO score", "درجة السيو")}: {d.seo_score}/100
                                </span>
                              )}
                              {d.speed_score != null && (
                                <span className="inline-flex items-center gap-1.5 rounded-none border border-green-500/25 bg-green-500/10 px-2.5 py-1.5 text-xs font-bold text-green-400" style={mono}>
                                  <Gauge className="w-3.5 h-3.5" /> {t("Speed score", "درجة السرعة")}: {d.speed_score}/100
                                </span>
                              )}
                              {d.pages_found != null && (
                                <span className="inline-flex items-center gap-1.5 rounded-none border border-[#262626] bg-[#171717] px-2.5 py-1.5 text-xs font-bold text-neutral-300" style={mono}>
                                  <Layers className="w-3.5 h-3.5" /> {t("Pages found", "عدد الصفحات")}: {d.pages_found}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={runTests} className="w-full h-11 gap-2 rounded-none border-[#262626] text-white hover:bg-[#171717]">
                        <ScanSearch className="w-4 h-4" /> {t("Test my site(s)", "افحص موقعي/مواقعي")}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {step === 5 && (
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{t("Which features interest you most?", "ما الميزات التي تهمك أكثر؟")}</h1>
                  <p className="text-sm text-neutral-400 mb-5">{t("Pick as many as you like.", "اختر ما تريد، بلا حد.")}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {FEATURES.map((f) => (
                      <button
                        key={f}
                        onClick={() => toggle(features, setFeatures, f)}
                        className={`flex items-center gap-2.5 rounded-none border-2 px-4 py-3 text-sm font-semibold text-white text-start transition-all ${optionCls(features.includes(f))}`}
                      >
                        <span className={`w-4 h-4 shrink-0 border-2 flex items-center justify-center ${features.includes(f) ? "border-[#00E5FF] bg-[#00E5FF]" : "border-[#262626]"}`}>
                          {features.includes(f) && <Check className="w-3 h-3 text-black" />}
                        </span>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 6 && (
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{t("Last step — create your account", "الخطوة الأخيرة — أنشئ حسابك")}</h1>
                  <p className="text-sm text-neutral-400 mb-5">{t("This is a real account — you'll use it to log in.", "هذا حساب حقيقي — ستستخدمه لتسجيل الدخول.")}</p>

                  {submitError && <div className="rounded-none bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400 mb-4">{submitError}</div>}

                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); continueWithGoogle(); }}
                    className="inline-flex w-full items-center justify-center gap-2.5 rounded-none border border-[#262626] bg-black h-12 text-base font-bold text-white transition hover:bg-[#171717] hover:border-neutral-600 mb-4"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.35 11.1H12v2.8h5.35c-.2 1.35-1.4 3.95-5.35 3.95-3.2 0-5.8-2.65-5.8-5.9s2.6-5.9 5.8-5.9c1.85 0 3.1.8 3.8 1.5l2.55-2.45C17.3 3.1 15.05 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10c5.8 0 9.7-4.05 9.7-9.75 0-.65-.05-1.15-.35-1.45Z" fill="#4285F4"/>
                    </svg>
                    {t("Continue with Google", "المتابعة بحساب Google")}
                  </a>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 mb-4" style={mono}>
                    <span className="h-px flex-1 bg-[#262626]" />
                    {t("or register with email", "أو سجّل بالبريد")}
                    <span className="h-px flex-1 bg-[#262626]" />
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={t("First name", "الاسم الأول")} className="h-12 rounded-none bg-black border border-[#262626] text-white focus:ring-[#00E5FF]/40 focus:border-[#00E5FF]/50" />
                      <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={t("Last name", "اسم العائلة")} className="h-12 rounded-none bg-black border border-[#262626] text-white focus:ring-[#00E5FF]/40 focus:border-[#00E5FF]/50" />
                    </div>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("Email address", "بريدك الإلكتروني")} className="h-12 rounded-none bg-black border border-[#262626] text-white focus:ring-[#00E5FF]/40 focus:border-[#00E5FF]/50" />
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("Password (min. 8 characters)", "كلمة المرور (8 أحرف على الأقل)")} className="h-12 rounded-none bg-black border border-[#262626] text-white focus:ring-[#00E5FF]/40 focus:border-[#00E5FF]/50" autoComplete="new-password" />
                    <Input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder={t("Confirm password", "تأكيد كلمة المرور")} className="h-12 rounded-none bg-black border border-[#262626] text-white focus:ring-[#00E5FF]/40 focus:border-[#00E5FF]/50" autoComplete="new-password" />
                    <Button
                      onClick={submitWithEmail}
                      disabled={submitting || !firstName.trim() || !lastName.trim() || !email.trim() || password.length < 8 || !passwordConfirm}
                      className="w-full h-14 text-lg font-bold gap-2 rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none"
                    >
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 rtl:rotate-180" />}
                      {t("Finish", "إنهاء")}
                    </Button>
                  </div>
                </div>
              )}

              {step === 7 && result && (
                <div className="text-center">
                  <PartyPopper className="w-12 h-12 mx-auto mb-4 text-[#00E5FF]" />
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{t("Congratulations!", "مبروك!")}</h1>
                  <p className="text-neutral-400 mb-6">
                    {t("You got 1 month free", "حصلت على شهر مجاني")}
                    {result.plan ? ` — ${result.plan.name}` : ""}. {t("$1/mo after that — no credit card needed right now.", "دولار واحد شهرياً بعدها — بدون بطاقة ائتمان الآن.")}
                  </p>
                  <div className="border border-[#262626] divide-y divide-[#262626] mb-6 text-start">
                    {result.domains.map((d) => (
                      <div key={d.domain} className="px-4 py-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#00E5FF] shrink-0" />
                        <span className="text-sm text-white" style={mono}>{d.domain}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={localePath(locale, "/dashboard")}>
                    <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-lg font-bold gap-2 rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none">
                      {t("Go to my dashboard", "اذهب إلى لوحتي")} <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                    </Button>
                  </Link>
                </div>
              )}

              {step <= TOTAL_STEPS && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#262626]">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(Math.max(1, step - 1))}
                    className={step === 1 ? "invisible" : "text-neutral-400 hover:text-white hover:bg-[#171717]"}
                  >
                    <ArrowLeft className="w-4 h-4 rtl:rotate-180 me-1" /> {t("Back", "رجوع")}
                  </Button>
                  {step < TOTAL_STEPS ? (
                    <Button type="button" disabled={!canNext} onClick={() => setStep(step + 1)} className="gap-2 rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none">
                      {t("Next", "التالي")} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
