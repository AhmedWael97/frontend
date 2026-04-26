"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uxApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { ArrowDownToLine, TrendingDown } from "lucide-react";

type PageDepth = {
  url: string;
  d25: number;
  d50: number;
  d75: number;
  d100: number;
  total: number;
};

function DepthBar({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[10px] text-on-surface-variant w-8 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-surface-container rounded-full h-2 min-w-0">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-on-surface w-12 text-right flex-shrink-0">
        {value.toLocaleString()} <span className="text-on-surface-variant">({pct}%)</span>
      </span>
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

  const { data, isLoading } = useQuery<PageDepth[]>({
    queryKey: ["scroll-depth", selectedDomainId],
    queryFn: () => uxApi.scrollDepth(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  if (!selectedDomainId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-on-surface-variant">Select a domain to view scroll depth.</p>
      </div>
    );
  }

  const pages = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
          <ArrowDownToLine className="w-6 h-6 text-primary" />
          Scroll Depth
        </h1>
        <p className="text-on-surface-variant text-sm mt-0.5">
          How far visitors scroll on each page — spot where your content loses attention.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-40">
          <p className="text-on-surface-variant text-sm">Loading…</p>
        </div>
      )}

      {!isLoading && pages.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingDown className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-3" />
            <p className="text-on-surface-variant text-sm">No scroll depth data yet.</p>
            <p className="text-on-surface-variant/60 text-xs mt-1">
              The tracker fires scroll events at 25%, 50%, 75%, and 100% of page height.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && pages.length > 0 && (
        <div className="space-y-3">
          {pages.map((page) => (
            <Card key={page.url}>
              <CardHeader className="pb-2">
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
                  <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full flex-shrink-0">
                    {page.total.toLocaleString()} visitors
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <DepthBar value={page.d25}  max={page.total} label="25%"  color="bg-emerald-500" />
                <DepthBar value={page.d50}  max={page.total} label="50%"  color="bg-yellow-400" />
                <DepthBar value={page.d75}  max={page.total} label="75%"  color="bg-orange-400" />
                <DepthBar value={page.d100} max={page.total} label="100%" color="bg-rose-500" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ScrollDepthPage() {
  return <Content />;
}
