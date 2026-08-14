import type { Metadata } from "next";
import Link from "next/link";
import { MousePointerClick, ArrowDownToLine, Layers, Check } from "lucide-react";
import { SITE_URL, localePath } from "@/lib/seo";
import { Reveal, RevealGroup, RevealItem, GradientBlobs } from "@/components/marketing/Reveal";
import { BrowserFrame } from "@/components/marketing/BrowserFrame";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import MobileCtaBar from "@/components/marketing/MobileCtaBar";
import SignupPopup from "@/components/marketing/SignupPopup";

type Props = { params: { locale: string } };

const C = {
  en: {
    dir: "ltr",
    metaTitle: "Free Click & Scroll Heatmaps | EYE (Hotjar Alternative)",
    metaDesc: "Click and scroll heatmaps included in your analytics — see exactly where visitors click and where they stop scrolling. Cookieless, 2KB script, free plan. A privacy-first Hotjar alternative.",
    cta: "Get heatmaps free", ctaFinal: "Start free — heatmaps included",
    badge: "30-day free trial — no credit card, ever",
    heroH: "See exactly where visitors click — and where they don't.",
    heroSub: "Click and scroll heatmaps included in your analytics, not sold as a separate subscription. Find what users ignore, fix it, and watch conversions climb.",
    previewUrl: "yoursite.com/pricing",
    previewNote: "Brighter spots = more clicks. This CTA is getting ignored below the fold.",
    probH: "Your analytics says what happened. Heatmaps show you why.",
    probP: "Bounce rate tells you visitors left. It doesn't tell you they never scrolled past your hero, or that they kept clicking an image that isn't a button. Heatmaps do.",
    benefits: [
      { icon: MousePointerClick, h: "Click heatmaps", p: "Every tap and click, mapped onto your live page. Instantly spot dead buttons, ignored CTAs, and “rage clicks” on things that don't work." },
      { icon: ArrowDownToLine, h: "Scroll depth maps", p: "See the exact line where most visitors stop reading. If your CTA is below it, you found your problem." },
      { icon: Layers, h: "Included, not an add-on", p: "Most tools charge separately for heatmaps. In EYE they come with your analytics, funnels, and live visitor view — one price, one dashboard." },
    ],
    cmpH: "Why pay for two tools?",
    cmpP: "Hotjar for heatmaps plus Google Analytics for numbers means two dashboards, two bills, and a cookie banner. EYE does both — cookieless, in one place.",
    useH: "Built for your use case",
    uses: [
      ["E-commerce", "Find which product photos get clicked and which get ignored."],
      ["SaaS", "See if visitors ever reach your pricing table."],
      ["Content sites", "Learn where readers stop scrolling and place your signup form above it."],
    ],
    setupH: "One line of code. Heatmaps by tonight.",
    setupP: "Paste the 2KB script, and EYE starts recording clicks and scrolls immediately. No configuration, no tagging.",
    faqH: "Frequently asked",
    faq: [
      ["Do heatmaps slow my site down?", "No — the tracker is under 2KB and loads asynchronously."],
      ["Do I need a cookie banner?", "No. EYE is cookieless."],
      ["Is there a free plan?", "Yes — 10,000 events/day including heatmaps."],
    ],
    finalH: "Stop guessing what users see. Watch them.",
    finalNote: "Free plan available. No credit card required.",
  },
  ar: {
    dir: "rtl",
    metaTitle: "خرائط حرارية مجانية للنقر والتمرير | EYE (بديل Hotjar)",
    metaDesc: "خرائط حرارية للنقر والتمرير مدمجة في تحليلاتك — شاهد أين ينقر الزوّار وأين يتوقفون عن التمرير. بدون كوكيز، سكربت 2KB، خطة مجانية. بديل Hotjar يحترم الخصوصية.",
    cta: "احصل على الخرائط الحرارية مجانًا", ctaFinal: "ابدأ مجانًا — الخرائط الحرارية مشمولة",
    badge: "تجربة مجانية 30 يومًا — بدون بطاقة ائتمان أبدًا",
    heroH: "شاهد بالضبط أين يضغط زوّارك — وأين يتجاهلون.",
    heroSub: "خرائط حرارية للنقر والتمرير مدمجة في تحليلاتك، وليست اشتراكًا منفصلًا. اكتشف ما يتجاهله المستخدمون، أصلحه، وشاهد تحويلاتك ترتفع.",
    previewUrl: "yoursite.com/pricing",
    previewNote: "الأماكن الأكثر سطوعًا = نقرات أكثر. هذا الزر يُتجاهل تحت الشاشة.",
    probH: "التحليلات تخبرك بما حدث. الخرائط الحرارية تريك السبب.",
    probP: "معدل الارتداد يقول إن الزوّار غادروا. لكنه لا يقول إنهم لم يتجاوزوا الشاشة الأولى، أو أنهم ظلوا يضغطون على صورة ليست زرًا. الخرائط الحرارية تفعل.",
    benefits: [
      { icon: MousePointerClick, h: "خرائط النقرات", p: "كل نقرة ولمسة، مرسومة على صفحتك الفعلية. اكتشف فورًا الأزرار الميتة والدعوات المتجاهَلة و“نقرات الغضب” على عناصر لا تعمل." },
      { icon: ArrowDownToLine, h: "خرائط عمق التمرير", p: "اعرف السطر الذي يتوقف عنده معظم الزوّار عن القراءة. إذا كان زر التحويل تحته، فقد وجدت مشكلتك." },
      { icon: Layers, h: "مدمجة، وليست إضافة مدفوعة", p: "معظم الأدوات تبيع الخرائط الحرارية باشتراك منفصل. في EYE تأتي مع التحليلات والقمع وعرض الزوّار المباشر — سعر واحد ولوحة واحدة." },
    ],
    cmpH: "لماذا تدفع لأداتين؟",
    cmpP: "Hotjar للخرائط الحرارية + Google Analytics للأرقام = لوحتان وفاتورتان وشريط كوكيز. EYE يقوم بالاثنين — بدون كوكيز، وفي مكان واحد.",
    useH: "مصمّم لحالتك",
    uses: [
      ["متاجر إلكترونية", "اعرف أي صور المنتجات تُنقر وأيها تُتجاهل."],
      ["شركات SaaS", "هل يصل الزوّار أصلًا إلى جدول الأسعار؟"],
      ["مواقع المحتوى", "اعرف أين يتوقف القرّاء عن التمرير وضع نموذج الاشتراك قبله."],
    ],
    setupH: "سطر كود واحد. خرائط حرارية الليلة.",
    setupP: "الصق السكربت (2KB) ويبدأ EYE بتسجيل النقرات والتمرير فورًا. بدون إعدادات وبدون وسوم.",
    faqH: "الأسئلة الشائعة",
    faq: [
      ["هل تبطئ الخرائط الحرارية موقعي؟", "لا — المتتبّع أقل من 2KB وغير متزامن."],
      ["هل أحتاج شريط كوكيز؟", "لا. EYE بدون كوكيز."],
      ["هل توجد خطة مجانية؟", "نعم — ١٠٬٠٠٠ حدث يوميًا تشمل الخرائط الحرارية."],
    ],
    finalH: "توقف عن تخمين ما يراه المستخدمون. شاهدهم.",
    finalNote: "خطة مجانية متاحة. بدون بطاقة ائتمان.",
  },
} as const;

