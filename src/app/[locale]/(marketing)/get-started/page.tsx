"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  ArrowRight, ArrowLeft, Check, X, Loader2, User, Megaphone, Globe,
  ScanSearch, Gauge, Layers, PartyPopper, Sparkles, Eye, Sun, Moon, Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { onboardingApi, type QuizDomain } from "@/api/onboarding";
import { toolsApi } from "@/api/tools";
import { useAuthStore } from "@/store/auth";
import { localePath } from "@/lib/seo";
import { trackSignup, eyeTrack } from "@/lib/track";

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
    <header className="py-4 border-b border-outline-variant/10">
      <div className="max-w-2xl mx-auto px-5 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={localePath(locale)} className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Eye className="w-4 h-4 text-white" />
            </span>
            <span className="text-lg font-black tracking-tight text-on-surface">EYE<span className="text-indigo-500 dark:text-indigo-400">.</span></span>
          </Link>
          <Link href={localePath(locale)} className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
            {ar ? "الرئيسية" : "Home"}
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={switchLocale} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors">
            <Languages className="w-4 h-4" /> {ar ? "EN" : "عربي"}
          </button>
          <button onClick={toggleTheme} aria-label="Toggle theme" className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors">
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
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<{ domains: { domain: string }[]; plan: { name: string } | null; trial_ends_at: string | null } | null>(null);

  const t = (en: string, arText: string) => (ar ? arText : en);

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
  });

  const submitWithEmail = async () => {
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const r = await onboardingApi.submitQuiz({ ...buildPayload(), email: email.trim(), name: name.trim() || undefined });
      const data = r.data?.data ?? r.data;
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        trackSignup(data.user?.id, email.trim());
      }
      eyeTrack("quiz_completed", { role, domains: domains.length, plan: data.plan?.slug });
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

  return (
    <div dir={ar ? "rtl" : "ltr"} className="min-h-screen bg-background text-on-surface flex flex-col">
      <MinimalHeader locale={locale} />
      <main className="flex-1 bg-surface">
        <section className="py-10 sm:py-16">
          <div className="max-w-2xl mx-auto px-5 sm:px-6">
            {step <= TOTAL_STEPS && (
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs text-on-surface-variant mb-2">
                  <span>{t("Get started", "ابدأ الآن")}</span>
                  <span>{step}/{TOTAL_STEPS}</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-outline-variant/15 bg-surface-container/20 p-6 sm:p-9">
              {step === 1 && (
                <div>
                  <h1 className="text-2xl font-black mb-6">{t("Who are you?", "من أنت؟")}</h1>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "site_owner" as const, icon: Globe, label: t("Site Owner", "صاحب موقع") },
                      { key: "marketer" as const, icon: Megaphone, label: t("Marketer", "مسوّق") },
                    ].map((o) => (
                      <button
                        key={o.key}
                        onClick={() => setRole(o.key)}
                        className={`rounded-2xl border-2 p-6 text-center transition-all ${role === o.key ? "border-indigo-500 bg-indigo-500/10" : "border-outline-variant/20 hover:border-indigo-500/40"}`}
                      >
                        <o.icon className="w-8 h-8 mx-auto mb-3 text-indigo-500 dark:text-indigo-400" />
                        <p className="font-bold">{o.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h1 className="text-2xl font-black mb-6">{t("How many sites do you manage?", "كم عدد المواقع التي تديرها؟")}</h1>
                  <Input
                    type="number"
                    min={0}
                    value={sitesManaged}
                    onChange={(e) => setSitesManaged(e.target.value)}
                    placeholder="1"
                    className="h-14 text-2xl text-center font-black max-w-[160px] mx-auto"
                  />
                </div>
              )}

              {step === 3 && (
                <div>
                  <h1 className="text-2xl font-black mb-6">{t("What are your sites mostly built with?", "بماذا مبنية مواقعك غالباً؟")}</h1>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => toggle(languages, setLanguages, lang)}
                        className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${languages.includes(lang) ? "border-indigo-500 bg-indigo-500/10" : "border-outline-variant/20 hover:border-indigo-500/40"}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h1 className="text-2xl font-black mb-2">{t("Enter your domain(s)", "أدخل موقعك أو مواقعك")}</h1>
                  <p className="text-sm text-on-surface-variant mb-5">{t("Add up to 5, then test them — SEO, speed, and sitemap, in one shot.", "أضف حتى 5 مواقع، ثم افحصها — سيو، سرعة، وخريطة الموقع دفعة واحدة.")}</p>

                  <div className="flex gap-2 mb-4">
                    <Input
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDomain(); } }}
                      placeholder="yoursite.com"
                      className="h-12 flex-1"
                    />
                    <Button type="button" onClick={addDomain} disabled={domains.length >= 5} className="h-12 px-5">{t("Add", "إضافة")}</Button>
                  </div>

                  {domains.length > 0 && (
                    <div className="space-y-3 mb-5">
                      {domains.map((d) => (
                        <div key={d.domain} className="rounded-xl border border-outline-variant/15 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm flex-1 truncate">{d.domain}</span>
                            {d.testing && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
                            <button onClick={() => removeDomain(d.domain)} aria-label="remove"><X className="w-4 h-4 text-on-surface-variant/60 hover:text-error" /></button>
                          </div>
                          {d.testError && <p className="text-xs text-error mt-2">{d.testError}</p>}
                          {!d.testing && (d.seo_score != null || d.speed_score != null || d.pages_found != null) && (
                            <div className="flex flex-wrap items-center gap-2 mt-2.5">
                              {d.seo_score != null && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2.5 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                  <ScanSearch className="w-3.5 h-3.5" /> {t("SEO score", "درجة السيو")}: {d.seo_score}/100
                                </span>
                              )}
                              {d.speed_score != null && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                  <Gauge className="w-3.5 h-3.5" /> {t("Speed score", "درجة السرعة")}: {d.speed_score}/100
                                </span>
                              )}
                              {d.pages_found != null && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-500/10 px-2.5 py-1.5 text-xs font-bold text-violet-600 dark:text-violet-400">
                                  <Layers className="w-3.5 h-3.5" /> {t("Pages found", "عدد الصفحات")}: {d.pages_found}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={runTests} className="w-full h-11 gap-2">
                        <ScanSearch className="w-4 h-4" /> {t("Test my site(s)", "افحص موقعي/مواقعي")}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {step === 5 && (
                <div>
                  <h1 className="text-2xl font-black mb-2">{t("Which features interest you most?", "ما الميزات التي تهمك أكثر؟")}</h1>
                  <p className="text-sm text-on-surface-variant mb-5">{t("Pick as many as you like.", "اختر ما تريد، بلا حد.")}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {FEATURES.map((f) => (
                      <button
                        key={f}
                        onClick={() => toggle(features, setFeatures, f)}
                        className={`flex items-center gap-2.5 rounded-xl border-2 px-4 py-3 text-sm font-semibold text-start transition-all ${features.includes(f) ? "border-indigo-500 bg-indigo-500/10" : "border-outline-variant/20 hover:border-indigo-500/40"}`}
                      >
                        <span className={`w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center ${features.includes(f) ? "border-indigo-500 bg-indigo-500" : "border-outline-variant/40"}`}>
                          {features.includes(f) && <Check className="w-3 h-3 text-white" />}
                        </span>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 6 && (
                <div>
                  <h1 className="text-2xl font-black mb-2">{t("Last step — how do we reach you?", "الخطوة الأخيرة — كيف نصل إليك؟")}</h1>
                  <p className="text-sm text-on-surface-variant mb-5">{t("No password needed right now.", "بدون كلمة مرور الآن.")}</p>

                  {submitError && <div className="rounded-lg bg-error-container/30 border border-error/20 px-4 py-3 text-sm text-error mb-4">{submitError}</div>}

                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); continueWithGoogle(); }}
                    className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-primary/30 bg-surface h-12 text-base font-bold text-on-surface shadow-md transition hover:bg-surface-container hover:border-primary/50 mb-4"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.35 11.1H12v2.8h5.35c-.2 1.35-1.4 3.95-5.35 3.95-3.2 0-5.8-2.65-5.8-5.9s2.6-5.9 5.8-5.9c1.85 0 3.1.8 3.8 1.5l2.55-2.45C17.3 3.1 15.05 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10c5.8 0 9.7-4.05 9.7-9.75 0-.65-.05-1.15-.35-1.45Z" fill="#4285F4"/>
                    </svg>
                    {t("Continue with Google", "المتابعة بحساب Google")}
                  </a>
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant/70 mb-4">
                    <span className="h-px flex-1 bg-outline-variant/50" />
                    {t("or use email", "أو بالبريد")}
                    <span className="h-px flex-1 bg-outline-variant/50" />
                  </div>
                  <div className="space-y-3">
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Name (optional)", "الاسم (اختياري)")} className="h-12" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("Email address", "بريدك الإلكتروني")} className="h-12" />
                    <Button onClick={submitWithEmail} disabled={submitting || !email.trim()} className="w-full h-14 text-lg font-bold gap-2">
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 rtl:rotate-180" />}
                      {t("Finish", "إنهاء")}
                    </Button>
                  </div>
                </div>
              )}

              {step === 7 && result && (
                <div className="text-center">
                  <PartyPopper className="w-12 h-12 mx-auto mb-4 text-indigo-500" />
                  <h1 className="text-2xl sm:text-3xl font-black mb-2">{t("Congratulations!", "مبروك!")}</h1>
                  <p className="text-on-surface-variant mb-6">
                    {t("You got 1 month free", "حصلت على شهر مجاني")}
                    {result.plan ? ` — ${result.plan.name}` : ""}. {t("$1/mo after that — no credit card needed right now.", "دولار واحد شهرياً بعدها — بدون بطاقة ائتمان الآن.")}
                  </p>
                  <div className="rounded-xl border border-outline-variant/15 divide-y divide-outline-variant/10 mb-6 text-start">
                    {result.domains.map((d) => (
                      <div key={d.domain} className="px-4 py-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="font-mono text-sm">{d.domain}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={localePath(locale, "/dashboard")}>
                    <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-lg font-bold gap-2">
                      {t("Go to my dashboard", "اذهب إلى لوحتي")} <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                    </Button>
                  </Link>
                </div>
              )}

              {step <= TOTAL_STEPS && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-outline-variant/15">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(Math.max(1, step - 1))}
                    className={step === 1 ? "invisible" : ""}
                  >
                    <ArrowLeft className="w-4 h-4 rtl:rotate-180 me-1" /> {t("Back", "رجوع")}
                  </Button>
                  {step < TOTAL_STEPS ? (
                    <Button type="button" disabled={!canNext} onClick={() => setStep(step + 1)} className="gap-2">
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
