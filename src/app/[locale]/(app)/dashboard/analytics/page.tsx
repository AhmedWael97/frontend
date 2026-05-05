"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { ArrowUpRight, ArrowDownRight, GitCompare } from "lucide-react";

const TOOLTIP_STYLE = { background: "#171f33", border: "1px solid #464554", borderRadius: 8, color: "#dae2fd" };

/** Compute % change, returns null when prev is 0 or unavailable. */
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

/** Show the last meaningful segment(s) of a URL path so long slugs are readable. */
function shortUrl(raw: string): string {
  try {
    const path = new URL(raw).pathname.replace(/\/$/, "");
    const parts = path.split("/").filter(Boolean);
    if (!parts.length) return "/";
    return parts.length > 2 ? `…/${parts.slice(-2).join("/")}` : `/${parts.join("/")}`;
  } catch {
    return raw.length > 36 ? `…${raw.slice(-34)}` : raw;
  }
}

/** Extract the hostname from a referrer URL for favicon lookup. */
function referrerHost(ref: string): string | null {
  try {
    return new URL(ref.startsWith("http") ? ref : `https://${ref}`).hostname;
  } catch {
    return null;
  }
}

function SimpleBarChart({ data, dataKey, nameKey = "label" }: { data: any[]; dataKey: string; nameKey?: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 16, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#464554" strokeOpacity={0.2} horizontal={false} />
        <XAxis type="number" tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey={nameKey} tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} width={140} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey={dataKey} fill="#c0c1ff" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function NoData({ message = "No data yet" }: { message?: string }) {
  return <p className="text-on-surface-variant text-sm py-8 text-center">{message}</p>;
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

  // Normalise compare response shapes: {current:[...], prev:[...]} vs flat [...]
  const pagesRows: any[]   = comparing ? (pages?.current ?? []) : (Array.isArray(pages) ? pages : []);
  const pagesPrev: any[]   = comparing ? (pages?.prev ?? []) : [];
  const refRows: any[]     = comparing ? (referrers?.current ?? []) : (Array.isArray(referrers) ? referrers : []);
  const refPrev: any[]     = comparing ? (referrers?.prev ?? []) : [];
  const devData: any       = comparing ? (devices?.current ?? {}) : (devices ?? {});
  const _devPrev: any      = comparing ? (devices?.prev ?? {}) : {};

  function prevVisits(list: any[], key: string, value: string): number | undefined {
    return list.find((r: any) => r[key] === value)?.["visits"] ??
           list.find((r: any) => r[key] === value)?.["pageviews"];
  }

  if (!selectedDomainId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-on-surface-variant">Select a domain from the top bar to view analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Analytics</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Traffic breakdown and campaign performance</p>
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

      <Tabs defaultValue="referrers">
        <TabsList>
          <TabsTrigger value="referrers">Referrers</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="devices">Devices & Browsers</TabsTrigger>
          <TabsTrigger value="events">Custom Events</TabsTrigger>
        </TabsList>

        <TabsContent value="referrers" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Where Visitors Come From</CardTitle></CardHeader>
            <CardContent>
              {refRows.length ? (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-outline-variant/20 text-on-surface-variant">
                      <th className="text-left py-1.5 font-medium">Source</th>
                      <th className="text-right py-1.5 font-medium pr-2">Visits</th>
                      {comparing && <th className="text-right py-1.5 font-medium">vs Prev</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {refRows.map((r: any, i: number) => {
                      const host = referrerHost(r.referrer);
                      return (
                        <tr key={i} className="hover:bg-surface-container/50 transition-colors">
                          <td className="py-1.5 flex items-center gap-2 max-w-xs">
                            {host ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`https://www.google.com/s2/favicons?domain=${host}&sz=16`}
                                alt=""
                                width={14} height={14}
                                className="rounded-sm shrink-0 opacity-80"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                              />
                            ) : <span className="w-3.5 shrink-0" />}
                            <span className="text-on-surface truncate" title={r.referrer}>{r.referrer || "(direct)"}</span>
                          </td>
                          <td className="py-1.5 text-right text-on-surface-variant pr-2">{Number(r.visits).toLocaleString()}</td>
                          {comparing && <td className="py-1.5 text-right"><DeltaBadge current={Number(r.visits)} prev={prevVisits(refPrev, "referrer", r.referrer)} /></td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : <NoData />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Pages Visited Most</CardTitle></CardHeader>
            <CardContent>
              {pagesRows.length ? (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-outline-variant/20 text-on-surface-variant">
                      <th className="text-left py-1.5 font-medium">Page</th>
                      <th className="text-right py-1.5 font-medium pr-2">Views</th>
                      {comparing && <th className="text-right py-1.5 font-medium">vs Prev</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {pagesRows.map((p: any, i: number) => (
                      <tr key={i} className="hover:bg-surface-container/50 transition-colors">
                        <td className="py-1.5 font-mono text-on-surface truncate max-w-xs" title={p.url}>{shortUrl(p.url)}</td>
                        <td className="py-1.5 text-right text-on-surface-variant pr-2">{Number(p.pageviews).toLocaleString()}</td>
                        {comparing && <td className="py-1.5 text-right"><DeltaBadge current={Number(p.pageviews)} prev={prevVisits(pagesPrev, "url", p.url)} /></td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <NoData />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Device Types</CardTitle></CardHeader>
              <CardContent>
                {devData?.devices?.length ? (
                  <>
                    <table className="w-full text-xs mb-4">
                      <thead><tr className="border-b border-outline-variant/20 text-on-surface-variant"><th className="text-left py-1 font-medium">Device</th><th className="text-right py-1 font-medium">Visits</th></tr></thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {devData.devices.map((d: any, i: number) => (
                          <tr key={i}><td className="py-1 text-on-surface">{d.device_type}</td><td className="py-1 text-right text-on-surface-variant">{Number(d.visits).toLocaleString()}</td></tr>
                        ))}
                      </tbody>
                    </table>
                    <SimpleBarChart data={devData.devices} dataKey="visits" nameKey="device_type" />
                  </>
                ) : <NoData />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Browsers</CardTitle></CardHeader>
              <CardContent>
                {devData?.browsers?.length ? (
                  <>
                    <table className="w-full text-xs mb-4">
                      <thead><tr className="border-b border-outline-variant/20 text-on-surface-variant"><th className="text-left py-1 font-medium">Browser</th><th className="text-right py-1 font-medium">Visits</th></tr></thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {devData.browsers.map((d: any, i: number) => (
                          <tr key={i}><td className="py-1 text-on-surface">{d.browser}</td><td className="py-1 text-right text-on-surface-variant">{Number(d.visits).toLocaleString()}</td></tr>
                        ))}
                      </tbody>
                    </table>
                    <SimpleBarChart data={devData.browsers} dataKey="visits" nameKey="browser" />
                  </>
                ) : <NoData />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Operating Systems</CardTitle></CardHeader>
              <CardContent>
                {devData?.os?.length ? (
                  <>
                    <table className="w-full text-xs mb-4">
                      <thead><tr className="border-b border-outline-variant/20 text-on-surface-variant"><th className="text-left py-1 font-medium">OS</th><th className="text-right py-1 font-medium">Visits</th></tr></thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {devData.os.map((d: any, i: number) => (
                          <tr key={i}><td className="py-1 text-on-surface">{d.os}</td><td className="py-1 text-right text-on-surface-variant">{Number(d.visits).toLocaleString()}</td></tr>
                        ))}
                      </tbody>
                    </table>
                    <SimpleBarChart data={devData.os} dataKey="visits" nameKey="os" />
                  </>
                ) : <NoData />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Custom Events</CardTitle></CardHeader>
            <CardContent>
              {Array.isArray(events) && events.length ? (
                <>
                  <table className="w-full text-xs mb-4">
                    <thead><tr className="border-b border-outline-variant/20 text-on-surface-variant"><th className="text-left py-1 font-medium">Event</th><th className="text-right py-1 font-medium">Occurrences</th></tr></thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {events.map((e: any, i: number) => (
                        <tr key={i}><td className="py-1 text-on-surface font-mono">{e.name}</td><td className="py-1 text-right text-on-surface-variant">{Number(e.occurrences).toLocaleString()}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <SimpleBarChart data={events} dataKey="occurrences" nameKey="name" />
                </>
              ) : <NoData message="No custom events tracked yet. Use eye.track() in your website code." />}
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