// Sample click positions for the hero preview mock — illustrative, not live data.
const DOTS: [number, number, number][] = [
  [50, 22, 1], [48, 23, 0.9], [52, 21, 0.8], [30, 40, 0.5], [70, 42, 0.6],
  [22, 62, 0.35], [78, 63, 0.4], [50, 88, 0.9], [45, 89, 0.8], [55, 87, 0.7],
];

export function generateMetadata({ params }: Props): Metadata {
  const t = C[params.locale === "ar" ? "ar" : "en"];
  const url = `${SITE_URL}${localePath(params.locale, "/heatmaps")}`;
  return {
    title: t.metaTitle, description: t.metaDesc,
    keywords: ["heatmap tool", "Hotjar alternative", "click heatmap", "scroll depth tracking", "website heatmap free", "خرائط حرارية", "بديل هوتجار"],
    alternates: { canonical: url, languages: { en: `${SITE_URL}${localePath("en", "/heatmaps")}`, ar: `${SITE_URL}${localePath("ar", "/heatmaps")}` } },
    openGraph: { title: t.metaTitle, description: t.metaDesc, url, type: "website", images: [`${SITE_URL}${localePath(params.locale, "/opengraph-image")}`] },
  };
}

export default function HeatmapsLanding({ params }: Props) {
  const ar = params.locale === "ar";
  const t = C[ar ? "ar" : "en"];
  const reg = localePath(params.locale, "/auth/register");
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: t.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  const mono = { fontFamily: "var(--font-mono-marketing)" };
  const CTA = ({ label }: { label: string }) => (
    <Link href={reg} className="inline-flex items-center justify-center rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none px-7 py-3.5 text-base font-bold transition-colors">{label}</Link>
  );
  const Badge = ({ label }: { label: string }) => (
    <span className="inline-flex items-center gap-1.5 rounded-none border border-green-500/30 bg-green-500/10 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-green-400 mb-6" style={mono}>
      <Check className="w-3.5 h-3.5" /> {label}
    </span>
  );

  return (
    <div dir={t.dir} className="min-h-screen bg-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Navbar />

      <main className="overflow-hidden">
        {/* Hero */}
        <section className="relative isolate overflow-hidden text-center pt-16 sm:pt-20 pb-16 sm:pb-24 bg-black">
          <GradientBlobs />
          <div className="relative max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 pt-8">
            {/* Above-the-fold hero: renders at full opacity immediately, no
                scroll-triggered Reveal — whileInView wasn't reliably firing
                for content already in the viewport on cold load, leaving a
                washed-out ~30%-opacity hero until the visitor scrolled. */}
            <Badge label={t.badge} />
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-5 text-white">{t.heroH}</h1>
            <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-8">{t.heroSub}</p>
            <CTA label={t.cta} />

            <div className="mt-14 sm:mt-16 max-w-3xl mx-auto">
              <BrowserFrame url={t.previewUrl}>
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
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="py-16 sm:py-20 bg-[#0A0A0A] border-y border-[#262626]">
          <Reveal className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">{t.probH}</h2>
            <p className="text-lg text-neutral-400 max-w-3xl">{t.probP}</p>
          </Reveal>
        </section>

        {/* Benefits */}
        <section className="py-16 sm:py-20 bg-black">
          <RevealGroup className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#262626] border border-[#262626]">
            {t.benefits.map((b) => (
              <RevealItem key={b.h} className="bg-black p-6 hover:bg-[#0A0A0A] transition-colors">
                <span className="w-11 h-11 rounded-none border border-[#262626] bg-[#171717] flex items-center justify-center mb-4"><b.icon className="w-5 h-5 text-[#00E5FF]" /></span>
                <h3 className="font-bold text-lg mb-2 text-white">{b.h}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{b.p}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {/* Comparison */}
        <section className="py-16 sm:py-20 bg-[#0A0A0A] border-y border-[#262626]">
          <Reveal className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">{t.cmpH}</h2>
            <p className="text-lg text-neutral-400 max-w-3xl">{t.cmpP}</p>
          </Reveal>
        </section>

        {/* Use cases */}
        <section className="py-16 sm:py-20 bg-black">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal><h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white">{t.useH}</h2></Reveal>
            <RevealGroup className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#262626] border border-[#262626]">
              {t.uses.map(([h, p]) => (
                <RevealItem key={h} className="bg-black p-5 hover:bg-[#0A0A0A] transition-colors">
                  <p className="font-bold text-[#00E5FF] mb-1">{h}</p>
                  <p className="text-sm text-neutral-400">{p}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* Setup */}
        <section className="py-16 sm:py-20 text-center bg-[#0A0A0A] border-y border-[#262626]">
          <Reveal className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">{t.setupH}</h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">{t.setupP}</p>
          </Reveal>
        </section>

        {/* FAQ */}
        <section className="py-16 sm:py-20 bg-black">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal><h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white">{t.faqH}</h2></Reveal>
            <RevealGroup className="border border-[#262626] bg-[#0A0A0A]">
              {t.faq.map(([q, a]) => (
                <RevealItem key={q} className="p-5 border-b border-[#262626] last:border-b-0">
                  <p className="font-bold text-white mb-1">{q}</p>
                  <p className="text-neutral-400">{a}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative isolate overflow-hidden py-20 sm:py-24 text-center bg-[#0A0A0A] border-t border-[#262626]">
          <GradientBlobs variant="compact" />
          <div className="relative max-w-2xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal><h2 className="text-3xl sm:text-5xl font-bold mb-6 leading-[1.08] text-white">{t.finalH}</h2></Reveal>
            <Reveal delay={0.1}><CTA label={t.ctaFinal} /></Reveal>
            <Reveal delay={0.18}><p className="text-sm text-neutral-500 mt-4">{t.finalNote}</p></Reveal>
          </div>
        </section>
      </main>

      <Footer locale={params.locale} />
      <MobileCtaBar />
      <SignupPopup />
    </div>
  );
}
