import type { Metadata } from "next";
import Link from "next/link";
import {
  Radio, Map, GitMerge, Building2, FileText, ShieldCheck,
  ArrowRight, Check, Eye, Layers, Lock, Gauge,
  BarChart2, ChevronRight, X, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/marketing/Navbar";
import MobileCtaBar from "@/components/marketing/MobileCtaBar";
import Footer from "@/components/marketing/Footer";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { organizationJsonLd, websiteJsonLd, softwareApplicationJsonLd } from "@/lib/seo";
import { headers } from "next/headers";

// Resolve the base URL from the actual request host, so every absolute URL on the
// page (canonical, OG, JSON-LD, the install snippet) matches the domain it's
// opened on — e.g. on eye-analysis.online they stay eye-analysis.online instead
// of the baked SITE_URL. Falls back to the configured domain if no host header.
function siteBase(): string {
  const h = headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";
  return host ? `${proto}://${host}` : "https://eye-analsyis.live";
}

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: { locale: string } }
): Promise<Metadata> {
  const locale = params.locale;
  const isAr = locale === "ar";

  const title = isAr
    ? "EYE — تتبع زوار موقعك وافهم ما يفعلونه"
    : "EYE — See who visits your site and what they do";

  const description = isAr
    ? "شاهد الزوار مباشرة، خرائط النقر, قمع التحويل، وملخصات يومية — بدون كوكيز، متوافق مع GDPR."
    : "Live visitor tracking, click heatmaps, conversion funnels, and daily summaries — no cookies, GDPR ready.";

  return {
    metadataBase: new URL(siteBase()),
    title,
    description,
    keywords: [
      "visitor analytics", "website analytics", "heatmaps", "session replay",
      "funnel analysis", "user behavior", "conversion optimization",
      "real-time analytics", "privacy-first analytics", "GDPR compliant analytics",
      "cookieless analytics", "eye analytics",
    ],
    authors: [{ name: "EYE Analytics" }],
    creator: "EYE Analytics",
    publisher: "EYE Analytics",
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    openGraph: {
      type: "website",
      locale: isAr ? "ar_SA" : "en_US",
      url: `/${locale}`,
      title,
      description,
      siteName: "EYE Analytics",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@eye_analytics",
    },
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", ar: "/ar" },
    },
    category: "technology",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations("landing");

  const FEATURES = [
    { icon: Radio,      idx: 0, iconColor: "text-indigo-600 dark:text-indigo-400",  iconBg: "bg-indigo-100 dark:bg-indigo-500/15"  },
    { icon: Map,        idx: 1, iconColor: "text-pink-600 dark:text-pink-400",       iconBg: "bg-pink-100 dark:bg-pink-500/15"       },
    { icon: GitMerge,   idx: 2, iconColor: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-100 dark:bg-emerald-500/15" },
    { icon: Building2,  idx: 3, iconColor: "text-amber-600 dark:text-amber-400",    iconBg: "bg-amber-100 dark:bg-amber-500/15"    },
    { icon: FileText,   idx: 4, iconColor: "text-cyan-600 dark:text-cyan-400",       iconBg: "bg-cyan-100 dark:bg-cyan-500/15"       },
    { icon: ShieldCheck,idx: 5, iconColor: "text-violet-600 dark:text-violet-400",  iconBg: "bg-violet-100 dark:bg-violet-500/15"  },
  ];

  const STEPS = [
    { icon: Layers,    idx: 0, color: "text-indigo-600 dark:text-indigo-400",   num: "bg-indigo-500"  },
    { icon: BarChart2, idx: 1, color: "text-emerald-600 dark:text-emerald-400", num: "bg-emerald-500" },
    { icon: Eye,       idx: 2, color: "text-violet-600 dark:text-violet-400",   num: "bg-violet-500"  },
  ];

  const MOCK_STATS = [
    { labelKey: "stat0Label", valueKey: "stat0Value", changeKey: "stat0Change", color: "text-indigo-500 dark:text-indigo-400"   },
    { labelKey: "stat1Label", valueKey: "stat1Value", changeKey: "stat1Change", color: "text-violet-500 dark:text-violet-400"   },
    { labelKey: "stat2Label", valueKey: "stat2Value", changeKey: "stat2Change", color: "text-emerald-500 dark:text-emerald-400" },
    { labelKey: "stat3Label", valueKey: "stat3Value", changeKey: "stat3Change", color: "text-pink-500 dark:text-pink-400"       },
  ];

  const TRUST_ITEMS = [
    { icon: ShieldCheck, lk: "trust.gdpr",       dk: "trust.gdprDesc",       bg: "bg-emerald-100 dark:bg-emerald-500/15", ic: "text-emerald-600 dark:text-emerald-400" },
    { icon: Lock,        lk: "trust.cookieless", dk: "trust.cookielessDesc", bg: "bg-indigo-100 dark:bg-indigo-500/15",  ic: "text-indigo-600 dark:text-indigo-400"  },
    { icon: Eye,         lk: "trust.ownership",  dk: "trust.ownershipDesc",  bg: "bg-violet-100 dark:bg-violet-500/15",  ic: "text-violet-600 dark:text-violet-400"  },
    { icon: Gauge,       lk: "trust.uptime",     dk: "trust.uptimeDesc",     bg: "bg-amber-100 dark:bg-amber-500/15",    ic: "text-amber-600 dark:text-amber-400"    },
  ] as const;

  const BARS = [35, 52, 45, 68, 58, 82, 65, 90, 55, 78, 65, 88, 60, 95];

  const seoDescription = locale === "ar"
    ? "تحليلات زوار خصوصية أولاً: تتبع مباشر، خرائط حرارية، إعادة الجلسات، القمع، وإسناد إيرادات الحملات."
    : "Privacy-first visitor analytics: live tracking, heatmaps, session replay, funnels and campaign revenue attribution.";

  const base = siteBase();

  return (
    <>
      <JsonLd data={[organizationJsonLd(base), websiteJsonLd(locale, base), softwareApplicationJsonLd(seoDescription, base)]} />
      {/* CSS-only ambient float for hero accents (no JS, hydration-safe) */}
      <style dangerouslySetInnerHTML={{ __html: "@keyframes eyeFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}" }} />
      <Navbar />
      <main className="overflow-hidden">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative isolate bg-surface pt-28 sm:pt-36 pb-16 sm:pb-24">
          {/* Ambient gradient blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
            <div className="absolute top-[-12%] ltr:left-[10%] rtl:right-[10%] w-[680px] h-[680px] max-w-[110vw] rounded-full bg-indigo-500/12 dark:bg-indigo-600/10 blur-[130px]" />
            <div className="absolute top-[18%] ltr:right-[4%] rtl:left-[4%] w-[480px] h-[480px] max-w-[100vw] rounded-full bg-violet-500/12 dark:bg-violet-600/10 blur-[120px]" />
            <div className="absolute bottom-[0%] ltr:left-[2%] rtl:right-[2%] w-[320px] h-[320px] rounded-full bg-pink-500/8 dark:bg-pink-600/6 blur-[100px]" />
          </div>
          {/* Faint grid texture, fading out toward edges */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(130,130,170,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(130,130,170,0.06) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage: "radial-gradient(ellipse 75% 55% at 50% 0%, #000 55%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 75% 55% at 50% 0%, #000 55%, transparent 100%)",
            }}
          />

          <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
            {/* Badge with live pulse */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-500/25 bg-indigo-500/10 px-3.5 py-1.5 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-indigo-600 dark:text-indigo-300">
                {t("hero.badge")}
              </span>
            </div>

            <h1 className="text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-7xl font-black tracking-tight text-on-surface mb-5">
              {t("hero.headline1")}
              <br />
              <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 dark:from-indigo-400 dark:via-violet-400 dark:to-pink-400 bg-clip-text text-transparent">
                {t("hero.headline2")}
              </span>
            </h1>

            <p className="text-base sm:text-xl text-on-surface-variant max-w-xl sm:max-w-2xl mx-auto mb-8 leading-relaxed">
              {t("hero.description")}
            </p>

            {/* CTAs — full width on mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-6">
              <Link href={`/${locale}/auth/register`} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 px-8 h-12 text-base font-semibold gap-2">
                  {t("hero.cta")}
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base gap-2">
                  {t("hero.ctaSecondary")}
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </Button>
              </a>
            </div>

            <div className="flex items-center justify-center gap-x-5 gap-y-2 flex-wrap text-xs sm:text-sm text-on-surface-variant/70">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> {t("hero.trustFree")}</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> {t("hero.trustCookies")}</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> {t("hero.trustGdpr")}</span>
            </div>

            {/* ── Product preview ── */}
            <div className="mt-14 sm:mt-20 relative max-w-5xl mx-auto">
              {/* Floating accent cards (desktop only) */}
              <div
                className="hidden lg:flex items-center gap-3 absolute -top-6 ltr:-left-10 rtl:-right-10 z-20 rounded-2xl border border-outline-variant/20 bg-surface-container/90 backdrop-blur-md shadow-xl shadow-black/10 dark:shadow-black/30 px-4 py-3"
                style={{ animation: "eyeFloat 6s ease-in-out infinite" }}
              >
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                </span>
                <div className="text-left rtl:text-right">
                  <p className="text-xl font-black text-on-surface leading-none">{t("hero.stat3Value")}</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">{t("hero.stat3Change")}</p>
                </div>
              </div>

              <div
                className="hidden lg:flex items-center gap-3 absolute -bottom-7 ltr:-right-8 rtl:-left-8 z-20 rounded-2xl border border-outline-variant/20 bg-surface-container/90 backdrop-blur-md shadow-xl shadow-black/10 dark:shadow-black/30 px-4 py-3"
                style={{ animation: "eyeFloat 7s ease-in-out infinite 0.6s" }}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-left rtl:text-right">
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none">{t("hero.stat2Value")}</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">{t("hero.stat2Label")}</p>
                </div>
              </div>

              {/* Browser-framed dashboard */}
              <div className="relative z-10 rounded-2xl sm:rounded-3xl border border-outline-variant/30 bg-surface-container/85 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/15 dark:shadow-black/50 ring-1 ring-black/5 dark:ring-white/5">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-outline-variant/20 bg-surface-container-high/60">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                    <div className="w-3 h-3 rounded-full bg-green-400/70" />
                  </div>
                  <div className="flex-1 mx-4 h-6 rounded-md bg-surface-container-high flex items-center px-3 gap-2">
                    <Lock className="w-3 h-3 text-on-surface-variant/40" />
                    <span className="text-[11px] text-on-surface-variant/50 font-mono truncate">{base.replace(/^https?:\/\//, "")}/dashboard</span>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                  </span>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
                    {MOCK_STATS.map((s) => (
                      <div key={s.labelKey} className="rounded-xl bg-surface-container-high/50 border border-outline-variant/10 p-3 sm:p-3.5 text-left rtl:text-right">
                        <p className="text-[11px] sm:text-xs text-on-surface-variant/70 mb-1 truncate">{t(`hero.${s.labelKey}` as any)}</p>
                        <p className={`text-lg sm:text-xl font-black ${s.color}`}>{t(`hero.${s.valueKey}` as any)}</p>
                        <p className="text-[10px] sm:text-[11px] text-emerald-500 dark:text-emerald-400 mt-0.5 font-medium truncate">{t(`hero.${s.changeKey}` as any)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl bg-surface-container-high/30 border border-outline-variant/10 p-3 sm:p-4 flex items-end gap-1 sm:gap-1.5 h-24 sm:h-28">
                    {BARS.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-indigo-500/70 to-violet-500/40 dark:from-indigo-400/60 dark:to-violet-400/30"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/5 h-20 bg-indigo-500/20 dark:bg-indigo-500/15 blur-3xl rounded-full pointer-events-none" />
            </div>
          </div>
        </section>

        {/* ── Problem ──────────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-24 bg-surface-container/15">
          <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
                {t("problem.badge")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
                {t("problem.headline")}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 rounded-2xl bg-surface border border-outline-variant/20 p-4">
                  <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-rose-500 dark:text-rose-400" />
                  </div>
                  <p className="text-sm text-on-surface-variant">{t(`problem.${i}` as any)}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-indigo-500/8 dark:bg-indigo-500/12 border border-indigo-200 dark:border-indigo-500/25 p-5 text-center">
              <p className="text-base font-semibold text-on-surface">{t("problem.answer")}</p>
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────────── */}
        <section id="features" className="py-20 sm:py-28 bg-surface">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <Badge className="mb-4 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-500/20 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
                {t("features.badge")}
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-black text-on-surface tracking-tight mb-4">
                {t("features.headline")}
                <span className="text-violet-600 dark:text-violet-400"> {t("features.headlineAccent")}</span>
              </h2>
              <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto">
                {t("features.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.idx} className="rounded-2xl sm:rounded-3xl bg-surface-container/30 border border-outline-variant/15 p-6 hover:border-outline-variant/40 hover:bg-surface-container/50 hover:-translate-y-0.5 transition-all group">
                    <div className={`w-12 h-12 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-5 ${feature.iconColor} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-on-surface mb-2">{t(`features.${feature.idx}title` as any)}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{t(`features.${feature.idx}desc` as any)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-20 sm:py-28 bg-surface-container/15">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
                {t("howItWorks.badge")}
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-black text-on-surface tracking-tight mb-4">
                {t("howItWorks.headline")}
                <span className="text-emerald-600 dark:text-emerald-400"> {t("howItWorks.headlineAccent")}</span>
              </h2>
              <p className="text-base sm:text-lg text-on-surface-variant max-w-xl mx-auto">
                {t("howItWorks.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 mb-14 sm:mb-16">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.idx} className="relative text-center">
                    {i < STEPS.length - 1 && (
                      <div className="hidden md:block absolute top-10 ltr:left-[calc(50%+52px)] rtl:right-[calc(50%+52px)] ltr:right-[-50%] rtl:left-[-50%] h-px border-t border-dashed border-outline-variant/30" />
                    )}
                    <div className="w-20 h-20 rounded-3xl bg-surface-container border border-outline-variant/30 flex items-center justify-center mx-auto mb-6 relative">
                      <Icon className={`w-8 h-8 ${step.color}`} />
                      <span className={`absolute -top-2.5 ltr:-right-2.5 rtl:-left-2.5 w-6 h-6 rounded-full ${step.num} text-white text-xs font-black flex items-center justify-center shadow-sm`}>
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-on-surface mb-2">{t(`howItWorks.${step.idx}title` as any)}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{t(`howItWorks.${step.idx}desc` as any)}</p>
                  </div>
                );
              })}
            </div>

            {/* Code snippet */}
            <div className="max-w-2xl mx-auto">
              <div className="rounded-2xl sm:rounded-3xl bg-surface-container border border-outline-variant/25 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 bg-surface-container-high/50">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                    </div>
                    <span className="text-xs text-on-surface-variant/60 ltr:ml-2 rtl:mr-2 font-mono">index.html</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">HTML</span>
                </div>
                <pre className="p-5 sm:p-6 text-xs sm:text-sm font-mono text-on-surface-variant overflow-x-auto leading-relaxed ltr">
                  <code>
                    <span className="text-pink-500 dark:text-pink-400">{"<script"}</span>
                    {"\n  "}<span className="text-indigo-600 dark:text-indigo-400">src</span>
                    {"="}<span className="text-emerald-600 dark:text-emerald-400">{`"${base}/tracker/eye.js"`}</span>
                    {"\n  "}<span className="text-indigo-600 dark:text-indigo-400">data-site-id</span>
                    {"="}<span className="text-emerald-600 dark:text-emerald-400">{'"YOUR_SITE_ID"'}</span>
                    {"\n  "}<span className="text-pink-500 dark:text-pink-400">{"defer></script>"}</span>
                  </code>
                </pre>
              </div>
              <p className="text-center text-xs text-on-surface-variant/50 mt-3 font-medium">
                {t("howItWorks.codeNote")}
              </p>
            </div>
          </div>
        </section>

        {/* ── Trust / Privacy Bar ───────────────────────────────────────────── */}
        <section className="py-14 sm:py-16 border-y border-outline-variant/15 bg-surface">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {TRUST_ITEMS.map(({ icon: Icon, lk, dk, bg, ic }) => (
                <div key={lk} className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-5 h-5 ${ic}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{t(lk as any)}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{t(dk as any)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-24 bg-surface-container/15">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <Badge className="mb-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
                {t("faq.badge")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
                {t("faq.headline")}
              </h2>
            </div>
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <details key={i} className="group rounded-2xl bg-surface border border-outline-variant/20 overflow-hidden">
                  <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none hover:bg-surface-container/50 transition-colors">
                    <span className="text-sm font-semibold text-on-surface">{t(`faq.q${i}` as any)}</span>
                    <ChevronRight className="w-4 h-4 text-on-surface-variant shrink-0 transition-transform duration-200 group-open:rotate-90 rtl:rotate-180 rtl:group-open:rotate-90" />
                  </summary>
                  <div className="px-5 pb-5">
                    <p className="text-sm text-on-surface-variant leading-relaxed">{t(`faq.a${i}` as any)}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────────────── */}
        <section className="py-24 sm:py-32 relative overflow-hidden bg-surface">
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] max-w-[120vw] rounded-full bg-indigo-500/12 dark:bg-indigo-600/10 blur-[140px]" />
          </div>
          <div className="relative max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl sm:text-6xl font-black text-on-surface tracking-tight mb-5 leading-[1.08]">
              {t("cta.headline")}
              <span className="bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                {" "}{t("cta.headlineAccent")}
              </span>
            </h2>
            <p className="text-base sm:text-lg text-on-surface-variant mb-8 leading-relaxed">{t("cta.description")}</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Link href={`/${locale}/auth/register`} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/25 px-10 h-14 text-lg font-bold gap-2">
                  {t("cta.primary")}
                  <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                </Button>
              </Link>
              <Link href={`/${locale}/pricing`} className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base">
                  {t("cta.secondary")}
                </Button>
              </Link>
            </div>
            <p className="mt-5 text-sm text-on-surface-variant/50">{t("cta.note")}</p>
          </div>
        </section>

      </main>
      <Footer locale={locale} />
      <MobileCtaBar />
    </>
  );
}
