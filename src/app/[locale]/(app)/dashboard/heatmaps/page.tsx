"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { uxApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, LoaderCircle, ImageOff, ChevronDown, ChevronUp, RefreshCw, X, Maximize2 } from "lucide-react";

type HeatmapRow = {
  url: string;
  type: string;
  x: number;
  y: number;
  count: number;
};

type HeatmapPage = {
  url: string;
  rows: HeatmapRow[];
  totalEvents: number;
};

function toPageLabel(pageUrl: string) {
  try {
    const url = new URL(pageUrl);
    const path = `${url.pathname}${url.search}` || "/";
    return `${url.hostname}${path === "/" ? "" : path}`;
  } catch {
    return pageUrl;
  }
}

function useHeatmapScreenshot(domainId: number | undefined, pageUrl: string, enabled: boolean, bust: boolean) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (!enabled || !domainId || !pageUrl) {
      setImageUrl(null);
      setError(null);
      setLoading(false);
      setDimensions(null);
      return;
    }

    const controller = new AbortController();
    const screenshotDomainId = Number(domainId);
    let blobUrl: string | null = null;

    async function loadScreenshot() {
      setLoading(true);
      setError(null);

      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("eye_token") : null;
        const apiBase = `${process.env.NEXT_PUBLIC_API_URL || ""}/api/${process.env.NEXT_PUBLIC_API_VERSION || "v1"}`;
        const bustParam = bust ? "&bust=1" : "";
        const endpoint = `${apiBase}/ux/${screenshotDomainId}/heatmap/screenshot?url=${encodeURIComponent(pageUrl)}${bustParam}`;

        const res = await fetch(endpoint, {
          signal: controller.signal,
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            Accept: "image/png",
            "X-Public-Key": process.env.NEXT_PUBLIC_APP_PUBLIC_KEY || "",
            "X-Secret-Key": process.env.NEXT_PUBLIC_APP_SECRET_KEY || "",
          },
        });

        if (!res.ok) {
          throw new Error(`Screenshot unavailable (${res.status})`);
        }

        const blob = await res.blob();
        if (!blob.type.startsWith("image/")) {
          throw new Error("Invalid response type from screenshot endpoint.");
        }

        blobUrl = URL.createObjectURL(blob);

        // Read natural dimensions so the heatmap container can match the
        // screenshot's aspect ratio exactly — otherwise object-cover crops
        // the tall full-page image and dots at lower y% positions appear
        // floating in empty space instead of over the matching content.
        const img = new Image();
        img.onload = () => {
          if (!controller.signal.aborted) {
            setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
            setImageUrl(blobUrl);
          }
        };
        img.onerror = () => {
          if (!controller.signal.aborted) {
            setError("Failed to decode screenshot.");
          }
        };
        img.src = blobUrl;
      } catch (err) {
        if (!controller.signal.aborted) {
          setImageUrl(null);
          setError(err instanceof Error ? err.message : "Screenshot unavailable for this page.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadScreenshot();

    return () => {
      controller.abort();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [domainId, enabled, pageUrl]);

  return { imageUrl, error, loading, dimensions };
}

function HeatmapCard({ page, domainId, expanded, onToggle }: { page: HeatmapPage; domainId?: number; expanded: boolean; onToggle: () => void }) {
  const [bust, setBust] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { imageUrl, error, loading, dimensions } = useHeatmapScreenshot(domainId, page.url, expanded, bust);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);
  const maxCount = page.rows.reduce((max, row) => Math.max(max, Number(row.count || 0)), 1);

  const dots = page.rows
    .filter((row) => Number.isFinite(Number(row.x)) && Number.isFinite(Number(row.y)))
    .slice(0, 2000)
    .map((row, idx) => {
      const x = Math.min(99, Math.max(1, Number(row.x)));
      const y = Math.min(99, Math.max(1, Number(row.y)));
      const intensity = Math.max(0.14, Math.min(1, Number(row.count || 0) / maxCount));
      const size = 22 + intensity * 68;
      const isRage = row.type === "rage_click";
      const isDead = row.type === "dead_click";
      const color = isRage
        ? `rgba(239, 68, 68, ${Math.min(0.95, 0.28 + intensity * 0.7)})`
        : isDead
          ? `rgba(249, 115, 22, ${Math.min(0.9, 0.24 + intensity * 0.66)})`
          : `rgba(59, 130, 246, ${Math.min(0.85, 0.2 + intensity * 0.62)})`;

      return {
        id: `${row.type}-${x}-${y}-${idx}`,
        x,
        y,
        size,
        color,
        count: Number(row.count || 0),
        type: row.type,
      };
    });

  return (
    <>
    <Card>
      <CardHeader className="space-y-3">
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-start justify-between gap-3 text-left"
        >
          <div>
            <CardTitle className="text-sm text-on-surface">{toPageLabel(page.url)}</CardTitle>
            <p className="text-xs text-on-surface-variant break-all mt-1">{page.url}</p>
          </div>
          <div className="text-right text-xs text-on-surface-variant shrink-0 inline-flex items-center gap-2">
            <span>{page.totalEvents.toLocaleString()} events</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          <div
            className="relative w-full overflow-hidden rounded-xl border border-outline-variant/30 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.08),transparent_36%),linear-gradient(180deg,#0f172a_0%,#1e293b_100%)]"
            style={
              imageUrl && dimensions
                ? { aspectRatio: `${dimensions.width} / ${dimensions.height}` }
                : { aspectRatio: "16 / 9" }
            }
          >
            {imageUrl ? (
              <img src={imageUrl} alt={`Heatmap screenshot for ${page.url}`} className="absolute inset-0 h-full w-full object-contain" />
            ) : (
              <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
              />
            )}

            <div className="absolute inset-0 bg-slate-950/12" />

            {dots.map((dot) => (
              <div
                key={dot.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-[2px]"
                title={`${dot.type.replaceAll("_", " ")} • ${dot.count} events`}
                style={{
                  left: `${dot.x}%`,
                  top: `${dot.y}%`,
                  width: `${dot.size}px`,
                  height: `${dot.size}px`,
                  background: `radial-gradient(circle, ${dot.color} 0%, rgba(0,0,0,0) 72%)`,
                  zIndex: 10,
                }}
              />
            ))}

            {loading && (
              <div className="absolute top-3 right-3 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white" style={{ zIndex: 20 }}>
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Capturing screenshot
              </div>
            )}
            {!loading && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5" style={{ zIndex: 20 }}>
                {imageUrl && (
                  <button
                    title="View full size heatmap"
                    onClick={() => setLightboxOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white hover:bg-black/80 transition-colors"
                  >
                    <Maximize2 className="h-3 w-3" /> Full size
                  </button>
                )}
                <button
                  title="Refresh screenshot (bypass cache)"
                  onClick={() => setBust((b) => !b)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white hover:bg-black/80 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" /> Refresh
                </button>
              </div>
            )}

            {error && (
              <div className="absolute inset-x-3 bottom-3 rounded-lg bg-black/65 px-3 py-2 text-xs text-white/80" style={{ zIndex: 20 }}>
                <span className="inline-flex items-center gap-2"><ImageOff className="h-3.5 w-3.5" /> {error}</span>
              </div>
            )}
          </div>

          {/* Legend — what the colors and sizes mean */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">How to read this map</p>
            <div className="flex flex-wrap gap-4 text-xs text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 opacity-70" />
                <span><strong className="text-on-surface">Regular click</strong> — normal interaction</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span><strong className="text-on-surface">Dead click</strong> — clicked but nothing happened</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span><strong className="text-on-surface">Rage click</strong> — frustrated repeated clicking</span>
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              <strong className="text-on-surface">Bigger &amp; brighter</strong> = more clicks in that spot.
              <span className="text-primary ml-2">Red zones = where people focus most.</span>
            </p>
          </div>
        </CardContent>
      )}
    </Card>

    {/* ── Fullscreen lightbox ───────────────────────────────────────────── */}
    {lightboxOpen && imageUrl && (
      <div
        className="fixed inset-0 z-50 bg-black/92 overflow-y-auto"
        onClick={(e) => { if (e.target === e.currentTarget) setLightboxOpen(false); }}
      >
        {/* Close button — stays in corner while scrolling */}
        <button
          onClick={() => setLightboxOpen(false)}
          className="fixed top-4 right-4 z-[60] flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1.5 text-sm text-white hover:bg-white/10 border border-white/20 transition-colors"
        >
          <X className="w-4 h-4" /> Close
        </button>

        {/* URL bar */}
        <div className="sticky top-0 z-[55] bg-black/80 backdrop-blur-sm border-b border-white/10 px-4 py-2 flex items-center gap-3 pr-28">
          <Flame className="w-4 h-4 text-orange-400 shrink-0" />
          <span className="text-xs text-white/70 truncate">{page.url}</span>
        </div>

        {/* Image + click dots */}
        <div className="relative w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`Full page heatmap for ${page.url}`}
            className="block w-full"
            draggable={false}
          />
          <div className="absolute inset-0 pointer-events-none">
            {dots.map((dot) => (
              <div
                key={`lb-${dot.id}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-[3px]"
                title={`${dot.type.replaceAll("_", " ")} \u2022 ${dot.count} events`}
                style={{
                  left: `${dot.x}%`,
                  top: `${dot.y}%`,
                  width: `${dot.size * 1.4}px`,
                  height: `${dot.size * 1.4}px`,
                  background: `radial-gradient(circle, ${dot.color} 0%, rgba(0,0,0,0) 72%)`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-black/80 border-t border-white/10 px-4 py-3 flex flex-wrap gap-x-6 gap-y-2 items-center text-xs text-white/60">
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500/80 shrink-0" /> Regular click</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500 shrink-0" /> Dead click</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 shrink-0" /> Rage click</span>
          <span className="ml-auto font-medium text-white/40">{dots.length.toLocaleString()} click points</span>
        </div>
      </div>
    )}
    </>
  );
}

export default function HeatmapsPage() {
  const { selectedDomainId } = useAuthStore();
  const [pageFilter, setPageFilter] = useState("");
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null);

  const { data: heatmapRows } = useQuery({
    queryKey: ["ux-heatmap", selectedDomainId],
    queryFn: () =>
      uxApi.heatmap(selectedDomainId!).then((r) => {
        const payload = r.data;
        const rows = Array.isArray(payload) ? payload : (payload?.data ?? []);
        return rows.map((row: any) => ({
          url: String(row.url ?? ""),
          type: String(row.type ?? "click"),
          x: Number(row.x ?? 0),
          y: Number(row.y ?? 0),
          count: Number(row.count ?? 0),
        }));
      }),
    enabled: !!selectedDomainId,
  });

  const pages = useMemo<HeatmapPage[]>(() => {
    const grouped = new Map<string, HeatmapPage>();

    (heatmapRows || []).forEach((row: HeatmapRow) => {
      if (!row.url) return;
      const existing = grouped.get(row.url) ?? { url: row.url, rows: [], totalEvents: 0 };
      existing.rows.push(row);
      existing.totalEvents += Number(row.count || 0);
      grouped.set(row.url, existing);
    });

    return Array.from(grouped.values()).sort((left, right) => right.totalEvents - left.totalEvents);
  }, [heatmapRows]);

  const filteredPages = useMemo(() => {
    const query = pageFilter.trim().toLowerCase();
    if (!query) return pages;
    return pages.filter((page) => page.url.toLowerCase().includes(query));
  }, [pageFilter, pages]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Heatmaps</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">
          Page-by-page heatmaps with cached screenshots. Open a page card to load its screenshot on demand.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
            <Flame className="w-4 h-4" /> Heatmap By Page
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-on-surface-variant">
              Screenshots are generated once and reused from cache to avoid server overload.
            </p>
            <input
              value={pageFilter}
              onChange={(e) => setPageFilter(e.target.value)}
              placeholder="Filter pages"
              className="w-full md:w-80 rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2 text-sm text-on-surface"
            />
          </div>

          {filteredPages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-outline-variant/30 px-6 py-12 text-center text-sm text-on-surface-variant">
              No page heatmaps found for the current filter.
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPages.map((page) => (
                <HeatmapCard
                  key={page.url}
                  page={page}
                  domainId={selectedDomainId ?? undefined}
                  expanded={expandedUrl === page.url}
                  onToggle={() => setExpandedUrl((prev) => (prev === page.url ? null : page.url))}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
