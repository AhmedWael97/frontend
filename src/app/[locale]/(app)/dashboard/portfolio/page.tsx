"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import {
  Users, DollarSign, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Bug, ShoppingCart, FileText,
} from "lucide-react";

type Metrics = {
  sessions: number; visitors: number; errors: number; bounce_rate: number;
  revenue: number; orders: number; spend: number; conversion_rate: number; roas: number | null;
};
type DomainRow = {
  domain_id: number; domain: string; current: Metrics; prior: Metrics;
  deltas: { visitors: number | null; sessions: number | null; revenue: number | null; orders: number | null };
};
type Issue = {
  domain_id: number; domain: string; type: string; severity: "high" | "medium" | "low";
  title: string; detail: string; impact: number;
};

const PERIODS = [{ label: "7 days", value: 7 }, { label: "30 days", value: 30 }, { label: "90 days", value: 90 }];

function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}K`;
  return Number(n).toLocaleString();
}
function Delta({ v }: { v: number | null }) {
  if (v === null) return <span className="text-on-surface-variant text-[11px]">—</span>;
  const up = v >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] ${up ? "text-emerald-400" : "text-rose-400"}`}>
      {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(v)}%
    </span>
  );
}

const SEVERITY: Record<string, string> = {
  high: "border-rose-500/40 bg-rose-500/10",
  medium: "border-amber-500/40 bg-amber-500/10",
  low: "border-outline-variant/30 bg-surface-container",
};
const ISSUE_TARGET: Record<string, string> = {
  low_roas: "campaigns", no_spend_data: "campaigns", revenue_drop: "campaigns",
  traffic_drop: "analytics", error_spike: "errors",
};

type SortKey = "domain" | "visitors" | "sessions" | "revenue" | "orders" | "spend" | "roas" | "conversion_rate" | "errors";

