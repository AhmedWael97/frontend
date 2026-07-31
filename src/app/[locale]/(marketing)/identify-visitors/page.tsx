import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Target, Filter, ShieldCheck } from "lucide-react";
import { SITE_URL } from "@/lib/seo";
import { Reveal, RevealGroup, RevealItem, GradientBlobs } from "@/components/marketing/Reveal";
import { BrowserFrame } from "@/components/marketing/BrowserFrame";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import MobileCtaBar from "@/components/marketing/MobileCtaBar";

type Props = { params: { locale: string } };

const C = {
  en: {
    dir: "ltr",
    metaTitle: "Identify Website Visitors — See Which Companies Visit | EYE",
    metaDesc: "See which companies browse your website, what pages they read, and how interested they are — before they fill out a form. Cookieless, GDPR-compliant B2B visitor identification. Free 30-day trial. A Leadfeeder alternative.",
    cta: "See who's visiting — free", ctaFinal: "Start identifying visitors — free",
    badge: "30-day free trial — no credit card, ever",
    heroH: "Companies are browsing your site right now. Find out who.",
    heroSub: "EYE reveals which businesses visit your website, what pages they read, and how interested they are — before they ever fill out a form.",
    previewH: "Companies visiting this week",
    previewRows: [
      ["Acme Logistics", "Pricing, Integrations", "3 visits"],
      ["Northwind SaaS", "Homepage, Docs", "1 visit"],
      ["Blue Harbor Retail", "Pricing, Case studies", "5 visits"],
    ],
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
    badge: "تجربة مجانية 30 يومًا — بدون بطاقة ائتمان أبدًا",
    heroH: "شركات تتصفح موقعك الآن. اعرف من هي.",
    heroSub: "EYE يكشف لك الشركات التي تزور موقعك، والصفحات التي تقرأها، ومدى اهتمامها — قبل أن تملأ أي نموذج تواصل.",
    previewH: "الشركات الزائرة هذا الأسبوع",
    previewRows: [
      ["Acme Logistics", "الأسعار، التكاملات", "3 زيارات"],
      ["Northwind SaaS", "الرئيسية، الوثائق", "زيارة واحدة"],
      ["Blue Harbor Retail", "الأسعار، دراسات الحالة", "5 زيارات"],
    ],
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
    <Link href={reg} className="inline-flex items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/30 px-7 py-3.5 text-base font-bold transition-colors">{label}</Link>
  );
  const Badge = ({ label }: { label: string }) => (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-6">
      <ShieldCheck className="w-3.5 h-3.5" /> {label}
    </span>
  );

  return (
    <div dir={t.dir} className="min-h-screen bg-background text-on-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Navbar />

      <main className="overflow-hidden">
        <section className="relative isolate overflow-hidden text-center pt-28 sm:pt-36 pb-16 sm:pb-24 bg-surface">
          <GradientBlobs />
          <div className="relative max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal><Badge label={t.badge} /></Reveal>
            <Reveal delay={0.06}><h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-5">{t.heroH}</h1></Reveal>
            <Reveal delay={0.14}><p className="text-lg sm:text-xl text-on-surface-variant max-w-2xl mx-auto mb-8">{t.heroSub}</p></Reveal>
            <Reveal delay={0.22}><CTA label={t.cta} /></Reveal>

            <Reveal delay={0.3} className="mt-14 sm:mt-16 max-w-2xl mx-auto">
              <BrowserFrame url="dashboard.eye-analysis.online/leads">
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">{t.previewH}</p>
                <div className="rounded-xl border border-outline-variant/15 overflow-hidden">
                  {t.previewRows.map(([name, pages, visits], i) => (
                    <div key={name} className={`flex items-center justify-between gap-3 px-4 py-3 ${i !== t.previewRows.length - 1 ? "border-b border-outline-variant/10" : ""}`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-lg bg-amber-500/12 flex items-center justify-center shrink-0"><Building2 className="w-4 h-4 text-amber-500 dark:text-amber-400" /></span>
                        <div className="min-w-0 text-left rtl:text-right">
                          <p className="text-sm font-bold text-on-surface truncate">{name}</p>
                          <p className="text-[11px] text-on-surface-variant truncate">{pages}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-500 dark:text-amber-400 shrink-0">{visits}</span>
                    </div>
                  ))}
                </div>
              </BrowserFrame>
            </Reveal>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-surface-container/15">
          <Reveal className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-black mb-4">{t.probH}</h2>
            <p className="text-lg text-on-surface-variant max-w-3xl">{t.probP}</p>
          </Reveal>
        </section>

        <section className="py-16 sm:py-20 bg-surface">
          <RevealGroup className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {t.benefits.map((b) => (
              <RevealItem key={b.h} className="rounded-2xl border border-outline-variant/15 p-6 hover:border-amber-500/30 hover:-translate-y-1 transition-all duration-300 bg-surface-container/20">
                <span className="w-11 h-11 rounded-xl bg-amber-500/12 flex items-center justify-center mb-4"><b.icon className="w-5 h-5 text-amber-500 dark:text-amber-400" /></span>
                <h3 className="font-black text-lg mb-2">{b.h}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{b.p}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        <section className="py-16 sm:py-20 bg-surface-container/15">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal><h2 className="text-2xl sm:text-3xl font-black mb-6">{t.stepsH}</h2></Reveal>
            <RevealGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {t.steps.map(([h, p], i) => (
                <RevealItem key={h} className="rounded-xl border border-outline-variant/15 p-5 hover:border-amber-500/30 hover:-translate-y-1 transition-all duration-300 bg-surface">
                  <span className="inline-flex w-7 h-7 rounded-full bg-amber-500/12 text-amber-500 dark:text-amber-400 text-sm font-black items-center justify-center mb-2">{i + 1}</span>
                  <p className="font-bold text-on-surface mb-1">{h}</p>
                  <p className="text-sm text-on-surface-variant">{p}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-surface">
          <Reveal className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <h2 className="text-xl sm:text-2xl font-black mb-2 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-500" />{t.privH}</h2>
            <p className="text-on-surface-variant max-w-3xl">{t.privP}</p>
          </Reveal>
        </section>

        <section className="py-16 sm:py-20 bg-surface-container/15">
          <Reveal className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-black mb-3">{t.cmpH}</h2>
            <p className="text-lg text-on-surface-variant max-w-3xl">{t.cmpP}</p>
          </Reveal>
        </section>

        <section className="py-16 sm:py-20 bg-surface">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal><h2 className="text-2xl sm:text-3xl font-black mb-6">{t.faqH}</h2></Reveal>
            <RevealGroup className="space-y-4">
              {t.faq.map(([q, a]) => (
                <RevealItem key={q} className="rounded-xl border border-outline-variant/15 p-5">
                  <p className="font-bold text-on-surface mb-1">{q}</p>
                  <p className="text-on-surface-variant">{a}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="relative isolate overflow-hidden py-20 sm:py-24 text-center bg-surface-container/15">
          <GradientBlobs variant="compact" />
          <div className="relative max-w-2xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal><h2 className="text-3xl sm:text-5xl font-black mb-6 leading-[1.08]">{t.finalH}</h2></Reveal>
            <Reveal delay={0.1}><CTA label={t.ctaFinal} /></Reveal>
            <Reveal delay={0.18}><p className="text-sm text-on-surface-variant/80 mt-4">{t.finalNote}</p></Reveal>
          </div>
        </section>
      </main>

      <Footer locale={params.locale} />
      <MobileCtaBar />
    </div>
  );
}
