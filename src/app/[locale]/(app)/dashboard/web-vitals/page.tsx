"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uxApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Gauge, CheckCircle, AlertTriangle, XCircle, TrendingUp, TrendingDown } from "lucide-react";

type PageVitals = {
  url: string;
  avg_lcp: number;
  avg_cls: number;
  avg_inp: number;
  good: number;
  needs_improvement: number;
  poor: number;
  total: number;
  rating: "good" | "needs-improvement" | "poor";
};

function lcpLabel(ms: number) {
  if (ms < 2500) return "good";
  if (ms < 4000) return "needs-improvement";
  return "poor";
}
function clsLabel(v: number) {
  if (v < 0.1) return "good";
  if (v < 0.25) return "needs-improvement";
  return "poor";
}
function inpLabel(ms: number) {
  if (ms < 200) return "good";
  if (ms < 500) return "needs-improvement";
  return "poor";
}

const RATING_COLORS: Record<string, string> = {
  good: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "needs-improvement": "bg-yellow-400/15 text-yellow-300 border-yellow-400/20",
  poor: "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

const RATING_ICONS: Record<string, React.ReactNode> = {
  good: <CheckCircle className="w-3.5 h-3.5" />,
  "needs-improvement": <AlertTriangle className="w-3.5 h-3.5" />,
  poor: <XCircle className="w-3.5 h-3.5" />,
};

function RatingBadge({ rating }: { rating: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${RATING_COLORS[rating] ?? RATING_COLORS.poor}`}
    >
      {RATING_ICONS[rating]}
      {rating === "needs-improvement" ? "Needs work" : rating.charAt(0).toUpperCase() + rating.slice(1)}
    </span>
  );
}

function MetricCell({ value, label, rating }: { value: string; label: string; rating: string }) {
  const dot: Record<string, string> = {
    good: "bg-emerald-500",
    "needs-improvement": "bg-yellow-400",
    poor: "bg-rose-500",
  };
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1.5">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot[rating] ?? dot.poor}`} />
        <span className="text-sm font-semibold text-on-surface">{value}</span>
      </div>
      <p className="text-[10px] text-on-surface-variant mt-0.5">{label}</p>
    </div>
  );
}

function shortUrl(url: string) {
  try {
    const u = new URL(url);
    return u.pathname + u.search || "/";
  } catch {
    return url;
  }
}

