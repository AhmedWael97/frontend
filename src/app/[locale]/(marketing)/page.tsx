import type { Metadata } from "next";
import Link from "next/link";
import {
  Brain, Zap, Globe2, ShieldCheck,
  Play, ArrowRight, Check, Star, Eye, MousePointer2,
  TrendingUp, Layers, Lock, Gauge
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { getTranslations } from "next-intl/server";

// â”€â”€â”€ SEO Metadata â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function generateMetadata(
  { params }: { params: { locale: string } }
): Promise<Metadata> {
  const locale = params.locale;
  const isAr = locale === "ar";

  const title = isAr
    ? "EYE â€” Ù…Ù†ØµØ© Ø°ÙƒØ§Ø¡ Ø§Ù„Ø²ÙˆØ§Ø± Ø¨Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ"
    : "EYE â€” AI-Powered Visitor Intelligence & Analytics";

  const description = isAr
    ? "ØªØªØ¨Ø¹ Ø§Ù„Ø²ÙˆØ§Ø±ØŒ ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø³Ù„ÙˆÙƒØŒ Ø¨Ù†Ø§Ø¡ Ù‚Ù…Ø¹ Ø§Ù„Ù…Ø¨ÙŠØ¹Ø§ØªØŒ ÙˆØªØ­Ø³ÙŠÙ† ØªØ¬Ø±Ø¨Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¨Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ. Ø§Ø¨Ø¯Ø£ Ù…Ø¬Ø§Ù†Ø§Ù‹."
    : "Track every visitor, understand their behavior, build conversion funnels, and boost UX with real-time AI insights. Privacy-first, no cookies required.";

  return {
    title,
    description,
    keywords: [
      "visitor analytics", "website analytics", "AI analytics", "heatmaps",
      "session replay", "funnel analysis", "user behavior", "conversion optimization",
      "B2B visitor tracking", "real-time analytics", "privacy-first analytics",
      "GDPR compliant analytics", "cookieless analytics", "eye analytics",
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
      title,
      description,
      siteName: "EYE Analytics",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "EYE Analytics â€” AI Visitor Intelligence",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@eye_analytics",
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", ar: "/ar" },
    },
    category: "technology",
  };
}

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default async function HomePage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations("landing");

  const FEATURES = [
    { icon: Brain,         idx: 0, iconColor: "text-indigo-600 dark:text-indigo-400", cardBg: "bg-indigo-50/80 dark:bg-gradient-to-br dark:from-indigo-500/20 dark:to-violet-500/10",  iconBg: "bg-indigo-100 dark:bg-surface-container" },
    { icon: MousePointer2, idx: 1, iconColor: "text-pink-600 dark:text-pink-400",     cardBg: "bg-pink-50/80 dark:bg-gradient-to-br dark:from-pink-500/20 dark:to-rose-500/10",       iconBg: "bg-pink-100 dark:bg-surface-container" },
    { icon: TrendingUp,    idx: 2, iconColor: "text-emerald-600 dark:text-emerald-400",cardBg: "bg-emerald-50/80 dark:bg-gradient-to-br dark:from-emerald-500/20 dark:to-teal-500/10",iconBg: "bg-emerald-100 dark:bg-surface-container" },
    { icon: Globe2,        idx: 3, iconColor: "text-amber-600 dark:text-amber-400",   cardBg: "bg-amber-50/80 dark:bg-gradient-to-br dark:from-amber-500/20 dark:to-orange-500/10",  iconBg: "bg-amber-100 dark:bg-surface-container" },
    { icon: Zap,           idx: 4, iconColor: "text-cyan-600 dark:text-cyan-400",     cardBg: "bg-cyan-50/80 dark:bg-gradient-to-br dark:from-cyan-500/20 dark:to-sky-500/10",        iconBg: "bg-cyan-100 dark:bg-surface-container" },
    { icon: ShieldCheck,   idx: 5, iconColor: "text-violet-600 dark:text-violet-400", cardBg: "bg-violet-50/80 dark:bg-gradient-to-br dark:from-violet-500/20 dark:to-purple-500/10", iconBg: "bg-violet-100 dark:bg-surface-container" },
  ];

  const STEPS = [
    { icon: Layers, idx: 0 },
    { icon: Gauge,  idx: 1 },
    { icon: Brain,  idx: 2 },
  ];

  const STATS = [
    { value: "1B+",   key: "events"   },
    { value: "50K+",  key: "websites" },
    { value: "99.9%", key: "uptime"   },
    { value: "<1ms",  key: "impact"   },
  ];

  const MOCK_STATS = [
    { labelKey: "stat0Label", valueKey: "stat0Value", changeKey: "stat0Change", color: "text-indigo-500 dark:text-indigo-400" },
    { labelKey: "stat1Label", valueKey: "stat1Value", changeKey: "stat1Change", color: "text-violet-500 dark:text-violet-400" },
    { labelKey: "stat2Label", valueKey: "stat2Value", changeKey: "stat2Change", color: "text-emerald-500 dark:text-emerald-400" },
    { labelKey: "stat3Label", valueKey: "stat3Value", changeKey: "stat3Change", color: "text-pink-500 dark:text-pink-400" },
  ];

  return (
    <>
      <Navbar />
      <main className="overflow-hidden">

        {/* â”€â”€ Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="relative min-h-screen flex items-center pt-16">
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-500/20 dark:bg-indigo-600/10 blur-[120px]" />
            <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-violet-500/15 dark:bg-violet-600/10 blur-[100px]" />
            <div className="absolute bottom-[5%] left-[5%] w-[300px] h-[300px] rounded-full bg-cyan-500/10 dark:bg-cyan-600/8 blur-[80px]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <Badge className="mb-6 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
              âœ¦ {t("hero.badge")}
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-on-surface leading-[1.05] mb-6">
              {t("hero.headline1")}
              <br />
              <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 dark:from-indigo-400 dark:via-violet-400 dark:to-pink-400 bg-clip-text text-transparent">
                {t("hero.headline2")}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
              {t("hero.description")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={`/${locale}/auth/register`}>
                <Button size="lg" className="bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/25 px-8 h-12 text-base font-semibold">
                  {t("hero.cta")}
                  <ArrowRight className="w-4 h-4 ltr:ml-2 rtl:mr-2" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                  <Play className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                  {t("hero.ctaSecondary")}
                </Button>
              </a>
            </div>

            <p className="mt-5 text-xs text-on-surface-variant/60 flex items-center justify-center gap-4 flex-wrap">
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> {t("hero.trustFree")}</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> {t("hero.trustCookies")}</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> {t("hero.trustGdpr")}</span>
            </p>

            {/* Dashboard mock */}
            <div className="mt-16 relative max-w-5xl mx-auto">
              <div className="rounded-2xl border border-outline-variant/30 bg-surface-container/60 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/20 dark:shadow-black/40">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-outline-variant/20 bg-surface-container">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 mx-4 h-6 rounded-md bg-surface-container-high/80 flex items-center px-3">
                    <span className="text-xs text-on-surface-variant/60">{t("hero.mockUrl")}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {MOCK_STATS.map((s) => (
                      <div key={s.labelKey} className="rounded-xl bg-surface-container-high/60 p-4">
                        <p className="text-xs text-on-surface-variant mb-1">{t(`hero.${s.labelKey}` as any)}</p>
                        <p className={`text-2xl font-black ${s.color}`}>{t(`hero.${s.valueKey}` as any)}</p>
                        <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">{t(`hero.${s.changeKey}` as any)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl bg-surface-container-high/40 p-4 flex items-end gap-1.5 h-32">
                    {[40, 65, 55, 80, 70, 90, 75, 95, 60, 85, 72, 88, 65, 92].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-indigo-500/60 to-violet-500/40" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-indigo-500/20 blur-3xl rounded-full" />
            </div>
          </div>
        </section>

        {/* â”€â”€ Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="py-20 border-y border-outline-variant/20 bg-surface-container/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {STATS.map((stat) => (
                <div key={stat.key} className="text-center">
                  <p className="text-4xl font-black bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-sm text-on-surface-variant mt-1">{t(`stats.${stat.key}` as any)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* â”€â”€ Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section id="features" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-500/20 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
                {t("features.badge")}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-black text-on-surface tracking-tight mb-4">
                {t("features.headline")}
                <span className="text-violet-600 dark:text-violet-400"> {t("features.headlineAccent")}</span>
              </h2>
              <p className="text-lg text-on-surface-variant max-w-xl mx-auto">
                {t("features.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.idx}
                    className={`relative rounded-2xl ${feature.cardBg} border border-outline-variant/20 p-6 hover:border-outline-variant/40 hover:shadow-md dark:hover:shadow-black/20 transition-all group`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 ${feature.iconColor} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-black text-on-surface mb-2">{t(`features.${feature.idx}title` as any)}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{t(`features.${feature.idx}desc` as any)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* â”€â”€ How It Works â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section id="how-it-works" className="py-24 bg-surface-container/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
                {t("howItWorks.badge")}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-black text-on-surface tracking-tight mb-4">
                {t("howItWorks.headline")}
                <span className="text-emerald-600 dark:text-emerald-400"> {t("howItWorks.headlineAccent")}</span>
              </h2>
              <p className="text-lg text-on-surface-variant max-w-xl mx-auto">
                {t("howItWorks.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.idx} className="relative text-center">
                    {i < STEPS.length - 1 && (
                      <div className="hidden md:block absolute top-10 ltr:left-[calc(50%+48px)] rtl:right-[calc(50%+48px)] ltr:right-[calc(-50%+48px)] rtl:left-[calc(-50%+48px)] h-px bg-gradient-to-r from-outline-variant/40 to-outline-variant/10" />
                    )}
                    <div className="w-20 h-20 rounded-2xl bg-surface-container border border-outline-variant/30 flex items-center justify-center mx-auto mb-6 relative">
                      <Icon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-on-surface mb-3">{t(`howItWorks.${step.idx}title` as any)}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{t(`howItWorks.${step.idx}desc` as any)}</p>
                  </div>
                );
              })}
            </div>

            {/* Code snippet */}
            <div className="mt-16 max-w-2xl mx-auto">
              <div className="rounded-2xl bg-surface-container border border-outline-variant/30 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-outline-variant/20 bg-surface-container-high/50">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  </div>
                  <span className="text-xs text-on-surface-variant ltr:ml-2 rtl:mr-2">index.html</span>
                </div>
                <pre className="p-6 text-sm font-mono text-on-surface-variant overflow-x-auto">
                  <code>
                    <span className="text-pink-500 dark:text-pink-400">{"<script"}</span>
                    {" "}<span className="text-indigo-600 dark:text-indigo-400">src</span>
                    <span>{"="}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{'"https://cdn.eye.ai/tracker.js"'}</span>
                    <span className="text-pink-500 dark:text-pink-400">{"\n  "}</span>
                    <span className="text-indigo-600 dark:text-indigo-400">data-site-id</span>
                    <span>{"="}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{'"YOUR_SITE_ID"'}</span>
                    <span className="text-pink-500 dark:text-pink-400">{"\n  defer></script>"}</span>
                  </code>
                </pre>
              </div>
              <p className="text-center text-xs text-on-surface-variant mt-3">
                {t("howItWorks.codeNote")}
              </p>
            </div>
          </div>
        </section>

        {/* â”€â”€ Testimonials â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-on-surface tracking-tight mb-4">
                {t("testimonials.headline")}
              </h2>
              <p className="text-lg text-on-surface-variant">
                {t("testimonials.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-white/80 dark:bg-surface-container border border-outline-variant/20 p-6 hover:border-outline-variant/40 transition-all shadow-sm dark:shadow-none"
                >
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed mb-6">&ldquo;{t(`testimonials.${idx}quote` as any)}&rdquo;</p>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{t(`testimonials.${idx}author` as any)}</p>
                    <p className="text-xs text-on-surface-variant">{t(`testimonials.${idx}role` as any)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* â”€â”€ Privacy / Trust bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="py-16 border-y border-outline-variant/20 bg-surface-container/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {([
                { icon: ShieldCheck, lk: "trust.gdpr",      dk: "trust.gdprDesc" },
                { icon: Lock,        lk: "trust.cookieless", dk: "trust.cookielessDesc" },
                { icon: Eye,         lk: "trust.ownership",  dk: "trust.ownershipDesc" },
                { icon: Gauge,       lk: "trust.uptime",     dk: "trust.uptimeDesc" },
              ] as const).map(({ icon: Icon, lk, dk }) => (
                <div key={lk} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{t(lk as any)}</p>
                    <p className="text-xs text-on-surface-variant">{t(dk as any)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* â”€â”€ Final CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-indigo-500/15 dark:bg-indigo-600/10 blur-[120px]" />
          </div>
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-5xl sm:text-6xl font-black text-on-surface tracking-tight mb-6">
              {t("cta.headline")}
              <span className="bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                {" "}{t("cta.headlineAccent")}
              </span>
            </h2>
            <p className="text-lg text-on-surface-variant mb-10">
              {t("cta.description")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={`/${locale}/auth/register`}>
                <Button size="lg" className="bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/25 px-10 h-14 text-lg font-bold">
                  {t("cta.primary")}
                  <ArrowRight className="w-5 h-5 ltr:ml-2 rtl:mr-2" />
                </Button>
              </Link>
              <Link href={`/${locale}/pricing`}>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base">
                  {t("cta.secondary")}
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-on-surface-variant/60">
              {t("cta.note")}
            </p>
          </div>
        </section>

      </main>
      <Footer locale={locale} />
    </>
  );
}
