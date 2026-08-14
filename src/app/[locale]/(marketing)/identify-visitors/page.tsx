import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Target, Filter, ShieldCheck } from "lucide-react";
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
  const url = `${SITE_URL}${localePath(params.locale, "/identify-visitors")}`;
  return {
    title: t.metaTitle, description: t.metaDesc,
    keywords: ["identify website visitors", "Leadfeeder alternative", "B2B visitor identification", "which companies visit my website", "website visitor tracking B2B", "تحديد زوار الموقع", "بديل Leadfeeder"],
    alternates: { canonical: url, languages: { en: `${SITE_URL}${localePath("en", "/identify-visitors")}`, ar: `${SITE_URL}${localePath("ar", "/identify-visitors")}` } },
    openGraph: { title: t.metaTitle, description: t.metaDesc, url, type: "website", images: [`${SITE_URL}${localePath(params.locale, "/opengraph-image")}`] },
  };
}

export default function IdentifyVisitorsLanding({ params }: Props) {
  const ar = params.locale === "ar";
  const t = C[ar ? "ar" : "en"];
  const reg = `/${params.locale}/auth/register`;
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: t.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  const mono = { fontFamily: "var(--font-mono-marketing)" };
  const CTA = ({ label }: { label: string }) => (
    <Link href={reg} className="inline-flex items-center justify-center rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none px-7 py-3.5 text-base font-bold transition-colors">{label}</Link>
  );
  const Badge = ({ label }: { label: string }) => (
    <span className="inline-flex items-center gap-1.5 rounded-none border border-green-500/30 bg-green-500/10 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-green-400 mb-6" style={mono}>
      <ShieldCheck className="w-3.5 h-3.5" /> {label}
    </span>
  );

  return (
    <div dir={t.dir} className="min-h-screen bg-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Navbar />

      <main className="overflow-hidden">
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

            <div className="mt-14 sm:mt-16 max-w-2xl mx-auto">
              <BrowserFrame url="dashboard.eye-analysis.online/leads">
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3" style={mono}>{t.previewH}</p>
                <div className="border border-[#262626] overflow-hidden">
                  {t.previewRows.map(([name, pages, visits], i) => (
                    <div key={name} className={`flex items-center justify-between gap-3 px-4 py-3 ${i !== t.previewRows.length - 1 ? "border-b border-[#262626]" : ""}`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-none bg-[#171717] border border-[#262626] flex items-center justify-center shrink-0"><Building2 className="w-4 h-4 text-[#00E5FF]" /></span>
                        <div className="min-w-0 text-left rtl:text-right">
                          <p className="text-sm font-bold text-white truncate">{name}</p>
                          <p className="text-[11px] text-neutral-500 truncate">{pages}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#00E5FF] shrink-0" style={mono}>{visits}</span>
                    </div>
                  ))}
                </div>
              </BrowserFrame>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-[#0A0A0A] border-y border-[#262626]">
          <Reveal className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">{t.probH}</h2>
            <p className="text-lg text-neutral-400 max-w-3xl">{t.probP}</p>
          </Reveal>
        </section>

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

        <section className="py-16 sm:py-20 bg-[#0A0A0A] border-y border-[#262626]">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal><h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white">{t.stepsH}</h2></Reveal>
            <RevealGroup className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#262626] border border-[#262626]">
              {t.steps.map(([h, p], i) => (
                <RevealItem key={h} className="bg-black p-5 hover:bg-[#171717] transition-colors">
                  <span className="inline-flex w-7 h-7 border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF] text-sm font-bold items-center justify-center mb-2" style={mono}>{i + 1}</span>
                  <p className="font-bold text-white mb-1">{h}</p>
                  <p className="text-sm text-neutral-400">{p}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-black">
          <Reveal className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 border border-green-500/25 bg-green-500/5 p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2 text-white"><ShieldCheck className="w-5 h-5 text-green-400" />{t.privH}</h2>
            <p className="text-neutral-400 max-w-3xl">{t.privP}</p>
          </Reveal>
        </section>

        <section className="py-16 sm:py-20 bg-[#0A0A0A] border-y border-[#262626]">
          <Reveal className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">{t.cmpH}</h2>
            <p className="text-lg text-neutral-400 max-w-3xl">{t.cmpP}</p>
          </Reveal>
        </section>

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
