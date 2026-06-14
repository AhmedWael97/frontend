"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Rocket, BarChart3, DollarSign, MousePointerClick, TrendingUp, Bell, LayoutGrid, Plug, Settings,
  Search, BookOpen, MapPin, Lightbulb, ArrowRight,
} from "lucide-react";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HELP, HELP_UI, type Localized, type LocalizedList } from "@/content/help";

const ICONS: Record<string, React.ElementType> = {
  Rocket, BarChart3, DollarSign, MousePointerClick, TrendingUp, Bell, LayoutGrid, Plug, Settings,
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
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-outline-variant/20 bg-surface-container/40 p-8 sm:p-10">
            <Badge className="mb-4 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-300/20">
              <BookOpen className="w-3.5 h-3.5 ltr:mr-2 rtl:ml-2" />
              {L(HELP_UI.heroBadge)}
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-on-surface">{L(HELP_UI.heroTitle)}</h1>
            <p className="mt-4 text-on-surface-variant max-w-3xl text-base sm:text-lg">{L(HELP_UI.heroSubtitle)}</p>

            {/* Search */}
            <div className="mt-6 relative max-w-xl">
              <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={L(HELP_UI.searchPlaceholder)}
                className="w-full ltr:pl-10 rtl:pr-10 pe-3 py-3 rounded-xl border border-outline-variant/40 bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar topics */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">{L(HELP_UI.onThisPage)}</p>
              <nav className="space-y-1">
                {HELP.map((cat) => {
                  const Icon = ICONS[cat.icon] ?? BookOpen;
                  return (
                    <a key={cat.id} href={`#${cat.id}`}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">
                      <Icon className="w-4 h-4 shrink-0 text-indigo-500" />
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
              <p className="text-on-surface-variant text-sm py-10 text-center">{L(HELP_UI.noResults)}</p>
            )}
            {filtered.map((cat) => {
              const Icon = ICONS[cat.icon] ?? BookOpen;
              return (
                <section key={cat.id} id={cat.id} className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-indigo-500" />
                    </span>
                    <h2 className="text-2xl font-black tracking-tight text-on-surface">{L(cat.title)}</h2>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-5 ltr:ml-12 rtl:mr-12">{L(cat.description)}</p>

                  <div className="space-y-4">
                    {cat.articles.map((a) => (
                      <article key={a.id} id={a.id} className="scroll-mt-24 rounded-2xl border border-outline-variant/20 bg-surface-container/30 p-5 sm:p-6">
                        <h3 className="text-lg font-black text-on-surface">{L(a.title)}</h3>
                        <p className="mt-1 text-sm text-on-surface-variant">{L(a.summary)}</p>

                        {a.where && (
                          <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-2.5 py-1 text-xs text-on-surface-variant">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="font-semibold">{L(HELP_UI.whereLabel)}:</span> {L(a.where)}
                          </div>
                        )}

                        <ol className="mt-4 space-y-2.5">
                          {LL(a.steps).map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-on-surface">
                              <span className="w-6 h-6 shrink-0 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                              <span className="text-on-surface-variant">{step}</span>
                            </li>
                          ))}
                        </ol>

                        {a.tips && LL(a.tips).length > 0 && (
                          <div className="mt-4 space-y-2">
                            {LL(a.tips).map((tip, i) => (
                              <div key={i} className="flex items-start gap-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 p-3 text-sm">
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
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container/30 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-on-surface">{L(HELP_UI.ctaTitle)}</h2>
                <p className="text-sm text-on-surface-variant mt-1">{L(HELP_UI.ctaText)}</p>
              </div>
              <Link href={`/${locale}/auth/register`}>
                <Button className="bg-indigo-500 hover:bg-indigo-400 text-white">
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