function Content() {
  const { selectedDomainId } = useAuthStore();

  const { data, isLoading } = useQuery<PageVitals[]>({
    queryKey: ["web-vitals", selectedDomainId],
    queryFn: () => uxApi.webVitals(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  if (!selectedDomainId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-on-surface-variant">Select a domain to view Web Vitals.</p>
      </div>
    );
  }

  const pages = data ?? [];

  // Summary counts
  const goodCount = pages.filter((p) => p.rating === "good").length;
  const niCount = pages.filter((p) => p.rating === "needs-improvement").length;
  const poorCount = pages.filter((p) => p.rating === "poor").length;

  // Best page: good rating + lowest avg_lcp; worst page: poor rating + highest avg_lcp
  const goodPages = pages.filter((p) => p.rating === "good").sort((a, b) => a.avg_lcp - b.avg_lcp);
  const poorPages = pages.filter((p) => p.rating === "poor").sort((a, b) => b.avg_lcp - a.avg_lcp);
  const bestPage = goodPages[0] ?? null;
  const worstPage = poorPages[0] ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
          <Gauge className="w-6 h-6 text-primary" />
          Web Vitals
        </h1>
        <p className="text-on-surface-variant text-sm mt-0.5">
          Core Web Vitals per page — LCP, CLS, and INP measured from real visitors.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-on-surface-variant">
        <span><strong className="text-on-surface">LCP</strong> — Largest Contentful Paint (load speed, good &lt; 2.5 s)</span>
        <span><strong className="text-on-surface">CLS</strong> — Cumulative Layout Shift (visual stability, good &lt; 0.1)</span>
        <span><strong className="text-on-surface">INP</strong> — Interaction to Next Paint (responsiveness, good &lt; 200 ms)</span>
      </div>

      {!isLoading && pages.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <Card className="flex-1 min-w-[120px]">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-black text-emerald-400">{goodCount}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Good pages</p>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[120px]">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-black text-yellow-300">{niCount}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Needs work</p>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[120px]">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-black text-rose-400">{poorCount}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Poor pages</p>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center h-40">
          <p className="text-on-surface-variant text-sm">Loading…</p>
        </div>
      )}

      {!isLoading && pages.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Gauge className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-3" />
            <p className="text-on-surface-variant text-sm">No Web Vitals data yet.</p>
            <p className="text-on-surface-variant/60 text-xs mt-1">
              Vitals are captured automatically when visitors leave a page.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && pages.length > 0 && (
        <>
          {/* ── Best & Worst page highlight ──────────────────────────────── */}
          {(bestPage || worstPage) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bestPage && (
                <Card className="border-emerald-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      Best Performing Page
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <p className="text-sm font-semibold text-emerald-400 truncate font-mono" title={bestPage.url}>
                      {shortUrl(bestPage.url)}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      LCP {bestPage.avg_lcp >= 1000 ? `${(bestPage.avg_lcp / 1000).toFixed(1)}s` : `${bestPage.avg_lcp}ms`}
                      {" · "}Good rating · {bestPage.total.toLocaleString()} samples
                    </p>
                  </CardContent>
                </Card>
              )}
              {worstPage && (
                <Card className="border-rose-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                      Needs Most Attention
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <p className="text-sm font-semibold text-rose-400 truncate font-mono" title={worstPage.url}>
                      {shortUrl(worstPage.url)}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      LCP {worstPage.avg_lcp >= 1000 ? `${(worstPage.avg_lcp / 1000).toFixed(1)}s` : `${worstPage.avg_lcp}ms`}
                      {" · "}Poor rating · consider optimizing images and third-party scripts
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ── Per-page breakdown ──────────────────────────────────────── */}
          <div className="space-y-3">
            {pages.map((page) => (
            <Card key={page.url}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-semibold truncate" title={page.url}>
                      {shortUrl(page.url)}
                    </CardTitle>
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-primary/70 hover:text-primary truncate block max-w-xs"
                    >
                      {page.url}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <RatingBadge rating={page.rating} />
                    <span className="text-xs text-on-surface-variant">
                      {page.total.toLocaleString()} samples
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-4 border border-outline-variant/20 rounded-lg p-3">
                  <MetricCell
                    value={page.avg_lcp >= 1000 ? `${(page.avg_lcp / 1000).toFixed(1)}s` : `${page.avg_lcp}ms`}
                    label="LCP"
                    rating={lcpLabel(page.avg_lcp)}
                  />
                  <MetricCell
                    value={String(page.avg_cls)}
                    label="CLS"
                    rating={clsLabel(page.avg_cls)}
                  />
                  <MetricCell
                    value={`${page.avg_inp}ms`}
                    label="INP"
                    rating={inpLabel(page.avg_inp)}
                  />
                </div>
                {/* Distribution bar */}
                {page.total > 0 && (
                  <div className="mt-3">
                    <div className="flex rounded-full overflow-hidden h-1.5">
                      <div
                        className="bg-emerald-500 transition-all"
                        style={{ width: `${(page.good / page.total) * 100}%` }}
                        title={`Good: ${page.good}`}
                      />
                      <div
                        className="bg-yellow-400 transition-all"
                        style={{ width: `${(page.needs_improvement / page.total) * 100}%` }}
                        title={`Needs work: ${page.needs_improvement}`}
                      />
                      <div
                        className="bg-rose-500 transition-all"
                        style={{ width: `${(page.poor / page.total) * 100}%` }}
                        title={`Poor: ${page.poor}`}
                      />
                    </div>
                    <div className="flex gap-3 mt-1 text-[10px] text-on-surface-variant">
                      <span className="text-emerald-400">{page.good} good</span>
                      <span className="text-yellow-300">{page.needs_improvement} needs work</span>
                      <span className="text-rose-400">{page.poor} poor</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        </>
      )}
    </div>
  );
}

export default function WebVitalsPage() {
  return <Content />;
}
