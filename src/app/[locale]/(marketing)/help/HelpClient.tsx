"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Rocket, BarChart3, DollarSign, MousePointerClick, TrendingUp, Bell, LayoutGrid, Plug, Settings,
  Search, BookOpen, MapPin, Lightbulb, ArrowRight, Users,
} from "lucide-react";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HELP, HELP_UI, type Localized, type LocalizedList } from "@/content/help";

const mono = { fontFamily: "var(--font-mono-marketing)" };

const ICONS: Record<string, React.ElementType> = {
  Rocket, BarChart3, DollarSign, MousePointerClick, TrendingUp, Bell, LayoutGrid, Plug, Settings, Users,
};

export default function HelpClient({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const L = (o: Localized) => (isAr ? o.ar : o.en);
  const LL = (o: LocalizedList) => (isAr ? o.ar : o.en);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return HELP;
    return HELP
      .map((cat) => {
        const articles = cat.articles.filter((a) => {
          const hay = [L(a.title), L(a.summary), ...LL(a.steps), a.where ? L(a.where) : ""]
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        });
        return { ...cat, articles };
      })
      .filter((cat) => cat.articles.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, isAr]);

  return (
    <>
      <Navbar />
      <main className="pt-16 pb-20 bg-black">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="border border-[#262626] bg-[#0A0A0A] p-8 sm:p-10">
            <Badge className="mb-4 rounded-none bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/25" style={mono}>
              <BookOpen className="w-3.5 h-3.5 ltr:mr-2 rtl:ml-2" />
              {L(HELP_UI.heroBadge)}
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">{L(HELP_UI.heroTitle)}</h1>
            <p className="mt-4 text-neutral-400 max-w-3xl text-base sm:text-lg">{L(HELP_UI.heroSubtitle)}</p>

            {/* Search */}
            <div className="mt-6 relative max-w-xl">
              <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={L(HELP_UI.searchPlaceholder)}
                className="w-full ltr:pl-10 rtl:pr-10 pe-3 py-3 rounded-none border border-[#262626] bg-black text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/40 focus:border-[#00E5FF]/50"
              />
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar topics */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3" style={mono}>{L(HELP_UI.onThisPage)}</p>
              <nav className="space-y-1">
                {HELP.map((cat) => {
                  const Icon = ICONS[cat.icon] ?? BookOpen;
                  return (
                    <a key={cat.id} href={`#${cat.id}`}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-neutral-400 hover:text-white hover:bg-[#171717] transition-colors">
                      <Icon className="w-4 h-4 shrink-0 text-[#00E5FF]" />
                      {L(cat.title)}
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Articles */}
          <div className="lg:col-span-3 space-y-12">
            {filtered.length === 0 && (
              <p className="text-neutral-500 text-sm py-10 text-center">{L(HELP_UI.noResults)}</p>
            )}
            {filtered.map((cat) => {
              const Icon = ICONS[cat.icon] ?? BookOpen;
              return (
                <section key={cat.id} id={cat.id} className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="w-9 h-9 rounded-none border border-[#262626] bg-[#0A0A0A] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#00E5FF]" />
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight text-white">{L(cat.title)}</h2>
                  </div>
                  <p className="text-sm text-neutral-500 mb-5 ltr:ml-12 rtl:mr-12">{L(cat.description)}</p>

                  <div className="space-y-4">
                    {cat.articles.map((a) => (
                      <article key={a.id} id={a.id} className="scroll-mt-24 border border-[#262626] bg-[#0A0A0A] p-5 sm:p-6">
                        <h3 className="text-lg font-bold text-white">{L(a.title)}</h3>
                        <p className="mt-1 text-sm text-neutral-400">{L(a.summary)}</p>

                        {a.where && (
                          <div className="mt-3 inline-flex items-center gap-1.5 border border-[#262626] bg-black px-2.5 py-1 text-xs text-neutral-400">
                            <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" />
                            <span className="font-semibold text-neutral-300">{L(HELP_UI.whereLabel)}:</span> {L(a.where)}
                          </div>
                        )}

                        <ol className="mt-4 space-y-2.5">
                          {LL(a.steps).map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-white">
                              <span className="w-6 h-6 shrink-0 border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF] text-xs font-bold flex items-center justify-center mt-0.5" style={mono}>{i + 1}</span>
                              <span className="text-neutral-400">{step}</span>
                            </li>
                          ))}
                        </ol>

                        {a.tips && LL(a.tips).length > 0 && (
                          <div className="mt-4 space-y-2">
                            {LL(a.tips).map((tip, i) => (
                              <div key={i} className="flex items-start gap-2 border border-amber-500/25 bg-amber-500/10 text-amber-300 p-3 text-sm">
                                <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" />
                                <span><span className="font-semibold">{L(HELP_UI.tipLabel)}:</span> {tip}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* CTA */}
            <div className="border border-[#262626] bg-[#0A0A0A] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{L(HELP_UI.ctaTitle)}</h2>
                <p className="text-sm text-neutral-400 mt-1">{L(HELP_UI.ctaText)}</p>
              </div>
              <Link href={`/${locale}/auth/register`}>
                <Button className="rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none">
                  {L(HELP_UI.ctaButton)}
                  <ArrowRight className="w-4 h-4 ltr:ml-2 rtl:mr-2 rtl:rotate-180" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}
