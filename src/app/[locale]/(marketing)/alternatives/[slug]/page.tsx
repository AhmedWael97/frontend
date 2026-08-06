import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X, ArrowRight } from "lucide-react";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { JsonLd } from "@/components/JsonLd";
import { ALTERNATIVES, ALTERNATIVES_UI } from "@/content/alternatives";
import { SITE_URL, breadcrumbJsonLd, localePath } from "@/lib/seo";

function getAlt(slug: string) {
  return ALTERNATIVES.find((a) => a.slug === slug) ?? null;
}

export async function generateMetadata(
  { params }: { params: { locale: string; slug: string } }
): Promise<Metadata> {
  const alt = getAlt(params.slug);
  if (!alt) return { title: "Alternatives" };
  const ar = params.locale === "ar";
  const lang = ar ? "ar" : "en";
  const title = alt.title[lang];
  const description = alt.metaDescription[lang];

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
    alternates: {
      canonical: `${SITE_URL}${localePath(params.locale, `/alternatives/${alt.slug}`)}`,
      languages: {
        en: `${SITE_URL}${localePath("en", `/alternatives/${alt.slug}`)}`,
        ar: `${SITE_URL}${localePath("ar", `/alternatives/${alt.slug}`)}`,
      },
    },
  };
}

export default function AlternativePage({ params }: { params: { locale: string; slug: string } }) {
  const alt = getAlt(params.slug);
  if (!alt) notFound();

  const ar = params.locale === "ar";
  const lang = ar ? "ar" : "en";

  const crumbs = breadcrumbJsonLd([
    { name: ar ? "الرئيسية" : "Home", url: `${SITE_URL}/${params.locale}` },
    { name: ar ? "المقارنات" : "Alternatives", url: `${SITE_URL}/${params.locale}/alternatives` },
    { name: alt.title[lang], url: `${SITE_URL}/${params.locale}/alternatives/${alt.slug}` },
  ]);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <JsonLd data={[crumbs]} />
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-16 sm:py-24" dir={ar ? "rtl" : "ltr"}>
        <nav className="text-sm text-on-surface-variant mb-6">
          <Link href={`/${params.locale}/alternatives`} className="hover:text-primary">
            {ar ? "المقارنات" : "Alternatives"}
          </Link>
          <span className="mx-2">/</span>
          <span>{alt.competitorName}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">{alt.title[lang]}</h1>
        <p className="text-on-surface-variant text-lg mb-10 leading-relaxed">{alt.intro[lang]}</p>

        <div className="rounded-2xl border border-outline-variant/15 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-outline-variant/15 bg-surface-container/50 text-xs uppercase tracking-widest text-on-surface-variant">
                  <th className="px-4 py-3 text-start">{ALTERNATIVES_UI.featureCol[lang]}</th>
                  <th className="px-4 py-3 text-start">EYE</th>
                  <th className="px-4 py-3 text-start">{alt.competitorName}</th>
                </tr>
              </thead>
              <tbody>
                {alt.rows.map((row, i) => (
                  <tr key={i} className="border-b border-outline-variant/10 last:border-0">
                    <td className="px-4 py-3 font-medium text-on-surface">{row.feature[lang]}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 ${row.eyeWins ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-on-surface-variant"}`}>
                        {row.eyeWins && <Check className="w-3.5 h-3.5 shrink-0" />}
                        {row.eye[lang]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      <span className="inline-flex items-center gap-1.5">
                        {!row.eyeWins && row.them[lang] !== row.eye[lang] && <X className="w-3.5 h-3.5 shrink-0 opacity-40" />}
                        {row.them[lang]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl bg-surface-container/40 border border-outline-variant/15 p-6 mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{ALTERNATIVES_UI.verdictLabel[lang]}</p>
          <p className="text-on-surface leading-relaxed">{alt.verdict[lang]}</p>
        </div>

        <Link href={`/${params.locale}/auth/register`}>
          <span className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-6 h-12">
            {ALTERNATIVES_UI.ctaButton[lang]}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </span>
        </Link>
      </main>
      <Footer locale={params.locale} />
    </div>
  );
}
