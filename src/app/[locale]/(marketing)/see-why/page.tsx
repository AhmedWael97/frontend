import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, PlayCircle, Map, GitMerge, TrendingDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/marketing/Footer";
import MobileCtaBar from "@/components/marketing/MobileCtaBar";
import SignupPopup from "@/components/marketing/SignupPopup";
import { Reveal, RevealGroup, RevealItem, GradientBlobs } from "@/components/marketing/Reveal";
import { BrowserFrame } from "@/components/marketing/BrowserFrame";
import LiveStatsStrip from "@/components/marketing/LiveStatsStrip";
import { SITE_URL, localePath } from "@/lib/seo";

type Props = { params: { locale: string }; searchParams: { h?: string } };

// Illustrative heatmap dots for the hero mockup — same sample-data pattern
// as /heatmaps, not real visitor data (BrowserFrame's "Sample data" badge
// makes that explicit).
const DOTS: [number, number, number][] = [
  [50, 22, 1], [48, 23, 0.9], [52, 21, 0.8], [30, 40, 0.5], [70, 42, 0.6],
  [22, 62, 0.35], [78, 63, 0.4], [50, 88, 0.9], [45, 89, 0.8], [55, 87, 0.7],
];

// Headline A/B: default (variant A, loss-framing) matches the running ad's
// own copy 1:1 so the visitor instantly recognizes "this is the thing I
// clicked on"; ?h=b (variant B) is a curiosity/voyeur framing instead.
// Wired to a real split_url experiment targeting this exact page.
//
// h1a is stored pre-split into two clauses (breaking after the "..." pause)
// so the headline always wraps as complete thoughts, never mid-phrase.
const C = {
  ar: {
    dir: "rtl" as const,
    badge: "بدون كوكيز • بدون بانر موافقة",
    h1a1: "زوارك بيدخلوا موقعك...",
    h1a2: "وبيمشوا من غير ما يشتروا.",
    h1b: "دلوقتي تقدر تشوف ليه.",
    h1a_b: "اقعد اتفرّج على زوار موقعك وهما بيتصفحوا.",
    h1b_b: "هتعرف ليه بيمشوا في أول دقيقة.",
    sub: "شوف فيديو لكل زائر وهو بيتصفح موقعك، وخريطة حرارية توريك إيه اللي بيتشاف وإيه اللي بيتجاهلوه، وقمع يقولك في أنهي خطوة بالظبط بيسيبوك.",
    cta: "ابدأ 30 يوم مجاناً",
    trustItems: ["من غير بطاقة ائتمان", "التركيب دقيقتين", "سطر واحد في موقعك"],
    previewNote: "أفتح البقع = نقرات أكتر. الزوار بيتجاهلوا الجزء تحت.",
    benefits: [
      { icon: PlayCircle, t: "فيديو لكل زائر", d: "شوف بالظبط إيه اللي عمله من لحظة ما دخل لحد ما مشي." },
      { icon: Map, t: "خريطة حرارية", d: "إيه اللي بيتشاف، وإيه اللي بيتجاهلوه تماماً." },
      { icon: GitMerge, t: "قمع التسرب", d: "الخطوة بالظبط اللي بيسيبوا موقعك عندها." },
    ],
    painH: "Google Analytics بيقولك كام واحد دخل. مش بيقولك ليه مشيوا.",
    finalH: "عايز تعرف ليه زوارك بيمشوا؟",
    finalSub: "جرّب EYE 30 يوم مجاناً. سطر واحد في موقعك، والنتيجة تظهر في ثواني.",
    finalCta: "إنشاء حساب مجاني",
  },
  en: {
    dir: "ltr" as const,
    badge: "No cookies • No consent banner",
    h1a1: "Visitors land on your site...",
    h1a2: "and leave without buying.",
    h1b: "Now you can see exactly why.",
    h1a_b: "Watch your visitors browse your site, live.",
    h1b_b: "You'll know why they leave within the first minute.",
    sub: "A video of every visitor as they browse, a heatmap of what they actually look at vs. ignore, and a funnel that names the exact step they quit on.",
    cta: "Start your 30-day trial",
    trustItems: ["No credit card", "2-minute setup", "One script tag"],
    previewNote: "Brighter spots = more clicks. Visitors are ignoring the section below.",
    benefits: [
      { icon: PlayCircle, t: "A video per visitor", d: "See exactly what they did from the moment they landed to the moment they left." },
      { icon: Map, t: "Click heatmaps", d: "What gets looked at, and what gets ignored completely." },
      { icon: GitMerge, t: "Drop-off funnels", d: "The exact step where people quit your site." },
    ],
    painH: "Google Analytics tells you how many showed up. Not why they left.",
    finalH: "Want to know why your visitors leave?",
    finalSub: "Try EYE free for 30 days. One script tag, results in seconds.",
    finalCta: "Create free account",
  },
} as const;

