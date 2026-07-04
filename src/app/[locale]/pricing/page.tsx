"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import client from "@/api/client";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Check, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/lib/useCurrency";
import { trackViewPlans } from "@/lib/track";

import { useTranslations } from "next-intl";

const PLANS = [
  {
    name: "free",
    slug: "free",
    price_monthly: 0,
    price_yearly: 0,
    description: "pricing.freeDesc",
    popular: false,
    features: {
      domains: "pricing.domains1",
      events_per_day: "pricing.events10k",
      retention: "pricing.retention30",
      ai_analysis: "pricing.aiDaily",
      pipelines: true,
      ux_intelligence: true,
      b2b_enrichment: false,
      session_replay: false,
      api_access: false,
      priority_support: false,
    },
  },
  {
    name: "pro",
    slug: "pro",
    price_monthly: 5,
    price_yearly: 50,
    description: "pricing.proDesc",
    popular: true,
    features: {
      domains: "pricing.domains5",
      events_per_day: "pricing.events100k",
      retention: "pricing.retention90",
      ai_analysis: "pricing.ai6h",
      pipelines: true,
      ux_intelligence: true,
      b2b_enrichment: true,
      session_replay: false,
      api_access: true,
      priority_support: false,
    },
  },
  {
    name: "business",
    slug: "business",
    price_monthly: 99,
    price_yearly: 990,
    description: "pricing.businessDesc",
    popular: false,
    features: {
      domains: "pricing.domainsUnlimited",
      events_per_day: "pricing.events1m",
      retention: "pricing.retention365",
      ai_analysis: "pricing.aiHourly",
      pipelines: true,
      ux_intelligence: true,
      b2b_enrichment: true,
      session_replay: true,
      api_access: true,
      priority_support: true,
    },
  },
];

const COMPARISON_ROWS = [
  { label: "pricing.featureDomains", key: "domains", type: "text" },
  { label: "pricing.featureEvents", key: "events_per_day", type: "text" },
  { label: "pricing.featureRetention", key: "retention", type: "text" },
  { label: "pricing.featureAi", key: "ai_analysis", type: "text" },
  { label: "pricing.featurePipelines", key: "pipelines", type: "bool" },
  { label: "pricing.featureUx", key: "ux_intelligence", type: "bool" },
  { label: "pricing.featureB2b", key: "b2b_enrichment", type: "bool" },
  { label: "pricing.featureReplay", key: "session_replay", type: "bool" },
  { label: "pricing.featureApi", key: "api_access", type: "bool" },
  { label: "pricing.featureSupport", key: "priority_support", type: "bool" },
];

