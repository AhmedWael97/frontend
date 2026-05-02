"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import {
  Users, Eye, Clock, TrendingDown, TrendingUp, Globe, Monitor, Smartphone,
  Tablet, Flame, Megaphone, Zap, Star, ArrowUpRight, ArrowDownRight,
  BarChart2, AlertCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const TOOLTIP_STYLE = {
  background: "#171f33",
  border: "1px solid #464554",
  borderRadius: 8,
  color: "#dae2fd",
  fontSize: 12,
};

const PIE_COLORS = ["#c0c1ff", "#a78bfa", "#67e8f9", "#86efac", "#fcd34d", "#f9a8d4"];

type SummaryData = {
  period: { start: string; end: string };
  traffic: {
    visitors: number; sessions: number; pageviews: number;
    avg_duration: number; bounce_rate: number; avg_pages: number;
  };
  prev_traffic: {
    visitors: number; sessions: number; pageviews: number;
    avg_duration: number; bounce_rate: number;
  };
  top_pages: { url: string; views: number }[];
  top_countries: { country: string; sessions: number }[];
  top_referrers: { referrer: string; sessions: number }[];
  devices: { device_type: string; sessions: number }[];
  top_campaigns: { source: string; campaign: string; sessions: number; visitors: number; avg_duration: number }[];
  engaged_count: number;
  ux_score: { score: number; breakdown: Record<string, unknown>; calculated_at: string } | null;
  custom_events: { name: string; occurrences: number }[];
  trend: { date: string; visitors: number; sessions: number }[];
};

function pct(a: number, b: number): number {
  const bNum = Number(b);
  if (!bNum) return 0;
  return Math.round(((Number(a) - bNum) / bNum) * 100);
}

