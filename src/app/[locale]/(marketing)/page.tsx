import type { Metadata } from "next";
import Link from "next/link";
import {
  Radio, Map, GitMerge, Building2, FileText, ShieldCheck,
  ArrowRight, Check, Eye, Layers, Lock, Gauge, ScanSearch,
  BarChart2, ChevronRight, TrendingUp, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/marketing/Navbar";
import MobileCtaBar from "@/components/marketing/MobileCtaBar";
import LiveStatsStrip from "@/components/marketing/LiveStatsStrip";
import EventTypeTicker from "@/components/marketing/EventTypeTicker";
import LiveTerminalPreview from "@/components/marketing/LiveTerminalPreview";
import CapabilityRail from "@/components/marketing/CapabilityRail";
import BeforeAfterSlider from "@/components/marketing/BeforeAfterSlider";
import PricingTeaser from "@/components/marketing/PricingTeaser";
import GoogleOneTap from "@/components/auth/GoogleOneTap";
import Footer from "@/components/marketing/Footer";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { organizationJsonLd, websiteJsonLd, softwareApplicationJsonLd, localePath } from "@/lib/seo";
import { headers } from "next/headers";
import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/Reveal";
import SignupPopup from "@/components/marketing/SignupPopup";

// Resolve the base URL from the actual request host, so every absolute URL on the
// page (canonical, OG, JSON-LD, the install snippet) matches the domain it's
// opened on — e.g. on eye-analysis.online they stay eye-analysis.online instead
// of the baked SITE_URL. Falls back to the configured domain if no host header.
function siteBase(): string {
  const h = headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";
  return host ? `${proto}://${host}` : "https://eye-analysis.online";
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
      url: localePath(locale),
      title,
      description,
      siteName: "EYE Analytics",
      // An explicit openGraph object here replaces (not merges with) the root
      // layout's default, including its images — so it must repeat them, or
      // the homepage silently ships with no OG image at all.
      images: [`${siteBase()}${localePath(locale, "/opengraph-image")}`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@eye_analytics",
      images: [`${siteBase()}${localePath(locale, "/twitter-image")}`],
    },
    alternates: {
      canonical: localePath(locale),
      languages: { en: localePath("en"), ar: localePath("ar") },
    },
    category: "technology",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { locale } = params;
  const t = await getTranslations("landing");
  // Root namespace — "pricing" lives top-level in messages/*.json, not under "landing".
  const tp = await getTranslations("pricing");
  // A/B Studio split_url experiment "hero-copy" redirects the variant bucket to ?hero=b.
  const heroVariantB = searchParams?.hero === "b";
  const ar = locale === "ar";

  const CAPABILITIES = [
    { icon: Radio,       title: t("features.0title"), desc: t("features.0desc") },
    { icon: Map,         title: t("features.1title"), desc: t("features.1desc") },
    { icon: GitMerge,    title: t("features.2title"), desc: t("features.2desc") },
    { icon: Building2,   title: t("features.3title"), desc: t("features.3desc") },
    { icon: FileText,    title: t("features.4title"), desc: t("features.4desc") },
    { icon: ShieldCheck, title: t("features.5title"), desc: t("features.5desc") },
  ];

  const CONTROL_ROWS = [
    { icon: Radio,       label: t("oneDashboard.row0") },
    { icon: TrendingUp,  label: t("oneDashboard.row1") },
    { icon: GitMerge,    label: t("oneDashboard.row2") },
    { icon: ShieldCheck, label: t("oneDashboard.row3") },
  ];

  const MOCK_STATS = [
    { labelKey: "stat0Label", valueKey: "stat0Value", changeKey: "stat0Change" },
    { labelKey: "stat1Label", valueKey: "stat1Value", changeKey: "stat1Change" },
    { labelKey: "stat2Label", valueKey: "stat2Value", changeKey: "stat2Change" },
    { labelKey: "stat3Label", valueKey: "stat3Value", changeKey: "stat3Change" },
  ];

  const TRUST_ITEMS = [
    { lk: "trust.gdpr",       dk: "trust.gdprDesc" },
    { lk: "trust.cookieless", dk: "trust.cookielessDesc" },
    { lk: "trust.ownership",  dk: "trust.ownershipDesc" },
    { lk: "trust.uptime",     dk: "trust.uptimeDesc" },
  ] as const;

  const seoDescription = ar
    ? "تحليلات زوار خصوصية أولاً: تتبع مباشر، خرائط حرارية، إعادة الجلسات، القمع، وإسناد إيرادات الحملات."
    : "Privacy-first visitor analytics: live tracking, heatmaps, session replay, funnels and campaign revenue attribution.";

  const base = siteBase();
  const mono = { fontFamily: "var(--font-mono-marketing)" };

  return (
    <>
      <JsonLd data={[organizationJsonLd(base), websiteJsonLd(locale, base), softwareApplicationJsonLd(seoDescription, base)]} />
      <style dangerouslySetInnerHTML={{ __html: "@keyframes eyeBlink{0%,49%{opacity:1}50%,100%{opacity:0}}" }} />
      <Navbar />
      <main className="overflow-hidden bg-black">

        {/* ── Hero — asymmetric split, live event terminal instead of a stock dashboard mock ── */}
        <section className="relative bg-black pt-28 sm:pt-32 pb-16 sm:pb-20">
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage: "radial-gradient(ellipse 85% 60% at 50% 0%, #000 40%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 85% 60% at 50% 0%, #000 40%, transparent 100%)",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              <div className="lg:col-span-7 text-center lg:text-left rtl:lg:text-right">
                <div className="inline-flex items-center gap-2 rounded-none border border-[#262626] bg-[#0A0A0A] px-3.5 py-1.5 mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-neutral-400" style={mono}>
                    {t("hero.badge")}
                  </span>
                </div>

                <h1 className="text-[2.4rem] leading-[1.05] sm:text-6xl font-bold tracking-tight text-white mb-5">
                  {t(heroVariantB ? "hero.headlineB1" : "hero.headline1")}
                  <br />
                  <span className="text-[#00E5FF]">
                    {t(heroVariantB ? "hero.headlineB2" : "hero.headline2")}
                  </span>
                </h1>

                <p className="text-base sm:text-xl text-neutral-400 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                  {t("hero.description")}
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 mb-6">
                  <Link href={`/${locale}/auth/register`} className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none px-8 h-12 text-base font-semibold gap-2">
                      {t("hero.cta")}
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </Button>
                  </Link>
                  <Link href={`/${locale}/live-demo`} className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-none border-[#262626] text-white hover:bg-[#171717] h-12 px-8 text-base gap-2">
                      {ar ? "شاهد عرضًا حيًّا" : "Watch live demo"}
                      <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                    </Button>
                  </Link>
                </div>

                <p className="text-xs sm:text-sm font-medium text-green-400 mb-5" style={mono}>
                  {t("hero.noSignupNote")}
                </p>

                <div className="flex items-center justify-center lg:justify-start gap-x-5 gap-y-2 flex-wrap text-xs sm:text-sm text-neutral-500">
                  <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" /> {t("hero.trustFree")}</span>
                  <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" /> {t("hero.trustCookies")}</span>
                  <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" /> {t("hero.trustGdpr")}</span>
                </div>
              </div>

              <div className="lg:col-span-5 relative">
                <LiveTerminalPreview />
                <div className="hidden lg:flex items-center gap-3 absolute -bottom-6 ltr:-left-8 rtl:-right-8 z-20 rounded-none border border-[#262626] bg-[#0A0A0A] px-4 py-3">
                  <div className="w-9 h-9 rounded-none bg-[#171717] border border-[#262626] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-left rtl:text-right">
                    <p className="text-lg font-bold text-green-400 leading-none" style={mono}>{t("hero.stat2Value")}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{t("hero.stat2Label")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <EventTypeTicker />
        <LiveStatsStrip />

        {/* ── Comparison — spec-sheet table replaces generic "problem" cards ─────── */}
        <section className="py-20 sm:py-24 bg-[#0A0A0A] border-b border-[#262626]">
          <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-10">
              <Badge className="mb-4 rounded-none bg-red-500/10 text-red-400 border-red-500/25 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase" style={mono}>
                {t("problem.badge")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {t("problem.headline")}
              </h2>
            </Reveal>

            <RevealGroup className="border border-[#262626]">
              <div className="grid grid-cols-2 bg-[#171717] border-b border-[#262626]">
                <div className="px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-widest text-neutral-500" style={mono}>
                  {ar ? "الأدوات التقليدية" : "Legacy analytics"}
                </div>
                <div className="px-4 sm:px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#00E5FF] border-l border-[#262626]" style={mono}>
                  EYE
                </div>
              </div>
              {[0, 1, 2, 3].map((i) => (
                <RevealItem key={i} className="grid grid-cols-2 border-b border-[#262626] last:border-b-0">
                  <div className="flex items-start gap-2.5 px-4 sm:px-5 py-4">
                    <span className="text-red-400 font-bold shrink-0" style={mono}>✕</span>
                    <p className="text-sm text-neutral-400">{t(`problem.${i}` as any)}</p>
                  </div>
                  <div className="flex items-start gap-2.5 px-4 sm:px-5 py-4 border-l border-[#262626] bg-black">
                    <span className="text-green-400 font-bold shrink-0" style={mono}>✓</span>
                    <p className="text-sm text-neutral-300">
                      {ar ? "متوفر افتراضيًا في EYE" : "Handled natively in EYE"}
                    </p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal delay={0.1} className="rounded-none bg-[#00E5FF]/5 border border-[#00E5FF]/25 border-t-0 p-5 text-center">
              <p className="text-base font-semibold text-white">{t("problem.answer")}</p>
            </Reveal>
          </div>
        </section>

        {/* ── Capabilities — bento banner + drag rail (replaces 3-col icon grid) ─ */}
        <section id="features" className="py-20 sm:py-28 bg-black">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-12 sm:mb-14">
              <Badge className="mb-4 rounded-none bg-[#171717] text-neutral-400 border-[#262626] px-4 py-1.5 text-xs font-semibold tracking-widest uppercase" style={mono}>
                {t("features.badge")}
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
                {t("features.headline")}
                <span className="text-[#00E5FF]"> {t("features.headlineAccent")}</span>
              </h2>
              <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto">
                {t("features.description")}
              </p>
            </Reveal>

            {/* Banner cell */}
            <Reveal className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[#262626] border border-[#262626] mb-px">
              <div className="bg-[#0A0A0A] p-7 sm:p-9 flex flex-col justify-center">
                <Badge className="mb-4 w-fit rounded-none bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/25 px-3 py-1 text-xs font-semibold tracking-widest uppercase" style={mono}>
                  {t("oneDashboard.badge")}
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
                  {t("oneDashboard.headline")}
                </h3>
                <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                  {t("oneDashboard.description")}
                </p>
              </div>
              <div className="bg-black p-7 sm:p-9 flex flex-col justify-center divide-y divide-[#262626]">
                {CONTROL_ROWS.map((r, i) => {
                  const RIcon = r.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                      <div className="w-8 h-8 rounded-none bg-[#171717] border border-[#262626] flex items-center justify-center shrink-0 text-[#00E5FF]">
                        <RIcon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-white">{r.label}</span>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            <CapabilityRail items={CAPABILITIES} />
          </div>
        </section>

        {/* ── Heatmap coordinate fix — real interactive before/after slider ──────── */}
        <section className="py-20 sm:py-28 bg-[#0A0A0A] border-y border-[#262626] overflow-hidden">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <Reveal>
                <Badge className="mb-4 rounded-none bg-green-500/10 text-green-400 border-green-500/25 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase" style={mono}>
                  {t("glance.badge")}
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                  {t("glance.headline")}
                </h2>
                <p className="text-base text-neutral-400 mb-7 leading-relaxed">
                  {t("glance.description")}
                </p>
                <ul className="space-y-3">
                  {[0, 1, 2, 3].map((i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-none bg-green-500/10 border border-green-500/25 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                      <span className="text-sm text-neutral-400">{t(`glance.item${i}` as any)}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={0.1}>
                <BeforeAfterSlider />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Free tools: no-signup lead magnets ──────────────────────────────── */}
        <section className="py-20 sm:py-24 bg-black">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-10 sm:mb-12">
              <Badge className="mb-4 rounded-none bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/25 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase" style={mono}>
                {ar ? "بدون تسجيل" : "No signup required"}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                {ar ? "أدوات مجانية لموقعك" : "Free tools for your website"}
              </h2>
              <p className="text-base text-neutral-400 max-w-xl mx-auto">
                {ar ? "بدون تسجيل، بدون بطاقة، بدون حد. افحص أي موقع خلال ثوانٍ." : "No signup, no card, no limit. Check any site in seconds."}
              </p>
            </Reveal>
            <RevealGroup className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#262626] border border-[#262626]">
              {(ar
                ? [
                    { href: "/free-tools/speed-checker", icon: Gauge, name: "فحص السرعة", desc: "وقت التحميل، الاستجابة، الضغط، السكربتات المُعيقة." },
                    { href: "/free-tools/seo-checker", icon: ScanSearch, name: "فحص السيو", desc: "العنوان، العلامات الوصفية، العناوين، الصور، Open Graph، والمزيد." },
                    { href: "/free-tools/sitemap-creator", icon: Layers, name: "منشئ خريطة الموقع", desc: "زحف لموقعك وإنشاء ملف sitemap.xml جاهز." },
                  ]
                : [
                    { href: "/free-tools/speed-checker", icon: Gauge, name: "Speed Checker", desc: "Load time, TTFB, compression, render-blocking scripts." },
                    { href: "/free-tools/seo-checker", icon: ScanSearch, name: "SEO Checker", desc: "Title, meta tags, headings, images, Open Graph, and more." },
                    { href: "/free-tools/sitemap-creator", icon: Layers, name: "Sitemap Creator", desc: "Crawl your site and generate a ready-to-use sitemap.xml." },
                  ]
              ).map((tool) => {
                const Icon = tool.icon;
                return (
                  <RevealItem key={tool.href}>
                    <Link
                      href={`/${locale}${tool.href}`}
                      className="group flex flex-col h-full bg-black p-6 transition hover:bg-[#0A0A0A]"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-none bg-[#171717] border border-[#262626] text-[#00E5FF]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="mt-4 text-base font-bold text-white">{tool.name}</h3>
                      <p className="mt-1 text-sm text-neutral-400 flex-1">{tool.desc}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#00E5FF]">
                        {ar ? "جرّبها" : "Try it"}
                        <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                      </span>
                    </Link>
                  </RevealItem>
                );
              })}
            </RevealGroup>
            <Reveal delay={0.1} className="text-center mt-8">
              <Link href={`/${locale}/free-tools`} className="text-sm font-semibold text-[#00E5FF] hover:underline">
                {ar ? "كل الأدوات المجانية" : "See all free tools"} →
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ── Install — terminal log instead of circle-and-dashed-line steps ───── */}
        <section id="how-it-works" className="py-20 sm:py-28 bg-[#0A0A0A] border-y border-[#262626]">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-12 sm:mb-14">
              <Badge className="mb-4 rounded-none bg-[#171717] text-neutral-400 border-[#262626] px-4 py-1.5 text-xs font-semibold tracking-widest uppercase" style={mono}>
                {t("howItWorks.badge")}
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
                {t("howItWorks.headline")}
                <span className="text-[#00E5FF]"> {t("howItWorks.headlineAccent")}</span>
              </h2>
              <p className="text-base sm:text-lg text-neutral-400 max-w-xl mx-auto">
                {t("howItWorks.description")}
              </p>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="rounded-none bg-black border border-[#262626] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#262626] bg-[#171717]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                  </div>
                  <span className="text-xs text-neutral-500 ltr:ml-2 rtl:mr-2" style={mono}>install.sh</span>
                </div>

                <div className="p-5 sm:p-7 text-xs sm:text-sm leading-relaxed" style={mono}>
                  <RevealGroup>
                    {[0, 1, 2].map((i) => (
                      <RevealItem key={i} className="mb-4 last:mb-0">
                        <p className="text-neutral-600"># {String(i + 1).padStart(2, "0")} — {t(`howItWorks.${i}title` as any)}</p>
                        <p className="text-neutral-500 mt-0.5">{t(`howItWorks.${i}desc` as any)}</p>
                      </RevealItem>
                    ))}
                  </RevealGroup>

                  <div className="mt-6 pt-5 border-t border-[#262626] overflow-x-auto ltr">
                    <code className="whitespace-pre">
                      <span className="text-[#00E5FF]">{"<script"}</span>
                      {"\n  "}<span className="text-white">src</span>
                      {"="}<span className="text-green-400">{`"${base}/tracker/eye.js"`}</span>
                      {"\n  "}<span className="text-white">data-site-id</span>
                      {"="}<span className="text-green-400">{'"YOUR_SITE_ID"'}</span>
                      {"\n  "}<span className="text-[#00E5FF]">{"defer></script>"}</span>
                    </code>
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-green-400">
                    <span>$ status: live</span>
                    <span className="inline-block w-2 h-4 bg-green-400" style={{ animation: "eyeBlink 1s step-start infinite" }} />
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-neutral-500 mt-3 font-medium">
                {t("howItWorks.codeNote")}
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── AI differentiator: tells you what to fix ──────────────────────── */}
        <section className="py-20 sm:py-28 bg-black">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal className="rounded-none border border-[#262626] bg-[#0A0A0A] p-8 sm:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-center mb-8">
                <div className="lg:col-span-3">
                  <div className="inline-flex items-center gap-2 rounded-none border border-[#00E5FF]/25 bg-[#00E5FF]/10 px-3 py-1 text-xs font-bold text-[#00E5FF] mb-5" style={mono}>
                    <Sparkles className="w-3.5 h-3.5" /> {ar ? "مدعوم بالذكاء الاصطناعي" : "AI-powered"}
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
                    {ar ? "لا يُريك الأرقام فقط — يخبرك بما يجب إصلاحه." : "Not just charts — it tells you what to fix."}
                  </h2>
                  <p className="text-neutral-400 text-lg max-w-2xl">
                    {ar
                      ? "معظم أدوات التحليل تُغرقك بالرسوم البيانية. EYE يقرأ بياناتك ويكتب لك بلغة بسيطة: أين يغادر الزوّار، لماذا، وما الخطوة التالية بالضبط."
                      : "Most analytics tools drown you in dashboards. EYE reads your data and writes it in plain language: where visitors drop off, why, and exactly what to do next."}
                  </p>
                </div>
                <div className="lg:col-span-2 rounded-none border border-[#262626] bg-black p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500" style={mono}>
                      {ar ? "توصية اليوم" : "Today's recommendation"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {(ar
                      ? ["أضف تسجيل جوجل لحقل البريد", "افحص روابط الصفحة المعطلة", "راجع صفحة التسجيل على الجوال"]
                      : ["Add Google sign-in on the email field", "Check the broken link on /pricing", "Review mobile register-page friction"]
                    ).map((line, i) => (
                      <div key={i} className="flex items-center gap-2.5 rounded-none bg-[#0A0A0A] border border-[#262626] px-3 py-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shrink-0" />
                        <span className="text-xs text-neutral-400">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <RevealGroup className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#262626] border border-[#262626]">
                {(ar
                  ? [
                      ["تشخيص النماذج", "«78% يغادرون عند حقل البريد — فعّل التركيز التلقائي أو أضف تسجيل جوجل.»"],
                      ["ملخص يومي", "تقرير يومي بلغة بسيطة عن أهم ما حدث وما يحتاج انتباهك."],
                      ["توصيات قابلة للتنفيذ", "خطوات محددة مرتّبة حسب الأثر مقابل الجهد — لا تخمين."],
                    ]
                  : [
                      ["Form diagnosis", "“78% quit at the email field — autofocus it or add Google sign-in.”"],
                      ["Daily brief", "A plain-English daily report of what happened and what needs attention."],
                      ["Actionable fixes", "Specific steps ranked by impact-vs-effort — no guesswork."],
                    ]
                ).map(([h, p]) => (
                  <RevealItem key={h} className="bg-[#0A0A0A] p-5">
                    <p className="font-bold text-white mb-1">{h}</p>
                    <p className="text-sm text-neutral-400 leading-relaxed">{p}</p>
                  </RevealItem>
                ))}
              </RevealGroup>
            </Reveal>
          </div>
        </section>

        {/* ── Pricing teaser ───────────────────────────────────────────────── */}
        <section className="py-20 sm:py-28 bg-[#0A0A0A] border-b border-[#262626]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-12 sm:mb-14">
              <Badge className="mb-4 rounded-none bg-[#171717] text-neutral-400 border-[#262626] px-4 py-1.5 text-xs font-semibold tracking-widest uppercase" style={mono}>
                {tp("title")}
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
                {tp("headline")}
              </h2>
              <p className="text-base sm:text-lg text-neutral-400 max-w-xl mx-auto">
                {tp("subhead")}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <PricingTeaser />
            </Reveal>
            <Reveal delay={0.14} className="text-center mt-8">
              <Link href={`/${locale}/pricing`} className="text-sm font-semibold text-[#00E5FF] hover:underline">
                {tp("fullComparison")} →
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ── Trust / Privacy — inline spec strip instead of an icon grid ────── */}
        <section className="py-8 bg-black border-b border-[#262626] overflow-x-auto">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="flex flex-wrap divide-x divide-[#262626] rtl:divide-x-reverse">
              {TRUST_ITEMS.map(({ lk, dk }) => (
                <div key={lk} className="px-5 py-1 first:ltr:pl-0 first:rtl:pr-0">
                  <p className="text-xs font-bold text-white" style={mono}>{t(lk as any)}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{t(dk as any)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ — terminal prompt log instead of accordion cards ───────────── */}
        <section className="py-20 sm:py-24 bg-black">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-10 sm:mb-12">
              <Badge className="mb-4 rounded-none bg-[#171717] text-neutral-400 border-[#262626] px-4 py-1.5 text-xs font-semibold tracking-widest uppercase" style={mono}>
                {t("faq.badge")}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {t("faq.headline")}
              </h2>
            </Reveal>
            <RevealGroup className="border border-[#262626] bg-[#0A0A0A]">
              {[0, 1, 2, 3].map((i) => (
                <RevealItem key={i}>
                  <details className="group border-b border-[#262626] last:border-b-0">
                    <summary className="flex items-start gap-3 p-5 cursor-pointer list-none hover:bg-[#171717] transition-colors">
                      <span className="text-[#00E5FF] font-bold shrink-0" style={mono}>{">"}</span>
                      <span className="text-sm font-semibold text-white flex-1">{t(`faq.q${i}` as any)}</span>
                      <ChevronRight className="w-4 h-4 text-neutral-500 shrink-0 transition-transform duration-200 group-open:rotate-90 rtl:rotate-180 rtl:group-open:rotate-90" />
                    </summary>
                    <div className="px-5 pb-5 ltr:pl-11 rtl:pr-11">
                      <p className="text-sm text-neutral-400 leading-relaxed">{t(`faq.a${i}` as any)}</p>
                    </div>
                  </details>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* ── Final CTA — terminal deploy prompt ──────────────────────────────── */}
        <section className="py-24 sm:py-28 bg-[#0A0A0A] border-t border-[#262626]">
          <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="rounded-none border border-[#262626] bg-black overflow-hidden mb-8">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#262626] bg-[#171717]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                </div>
              </div>
              <div className="p-5 sm:p-7 text-center">
                <Reveal><h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4 leading-[1.1]">
                  {t("cta.headline")}
                  <span className="text-[#00E5FF]">{" "}{t("cta.headlineAccent")}</span>
                </h2></Reveal>
                <Reveal delay={0.08}><p className="text-base text-neutral-400 mb-7 leading-relaxed">{t("cta.description")}</p></Reveal>
                <Reveal delay={0.14}>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                    <Link href={`/${locale}/auth/register`} className="w-full sm:w-auto">
                      <Button size="lg" className="w-full sm:w-auto rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none px-10 h-14 text-lg font-bold gap-2">
                        {t("cta.primary")}
                        <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                      </Button>
                    </Link>
                    <Link href={`/${locale}/pricing`} className="w-full sm:w-auto">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-none border-[#262626] text-white hover:bg-[#171717] h-14 px-8 text-base">
                        {t("cta.secondary")}
                      </Button>
                    </Link>
                  </div>
                </Reveal>
              </div>
            </div>
            <p className="text-center text-sm text-neutral-500">{t("cta.note")}</p>
          </div>
        </section>

      </main>
      <Footer locale={locale} />
      <MobileCtaBar />
      <GoogleOneTap />
      <SignupPopup />
    </>
  );
}
