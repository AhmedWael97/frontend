"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import client from "@/api/client";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/lib/useCurrency";

const PLANS = [
  { slug: "free", nameKey: "pricing.free", descKey: "pricing.freeDesc", price_monthly: 0, featureKeys: ["pricing.domains1", "pricing.events10k", "pricing.retention30", "pricing.aiDaily"], popular: false },
  { slug: "pro", nameKey: "pricing.pro", descKey: "pricing.proDesc", price_monthly: 5, featureKeys: ["pricing.domains5", "pricing.events100k", "pricing.retention90", "pricing.ai6h"], popular: true },
  { slug: "business", nameKey: "pricing.business", descKey: "pricing.businessDesc", price_monthly: 99, featureKeys: ["pricing.domainsUnlimited", "pricing.events1m", "pricing.retention365", "pricing.aiHourly"], popular: false },
] as const;

/** Real plan cards — prices come from the live /plans endpoint (falls back to the static defaults above), same as the full pricing page. */
export default function PricingTeaser() {
  const locale = useLocale();
  const t = useTranslations();
  const { format } = useCurrency();

  const { data: dbPlans } = useQuery({
    queryKey: ["public-plans"],
    queryFn: () => client.get("/plans").then((r) => r.data as Array<{ slug: string; price_monthly: number }>),
  });

  const priceOf = (slug: string, fallback: number) => dbPlans?.find((p) => p.slug === slug)?.price_monthly ?? fallback;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
      {PLANS.map((plan) => {
        const monthly = priceOf(plan.slug, plan.price_monthly);
        return (
          <div
            key={plan.slug}
            className={
              plan.popular
                ? "relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 p-6 sm:p-7 shadow-xl shadow-indigo-500/25 flex flex-col"
                : "relative rounded-2xl sm:rounded-3xl bg-surface-container/30 border border-outline-variant/15 p-6 sm:p-7 flex flex-col"
            }
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-surface text-primary shadow-md">
                {t("pricing.mostPopular")}
              </span>
            )}
            <h3 className={plan.popular ? "text-base font-bold text-white mb-1" : "text-base font-bold text-on-surface mb-1"}>
              {t(plan.nameKey as any)}
            </h3>
            <p className={plan.popular ? "text-xs text-white/80 mb-5 leading-relaxed" : "text-xs text-on-surface-variant mb-5 leading-relaxed"}>
              {t(plan.descKey as any)}
            </p>
            <div className="mb-6">
              <span className={plan.popular ? "text-3xl font-black text-white" : "text-3xl font-black text-on-surface"}>
                {monthly === 0 ? (locale === "ar" ? "مجانًا" : "Free") : format(monthly)}
              </span>
              {monthly > 0 && (
                <span className={plan.popular ? "text-xs text-white/70" : "text-xs text-on-surface-variant"}>{t("pricing.perMonth")}</span>
              )}
            </div>
            <ul className="space-y-2.5 mb-7 flex-1">
              {plan.featureKeys.map((fk) => (
                <li key={fk} className="flex items-start gap-2">
                  <Check className={plan.popular ? "w-4 h-4 text-white/90 shrink-0 mt-0.5" : "w-4 h-4 text-emerald-500 shrink-0 mt-0.5"} />
                  <span className={plan.popular ? "text-xs text-white/90" : "text-xs text-on-surface-variant"}>{t(fk as any)}</span>
                </li>
              ))}
            </ul>
            <Link href={`/${locale}/auth/register`}>
              <Button
                className={plan.popular ? "w-full bg-white text-indigo-600 hover:bg-white/90" : "w-full"}
                variant={plan.popular ? undefined : "outline"}
              >
                {t("pricing.startPlan", { plan: t(plan.nameKey as any) })}
              </Button>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
