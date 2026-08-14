"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import client from "@/api/client";

interface Stats {
  visitors: number;
  events: number;
  domains: number;
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${Math.floor(n / 1000)}K+`;
  return `${n}+`;
}

/**
 * Real, honest platform numbers (GET /public/stats, floored/rounded down —
 * never inflated). Replaces the fake "50,000+ websites" claim removed
 * earlier with actual figures now that they're strong enough to show.
 */
export default function LiveStatsStrip() {
  const ar = useLocale() === "ar";
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    client
      .get("/public/stats")
      .then((r) => {
        if (!cancelled) setStats((r.data?.data ?? r.data) as Stats);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats || stats.events < 1000) return null; // don't show a weak number

  const items = [
    { value: compact(stats.visitors), label: ar ? "زائر تم تتبعه" : "visitors tracked" },
    { value: compact(stats.events), label: ar ? "حدث تم تحليله" : "events analyzed" },
    { value: compact(stats.domains), label: ar ? "موقع يستخدم EYE" : "sites on EYE" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-0 divide-x divide-[#262626] border-y border-[#262626] py-8 text-center">
      {items.map((it) => (
        <div key={it.label} className="px-8">
          <p className="text-2xl sm:text-3xl font-semibold text-[#00E5FF]" style={{ fontFamily: "var(--font-mono-marketing)" }}>{it.value}</p>
          <p className="text-xs text-neutral-500 mt-1">{it.label}</p>
        </div>
      ))}
    </div>
  );
}
