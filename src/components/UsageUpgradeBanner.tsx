"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Lock, ArrowRight, Sparkles } from "lucide-react";
import { analyticsApi } from "@/lib/api";

export type Usage = {
  tracked_this_month: number;
  limit: number;
  unlimited: boolean;
  capped: boolean;
  overage: number;
  plan: string;
};

/** Shared hook so pages can both show the banner AND lock their lists. */
export function useUsage(domainId: number | null) {
  return useQuery({
    queryKey: ["usage", domainId],
    queryFn: () => analyticsApi.usage(domainId!).then((r) => r.data as Usage),
    enabled: !!domainId,
    staleTime: 60_000,
  });
}

const fmt = (n: number) => (Number(n) || 0).toLocaleString();

/**
 * Upsell banner: events are always stored, but lower plans only *see* up to
 * their monthly allowance. When the site tracked more than the plan shows, this
 * teases the locked data and links to billing. Renders nothing otherwise.
 */
export function UsageUpgradeBanner({ domainId }: { domainId: number | null }) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const { data } = useUsage(domainId);

  if (!data || data.unlimited || !data.capped) return null;

  return (
    <Link href={`/${locale}/settings/billing`} className="block group">
      <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-primary/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3 group-hover:border-amber-500/60 transition-colors">
        <Lock className="w-5 h-5 text-amber-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-on-surface">
            {isAr
              ? `${fmt(data.overage)} حدثاً إضافياً تم تتبعه ومخفي على باقة ${data.plan}`
              : `${fmt(data.overage)} more events tracked — hidden on your ${data.plan} plan`}
          </p>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {isAr
              ? `سجّل موقعك ${fmt(data.tracked_this_month)} حدثاً هذا الشهر — باقتك تعرض ${fmt(data.limit)}. ترقَّ إلى Pro لفتح كل بياناتك.`
              : `Your site recorded ${fmt(data.tracked_this_month)} events this month — your plan shows ${fmt(data.limit)}. Upgrade to Pro to unlock all your data.`}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-on-primary text-sm font-semibold px-3 py-2 shrink-0">
          <Sparkles className="w-4 h-4" /> {isAr ? "ترقية" : "Upgrade"} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </span>
      </div>
    </Link>
  );
}

/** Compact locked footer for data lists (visitors/events) when over plan limit. */
export function ListLockFooter({ domainId }: { domainId: number | null }) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const { data } = useUsage(domainId);
  if (!data || data.unlimited || !data.capped) return null;

  return (
    <Link href={`/${locale}/settings/billing`}
      className="flex items-center justify-center gap-2 py-4 text-sm font-semibold text-primary hover:underline border-t border-dashed border-outline-variant/30">
      <Lock className="w-4 h-4" />
      {isAr
        ? `${fmt(data.overage)} سجلّ إضافي مخفي — ترقَّ لرؤية كل الزوار`
        : `${fmt(data.overage)} more records hidden — upgrade to see all your visitors`}
      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
    </Link>
  );
}
