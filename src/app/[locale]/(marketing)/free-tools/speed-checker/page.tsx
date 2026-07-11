import type { Metadata } from "next";
import { MarketingDoc } from "@/components/marketing/MarketingDoc";
import SpeedCheckerTool from "@/components/marketing/SpeedCheckerTool";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, faqJsonLd } from "@/lib/seo";

type Props = { params: { locale: string } };

const C = {
  en: {
    metaTitle: "Free Website Speed Checker | EYE",
    metaDesc: "Check your website's load time, TTFB, compression, and render-blocking scripts for free. No signup, instant results.",
    title: "Free Website Speed Checker",
    subtitle: "Paste your URL. We'll check load time, server response, compression, and caching — free, no account needed.",
    intro: "Slow pages lose visitors before they ever see your content. Enter your website below for an instant, plain-language speed report.",
    faqH: "Frequently asked questions",
    faq: [
      ["Is this really free?", "Yes — no signup, no card, no limit on how many times you check."],
      ["What does the score mean?", "It's the share of checks that passed: server response time, total load time, page size, compression, caching headers, render-blocking scripts, and lazy-loaded images."],
      ["Do you store the URLs I check?", "No — each check is run live and not saved anywhere."],
    ],
  },
  ar: {
    metaTitle: "أداة فحص سرعة الموقع مجاناً | EYE",
    metaDesc: "افحص وقت تحميل موقعك، والاستجابة، والضغط، والسكربتات المُعيقة — مجاناً وفوراً بدون تسجيل.",
    title: "أداة فحص سرعة الموقع المجانية",
    subtitle: "الصق رابط موقعك. سنفحص وقت التحميل، استجابة السيرفر، الضغط، والتخزين المؤقت — مجاناً وبدون حساب.",
    intro: "الصفحات البطيئة تفقد الزوار قبل أن يروا محتواك. أدخل رابط موقعك أدناه لتقرير سرعة فوري بلغة واضحة.",
    faqH: "الأسئلة الشائعة",
    faq: [
      ["هل هذا مجاني فعلاً؟", "نعم — بدون تسجيل، بدون بطاقة، وبدون حد لعدد مرات الفحص."],
      ["ماذا تعني الدرجة؟", "هي نسبة الفحوصات التي نجحت: وقت استجابة السيرفر، وقت التحميل الكامل، حجم الصفحة، الضغط، ترويسات التخزين المؤقت، السكربتات المُعيقة، والصور المؤجلة التحميل."],
      ["هل تحتفظون بالروابط التي أفحصها؟", "لا — كل فحص يُنفَّذ مباشرة ولا يُحفظ في أي مكان."],
    ],
  },
} as const;

export function generateMetadata({ params }: Props): Metadata {
  const t = C[params.locale === "ar" ? "ar" : "en"];
  const url = `${SITE_URL}/${params.locale}/free-tools/speed-checker`;
  return {
    title: t.metaTitle,
    description: t.metaDesc,
    keywords: ["website speed test", "page speed checker", "free speed test", "TTFB checker", "فحص سرعة الموقع", "اختبار سرعة الصفحة"],
    alternates: {
      canonical: url,
      languages: { en: `${SITE_URL}/en/free-tools/speed-checker`, ar: `${SITE_URL}/ar/free-tools/speed-checker` },
    },
    openGraph: { title: t.metaTitle, description: t.metaDesc, url, type: "website" },
  };
}

export default function SpeedCheckerPage({ params }: Props) {
  const ar = params.locale === "ar";
  const t = C[ar ? "ar" : "en"];

  return (
    <>
      <JsonLd data={faqJsonLd(t.faq.map(([question, answer]) => ({ question, answer })))} />
      <MarketingDoc locale={params.locale} title={t.title} subtitle={t.subtitle}>
        <p>{t.intro}</p>
        <SpeedCheckerTool locale={params.locale} />

        <h2>{t.faqH}</h2>
        {t.faq.map(([q, a]) => (
          <div key={q}>
            <p style={{ fontWeight: 700, marginBottom: 2 }}>{q}</p>
            <p>{a}</p>
          </div>
        ))}
      </MarketingDoc>
    </>
  );
}
