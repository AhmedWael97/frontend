"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { uxApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import {
  Gauge,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Search,
  ArrowUpDown,
  ListFilter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Zap,
  MoveVertical,
  Hand,
  Users,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
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

type RatingKey = "good" | "needs-improvement" | "poor";
type RatingFilter = "all" | RatingKey;
type VitalsSort = "rating" | "lcp" | "cls" | "inp" | "samples";

// ── Thresholds (Google Web Vitals) ──────────────────────────────────────────
const LCP_GOOD = 2500;
const LCP_OK   = 4000;
const CLS_GOOD = 0.1;
const CLS_OK   = 0.25;
const INP_GOOD = 200;
const INP_OK   = 500;

function lcpRating(v: number): RatingKey {
  if (v < LCP_GOOD) return "good";
  if (v < LCP_OK) return "needs-improvement";
  return "poor";
}
function clsRating(v: number): RatingKey {
  if (v < CLS_GOOD) return "good";
  if (v < CLS_OK) return "needs-improvement";
  return "poor";
}
function inpRating(v: number): RatingKey {
  if (v < INP_GOOD) return "good";
  if (v < INP_OK) return "needs-improvement";
  return "poor";
}

// ── Formatters ───────────────────────────────────────────────────────────────
function lcpFmt(v: number) {
  if (!v) return "—";
  return v >= 1000 ? `${(v / 1000).toFixed(2)}s` : `${Math.round(v)}ms`;
}
function inpFmt(v: number) {
  if (!v) return "—";
  return `${Math.round(v)}ms`;
}
function clsFmt(v: number) {
  if (v == null) return "—";
  return v.toFixed(3);
}
function shortUrl(url: string) {
  try {
    const u = new URL(url);
    const p = u.pathname + u.search;
    return p === "/" ? u.hostname : p || u.hostname;
  } catch {
    return url.length > 60 ? "…" + url.slice(-60) : url;
  }
}
function compactNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

// ── Rating tone ──────────────────────────────────────────────────────────────
const RATING_TONE: Record<RatingKey, { bg: string; text: string; border: string; dot: string; bar: string; stroke: string }> = {
  good: {
    bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25",
    dot: "bg-emerald-500", bar: "from-emerald-500 to-emerald-400", stroke: "stroke-emerald-400",
  },
  "needs-improvement": {
    bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/25",
    dot: "bg-amber-400", bar: "from-amber-500 to-amber-400", stroke: "stroke-amber-400",
  },
  poor: {
    bg: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/25",
    dot: "bg-rose-500", bar: "from-rose-500 to-rose-400", stroke: "stroke-rose-400",
  },
};
const RATING_ICON = {
  good: <CheckCircle className="w-3.5 h-3.5" />,
  "needs-improvement": <AlertTriangle className="w-3.5 h-3.5" />,
  poor: <XCircle className="w-3.5 h-3.5" />,
};
const RATING_LABEL = {
  good: "Good",
  "needs-improvement": "Needs work",
  poor: "Poor",
};

