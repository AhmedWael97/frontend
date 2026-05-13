"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { uxApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import {
  ArrowDownToLine,
  TrendingUp,
  TrendingDown,
  Award,
  Sparkles,
  Search,
  ArrowUpDown,
  ListFilter,
  Users,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type PageDepth = {
  url: string;
  d25: number;
  d50: number;
  d75: number;
  d100: number;
  total: number;
};

type EnrichedPage = PageDepth & {
  completion: number;     // d100 / total
  cliff: 25 | 50 | 75 | 100; // depth where the biggest drop happens
  cliffPct: number;        // size of that biggest drop
};

type DepthFilter = "all" | "best" | "worst" | "midcliff";
type DepthSort = "completion" | "traffic" | "cliff";

// ── Formatters ───────────────────────────────────────────────────────────────
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

// ── Completion verdict ──────────────────────────────────────────────────────
function verdictFromCompletion(pct: number) {
  if (pct >= 50) return { label: "Strong engagement", tone: "text-emerald-400", hint: "Most readers reach the bottom of your content." };
  if (pct >= 30) return { label: "Decent engagement", tone: "text-lime-400",    hint: "Many readers go far, but content can hold attention longer." };
  if (pct >= 15) return { label: "Light engagement",   tone: "text-amber-400",  hint: "Readers leave before the end — review pacing and length." };
  return            { label: "Weak engagement",        tone: "text-rose-400",   hint: "Most visitors leave early — content may be too long or off-target." };
}

function completionColor(pct: number) {
  if (pct >= 50) return "text-emerald-400";
  if (pct >= 30) return "text-lime-400";
  if (pct >= 15) return "text-amber-400";
  return "text-rose-400";
}
function completionBar(pct: number) {
  if (pct >= 50) return "from-emerald-500 to-emerald-400";
  if (pct >= 30) return "from-lime-500 to-lime-400";
  if (pct >= 15) return "from-amber-500 to-amber-400";
  return "from-rose-500 to-rose-400";
}

// ── Circular gauge ──────────────────────────────────────────────────────────
function CompletionGauge({ pct }: { pct: number | null }) {
  const value = pct ?? 0;
  const radius = 56;
  const c = 2 * Math.PI * radius;
  const offset = c - (value / 100) * c;
  const tone =
    value >= 50 ? "stroke-emerald-400" :
    value >= 30 ? "stroke-lime-400" :
    value >= 15 ? "stroke-amber-400" :
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
          {pct === null ? "—" : `${value}%`}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">read all</span>
      </div>
    </div>
  );
}

