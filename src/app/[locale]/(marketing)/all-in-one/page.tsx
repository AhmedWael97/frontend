import type { Metadata } from "next";
import Link from "next/link";
import { FlaskConical, Video, MousePointerClick, Check } from "lucide-react";
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
    metaTitle: "A/B Testing, Heatmaps & Session Replay — All In One | EYE",
    metaDesc: "A/B testing, click & scroll heatmaps, and session replay, bundled with your analytics in one dashboard. No-code visual experiments, real recordings, one script. Free plan.",
    cta: "Get all three free", ctaFinal: "Start free — all three included",
    badge: "30-day free trial — no credit card, ever",
    heroH: "A/B testing, heatmaps, and session replay. One platform.",
    heroSub: "Stop stitching together three tools and three bills to understand and improve your site. EYE ships visual A/B testing, click/scroll heatmaps, and session replay together — one script, one dashboard, one price.",
    previewLabel: "yoursite.com/pricing",
    previewChips: ["A/B test running", "Heatmap live", "3 replays flagged"],
    probH: "Testing, watching, and mapping shouldn't need three logins.",
    probP: "You run an A/B test in one tool, check heatmaps in another, and dig through recordings in a third — none of them talk to each other, and none of them share your actual analytics data. EYE keeps the whole loop — hypothesis, evidence, result — in one place.",
    benefits: [
      { icon: FlaskConical, h: "Visual A/B testing", p: "No-code experiments: change copy, colors, or layout with a visual editor, or redirect to a whole new page. First variation is always your real page as the control — no risk while you set up." },
      { icon: MousePointerClick, h: "Click & scroll heatmaps", p: "See exactly where visitors click, and the line where most of them stop scrolling — on any page, including your test variations." },
      { icon: Video, h: "Session replay", p: "Watch real recordings of the sessions that matter — rage clicks, errors, abandoned forms — instead of guessing why a variation is losing." },
    ],
    cmpH: "Three tools, three tiers, three bills — or one.",
    cmpP: "A typical CRO stack is Optimizely or VWO for testing, Hotjar for heatmaps and replay, and Google Analytics for the numbers. That's three vendors, three scripts slowing your site, and no shared view of a visitor. EYE bundles all three with your core analytics, cookieless, on one plan.",
    useH: "How teams use it together",
    uses: [
      ["Test a pricing page", "Run an A/B test on your CTA copy, then heatmap each variation to see which one actually gets clicked — not just which one converts."],
      ["Fix a losing variation", "A/B test underperforming? Watch session replays of that variation's visitors to see exactly what they hesitated on."],
      ["Validate a redesign", "Ship a redesign as a split-URL test against the original, and use heatmaps + replay on both to prove the new page is actually better, not just different."],
    ],
    setupH: "One script. All three, from day one.",
    setupP: "Paste the tracker snippet once. Heatmaps and analytics start immediately; add data-replay=\"true\" for session recording; build your first experiment visually in the dashboard — no extra SDK for any of it.",
    faqH: "Frequently asked",
    faq: [
      ["Do I need three subscriptions?", "No — A/B testing, heatmaps, and session replay are all included in every paid plan, and heatmaps are available on the free plan too."],
      ["Is A/B testing really no-code?", "Yes. Build variations with a visual CSS/JS editor or a redirect URL — no engineering ticket required. A code-based option exists if you want it, but it's optional."],
      ["Will three tracking features slow my site down?", "No — it's one script under 5KB. Heatmaps and analytics are always-on; replay and experiment code load lazily so they never block first paint."],
      ["Can I see which variation wins with real evidence?", "Yes — results show conversion rate, uplift, and statistical significance per variation, plus revenue where you track purchases."],
    ],
    finalH: "Test it, watch it, map it. In one dashboard.",
    finalNote: "Free plan available. No credit card required.",
  },
  ar: {
    dir: "rtl",
    metaTitle: "اختبارات A/B والخرائط الحرارية وإعادة تشغيل الجلسات — في مكان واحد | EYE",
    metaDesc: "اختبارات A/B، خرائط حرارية للنقر والتمرير، وإعادة تشغيل الجلسات، مدمجة مع تحليلاتك في لوحة واحدة. تجارب مرئية بدون كود، تسجيلات حقيقية، سكربت واحد. خطة مجانية.",
    cta: "احصل على الثلاثة مجانًا", ctaFinal: "ابدأ مجانًا — الثلاثة مشمولة",
    badge: "تجربة مجانية 30 يومًا — بدون بطاقة ائتمان أبدًا",
    heroH: "اختبارات A/B، والخرائط الحرارية، وإعادة تشغيل الجلسات. منصة واحدة.",
    heroSub: "توقف عن ربط ثلاث أدوات وثلاث فواتير لفهم موقعك وتحسينه. يقدّم EYE اختبارات A/B المرئية، وخرائط النقر والتمرير الحرارية، وإعادة تشغيل الجلسات معًا — سكربت واحد، لوحة واحدة، سعر واحد.",
    previewLabel: "yoursite.com/pricing",
    previewChips: ["اختبار A/B قيد التشغيل", "خريطة حرارية مباشرة", "٣ تسجيلات مميّزة"],
    probH: "الاختبار والمشاهدة ورسم الخرائط لا يجب أن يحتاج ثلاثة حسابات دخول.",
    probP: "تُشغّل اختبار A/B في أداة، وتتحقق من الخرائط الحرارية في أخرى، وتبحث في التسجيلات في ثالثة — لا تتحدث مع بعضها، ولا تشارك بيانات تحليلاتك الفعلية. يحافظ EYE على الحلقة كاملة — الفرضية، الدليل، النتيجة — في مكان واحد.",
    benefits: [
      { icon: FlaskConical, h: "اختبارات A/B مرئية", p: "تجارب بدون كود: غيّر النص أو الألوان أو التصميم عبر محرر مرئي، أو أعد التوجيه لصفحة جديدة بالكامل. المتغيّر الأول هو دائمًا صفحتك الحقيقية كعنصر تحكم — بدون مخاطرة أثناء الإعداد." },
      { icon: MousePointerClick, h: "خرائط النقر والتمرير الحرارية", p: "اعرف بالضبط أين ينقر الزوّار، والسطر الذي يتوقف عنده معظمهم عن التمرير — في أي صفحة، بما فيها متغيّرات اختبارك." },
      { icon: Video, h: "إعادة تشغيل الجلسات", p: "شاهد تسجيلات حقيقية للجلسات المهمة — نقرات الغضب والأخطاء والنماذج المهجورة — بدلًا من التخمين لماذا يخسر أحد المتغيّرات." },
    ],
    cmpH: "ثلاث أدوات وثلاث خطط وثلاث فواتير — أو واحدة.",
    cmpP: "مجموعة أدوات CRO المعتادة هي Optimizely أو VWO للاختبار، و Hotjar للخرائط الحرارية والتسجيلات، و Google Analytics للأرقام. هذا ثلاثة موردين وثلاثة سكربتات تُبطئ موقعك، وبدون رؤية موحّدة للزائر. يجمع EYE الثلاثة مع تحليلاتك الأساسية، بدون كوكيز، وفي خطة واحدة.",
    useH: "كيف تستخدمها الفرق معًا",
    uses: [
      ["اختبار صفحة الأسعار", "شغّل اختبار A/B على نص زر الدعوة، ثم ارسم خريطة حرارية لكل متغيّر لترى أيهم يُنقر فعلًا — وليس فقط أيهم يحوّل."],
      ["إصلاح متغيّر خاسر", "اختبار A/B ضعيف الأداء؟ شاهد تسجيلات جلسات زوّار هذا المتغيّر لترى بالضبط أين ترددوا."],
      ["التحقق من إعادة تصميم", "أطلق إعادة التصميم كاختبار split-URL مقابل الأصلية، واستخدم الخرائط الحرارية والتسجيلات على الاثنتين لإثبات أن الصفحة الجديدة أفضل فعلًا، لا مجرد مختلفة."],
    ],
    setupH: "سكربت واحد. الثلاثة، منذ اليوم الأول.",
    setupP: "الصق سكربت المتتبّع مرة واحدة. تبدأ الخرائط الحرارية والتحليلات فورًا؛ أضف data-replay=\"true\" لتسجيل الجلسات؛ وابنِ تجربتك الأولى بشكل مرئي من لوحة التحكم — بدون SDK إضافي لأي منها.",
    faqH: "الأسئلة الشائعة",
    faq: [
      ["هل أحتاج ثلاثة اشتراكات؟", "لا — اختبارات A/B والخرائط الحرارية وإعادة تشغيل الجلسات كلها مشمولة في كل خطة مدفوعة، والخرائط الحرارية متاحة في الخطة المجانية أيضًا."],
      ["هل اختبارات A/B فعلًا بدون كود؟", "نعم. ابنِ المتغيّرات بمحرر CSS/JS مرئي أو برابط إعادة توجيه — بدون تذكرة هندسية. يوجد خيار قائم على الكود إن أردت، لكنه اختياري."],
      ["هل ستُبطئ ثلاث ميزات تتبّع موقعي؟", "لا — إنه سكربت واحد أقل من 5KB. الخرائط الحرارية والتحليلات تعمل دائمًا؛ وكود التسجيل والتجارب يُحمَّل بشكل كسول فلا يعطّل أول عرض للصفحة أبدًا."],
      ["هل يمكنني رؤية أي متغيّر يفوز بدليل حقيقي؟", "نعم — تعرض النتائج معدل التحويل والارتفاع والدلالة الإحصائية لكل متغيّر، بالإضافة إلى الإيرادات إن كنت تتتبّع المبيعات."],
    ],
    finalH: "اختبره، شاهده، ارسم خريطته. في لوحة واحدة.",
    finalNote: "خطة مجانية متاحة. بدون بطاقة ائتمان.",
  },
} as const;

