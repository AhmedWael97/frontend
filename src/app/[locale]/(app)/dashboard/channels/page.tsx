"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Layers, DollarSign, TrendingUp, TrendingDown, Lightbulb, Link2 } from "lucide-react";

type CampaignRow = { medium: string; sessions: number; visitors: number; revenue: number; orders: number; spend: number };
const PERIODS = [{ label: "7 days", value: "7" }, { label: "30 days", value: "30" }, { label: "90 days", value: "90" }];

function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}K`;
  return Number(n || 0).toLocaleString();
}

function Content() {
  const { selectedDomainId } = useAuthStore();
  const [days, setDays] = useState("30");
  const start = new Date(Date.now() - Number(days) * 86400000).toISOString().slice(0, 10);
  const end = new Date().toISOString().slice(0, 10);

  const { data, isLoading } = useQuery({
    queryKey: ["campaigns", selectedDomainId, days],
    queryFn: () => analyticsApi.campaigns(selectedDomainId!, { start, end }).then((r) => r.data?.data ?? r.data),
    enabled: !!selectedDomainId,
  });

  const rows: CampaignRow[] = data?.campaigns ?? [];
  const currency: string = data?.currency ?? "";
  const fmtMoney = (n: number) => `${currency ? currency + " " : ""}${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  const channels = useMemo(() => {
    const map: Record<string, { sessions: number; visitors: number; revenue: number; orders: number; spend: number }> = {};
    for (const r of rows) {
      const k = r.medium || "(none)";
      const c = (map[k] ??= { sessions: 0, visitors: 0, revenue: 0, orders: 0, spend: 0 });
      c.sessions += Number(r.sessions || 0);
      c.visitors += Number(r.visitors || 0);
      c.revenue += Number(r.revenue || 0);
      c.orders += Number(r.orders || 0);
      c.spend += Number(r.spend || 0);
    }
    return Object.entries(map)
      .map(([medium, m]) => ({
        medium,
        ...m,
        roas: m.spend > 0 ? m.revenue / m.spend : null,
        cr: m.sessions > 0 ? (m.orders / m.sessions) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [rows]);

  const totals = useMemo(() => ({
    revenue: channels.reduce((s, c) => s + c.revenue, 0),
    spend: channels.reduce((s, c) => s + c.spend, 0),
    sessions: channels.reduce((s, c) => s + c.sessions, 0),
  }), [channels]);
  const overallRoas = totals.spend > 0 ? totals.revenue / totals.spend : null;

  // Cross-channel budget suggestions.
  const suggestions = useMemo(() => {
    const out: { kind: "pause" | "scale" | "tag"; text: string; impact: number }[] = [];
    for (const c of channels) {
      if (c.spend >= 10 && c.roas != null && c.roas < 1) {
        out.push({ kind: "pause", text: `Cut spend on ${c.medium}: ${c.roas.toFixed(2)}× ROAS — losing ${fmtMoney(c.spend - c.revenue)}.`, impact: c.spend - c.revenue });
      } else if (c.spend >= 5 && c.roas != null && c.roas >= 3) {
        out.push({ kind: "scale", text: `Shift more budget to ${c.medium}: ${c.roas.toFixed(2)}× ROAS on ${fmtMoney(c.spend)}.`, impact: c.revenue });
      } else if (c.revenue > 0 && c.spend === 0 && c.medium !== "(none)" && c.medium !== "organic" && c.medium !== "(direct)") {
        out.push({ kind: "tag", text: `${c.medium} drove ${fmtMoney(c.revenue)} with no recorded spend — add it to see true ROAS.`, impact: c.revenue * 0.1 });
      }
    }
    return out.sort((a, b) => b.impact - a.impact).slice(0, 6);
  }, [channels]);

  if (!selectedDomainId) return <div className="flex items-center justify-center h-64"><p className="text-on-surface-variant">Select a domain to view channels.</p></div>;

  const REC = { pause: { icon: TrendingDown, cls: "border-rose-500/40 bg-rose-500/10" }, scale: { icon: TrendingUp, cls: "border-emerald-500/40 bg-emerald-500/10" }, tag: { icon: Link2, cls: "border-outline-variant/30 bg-surface-container" } };
  const td = "px-3 py-2.5 text-sm text-on-surface tabular-nums";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Channel Mix</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Every channel's spend → revenue → ROAS, and where to shift budget.</p>
        </div>
        <div className="flex items-center gap-2">
          {PERIODS.map((p) => (
            <button key={p.value} onClick={() => setDays(p.value)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${days === p.value ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:text-on-surface"}`}>{p.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi icon={DollarSign} label="Revenue" value={compact(totals.revenue)} />
        <Kpi icon={DollarSign} label="Ad Spend" value={compact(totals.spend)} />
        <Kpi icon={TrendingUp} label="Blended ROAS" value={overallRoas !== null ? `${overallRoas.toFixed(2)}×` : "—"} />
        <Kpi icon={Layers} label="Channels" value={String(channels.length)} />
      </div>

      {suggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-on-surface flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-400" /> Budget reallocation</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((s, i) => {
                const meta = REC[s.kind]; const Icon = meta.icon;
                return <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border ${meta.cls}`}><Icon className="w-4 h-4 mt-0.5 shrink-0 text-on-surface-variant" /><span className="text-sm text-on-surface">{s.text}</span></div>;
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-on-surface">By channel</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead><tr className="border-b border-outline-variant/20 text-xs uppercase tracking-widest text-on-surface-variant">
                <th className="px-3 py-2.5 text-left">Channel</th><th className="px-3 py-2.5 text-right">Sessions</th><th className="px-3 py-2.5 text-right">Revenue</th><th className="px-3 py-2.5 text-right">Orders</th><th className="px-3 py-2.5 text-right">Spend</th><th className="px-3 py-2.5 text-right">ROAS</th><th className="px-3 py-2.5 text-right">Conv %</th>
              </tr></thead>
              <tbody>
                {isLoading ? Array.from({ length: 5 }).map((_, i) => (<tr key={i} className="border-b border-outline-variant/10">{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-3 py-2.5"><div className="h-4 bg-surface-container-high rounded animate-pulse w-16" /></td>)}</tr>))
                  : channels.map((c) => (
                    <tr key={c.medium} className="border-b border-outline-variant/10">
                      <td className="px-3 py-2.5 text-sm font-semibold text-on-surface capitalize">{c.medium}</td>
                      <td className={td + " text-right"}>{compact(c.sessions)}</td>
                      <td className={td + " text-right font-semibold"}>{compact(c.revenue)}</td>
                      <td className={td + " text-right"}>{compact(c.orders)}</td>
                      <td className={td + " text-right"}>{compact(c.spend)}</td>
                      <td className={td + " text-right font-semibold"}>{c.roas === null ? <span className="text-on-surface-variant">—</span> : <span className={c.roas >= 1 ? "text-emerald-400" : "text-rose-400"}>{c.roas.toFixed(2)}×</span>}</td>
                      <td className={td + " text-right"}>{c.cr.toFixed(2)}%</td>
                    </tr>
                  ))}
                {!isLoading && channels.length === 0 && <tr><td colSpan={7} className="px-3 py-10 text-center text-on-surface-variant text-sm">No channel data yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return <Card><CardContent className="p-4 flex items-start gap-3"><div className="p-2 rounded-lg bg-primary/10 shrink-0"><Icon className="w-4 h-4 text-primary" /></div><div className="min-w-0"><p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">{label}</p><p className="text-2xl font-black text-on-surface mt-0.5 tabular-nums">{value}</p></div></CardContent></Card>;
}

export default function ChannelsPage() {
  return <Content />;
}
