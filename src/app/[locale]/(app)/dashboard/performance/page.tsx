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
  Zap,
  Clock,
  FileImage,
  Code2,
  Type,
  Box,
  Globe,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowUpDown,
  TrendingUp,
  Sparkles,
  ListFilter,
  Copy,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type PageLoad = {
  url: string;
  avg_ttfb: number;
  avg_dom_interactive: number;
  avg_dom_complete: number;
  avg_load_event: number;
  avg_transfer_size: number;
  samples: number;
  rating: "good" | "needs-improvement" | "poor";
};

type SlowAsset = {
  url: string;
  type: string;
  avg_duration: number;
  avg_size: number;
  occurrences: number;
};

type PerformanceData = {
  pages: PageLoad[];
  slow_assets: SlowAsset[];
};

type PageFilter = "all" | "good" | "needs-improvement" | "poor";
type PageSort = "load" | "ttfb" | "size" | "samples";
type AssetFilter = "all" | "image" | "script" | "css" | "font" | "fetch" | "other";

// ── Formatters ───────────────────────────────────────────────────────────────
function ms(v: number) {
  if (!v) return "—";
  if (v >= 1000) return `${(v / 1000).toFixed(2)}s`;
  return `${Math.round(v)}ms`;
}

function kb(bytes: number) {
  if (bytes === 0) return "—";
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function shortUrl(url: string) {
  try {
    const u = new URL(url);
    const p = u.pathname + u.search;
    return p === "/" ? u.hostname : (p || u.hostname);
  } catch {
    return url.length > 60 ? "…" + url.slice(-60) : url;
  }
}

function assetName(url: string) {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop() || u.hostname;
    return last.length > 50 ? "…" + last.slice(-50) : last;
  } catch {
    return url.length > 50 ? "…" + url.slice(-50) : url;
  }
}

