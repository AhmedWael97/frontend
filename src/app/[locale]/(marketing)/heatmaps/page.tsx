import type { Metadata } from "next";
import Link from "next/link";
import { Eye, MousePointerClick, ArrowDownToLine, Layers } from "lucide-react";
import { SITE_URL } from "@/lib/seo";
import { Reveal, RevealGroup, RevealItem, GradientBlobs } from "@/components/marketing/Reveal";

type Props = { params: { locale: string } };

const C = {
  en: {
    dir: "ltr",
    metaTitle: "Free Click & Scroll Heatmaps | EYE (Hotjar Alternative)",
    metaDesc: "Click and scroll heatmaps included in your analytics — see exactly where visitors click and where they stop scrolling. Cookieless, 2KB script, free plan. A privacy-first Hotjar alternative.",
    cta: "Get heatmaps free", ctaFinal: "Start free — heatmaps included",
    trust: "Free plan includes heatmaps · No cookies · 2-minute setup",
    heroH: "See exactly where visitors click — and where they don't.",
    heroSub: "Click and scroll heatmaps included in your analytics, not sold as a separate subscription. Find what users ignore, fix it, and watch conversions climb.",
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
    finalNote: "No credit card required.",
  },
  ar: {
    dir: "rtl",
    metaTitle: "خرائط حرارية مجانية للنقر والتمرير | EYE (بديل Hotjar)",
    metaDesc: "خرائط حرارية للنقر والتمرير مدمجة في تحليلاتك — شاهد أين ينقر الزوّار وأين يتوقفون عن التمرير. بدون كوكيز، سكربت 2KB، خطة مجانية. بديل Hotjar يحترم الخصوصية.",
    cta: "احصل على الخرائط الحرارية مجانًا", ctaFinal: "ابدأ مجانًا — الخرائط الحرارية مشمولة",
    trust: "الخطة المجانية تشمل الخرائط الحرارية · بدون كوكيز · تركيب خلال دقيقتين",
    heroH: "شاهد بالضبط أين يضغط زوّارك — وأين يتجاهلون.",
    heroSub: "خرائط حرارية للنقر والتمرير مدمجة في تحليلاتك، وليست اشتراكًا منفصلًا. اكتشف ما يتجاهله المستخدمون، أصلحه، وشاهد تحويلاتك ترتفع.",
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
    finalNote: "بدون بطاقة ائتمان.",
  },
} as const;

export function generateMetadata({ params }: Props): Metadata {
  const t = C[params.locale === "ar" ? "ar" : "en"];
  const url = `${SITE_URL}/${params.locale}/heatmaps`;
  return {
    title: t.metaTitle, description: t.metaDesc,
    keywords: ["heatmap tool", "Hotjar alternative", "click heatmap", "scroll depth tracking", "website heatmap free", "خرائط حرارية", "بديل هوتجار"],
    alternates: { canonical: url, languages: { en: `${SITE_URL}/en/heatmaps`, ar: `${SITE_URL}/ar/heatmaps` } },
    openGraph: { title: t.metaTitle, description: t.metaDesc, url, type: "website", images: [`${SITE_URL}/${params.locale}/opengraph-image`] },
  };
}

export default function HeatmapsLanding({ params }: Props) {
  const ar = params.locale === "ar";
  const t = C[ar ? "ar" : "en"];
  const reg = `/${params.locale}/auth/register`;
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: t.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  const CTA = ({ label }: { label: string }) => (
    <Link href={reg} className="inline-flex items-center justify-center rounded-xl bg-primary text-on-primary px-7 py-3.5 text-base font-bold hover:opacity-90 transition-opacity">{label}</Link>
  );

  return (
    <div dir={t.dir} className="min-h-screen bg-background text-on-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <header className="border-b border-outline-variant/10"><div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
        <Link href={`/${params.locale}`} className="flex items-center gap-2" aria-label="EYE home">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"><Eye className="w-4 h-4 text-white" /></span>
          <span className="text-lg font-black tracking-tighter text-primary uppercase">EYE</span>
        </Link>
      </div></header>

      <main className="max-w-5xl mx-auto px-4">
        <section className="relative isolate overflow-hidden text-center py-16 sm:py-24">
          <GradientBlobs />
          <div className="relative">
            <Reveal><h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-5">{t.heroH}</h1></Reveal>
            <Reveal delay={0.08}><p className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-8">{t.heroSub}</p></Reveal>
            <Reveal delay={0.16}><CTA label={t.cta} /></Reveal>
            <Reveal delay={0.22}><p className="text-sm text-on-surface-variant/80 mt-4">{t.trust}</p></Reveal>
          </div>
        </section>

        <Reveal as="section" className="py-12 border-t border-outline-variant/10">
          <h2 className="text-2xl sm:text-3xl font-black mb-4">{t.probH}</h2>
          <p className="text-lg text-on-surface-variant max-w-3xl">{t.probP}</p>
        </Reveal>

        <RevealGroup className="py-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {t.benefits.map((b) => (
            <RevealItem key={b.h} className="rounded-2xl border border-outline-variant/15 p-6 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
              <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><b.icon className="w-5 h-5 text-primary" /></span>
              <h3 className="font-black text-lg mb-2">{b.h}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{b.p}</p>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal as="section" className="py-12 border-t border-outline-variant/10">
          <h2 className="text-2xl sm:text-3xl font-black mb-3">{t.cmpH}</h2>
          <p className="text-lg text-on-surface-variant max-w-3xl">{t.cmpP}</p>
        </Reveal>

        <section className="py-12">
          <Reveal><h2 className="text-2xl sm:text-3xl font-black mb-6">{t.useH}</h2></Reveal>
          <RevealGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {t.uses.map(([h, p]) => (
              <RevealItem key={h} className="rounded-xl border border-outline-variant/15 p-5 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
                <p className="font-bold text-primary mb-1">{h}</p>
                <p className="text-sm text-on-surface-variant">{p}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        <Reveal as="section" className="py-12 text-center border-t border-outline-variant/10">
          <h2 className="text-2xl sm:text-3xl font-black mb-3">{t.setupH}</h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">{t.setupP}</p>
        </Reveal>

        <section className="py-12">
          <Reveal><h2 className="text-2xl sm:text-3xl font-black mb-6">{t.faqH}</h2></Reveal>
          <RevealGroup className="space-y-4 max-w-3xl">
            {t.faq.map(([q, a]) => (
              <RevealItem key={q} className="rounded-xl border border-outline-variant/15 p-5">
                <p className="font-bold text-on-surface mb-1">{q}</p>
                <p className="text-on-surface-variant">{a}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        <section className="relative isolate overflow-hidden py-20 text-center border-t border-outline-variant/10">
          <GradientBlobs variant="compact" />
          <div className="relative">
            <Reveal><h2 className="text-3xl sm:text-4xl font-black mb-6">{t.finalH}</h2></Reveal>
            <Reveal delay={0.1}><CTA label={t.ctaFinal} /></Reveal>
            <Reveal delay={0.18}><p className="text-sm text-on-surface-variant/80 mt-4">{t.finalNote}</p></Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-outline-variant/10 py-8 text-center text-xs text-on-surface-variant">
        © {new Date().getFullYear()} EYE Analytics · <a href="mailto:info@eye-analysis.online" className="hover:text-on-surface">info@eye-analysis.online</a>
      </footer>
    </div>
  );
}
