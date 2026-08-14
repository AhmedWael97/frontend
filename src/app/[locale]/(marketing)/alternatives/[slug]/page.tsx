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

  const mono = { fontFamily: "var(--font-mono-marketing)" };
  return (
    <div className="min-h-screen bg-black">
      <JsonLd data={[crumbs]} />
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-16 sm:py-20" dir={ar ? "rtl" : "ltr"}>
        <nav className="text-sm text-neutral-500 mb-6">
          <Link href={`/${params.locale}/alternatives`} className="hover:text-[#00E5FF]">
            {ar ? "المقارنات" : "Alternatives"}
          </Link>
          <span className="mx-2">/</span>
          <span>{alt.competitorName}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">{alt.title[lang]}</h1>
        <p className="text-neutral-400 text-lg mb-10 leading-relaxed">{alt.intro[lang]}</p>

        <div className="border border-[#262626] overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-[#262626] bg-[#171717] text-xs uppercase tracking-widest text-neutral-500" style={mono}>
                  <th className="px-4 py-3 text-start">{ALTERNATIVES_UI.featureCol[lang]}</th>
                  <th className="px-4 py-3 text-start">EYE</th>
                  <th className="px-4 py-3 text-start">{alt.competitorName}</th>
                </tr>
              </thead>
              <tbody>
                {alt.rows.map((row, i) => (
                  <tr key={i} className="border-b border-[#262626] last:border-0">
                    <td className="px-4 py-3 font-medium text-white">{row.feature[lang]}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 ${row.eyeWins ? "text-green-400 font-semibold" : "text-neutral-400"}`}>
                        {row.eyeWins && <Check className="w-3.5 h-3.5 shrink-0" />}
                        {row.eye[lang]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-400">
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

        <div className="bg-[#0A0A0A] border border-[#262626] p-6 mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#00E5FF] mb-2" style={mono}>{ALTERNATIVES_UI.verdictLabel[lang]}</p>
          <p className="text-white leading-relaxed">{alt.verdict[lang]}</p>
        </div>

        <Link href={`/${params.locale}/auth/register`}>
          <span className="inline-flex items-center gap-2 rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black font-semibold px-6 h-12">
            {ALTERNATIVES_UI.ctaButton[lang]}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </span>
        </Link>
      </main>
      <Footer locale={params.locale} />
    </div>
  );
}
