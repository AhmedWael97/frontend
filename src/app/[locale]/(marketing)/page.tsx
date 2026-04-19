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

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: { locale: string } }
): Promise<Metadata> {
  const locale = params.locale;
  const isAr = locale === "ar";

  const title = isAr
    ? "EYE — منصة ذكاء الزوار بالذكاء الاصطناعي"
    : "EYE — AI-Powered Visitor Intelligence & Analytics";

  const description = isAr
    ? "تتبع الزوار، تحليل السلوك، بناء قمع المبيعات، وتحسين تجربة المستخدم بالذكاء الاصطناعي. ابدأ مجاناً."
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
          alt: "EYE Analytics — AI Visitor Intelligence",
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

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Brain,
    title: "AI Visitor Segments",
    description:
      "Automatically cluster visitors into behavioral segments. Get actionable suggestions to improve conversions — powered by GPT-4.",
    color: "from-indigo-500/20 to-violet-500/10",
    iconColor: "text-indigo-400",
  },
  {
    icon: MousePointer2,
    title: "Heatmaps & Session Replay",
    description:
      "See exactly where users click, scroll, and rage-click. Watch full session replays to spot friction in real-time.",
    color: "from-pink-500/20 to-rose-500/10",
    iconColor: "text-pink-400",
  },
  {
    icon: TrendingUp,
    title: "Funnel Intelligence",
    description:
      "Build multi-step conversion funnels with drag-and-drop. Identify exactly where visitors drop off and fix it.",
    color: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-400",
  },
  {
    icon: Globe2,
    title: "B2B Company Enrichment",
    description:
      "Identify which companies are visiting your site. See industry, size, and intent signals — without a form fill.",
    color: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-400",
  },
  {
    icon: Zap,
    title: "Real-time Dashboard",
    description:
      "Live visitor counts, page views, and events streaming in real-time. Know the moment a campaign goes live.",
    color: "from-cyan-500/20 to-sky-500/10",
    iconColor: "text-cyan-400",
  },
  {
    icon: ShieldCheck,
    title: "Privacy-First & GDPR",
    description:
      "Cookieless tracking, data anonymization, and built-in GDPR tools. Full compliance without sacrificing insights.",
    color: "from-violet-500/20 to-purple-500/10",
    iconColor: "text-violet-400",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Add the tracker script",
    description:
      "Copy one line of JavaScript to your site. Works with React, Next.js, WordPress, Shopify — everything.",
    icon: Layers,
  },
  {
    step: "02",
    title: "Data flows automatically",
    description:
      "Visitor events, page views, sessions, and custom events are captured and stored in real time.",
    icon: Gauge,
  },
  {
    step: "03",
    title: "Get AI-driven insights",
    description:
      "Our AI analyzes patterns, segments visitors, and surfaces actionable recommendations to grow your business.",
    icon: Brain,
  },
];

