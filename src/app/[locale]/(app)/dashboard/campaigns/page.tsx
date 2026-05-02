"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend,
} from "recharts";
import {
  TrendingUp, MousePointerClick, Users,
} from "lucide-react";

const TOOLTIP_STYLE = {
  background: "#171f33",
  border: "1px solid #464554",
  borderRadius: 8,
  color: "#dae2fd",
  fontSize: 12,
};

const COLORS = ["#c0c1ff", "#a78bfa", "#67e8f9", "#86efac", "#fcd34d"];

type CampaignRow = {
  source: string;
  medium: string;
  campaign: string;
  sessions: number;
  visitors: number;
  avg_duration: number;
  avg_pages: number;
  bounce_rate: number;
  conversions: number;
};

type SourceRow = { source: string; sessions: number; visitors: number };
type TrendRow = { date: string; source: string; sessions: number };

function fmtDuration(secs: number): string {
  const s = Number(secs) || 0;
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function KpiCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-black text-on-surface mt-0.5">{typeof value === "number" ? value.toLocaleString() : value}</p>
          {sub && <p className="text-xs text-on-surface-variant mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

const PERIODS = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
];

function Content() {
  const { selectedDomainId } = useAuthStore();
  const [days, setDays] = useState("30");
  const [goalFilter, setGoalFilter] = useState("");
  const [sortCol, setSortCol] = useState<keyof CampaignRow>("sessions");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const start = new Date(Date.now() - Number(days) * 86400000).toISOString().slice(0, 10);
  const end = new Date().toISOString().slice(0, 10);

  const { data, isLoading } = useQuery({
    queryKey: ["campaigns", selectedDomainId, days, goalFilter],
    queryFn: () =>
      analyticsApi.campaigns(selectedDomainId!, {
        start,
        end,
        ...(goalFilter ? { goal: goalFilter } : {}),
      }).then((r) => r.data?.data ?? r.data),
    enabled: !!selectedDomainId,
  });

  if (!selectedDomainId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-on-surface-variant">Select a domain to view campaigns.</p>
      </div>
    );
  }

  const campaigns: CampaignRow[] = data?.campaigns ?? [];
  const topSources: SourceRow[] = data?.top_sources ?? [];
  const rawTrend: TrendRow[] = data?.trend ?? [];

  // Aggregate trend data by date (pivot by source)
  const trendByDate: Record<string, Record<string, number>> = {};
  for (const row of rawTrend) {
    if (!trendByDate[row.date]) trendByDate[row.date] = { date: row.date as unknown as number };
    trendByDate[row.date][row.source] = Number(row.sessions);
  }
  const trendData = Object.values(trendByDate).sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );
  const trendSources = [...new Set(rawTrend.map((r) => r.source))].slice(0, 5);

  // KPIs
  const totalSessions = campaigns.reduce((s, r) => s + Number(r.sessions), 0);
  const totalVisitors = campaigns.reduce((s, r) => s + Number(r.visitors), 0);
  const avgBounce =
    campaigns.length
      ? campaigns.reduce((s, r) => s + Number(r.bounce_rate), 0) / campaigns.length
      : 0;

  // Sort table
  const sorted = [...campaigns].sort((a, b) => {
    const av = Number(a[sortCol]) || String(a[sortCol]);
    const bv = Number(b[sortCol]) || String(b[sortCol]);
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  function toggleSort(col: keyof CampaignRow) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("desc"); }
  }

  const thCls = "px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-on-surface-variant text-left cursor-pointer select-none hover:text-on-surface transition-colors";
  const tdCls = "px-3 py-2.5 text-sm text-on-surface";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Campaigns</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            UTM campaign performance — which sources drive real engagement
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            className="px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary/50 w-40"
            placeholder="Goal URL (optional)"
            value={goalFilter}
            onChange={(e) => setGoalFilter(e.target.value)}
          />
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setDays(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                days === p.value
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard icon={Users} label="Total Sessions" value={totalSessions} />
        <KpiCard icon={Users} label="Unique Visitors" value={totalVisitors} />
        <KpiCard icon={TrendingUp} label="Campaigns" value={campaigns.length} />
        <KpiCard icon={MousePointerClick} label="Avg Bounce Rate" value={`${avgBounce.toFixed(1)}%`} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source bar chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-on-surface">Sessions by Source</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-52 bg-surface-container rounded animate-pulse" />
            ) : topSources.length === 0 ? (
              <p className="text-on-surface-variant text-sm py-8 text-center">No campaign data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topSources} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#464554" strokeOpacity={0.2} horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="source" tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="sessions" fill="#c0c1ff" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Trend line chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-on-surface">Session Trend by Source</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-52 bg-surface-container rounded animate-pulse" />
            ) : trendData.length === 0 ? (
              <p className="text-on-surface-variant text-sm py-8 text-center">No trend data</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData} margin={{ left: 0, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#464554" strokeOpacity={0.2} />
                  <XAxis dataKey="date" tick={{ fill: "#c7c4d7", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#c7c4d7", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#c7c4d7" }} />
                  {trendSources.map((src, i) => (
                    <Line
                      key={src}
                      type="monotone"
                      dataKey={src}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campaign table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-on-surface">All Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  {[
                    { key: "source", label: "Source" },
                    { key: "medium", label: "Medium" },
                    { key: "campaign", label: "Campaign" },
                    { key: "sessions", label: "Sessions" },
                    { key: "visitors", label: "Visitors" },
                    { key: "avg_duration", label: "Avg Duration" },
                    { key: "avg_pages", label: "Avg Pages" },
                    { key: "bounce_rate", label: "Bounce %" },
                    ...(goalFilter ? [{ key: "conversions", label: "Conversions" }] : []),
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className={thCls}
                      onClick={() => toggleSort(key as keyof CampaignRow)}
                    >
                      {label} {sortCol === key ? (sortDir === "desc" ? "↓" : "↑") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-outline-variant/10">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-3 py-2.5">
                            <div className="h-4 bg-surface-container-high rounded animate-pulse w-20" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : sorted.map((row, i) => (
                      <tr key={i} className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                        <td className={tdCls}>
                          <Badge variant="secondary" className="font-mono text-xs">{row.source}</Badge>
                        </td>
                        <td className={tdCls + " text-on-surface-variant"}>{row.medium}</td>
                        <td className={tdCls + " max-w-[180px] truncate"} title={row.campaign}>{row.campaign}</td>
                        <td className={tdCls + " font-semibold"}>{Number(row.sessions).toLocaleString()}</td>
                        <td className={tdCls}>{Number(row.visitors).toLocaleString()}</td>
                        <td className={tdCls}>{fmtDuration(Number(row.avg_duration))}</td>
                        <td className={tdCls}>{Number(row.avg_pages).toFixed(1)}</td>
                        <td className={tdCls}>
                          <span className={Number(row.bounce_rate) > 60 ? "text-rose-400" : Number(row.bounce_rate) > 40 ? "text-yellow-300" : "text-emerald-400"}>
                            {Number(row.bounce_rate).toFixed(1)}%
                          </span>
                        </td>
                        {goalFilter && (
                          <td className={tdCls + " font-semibold text-primary"}>
                            {Number(row.conversions).toLocaleString()}
                          </td>
                        )}
                      </tr>
                    ))}
                {!isLoading && sorted.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-on-surface-variant text-sm">
                      No campaign data for this period. Add UTM parameters to your links to track campaigns.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CampaignsPage() {
  return <Content />;
}