function Delta({ val }: { val: number }) {
  if (val === 0) return <span className="text-on-surface-variant text-xs">—</span>;
  const pos = val > 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${pos ? "text-emerald-400" : "text-rose-400"}`}>
      {pos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(val)}%
    </span>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  color = "text-primary",
  bg = "bg-primary/10",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  delta?: number;
  color?: string;
  bg?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={`p-2 rounded-lg ${bg}`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          {delta !== undefined && <Delta val={delta} />}
        </div>
        <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-3">{label}</p>
        <p className="text-2xl font-black text-on-surface mt-0.5">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      </CardContent>
    </Card>
  );
}

function UxScoreGauge({ score }: { score: number }) {
  const good = score >= 80;
  const warn = score >= 60;
  const color = good ? "text-emerald-400" : warn ? "text-yellow-300" : "text-rose-400";
  const ring = good ? "stroke-emerald-400" : warn ? "stroke-yellow-300" : "stroke-rose-400";
  const r = 36, cx = 44, cy = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={88} height={88} className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#464554" strokeWidth={8} strokeOpacity={0.3} />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          className={ring}
          strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <span className={`text-3xl font-black -mt-14 ${color}`}>{score}</span>
      <span className="text-xs text-on-surface-variant mt-6">
        {good ? "Strong" : warn ? "Needs work" : "At risk"}
      </span>
    </div>
  );
}

function DeviceIcon({ type }: { type: string }) {
  if (type === "mobile") return <Smartphone className="w-3.5 h-3.5" />;
  if (type === "tablet") return <Tablet className="w-3.5 h-3.5" />;
  return <Monitor className="w-3.5 h-3.5" />;
}

function fmtDuration(secs: number): string {
  const s = Number(secs) || 0;
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

const PERIODS = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-on-surface-variant" />
        <h2 className="text-sm font-bold text-on-surface uppercase tracking-widest">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Content() {
  const { selectedDomainId } = useAuthStore();
  const [period, setPeriod] = useState("30d");

  const { data: raw, isLoading } = useQuery({
    queryKey: ["summary", selectedDomainId, period],
    queryFn: () =>
      analyticsApi.summary(selectedDomainId!, { period }).then((r) => r.data?.data ?? r.data),
    enabled: !!selectedDomainId,
  });

  if (!selectedDomainId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-on-surface-variant">Select a domain to view the summary.</p>
      </div>
    );
  }

  const d: SummaryData | null = raw ?? null;
  const t = d?.traffic;
  const pt = d?.prev_traffic;

  const Skeleton = () => (
    <div className="h-4 bg-surface-container-high rounded animate-pulse w-full" />
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
            <Star className="w-6 h-6 text-primary" />
            Full Summary
          </h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            Everything about your website in one view — traffic, campaigns, engagement & health
          </p>
        </div>
        <div className="flex items-center gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p.value
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Traffic KPIs ─────────────────────────────────────────────────── */}
      <Section title="Traffic Overview" icon={BarChart2}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard
            icon={Users} label="Visitors"
            value={isLoading ? "—" : (t?.visitors ?? 0).toLocaleString()}
            delta={isLoading ? undefined : pct(t?.visitors ?? 0, pt?.visitors ?? 0)}
          />
          <KpiCard
            icon={Eye} label="Pageviews"
            value={isLoading ? "—" : (t?.pageviews ?? 0).toLocaleString()}
            delta={isLoading ? undefined : pct(t?.pageviews ?? 0, pt?.pageviews ?? 0)}
            color="text-violet-400" bg="bg-violet-400/10"
          />
          <KpiCard
            icon={Zap} label="Sessions"
            value={isLoading ? "—" : (t?.sessions ?? 0).toLocaleString()}
            delta={isLoading ? undefined : pct(t?.sessions ?? 0, pt?.sessions ?? 0)}
            color="text-cyan-400" bg="bg-cyan-400/10"
          />
          <KpiCard
            icon={Clock} label="Avg Duration"
            value={isLoading ? "—" : fmtDuration(t?.avg_duration ?? 0)}
            delta={isLoading ? undefined : pct(t?.avg_duration ?? 0, pt?.avg_duration ?? 0)}
            color="text-amber-400" bg="bg-amber-400/10"
          />
          <KpiCard
            icon={TrendingDown} label="Bounce Rate"
            value={isLoading ? "—" : `${t?.bounce_rate ?? 0}%`}
            color="text-rose-400" bg="bg-rose-400/10"
          />
          <KpiCard
            icon={TrendingUp} label="Avg Pages"
            value={isLoading ? "—" : Number(t?.avg_pages ?? 0).toFixed(1)}
            color="text-emerald-400" bg="bg-emerald-400/10"
          />
        </div>
      </Section>

      {/* ── Trend Chart ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-on-surface">Visitors &amp; Sessions Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-52 bg-surface-container rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={d?.trend ?? []} margin={{ left: 0, right: 0 }}>
                <defs>
                  <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c0c1ff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#c0c1ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#464554" strokeOpacity={0.2} />
                <XAxis dataKey="date" tick={{ fill: "#c7c4d7", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#c7c4d7", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="visitors" stroke="#c0c1ff" fill="url(#gV)" strokeWidth={2} dot={false} name="Visitors" />
                <Area type="monotone" dataKey="sessions" stroke="#a78bfa" fill="url(#gS)" strokeWidth={2} dot={false} name="Sessions" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Top Pages + Countries + Referrers ────────────────────────────── */}
      <Section title="Content & Audience" icon={Globe}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Top pages */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-on-surface-variant uppercase tracking-widest">Top Pages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)
                : (d?.top_pages ?? []).map((p, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-on-surface truncate max-w-[160px]" title={p.url}>{p.url}</span>
                      <Badge variant="secondary" className="text-xs shrink-0">{Number(p.views).toLocaleString()}</Badge>
                    </div>
                  ))}
            </CardContent>
          </Card>

          {/* Top countries */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-on-surface-variant uppercase tracking-widest">Top Countries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)
                : (d?.top_countries ?? []).map((c, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-on-surface flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-on-surface-variant" />{c.country}
                      </span>
                      <Badge variant="secondary" className="text-xs">{Number(c.sessions).toLocaleString()}</Badge>
                    </div>
                  ))}
            </CardContent>
          </Card>

          {/* Top referrers */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-on-surface-variant uppercase tracking-widest">Top Referrers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)
                : (d?.top_referrers ?? []).map((r, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-on-surface truncate max-w-[160px]" title={r.referrer}>{r.referrer}</span>
                      <Badge variant="secondary" className="text-xs">{Number(r.sessions).toLocaleString()}</Badge>
                    </div>
                  ))}
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* ── Devices + Campaigns + Engagement ─────────────────────────────── */}
      <Section title="Channels & Engagement" icon={Megaphone}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Device pie */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-on-surface-variant uppercase tracking-widest">Device Split</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              {isLoading ? (
                <div className="h-40 bg-surface-container rounded animate-pulse w-full" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={d?.devices ?? []}
                        dataKey="sessions"
                        nameKey="device_type"
                        cx="50%" cy="50%"
                        innerRadius={35} outerRadius={60}
                        paddingAngle={3}
                      >
                        {(d?.devices ?? []).map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {(d?.devices ?? []).map((dv, i) => (
                      <span key={i} className="flex items-center gap-1 text-xs text-on-surface-variant">
                        <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <DeviceIcon type={dv.device_type} />
                        {dv.device_type}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Top campaigns */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-on-surface-variant uppercase tracking-widest">Top Campaigns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
                : (d?.top_campaigns ?? []).length === 0
                ? <p className="text-xs text-on-surface-variant py-2">No UTM campaigns detected yet.</p>
                : (d?.top_campaigns ?? []).map((c, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-on-surface truncate">{c.source}</span>
                        <span className="text-xs text-on-surface-variant truncate">{c.campaign}</span>
                      </div>
                      <div className="flex flex-col items-end shrink-0 gap-0.5">
                        <Badge variant="secondary" className="text-xs">{Number(c.sessions).toLocaleString()}</Badge>
                        <span className="text-xs text-on-surface-variant">{fmtDuration(c.avg_duration)}</span>
                      </div>
                    </div>
                  ))}
            </CardContent>
          </Card>

          {/* Engagement snapshot */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-on-surface-variant uppercase tracking-widest">Engagement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-on-surface"><Flame className="w-3.5 h-3.5 text-amber-400" />Engaged visitors</span>
                    <Badge className="text-xs bg-amber-400/20 text-amber-300 border-amber-400/30">
                      {(d?.engaged_count ?? 0).toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-on-surface">Avg pages/session</span>
                    <span className="text-sm font-bold text-on-surface">{Number(t?.avg_pages ?? 0).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-on-surface">Avg session duration</span>
                    <span className="text-sm font-bold text-on-surface">{fmtDuration(t?.avg_duration ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-on-surface">Bounce rate</span>
                    <span className={`text-sm font-bold ${Number(t?.bounce_rate ?? 0) > 60 ? "text-rose-400" : "text-emerald-400"}`}>
                      {t?.bounce_rate ?? 0}%
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* ── UX Score + Custom Events ──────────────────────────────────────── */}
      <Section title="Website Health" icon={AlertCircle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* UX score */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-on-surface-variant uppercase tracking-widest">UX Happiness Score</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-28 bg-surface-container rounded animate-pulse" />
              ) : d?.ux_score ? (
                <div className="flex items-center gap-6">
                  <UxScoreGauge score={d.ux_score.score} />
                  <div className="space-y-2 flex-1">
                    {Object.entries(d.ux_score.breakdown ?? {}).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-xs">
                        <span className="text-on-surface-variant capitalize">{k.replace(/_/g, " ")}</span>
                        <span className="font-semibold text-on-surface">{String(v)}</span>
                      </div>
                    ))}
                    <p className="text-xs text-on-surface-variant">
                      Last calculated: {d.ux_score.calculated_at ? formatDate(d.ux_score.calculated_at) : "—"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant py-4">
                  No UX score yet. It will appear after the AI analysis runs.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top custom events */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-on-surface-variant uppercase tracking-widest">Top Custom Events</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-4 bg-surface-container-high rounded animate-pulse mb-2" />)
              ) : (d?.custom_events ?? []).length === 0 ? (
                <p className="text-xs text-on-surface-variant py-2">
                  No custom events tracked yet. Use <code className="bg-surface-container px-1 rounded">window.EYE.track()</code> to track them.
                </p>
              ) : (
                <div className="space-y-2">
                  {(d?.custom_events ?? []).map((e, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex-1 bg-outline-variant/20 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.round(
                              (Number(e.occurrences) /
                                Math.max(...(d?.custom_events ?? []).map((x) => Number(x.occurrences)), 1)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-on-surface w-32 shrink-0 truncate">{e.name}</span>
                      <Badge variant="secondary" className="text-xs shrink-0">{Number(e.occurrences).toLocaleString()}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Section>
    </div>
  );
}

export default function SummaryPage() {
  return <Content />;
}
