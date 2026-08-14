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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#262626] max-w-5xl mx-auto border border-[#262626]">
      {PLANS.map((plan) => {
        const monthly = priceOf(plan.slug, plan.price_monthly);
        return (
          <div
            key={plan.slug}
            className={plan.popular ? "relative bg-[#0A0A0A] p-6 sm:p-7 flex flex-col" : "relative bg-black p-6 sm:p-7 flex flex-col"}
          >
            {plan.popular && (
              <span className="absolute top-0 left-0 px-3 py-1 text-[10px] font-semibold tracking-wider uppercase bg-[#00E5FF] text-black" style={{ fontFamily: "var(--font-mono-marketing)" }}>
                {t("pricing.mostPopular")}
              </span>
            )}
            <h3 className={plan.popular ? "text-base font-semibold text-white mb-1 mt-4" : "text-base font-semibold text-white mb-1"}>
              {t(plan.nameKey as any)}
            </h3>
            <p className="text-xs text-neutral-500 mb-5 leading-relaxed">
              {t(plan.descKey as any)}
            </p>
            <div className="mb-6">
              <span className="text-3xl font-semibold text-white" style={{ fontFamily: "var(--font-mono-marketing)" }}>
                {monthly === 0 ? (locale === "ar" ? "مجانًا" : "Free") : format(monthly)}
              </span>
              {monthly > 0 && (
                <span className="text-xs text-neutral-500">{t("pricing.perMonth")}</span>
              )}
            </div>
            <ul className="space-y-2.5 mb-7 flex-1">
              {plan.featureKeys.map((fk) => (
                <li key={fk} className="flex items-start gap-2">
                  <Check className={plan.popular ? "w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" : "w-4 h-4 text-neutral-600 shrink-0 mt-0.5"} />
                  <span className="text-xs text-neutral-400">{t(fk as any)}</span>
                </li>
              ))}
            </ul>
            <Link href={`/${locale}/auth/register`}>
              <Button
                className={plan.popular ? "w-full rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none" : "w-full rounded-none border-[#262626] text-white hover:bg-[#171717]"}
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
