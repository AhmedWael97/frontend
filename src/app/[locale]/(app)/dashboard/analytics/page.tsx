"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import {
  ArrowUpRight, ArrowDownRight, GitCompare,
  Globe, MousePointerClick, Monitor, Smartphone, Tablet,
  TrendingUp, BarChart3, Layers, Zap,
} from "lucide-react";

/** Compute % change */
function pctDelta(current: number, prev: number | undefined): { label: string; up: boolean } | null {
  if (!prev) return null;
  const pct = Math.round(((current - prev) / prev) * 100);
  return { label: (pct >= 0 ? "+" : "") + pct + "%", up: pct >= 0 };
}

function DeltaBadge({ current, prev }: { current: number; prev: number | undefined }) {
  const d = pctDelta(current, prev);
  if (!d) return null;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${d.up ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
      {d.up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
      {d.label}
    </span>
  );
}

function shortUrl(raw: string): string {
  try {
    const path = new URL(raw).pathname.replace(/\/$/, "");
    const parts = path.split("/").filter(Boolean);
    if (!parts.length) return "/";
    return parts.length > 2 ? `…/${parts.slice(-2).join("/")}` : `/${parts.join("/")}`;
  } catch {
    return raw.length > 40 ? `…${raw.slice(-38)}` : raw;
  }
}

function referrerHost(ref: string): string | null {
  try { return new URL(ref.startsWith("http") ? ref : `https://${ref}`).hostname; }
  catch { return null; }
}

/** A progress bar row used across all list sections */
function DataRow({
  icon, label, sublabel, value, pct, prev, rank,
}: {
  icon?: React.ReactNode;
  label: string;
  sublabel?: string;
  value: number;
  pct: number;
  prev?: number;
  rank?: number;
}) {
  return (
    <div className="group px-4 py-3 hover:bg-surface-container/40 transition-colors">
      <div className="flex items-center gap-3 mb-1.5">
        {rank !== undefined && (
          <span className="text-[10px] font-bold text-on-surface-variant/40 w-4 shrink-0 text-right">{rank}</span>
        )}
        {icon && <span className="shrink-0 opacity-70">{icon}</span>}
        <span className="flex-1 text-sm text-on-surface truncate" title={label}>{label}</span>
        {sublabel && <span className="text-[11px] text-on-surface-variant/60 hidden sm:block truncate max-w-[120px]">{sublabel}</span>}
        <div className="flex items-center gap-2 shrink-0">
          <DeltaBadge current={value} prev={prev} />
          <span className="text-sm font-semibold text-on-surface tabular-nums">{value.toLocaleString()}</span>
          <span className="text-[11px] text-on-surface-variant w-10 text-right tabular-nums">{pct.toFixed(1)}%</span>
        </div>
      </div>
      <div className="h-1 rounded-full bg-surface-container-high overflow-hidden ltr:ml-7 rtl:mr-7">
        <div
          className="h-full rounded-full bg-primary/60 transition-all duration-700"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

/** Device/browser icon by name */
function deviceIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("mobile") || n.includes("phone")) return <Smartphone className="w-3.5 h-3.5 text-primary" />;
  if (n.includes("tablet")) return <Tablet className="w-3.5 h-3.5 text-primary" />;
  return <Monitor className="w-3.5 h-3.5 text-on-surface-variant" />;
}

function NoData({ message = "No data for this period" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-on-surface-variant">
      <BarChart3 className="w-10 h-10 opacity-20" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

/** Summary stat card */
function StatCard({ label, value, icon: Icon, color = "text-primary" }: {
  label: string; value: string | number; icon: React.ElementType; color?: string;
}) {
  const bg = color.includes("emerald") ? "bg-emerald-400/10" :
             color.includes("sky")     ? "bg-sky-400/10"     :
             color.includes("violet")  ? "bg-violet-400/10"  :
             color.includes("amber")   ? "bg-amber-400/10"   :
             "bg-primary/10";
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bg} shrink-0`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-black text-on-surface tabular-nums leading-none">{value}</p>
          <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Content() {
  const { selectedDomainId } = useAuthStore();
  const [comparing, setComparing] = useState(false);

  const { data: referrers } = useQuery({
    queryKey: ["referrers", selectedDomainId, comparing],
    queryFn: () => analyticsApi.referrers(selectedDomainId!, { compare: comparing }).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const { data: devices } = useQuery({
    queryKey: ["devices", selectedDomainId, comparing],
    queryFn: () => analyticsApi.devices(selectedDomainId!, { compare: comparing }).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const { data: pages } = useQuery({
    queryKey: ["pages", selectedDomainId, comparing],
    queryFn: () => analyticsApi.pages(selectedDomainId!, { compare: comparing }).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const { data: events } = useQuery({
    queryKey: ["custom-events", selectedDomainId],
    queryFn: () => analyticsApi.customEvents(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  // Normalise compare shape
  const pagesRows: any[]  = comparing ? (pages?.current ?? []) : (Array.isArray(pages) ? pages : []);
  const pagesPrev: any[]  = comparing ? (pages?.prev ?? []) : [];
  const refRows: any[]    = comparing ? (referrers?.current ?? []) : (Array.isArray(referrers) ? referrers : []);
  const refPrev: any[]    = comparing ? (referrers?.prev ?? []) : [];
  const devData: any      = comparing ? (devices?.current ?? {}) : (devices ?? {});

  function prevVisits(list: any[], key: string, value: string): number | undefined {
    return list.find((r: any) => r[key] === value)?.visits ??
           list.find((r: any) => r[key] === value)?.pageviews;
  }

  // Totals for % calculation
  const refTotal  = refRows.reduce((s: number, r: any) => s + Number(r.visits ?? 0), 0);
  const pageTotal = pagesRows.reduce((s: number, r: any) => s + Number(r.pageviews ?? 0), 0);
  const devTotal  = (devData?.devices ?? []).reduce((s: number, d: any) => s + Number(d.visits ?? 0), 0);
  const brwTotal  = (devData?.browsers ?? []).reduce((s: number, d: any) => s + Number(d.visits ?? 0), 0);
  const osTotal   = (devData?.os ?? []).reduce((s: number, d: any) => s + Number(d.visits ?? 0), 0);
  const evtTotal  = Array.isArray(events) ? events.reduce((s: number, e: any) => s + Number(e.occurrences ?? 0), 0) : 0;

  if (!selectedDomainId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-on-surface-variant text-sm">Select a domain from the top bar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Analytics
          </h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Traffic breakdown, top pages, and campaign performance</p>
        </div>
        <button
          onClick={() => setComparing((c) => !c)}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
            comparing
              ? "bg-primary/20 border-primary text-primary"
              : "border-outline-variant/40 text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          {comparing ? "Comparing to prev period" : "Compare to prev period"}
        </button>
      </div>

      {/* Quick-stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total visits (referrers)"    value={refTotal.toLocaleString()}    icon={Globe}             color="text-sky-400"    />
        <StatCard label="Total page views"            value={pageTotal.toLocaleString()}   icon={MousePointerClick} color="text-primary"    />
        <StatCard label="Unique sources"              value={refRows.length}               icon={Layers}            color="text-violet-400" />
        <StatCard label="Custom event types"          value={Array.isArray(events) ? events.length : 0} icon={Zap} color="text-amber-400" />
      </div>

      <Tabs defaultValue="referrers">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="referrers">Referrers</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="devices">Devices & Browsers</TabsTrigger>
          <TabsTrigger value="events">Custom Events</TabsTrigger>
        </TabsList>

        {/* ── Referrers ──────────────────────────────────────────────────── */}
        <TabsContent value="referrers" className="mt-4">
          <Card>
            <CardHeader className="border-b border-outline-variant/20 pb-3">
              <CardTitle className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                Where Visitors Come From
                {refRows.length > 0 && (
                  <span className="ml-auto text-xs font-normal text-on-surface-variant/60">
                    {refRows.length} sources · {refTotal.toLocaleString()} visits
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {refRows.length ? (
                <div className="divide-y divide-outline-variant/10">
                  {refRows.map((r: any, i: number) => {
                    const host = referrerHost(r.referrer);
                    const visits = Number(r.visits ?? 0);
                    const pct = refTotal > 0 ? (visits / refTotal) * 100 : 0;
                    return (
                      <DataRow
                        key={i}
                        rank={i + 1}
                        icon={
                          host ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${host}&sz=16`}
                              alt="" width={16} height={16}
                              className="rounded-sm"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : <Globe className="w-3.5 h-3.5 text-on-surface-variant/50" />
                        }
                        label={r.referrer || "(direct / none)"}
                        sublabel={host ?? undefined}
                        value={visits}
                        pct={pct}
                        prev={comparing ? prevVisits(refPrev, "referrer", r.referrer) : undefined}
                      />
                    );
                  })}
                </div>
              ) : <NoData />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Top Pages ──────────────────────────────────────────────────── */}
        <TabsContent value="pages" className="mt-4">
          <Card>
            <CardHeader className="border-b border-outline-variant/20 pb-3">
              <CardTitle className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-primary" />
                Pages Visited Most
                {pagesRows.length > 0 && (
                  <span className="ml-auto text-xs font-normal text-on-surface-variant/60">
                    {pagesRows.length} pages · {pageTotal.toLocaleString()} views
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pagesRows.length ? (
                <div className="divide-y divide-outline-variant/10">
                  {pagesRows.map((p: any, i: number) => {
                    const views = Number(p.pageviews ?? 0);
                    const pct = pageTotal > 0 ? (views / pageTotal) * 100 : 0;
                    return (
                      <DataRow
                        key={i}
                        rank={i + 1}
                        label={shortUrl(p.url)}
                        sublabel={p.url}
                        value={views}
                        pct={pct}
                        prev={comparing ? prevVisits(pagesPrev, "url", p.url) : undefined}
                      />
                    );
                  })}
                </div>
              ) : <NoData />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Devices & Browsers ─────────────────────────────────────────── */}
        <TabsContent value="devices" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Device types */}
            <Card>
              <CardHeader className="border-b border-outline-variant/20 pb-3">
                <CardTitle className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-primary" /> Devices
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {devData?.devices?.length ? (
                  <div className="divide-y divide-outline-variant/10">
                    {devData.devices.map((d: any, i: number) => {
                      const v = Number(d.visits ?? 0);
                      return (
                        <DataRow
                          key={i}
                          icon={deviceIcon(d.device_type)}
                          label={d.device_type || "Unknown"}
                          value={v}
                          pct={devTotal > 0 ? (v / devTotal) * 100 : 0}
                        />
                      );
                    })}
                  </div>
                ) : <NoData />}
              </CardContent>
            </Card>

            {/* Browsers */}
            <Card>
              <CardHeader className="border-b border-outline-variant/20 pb-3">
                <CardTitle className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-400" /> Browsers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {devData?.browsers?.length ? (
                  <div className="divide-y divide-outline-variant/10">
                    {devData.browsers.map((d: any, i: number) => {
                      const v = Number(d.visits ?? 0);
                      const host = d.browser?.toLowerCase();
                      return (
                        <DataRow
                          key={i}
                          icon={
                            host ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`https://www.google.com/s2/favicons?domain=${host.replace(/\s+/g, "")}.com&sz=16`}
                                alt="" width={14} height={14}
                                className="rounded-sm opacity-80"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                              />
                            ) : undefined
                          }
                          label={d.browser || "Unknown"}
                          value={v}
                          pct={brwTotal > 0 ? (v / brwTotal) * 100 : 0}
                        />
                      );
                    })}
                  </div>
                ) : <NoData />}
              </CardContent>
            </Card>

            {/* Operating Systems */}
            <Card>
              <CardHeader className="border-b border-outline-variant/20 pb-3">
                <CardTitle className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-400" /> Operating Systems
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {devData?.os?.length ? (
                  <div className="divide-y divide-outline-variant/10">
                    {devData.os.map((d: any, i: number) => {
                      const v = Number(d.visits ?? 0);
                      return (
                        <DataRow
                          key={i}
                          label={d.os || "Unknown"}
                          value={v}
                          pct={osTotal > 0 ? (v / osTotal) * 100 : 0}
                        />
                      );
                    })}
                  </div>
                ) : <NoData />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Custom Events ──────────────────────────────────────────────── */}
        <TabsContent value="events" className="mt-4">
          <Card>
            <CardHeader className="border-b border-outline-variant/20 pb-3">
              <CardTitle className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Custom Events
                {Array.isArray(events) && events.length > 0 && (
                  <span className="ml-auto text-xs font-normal text-on-surface-variant/60">
                    {events.length} event types · {evtTotal.toLocaleString()} occurrences
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {Array.isArray(events) && events.length ? (
                <div className="divide-y divide-outline-variant/10">
                  {events.map((e: any, i: number) => {
                    const occ = Number(e.occurrences ?? 0);
                    return (
                      <DataRow
                        key={i}
                        rank={i + 1}
                        label={e.name}
                        value={occ}
                        pct={evtTotal > 0 ? (occ / evtTotal) * 100 : 0}
                      />
                    );
                  })}
                </div>
              ) : (
                <NoData message="No custom events yet. Use eye.track('event_name') in your site code." />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AnalyticsPage() {
  return <Content />;
}