function RatingBadge({ rating }: { rating: RatingKey }) {
  const tone = RATING_TONE[rating];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${tone.bg} ${tone.text} ${tone.border}`}>
      {RATING_ICON[rating]}
      {RATING_LABEL[rating]}
    </span>
  );
}

// ── Circular gauge ──────────────────────────────────────────────────────────
function VitalsGauge({ score }: { score: number | null }) {
  const value = score ?? 0;
  const radius = 56;
  const c = 2 * Math.PI * radius;
  const offset = c - (value / 100) * c;
  const tone =
    value >= 85 ? "stroke-emerald-400" :
    value >= 70 ? "stroke-lime-400" :
    value >= 50 ? "stroke-amber-400" :
    "stroke-rose-400";

  return (
    <div className="relative w-32 h-32 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} className="stroke-outline-variant/20" strokeWidth="10" fill="none" />
        <circle
          cx="64" cy="64" r={radius}
          className={`${tone} transition-[stroke-dashoffset] duration-700`}
          strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-on-surface tabular-nums">
          {score === null ? "—" : value}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">/ 100</span>
      </div>
    </div>
  );
}

function SubScore({ label, value, hint }: { label: string; value: number; hint: string }) {
  const tone =
    value >= 85 ? "bg-emerald-400" :
    value >= 70 ? "bg-lime-400" :
    value >= 50 ? "bg-amber-400" :
    "bg-rose-400";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
          <p className="text-[10px] text-on-surface-variant/70">{hint}</p>
        </div>
        <span className="text-sm font-black text-on-surface tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-outline-variant/15 overflow-hidden">
        <div className={`h-full ${tone} transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// ── Metric overview card (LCP / CLS / INP across all pages) ──────────────────
function MetricCard({
  icon, name, code, value, rating, target, totals,
}: {
  icon: React.ReactNode; name: string; code: string; value: string; rating: RatingKey; target: string;
  totals: { good: number; ni: number; poor: number };
}) {
  const tone = RATING_TONE[rating];
  const total = totals.good + totals.ni + totals.poor || 1;
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl bg-surface-container ${tone.text}`}>{icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <p className="text-sm font-bold text-on-surface">{name}</p>
              <span className="text-[10px] text-on-surface-variant font-mono uppercase">{code}</span>
            </div>
            <p className={`text-2xl font-black tabular-nums mt-0.5 ${tone.text}`}>{value}</p>
            <p className="text-[11px] text-on-surface-variant/70 mt-0.5">Target {target}</p>
          </div>
          <RatingBadge rating={rating} />
        </div>
        {/* Distribution bar across pages */}
        <div>
          <div className="flex h-1.5 rounded-full overflow-hidden bg-outline-variant/15">
            {totals.good > 0  && <div className="bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${(totals.good / total) * 100}%`  }} />}
            {totals.ni > 0    && <div className="bg-gradient-to-r from-amber-500 to-amber-400"     style={{ width: `${(totals.ni / total) * 100}%`    }} />}
            {totals.poor > 0  && <div className="bg-gradient-to-r from-rose-500 to-rose-400"       style={{ width: `${(totals.poor / total) * 100}%`  }} />}
          </div>
          <div className="flex gap-3 mt-1 text-[10px] text-on-surface-variant">
            <span><strong className="text-emerald-400 tabular-nums">{totals.good}</strong> good</span>
            <span><strong className="text-amber-400 tabular-nums">{totals.ni}</strong> needs work</span>
            <span><strong className="text-rose-400 tabular-nums">{totals.poor}</strong> poor</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Per-page metric chip ─────────────────────────────────────────────────────
