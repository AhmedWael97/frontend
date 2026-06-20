"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Gem } from "lucide-react";

type LtvRow = {
  source: string; visitors: number; paying_visitors: number; orders: number;
  revenue: number; ltv: number; ltv_paying: number; conversion_rate: number;
};
const PERIODS = [{ label: "90 days", value: "90" }, { label: "180 days", value: "180" }, { label: "365 days", value: "365" }];

function Content() {
  const { selectedDomainId } = useAuthStore();
  const [days, setDays] = useState("365");

  const { data, isLoading } = useQuery({
    queryKey: ["ltv", selectedDomainId, days],
    queryFn: () => analyticsApi.ltv(selectedDomainId!, { days: Number(days) }).then((r) => r.data?.data ?? r.data),
    enabled: !!selectedDomainId,
  });

  const rows: LtvRow[] = (data?.sources ?? []).filter((r: LtvRow) => r.visitors > 0);
  const currency: string = data?.currency ?? "";
  const fmt = (n: number) => `${currency ? currency + " " : ""}${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  const maxLtv = Math.max(1, ...rows.map((r) => r.ltv));

  if (!selectedDomainId) return <div className="flex items-center justify-center h-64"><p className="text-on-surface-variant">Select a domain to view LTV.</p></div>;
  const td = "px-3 py-2.5 text-sm text-on-surface tabular-nums";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2"><Gem className="w-6 h-6 text-primary" /> Lifetime Value by Source</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Which channels bring the most valuable customers — total revenue per visitor, not just first purchase.</p>
        </div>
        <div className="flex items-center gap-2">
          {PERIODS.map((p) => <button key={p.value} onClick={() => setDays(p.value)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${days === p.value ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:text-on-surface"}`}>{p.label}</button>)}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-on-surface">LTV by acquisition source (first-touch)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead><tr className="border-b border-outline-variant/20 text-xs uppercase tracking-widest text-on-surface-variant">
                <th className="px-3 py-2.5 text-left">Source</th><th className="px-3 py-2.5 text-right">Visitors</th><th className="px-3 py-2.5 text-right">Paying</th><th className="px-3 py-2.5 text-right">Conv %</th><th className="px-3 py-2.5 text-right">Revenue</th><th className="px-3 py-2.5 text-left w-48">Avg LTV / visitor</th>
              </tr></thead>
              <tbody>
                {isLoading ? Array.from({ length: 6 }).map((_, i) => (<tr key={i} className="border-b border-outline-variant/10">{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-3 py-2.5"><div className="h-4 bg-surface-container-high rounded animate-pulse w-16" /></td>)}</tr>))
                  : rows.map((r) => (
                    <tr key={r.source} className="border-b border-outline-variant/10">
                      <td className="px-3 py-2.5 text-sm font-semibold text-on-surface">{r.source}</td>
                      <td className={td + " text-right"}>{r.visitors.toLocaleString()}</td>
                      <td className={td + " text-right"}>{r.paying_visitors.toLocaleString()}</td>
                      <td className={td + " text-right"}>{r.conversion_rate}%</td>
                      <td className={td + " text-right font-semibold"}>{fmt(r.revenue)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-surface-container overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(r.ltv / maxLtv) * 100}%` }} /></div>
                          <span className="text-sm tabular-nums font-semibold text-on-surface w-20 text-right">{fmt(r.ltv)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                {!isLoading && rows.length === 0 && <tr><td colSpan={6} className="px-3 py-10 text-center text-on-surface-variant text-sm">No revenue data yet — LTV needs tracked purchases.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LtvPage() {
  return <Content />;
}
