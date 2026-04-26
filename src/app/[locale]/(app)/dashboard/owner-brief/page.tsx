"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { uxApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Lightbulb, ShieldCheck, TriangleAlert, TrendingUp, Gauge, Bug, MousePointerClick } from "lucide-react";

type UxScoreResponse = {
  score: number | null;
  breakdown: Record<string, unknown> | null;
  calculated_at: string | null;
};

type UxIssue = {
  type: string;
  url: string;
  occurrences: number | string;
  affected_visitors: number | string;
};

type JsError = {
  message: string;
  occurrences: number | string;
  affected_visitors: number | string;
};

type ScrollDepthRow = {
  url: string;
  d25: number | string;
  d50: number | string;
  d75: number | string;
  d100: number | string;
  total: number | string;
};

type WebVitalsRow = {
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

type PriorityItem = {
  key: string;
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
  action: string;
};

function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function pct(value: number): string {
  return `${Math.round(value)}%`;
}

function scoreLabel(score: number): { text: string; tone: "good" | "warn" | "bad" } {
  if (score >= 80) return { text: "Strong", tone: "good" };
  if (score >= 60) return { text: "Needs optimization", tone: "warn" };
  return { text: "At risk", tone: "bad" };
}

function toneClasses(tone: "good" | "warn" | "bad"): string {
  if (tone === "good") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
  if (tone === "warn") return "bg-yellow-400/15 text-yellow-300 border-yellow-400/20";
  return "bg-rose-500/15 text-rose-400 border-rose-500/20";
}

function severityClasses(severity: "high" | "medium" | "low"): string {
  if (severity === "high") return "bg-rose-500/15 text-rose-400 border-rose-500/20";
  if (severity === "medium") return "bg-yellow-400/15 text-yellow-300 border-yellow-400/20";
  return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
}

function Content() {
  const { selectedDomainId } = useAuthStore();

  const scoreQuery = useQuery<UxScoreResponse>({
    queryKey: ["owner-brief-score", selectedDomainId],
    queryFn: () => uxApi.score(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const issuesQuery = useQuery<UxIssue[]>({
    queryKey: ["owner-brief-issues", selectedDomainId],
    queryFn: () => uxApi.issues(selectedDomainId!, { page: 1 }).then((r) => r.data?.data ?? []),
    enabled: !!selectedDomainId,
  });

  const errorsQuery = useQuery<JsError[]>({
    queryKey: ["owner-brief-errors", selectedDomainId],
    queryFn: () => uxApi.errors(selectedDomainId!).then((r) => r.data ?? []),
    enabled: !!selectedDomainId,
  });

  const scrollDepthQuery = useQuery<ScrollDepthRow[]>({
    queryKey: ["owner-brief-scroll", selectedDomainId],
    queryFn: () => uxApi.scrollDepth(selectedDomainId!).then((r) => r.data ?? []),
    enabled: !!selectedDomainId,
  });

  const webVitalsQuery = useQuery<WebVitalsRow[]>({
    queryKey: ["owner-brief-vitals", selectedDomainId],
    queryFn: () => uxApi.webVitals(selectedDomainId!).then((r) => r.data ?? []),
    enabled: !!selectedDomainId,
  });

  if (!selectedDomainId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-on-surface-variant">Select a domain to view the owner brief.</p>
      </div>
    );
  }

  const loading =
    scoreQuery.isLoading ||
    issuesQuery.isLoading ||
    errorsQuery.isLoading ||
    scrollDepthQuery.isLoading ||
    webVitalsQuery.isLoading;

  const score = asNumber(scoreQuery.data?.score);
  const scoreTone = scoreLabel(score);

  const issues = issuesQuery.data ?? [];
  const errors = errorsQuery.data ?? [];
  const scrollRows = scrollDepthQuery.data ?? [];
  const vitalsRows = webVitalsQuery.data ?? [];

  const deadClickEvents = issues
    .filter((i) => i.type === "dead_click")
    .reduce((sum, i) => sum + asNumber(i.occurrences), 0);

  const rageClickEvents = issues
    .filter((i) => i.type === "rage_click")
    .reduce((sum, i) => sum + asNumber(i.occurrences), 0);

  const jsErrorOccurrences = errors.reduce((sum, e) => sum + asNumber(e.occurrences), 0);
  const jsErrorUnique = errors.length;

  const poorVitalsPages = vitalsRows.filter((v) => v.rating === "poor").length;
  const needsWorkVitalsPages = vitalsRows.filter((v) => v.rating === "needs-improvement").length;
  const goodVitalsPages = vitalsRows.filter((v) => v.rating === "good").length;

  const avgLcp = vitalsRows.length
    ? vitalsRows.reduce((sum, v) => sum + asNumber(v.avg_lcp), 0) / vitalsRows.length
    : 0;
  const avgCls = vitalsRows.length
    ? vitalsRows.reduce((sum, v) => sum + asNumber(v.avg_cls), 0) / vitalsRows.length
    : 0;
  const avgInp = vitalsRows.length
    ? vitalsRows.reduce((sum, v) => sum + asNumber(v.avg_inp), 0) / vitalsRows.length
    : 0;

  const completionSamples = scrollRows
    .map((row) => {
      const total = asNumber(row.total);
      const d100 = asNumber(row.d100);
      if (total <= 0) return null;
      return Math.min(100, (d100 / total) * 100);
    })
    .filter((v): v is number => v !== null);

  const avgCompletion = completionSamples.length
    ? completionSamples.reduce((sum, v) => sum + v, 0) / completionSamples.length
    : 0;

  const priorities: PriorityItem[] = [];

  if (poorVitalsPages > 0 || avgLcp >= 4000 || avgInp >= 500 || avgCls >= 0.25) {
    priorities.push({
      key: "vitals",
      severity: "high",
      title: "Performance is hurting user experience",
      detail: `${poorVitalsPages} pages are rated poor in Web Vitals.`,
      action: "Prioritize LCP (images/server), INP (heavy JS handlers), and CLS (layout shifts) on top traffic pages.",
    });
  }

  if (deadClickEvents >= 20 || rageClickEvents >= 10) {
    priorities.push({
      key: "click-friction",
      severity: "high",
      title: "Click friction detected",
      detail: `${deadClickEvents.toLocaleString()} dead clicks and ${rageClickEvents.toLocaleString()} rage clicks were recorded.`,
      action: "Audit clickable-looking elements, z-index overlays, disabled buttons, and missing click handlers.",
    });
  }

  if (jsErrorOccurrences >= 20) {
    priorities.push({
      key: "errors",
      severity: "medium",
      title: "JavaScript reliability issues",
      detail: `${jsErrorOccurrences.toLocaleString()} JS error occurrences across ${jsErrorUnique.toLocaleString()} unique errors.`,
      action: "Fix the highest-frequency error first, then verify the affected page flow end-to-end.",
    });
  }

  if (avgCompletion > 0 && avgCompletion < 15) {
    priorities.push({
      key: "scroll",
      severity: "medium",
      title: "Low content completion",
      detail: `Average full-scroll completion is only ${pct(avgCompletion)}.`,
      action: "Move key calls-to-action higher, tighten content structure, and improve section headings.",
    });
  }

  if (priorities.length === 0) {
    priorities.push({
      key: "healthy",
      severity: "low",
      title: "Overall UX health looks stable",
      detail: "No major risk signal crossed the alert thresholds.",
      action: "Keep monitoring weekly and test core journeys on mobile after each release.",
    });
  }

  const topTips = [
    "Review owner brief weekly, not monthly, to catch regressions early.",
    "Treat top 3 pages by traffic as a quality budget: improve one metric per week.",
    "After each frontend deploy, test checkout/contact/login flows manually on mobile and desktop.",
    "Set a release gate: block deployment if poor Web Vitals pages increase week-over-week.",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Owner Brief</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            One-page conclusion of your website experience, risks, and next actions.
          </p>
        </div>
        <Badge className={`border ${toneClasses(scoreTone.tone)}`}>
          UX score {score.toFixed(0)} - {scoreTone.text}
        </Badge>
      </div>

      {loading && (
        <Card>
          <CardContent className="py-10 text-center text-on-surface-variant text-sm">Loading owner brief...</CardContent>
        </Card>
      )}

      {!loading && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Executive Conclusion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-on-surface-variant">
              <p>
                {scoreTone.tone === "good"
                  ? "Your website is performing well overall, but continuous tuning will protect conversion quality."
                  : scoreTone.tone === "warn"
                    ? "Your website is functional but losing some users from performance and interaction friction."
                    : "Your website experience is currently at risk and likely affecting conversion and trust."}
              </p>
              <p>
                Primary risks right now: poor Web Vitals pages ({poorVitalsPages}), dead clicks ({deadClickEvents.toLocaleString()}),
                and JS error volume ({jsErrorOccurrences.toLocaleString()}).
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <Card>
              <CardContent className="py-4">
                <p className="text-xs text-on-surface-variant">Web Vitals</p>
                <p className="text-2xl font-black text-on-surface mt-1">{goodVitalsPages}/{vitalsRows.length}</p>
                <p className="text-xs text-on-surface-variant mt-1">Pages rated good</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <p className="text-xs text-on-surface-variant">Dead Clicks</p>
                <p className="text-2xl font-black text-rose-400 mt-1">{deadClickEvents.toLocaleString()}</p>
                <p className="text-xs text-on-surface-variant mt-1">Interaction failures</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <p className="text-xs text-on-surface-variant">JS Errors</p>
                <p className="text-2xl font-black text-yellow-300 mt-1">{jsErrorOccurrences.toLocaleString()}</p>
                <p className="text-xs text-on-surface-variant mt-1">Runtime error events</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <p className="text-xs text-on-surface-variant">Scroll Completion</p>
                <p className="text-2xl font-black text-primary mt-1">{pct(avgCompletion)}</p>
                <p className="text-xs text-on-surface-variant mt-1">Avg 100% reach rate</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TriangleAlert className="w-4 h-4 text-primary" />
                Priority Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {priorities.map((item) => (
                <div key={item.key} className="rounded-lg border border-outline-variant/20 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-sm text-on-surface">{item.title}</p>
                    <Badge className={`border ${severityClasses(item.severity)}`}>{item.severity}</Badge>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">{item.detail}</p>
                  <p className="text-xs text-on-surface mt-2">Action: {item.action}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-primary" />
                  Performance Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-on-surface-variant">Average LCP: <span className="text-on-surface font-semibold">{(avgLcp / 1000).toFixed(2)}s</span></p>
                <p className="text-on-surface-variant">Average CLS: <span className="text-on-surface font-semibold">{avgCls.toFixed(3)}</span></p>
                <p className="text-on-surface-variant">Average INP: <span className="text-on-surface font-semibold">{Math.round(avgInp)}ms</span></p>
                <p className="text-on-surface-variant">Needs work pages: <span className="text-on-surface font-semibold">{needsWorkVitalsPages}</span></p>
                <p className="text-on-surface-variant">Poor pages: <span className="text-on-surface font-semibold">{poorVitalsPages}</span></p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  Tips and Tricks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-on-surface-variant">
                {topTips.map((tip, idx) => (
                  <p key={idx}>- {tip}</p>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <Card>
              <CardContent className="py-4">
                <p className="text-xs text-on-surface-variant flex items-center gap-1">
                  <MousePointerClick className="w-3.5 h-3.5" /> Click Friction
                </p>
                <p className="text-xl font-black text-on-surface mt-1">{(deadClickEvents + rageClickEvents).toLocaleString()}</p>
                <p className="text-xs text-on-surface-variant mt-1">Dead + rage click events</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <p className="text-xs text-on-surface-variant flex items-center gap-1">
                  <Bug className="w-3.5 h-3.5" /> Reliability
                </p>
                <p className="text-xl font-black text-on-surface mt-1">{jsErrorUnique.toLocaleString()}</p>
                <p className="text-xs text-on-surface-variant mt-1">Unique JS errors</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <p className="text-xs text-on-surface-variant flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Engagement Depth
                </p>
                <p className="text-xl font-black text-on-surface mt-1">{scrollRows.length.toLocaleString()}</p>
                <p className="text-xs text-on-surface-variant mt-1">Pages with scroll data</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

export default function OwnerBriefPage() {
  return <Content />;
}
