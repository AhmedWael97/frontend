import type { Metadata } from "next";
import Link from "next/link";
import { Gauge, ScanSearch, Layers, ArrowRight } from "lucide-react";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { SITE_URL } from "@/lib/seo";

type Props = { params: { locale: string } };

const C = {
  en: {
    metaTitle: "Free Website Tools | EYE",
    metaDesc: "Free, no-signup tools to check your website's speed and SEO — instant results.",
    title: "Free tools for your website",
    subtitle: "No signup, no card, no limit. Check any site in seconds.",
    tools: [
      { href: "/free-tools/speed-checker", icon: Gauge, name: "Speed Checker", desc: "Load time, TTFB, compression, render-blocking scripts." },
      { href: "/free-tools/seo-checker", icon: ScanSearch, name: "SEO Checker", desc: "Title, meta tags, headings, images, Open Graph, and more." },
      { href: "/free-tools/sitemap-creator", icon: Layers, name: "Sitemap Creator", desc: "Crawl your site and generate a ready-to-use sitemap.xml." },
    ],
    cta: "Try it",
  },
  ar: {
    metaTitle: "أدوات مجانية للموقع | EYE",
    metaDesc: "أدوات مجانية بدون تسجيل لفحص سرعة موقعك وسيو — نتائج فورية.",
    title: "أدوات مجانية لموقعك",
    subtitle: "بدون تسجيل، بدون بطاقة، بدون حد. افحص أي موقع خلال ثوانٍ.",
    tools: [
      { href: "/free-tools/speed-checker", icon: Gauge, name: "فحص السرعة", desc: "وقت التحميل، الاستجابة، الضغط، السكربتات المُعيقة." },
      { href: "/free-tools/seo-checker", icon: ScanSearch, name: "فحص السيو", desc: "العنوان، العلامات الوصفية، العناوين، الصور، Open Graph، والمزيد." },
      { href: "/free-tools/sitemap-creator", icon: Layers, name: "منشئ خريطة الموقع", desc: "زحف لموقعك وإنشاء ملف sitemap.xml جاهز." },
    ],
    cta: "جرّبها",
  },
} as const;

export function generateMetadata({ params }: Props): Metadata {
  const t = C[params.locale === "ar" ? "ar" : "en"];
  const url = `${SITE_URL}/${params.locale}/free-tools`;
  return {
    title: t.metaTitle,
    description: t.metaDesc,
    alternates: {
      canonical: url,
      languages: { en: `${SITE_URL}/en/free-tools`, ar: `${SITE_URL}/ar/free-tools` },
    },
    openGraph: { title: t.metaTitle, description: t.metaDesc, url, type: "website", images: [`${SITE_URL}/${params.locale}/opengraph-image`] },
  };
}

export default function FreeToolsPage({ params }: Props) {
  const ar = params.locale === "ar";
  const t = C[ar ? "ar" : "en"];

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-on-surface text-center">{t.title}</h1>
        <p className="mt-3 text-center text-on-surface-variant">{t.subtitle}</p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {t.tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={`/${params.locale}${tool.href}`}
                className="group rounded-2xl border border-outline-variant/20 bg-surface/60 p-6 transition hover:border-primary/40 hover:shadow-lg"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-lg font-bold text-on-surface">{tool.name}</h2>
                <p className="mt-1 text-sm text-on-surface-variant">{tool.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary">
                  {t.cta} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer locale={params.locale} />
    </>
  );
}