// ── Aggregate funnel row ─────────────────────────────────────────────────────
function FunnelStep({ label, value, pctOfTotal, prevPct, tone }: {
  label: string; value: number; pctOfTotal: number; prevPct: number | null; tone: string;
}) {
  const drop = prevPct === null ? null : Math.max(0, prevPct - pctOfTotal);
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 shrink-0 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant text-right">{label}</div>
      <div className="flex-1 relative bg-outline-variant/15 rounded-full h-6 overflow-hidden">
        <div
          className={`absolute inset-y-0 ltr:left-0 rtl:right-0 bg-gradient-to-r ${tone} transition-all duration-700`}
          style={{ width: `${Math.max(2, pctOfTotal)}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <span className="text-[11px] font-black text-on-surface tabular-nums drop-shadow">
            {pctOfTotal.toFixed(0)}%
          </span>
          <span className="text-[10px] text-on-surface-variant tabular-nums">
            {compactNumber(value)}
          </span>
        </div>
      </div>
      <div className="w-16 shrink-0 text-[11px] tabular-nums text-right">
        {drop !== null && drop > 0 ? (
          <span className="text-rose-400">−{drop.toFixed(0)}%</span>
        ) : (
          <span className="text-on-surface-variant/40">—</span>
        )}
      </div>
    </div>
  );
}

// ── Per-page mini retention curve ────────────────────────────────────────────
function MiniCurve({ d25, d50, d75, d100, total }: PageDepth) {
  // Compute retention % at each milestone
  const pts = total > 0 ? [
    { x: 0,   y: 100 },
    { x: 25,  y: Math.min(100, (d25 / total) * 100) },
    { x: 50,  y: Math.min(100, (d50 / total) * 100) },
    { x: 75,  y: Math.min(100, (d75 / total) * 100) },
    { x: 100, y: Math.min(100, (d100 / total) * 100) },
  ] : [];

  if (!pts.length) {
    return <div className="h-14 flex items-center justify-center text-[10px] text-on-surface-variant/50">no data</div>;
  }

  // Map to SVG: 0..100 x → 0..100, 0..100 y inverted
  const polyline = pts.map(p => `${p.x},${100 - p.y}`).join(" ");
  const areaPath = `M0,100 ` + pts.map(p => `L${p.x},${100 - p.y}`).join(" ") + ` L100,100 Z`;

  return (
    <div className="h-14 w-full">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="rgb(16 185 129 / 0.35)" />
            <stop offset="100%" stopColor="rgb(16 185 129 / 0)" />
          </linearGradient>
        </defs>
        {/* Gridlines */}
        {[25, 50, 75].map((g) => (
          <line key={g} x1={g} y1="0" x2={g} y2="100" stroke="rgb(255 255 255 / 0.06)" strokeWidth="0.4" />
        ))}
        {/* Filled area */}
        <path d={areaPath} fill="url(#curveFill)" />
        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="rgb(16 185 129)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        {/* Dots */}
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={100 - p.y}
            r="1.4"
            fill="rgb(16 185 129)"
            stroke="rgb(15 23 42)"
            strokeWidth="0.6"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}

// ── Single horizontal bar for milestone ──────────────────────────────────────
function DepthBar({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-bold tabular-nums text-on-surface-variant w-10 shrink-0 text-right">{label}</span>
      <div className="flex-1 bg-outline-variant/15 rounded-full h-2 overflow-hidden">
        <div className={`h-2 rounded-full bg-gradient-to-r ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-on-surface tabular-nums w-24 ltr:text-right rtl:text-left shrink-0">
        {compactNumber(value)} <span className="text-on-surface-variant">({pct.toFixed(0)}%)</span>
      </span>
    </div>
  );
}

// ── Enrich + insights helpers ────────────────────────────────────────────────
function enrich(pages: PageDepth[]): EnrichedPage[] {
  return pages
    .filter((p) => p.total > 0)
    .map((p) => {
      const r25  = (p.d25  / p.total) * 100;
      const r50  = (p.d50  / p.total) * 100;
      const r75  = (p.d75  / p.total) * 100;
      const r100 = (p.d100 / p.total) * 100;

      // Find biggest drop and where it happens
      const drops: { at: 25 | 50 | 75 | 100; size: number }[] = [
        { at: 25,  size: 100 - r25 },
        { at: 50,  size: r25 - r50 },
        { at: 75,  size: r50 - r75 },
        { at: 100, size: r75 - r100 },
      ];
      drops.sort((a, b) => b.size - a.size);

      return {
        ...p,
        completion: Math.round(r100),
        cliff: drops[0].at,
        cliffPct: Math.round(drops[0].size),
      };
    });
}

function buildInsights(enriched: EnrichedPage[]) {
  const out: { title: string; reason: string; tone: "good" | "warn" | "info" }[] = [];

  if (!enriched.length) return out;

  const top = [...enriched].sort((a, b) => b.completion - a.completion)[0];
  if (top.completion >= 40) {
    out.push({
      title: `${shortUrl(top.url)} keeps readers engaged`,
      reason: `${top.completion}% of visitors read all the way to the bottom — apply this format to other pages.`,
      tone: "good",
    });
  }

  // Biggest cliff in absolute traffic terms
  const worstCliff = [...enriched]
    .filter((p) => p.total >= 5)
    .sort((a, b) => (b.cliffPct * b.total) - (a.cliffPct * a.total))[0];
  if (worstCliff && worstCliff.cliffPct >= 25) {
    out.push({
      title: `Major drop-off at ${worstCliff.cliff}% on ${shortUrl(worstCliff.url)}`,
      reason: `Only ${(100 - worstCliff.cliffPct).toFixed(0)}% of readers make it past the ${worstCliff.cliff}% mark — check page length, layout, or load behaviour at that point.`,
      tone: "warn",
    });
  }

  // Pages that load but never scroll
  const noScroll = enriched.filter((p) => p.d25 / p.total < 0.5 && p.total >= 10);
  if (noScroll.length) {
    const worst = noScroll.sort((a, b) => b.total - a.total)[0];
    out.push({
      title: `${noScroll.length === 1 ? "Page loads" : `${noScroll.length} pages load`} but no one scrolls`,
      reason: `On ${shortUrl(worst.url)}, only ${Math.round((worst.d25 / worst.total) * 100)}% of visitors scroll past the fold — landing content may not capture attention.`,
      tone: "warn",
    });
  }

  // Site-wide median completion
  const median = [...enriched].sort((a, b) => a.completion - b.completion)[Math.floor(enriched.length / 2)];
  if (median && median.completion < 25 && out.length < 3) {
    out.push({
      title: "Median page completion is low",
      reason: `Across your site the typical page only sees ${median.completion}% of readers reach the end — consider shorter formats or breaking long articles into sections.`,
      tone: "info",
    });
  }

  return out.slice(0, 3);
}

const INSIGHT_TONE = {
  good: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25", label: "Bright spot",  icon: <TrendingUp className="w-3 h-3" /> },
  warn: { bg: "bg-rose-500/15",    text: "text-rose-400",    border: "border-rose-500/25",    label: "Attention",    icon: <TrendingDown className="w-3 h-3" /> },
  info: { bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-amber-500/25",   label: "Heads up",     icon: <Sparkles className="w-3 h-3" /> },
};

// ── Per-page row ─────────────────────────────────────────────────────────────
function PageRow({ page }: { page: EnrichedPage }) {
  const [open, setOpen] = useState(false);
  const tone = completionBar(page.completion);
  const textTone = completionColor(page.completion);

  return (
    <div className="border-b border-outline-variant/10 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 text-left hover:bg-surface-container/40 transition-colors"
      >
        {/* URL + curve */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              page.completion >= 50 ? "bg-emerald-500" :
              page.completion >= 30 ? "bg-lime-400" :
              page.completion >= 15 ? "bg-amber-400" :
              "bg-rose-500"
            }`} />
            <p className="text-sm font-semibold text-on-surface truncate" title={page.url}>{shortUrl(page.url)}</p>
          </div>
          <MiniCurve {...page} />
        </div>

        {/* Right metrics */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:w-32 shrink-0 sm:ltr:ml-3 sm:rtl:mr-3">
          <div className="text-right">
            <p className={`text-2xl font-black tabular-nums ${textTone}`}>{page.completion}%</p>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">read all</p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] text-on-surface-variant tabular-nums">
            <Users className="w-3 h-3" /> {compactNumber(page.total)}
            {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <DepthBar value={page.d25}  max={page.total} label="25%"  color="from-emerald-500 to-emerald-400" />
          <DepthBar value={page.d50}  max={page.total} label="50%"  color="from-lime-500 to-lime-400" />
          <DepthBar value={page.d75}  max={page.total} label="75%"  color="from-amber-500 to-amber-400" />
          <DepthBar value={page.d100} max={page.total} label="100%" color={tone} />

          <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant pt-1">
            <span>Biggest drop:
              <span className="font-bold text-on-surface ms-1 tabular-nums">
                {page.cliffPct}%
              </span> at the <span className="font-bold text-on-surface tabular-nums">{page.cliff}%</span> mark
            </span>
            <a
              href={page.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Open page <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`bg-surface-container/40 rounded-2xl animate-pulse ${className}`} />;
}

function Header() {
  return (
    <div>
      <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
        <ArrowDownToLine className="w-6 h-6 text-primary" /> Scroll Depth
      </h1>
      <p className="text-on-surface-variant text-sm mt-0.5">
        How far visitors scroll on each page — spot where your content loses attention.
      </p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
function Content() {
  const { selectedDomainId } = useAuthStore();

  const { data, isLoading } = useQuery<PageDepth[]>({
    queryKey: ["scroll-depth", selectedDomainId],
    queryFn: () => uxApi.scrollDepth(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const pages = data ?? [];
  const enriched = useMemo(() => enrich(pages), [pages]);

  // Site-wide aggregates
  const totals = useMemo(() => {
    const sumTotal = enriched.reduce((s, p) => s + p.total, 0);
    const sum25  = enriched.reduce((s, p) => s + p.d25,  0);
    const sum50  = enriched.reduce((s, p) => s + p.d50,  0);
    const sum75  = enriched.reduce((s, p) => s + p.d75,  0);
    const sum100 = enriched.reduce((s, p) => s + p.d100, 0);
    return { sumTotal, sum25, sum50, sum75, sum100 };
  }, [enriched]);

  const overallCompletion = totals.sumTotal > 0 ? (totals.sum100 / totals.sumTotal) * 100 : 0;
  const verdict = verdictFromCompletion(overallCompletion);

  const r25  = totals.sumTotal > 0 ? (totals.sum25  / totals.sumTotal) * 100 : 0;
  const r50  = totals.sumTotal > 0 ? (totals.sum50  / totals.sumTotal) * 100 : 0;
  const r75  = totals.sumTotal > 0 ? (totals.sum75  / totals.sumTotal) * 100 : 0;
  const r100 = totals.sumTotal > 0 ? (totals.sum100 / totals.sumTotal) * 100 : 0;

  // Site-wide cliff
  const cliffs = [
    { at: 25,  drop: 100 - r25 },
    { at: 50,  drop: r25 - r50 },
    { at: 75,  drop: r50 - r75 },
    { at: 100, drop: r75 - r100 },
  ].sort((a, b) => b.drop - a.drop);
  const biggestCliff = cliffs[0];

  const insights = useMemo(() => buildInsights(enriched), [enriched]);

  // Filter / search / sort
  const [filter, setFilter] = useState<DepthFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<DepthSort>("completion");

  const filteredPages = useMemo(() => {
    let list = enriched;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.url.toLowerCase().includes(q));
    }
    if (filter === "best") {
      list = list.filter((p) => p.completion >= 40);
    } else if (filter === "worst") {
      list = list.filter((p) => p.completion < 20);
    } else if (filter === "midcliff") {
      list = list.filter((p) => (p.cliff === 50 || p.cliff === 75) && p.cliffPct >= 20);
    }
    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sort) {
        case "traffic": return b.total - a.total;
        case "cliff":   return b.cliffPct - a.cliffPct;
        default:        return b.completion - a.completion;
      }
    });
    return sorted;
  }, [enriched, query, filter, sort]);

  const filterCounts = useMemo(() => ({
    all:      enriched.length,
    best:     enriched.filter((p) => p.completion >= 40).length,
    worst:    enriched.filter((p) => p.completion < 20).length,
    midcliff: enriched.filter((p) => (p.cliff === 50 || p.cliff === 75) && p.cliffPct >= 20).length,
  }), [enriched]);

  // ── Guard states ────────────────────────────────────────────────────────────
  if (!selectedDomainId) {
    return (
      <div className="space-y-6">
        <Header />
        <Card>
          <CardContent className="py-16 text-center">
            <ArrowDownToLine className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
            <p className="text-on-surface font-semibold">Select a domain to view scroll depth.</p>
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

  if (enriched.length === 0) {
    return (
      <div className="space-y-6">
        <Header />
        <Card>
          <CardContent className="py-16 text-center">
            <ArrowDownToLine className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
            <p className="text-on-surface font-semibold">No scroll depth data yet</p>
            <p className="text-on-surface-variant text-sm mt-1 max-w-md mx-auto">
              The tracker fires scroll events at 25%, 50%, 75%, and 100% of page height. Data will appear once visitors load and scroll through your pages.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const topPage    = [...enriched].sort((a, b) => b.completion - a.completion)[0];
  const bottomPage = [...enriched].sort((a, b) => a.completion - b.completion)[0];

  return (
    <div className="space-y-6">
      <Header />

      {/* ── Hero: completion gauge + funnel ─────────────────────────────── */}
      <Card className="overflow-hidden border-outline-variant/20">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start lg:items-center">
            {/* Gauge + verdict */}
            <div className="flex items-center gap-5 w-full lg:w-auto">
              <CompletionGauge pct={Math.round(overallCompletion)} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Reader engagement</p>
                <h2 className={`text-2xl font-black mt-0.5 ${verdict.tone}`}>{verdict.label}</h2>
                <p className="text-xs text-on-surface-variant mt-1 max-w-sm">{verdict.hint}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px self-stretch bg-outline-variant/20" />

            {/* Funnel */}
            <div className="flex-1 w-full">
              <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Site-wide retention</p>
              <div className="space-y-2">
                <FunnelStep label="Loaded"  value={totals.sumTotal} pctOfTotal={100} prevPct={null} tone="from-sky-500 to-sky-400" />
                <FunnelStep label="25%"     value={totals.sum25}    pctOfTotal={r25}  prevPct={100}  tone="from-emerald-500 to-emerald-400" />
                <FunnelStep label="50%"     value={totals.sum50}    pctOfTotal={r50}  prevPct={r25}  tone="from-lime-500 to-lime-400" />
                <FunnelStep label="75%"     value={totals.sum75}    pctOfTotal={r75}  prevPct={r50}  tone="from-amber-500 to-amber-400" />
                <FunnelStep label="100%"    value={totals.sum100}   pctOfTotal={r100} prevPct={r75}  tone="from-rose-500 to-rose-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── KPI tiles ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-black text-on-surface tabular-nums">{enriched.length}</p>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant mt-0.5">Pages tracked</p>
            <p className="text-[11px] text-on-surface-variant/70 mt-0.5">Active in the period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-black text-on-surface tabular-nums">{compactNumber(totals.sumTotal)}</p>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant mt-0.5">Visitors measured</p>
            <p className="text-[11px] text-on-surface-variant/70 mt-0.5">Triggered a scroll event</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className={`text-2xl font-black tabular-nums ${completionColor(overallCompletion)}`}>{overallCompletion.toFixed(0)}%</p>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant mt-0.5">Avg full read</p>
            <p className="text-[11px] text-on-surface-variant/70 mt-0.5">Visitors who reach the bottom</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-black text-rose-400 tabular-nums">{biggestCliff.at}%</p>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant mt-0.5">Biggest drop-off</p>
            <p className="text-[11px] text-on-surface-variant/70 mt-0.5">
              −{biggestCliff.drop.toFixed(0)}% leave at this mark
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Best & worst pages quick highlight ────────────────────────────── */}
      {(topPage || bottomPage) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topPage && (
            <Card className="border-emerald-500/25">
              <CardHeader className="pb-2">
                <CardTitle className="text-[11px] uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-emerald-400" /> Best performing page
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-semibold text-on-surface truncate" title={topPage.url}>{shortUrl(topPage.url)}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-on-surface-variant">
                  <span className="text-emerald-400 font-black tabular-nums">{topPage.completion}%</span>
                  read all · <span className="tabular-nums">{compactNumber(topPage.total)}</span> visitors
                </div>
              </CardContent>
            </Card>
          )}
          {bottomPage && bottomPage.url !== topPage?.url && (
            <Card className="border-rose-500/25">
              <CardHeader className="pb-2">
                <CardTitle className="text-[11px] uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> Needs most attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-semibold text-on-surface truncate" title={bottomPage.url}>{shortUrl(bottomPage.url)}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-on-surface-variant">
                  <span className="text-rose-400 font-black tabular-nums">{bottomPage.completion}%</span>
                  read all · biggest drop at <span className="tabular-nums">{bottomPage.cliff}%</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── Insights ─────────────────────────────────────────────────────── */}
      {insights.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader className="border-b border-outline-variant/15 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Insights
              <Badge variant="secondary">{insights.length}</Badge>
            </CardTitle>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Observations from your scroll data — places to investigate or replicate.
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

      {/* ── Page list ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="border-b border-outline-variant/15 pb-3 gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4 text-primary" /> Pages
              <Badge variant="secondary">{enriched.length}</Badge>
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
                  onChange={(e) => setSort(e.target.value as DepthSort)}
                  className="h-9 ltr:pl-9 rtl:pr-9 ltr:pr-8 rtl:pl-8 rounded-lg border border-outline-variant/40 bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="completion">Sort: Completion</option>
                  <option value="traffic">Sort: Traffic</option>
                  <option value="cliff">Sort: Biggest drop</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <ListFilter className="w-3.5 h-3.5 text-on-surface-variant" />
            {([
              { key: "all",      label: "All",                   count: filterCounts.all },
              { key: "best",     label: "Strong (≥40%)",         count: filterCounts.best },
              { key: "midcliff", label: "Mid-content drop-off",  count: filterCounts.midcliff },
              { key: "worst",    label: "Weak (<20%)",           count: filterCounts.worst },
            ] as { key: DepthFilter; label: string; count: number }[]).map((f) => {
              const active = filter === f.key;
              const tone = f.key === "best" ? "border-emerald-500/30 text-emerald-400"
                : f.key === "worst" ? "border-rose-500/30 text-rose-400"
                : f.key === "midcliff" ? "border-amber-500/30 text-amber-400"
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

export default function ScrollDepthPage() {
  return <Content />;
}