function Content() {
  const locale = useLocale();
  const router = useRouter();
  const { setSelectedDomainId } = useAuthStore();
  const [days, setDays] = useState(30);
  const [sortKey, setSortKey] = useState<SortKey>("revenue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data: overview, isLoading } = useQuery({
    queryKey: ["portfolio-overview", days],
    queryFn: () => analyticsApi.portfolioOverview({ days }).then((r) => r.data?.data ?? r.data),
  });
  const { data: triageData } = useQuery({
    queryKey: ["portfolio-triage", days],
    queryFn: () => analyticsApi.portfolioTriage({ days }).then((r) => r.data?.data ?? r.data),
  });

  const rows: DomainRow[] = overview?.domains ?? [];
  const totals = overview?.totals ?? { visitors: 0, revenue: 0, spend: 0, orders: 0, roas: null };
  const issues: Issue[] = triageData?.issues ?? [];

  const sorted = useMemo(() => {
    const get = (r: DomainRow): number | string =>
      sortKey === "domain" ? r.domain : (r.current as any)[sortKey] ?? 0;
    return [...rows].sort((a, b) => {
      const av = get(a), bv = get(b);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortDir]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir(k === "domain" ? "asc" : "desc"); }
  }

  function go(domainId: number, target: string) {
    setSelectedDomainId(domainId);
    router.push(`/${locale}/dashboard/${target}`);
  }

  const th = "px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-on-surface-variant cursor-pointer select-none hover:text-on-surface";
  const td = "px-3 py-2.5 text-sm text-on-surface tabular-nums";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Portfolio</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">All your sites at a glance — and what needs attention first.</p>
        </div>
        <div className="flex items-center gap-2">
          {PERIODS.map((p) => (
            <button key={p.value} onClick={() => setDays(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${days === p.value ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:text-on-surface"}`}>
              {p.label}
            </button>
          ))}
          <a href={`/${locale}/dashboard/portfolio/report`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:border-primary/40 transition-colors">
            <FileText className="w-3.5 h-3.5" /> Report
          </a>
        </div>
      </div>

      {/* Portfolio totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi icon={Users} label="Total Visitors" value={compact(totals.visitors)} />
        <Kpi icon={DollarSign} label="Total Revenue" value={compact(totals.revenue)} />
        <Kpi icon={DollarSign} label="Total Ad Spend" value={compact(totals.spend)} />
        <Kpi icon={TrendingUp} label="Portfolio ROAS" value={totals.roas !== null ? `${totals.roas}×` : "—"} sub={`${compact(totals.orders)} orders`} />
      </div>

      {/* Triage feed */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-on-surface flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Needs attention
            {issues.length > 0 && <span className="text-xs font-normal text-on-surface-variant">({issues.length})</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {issues.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-4 text-center">Nothing urgent across your sites. 🎉</p>
          ) : (
            <div className="space-y-2">
              {issues.slice(0, 12).map((it, i) => (
                <button key={i} onClick={() => go(it.domain_id, ISSUE_TARGET[it.type] ?? "analytics")}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-colors hover:brightness-110 ${SEVERITY[it.severity] ?? SEVERITY.low}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{it.title} · <span className="text-on-surface-variant font-normal">{it.domain}</span></p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{it.detail}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wide font-bold text-on-surface-variant shrink-0">{it.severity}</span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-site table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-on-surface">All sites</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  {([
                    ["domain", "Site"], ["visitors", "Visitors"], ["sessions", "Sessions"],
                    ["revenue", "Revenue"], ["orders", "Orders"], ["spend", "Spend"],
                    ["roas", "ROAS"], ["conversion_rate", "Conv %"], ["errors", "Errors"],
                  ] as [SortKey, string][]).map(([k, label]) => (
                    <th key={k} className={`${th} ${k === "domain" ? "text-left" : "text-right"}`} onClick={() => toggleSort(k)}>
                      {label} {sortKey === k ? (sortDir === "desc" ? "↓" : "↑") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-outline-variant/10">
                    {Array.from({ length: 9 }).map((_, j) => <td key={j} className="px-3 py-2.5"><div className="h-4 bg-surface-container-high rounded animate-pulse w-16" /></td>)}
                  </tr>
                )) : sorted.map((r) => (
                  <tr key={r.domain_id} onClick={() => go(r.domain_id, "analytics")}
                    className="border-b border-outline-variant/10 hover:bg-surface-container/50 cursor-pointer transition-colors">
                    <td className="px-3 py-2.5 text-sm font-semibold text-on-surface max-w-[200px] truncate" title={r.domain}>{r.domain}</td>
                    <td className={td + " text-right"}>{compact(r.current.visitors)} <Delta v={r.deltas.visitors} /></td>
                    <td className={td + " text-right"}>{compact(r.current.sessions)}</td>
                    <td className={td + " text-right font-semibold"}>{compact(r.current.revenue)} <Delta v={r.deltas.revenue} /></td>
                    <td className={td + " text-right"}><span className="inline-flex items-center gap-1"><ShoppingCart className="w-3 h-3 text-on-surface-variant" />{compact(r.current.orders)}</span></td>
                    <td className={td + " text-right"}>{compact(r.current.spend)}</td>
                    <td className={td + " text-right font-semibold"}>
                      {r.current.roas === null ? <span className="text-on-surface-variant">—</span>
                        : <span className={r.current.roas >= 1 ? "text-emerald-400" : "text-rose-400"}>{r.current.roas}×</span>}
                    </td>
                    <td className={td + " text-right"}>{r.current.conversion_rate}%</td>
                    <td className={td + " text-right"}>
                      {r.current.errors > 0 ? <span className="inline-flex items-center gap-1 text-rose-400"><Bug className="w-3 h-3" />{r.current.errors}</span> : "—"}
                    </td>
                  </tr>
                ))}
                {!isLoading && sorted.length === 0 && (
                  <tr><td colSpan={9} className="px-3 py-10 text-center text-on-surface-variant text-sm">No sites yet — add a domain to get started.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <Card><CardContent className="p-4 flex items-start gap-3">
      <div className="p-2 rounded-lg bg-primary/10 shrink-0"><Icon className="w-4 h-4 text-primary" /></div>
      <div className="min-w-0">
        <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-on-surface mt-0.5 tabular-nums">{value}</p>
        {sub && <p className="text-xs text-on-surface-variant mt-0.5">{sub}</p>}
      </div>
    </CardContent></Card>
  );
}

export default function PortfolioPage() {
  return <Content />;
}
