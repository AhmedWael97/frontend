"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import client from "@/api/client";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/lib/useCurrency";
import { trackViewPlans } from "@/lib/track";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import MobileCtaBar from "@/components/marketing/MobileCtaBar";

import { useTranslations } from "next-intl";

const mono = { fontFamily: "var(--font-mono-marketing)" };

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
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        {/* Hero */}
        <div className="text-center mb-14 sm:mb-16">
          <Badge className="mb-4 rounded-none bg-[#171717] text-neutral-400 border-[#262626] px-4 py-1.5 text-xs font-semibold tracking-widest uppercase" style={mono}>
            {t("pricing.title")}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            {t("pricing.headline")}
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            {t("pricing.subhead")}
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#262626] border border-[#262626] mb-16 sm:mb-20">
          {PLANS.map((plan) => (
            <div
              key={plan.slug}
              className={`relative p-8 flex flex-col ${plan.popular ? "bg-[#0A0A0A]" : "bg-black"}`}
            >
              {plan.popular && (
                <span className="absolute top-0 left-0 px-3 py-1 text-[10px] font-semibold tracking-wider uppercase bg-[#00E5FF] text-black" style={mono}>
                  {t("pricing.mostPopular")}
                </span>
              )}

              <div className={plan.popular ? "mb-6 mt-4" : "mb-6"}>
                <h2 className="text-xl font-bold text-white mb-1">{t(`pricing.${plan.name}`)}</h2>
                <p className="text-sm text-neutral-500">{t(plan.description)}</p>
              </div>

              <div className="mb-8">
                {priceOf(plan).monthly === 0 ? (
                  <div className="text-4xl font-bold text-white" style={mono}>{t("pricing.free")}</div>
                ) : (
                  <div>
                    <span className="text-4xl font-bold text-white" style={mono}>{fmtPrice(priceOf(plan).monthly)}</span>
                    <span className="text-neutral-500 text-sm"> {t("pricing.perMonth")}</span>
                    <p className="text-xs text-neutral-500 mt-1">
                      {fmtPrice(priceOf(plan).yearly)}/{t("pricing.perYear")} — {t("pricing.save2mo")}
                    </p>
                  </div>
                )}
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                <li className="flex items-start gap-2.5 text-sm text-neutral-300">
                  <Check className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
                  {t(plan.features.domains)}
                </li>
                <li className="flex items-start gap-2.5 text-sm text-neutral-300">
                  <Check className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
                  {t(plan.features.events_per_day)}
                </li>
                <li className="flex items-start gap-2.5 text-sm text-neutral-300">
                  <Check className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
                  {t(plan.features.retention)}
                </li>
                <li className="flex items-start gap-2.5 text-sm text-neutral-300">
                  <Check className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
                  {t(plan.features.ai_analysis)}
                </li>
                {plan.features.b2b_enrichment && (
                  <li className="flex items-start gap-2.5 text-sm text-neutral-300">
                    <Check className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
                    {t("pricing.featureB2b")}
                  </li>
                )}
                {plan.features.session_replay && (
                  <li className="flex items-start gap-2.5 text-sm text-neutral-300">
                    <Check className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
                    {t("pricing.featureReplay")}
                  </li>
                )}
                {plan.features.api_access && (
                  <li className="flex items-start gap-2.5 text-sm text-neutral-300">
                    <Check className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
                    {t("pricing.featureApi")}
                  </li>
                )}
                {plan.features.priority_support && (
                  <li className="flex items-start gap-2.5 text-sm text-neutral-300">
                    <Check className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
                    {t("pricing.featureSupport")}
                  </li>
                )}
              </ul>

              <Link href={`/${locale}/auth/register`}>
                <Button
                  className={plan.popular ? "w-full rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none" : "w-full rounded-none border-[#262626] text-white hover:bg-[#171717]"}
                  variant={plan.popular ? undefined : "outline"}
                >
                  {priceOf(plan).monthly === 0 ? t("pricing.getStarted") : t("pricing.startPlan", { plan: t(`pricing.${plan.name}`) })}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Full comparison table */}
        <div className="mb-16 sm:mb-20">
          <h2 className="text-2xl font-bold tracking-tight text-white text-center mb-8">{t("pricing.fullComparison")}</h2>
          <div className="overflow-x-auto border border-[#262626]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#262626] bg-[#171717]">
                  <th className="text-left px-6 py-4 font-bold text-neutral-500 w-1/2" style={mono}>{t("pricing.feature")}</th>
                  {PLANS.map((p) => (
                    <th key={p.slug} className={`text-center px-6 py-4 font-bold ${p.popular ? "text-[#00E5FF]" : "text-white"}`}>
                      {t(`pricing.${p.name}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.key} className="border-b border-[#262626] bg-black">
                    <td className="px-6 py-3.5 text-neutral-400 font-medium">{t(row.label)}</td>
                    {PLANS.map((p) => {
                      const val = p.features[row.key as keyof typeof p.features];
                      return (
                        <td key={p.slug} className="text-center px-6 py-3.5">
                          {row.type === "bool" ? (
                            val ? (
                              <Check className="w-4 h-4 text-green-400 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-neutral-700 mx-auto" />
                            )
                          ) : (
                            <span className={`text-xs font-semibold ${p.popular ? "text-[#00E5FF]" : "text-white"}`} style={mono}>
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
        <div className="max-w-2xl mx-auto mb-16 sm:mb-20">
          <h2 className="text-2xl font-bold tracking-tight text-white text-center mb-8">{t("pricing.faqTitle")}</h2>
          <div className="border border-[#262626] bg-[#0A0A0A]">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="p-5 border-b border-[#262626] last:border-b-0">
                <p className="font-bold text-white mb-1.5">{t(`pricing.faq${i}q`)}</p>
                <p className="text-sm text-neutral-400">{t(`pricing.faq${i}a`)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center border border-[#00E5FF]/25 bg-[#00E5FF]/5 p-10 sm:p-12">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-3">{t("pricing.ctaTitle")}</h2>
          <p className="text-neutral-400 mb-6">{t("pricing.ctaDesc")}</p>
          <Link href={`/${locale}/auth/register`}>
            <Button size="lg" className="px-10 rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none">
              {t("pricing.ctaButton")}
            </Button>
          </Link>
        </div>
      </main>

      <Footer locale={locale} />
      <MobileCtaBar />
    </div>
  );
}
