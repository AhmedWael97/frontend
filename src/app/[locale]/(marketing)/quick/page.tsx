import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Radio, GitMerge, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import MobileCtaBar from "@/components/marketing/MobileCtaBar";
import SignupPopup from "@/components/marketing/SignupPopup";
import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/Reveal";
import { SITE_URL, localePath } from "@/lib/seo";

type Props = { params: { locale: string } };

const C = {
  en: {
    badge: "Privacy-first · 30-day free trial",
    h1a: "See why visitors leave.",
    h1b: "Fix it today.",
    sub: "Live visitor view, click heatmaps, and AI fixes for your site — no cookies, one script tag, 2 minutes to set up.",
    cta: "Start free — no credit card",
    benefits: [
      { icon: Radio, t: "Watch visitors live", d: "See exactly what they click, scroll past, and abandon — in real time." },
      { icon: GitMerge, t: "Find the drop-off point", d: "Funnels and session replay show precisely where people quit." },
      { icon: Sparkles, t: "Get told what to fix", d: "AI reads your data and writes the fix in plain language, not a chart." },
    ],
    trust: ["30-day free trial", "No credit card", "No cookies", "2-min setup"],
    finalH: "Your next visitor is arriving right now.",
    finalCta: "Start seeing them — free",
  },
  ar: {
    badge: "خصوصية أولاً · تجربة مجانية 30 يومًا",
    h1a: "اعرف ليه زوارك بيمشوا.",
    h1b: "أصلحه النهاردة.",
    sub: "عرض زوار مباشر، خرائط حرارية للنقر، وإصلاحات بالذكاء الاصطناعي لموقعك — بدون كوكيز، سطر كود واحد، دقيقتين تركيب.",
    cta: "ابدأ مجانًا — بدون بطاقة ائتمان",
    benefits: [
      { icon: Radio, t: "شاهد زوارك لحظة بلحظة", d: "اعرف بالظبط أين ينقرون، أين يتوقفون عن التمرير، وأين يغادرون." },
      { icon: GitMerge, t: "اعرف نقطة التسرب بالظبط", d: "القمع وإعادة تشغيل الجلسات تريك بالضبط أين يغادر الزوار." },
      { icon: Sparkles, t: "اعرف الحل جاهز", d: "الذكاء الاصطناعي يقرأ بياناتك ويكتب لك الحل بلغة بسيطة، مش رسم بياني." },
    ],
    trust: ["تجربة مجانية 30 يومًا", "بدون بطاقة ائتمان", "بدون كوكيز", "تركيب دقيقتين"],
    finalH: "زائرك القادم بيدخل موقعك دلوقتي.",
    finalCta: "ابدأ تشوفه — مجانًا",
  },
} as const;

export function generateMetadata({ params }: Props): Metadata {
  const t = C[params.locale === "ar" ? "ar" : "en"];
  const url = `${SITE_URL}${localePath(params.locale, "/quick")}`;
  return {
    title: `${t.h1a} ${t.h1b} | EYE`,
    description: t.sub,
    alternates: { canonical: url, languages: { en: `${SITE_URL}${localePath("en", "/quick")}`, ar: `${SITE_URL}${localePath("ar", "/quick")}` } },
    robots: { index: false, follow: true }, // A/B variant — don't compete with the control page in search
  };
}

export default function QuickHomeVariant({ params }: Props) {
  const ar = params.locale === "ar";
  const t = C[ar ? "ar" : "en"];
  const locale = params.locale;

  return (
    <div dir={ar ? "rtl" : "ltr"} className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <main className="overflow-hidden">
        {/* Hero */}
        <section className="relative isolate overflow-hidden text-center pt-24 sm:pt-32 pb-12 sm:pb-16 bg-surface">
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
            <div className="absolute top-[-10%] ltr:left-[10%] rtl:right-[10%] w-[520px] h-[520px] max-w-[110vw] rounded-full bg-indigo-500/30 dark:bg-indigo-500/25 blur-[100px]" />
            <div className="absolute top-[15%] ltr:right-[4%] rtl:left-[4%] w-[380px] h-[380px] max-w-[100vw] rounded-full bg-violet-500/25 dark:bg-violet-500/20 blur-[90px]" />
          </div>
          <div className="relative max-w-2xl mx-auto px-5 sm:px-6">
            <Reveal>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-6">
                <Check className="w-3.5 h-3.5" /> {t.badge}
              </span>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-4">
                {t.h1a}<br />
                <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">{t.h1b}</span>
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="text-base sm:text-lg text-on-surface-variant max-w-xl mx-auto mb-8">{t.sub}</p>
            </Reveal>
            <Reveal delay={0.18}>
              <Link href={`/${locale}/auth/register`}>
                <Button size="lg" className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 px-8 h-13 text-base font-bold gap-2">
                  {t.cta} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Button>
              </Link>
            </Reveal>
          </div>
        </section>

        {/* 3 short benefits — no heavy cards, fast scan */}
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

        {/* Trust bar */}
        <Reveal className="border-y border-outline-variant/15 bg-surface-container/15 py-6">
          <div className="max-w-2xl mx-auto px-5 sm:px-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-on-surface-variant">
            {t.trust.map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> {item}</span>
            ))}
          </div>
        </Reveal>

        {/* Final CTA */}
        <section className="relative isolate overflow-hidden py-16 sm:py-20 text-center bg-surface">
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] max-w-[120vw] rounded-full bg-indigo-500/25 dark:bg-indigo-500/20 blur-[110px]" />
          </div>
          <div className="relative max-w-xl mx-auto px-5 sm:px-6">
            <Reveal><h2 className="text-2xl sm:text-4xl font-black mb-6 leading-[1.1]">{t.finalH}</h2></Reveal>
            <Reveal delay={0.08}>
              <Link href={`/${locale}/auth/register`}>
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