const STATS = [
  { value: "1B+", label: "Events processed monthly" },
  { value: "50K+", label: "Active websites" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<1ms", label: "Tracker script impact" },
];

const TESTIMONIALS = [
  {
    quote:
      "EYE replaced 4 separate analytics tools for us. The AI segments alone saved us weeks of manual analysis.",
    author: "Sarah Chen",
    role: "Head of Growth · Fintech SaaS",
    stars: 5,
  },
  {
    quote:
      "The B2B enrichment is incredible. We finally know which enterprise accounts are researching us before they reach out.",
    author: "Marcus Webb",
    role: "VP Sales · B2B Software",
    stars: 5,
  },
  {
    quote:
      "GDPR compliance was always a blocker. EYE's cookieless approach means we can track everything without legal headaches.",
    author: "Lena Müller",
    role: "CTO · EU E-commerce",
    stars: 5,
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage(
  { params }: { params: { locale: string } }
) {
  const locale = params.locale;

  return (
    <>
      <Navbar />
      <main className="overflow-hidden">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex items-center pt-16">
          {/* Background gradients */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
            <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px]" />
            <div className="absolute bottom-[5%] left-[5%] w-[300px] h-[300px] rounded-full bg-cyan-600/8 blur-[80px]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <Badge className="mb-6 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
              ✦ AI-Powered Analytics Platform
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-on-surface leading-[1.05] mb-6">
              Know every visitor.
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                Grow every metric.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
              EYE gives you AI-powered visitor intelligence — real-time analytics, heatmaps, funnels,
              B2B enrichment, and session replay — all in one privacy-first platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={`/${locale}/auth/register`}>
                <Button size="lg" className="bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/25 px-8 h-12 text-base font-semibold">
                  Start free — no credit card
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                  <Play className="w-4 h-4 mr-2" />
                  See how it works
                </Button>
              </a>
            </div>

            <p className="mt-5 text-xs text-on-surface-variant/60 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> Free forever plan</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> No cookies required</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> GDPR compliant</span>
            </p>

            {/* Dashboard mock */}
            <div className="mt-16 relative max-w-5xl mx-auto">
              <div className="rounded-2xl border border-outline-variant/30 bg-surface-container/60 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/40">
                {/* Mock browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-outline-variant/20 bg-surface-container">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 mx-4 h-6 rounded-md bg-surface-container-high/80 flex items-center px-3">
                    <span className="text-xs text-on-surface-variant/60">app.eye.ai/dashboard</span>
                  </div>
                </div>
                {/* Stats preview row */}
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: "Visitors today", value: "12,847", change: "+18%", color: "text-indigo-400" },
                      { label: "Avg. session", value: "3m 42s", change: "+6%", color: "text-violet-400" },
                      { label: "Conversion rate", value: "4.2%", change: "+1.1%", color: "text-emerald-400" },
                      { label: "Live visitors", value: "143", change: "now", color: "text-pink-400" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl bg-surface-container-high/60 p-4">
                        <p className="text-xs text-on-surface-variant mb-1">{stat.label}</p>
                        <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-emerald-400 mt-1">{stat.change}</p>
                      </div>
                    ))}
                  </div>
                  {/* Mock chart bars */}
                  <div className="rounded-xl bg-surface-container-high/40 p-4 flex items-end gap-1.5 h-32">
                    {[40, 65, 55, 80, 70, 90, 75, 95, 60, 85, 72, 88, 65, 92].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-indigo-500/60 to-violet-500/40 transition-all"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {/* Glow under dashboard */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-indigo-500/20 blur-3xl rounded-full" />
            </div>
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────────────────────── */}
        <section className="py-20 border-y border-outline-variant/20 bg-surface-container/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-4xl font-black text-on-surface bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-sm text-on-surface-variant mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────────── */}
        <section id="features" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-violet-500/10 text-violet-400 border-violet-500/20 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
                Everything you need
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-black text-on-surface tracking-tight mb-4">
                One platform.
                <span className="text-violet-400"> Infinite insight.</span>
              </h2>
              <p className="text-lg text-on-surface-variant max-w-xl mx-auto">
                Replace your fragmented analytics stack with a single AI-powered platform that covers every aspect of visitor intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className={`relative rounded-2xl bg-gradient-to-br ${feature.color} border border-outline-variant/20 p-6 hover:border-outline-variant/40 transition-all hover:shadow-lg hover:shadow-black/20 group`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center mb-4 ${feature.iconColor} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-black text-on-surface mb-2">{feature.title}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-24 bg-surface-container/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
                Get started in minutes
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-black text-on-surface tracking-tight mb-4">
                Three steps to
                <span className="text-emerald-400"> total clarity</span>
              </h2>
              <p className="text-lg text-on-surface-variant max-w-xl mx-auto">
                No complex setup. No data engineers required. Add one script and let EYE do the rest.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.step} className="relative text-center">
                    {/* Connector line */}
                    {i < STEPS.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-[calc(50%+48px)] right-[calc(-50%+48px)] h-px bg-gradient-to-r from-outline-variant/40 to-outline-variant/10" />
                    )}
                    <div className="w-20 h-20 rounded-2xl bg-surface-container border border-outline-variant/30 flex items-center justify-center mx-auto mb-6 relative">
                      <Icon className="w-8 h-8 text-emerald-400" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-on-surface mb-3">{step.title}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{step.description}</p>
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
                  <span className="text-xs text-on-surface-variant ml-2">index.html</span>
                </div>
                <pre className="p-6 text-sm font-mono text-on-surface-variant overflow-x-auto">
                  <code>
                    <span className="text-pink-400">{"<script"}</span>
                    {" "}
                    <span className="text-indigo-400">src</span>
                    <span className="text-on-surface-variant">{"="}</span>
                    <span className="text-emerald-400">{'"https://cdn.eye.ai/tracker.js"'}</span>
                    <span className="text-pink-400">{"\n  "}</span>
                    <span className="text-indigo-400">data-site-id</span>
                    <span className="text-on-surface-variant">{"="}</span>
                    <span className="text-emerald-400">{'"YOUR_SITE_ID"'}</span>
                    <span className="text-pink-400">{"\n  defer"}</span>
                    <span className="text-pink-400">{">"}</span>
                    <span className="text-pink-400">{"</script>"}</span>
                  </code>
                </pre>
              </div>
              <p className="text-center text-xs text-on-surface-variant mt-3">
                That&apos;s it. Under 2KB. Zero dependencies. Zero cookies.
              </p>
            </div>
          </div>
        </section>

        {/* ── Testimonials ──────────────────────────────────────────────────── */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-on-surface tracking-tight mb-4">
                Trusted by growth teams
              </h2>
              <p className="text-lg text-on-surface-variant">
                Join thousands of companies making smarter decisions with EYE.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.author}
                  className="rounded-2xl bg-surface-container border border-outline-variant/20 p-6 hover:border-outline-variant/40 transition-all"
                >
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{t.author}</p>
                    <p className="text-xs text-on-surface-variant">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Privacy / Trust bar ───────────────────────────────────────────── */}
        <section className="py-16 border-y border-outline-variant/20 bg-surface-container/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: ShieldCheck, label: "GDPR Compliant", desc: "Full EU data compliance" },
                { icon: Lock, label: "Cookieless", desc: "No consent banners needed" },
                { icon: Eye, label: "Data Ownership", desc: "You own your data, always" },
                { icon: Gauge, label: "99.9% Uptime", desc: "Enterprise-grade reliability" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{label}</p>
                    <p className="text-xs text-on-surface-variant">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────────────── */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-indigo-600/10 blur-[120px]" />
          </div>
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-5xl sm:text-6xl font-black text-on-surface tracking-tight mb-6">
              Start knowing your
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                {" "}visitors today
              </span>
            </h2>
            <p className="text-lg text-on-surface-variant mb-10">
              Free plan includes 10,000 events/day, AI analysis, funnels, and heatmaps.
              No credit card. No lock-in.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={`/${locale}/auth/register`}>
                <Button size="lg" className="bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/25 px-10 h-14 text-lg font-bold">
                  Create free account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href={`/${locale}/pricing`}>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base">
                  Compare plans
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-on-surface-variant/60">
              Setup takes under 5 minutes. 50,000+ websites already trust EYE.
            </p>
          </div>
        </section>

      </main>
      <Footer locale={locale} />
    </>
  );
}
