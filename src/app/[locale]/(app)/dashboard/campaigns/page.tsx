"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend,
} from "recharts";
import {
  TrendingUp,
  MousePointerClick,
  Users,
  Link2,
  Search as SearchIcon,
  ArrowUpDown,
  Globe,
  Mail,
  Sparkles,
  Bot,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────
const TOOLTIP_STYLE = {
  background: "#171f33",
  border: "1px solid #464554",
  borderRadius: 8,
  color: "#dae2fd",
  fontSize: 12,
};
const COLORS = ["#c0c1ff", "#a78bfa", "#67e8f9", "#86efac", "#fcd34d"];

// ── Types ────────────────────────────────────────────────────────────────────
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
type SourceRow = { source: string; medium?: string; sessions: number; visitors: number };
type TrendRow  = { date: string; source: string; sessions: number };

// ── Source visual catalog ────────────────────────────────────────────────────
// Each source has a friendly emoji marker and a tone class. We use emoji rather
// than bundling brand SVGs to keep the tracker/page weight down — and emoji
// render well across themes and locales.
const SOURCE_META: Record<string, { mark: string; tone: string }> = {
  "(direct)":     { mark: "↗",  tone: "text-on-surface-variant" },
  "Google":       { mark: "🔎", tone: "text-blue-400" },
  "Gmail":        { mark: "✉️", tone: "text-rose-400" },
  "Bing":         { mark: "🔎", tone: "text-emerald-400" },
  "DuckDuckGo":   { mark: "🦆", tone: "text-amber-400" },
  "Yahoo":        { mark: "🔎", tone: "text-purple-400" },
  "Yahoo Mail":   { mark: "✉️", tone: "text-purple-400" },
  "Yandex":       { mark: "🔎", tone: "text-rose-400" },
  "Baidu":        { mark: "🔎", tone: "text-rose-400" },
  "Outlook":      { mark: "✉️", tone: "text-sky-400" },
  "ProtonMail":   { mark: "✉️", tone: "text-violet-400" },
  "Other search": { mark: "🔎", tone: "text-on-surface-variant" },

  "Facebook":     { mark: "📘", tone: "text-blue-500" },
  "Messenger":    { mark: "💬", tone: "text-blue-400" },
  "Instagram":    { mark: "📸", tone: "text-pink-400" },
  "X (Twitter)":  { mark: "🐦", tone: "text-sky-400" },
  "Threads":      { mark: "🧵", tone: "text-on-surface" },
  "LinkedIn":     { mark: "💼", tone: "text-sky-500" },
  "YouTube":      { mark: "▶️", tone: "text-rose-500" },
  "TikTok":       { mark: "🎵", tone: "text-cyan-400" },
  "Reddit":       { mark: "👾", tone: "text-orange-400" },
  "Pinterest":    { mark: "📌", tone: "text-rose-400" },
  "Snapchat":     { mark: "👻", tone: "text-yellow-400" },
  "WhatsApp":     { mark: "💚", tone: "text-emerald-400" },
  "Telegram":     { mark: "✈️", tone: "text-sky-400" },
  "Discord":      { mark: "🎮", tone: "text-indigo-400" },
  "VKontakte":    { mark: "Vk", tone: "text-blue-400" },

  "GitHub":          { mark: "🐙", tone: "text-on-surface" },
  "Medium":          { mark: "M",  tone: "text-on-surface" },
  "Quora":           { mark: "Q",  tone: "text-rose-400" },
  "Stack Overflow":  { mark: "⚡", tone: "text-amber-400" },
  "Product Hunt":    { mark: "🐈", tone: "text-orange-400" },
  "Hacker News":     { mark: "Y",  tone: "text-orange-400" },
  "Substack":        { mark: "S",  tone: "text-orange-400" },

  "ChatGPT":     { mark: "✨", tone: "text-emerald-400" },
  "Claude":      { mark: "✨", tone: "text-amber-400" },
  "Perplexity":  { mark: "✨", tone: "text-sky-400" },
  "Gemini":      { mark: "✨", tone: "text-blue-400" },
};
function sourceMeta(name: string) {
  if (SOURCE_META[name]) return SOURCE_META[name];
  // Unknown source → bare domain. Use globe + neutral tone.
  return { mark: "🌐", tone: "text-on-surface-variant" };
}

// ── Medium visual ─────────────────────────────────────────────────────────────
const MEDIUM_META: Record<string, { icon: React.ReactNode; tone: string; bg: string; border: string }> = {
  organic:  { icon: <SearchIcon className="w-3 h-3" />,        tone: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/25" },
  social:   { icon: <Users className="w-3 h-3" />,             tone: "text-sky-400",     bg: "bg-sky-500/15",     border: "border-sky-500/25" },
  email:    { icon: <Mail className="w-3 h-3" />,              tone: "text-rose-400",    bg: "bg-rose-500/15",    border: "border-rose-500/25" },
  referral: { icon: <Link2 className="w-3 h-3" />,             tone: "text-amber-400",   bg: "bg-amber-500/15",   border: "border-amber-500/25" },
  ai:       { icon: <Bot className="w-3 h-3" />,               tone: "text-violet-400",  bg: "bg-violet-500/15",  border: "border-violet-500/25" },
  campaign: { icon: <Sparkles className="w-3 h-3" />,          tone: "text-primary",     bg: "bg-primary/15",     border: "border-primary/25" },
  "(none)": { icon: <Globe className="w-3 h-3" />,             tone: "text-on-surface-variant", bg: "bg-surface-container", border: "border-outline-variant/30" },
};
function mediumMeta(name: string) {
  return MEDIUM_META[name] ?? { icon: <Globe className="w-3 h-3" />, tone: "text-on-surface-variant", bg: "bg-surface-container", border: "border-outline-variant/30" };
}

// ── Formatters ───────────────────────────────────────────────────────────────
function fmtDuration(secs: number): string {
  const s = Number(secs) || 0;
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}
function compactNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

// ── Pieces ───────────────────────────────────────────────────────────────────
function SourceTag({ name }: { name: string }) {
  const meta = sourceMeta(name);
  return (
    <span className="inline-flex items-center gap-1.5 max-w-full">
      <span className={`shrink-0 w-5 h-5 rounded-md bg-surface-container flex items-center justify-center text-xs ${meta.tone}`} aria-hidden>
        {meta.mark}
      </span>
      <span className="text-sm font-semibold text-on-surface truncate" title={name}>{name}</span>
    </span>
  );
}

function MediumBadge({ name }: { name: string }) {
  const meta = mediumMeta(name);
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${meta.bg} ${meta.tone} ${meta.border}`}>
      {meta.icon}
      {name}
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-black text-on-surface mt-0.5 tabular-nums">
            {typeof value === "number" ? compactNumber(value) : value}
          </p>
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

const MEDIUM_FILTERS = ["all", "organic", "social", "email", "referral", "ai", "campaign", "(none)"] as const;
type MediumFilter = typeof MEDIUM_FILTERS[number];

// ── Page ─────────────────────────────────────────────────────────────────────
function Content() {
  const { selectedDomainId } = useAuthStore();
  const locale = useLocale();
  const [days, setDays] = useState("30");
  const [goalFilter, setGoalFilter] = useState("");
  const [sortCol, setSortCol] = useState<keyof CampaignRow>("sessions");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [query, setQuery] = useState("");
  const [mediumFilter, setMediumFilter] = useState<MediumFilter>("all");

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
  const topSources: SourceRow[]  = data?.top_sources ?? [];
  const rawTrend:   TrendRow[]   = data?.trend ?? [];

  // Trend pivoted by date
  const trendByDate: Record<string, Record<string, number | string>> = {};
  for (const row of rawTrend) {
    if (!trendByDate[row.date]) trendByDate[row.date] = { date: row.date };
    trendByDate[row.date][row.source] = Number(row.sessions);
  }
  const trendData = Object.values(trendByDate).sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );
  const trendSources = Array.from(new Set(rawTrend.map((r) => r.source))).slice(0, 5);

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = campaigns;
    if (mediumFilter !== "all") {
      list = list.filter((r) => (r.medium || "(none)") === mediumFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((r) =>
        r.source?.toLowerCase().includes(q) ||
        r.campaign?.toLowerCase().includes(q) ||
        r.medium?.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    sorted.sort((a, b) => {
      const av: number | string = typeof a[sortCol] === "number" ? Number(a[sortCol]) : String(a[sortCol]);
      const bv: number | string = typeof b[sortCol] === "number" ? Number(b[sortCol]) : String(b[sortCol]);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [campaigns, mediumFilter, query, sortCol, sortDir]);

  function toggleSort(col: keyof CampaignRow) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("desc"); }
  }

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const totalSessions = campaigns.reduce((s, r) => s + Number(r.sessions), 0);
  const totalVisitors = campaigns.reduce((s, r) => s + Number(r.visitors), 0);
  const avgBounce =
    campaigns.length
      ? campaigns.reduce((s, r) => s + Number(r.bounce_rate), 0) / campaigns.length
      : 0;

  // Per-medium share for the distribution row
  const mediumShare = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of campaigns) {
      const k = r.medium || "(none)";
      map[k] = (map[k] ?? 0) + Number(r.sessions);
    }
    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(map)
      .map(([medium, sessions]) => ({ medium, sessions, pct: (sessions / total) * 100 }))
      .sort((a, b) => b.sessions - a.sessions);
  }, [campaigns]);

  // Filter counts for the chip row
  const mediumCounts: Record<MediumFilter, number> = useMemo(() => {
    const counts: Record<MediumFilter, number> = {
      all: campaigns.length, organic: 0, social: 0, email: 0, referral: 0, ai: 0, campaign: 0, "(none)": 0,
    };
    for (const r of campaigns) {
      const k = (r.medium || "(none)") as MediumFilter;
      if (counts[k] !== undefined) counts[k]++;
    }
    return counts;
  }, [campaigns]);

  const thCls = "px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-on-surface-variant text-left cursor-pointer select-none hover:text-on-surface transition-colors";
  const tdCls = "px-3 py-2.5 text-sm text-on-surface";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Campaigns</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            Where your visitors really come from — UTM tags, plus auto-detected social & search referrers.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={`/${locale}/tools/utm-builder`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:border-primary/40 transition-colors"
          >
            <Link2 className="w-3.5 h-3.5" />
            Build UTM Link
          </a>
          <Input
            className="px-3 py-1.5 w-40 h-9 text-sm"
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
        <KpiCard icon={TrendingUp} label="Sources" value={topSources.length} sub={`${campaigns.length} campaigns`} />
        <KpiCard icon={MousePointerClick} label="Avg Bounce Rate" value={`${avgBounce.toFixed(1)}%`} />
      </div>

      {/* Medium distribution */}
      {mediumShare.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Traffic mix by medium
            </p>
            <div className="flex h-3 rounded-full overflow-hidden bg-outline-variant/15 mb-2">
              {mediumShare.map((m) => {
                const meta = mediumMeta(m.medium);
                return (
                  <div
                    key={m.medium}
                    className={`${meta.bg} ${meta.tone.replace("text-", "bg-")}`}
                    style={{ width: `${m.pct}%` }}
                    title={`${m.medium}: ${m.sessions.toLocaleString()} sessions (${m.pct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant">
              {mediumShare.map((m) => (
                <span key={m.medium} className="inline-flex items-center gap-1.5">
                  <MediumBadge name={m.medium} />
                  <span className="tabular-nums font-semibold text-on-surface">{m.pct.toFixed(0)}%</span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
              <ResponsiveContainer width="100%" height={Math.max(220, topSources.length * 26)}>
                <BarChart data={topSources} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#464554" strokeOpacity={0.2} horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="source"
                    tick={{ fill: "#c7c4d7", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />
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
        <CardHeader className="pb-3 gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-sm font-semibold text-on-surface flex items-center gap-2">
              All Campaigns
              <Badge variant="secondary">{filtered.length}</Badge>
            </CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:ms-auto w-full sm:w-auto">
              <div className="relative w-full sm:w-56">
                <SearchIcon className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter source / campaign…"
                  className="ltr:pl-9 rtl:pr-9 h-9 text-sm"
                />
              </div>
              <div className="relative">
                <ArrowUpDown className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant pointer-events-none" />
                <select
                  value={sortCol}
                  onChange={(e) => setSortCol(e.target.value as keyof CampaignRow)}
                  className="h-9 ltr:pl-9 rtl:pr-9 ltr:pr-8 rtl:pl-8 rounded-lg border border-outline-variant/40 bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="sessions">Sort: Sessions</option>
                  <option value="visitors">Sort: Visitors</option>
                  <option value="avg_duration">Sort: Duration</option>
                  <option value="bounce_rate">Sort: Bounce %</option>
                  {goalFilter && <option value="conversions">Sort: Conversions</option>}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {MEDIUM_FILTERS.map((k) => {
              const count = mediumCounts[k];
              if (k !== "all" && count === 0) return null;
              const active = mediumFilter === k;
              const meta = k === "all"
                ? null
                : mediumMeta(k);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setMediumFilter(k)}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border transition-colors
                    ${active
                      ? meta
                        ? `${meta.bg} ${meta.tone} ${meta.border}`
                        : "border-primary/40 bg-primary/10 text-on-surface"
                      : "border-outline-variant/30 text-on-surface-variant hover:border-outline-variant/60"}`}
                >
                  {meta?.icon}
                  {k === "all" ? "All" : k}
                  <span className="tabular-nums opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  {[
                    { key: "source",       label: "Source" },
                    { key: "medium",       label: "Medium" },
                    { key: "campaign",     label: "Campaign" },
                    { key: "sessions",     label: "Sessions" },
                    { key: "visitors",     label: "Visitors" },
                    { key: "avg_duration", label: "Avg Duration" },
                    { key: "avg_pages",    label: "Avg Pages" },
                    { key: "bounce_rate",  label: "Bounce %" },
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
                  : filtered.map((row, i) => (
                      <tr key={i} className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                        <td className={tdCls + " max-w-[180px]"}>
                          <SourceTag name={row.source} />
                        </td>
                        <td className={tdCls}>
                          <MediumBadge name={row.medium || "(none)"} />
                        </td>
                        <td className={tdCls + " max-w-[180px] truncate text-on-surface-variant"} title={row.campaign}>
                          {row.campaign === "(none)" ? "—" : row.campaign}
                        </td>
                        <td className={tdCls + " font-semibold tabular-nums"}>{Number(row.sessions).toLocaleString()}</td>
                        <td className={tdCls + " tabular-nums"}>{Number(row.visitors).toLocaleString()}</td>
                        <td className={tdCls + " tabular-nums"}>{fmtDuration(Number(row.avg_duration))}</td>
                        <td className={tdCls + " tabular-nums"}>{Number(row.avg_pages).toFixed(1)}</td>
                        <td className={tdCls + " tabular-nums"}>
                          <span className={Number(row.bounce_rate) > 60 ? "text-rose-400" : Number(row.bounce_rate) > 40 ? "text-amber-400" : "text-emerald-400"}>
                            {Number(row.bounce_rate).toFixed(1)}%
                          </span>
                        </td>
                        {goalFilter && (
                          <td className={tdCls + " font-semibold text-primary tabular-nums"}>
                            {Number(row.conversions).toLocaleString()}
                          </td>
                        )}
                      </tr>
                    ))}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={goalFilter ? 9 : 8} className="px-3 py-10 text-center text-on-surface-variant text-sm">
                      No campaigns match the current filters.
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