function MetricChip({
  icon, label, value, rating,
}: { icon: React.ReactNode; label: string; value: string; rating: RatingKey }) {
  const tone = RATING_TONE[rating];
  return (
    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border bg-surface-container/30 ${tone.border}`}>
      <span className={tone.text}>{icon}</span>
      <div className="leading-tight">
        <p className={`text-xs font-black tabular-nums ${tone.text}`}>{value}</p>
        <p className="text-[9px] text-on-surface-variant uppercase tracking-wider font-semibold">{label}</p>
      </div>
    </div>
  );
}

// ── Insights ─────────────────────────────────────────────────────────────────
function buildInsights(pages: PageVitals[]) {
  const wins: { title: string; reason: string; tone: "good" | "warn" | "info" }[] = [];

  if (!pages.length) return wins;

  // 1. Worst LCP
  const lcpPoor = pages.filter((p) => lcpRating(p.avg_lcp) === "poor");
  if (lcpPoor.length) {
    const worst = [...lcpPoor].sort((a, b) => b.avg_lcp - a.avg_lcp)[0];
    wins.push({
      title: `Slow LCP on ${shortUrl(worst.url)}`,
      reason: `Largest contentful paint averages ${lcpFmt(worst.avg_lcp)} — usually large hero images, slow server response, or render-blocking scripts. ${lcpPoor.length > 1 ? `${lcpPoor.length - 1} other page${lcpPoor.length > 2 ? "s" : ""} also affected.` : ""}`,
      tone: "warn",
    });
  }

  // 2. Worst INP
  const inpPoor = pages.filter((p) => inpRating(p.avg_inp) === "poor");
  if (inpPoor.length && wins.length < 3) {
    const worst = [...inpPoor].sort((a, b) => b.avg_inp - a.avg_inp)[0];
    wins.push({
      title: `Sluggish interaction on ${shortUrl(worst.url)}`,
      reason: `Interaction-to-next-paint averages ${inpFmt(worst.avg_inp)} — heavy JavaScript handlers, long tasks, or main-thread blocking. Consider code-splitting and deferring third-party scripts.`,
      tone: "warn",
    });
  }

  // 3. Worst CLS
  const clsPoor = pages.filter((p) => clsRating(p.avg_cls) === "poor");
  if (clsPoor.length && wins.length < 3) {
    const worst = [...clsPoor].sort((a, b) => b.avg_cls - a.avg_cls)[0];
    wins.push({
      title: `Layout jumps on ${shortUrl(worst.url)}`,
      reason: `Cumulative layout shift averages ${clsFmt(worst.avg_cls)} — set explicit width/height on images and reserve space for ads or dynamic content.`,
      tone: "warn",
    });
  }

  // Bright spot
  if (wins.length < 3) {
    const allGood = pages.filter((p) => p.rating === "good");
    if (allGood.length) {
      const best = [...allGood].sort((a, b) => a.avg_lcp - b.avg_lcp)[0];
      wins.push({
        title: `${shortUrl(best.url)} is hitting all targets`,
        reason: `Good on every Core Web Vital — replicate its setup (image sizing, script loading, server response) across other templates.`,
        tone: "good",
      });
    }
  }

  return wins.slice(0, 3);
}

const INSIGHT_TONE = {
  good: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25", label: "Bright spot", icon: <TrendingUp className="w-3 h-3" /> },
  warn: { bg: "bg-rose-500/15",    text: "text-rose-400",    border: "border-rose-500/25",    label: "Attention",   icon: <TrendingDown className="w-3 h-3" /> },
  info: { bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-amber-500/25",   label: "Heads up",    icon: <Sparkles className="w-3 h-3" /> },
};

// ── Page row ─────────────────────────────────────────────────────────────────
function PageRow({ page }: { page: PageVitals }) {
  const [open, setOpen] = useState(false);
  const tone = RATING_TONE[page.rating];
  const lcpR = lcpRating(page.avg_lcp);
  const clsR = clsRating(page.avg_cls);
  const inpR = inpRating(page.avg_inp);

  return (
    <div className="border-b border-outline-variant/10 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 text-left hover:bg-surface-container/40 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className={`w-2 h-2 rounded-full ${tone.dot} shrink-0`} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-on-surface truncate" title={page.url}>{shortUrl(page.url)}</p>
            {/* Inline chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <MetricChip icon={<Zap className="w-3 h-3" />}          label="LCP" value={lcpFmt(page.avg_lcp)} rating={lcpR} />
              <MetricChip icon={<MoveVertical className="w-3 h-3" />} label="CLS" value={clsFmt(page.avg_cls)} rating={clsR} />
              <MetricChip icon={<Hand className="w-3 h-3" />}         label="INP" value={inpFmt(page.avg_inp)} rating={inpR} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 sm:ltr:ml-3 sm:rtl:mr-3 w-full sm:w-auto">
          <RatingBadge rating={page.rating} />
          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant tabular-nums">
            <Users className="w-3 h-3" /> {compactNumber(page.total)}
            {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </div>
      </button>

      {open && page.total > 0 && (
        <div className="px-4 pb-4 space-y-3">
          {/* Distribution bar */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">
              Sample distribution
            </p>
            <div className="flex h-2 rounded-full overflow-hidden bg-outline-variant/15">
              {page.good > 0              && <div className="bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${(page.good / page.total) * 100}%` }} title={`Good: ${page.good}`} />}
              {page.needs_improvement > 0 && <div className="bg-gradient-to-r from-amber-500 to-amber-400"     style={{ width: `${(page.needs_improvement / page.total) * 100}%` }} title={`Needs work: ${page.needs_improvement}`} />}
              {page.poor > 0              && <div className="bg-gradient-to-r from-rose-500 to-rose-400"       style={{ width: `${(page.poor / page.total) * 100}%` }} title={`Poor: ${page.poor}`} />}
            </div>
            <div className="flex flex-wrap gap-3 mt-1.5 text-[11px] text-on-surface-variant">
              <span><strong className="text-emerald-400 tabular-nums">{page.good}</strong> good</span>
              <span><strong className="text-amber-400 tabular-nums">{page.needs_improvement}</strong> needs work</span>
              <span><strong className="text-rose-400 tabular-nums">{page.poor}</strong> poor</span>
              <span className="ms-auto"><strong className="text-on-surface tabular-nums">{page.total}</strong> total samples</span>
            </div>
          </div>

          {/* Reference targets */}
          <div className="grid grid-cols-3 gap-2 text-[11px] text-on-surface-variant">
            <span>LCP target <span className="font-bold text-emerald-400">&lt; {LCP_GOOD / 1000}s</span></span>
            <span>CLS target <span className="font-bold text-emerald-400">&lt; {CLS_GOOD}</span></span>
            <span>INP target <span className="font-bold text-emerald-400">&lt; {INP_GOOD}ms</span></span>
          </div>

          <div>
            <a
              href={page.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              Open page <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Compute health score across all pages ────────────────────────────────────
function computeHealth(pages: PageVitals[]) {
  if (!pages.length) {
    return { score: null as number | null, lcp: 0, cls: 0, inp: 0, verdict: "No data" };
  }
  // Score each metric: 100 for good, 60 for NI, 20 for poor — averaged across pages
  const scoreFor = (rating: RatingKey) => rating === "good" ? 100 : rating === "needs-improvement" ? 60 : 20;
  const lcp = pages.reduce((s, p) => s + scoreFor(lcpRating(p.avg_lcp)), 0) / pages.length;
  const cls = pages.reduce((s, p) => s + scoreFor(clsRating(p.avg_cls)), 0) / pages.length;
  const inp = pages.reduce((s, p) => s + scoreFor(inpRating(p.avg_inp)), 0) / pages.length;
  const score = Math.round(lcp * 0.4 + cls * 0.2 + inp * 0.4);
  const verdict =
    score >= 85 ? "Excellent" :
    score >= 70 ? "Good" :
    score >= 50 ? "Needs work" :
    "Poor";
  return { score, lcp: Math.round(lcp), cls: Math.round(cls), inp: Math.round(inp), verdict };
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`bg-surface-container/40 rounded-2xl animate-pulse ${className}`} />;
}

