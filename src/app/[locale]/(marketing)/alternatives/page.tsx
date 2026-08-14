import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { ALTERNATIVES, ALTERNATIVES_UI } from "@/content/alternatives";
import { SITE_URL, localePath } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const ar = params.locale === "ar";
  const title = ALTERNATIVES_UI.heroTitle[ar ? "ar" : "en"];
  const description = ALTERNATIVES_UI.heroSubtitle[ar ? "ar" : "en"];
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}${localePath(params.locale, "/alternatives")}`,
      languages: { en: `${SITE_URL}${localePath("en", "/alternatives")}`, ar: `${SITE_URL}${localePath("ar", "/alternatives")}` },
    },
  };
}

export default function AlternativesPage({ params }: { params: { locale: string } }) {
  const ar = params.locale === "ar";
  const lang = ar ? "ar" : "en";

  const mono = { fontFamily: "var(--font-mono-marketing)" };
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-16 sm:py-20" dir={ar ? "rtl" : "ltr"}>
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#00E5FF] mb-3" style={mono}>
          {ALTERNATIVES_UI.heroBadge[lang]}
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">{ALTERNATIVES_UI.heroTitle[lang]}</h1>
        <p className="text-neutral-400 text-lg mb-10 max-w-2xl">{ALTERNATIVES_UI.heroSubtitle[lang]}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#262626] border border-[#262626]">
          {ALTERNATIVES.map((alt) => (
            <Link
              key={alt.slug}
              href={`/${params.locale}/alternatives/${alt.slug}`}
              className="group bg-black hover:bg-[#0A0A0A] transition-colors p-6 flex flex-col"
            >
              <h2 className="font-bold text-lg text-white group-hover:text-[#00E5FF] transition-colors">
                {ar ? `EYE مقابل ${alt.competitorName}` : `EYE vs. ${alt.competitorName}`}
              </h2>
              <p className="text-sm text-neutral-400 mt-2 line-clamp-2 flex-1">{alt.intro[lang]}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00E5FF] mt-4">
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
