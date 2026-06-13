"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Printer, Eye } from "lucide-react";

type Metrics = {
  sessions: number; visitors: number; errors: number; revenue: number;
  orders: number; spend: number; conversion_rate: number; roas: number | null;
};
type DomainRow = { domain_id: number; domain: string; current: Metrics; deltas: { revenue: number | null; visitors: number | null } };
type Issue = { domain: string; title: string; detail: string; severity: string };

const PERIODS = [{ label: "7 days", value: 7 }, { label: "30 days", value: 30 }, { label: "90 days", value: 90 }];

function n(v: number) { return Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }); }

function Content() {
  const { user } = useAuthStore();
  const [days, setDays] = useState(30);

  const { data: overview } = useQuery({
    queryKey: ["portfolio-overview", days],
    queryFn: () => analyticsApi.portfolioOverview({ days }).then((r) => r.data?.data ?? r.data),
  });
  const { data: triage } = useQuery({
    queryKey: ["portfolio-triage", days],
    queryFn: () => analyticsApi.portfolioTriage({ days }).then((r) => r.data?.data ?? r.data),
  });

  const rows: DomainRow[] = overview?.domains ?? [];
  const totals = overview?.totals ?? { visitors: 0, revenue: 0, spend: 0, orders: 0, roas: null };
  const range = overview?.range ?? { start: "", end: "" };
  const issues: Issue[] = (triage?.issues ?? []).slice(0, 10);

  const company = (user as any)?.company || (user as any)?.name || "Your Company";
  const generated = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Controls (not printed) */}
      <div className="print:hidden flex items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-2">
          {PERIODS.map((p) => (
            <button key={p.value} onClick={() => setDays(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${days === p.value ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:text-on-surface"}`}>
              {p.label}
            </button>
          ))}
        </div>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold">
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Report sheet */}
      <div className="bg-white text-slate-900 rounded-xl shadow-lg p-10 print:shadow-none print:rounded-none print:p-0">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-5 mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Portfolio Performance Report</h1>
            <p className="text-slate-500 text-sm mt-1">{company}</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="inline-flex items-center gap-1 font-bold text-slate-700"><Eye className="w-4 h-4" /> EYE Analytics</p>
            <p className="mt-1">{range.start} → {range.end}</p>
            <p>Generated {generated}</p>
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            ["Visitors", n(totals.visitors)],
            ["Revenue", n(totals.revenue)],
            ["Ad Spend", n(totals.spend)],
            ["ROAS", totals.roas !== null ? `${totals.roas}×` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="border border-slate-200 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">{label}</p>
              <p className="text-xl font-black mt-1">{value}</p>
            </div>
          ))}
        </div>

        {/* Priorities */}
        {issues.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">Priorities this period</h2>
            <ul className="space-y-2">
              {issues.map((it, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${it.severity === "high" ? "bg-rose-500" : it.severity === "medium" ? "bg-amber-500" : "bg-slate-300"}`} />
                  <span><span className="font-semibold">{it.title}</span> — {it.domain}. <span className="text-slate-500">{it.detail}</span></span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Per-site table */}
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">By site</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-400">
              <th className="py-2">Site</th>
              <th className="py-2 text-right">Visitors</th>
              <th className="py-2 text-right">Revenue</th>
              <th className="py-2 text-right">Orders</th>
              <th className="py-2 text-right">Spend</th>
              <th className="py-2 text-right">ROAS</th>
              <th className="py-2 text-right">Conv %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.domain_id} className="border-b border-slate-100">
                <td className="py-2 font-medium">{r.domain}</td>
                <td className="py-2 text-right tabular-nums">{n(r.current.visitors)}</td>
                <td className="py-2 text-right tabular-nums font-semibold">{n(r.current.revenue)}</td>
                <td className="py-2 text-right tabular-nums">{n(r.current.orders)}</td>
                <td className="py-2 text-right tabular-nums">{n(r.current.spend)}</td>
                <td className="py-2 text-right tabular-nums">{r.current.roas !== null ? `${r.current.roas}×` : "—"}</td>
                <td className="py-2 text-right tabular-nums">{r.current.conversion_rate}%</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="py-6 text-center text-slate-400">No data for this period.</td></tr>
            )}
          </tbody>
        </table>

        <p className="text-[10px] text-slate-400 mt-8 pt-4 border-t border-slate-200">
          Generated by EYE Analytics · {generated}. Figures cover {range.start} to {range.end}. Revenue/spend may span multiple currencies.
        </p>
      </div>
    </div>
  );
}

export default function PortfolioReportPage() {
  return <Content />;
}
