import type { Metadata } from "next";
import { MarketingDoc } from "@/components/marketing/MarketingDoc";
import SitemapCreatorTool from "@/components/marketing/SitemapCreatorTool";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, faqJsonLd } from "@/lib/seo";

type Props = { params: { locale: string } };

const C = {
  en: {
    metaTitle: "Free Sitemap Generator | EYE",
    metaDesc: "Generate a ready-to-use sitemap.xml for your website for free. No signup, instant results, up to 15 pages.",
    title: "Free Sitemap Generator",
    subtitle: "Paste your URL. We'll crawl your site and generate a sitemap.xml — free, no account needed.",
    intro: "A missing sitemap makes it harder for Google to find your pages. Enter your website below to generate one instantly.",
    faqH: "Frequently asked questions",
    faq: [
      ["Is this really free?", "Yes — no signup, no card, no limit on how many times you run it."],
      ["How many pages does it crawl?", "Up to 15 pages for the free tool. Need more? EYE's built-in sitemap tool (free account) supports up to 200 pages with traffic-based priority."],
      ["Do you store the URLs I check?", "No — each crawl is run live and not saved anywhere."],
    ],
  },
  ar: {
    metaTitle: "أداة إنشاء خريطة الموقع مجاناً | EYE",
    metaDesc: "أنشئ ملف sitemap.xml جاهزاً لموقعك مجاناً. بدون تسجيل، نتائج فورية، حتى 15 صفحة.",
    title: "أداة إنشاء خريطة الموقع المجانية",
    subtitle: "الصق رابط موقعك. سنزحف لموقعك وننشئ ملف sitemap.xml — مجاناً وبدون حساب.",
    intro: "خريطة موقع مفقودة تجعل من الصعب على جوجل إيجاد صفحاتك. أدخل موقعك أدناه لإنشاء واحدة فوراً.",
    faqH: "الأسئلة الشائعة",
    faq: [
      ["هل هذا مجاني فعلاً؟", "نعم — بدون تسجيل، بدون بطاقة، وبدون حد لعدد مرات الاستخدام."],
      ["كم صفحة تزحف إليها؟", "حتى 15 صفحة في الأداة المجانية. تحتاج أكثر؟ أداة خريطة الموقع في EYE (حساب مجاني) تدعم حتى 200 صفحة مع أولوية مبنية على الزيارات."],
      ["هل تحتفظون بالروابط التي أفحصها؟", "لا — كل زحف يُنفَّذ مباشرة ولا يُحفظ في أي مكان."],
    ],
  },
} as const;

export function generateMetadata({ params }: Props): Metadata {
  const t = C[params.locale === "ar" ? "ar" : "en"];
  const url = `${SITE_URL}/${params.locale}/free-tools/sitemap-creator`;
  return {
    title: t.metaTitle,
    description: t.metaDesc,
    keywords: ["free sitemap generator", "sitemap.xml creator", "xml sitemap tool", "منشئ خريطة الموقع", "sitemap مجاني"],
    alternates: {
      canonical: url,
      languages: { en: `${SITE_URL}/en/free-tools/sitemap-creator`, ar: `${SITE_URL}/ar/free-tools/sitemap-creator` },
    },
    openGraph: { title: t.metaTitle, description: t.metaDesc, url, type: "website" },
  };
}

export default function SitemapCreatorPage({ params }: Props) {
  const ar = params.locale === "ar";
  const t = C[ar ? "ar" : "en"];

  return (
    <>
      <JsonLd data={faqJsonLd(t.faq.map(([question, answer]) => ({ question, answer })))} />
      <MarketingDoc locale={params.locale} title={t.title} subtitle={t.subtitle}>
        <p>{t.intro}</p>
        <SitemapCreatorTool locale={params.locale} />

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