export default function PricingPage() {
  const locale = useLocale();
  const t = useTranslations();
  const { format: fmtPrice } = useCurrency();

  useEffect(() => { trackViewPlans(); }, []); // TikTok ViewContent

  // Live plan prices from DB (public endpoint) — keeps pricing in sync with admin.
  const { data: dbPlans } = useQuery({
    queryKey: ["public-plans"],
    queryFn: () => client.get("/plans").then((r) => r.data as Array<{ slug: string; price_monthly: number; price_yearly: number }>),
  });
  const priceOf = (plan: (typeof PLANS)[number]) => {
    const m = dbPlans?.find((p) => p.slug === plan.slug);
    return {
      monthly: m ? m.price_monthly : plan.price_monthly,
      yearly: m ? m.price_yearly : plan.price_yearly,
    };
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Navbar */}
      <nav className="border-b border-outline-variant/10 bg-surface/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter text-primary uppercase">EYE</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href={`/${locale}/auth/login`}>
              <Button variant="ghost" size="sm">{t("pricing.signIn")}</Button>
            </Link>
            <Link href={`/${locale}/auth/register`}>
              <Button size="sm">{t("pricing.getStarted")}</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-xs font-bold tracking-widest uppercase">{t("pricing.title")}</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            {t("pricing.headline")}
          </h1>
          <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
            {t("pricing.subhead")}
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {PLANS.map((plan) => (
            <div
              key={plan.slug}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.popular
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-outline-variant/20 bg-surface-container"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-primary text-on-primary">
                    {t("pricing.mostPopular")}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-black text-on-surface mb-1">{t(`pricing.${plan.name}`)}</h2>
                <p className="text-sm text-on-surface-variant">{t(plan.description)}</p>
              </div>

              <div className="mb-8">
                {priceOf(plan).monthly === 0 ? (
                  <div className="text-4xl font-black text-on-surface">{t("pricing.free")}</div>
                ) : (
                  <div>
                    <span className="text-4xl font-black text-on-surface">{fmtPrice(priceOf(plan).monthly)}</span>
                    <span className="text-on-surface-variant text-sm"> {t("pricing.perMonth")}</span>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {fmtPrice(priceOf(plan).yearly)}/{t("pricing.perYear")} — {t("pricing.save2mo")}
                    </p>
                  </div>
                )}
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                <li className="flex items-start gap-2.5 text-sm text-on-surface">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  {t(plan.features.domains)}
                </li>
                <li className="flex items-start gap-2.5 text-sm text-on-surface">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  {t(plan.features.events_per_day)}
                </li>
                <li className="flex items-start gap-2.5 text-sm text-on-surface">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  {t(plan.features.retention)}
                </li>
                <li className="flex items-start gap-2.5 text-sm text-on-surface">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  {t(plan.features.ai_analysis)}
                </li>
                {plan.features.b2b_enrichment && (
                  <li className="flex items-start gap-2.5 text-sm text-on-surface">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    {t("pricing.featureB2b")}
                  </li>
                )}
                {plan.features.session_replay && (
                  <li className="flex items-start gap-2.5 text-sm text-on-surface">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    {t("pricing.featureReplay")}
                  </li>
                )}
                {plan.features.api_access && (
                  <li className="flex items-start gap-2.5 text-sm text-on-surface">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    {t("pricing.featureApi")}
                  </li>
                )}
                {plan.features.priority_support && (
                  <li className="flex items-start gap-2.5 text-sm text-on-surface">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    {t("pricing.featureSupport")}
                  </li>
                )}
              </ul>

              <Link href={`/${locale}/auth/register`}>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {priceOf(plan).monthly === 0 ? t("pricing.getStarted") : t("pricing.startPlan", { plan: t(`pricing.${plan.name}`) })}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Full comparison table */}
        <div className="mb-20">
          <h2 className="text-2xl font-black tracking-tight text-center mb-8">{t("pricing.fullComparison")}</h2>
          <div className="overflow-x-auto rounded-2xl border border-outline-variant/20">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container">
                  <th className="text-left px-6 py-4 font-bold text-on-surface-variant w-1/2">{t("pricing.feature")}</th>
                  {PLANS.map((p) => (
                    <th key={p.slug} className={`text-center px-6 py-4 font-black ${p.popular ? "text-primary" : "text-on-surface"}`}>
                      {t(`pricing.${p.name}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.key} className={`border-b border-outline-variant/10 ${i % 2 === 0 ? "bg-surface" : "bg-surface-container/40"}`}>
                    <td className="px-6 py-3.5 text-on-surface-variant font-medium">{t(row.label)}</td>
                    {PLANS.map((p) => {
                      const val = p.features[row.key as keyof typeof p.features];
                      return (
                        <td key={p.slug} className="text-center px-6 py-3.5">
                          {row.type === "bool" ? (
                            val ? (
                              <Check className="w-4 h-4 text-green-400 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-on-surface-variant/30 mx-auto" />
                            )
                          ) : (
                            <span className={`text-xs font-semibold ${p.popular ? "text-primary" : "text-on-surface"}`}>
                              {t(String(val))}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-20">
          <h2 className="text-2xl font-black tracking-tight text-center mb-8">{t("pricing.faqTitle")}</h2>
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-outline-variant/20 bg-surface-container p-5">
                <p className="font-bold text-on-surface mb-1.5">{t(`pricing.faq${i}q`)}</p>
                <p className="text-sm text-on-surface-variant">{t(`pricing.faq${i}a`)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center rounded-2xl border border-primary/20 bg-primary/5 p-12">
          <h2 className="text-3xl font-black tracking-tight mb-3">{t("pricing.ctaTitle")}</h2>
          <p className="text-on-surface-variant mb-6">{t("pricing.ctaDesc")}</p>
          <Link href={`/${locale}/auth/register`}>
            <Button size="lg" className="px-10">
              {t("pricing.ctaButton")}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
