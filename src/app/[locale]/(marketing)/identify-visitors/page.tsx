import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Building2, Target, Filter, ShieldCheck } from "lucide-react";
import { SITE_URL } from "@/lib/seo";
import { Reveal, RevealGroup, RevealItem, GradientBlobs } from "@/components/marketing/Reveal";

type Props = { params: { locale: string } };

const C = {
  en: {
    dir: "ltr",
    metaTitle: "Identify Website Visitors — See Which Companies Visit | EYE",
    metaDesc: "See which companies browse your website, what pages they read, and how interested they are — before they fill out a form. Cookieless, GDPR-compliant B2B visitor identification. Free 30-day trial. A Leadfeeder alternative.",
    cta: "See who's visiting — free", ctaFinal: "Start identifying visitors — free",
    trust: "30-day free trial · No cookies · GDPR compliant",
    heroH: "Companies are browsing your site right now. Find out who.",
    heroSub: "EYE reveals which businesses visit your website, what pages they read, and how interested they are — before they ever fill out a form.",
    probH: "98% of your B2B visitors leave without a trace.",
    probP: "They read your pricing page, compare you to competitors, and leave — anonymously. Your sales team never knows they existed. That's pipeline walking out the door.",
    benefits: [
      { icon: Building2, h: "Know the company", p: "See the business name, industry, and company size behind anonymous visits — automatically matched, no forms needed." },
      { icon: Target, h: "Read their intent", p: "Which pages did they view? How many times did they return? A company that hit your pricing page three times this week is a warm lead." },
      { icon: Filter, h: "Filter to what matters", p: "Cut the noise: filter by industry, company size, and intent so sales only sees accounts worth chasing." },
    ],
    stepsH: "How sales teams use it",
    steps: [
      ["Monday morning", "Open the dashboard, see which companies visited last week."],
      ["Qualify", "Filter to your target industry and size; check which pages they read."],
      ["Reach out", "Contact warm accounts with context — “saw you're evaluating analytics tools” — instead of cold-calling strangers."],
    ],
    privH: "Company-level, not personal.",
    privP: "EYE identifies organizations, not individuals. No cookies, no personal data stored — so your lead intelligence is GDPR compliant by design.",
    cmpH: "Lead intelligence without the enterprise price tag.",
    cmpP: "Dedicated visitor-ID tools charge hundreds per month for identification alone. EYE includes it with full analytics, heatmaps, and funnels.",
    faqH: "Frequently asked",
    faq: [
      ["Can you identify every visitor?", "No tool can. EYE matches visitors coming from company networks and enriches them with firmographic data."],
      ["Is this legal under GDPR?", "Yes — identification is at company level with no personal data stored."],
      ["Do I need to install anything extra?", "No, the same 2KB script powers everything."],
    ],
    finalH: "Your next customer already visited. Stop missing them.",
    finalNote: "30-day free trial. No credit card required.",
  },
  ar: {
    dir: "rtl",
    metaTitle: "حدّد زوّار موقعك — اعرف الشركات التي تزورك | EYE",
    metaDesc: "اعرف الشركات التي تتصفح موقعك، والصفحات التي تقرأها، ومدى اهتمامها — قبل أن تملأ أي نموذج. تحديد زوّار B2B بدون كوكيز ومتوافق مع GDPR. تجربة مجانية 30 يومًا. بديل Leadfeeder.",
    cta: "اعرف من يزورك — مجانًا", ctaFinal: "ابدأ تحديد زوّارك — مجانًا",
    trust: "تجربة مجانية ٣٠ يومًا · بدون كوكيز · متوافق مع GDPR",
    heroH: "شركات تتصفح موقعك الآن. اعرف من هي.",
    heroSub: "EYE يكشف لك الشركات التي تزور موقعك، والصفحات التي تقرأها، ومدى اهتمامها — قبل أن تملأ أي نموذج تواصل.",
    probH: "٩٨٪ من زوّارك في B2B يغادرون دون أثر.",
    probP: "يقرؤون صفحة الأسعار، يقارنونك بالمنافسين، ثم يغادرون — مجهولين. فريق مبيعاتك لا يعلم بوجودهم أصلًا. هذه صفقات تخرج من الباب.",
    benefits: [
      { icon: Building2, h: "اعرف الشركة", p: "شاهد اسم الشركة وقطاعها وحجمها خلف الزيارات المجهولة — مطابقة تلقائية، بدون نماذج." },
      { icon: Target, h: "اقرأ نيّتها", p: "أي صفحات شاهدت؟ كم مرة عادت؟ شركة زارت صفحة أسعارك ثلاث مرات هذا الأسبوع هي عميل محتمل جاهز." },
      { icon: Filter, h: "رشّح ما يهمك", p: "تجاهل الضوضاء: رشّح حسب القطاع وحجم الشركة ومستوى الاهتمام، ليرى فريق المبيعات الحسابات المهمة فقط." },
    ],
    stepsH: "كيف تستخدمه فرق المبيعات",
    steps: [
      ["صباح الاثنين", "افتح اللوحة وشاهد الشركات التي زارت موقعك الأسبوع الماضي."],
      ["التأهيل", "رشّح حسب القطاع والحجم المستهدف؛ راجع الصفحات التي قرأتها."],
      ["التواصل", "تواصل مع الحسابات المهتمة بسياق واضح بدلًا من الاتصال البارد بغرباء."],
    ],
    privH: "على مستوى الشركة، وليس الأفراد.",
    privP: "EYE يحدد المؤسسات، وليس الأشخاص. بدون كوكيز وبدون بيانات شخصية — معلومات مبيعات متوافقة مع GDPR بطبيعتها.",
    cmpH: "معلومات العملاء المحتملين بدون أسعار الشركات الكبرى.",
    cmpP: "أدوات تحديد الزوّار المتخصصة تتقاضى مئات الدولارات شهريًا لهذه الميزة وحدها. EYE يقدمها ضمن التحليلات الكاملة والخرائط الحرارية والقمع.",
    faqH: "الأسئلة الشائعة",
    faq: [
      ["هل يمكن تحديد كل زائر؟", "لا توجد أداة تستطيع ذلك. EYE يطابق الزوّار القادمين من شبكات الشركات ويثريهم ببيانات الشركة."],
      ["هل هذا قانوني بموجب GDPR؟", "نعم — التحديد على مستوى الشركة دون تخزين بيانات شخصية."],
      ["هل أحتاج تركيب شيء إضافي؟", "لا، نفس السكربت (2KB) يشغّل كل شيء."],
    ],
    finalH: "عميلك القادم زار موقعك بالفعل. لا تفوّته.",
    finalNote: "تجربة ٣٠ يومًا. بدون بطاقة ائتمان.",
  },
} as const;

