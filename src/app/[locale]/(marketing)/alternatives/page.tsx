import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { ALTERNATIVES, ALTERNATIVES_UI } from "@/content/alternatives";
import { SITE_URL } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const ar = params.locale === "ar";
  const title = ALTERNATIVES_UI.heroTitle[ar ? "ar" : "en"];
  const description = ALTERNATIVES_UI.heroSubtitle[ar ? "ar" : "en"];
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${params.locale}/alternatives`,
      languages: { en: `${SITE_URL}/en/alternatives`, ar: `${SITE_URL}/ar/alternatives` },
    },
  };
}

export default function AlternativesPage({ params }: { params: { locale: string } }) {
  const ar = params.locale === "ar";
  const lang = ar ? "ar" : "en";

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-16 sm:py-24" dir={ar ? "rtl" : "ltr"}>
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">
          {ALTERNATIVES_UI.heroBadge[lang]}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">{ALTERNATIVES_UI.heroTitle[lang]}</h1>
        <p className="text-on-surface-variant text-lg mb-10 max-w-2xl">{ALTERNATIVES_UI.heroSubtitle[lang]}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {ALTERNATIVES.map((alt) => (
            <Link
              key={alt.slug}
              href={`/${params.locale}/alternatives/${alt.slug}`}
              className="group rounded-2xl border border-outline-variant/15 p-6 hover:border-primary/30 transition-colors flex flex-col"
            >
              <h2 className="font-black text-lg text-on-surface group-hover:text-primary transition-colors">
                {ar ? `EYE مقابل ${alt.competitorName}` : `EYE vs. ${alt.competitorName}`}
              </h2>
              <p className="text-sm text-on-surface-variant mt-2 line-clamp-2 flex-1">{alt.intro[lang]}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary mt-4">
                {ar ? "قارن الآن" : "Compare now"}
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </span>
            </Link>
          ))}
        </div>
      </main>
      <Footer locale={params.locale} />
    </div>
  );
}