const DOTS: [number, number, number][] = [
  [50, 22, 1], [48, 23, 0.9], [52, 21, 0.8], [30, 40, 0.5], [70, 42, 0.6],
  [22, 62, 0.35], [78, 63, 0.4],
];

export function generateMetadata({ params }: Props): Metadata {
  const t = C[params.locale === "ar" ? "ar" : "en"];
  const url = `${SITE_URL}${localePath(params.locale, "/all-in-one")}`;
  return {
    title: t.metaTitle, description: t.metaDesc,
    keywords: ["A/B testing tool", "heatmaps and session replay", "Hotjar alternative", "VWO alternative", "conversion rate optimization platform", "no-code A/B testing", "اختبارات A/B", "خرائط حرارية", "إعادة تشغيل الجلسات"],
    alternates: { canonical: url, languages: { en: `${SITE_URL}${localePath("en", "/all-in-one")}`, ar: `${SITE_URL}${localePath("ar", "/all-in-one")}` } },
    openGraph: { title: t.metaTitle, description: t.metaDesc, url, type: "website", images: [`${SITE_URL}${localePath(params.locale, "/opengraph-image")}`] },
  };
}

export default function AllInOneLanding({ params }: Props) {
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
            <Badge label={t.badge} />
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-5 text-white">{t.heroH}</h1>
            <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-8">{t.heroSub}</p>
            <CTA label={t.cta} />

            <div className="mt-14 sm:mt-16 max-w-3xl mx-auto">
              <BrowserFrame url={t.previewLabel}>
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
                <div className="flex flex-wrap gap-2 mt-3 justify-center">
                  {t.previewChips.map((c) => (
                    <span key={c} className="inline-flex items-center gap-1.5 rounded-none border border-[#262626] bg-[#171717] px-2.5 py-1 text-[11px] font-semibold text-neutral-300" style={mono}>{c}</span>
                  ))}
                </div>
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
