"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Metric = {
  key: string;
  label: string;
  a: number;
  b: number;
  change_pct: number;
  trend: "up" | "down" | "flat";
  good: boolean | null;
  format: "number" | "duration" | "percent";
};

const PRESETS = [
  { key: "today_vs_yesterday", label: "Today vs Yesterday" },
  { key: "week_vs_last_week", label: "This Week vs Last Week" },
  { key: "month_vs_last_month", label: "This Month vs Last Month" },
  { key: "custom", label: "Custom" },
] as const;

function fmtValue(v: number, format: Metric["format"]): string {
  if (format === "duration") {
    if (v < 60) return `${v}s`;
    const m = Math.floor(v / 60);
    const s = v % 60;
    return s ? `${m}m ${s}s` : `${m}m`;
  }
  if (format === "percent") return `${v}%`;
  return v.toLocaleString();
}

function MetricCard({ m }: { m: Metric }) {
  const color =
    m.good === null ? "text-on-surface-variant" : m.good ? "text-emerald-400" : "text-red-400";
  const Arrow = m.trend === "up" ? ArrowUp : m.trend === "down" ? ArrowDown : Minus;
  const bg =
    m.good === null ? "bg-surface-container-high" : m.good ? "bg-emerald-500/10" : "bg-red-500/10";

  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{m.label}</p>
        <div className="flex items-end justify-between mt-2 gap-2">
          <p className="text-3xl font-black text-on-surface leading-none">{fmtValue(m.a, m.format)}</p>
          <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold", bg, color)}>
            <Arrow className="w-3.5 h-3.5" />
            {m.change_pct > 0 ? "+" : ""}{m.change_pct}%
          </span>
        </div>
        <p className="text-xs text-on-surface-variant mt-2">
          vs <span className="font-semibold text-on-surface">{fmtValue(m.b, m.format)}</span> previous
        </p>
      </CardContent>
    </Card>
  );
}

function Content() {
  const { selectedDomainId } = useAuthStore();
  const [preset, setPreset] = useState<string>("today_vs_yesterday");
  const today = new Date().toISOString().slice(0, 10);
  const [custom, setCustom] = useState({ a_from: today, a_to: today, b_from: today, b_to: today });

  const params =
    preset === "custom" ? { ...custom } : { preset };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["compare", selectedDomainId, preset, preset === "custom" ? custom : null],
    queryFn: () => analyticsApi.compare(selectedDomainId!, params).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const metrics: Metric[] = data?.metrics || [];
  const periodA = data?.period_a;
  const periodB = data?.period_b;

  // Overall verdict from the headline metrics (visitors + engagements + sign-ups).
  const headline = metrics.filter((m) => ["visitors", "engagements", "signups"].includes(m.key));
  const ups = headline.filter((m) => m.good === true).length;
  const downs = headline.filter((m) => m.good === false).length;
  const onTrack = ups >= downs && ups > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Compare Periods</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">See how you're trending — pick two periods to compare your key metrics</p>
      </div>

      {/* Preset selector */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPreset(p.key)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
              preset === p.key
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom date pickers */}
      {preset === "custom" && (
        <Card>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Period A</p>
              <div className="flex items-center gap-2">
                <input type="date" value={custom.a_from} max={today} onChange={(e) => setCustom((c) => ({ ...c, a_from: e.target.value }))} className="bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface" />
                <span className="text-on-surface-variant text-sm">→</span>
                <input type="date" value={custom.a_to} max={today} onChange={(e) => setCustom((c) => ({ ...c, a_to: e.target.value }))} className="bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Period B (compare to)</p>
              <div className="flex items-center gap-2">
                <input type="date" value={custom.b_from} max={today} onChange={(e) => setCustom((c) => ({ ...c, b_from: e.target.value }))} className="bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface" />
                <span className="text-on-surface-variant text-sm">→</span>
                <input type="date" value={custom.b_to} max={today} onChange={(e) => setCustom((c) => ({ ...c, b_to: e.target.value }))} className="bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall verdict */}
      {!isLoading && metrics.length > 0 && (
        <div className={cn(
          "rounded-2xl border p-5 flex items-center gap-4",
          onTrack ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"
        )}>
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", onTrack ? "bg-emerald-500/15" : "bg-red-500/15")}>
            {onTrack ? <TrendingUp className="w-6 h-6 text-emerald-400" /> : <TrendingDown className="w-6 h-6 text-red-400" />}
          </div>
          <div>
            <p className="font-black text-on-surface">{onTrack ? "You're on the right track 📈" : "Attention needed 📉"}</p>
            <p className="text-sm text-on-surface-variant">
              Comparing <span className="font-semibold text-on-surface">{periodA?.label}</span> vs <span className="font-semibold text-on-surface">{periodB?.label}</span> — {ups} up, {downs} down across your headline metrics.
            </p>
          </div>
        </div>
      )}

      {isError && <p className="text-sm text-red-400">Couldn't load comparison data.</p>}

      {/* Metric grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-32 bg-surface-container-high rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((m) => <MetricCard key={m.key} m={m} />)}
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return <Content />;
}
