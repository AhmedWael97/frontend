"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Users } from "lucide-react";

type CohortRow = { cohort: string; size: number; retention: number[] };
type Period = "week" | "month";

// Faint → strong fill scaled by retention %. Returns an rgba primary tint.
function cellStyle(pct: number): React.CSSProperties {
  if (pct <= 0) return { background: "transparent", color: "var(--on-surface-variant, #9ca3af)" };
  const alpha = Math.min(1, 0.08 + (pct / 100) * 0.92);
  return {
    background: `rgba(192, 193, 255, ${alpha})`, // primary tint
    color: alpha > 0.55 ? "#0b1020" : "inherit",
  };
}

function Content() {
  const { selectedDomainId } = useAuthStore();
  const [period, setPeriod] = useState<Period>("week");
  const cohorts = period === "week" ? 8 : 6;

  const { data, isLoading } = useQuery({
    queryKey: ["retention", selectedDomainId, period],
    queryFn: () =>
      analyticsApi.retention(selectedDomainId!, { period, cohorts }).then((r) => r.data?.data ?? r.data),
    enabled: !!selectedDomainId,
  });

  if (!selectedDomainId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-on-surface-variant">Select a domain to view retention.</p>
      </div>
    );
  }

  const rows: CohortRow[] = data?.cohorts ?? [];
  const maxOffset = rows.reduce((m, r) => Math.max(m, r.retention.length - 1), 0);
  const offsets = Array.from({ length: maxOffset + 1 }, (_, i) => i);
  const periodLabel = period === "week" ? "Week" : "Month";

  // Average retention per offset (across cohorts that have that offset).
  const avgByOffset = offsets.map((o) => {
    const vals = rows.map((r) => r.retention[o]).filter((v) => v !== undefined);
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + Number(b), 0) / vals.length;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Retention</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            Of visitors first seen in each {periodLabel.toLowerCase()}, how many came back later.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["week", "month"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                period === p ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {p}ly
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-on-surface flex items-center gap-2">
            <Users className="w-4 h-4" /> Cohort retention
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 bg-surface-container rounded animate-pulse" />
          ) : rows.length === 0 ? (
            <p className="text-on-surface-variant text-sm py-10 text-center">Not enough data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="text-sm border-separate border-spacing-1">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                      Cohort
                    </th>
                    <th className="px-2 py-1 text-right text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                      Size
                    </th>
                    {offsets.map((o) => (
                      <th key={o} className="px-2 py-1 text-center text-xs font-semibold text-on-surface-variant w-16">
                        {periodLabel} {o}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.cohort}>
                      <td className="px-2 py-1 whitespace-nowrap text-on-surface font-medium text-xs tabular-nums">
                        {r.cohort}
                      </td>
                      <td className="px-2 py-1 text-right text-on-surface-variant tabular-nums text-xs">
                        {r.size.toLocaleString()}
                      </td>
                      {offsets.map((o) => {
                        const pct = r.retention[o];
                        return (
                          <td
                            key={o}
                            className="px-2 py-1 text-center rounded-md tabular-nums text-xs"
                            style={pct === undefined ? { background: "transparent" } : cellStyle(Number(pct))}
                            title={pct === undefined ? "" : `${periodLabel} ${o}: ${pct}% of ${r.size}`}
                          >
                            {pct === undefined ? "" : `${pct}%`}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Average row */}
                  <tr>
                    <td className="px-2 py-1 text-xs font-bold text-on-surface uppercase tracking-widest">Average</td>
                    <td className="px-2 py-1" />
                    {avgByOffset.map((v, o) => (
                      <td
                        key={o}
                        className="px-2 py-1 text-center rounded-md tabular-nums text-xs font-semibold"
                        style={v === null ? { background: "transparent" } : cellStyle(v)}
                      >
                        {v === null ? "" : `${v.toFixed(0)}%`}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RetentionPage() {
  return <Content />;
}
