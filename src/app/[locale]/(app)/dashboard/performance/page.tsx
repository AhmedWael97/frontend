"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function ms(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(2)}s`;
  return `${v}ms`;
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
    return (p === "/" ? "" : p) || u.hostname;
  } catch {
    return url.length > 60 ? "…" + url.slice(-60) : url;
  }
}

const RATING_CLASS: Record<string, string> = {
  good: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "needs-improvement": "bg-yellow-400/15 text-yellow-300 border-yellow-400/20",
  poor: "bg-rose-500/15 text-rose-400 border-rose-500/20",
};
const RATING_ICON: Record<string, React.ReactNode> = {
  good: <CheckCircle className="w-3.5 h-3.5" />,
  "needs-improvement": <AlertTriangle className="w-3.5 h-3.5" />,
  poor: <XCircle className="w-3.5 h-3.5" />,
};

function RatingBadge({ rating }: { rating: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${RATING_CLASS[rating] ?? RATING_CLASS.poor}`}>
      {RATING_ICON[rating]}
      {rating === "needs-improvement" ? "Needs work" : rating.charAt(0).toUpperCase() + rating.slice(1)}
    </span>
  );
}

// Load event bar — visual indicator relative to a 6 s budget
function LoadBar({ ms: v, budget = 6000 }: { ms: number; budget?: number }) {
  const pct = Math.min(100, (v / budget) * 100);
  const color = v < 2500 ? "bg-emerald-500" : v < 4000 ? "bg-yellow-400" : "bg-rose-500";
  return (
    <div className="w-full bg-outline-variant/20 rounded-full h-1.5">
      <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

const ASSET_ICONS: Record<string, React.ReactNode> = {
  img: <FileImage className="w-3.5 h-3.5 text-yellow-400" />,
  image: <FileImage className="w-3.5 h-3.5 text-yellow-400" />,
  script: <Code2 className="w-3.5 h-3.5 text-blue-400" />,
  css: <Type className="w-3.5 h-3.5 text-purple-400" />,
  font: <Type className="w-3.5 h-3.5 text-pink-400" />,
  fetch: <Globe className="w-3.5 h-3.5 text-sky-400" />,
  xmlhttprequest: <Globe className="w-3.5 h-3.5 text-sky-400" />,
  other: <Box className="w-3.5 h-3.5 text-slate-400" />,
};
function assetIcon(type: string) {
  return ASSET_ICONS[type.toLowerCase()] ?? ASSET_ICONS.other;
}

// ── Components ────────────────────────────────────────────────────────────────
function PageLoadRow({ page }: { page: PageLoad }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-outline-variant/10 last:border-0">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-container/30 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="shrink-0 w-16 text-right">
          <span className={`text-sm font-black ${page.rating === "good" ? "text-emerald-400" : page.rating === "needs-improvement" ? "text-yellow-400" : "text-rose-400"}`}>
            {ms(page.avg_load_event)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate">{shortUrl(page.url)}</p>
          <LoadBar ms={page.avg_load_event} />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <RatingBadge rating={page.rating} />
          <span className="text-xs text-on-surface-variant">{page.samples} samples</span>
          {open ? <ChevronUp className="w-4 h-4 text-on-surface-variant" /> : <ChevronDown className="w-4 h-4 text-on-surface-variant" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "TTFB",            val: ms(page.avg_ttfb),            icon: <Zap className="w-3.5 h-3.5 text-primary" />,  help: "Time to first byte — server response speed" },
              { label: "DOM Interactive", val: ms(page.avg_dom_interactive), icon: <Clock className="w-3.5 h-3.5 text-sky-400" />, help: "When the page becomes usable" },
              { label: "DOM Complete",    val: ms(page.avg_dom_complete),    icon: <Clock className="w-3.5 h-3.5 text-blue-400" />,help: "When all deferred content has loaded" },
              { label: "Transfer Size",   val: kb(page.avg_transfer_size),   icon: <Box className="w-3.5 h-3.5 text-yellow-400" />,help: "Compressed bytes sent over the wire" },
            ].map((m) => (
              <div key={m.label} className="rounded-lg bg-surface-container/30 p-3 border border-outline-variant/15">
                <div className="flex items-center gap-1.5 mb-1">{m.icon}<span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">{m.label}</span></div>
                <span className="text-base font-black text-on-surface">{m.val}</span>
                <p className="text-[10px] text-on-surface-variant mt-0.5">{m.help}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SlowAssetRow({ asset }: { asset: SlowAsset }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant/10 last:border-0 hover:bg-surface-container/20 transition-colors">
      <span className="shrink-0">{assetIcon(asset.type)}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-mono text-on-surface truncate" title={asset.url}>{asset.url.length > 80 ? "…" + asset.url.slice(-80) : asset.url}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[10px] uppercase tracking-wide text-on-surface-variant">{asset.type}</span>
          {asset.avg_size > 0 && <span className="text-[10px] text-on-surface-variant">{kb(asset.avg_size)}</span>}
          <span className="text-[10px] text-on-surface-variant">{asset.occurrences}× seen</span>
        </div>
      </div>
      <span className="text-sm font-black text-rose-400 shrink-0">{ms(asset.avg_duration)}</span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function Content() {
  const { selectedDomainId } = useAuthStore();

  const { data, isLoading } = useQuery<PerformanceData>({
    queryKey: ["performance", selectedDomainId],
    queryFn: () => uxApi.performance(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  if (!selectedDomainId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-on-surface-variant">Select a domain to view performance data.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Gauge className="w-6 h-6 text-primary animate-pulse mr-3" />
        <p className="text-on-surface-variant">Loading performance data…</p>
      </div>
    );
  }

  const pages = data?.pages ?? [];
  const slowAssets = data?.slow_assets ?? [];

  const goodCount = pages.filter((p) => p.rating === "good").length;
  const niCount = pages.filter((p) => p.rating === "needs-improvement").length;
  const poorCount = pages.filter((p) => p.rating === "poor").length;

  const avgLoad = pages.length
    ? Math.round(pages.reduce((s, p) => s + p.avg_load_event, 0) / pages.length)
    : 0;
  const avgTtfb = pages.length
    ? Math.round(pages.reduce((s, p) => s + p.avg_ttfb, 0) / pages.length)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
          <Gauge className="w-6 h-6 text-primary" /> Performance Monitoring
        </h1>
        <p className="text-on-surface-variant text-sm mt-0.5">
          Page load times and slow asset detection based on real visitor data.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Avg Load Time",  value: pages.length ? ms(avgLoad) : "—", icon: <Clock className="w-5 h-5 text-primary" />, color: "text-on-surface" },
          { label: "Avg TTFB",       value: pages.length ? ms(avgTtfb) : "—", icon: <Zap className="w-5 h-5 text-sky-400" />,  color: "text-on-surface" },
          { label: "Slow Assets",    value: String(slowAssets.length),          icon: <FileImage className="w-5 h-5 text-yellow-400" />, color: "text-yellow-400" },
          { label: "Poor Pages",     value: String(poorCount),                   icon: <XCircle className="w-5 h-5 text-rose-400" />,    color: "text-rose-400" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-surface-container/40">{s.icon}</div>
              <div>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-on-surface-variant">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rating breakdown bar */}
      {pages.length > 0 && (
        <div className="flex gap-4 items-center">
          <div className="flex-1 flex h-3 rounded-full overflow-hidden gap-0.5">
            {goodCount > 0 && (
              <div className="bg-emerald-500 transition-all" style={{ width: `${(goodCount / pages.length) * 100}%` }} title={`${goodCount} good`} />
            )}
            {niCount > 0 && (
              <div className="bg-yellow-400 transition-all" style={{ width: `${(niCount / pages.length) * 100}%` }} title={`${niCount} needs work`} />
            )}
            {poorCount > 0 && (
              <div className="bg-rose-500 transition-all" style={{ width: `${(poorCount / pages.length) * 100}%` }} title={`${poorCount} poor`} />
            )}
          </div>
          <div className="flex gap-3 text-xs text-on-surface-variant shrink-0">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />{goodCount} good</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" />{niCount} needs work</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" />{poorCount} poor</span>
          </div>
        </div>
      )}

      {/* Page load table */}
      <Card>
        <CardHeader className="border-b border-outline-variant/20 pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Page Load Times
            <Badge variant="secondary">{pages.length} pages</Badge>
          </CardTitle>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Average timings across real visitor sessions. Click a row to expand detailed metrics.
          </p>
        </CardHeader>
        {pages.length === 0 ? (
          <CardContent className="py-12 text-center text-on-surface-variant text-sm">
            No page load data yet. The tracker will start reporting once visitors load your pages.
          </CardContent>
        ) : (
          <div>
            {pages.map((page) => (
              <PageLoadRow key={page.url} page={page} />
            ))}
          </div>
        )}
      </Card>

      {/* Slow assets table */}
      <Card>
        <CardHeader className="border-b border-outline-variant/20 pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileImage className="w-4 h-4 text-yellow-400" /> Slow Assets
            <Badge variant="secondary">{slowAssets.length} assets</Badge>
          </CardTitle>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Resources that took over 1 second to load, ordered by average load time.
          </p>
        </CardHeader>
        {slowAssets.length === 0 ? (
          <CardContent className="py-12 text-center text-on-surface-variant text-sm">
            No slow assets detected. Your pages are loading resources quickly.
          </CardContent>
        ) : (
          <div>
            {slowAssets.map((asset, i) => (
              <SlowAssetRow key={`${asset.url}-${i}`} asset={asset} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function PerformancePage() {
  return <Content />;
}
