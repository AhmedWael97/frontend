import type { Metadata } from "next";
import { MarketingDoc } from "@/components/marketing/MarketingDoc";
import SeoCheckerTool from "@/components/marketing/SeoCheckerTool";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, faqJsonLd } from "@/lib/seo";

type Props = { params: { locale: string } };

const C = {
  en: {
    metaTitle: "Free SEO Checker | EYE",
    metaDesc: "Check any page's title, meta description, headings, images, and Open Graph tags for free. No signup, instant results.",
    title: "Free SEO Checker",
    subtitle: "Paste a URL. We'll check titles, meta tags, headings, images, and more — free, no account needed.",
    intro: "One overlooked tag can cost you rankings. Enter a page below for an instant, plain-language SEO report.",
    faqH: "Frequently asked questions",
    faq: [
      ["Is this really free?", "Yes — no signup, no card, no limit on how many times you check."],
      ["What does it check?", "Title, meta description, headings, image alt text, canonical tag, Open Graph, Twitter card, Schema.org, robots meta, viewport, HTTPS, and more."],
      ["Do you store the URLs I check?", "No — each check is run live and not saved anywhere."],
    ],
  },
  ar: {
    metaTitle: "أداة فحص السيو مجاناً | EYE",
    metaDesc: "افحص عنوان الصفحة، الوصف، العناوين، الصور، وعلامات Open Graph مجاناً وفوراً بدون تسجيل.",
    title: "أداة فحص السيو المجانية",
    subtitle: "الصق رابط صفحة. سنفحص العنوان، الوصف، العناوين، الصور، والمزيد — مجاناً وبدون حساب.",
    intro: "علامة واحدة مهملة قد تكلفك ترتيبك في البحث. أدخل رابط صفحة أدناه لتقرير سيو فوري بلغة واضحة.",
    faqH: "الأسئلة الشائعة",
    faq: [
      ["هل هذا مجاني فعلاً؟", "نعم — بدون تسجيل، بدون بطاقة، وبدون حد لعدد مرات الفحص."],
      ["ماذا تفحص الأداة؟", "العنوان، الوصف، العناوين، نص alt للصور، الرابط الأساسي، Open Graph، Twitter card، Schema.org، وسم robots، viewport، HTTPS، والمزيد."],
      ["هل تحتفظون بالروابط التي أفحصها؟", "لا — كل فحص يُنفَّذ مباشرة ولا يُحفظ في أي مكان."],
    ],
  },
} as const;

export function generateMetadata({ params }: Props): Metadata {
  const t = C[params.locale === "ar" ? "ar" : "en"];
  const url = `${SITE_URL}/${params.locale}/free-tools/seo-checker`;
  return {
    title: t.metaTitle,
    description: t.metaDesc,
    keywords: ["free seo checker", "seo audit tool", "meta tag checker", "on-page seo test", "فحص سيو مجاني", "اختبار السيو"],
    alternates: {
      canonical: url,
      languages: { en: `${SITE_URL}/en/free-tools/seo-checker`, ar: `${SITE_URL}/ar/free-tools/seo-checker` },
    },
    openGraph: { title: t.metaTitle, description: t.metaDesc, url, type: "website" },
  };
}

export default function SeoCheckerPage({ params }: Props) {
  const ar = params.locale === "ar";
  const t = C[ar ? "ar" : "en"];

  return (
    <>
      <JsonLd data={faqJsonLd(t.faq.map(([question, answer]) => ({ question, answer })))} />
      <MarketingDoc locale={params.locale} title={t.title} subtitle={t.subtitle}>
        <p>{t.intro}</p>
        <SeoCheckerTool locale={params.locale} />

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