export function generateMetadata({ params }: Props): Metadata {
  const t = C[params.locale === "ar" ? "ar" : "en"];
  const url = `${SITE_URL}${localePath(params.locale, "/see-why")}`;
  return {
    title: `${t.h1a1} ${t.h1a2} | EYE`,
    description: t.sub,
    alternates: { canonical: url, languages: { en: `${SITE_URL}${localePath("en", "/see-why")}`, ar: `${SITE_URL}${localePath("ar", "/see-why")}` } },
    robots: { index: false, follow: true }, // A/B ad-landing variant — don't compete with the control page in search
  };
}

export default function SeeWhyLanding({ params, searchParams }: Props) {
  const ar = params.locale === "ar";
  const t = C[ar ? "ar" : "en"];
  const locale = params.locale;
  const variantB = searchParams?.h === "b";
  const registerHref = localePath(locale, "/auth/register");

  const mono = { fontFamily: "var(--font-mono-marketing)" };

  return (
    <div dir={t.dir} className="min-h-screen bg-black">
      {/* Minimal logo-only header — no nav, no login/pricing/demo links. Every
          link off an ad-landing page is a conversion leak; the only path
          forward here is the CTA. */}
      <header className="relative z-20 py-5">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 flex items-center justify-center gap-2">
          <span className="w-8 h-8 rounded-none border border-[#262626] bg-[#0A0A0A] flex items-center justify-center">
            <Eye className="w-4 h-4 text-[#00E5FF]" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            EYE<span className="text-[#00E5FF]">.</span>
          </span>
        </div>
      </header>

      <main className="overflow-hidden">
        {/* Hero — everything here is above the fold on load, so it renders at
            full opacity immediately (no scroll-triggered Reveal). A prior
            version wrapped this in Reveal's whileInView animation, which left
            the hero visibly faded (~30% opacity) on a cold load until the
            visitor scrolled — the IntersectionObserver wasn't reliably firing
            for content already in the viewport on first paint. */}
        <section className="relative isolate overflow-hidden text-center pt-6 sm:pt-10 pb-16 sm:pb-24 bg-black">
          <GradientBlobs />
          <div className="relative max-w-3xl mx-auto px-5 sm:px-6">
            <span className="inline-flex items-center gap-1.5 rounded-none border border-green-500/30 bg-green-500/10 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-green-400 mb-6" style={mono}>
              <Check className="w-3.5 h-3.5" /> {t.badge}
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.45] mb-5 text-white">
              {variantB ? (
                <span className="block">{t.h1a_b}</span>
              ) : (
                <>
                  <span className="block">{t.h1a1}</span>
                  <span className="block">{t.h1a2}</span>
                </>
              )}
              <span className="block mt-2 sm:mt-3 text-[#00E5FF]">
                {variantB ? t.h1b_b : t.h1b}
              </span>
            </h1>
            <p className="text-base sm:text-lg text-neutral-400 max-w-xl mx-auto mb-8 leading-relaxed">{t.sub}</p>
            <Link href={registerHref}>
              <Button size="lg" className="w-full sm:w-auto rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none px-10 h-14 sm:h-16 text-lg sm:text-xl font-bold gap-2">
                {t.cta} <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </Button>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-6 text-xs sm:text-sm text-neutral-500">
              {t.trustItems.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" /> {item}</span>
              ))}
            </div>

            {/* Product preview — concrete visual proof, not just claims.
                Tight top margin so its edge is visible on the first screen,
                enough to earn the scroll. */}
            <div className="mt-8 sm:mt-10 max-w-2xl mx-auto text-start">
              <BrowserFrame url="yoursite.com">
                <div className="relative w-full aspect-[16/10] bg-black border border-[#262626] overflow-hidden">
                  <div className="absolute inset-x-6 top-4 h-4 bg-white/10" />
                  <div className="absolute inset-x-6 top-11 h-3 w-2/3 bg-white/5" />
                  <div className="absolute left-1/2 -translate-x-1/2 top-[35%] h-8 w-36 rounded-full bg-[#00E5FF]/25 border border-[#00E5FF]/30" />
                  <div className="absolute inset-x-6 top-[58%] h-3 w-3/4 bg-white/5" />
                  <div className="absolute inset-x-6 top-[64%] h-3 w-1/2 bg-white/5" />
                  <div className="absolute left-1/2 -translate-x-1/2 top-[85%] h-9 w-40 rounded-full bg-white/5 border border-[#262626]" />
                  {DOTS.map(([x, y, i], idx) => (
                    <span key={idx} className="absolute rounded-full" style={{ left: `${x}%`, top: `${y}%`, width: 30, height: 30, transform: "translate(-50%,-50%)", background: `radial-gradient(circle, rgba(239,68,68,${i}) 0%, rgba(239,68,68,0) 70%)` }} />
                  ))}
                </div>
                <p className="text-xs text-neutral-500 mt-3 text-center">{t.previewNote}</p>
              </BrowserFrame>
              {/* CTA repeated right under the preview — by here the case is
                  made; don't make anyone scroll back up to act on it. */}
              <div className="mt-6 text-center">
                <Link href={registerHref}>
                  <Button size="lg" className="w-full sm:w-auto rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none px-10 h-14 sm:h-16 text-lg sm:text-xl font-bold gap-2">
                    {t.cta} <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <LiveStatsStrip />

        {/* 3 differentiators, matching the subheadline's promise — genuinely
            below the fold, safe to animate on scroll. */}
        <section className="py-16 sm:py-20 bg-[#0A0A0A] border-y border-[#262626]">
          <RevealGroup className="max-w-5xl mx-auto px-5 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#262626] border border-[#262626]">
            {t.benefits.map((b) => (
              <RevealItem key={b.t} className="bg-black p-6 hover:bg-[#171717] transition-colors">
                <span className="w-11 h-11 rounded-none border border-[#262626] bg-[#171717] flex items-center justify-center mb-4">
                  <b.icon className="w-5 h-5 text-[#00E5FF]" />
                </span>
                <h3 className="font-bold text-lg text-white mb-2">{b.t}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{b.d}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {/* Pain — the sharpest positioning line */}
        <section className="py-16 sm:py-20 bg-black">
          <Reveal className="max-w-3xl mx-auto px-5 sm:px-6">
            <div className="border border-red-500/25 bg-red-500/5 p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-start">
              <span className="w-12 h-12 rounded-none border border-red-500/30 bg-red-500/10 flex items-center justify-center shrink-0">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </span>
              <p className="text-xl sm:text-2xl font-bold leading-snug text-white">{t.painH}</p>
            </div>
          </Reveal>
        </section>

        {/* Final CTA — single button only, no pricing link */}
        <section className="relative isolate overflow-hidden py-16 sm:py-20 text-center bg-[#0A0A0A] border-y border-[#262626]">
          <GradientBlobs variant="compact" />
          <div className="relative max-w-xl mx-auto px-5 sm:px-6">
            <Reveal><h2 className="text-2xl sm:text-4xl font-bold mb-3 leading-[1.1] text-white">{t.finalH}</h2></Reveal>
            <Reveal delay={0.05}><p className="text-neutral-400 mb-8">{t.finalSub}</p></Reveal>
            <Reveal delay={0.1}>
              <Link href={registerHref}>
                <Button size="lg" className="w-full sm:w-auto rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none px-10 h-14 sm:h-16 text-lg sm:text-xl font-bold gap-2">
                  {t.finalCta} <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                </Button>
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
      <MobileCtaBar />
      <SignupPopup />
    </div>
  );
}