function Header() {
  return (
    <div>
      <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
        <Gauge className="w-6 h-6 text-primary" /> Page Speed
      </h1>
      <p className="text-on-surface-variant text-sm mt-0.5">
        Core Web Vitals from real visitors — how fast your pages load, settle, and respond.
      </p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
function Content() {
  const { selectedDomainId } = useAuthStore();

  const { data, isLoading } = useQuery<PageVitals[]>({
    queryKey: ["web-vitals", selectedDomainId],
    queryFn: () => uxApi.webVitals(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const pages = data ?? [];

  // Aggregates
  const goodCount = pages.filter((p) => p.rating === "good").length;
  const niCount   = pages.filter((p) => p.rating === "needs-improvement").length;
  const poorCount = pages.filter((p) => p.rating === "poor").length;

  const sampleTotals = useMemo(() => {
    const sum = pages.reduce((acc, p) => {
      acc.good += p.good;
      acc.ni   += p.needs_improvement;
      acc.poor += p.poor;
      acc.total += p.total;
      return acc;
    }, { good: 0, ni: 0, poor: 0, total: 0 });
    return sum;
  }, [pages]);

  // Average each metric across pages
  const avgLcp = pages.length ? pages.reduce((s, p) => s + p.avg_lcp, 0) / pages.length : 0;
  const avgCls = pages.length ? pages.reduce((s, p) => s + p.avg_cls, 0) / pages.length : 0;
  const avgInp = pages.length ? pages.reduce((s, p) => s + p.avg_inp, 0) / pages.length : 0;

  const lcpTotals = useMemo(() => ({
    good: pages.filter((p) => lcpRating(p.avg_lcp) === "good").length,
    ni:   pages.filter((p) => lcpRating(p.avg_lcp) === "needs-improvement").length,
    poor: pages.filter((p) => lcpRating(p.avg_lcp) === "poor").length,
  }), [pages]);
  const clsTotals = useMemo(() => ({
    good: pages.filter((p) => clsRating(p.avg_cls) === "good").length,
    ni:   pages.filter((p) => clsRating(p.avg_cls) === "needs-improvement").length,
    poor: pages.filter((p) => clsRating(p.avg_cls) === "poor").length,
  }), [pages]);
  const inpTotals = useMemo(() => ({
    good: pages.filter((p) => inpRating(p.avg_inp) === "good").length,
    ni:   pages.filter((p) => inpRating(p.avg_inp) === "needs-improvement").length,
    poor: pages.filter((p) => inpRating(p.avg_inp) === "poor").length,
  }), [pages]);

  const health = computeHealth(pages);
  const insights = useMemo(() => buildInsights(pages), [pages]);

  // ── Filter / search / sort ───────────────────────────────────────────────
  const [filter, setFilter] = useState<RatingFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<VitalsSort>("rating");

  const filteredPages = useMemo(() => {
    let list = pages;
    if (filter !== "all") list = list.filter((p) => p.rating === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.url.toLowerCase().includes(q));
    }
    const rank: Record<RatingKey, number> = { poor: 0, "needs-improvement": 1, good: 2 };
    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sort) {
        case "lcp":     return b.avg_lcp - a.avg_lcp;
        case "cls":     return b.avg_cls - a.avg_cls;
        case "inp":     return b.avg_inp - a.avg_inp;
        case "samples": return b.total   - a.total;
        default:        return rank[a.rating] - rank[b.rating];
      }
    });
    return sorted;
  }, [pages, filter, query, sort]);

  // ── Guard states ─────────────────────────────────────────────────────────
  if (!selectedDomainId) {
    return (
      <div className="space-y-6">
        <Header />
        <Card>
          <CardContent className="py-16 text-center">
            <Gauge className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
            <p className="text-on-surface font-semibold">Select a domain to view Web Vitals.</p>
            <p className="text-on-surface-variant text-sm mt-1">Use the domain selector at the top of the page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Header />
        <SkeletonCard className="h-44" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} className="h-28" />)}
        </div>
        <SkeletonCard className="h-64" />
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="space-y-6">
        <Header />
        <Card>
          <CardContent className="py-16 text-center">
            <Gauge className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
            <p className="text-on-surface font-semibold">No Web Vitals data yet</p>
            <p className="text-on-surface-variant text-sm mt-1 max-w-md mx-auto">
              Vitals are captured automatically as visitors interact with your pages. Data will appear here within a few minutes after real traffic arrives.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sampleTotal = sampleTotals.total || 1;

  return (
    <div className="space-y-6">
      <Header />

      {/* ── Health hero ─────────────────────────────────────────────────── */}
      <Card className="overflow-hidden border-outline-variant/20">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start lg:items-center">
            <div className="flex items-center gap-5 w-full lg:w-auto">
              <VitalsGauge score={health.score} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Vitals health</p>
                <h2 className={`text-2xl font-black mt-0.5 ${
                  (health.score ?? 0) >= 85 ? "text-emerald-400" :
                  (health.score ?? 0) >= 70 ? "text-lime-400" :
                  (health.score ?? 0) >= 50 ? "text-amber-400" :
                  "text-rose-400"
                }`}>{health.verdict}</h2>
                <p className="text-xs text-on-surface-variant mt-1 max-w-sm">
                  Based on {pages.length} page{pages.length === 1 ? "" : "s"} and {compactNumber(sampleTotals.total)} sample{sampleTotals.total === 1 ? "" : "s"} from real visitors.
                </p>
              </div>
            </div>

            <div className="hidden lg:block w-px self-stretch bg-outline-variant/20" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
              <SubScore label="LCP" value={health.lcp} hint="Load speed" />
              <SubScore label="CLS" value={health.cls} hint="Layout stability" />
              <SubScore label="INP" value={health.inp} hint="Responsiveness" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Per-metric overview ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MetricCard
          icon={<Zap className="w-5 h-5" />}
          name="Load Speed"
          code="LCP"
          value={lcpFmt(avgLcp)}
          rating={lcpRating(avgLcp)}
          target={`< ${LCP_GOOD / 1000}s`}
          totals={lcpTotals}
        />
        <MetricCard
          icon={<MoveVertical className="w-5 h-5" />}
          name="Layout Stability"
          code="CLS"
          value={clsFmt(avgCls)}
          rating={clsRating(avgCls)}
          target={`< ${CLS_GOOD}`}
          totals={clsTotals}
        />
        <MetricCard
          icon={<Hand className="w-5 h-5" />}
          name="Responsiveness"
          code="INP"
          value={inpFmt(avgInp)}
          rating={inpRating(avgInp)}
          target={`< ${INP_GOOD}ms`}
          totals={inpTotals}
        />
      </div>

      {/* ── Sample distribution across the whole site ──────────────────── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                All measurements
              </p>
              <div className="flex h-3 rounded-full overflow-hidden bg-outline-variant/15">
                {sampleTotals.good > 0 && <div className="bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${(sampleTotals.good / sampleTotal) * 100}%` }} />}
                {sampleTotals.ni > 0   && <div className="bg-gradient-to-r from-amber-500 to-amber-400"     style={{ width: `${(sampleTotals.ni / sampleTotal) * 100}%` }} />}
                {sampleTotals.poor > 0 && <div className="bg-gradient-to-r from-rose-500 to-rose-400"       style={{ width: `${(sampleTotals.poor / sampleTotal) * 100}%` }} />}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant shrink-0">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /><strong className="text-on-surface tabular-nums">{((sampleTotals.good / sampleTotal) * 100).toFixed(0)}%</strong> good</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /><strong className="text-on-surface tabular-nums">{((sampleTotals.ni / sampleTotal) * 100).toFixed(0)}%</strong> needs work</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /><strong className="text-on-surface tabular-nums">{((sampleTotals.poor / sampleTotal) * 100).toFixed(0)}%</strong> poor</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Insights ───────────────────────────────────────────────────── */}
      {insights.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader className="border-b border-outline-variant/15 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Insights
              <Badge variant="secondary">{insights.length}</Badge>
            </CardTitle>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Pages and metrics that need attention, plus what's already working.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {insights.map((insight, i) => {
              const tone = INSIGHT_TONE[insight.tone];
              return (
                <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-outline-variant/10 last:border-0">
                  <span className="w-7 h-7 rounded-full bg-surface-container shrink-0 flex items-center justify-center text-xs font-black text-on-surface">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-on-surface">{insight.title}</p>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${tone.bg} ${tone.text} ${tone.border}`}>
                        {tone.icon} {tone.label}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">{insight.reason}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ── Page list ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="border-b border-outline-variant/15 pb-3 gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Gauge className="w-4 h-4 text-primary" /> Pages
              <Badge variant="secondary">{pages.length}</Badge>
            </CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:ms-auto w-full sm:w-auto">
              <div className="relative w-full sm:w-56">
                <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter URLs…"
                  className="ltr:pl-9 rtl:pr-9 h-9 text-sm"
                />
              </div>
              <div className="relative">
                <ArrowUpDown className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant pointer-events-none" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as VitalsSort)}
                  className="h-9 ltr:pl-9 rtl:pr-9 ltr:pr-8 rtl:pl-8 rounded-lg border border-outline-variant/40 bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="rating">Sort: Worst rating first</option>
                  <option value="lcp">Sort: LCP</option>
                  <option value="cls">Sort: CLS</option>
                  <option value="inp">Sort: INP</option>
                  <option value="samples">Sort: Samples</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <ListFilter className="w-3.5 h-3.5 text-on-surface-variant" />
            {([
              { key: "all",                label: "All",        count: pages.length },
              { key: "poor",               label: "Poor",       count: poorCount },
              { key: "needs-improvement",  label: "Needs work", count: niCount },
              { key: "good",               label: "Good",       count: goodCount },
            ] as { key: RatingFilter; label: string; count: number }[]).map((f) => {
              const active = filter === f.key;
              const tone = f.key === "poor" ? "border-rose-500/30 text-rose-400"
                : f.key === "needs-improvement" ? "border-amber-500/30 text-amber-400"
                : f.key === "good" ? "border-emerald-500/30 text-emerald-400"
                : "border-outline-variant/40 text-on-surface-variant";
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border transition-colors
                    ${active ? `${tone} bg-surface-container` : "border-outline-variant/30 text-on-surface-variant hover:border-outline-variant/60"}`}
                >
                  {f.label} <span className="tabular-nums opacity-70">{f.count}</span>
                </button>
              );
            })}
          </div>
        </CardHeader>

        {filteredPages.length === 0 ? (
          <CardContent className="py-12 text-center text-on-surface-variant text-sm">
            No pages match the current filters.
          </CardContent>
        ) : (
          <div>
            {filteredPages.map((page) => (
              <PageRow key={page.url} page={page} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function WebVitalsPage() {
  return <Content />;
}