// ── Rating helpers ───────────────────────────────────────────────────────────
const RATING_TONE: Record<string, { bg: string; text: string; border: string; dot: string; bar: string; }> = {
  good: {
    bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25",
    dot: "bg-emerald-500", bar: "from-emerald-500 to-emerald-400",
  },
  "needs-improvement": {
    bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/25",
    dot: "bg-amber-400", bar: "from-amber-500 to-amber-400",
  },
  poor: {
    bg: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/25",
    dot: "bg-rose-500", bar: "from-rose-500 to-rose-400",
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

function RatingBadge({ rating }: { rating: keyof typeof RATING_TONE }) {
  const tone = RATING_TONE[rating];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${tone.bg} ${tone.text} ${tone.border}`}>
      {RATING_ICON[rating]}
      {RATING_LABEL[rating]}
    </span>
  );
}

// Page-load benchmark thresholds (ms)
const LOAD_GOOD = 2500;
const LOAD_OK = 4000;
const TTFB_GOOD = 200;
const TTFB_OK = 600;

function loadColor(v: number) {
  if (v <= LOAD_GOOD) return "text-emerald-400";
  if (v <= LOAD_OK) return "text-amber-400";
  return "text-rose-400";
}
function ttfbColor(v: number) {
  if (v <= TTFB_GOOD) return "text-emerald-400";
  if (v <= TTFB_OK) return "text-amber-400";
  return "text-rose-400";
}

// Load-time progress bar (0 → 6s budget)
function LoadBar({ value, budget = 6000 }: { value: number; budget?: number }) {
  const pct = Math.min(100, Math.max(2, (value / budget) * 100));
  const tone = value <= LOAD_GOOD ? "from-emerald-500 to-emerald-400"
    : value <= LOAD_OK ? "from-amber-500 to-amber-400"
    : "from-rose-500 to-rose-400";
  return (
    <div className="w-full bg-outline-variant/15 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${tone} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Asset taxonomy ───────────────────────────────────────────────────────────
function classify(type: string): AssetFilter {
  const t = type.toLowerCase();
  if (t === "img" || t === "image") return "image";
  if (t === "script") return "script";
  if (t === "css" || t === "link") return "css";
  if (t === "font") return "font";
  if (t === "fetch" || t === "xmlhttprequest") return "fetch";
  return "other";
}
const ASSET_META: Record<AssetFilter, { label: string; icon: React.ReactNode; tone: string; }> = {
  all:    { label: "All",     icon: <Box className="w-3.5 h-3.5" />,         tone: "text-on-surface-variant" },
  image:  { label: "Images",  icon: <FileImage className="w-3.5 h-3.5" />,   tone: "text-amber-400" },
  script: { label: "Scripts", icon: <Code2 className="w-3.5 h-3.5" />,       tone: "text-blue-400" },
  css:    { label: "CSS",     icon: <Type className="w-3.5 h-3.5" />,        tone: "text-purple-400" },
  font:   { label: "Fonts",   icon: <Type className="w-3.5 h-3.5" />,        tone: "text-pink-400" },
  fetch:  { label: "API",     icon: <Globe className="w-3.5 h-3.5" />,       tone: "text-sky-400" },
  other:  { label: "Other",   icon: <Box className="w-3.5 h-3.5" />,         tone: "text-slate-400" },
};

// ── Health score: a single 0-100 number summarising the whole domain ──────────
function computeHealth(pages: PageLoad[], slowCount: number) {
  if (!pages.length) {
    return { score: null as number | null, speed: 0, loading: 0, assets: 0, verdict: "No data" };
  }
  const good = pages.filter((p) => p.rating === "good").length;
  const ni   = pages.filter((p) => p.rating === "needs-improvement").length;
  const poor = pages.filter((p) => p.rating === "poor").length;

  // 60% pages rating, 20% TTFB, 20% slow assets penalty
  const pagesScore = (good * 100 + ni * 60 + poor * 20) / pages.length;
  const avgTtfb = pages.reduce((s, p) => s + p.avg_ttfb, 0) / pages.length;
  const ttfbScore = avgTtfb <= TTFB_GOOD ? 100 : avgTtfb <= TTFB_OK ? 70 : Math.max(20, 100 - avgTtfb / 20);
  const assetScore = Math.max(0, 100 - slowCount * 6);

  const score = Math.round(pagesScore * 0.6 + ttfbScore * 0.2 + assetScore * 0.2);
  const verdict = score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Needs work" : "Poor";

  return {
    score,
    speed: Math.round(ttfbScore),
    loading: Math.round(pagesScore),
    assets: Math.round(assetScore),
    verdict,
  };
}

// ── Circular gauge component ──────────────────────────────────────────────────
function HealthGauge({ score }: { score: number | null }) {
  const value = score ?? 0;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
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
          strokeDasharray={circumference}
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

// Mini horizontal sub-score bar
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

// ── KPI tile with benchmark verdict ───────────────────────────────────────────
function KpiTile({
  icon, label, value, hint, tone = "text-on-surface",
}: {
  icon: React.ReactNode; label: string; value: string; hint?: string; tone?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-surface-container shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className={`text-2xl font-black tabular-nums ${tone}`}>{value}</p>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant mt-0.5">{label}</p>
          {hint && <p className="text-[11px] text-on-surface-variant/70 mt-0.5">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page load detail row ──────────────────────────────────────────────────────
function PageLoadRow({ page }: { page: PageLoad }) {
  const [open, setOpen] = useState(false);
  const tone = RATING_TONE[page.rating];

  return (
    <div className="border-b border-outline-variant/10 last:border-0">
      <button
        type="button"
        className="w-full flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 text-left hover:bg-surface-container/40 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Rating pill + URL */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className={`w-2 h-2 rounded-full ${tone.dot} shrink-0`} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-on-surface truncate" title={page.url}>{shortUrl(page.url)}</p>
            <div className="flex items-center gap-2 mt-1">
              <LoadBar value={page.avg_load_event} />
              <span className={`text-xs font-black tabular-nums shrink-0 ${loadColor(page.avg_load_event)}`}>
                {ms(page.avg_load_event)}
              </span>
            </div>
          </div>
        </div>

        {/* Right meta */}
        <div className="flex items-center gap-3 shrink-0 sm:ltr:ml-3 sm:rtl:mr-3">
          <RatingBadge rating={page.rating} />
          <span className="text-xs text-on-surface-variant hidden sm:inline">{page.samples} samples</span>
          {open
            ? <ChevronUp className="w-4 h-4 text-on-surface-variant" />
            : <ChevronDown className="w-4 h-4 text-on-surface-variant" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "TTFB",            val: ms(page.avg_ttfb),
                icon: <Zap className="w-3.5 h-3.5" />,    iconTone: "text-primary",
                color: ttfbColor(page.avg_ttfb),
                help: "Time to first byte — server response speed" },
              { label: "DOM Interactive", val: ms(page.avg_dom_interactive),
                icon: <Clock className="w-3.5 h-3.5" />,  iconTone: "text-sky-400",
                color: "text-on-surface",
                help: "When the page becomes usable" },
              { label: "DOM Complete",    val: ms(page.avg_dom_complete),
                icon: <Clock className="w-3.5 h-3.5" />,  iconTone: "text-blue-400",
                color: "text-on-surface",
                help: "When all deferred content has loaded" },
              { label: "Transfer Size",   val: kb(page.avg_transfer_size),
                icon: <Box className="w-3.5 h-3.5" />,    iconTone: "text-amber-400",
                color: page.avg_transfer_size > 2 * 1024 * 1024 ? "text-rose-400"
                  : page.avg_transfer_size > 1024 * 1024 ? "text-amber-400"
                  : "text-on-surface",
                help: "Compressed bytes sent over the wire" },
            ].map((m) => (
              <div key={m.label} className="rounded-lg bg-surface-container/40 p-3 border border-outline-variant/15">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={m.iconTone}>{m.icon}</span>
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">{m.label}</span>
                </div>
                <span className={`text-base font-black tabular-nums ${m.color}`}>{m.val}</span>
                <p className="text-[10px] text-on-surface-variant mt-0.5">{m.help}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
            <span className="font-semibold text-on-surface">{page.samples}</span> samples ·
            <span>budget</span> <span className="font-semibold text-on-surface">{ms(LOAD_GOOD)}</span> ·
            <a
              href={page.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-primary hover:underline truncate max-w-full"
            >
              Open page ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Slow asset row ────────────────────────────────────────────────────────────
function SlowAssetRow({ asset }: { asset: SlowAsset }) {
  const meta = ASSET_META[classify(asset.type)];
  const overLimit = asset.avg_duration > 3000;
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant/10 last:border-0 hover:bg-surface-container/30 transition-colors">
      <span className={`p-2 rounded-lg bg-surface-container shrink-0 ${meta.tone}`}>
        {meta.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-on-surface truncate" title={asset.url}>
            {assetName(asset.url)}
          </p>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(asset.url)}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
            title="Copy URL"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
          <span className={`text-[10px] uppercase tracking-wide font-semibold ${meta.tone}`}>{meta.label}</span>
          {asset.avg_size > 0 && <span className="text-[10px] text-on-surface-variant">{kb(asset.avg_size)}</span>}
          <span className="text-[10px] text-on-surface-variant">{asset.occurrences}× seen</span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <span className={`text-sm font-black tabular-nums ${overLimit ? "text-rose-400" : "text-amber-400"}`}>
          {ms(asset.avg_duration)}
        </span>
        <p className="text-[10px] text-on-surface-variant">avg load</p>
      </div>
    </div>
  );
}

// ── Quick wins / Top issues ───────────────────────────────────────────────────
function buildQuickWins(pages: PageLoad[], slowAssets: SlowAsset[]) {
  const wins: { title: string; reason: string; impact: "high" | "medium" | "low"; }[] = [];

  // 1. Slowest poor page
  const worstPage = [...pages].sort((a, b) => b.avg_load_event - a.avg_load_event)[0];
  if (worstPage && worstPage.rating !== "good") {
    const reasons: string[] = [];
    if (worstPage.avg_ttfb > TTFB_OK) reasons.push(`server slow (${ms(worstPage.avg_ttfb)} TTFB)`);
    if (worstPage.avg_transfer_size > 1024 * 1024) reasons.push(`heavy (${kb(worstPage.avg_transfer_size)})`);
    if (!reasons.length) reasons.push("loads slowly");
    wins.push({
      title: `Speed up ${shortUrl(worstPage.url)}`,
      reason: `${ms(worstPage.avg_load_event)} avg load — ${reasons.join(", ")}.`,
      impact: worstPage.rating === "poor" ? "high" : "medium",
    });
  }

  // 2. Biggest slow asset
  const heaviest = [...slowAssets].sort((a, b) => (b.avg_size * b.occurrences) - (a.avg_size * a.occurrences))[0];
  if (heaviest && heaviest.avg_size > 200 * 1024) {
    const m = ASSET_META[classify(heaviest.type)].label.toLowerCase();
    wins.push({
      title: `Optimise ${assetName(heaviest.url)}`,
      reason: `${kb(heaviest.avg_size)} ${m} loaded on ${heaviest.occurrences} occasion${heaviest.occurrences > 1 ? "s" : ""} — compress or lazy-load.`,
      impact: heaviest.avg_size > 1024 * 1024 ? "high" : "medium",
    });
  }

  // 3. Slowest asset by load time
  const slowestAsset = [...slowAssets].sort((a, b) => b.avg_duration - a.avg_duration)[0];
  if (slowestAsset && slowestAsset !== heaviest && slowestAsset.avg_duration > 2000) {
    const m = ASSET_META[classify(slowestAsset.type)].label.toLowerCase();
    wins.push({
      title: `Defer ${assetName(slowestAsset.url)}`,
      reason: `${ms(slowestAsset.avg_duration)} to load this ${m} — consider async, defer, or CDN.`,
      impact: slowestAsset.avg_duration > 4000 ? "high" : "medium",
    });
  }

  // 4. High TTFB across the board
  if (pages.length) {
    const avgTtfb = pages.reduce((s, p) => s + p.avg_ttfb, 0) / pages.length;
    if (avgTtfb > TTFB_OK && wins.length < 3) {
      wins.push({
        title: "Reduce server response time",
        reason: `Average TTFB across all pages is ${ms(Math.round(avgTtfb))}. Check database queries, server location, or upgrade hosting.`,
        impact: "high",
      });
    }
  }

  return wins.slice(0, 3);
}

const IMPACT_TONE = {
  high:   { bg: "bg-rose-500/15",    text: "text-rose-400",    border: "border-rose-500/20",    label: "High impact" },
  medium: { bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-amber-500/20",   label: "Medium impact" },
  low:    { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/20", label: "Low impact" },
};

// ── Skeleton states ───────────────────────────────────────────────────────────
function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`bg-surface-container/40 rounded-2xl animate-pulse ${className}`} />;
}

// ── Main page ─────────────────────────────────────────────────────────────────
function Content() {
  const { selectedDomainId } = useAuthStore();

  const { data, isLoading } = useQuery<PerformanceData>({
    queryKey: ["performance", selectedDomainId],
    queryFn: () => uxApi.performance(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const pages = data?.pages ?? [];
  const slowAssets = data?.slow_assets ?? [];

  // ── Aggregations ────────────────────────────────────────────────────────────
  const goodCount = pages.filter((p) => p.rating === "good").length;
  const niCount   = pages.filter((p) => p.rating === "needs-improvement").length;
  const poorCount = pages.filter((p) => p.rating === "poor").length;

  const avgLoad = pages.length ? Math.round(pages.reduce((s, p) => s + p.avg_load_event, 0) / pages.length) : 0;
  const avgTtfb = pages.length ? Math.round(pages.reduce((s, p) => s + p.avg_ttfb, 0) / pages.length) : 0;

  const health = computeHealth(pages, slowAssets.length);
  const quickWins = useMemo(() => buildQuickWins(pages, slowAssets), [pages, slowAssets]);

  // ── Page list filters ───────────────────────────────────────────────────────
  const [pageFilter, setPageFilter] = useState<PageFilter>("all");
  const [pageQuery, setPageQuery]   = useState("");
  const [pageSort, setPageSort]     = useState<PageSort>("load");

  const filteredPages = useMemo(() => {
    let list = pages;
    if (pageFilter !== "all") list = list.filter((p) => p.rating === pageFilter);
    if (pageQuery.trim()) {
      const q = pageQuery.toLowerCase();
      list = list.filter((p) => p.url.toLowerCase().includes(q));
    }
    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (pageSort) {
        case "ttfb":    return b.avg_ttfb - a.avg_ttfb;
        case "size":    return b.avg_transfer_size - a.avg_transfer_size;
        case "samples": return b.samples - a.samples;
        default:        return b.avg_load_event - a.avg_load_event;
      }
    });
    return sorted;
  }, [pages, pageFilter, pageQuery, pageSort]);

  // ── Asset list filters ──────────────────────────────────────────────────────
  const [assetFilter, setAssetFilter] = useState<AssetFilter>("all");
  const assetCounts: Record<AssetFilter, number> = useMemo(() => {
    const counts: Record<AssetFilter, number> = {
      all: slowAssets.length, image: 0, script: 0, css: 0, font: 0, fetch: 0, other: 0,
    };
    slowAssets.forEach((a) => { counts[classify(a.type)]++; });
    return counts;
  }, [slowAssets]);

  const filteredAssets = useMemo(() => {
    let list = slowAssets;
    if (assetFilter !== "all") list = list.filter((a) => classify(a.type) === assetFilter);
    return [...list].sort((a, b) => b.avg_duration - a.avg_duration);
  }, [slowAssets, assetFilter]);

  // ── Guard states ────────────────────────────────────────────────────────────
  if (!selectedDomainId) {
    return (
      <div className="space-y-6">
        <Header />
        <Card>
          <CardContent className="py-16 text-center">
            <Gauge className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
            <p className="text-on-surface font-semibold">Select a domain to view performance data.</p>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} className="h-24" />)}
        </div>
        <SkeletonCard className="h-64" />
      </div>
    );
  }

  const isEmpty = pages.length === 0 && slowAssets.length === 0;

  return (
    <div className="space-y-6">
      <Header />

      {isEmpty ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Gauge className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
            <p className="text-on-surface font-semibold">No performance data yet</p>
            <p className="text-on-surface-variant text-sm mt-1 max-w-md mx-auto">
              The tracker reports page-load and resource timings automatically. Data will appear here within a few minutes after real visitors land on your site.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Hero: health score + sub-scores ──────────────────────────────── */}
          <Card className="overflow-hidden border-outline-variant/20">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start lg:items-center">
                {/* Gauge + verdict */}
                <div className="flex items-center gap-5 w-full lg:w-auto">
                  <HealthGauge score={health.score} />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Performance health</p>
                    <h2 className={`text-2xl font-black mt-0.5 ${
                      (health.score ?? 0) >= 85 ? "text-emerald-400" :
                      (health.score ?? 0) >= 70 ? "text-lime-400" :
                      (health.score ?? 0) >= 50 ? "text-amber-400" :
                      "text-rose-400"
                    }`}>
                      {health.verdict}
                    </h2>
                    <p className="text-xs text-on-surface-variant mt-1 max-w-sm">
                      Based on {pages.length} page{pages.length === 1 ? "" : "s"} and {slowAssets.length} slow asset{slowAssets.length === 1 ? "" : "s"} measured from real visitors.
                    </p>
                  </div>
                </div>

                {/* Divider on lg */}
                <div className="hidden lg:block w-px self-stretch bg-outline-variant/20" />

                {/* Sub-scores */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
                  <SubScore label="Speed"   value={health.speed}   hint="Server response time" />
                  <SubScore label="Loading" value={health.loading} hint="How pages rate overall" />
                  <SubScore label="Assets"  value={health.assets}  hint="Slow resources detected" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── KPI tiles ────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiTile
              icon={<Clock className="w-5 h-5 text-primary" />}
              label="Avg page load"
              value={ms(avgLoad)}
              tone={loadColor(avgLoad)}
              hint={avgLoad <= LOAD_GOOD ? "Within good budget" : avgLoad <= LOAD_OK ? "Needs work — aim under 2.5s" : "Too slow — above 4s"}
            />
            <KpiTile
              icon={<Zap className="w-5 h-5 text-sky-400" />}
              label="Avg TTFB"
              value={ms(avgTtfb)}
              tone={ttfbColor(avgTtfb)}
              hint={avgTtfb <= TTFB_GOOD ? "Snappy server" : avgTtfb <= TTFB_OK ? "Average response" : "Server is slow"}
            />
            <KpiTile
              icon={<FileImage className="w-5 h-5 text-amber-400" />}
              label="Slow assets"
              value={String(slowAssets.length)}
              tone={slowAssets.length === 0 ? "text-emerald-400" : slowAssets.length < 5 ? "text-amber-400" : "text-rose-400"}
              hint={slowAssets.length === 0 ? "All resources are fast" : slowAssets.length === 1 ? "1 resource over 1s" : `${slowAssets.length} resources over 1s`}
            />
            <KpiTile
              icon={<XCircle className="w-5 h-5 text-rose-400" />}
              label="Poor pages"
              value={String(poorCount)}
              tone={poorCount === 0 ? "text-emerald-400" : "text-rose-400"}
              hint={poorCount === 0 ? "No pages in the red" : "Need urgent attention"}
            />
          </div>

          {/* ── Rating distribution bar ───────────────────────────────────────── */}
          {pages.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex-1 flex h-3 rounded-full overflow-hidden bg-outline-variant/15">
                    {goodCount > 0 && <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all" style={{ width: `${(goodCount / pages.length) * 100}%` }} title={`${goodCount} good`} />}
                    {niCount > 0 && <div className="bg-gradient-to-r from-amber-500 to-amber-400 transition-all" style={{ width: `${(niCount / pages.length) * 100}%` }} title={`${niCount} needs work`} />}
                    {poorCount > 0 && <div className="bg-gradient-to-r from-rose-500 to-rose-400 transition-all" style={{ width: `${(poorCount / pages.length) * 100}%` }} title={`${poorCount} poor`} />}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant shrink-0">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /><strong className="text-on-surface tabular-nums">{goodCount}</strong> good</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /><strong className="text-on-surface tabular-nums">{niCount}</strong> needs work</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /><strong className="text-on-surface tabular-nums">{poorCount}</strong> poor</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Quick wins ────────────────────────────────────────────────────── */}
          {quickWins.length > 0 && (
            <Card className="border-primary/20">
              <CardHeader className="border-b border-outline-variant/15 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Quick wins
                  <Badge variant="secondary">{quickWins.length}</Badge>
                </CardTitle>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  The biggest improvements you can make right now, ranked by impact.
                </p>
              </CardHeader>
              <CardContent className="p-0">
                {quickWins.map((win, i) => {
                  const tone = IMPACT_TONE[win.impact];
                  return (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-outline-variant/10 last:border-0">
                      <span className="w-7 h-7 rounded-full bg-surface-container shrink-0 flex items-center justify-center text-xs font-black text-on-surface">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-on-surface truncate">{win.title}</p>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${tone.bg} ${tone.text} ${tone.border}`}>
                            <TrendingUp className="w-3 h-3" /> {tone.label}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1">{win.reason}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* ── Page load list ────────────────────────────────────────────────── */}
          <Card>
            <CardHeader className="border-b border-outline-variant/15 pb-3 gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Page load times
                  <Badge variant="secondary">{pages.length}</Badge>
                </CardTitle>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:ms-auto w-full sm:w-auto">
                  <div className="relative w-full sm:w-56">
                    <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
                    <Input
                      value={pageQuery}
                      onChange={(e) => setPageQuery(e.target.value)}
                      placeholder="Filter URLs…"
                      className="ltr:pl-9 rtl:pr-9 h-9 text-sm"
                    />
                  </div>
                  <div className="relative">
                    <ArrowUpDown className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant pointer-events-none" />
                    <select
                      value={pageSort}
                      onChange={(e) => setPageSort(e.target.value as PageSort)}
                      className="h-9 ltr:pl-9 rtl:pr-9 ltr:pr-8 rtl:pl-8 rounded-lg border border-outline-variant/40 bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="load">Sort: Load time</option>
                      <option value="ttfb">Sort: TTFB</option>
                      <option value="size">Sort: Transfer size</option>
                      <option value="samples">Sort: Samples</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <ListFilter className="w-3.5 h-3.5 text-on-surface-variant" />
                {([
                  { key: "all",                label: "All",         count: pages.length },
                  { key: "poor",               label: "Poor",        count: poorCount },
                  { key: "needs-improvement",  label: "Needs work",  count: niCount },
                  { key: "good",               label: "Good",        count: goodCount },
                ] as { key: PageFilter; label: string; count: number }[]).map((f) => {
                  const active = pageFilter === f.key;
                  const tone = f.key === "all" ? "border-outline-variant/40 text-on-surface-variant"
                    : f.key === "poor" ? "border-rose-500/30 text-rose-400"
                    : f.key === "needs-improvement" ? "border-amber-500/30 text-amber-400"
                    : "border-emerald-500/30 text-emerald-400";
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setPageFilter(f.key)}
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
                  <PageLoadRow key={page.url} page={page} />
                ))}
              </div>
            )}
          </Card>

          {/* ── Slow assets list ──────────────────────────────────────────────── */}
          <Card>
            <CardHeader className="border-b border-outline-variant/15 pb-3 gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileImage className="w-4 h-4 text-amber-400" /> Slow assets
                  <Badge variant="secondary">{slowAssets.length}</Badge>
                </CardTitle>
                <p className="text-xs text-on-surface-variant sm:ms-auto">
                  Resources that took over 1 second to load, grouped by type.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(["all", "image", "script", "css", "font", "fetch", "other"] as AssetFilter[]).map((k) => {
                  const meta = ASSET_META[k];
                  const count = assetCounts[k];
                  if (k !== "all" && count === 0) return null;
                  const active = assetFilter === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setAssetFilter(k)}
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border transition-colors
                        ${active
                          ? `border-primary/40 bg-primary/10 text-on-surface`
                          : "border-outline-variant/30 text-on-surface-variant hover:border-outline-variant/60"}`}
                    >
                      <span className={active ? "text-primary" : meta.tone}>{meta.icon}</span>
                      {meta.label}
                      <span className="tabular-nums opacity-70">{count}</span>
                    </button>
                  );
                })}
              </div>
            </CardHeader>

            {filteredAssets.length === 0 ? (
              <CardContent className="py-12 text-center text-on-surface-variant text-sm">
                {slowAssets.length === 0
                  ? "No slow assets detected. Your pages are loading resources quickly."
                  : "No assets in this category."}
              </CardContent>
            ) : (
              <div>
                {filteredAssets.map((asset, i) => (
                  <SlowAssetRow key={`${asset.url}-${i}`} asset={asset} />
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
        <Gauge className="w-6 h-6 text-primary" /> Performance Monitoring
      </h1>
      <p className="text-on-surface-variant text-sm mt-0.5">
        Page load times and slow asset detection from real visitor data.
      </p>
    </div>
  );
}

export default function PerformancePage() {
  return <Content />;
}