export function generateMetadata({ params }: Props): Metadata {
  const t = C[params.locale === "ar" ? "ar" : "en"];
  const url = `${SITE_URL}/${params.locale}/identify-visitors`;
  return {
    title: t.metaTitle, description: t.metaDesc,
    keywords: ["identify website visitors", "Leadfeeder alternative", "B2B visitor identification", "which companies visit my website", "website visitor tracking B2B", "تحديد زوار الموقع", "بديل Leadfeeder"],
    alternates: { canonical: url, languages: { en: `${SITE_URL}/en/identify-visitors`, ar: `${SITE_URL}/ar/identify-visitors` } },
    openGraph: { title: t.metaTitle, description: t.metaDesc, url, type: "website", images: [`${SITE_URL}/${params.locale}/opengraph-image`] },
  };
}

export default function IdentifyVisitorsLanding({ params }: Props) {
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
            <Reveal><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-5"><ShieldCheck className="w-3.5 h-3.5" />GDPR · B2B</span></Reveal>
            <Reveal delay={0.05}><h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-5">{t.heroH}</h1></Reveal>
            <Reveal delay={0.12}><p className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-8">{t.heroSub}</p></Reveal>
            <Reveal delay={0.19}><CTA label={t.cta} /></Reveal>
            <Reveal delay={0.25}><p className="text-sm text-on-surface-variant/80 mt-4">{t.trust}</p></Reveal>
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

        <section className="py-12 border-t border-outline-variant/10">
          <Reveal><h2 className="text-2xl sm:text-3xl font-black mb-6">{t.stepsH}</h2></Reveal>
          <RevealGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {t.steps.map(([h, p], i) => (
              <RevealItem key={h} className="rounded-xl border border-outline-variant/15 p-5 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
                <span className="inline-flex w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-black items-center justify-center mb-2">{i + 1}</span>
                <p className="font-bold text-on-surface mb-1">{h}</p>
                <p className="text-sm text-on-surface-variant">{p}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        <Reveal as="section" className="py-12 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 my-4">
          <h2 className="text-xl sm:text-2xl font-black mb-2 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-500" />{t.privH}</h2>
          <p className="text-on-surface-variant max-w-3xl">{t.privP}</p>
        </Reveal>

        <Reveal as="section" className="py-12 border-t border-outline-variant/10">
          <h2 className="text-2xl sm:text-3xl font-black mb-3">{t.cmpH}</h2>
          <p className="text-lg text-on-surface-variant max-w-3xl">{t.cmpP}</p>
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
