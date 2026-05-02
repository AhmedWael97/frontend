"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Flame, Users, RotateCcw, Clock, Globe } from "lucide-react";
import { formatDate } from "@/lib/utils";

type EngagedVisitor = {
  visitor_id: string;
  score: number;
  total_sessions: number;
  avg_duration: number;
  avg_pages: number;
  total_clicks: number;
  max_scroll: number;
  last_seen: string;
  first_seen: string;
  country: string;
  device_type: string;
  browser: string;
  company: string | null;
};

function ScoreBadge({ score }: { score: number }) {
  let cls = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (score < 60) cls = "bg-yellow-400/20 text-yellow-300 border-yellow-400/30";
  if (score < 30) cls = "bg-rose-500/20 text-rose-400 border-rose-500/30";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${cls}`}>
      <Flame className="w-3 h-3" />
      {score}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  let barCls = "bg-emerald-400";
  if (score < 60) barCls = "bg-yellow-300";
  if (score < 30) barCls = "bg-rose-400";
  return (
    <div className="flex items-center gap-2 w-24">
      <div className="flex-1 h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barCls}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function fmtDuration(secs: number): string {
  const s = Number(secs) || 0;
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

const PERIODS = [
  { label: "7d", value: "7" },
  { label: "30d", value: "30" },
  { label: "90d", value: "90" },
];

function Content() {
  const { selectedDomainId } = useAuthStore();
  const [days, setDays] = useState("30");
  const [page, setPage] = useState(1);
  const [minScore, setMinScore] = useState(0);

  const start = new Date(Date.now() - Number(days) * 86400000).toISOString().slice(0, 10);
  const end = new Date().toISOString().slice(0, 10);

  const { data, isLoading } = useQuery({
    queryKey: ["engaged-visitors", selectedDomainId, days, page],
    queryFn: () =>
      analyticsApi.engagedVisitors(selectedDomainId!, { start, end, page }).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  if (!selectedDomainId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-on-surface-variant">Select a domain to view engaged visitors.</p>
      </div>
    );
  }

  const visitors: EngagedVisitor[] = (data?.data ?? []).filter(
    (v: EngagedVisitor) => v.score >= minScore
  );
  const total: number = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 50);

  const topVisitor = visitors[0];

  const headers = [
    { label: "Score", width: "w-24" },
    { label: "Visitor", width: "" },
    { label: "Sessions", width: "w-20" },
    { label: "Avg Duration", width: "w-28" },
    { label: "Avg Pages", width: "w-24" },
    { label: "Clicks", width: "w-20" },
    { label: "Scroll", width: "w-24" },
    { label: "Country", width: "w-28" },
    { label: "Last Seen", width: "w-32" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Engaged Visitors</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            Visitors ranked by engagement score — duration, pages, clicks, scroll depth & return visits
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs text-on-surface-variant flex items-center gap-2">
            Min score
            <input
              type="range" min={0} max={80} step={10} value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="accent-primary w-20"
            />
            <span className="w-6 text-on-surface font-semibold">{minScore}</span>
          </label>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => { setDays(p.value); setPage(1); }}
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

      {/* Score explanation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><Users className="w-4 h-4 text-emerald-400" /></div>
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest">Total Ranked</p>
              <p className="text-xl font-black text-on-surface">{total.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Flame className="w-4 h-4 text-primary" /></div>
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest">Top Score</p>
              <p className="text-xl font-black text-on-surface">{topVisitor?.score ?? "—"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-400/10"><RotateCcw className="w-4 h-4 text-amber-400" /></div>
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest">Avg Return Visits</p>
              <p className="text-xl font-black text-on-surface">
                {visitors.length
                  ? (visitors.reduce((s, v) => s + Number(v.total_sessions), 0) / visitors.length).toFixed(1)
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score legend */}
      <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" /> Score ≥ 60 — Highly engaged</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-300 inline-block" /> Score 30–59 — Moderately engaged</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-400 inline-block" /> Score &lt; 30 — Low engagement</span>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-on-surface">
            Visitor Engagement Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  {headers.map(({ label, width }) => (
                    <th
                      key={label}
                      className={`${width} px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-on-surface-variant text-left`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-outline-variant/10">
                        {headers.map((_, j) => (
                          <td key={j} className="px-3 py-2.5">
                            <div className="h-4 bg-surface-container-high rounded animate-pulse w-16" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : visitors.map((v) => (
                      <tr key={v.visitor_id} className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <ScoreBadge score={v.score} />
                            <ScoreBar score={v.score} />
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-xs text-primary">{v.visitor_id.slice(0, 12)}…</span>
                            {v.company && (
                              <Badge variant="outline" className="text-xs w-fit">{v.company}</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge variant="secondary">{Number(v.total_sessions)}</Badge>
                        </td>
                        <td className="px-3 py-2.5 text-on-surface">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-on-surface-variant" />
                            {fmtDuration(v.avg_duration)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-on-surface">{Number(v.avg_pages).toFixed(1)}</td>
                        <td className="px-3 py-2.5 text-on-surface">{Number(v.total_clicks).toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-on-surface">{Number(v.max_scroll)}%</td>
                        <td className="px-3 py-2.5">
                          <span className="flex items-center gap-1 text-on-surface-variant text-xs">
                            <Globe className="w-3 h-3" />{v.country || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-on-surface-variant text-xs">
                          {v.last_seen ? formatDate(v.last_seen) : "—"}
                        </td>
                      </tr>
                    ))}
                {!isLoading && visitors.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-on-surface-variant text-sm">
                      No visitors found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/20">
              <p className="text-xs text-on-surface-variant">
                Page {page} of {totalPages} · {total.toLocaleString()} visitors
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-sm bg-surface-container text-on-surface-variant disabled:opacity-40 hover:text-on-surface transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm bg-surface-container text-on-surface-variant disabled:opacity-40 hover:text-on-surface transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function EngagedVisitorsPage() {
  return <Content />;
}
