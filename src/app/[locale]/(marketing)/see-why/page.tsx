import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, PlayCircle, Map, GitMerge } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import MobileCtaBar from "@/components/marketing/MobileCtaBar";
import SignupPopup from "@/components/marketing/SignupPopup";
import { Reveal, RevealGroup, RevealItem, GradientBlobs } from "@/components/marketing/Reveal";
import { SITE_URL, localePath } from "@/lib/seo";

type Props = { params: { locale: string }; searchParams: { h?: string } };

// Headline A/B: default (variant A, loss-framing) matches the running ad's
// own copy 1:1 so the visitor instantly recognizes "this is the thing I
// clicked on"; ?h=b (variant B) is a curiosity/voyeur framing instead.
// Wired to a real split_url experiment targeting this exact page.
const C = {
  ar: {
    badge: "بدون كوكيز • بدون بانر موافقة",
    h1a: "زوارك بيدخلوا موقعك... وبيمشوا من غير ما يشتروا.",
    h1b: "دلوقتي تقدر تشوف ليه.",
    h1a_b: "اقعد اتفرّج على زوار موقعك وهما بيتصفحوا.",
    h1b_b: "هتعرف ليه بيمشوا في أول دقيقة.",
    sub: "شوف فيديو لكل زائر وهو بيتصفح موقعك، وخريطة حرارية توريك إيه اللي بيتشاف وإيه اللي بيتجاهلوه، وقمع يقولك في أنهي خطوة بالظبط بيسيبوك.",
    cta: "ابدأ 30 يوم مجاناً",
    trustLine: "من غير بطاقة ائتمان • التركيب دقيقتين • سطر واحد في موقعك",
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
    badge: "No cookies • No consent banner",
    h1a: "Visitors land on your site... and leave without buying.",
    h1b: "Now you can see exactly why.",
    h1a_b: "Watch your visitors browse your site, live.",
    h1b_b: "You'll know why they leave within the first minute.",
    sub: "A video of every visitor as they browse, a heatmap of what they actually look at vs. ignore, and a funnel that names the exact step they quit on.",
    cta: "Start your 30-day trial",
    trustLine: "No credit card • 2-minute setup • One script tag",
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
    title: `${t.h1a} ${t.h1b} | EYE`,
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

  return (
    <div dir={ar ? "rtl" : "ltr"} className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <main className="overflow-hidden">
        {/* Hero */}
        <section className="relative isolate overflow-hidden text-center pt-24 sm:pt-32 pb-14 sm:pb-20 bg-surface">
          <GradientBlobs />
          <div className="relative max-w-2xl mx-auto px-5 sm:px-6">
            <Reveal>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-6">
                <Check className="w-3.5 h-3.5" /> {t.badge}
              </span>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15] mb-4">
                {variantB ? t.h1a_b : t.h1a}
                <br />
                <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
                  {variantB ? t.h1b_b : t.h1b}
                </span>
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="text-base sm:text-lg text-on-surface-variant max-w-xl mx-auto mb-8 leading-relaxed">{t.sub}</p>
            </Reveal>
            <Reveal delay={0.18}>
              <Link href={registerHref}>
                <Button size="lg" className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 px-8 h-13 text-base font-bold gap-2">
                  {t.cta} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Button>
              </Link>
            </Reveal>
            <Reveal delay={0.22}>
              <p className="text-xs sm:text-sm font-medium text-on-surface-variant/80 mt-4">{t.trustLine}</p>
            </Reveal>
          </div>
        </section>

        {/* 3 differentiators, matching the subheadline's promise */}
        <RevealGroup className="max-w-2xl mx-auto px-5 sm:px-6 py-10 sm:py-14 space-y-6">
          {t.benefits.map((b) => (
            <RevealItem key={b.t} className="flex items-start gap-4">
              <span className="w-11 h-11 rounded-xl bg-indigo-500/12 flex items-center justify-center shrink-0">
                <b.icon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              </span>
              <div>
                <h3 className="font-black text-on-surface mb-0.5">{b.t}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{b.d}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Pain — the sharpest positioning line */}
        <Reveal className="border-y border-outline-variant/15 bg-surface-container/15 py-10">
          <div className="max-w-2xl mx-auto px-5 sm:px-6 text-center">
            <p className="text-xl sm:text-2xl font-black leading-snug">{t.painH}</p>
          </div>
        </Reveal>

        {/* Final CTA — single button only, no pricing link */}
        <section className="relative isolate overflow-hidden py-16 sm:py-20 text-center bg-surface">
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] max-w-[120vw] rounded-full bg-indigo-500/25 dark:bg-indigo-500/20 blur-[110px]" />
          </div>
          <div className="relative max-w-xl mx-auto px-5 sm:px-6">
            <Reveal><h2 className="text-2xl sm:text-4xl font-black mb-3 leading-[1.1]">{t.finalH}</h2></Reveal>
            <Reveal delay={0.05}><p className="text-on-surface-variant mb-8">{t.finalSub}</p></Reveal>
            <Reveal delay={0.1}>
              <Link href={registerHref}>
                <Button size="lg" className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 px-8 h-13 text-base font-bold gap-2">
                  {t.finalCta} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
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
