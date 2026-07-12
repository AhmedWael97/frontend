"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { formatDate, countryName } from "@/lib/utils";
import {
  Monitor, Smartphone, Tablet, Globe, ShieldOff, X, ChevronDown, ChevronRight,
  Eye, MousePointerClick, Flame, ArrowDownToLine, Clock, ArrowLeft, Bug,
  ClipboardList, Link2, Gauge, Zap, AlertTriangle, UserCheck, Sparkles, Loader2,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { UsageUpgradeBanner, ListLockFooter } from "@/components/UsageUpgradeBanner";

type Session = {
  session_id: string;
  started_at: string;
  duration_seconds: number;
  page_count: number;
  entry_url: string;
  exit_url: string;
  device: string;
  browser: string;
  os: string;
  country: string;
};

type JourneyEvent = { type: string; url?: string; title?: string; props: string; ts: number };
type JourneyCustomEvent = { name: string; props: string; ts: number };
type TimelineItem = { ts: number; icon: React.ElementType; iconColor: string; text: string };

/** Best-effort path from a full URL, falling back to the raw string. */
function pathOf(url?: string): string {
  if (!url) return "";
  try {
    return new URL(url).pathname || "/";
  } catch {
    return url;
  }
}

function parseProps(raw: string): Record<string, any> {
  try {
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

/** Turns one raw tracker event into a human-readable timeline line. */
function describeEvent(e: JourneyEvent): TimelineItem {
  const p = parseProps(e.props);
  const el = p.tx || p.el || p.tg || "an element";
  switch (e.type) {
    case "pageview":
      return { ts: e.ts, icon: Eye, iconColor: "text-primary", text: `Viewed ${pathOf(e.url)}` };
    case "click":
      return { ts: e.ts, icon: MousePointerClick, iconColor: "text-on-surface-variant", text: `Clicked "${el}"` };
    case "rage_click":
      return { ts: e.ts, icon: Flame, iconColor: "text-rose-400", text: `Rage-clicked "${el}" (frustration signal)` };
    case "dead_click":
      return { ts: e.ts, icon: MousePointerClick, iconColor: "text-amber-400", text: `Dead click on "${el}" (nothing happened)` };
    case "scroll_depth":
      return { ts: e.ts, icon: ArrowDownToLine, iconColor: "text-cyan-400", text: `Scrolled to ${p.depth ?? "?"}% of the page` };
    case "excessive_scroll":
      return { ts: e.ts, icon: ArrowDownToLine, iconColor: "text-amber-400", text: "Scrolled back and forth repeatedly" };
    case "time_on_page":
      return { ts: e.ts, icon: Clock, iconColor: "text-on-surface-variant", text: `Spent ${p.d ?? "?"}s on the page` };
    case "quick_back":
      return { ts: e.ts, icon: ArrowLeft, iconColor: "text-rose-400", text: `Left within ${p.ms ?? "?"}ms of arriving` };
    case "js_error":
      return { ts: e.ts, icon: Bug, iconColor: "text-rose-400", text: `JS error: ${(p.msg || "unknown").toString().slice(0, 80)}` };
    case "form_abandon":
      return { ts: e.ts, icon: ClipboardList, iconColor: "text-amber-400", text: `Abandoned a form (last field: ${p.last_field ?? p.field ?? "?"})` };
    case "broken_link":
      return { ts: e.ts, icon: Link2, iconColor: "text-rose-400", text: "Clicked a broken (404) link" };
    case "web_vitals":
      return { ts: e.ts, icon: Gauge, iconColor: "text-on-surface-variant", text: `Page speed rated "${p.rating ?? "?"}"` };
    case "page_load":
      return { ts: e.ts, icon: Zap, iconColor: "text-on-surface-variant", text: `Page loaded (TTFB ${p.ttfb ?? "?"}ms)` };
    case "slow_resources":
      return { ts: e.ts, icon: AlertTriangle, iconColor: "text-amber-400", text: "One or more slow-loading assets" };
    case "identify":
      return { ts: e.ts, icon: UserCheck, iconColor: "text-emerald-400", text: `Identified as ${p.eid ?? "a known visitor"}` };
    default:
      return { ts: e.ts, icon: Sparkles, iconColor: "text-on-surface-variant", text: e.type };
  }
}

function describeCustomEvent(e: JourneyCustomEvent): TimelineItem {
  return { ts: e.ts, icon: Sparkles, iconColor: "text-violet-400", text: `Custom event: ${e.name}` };
}

function fmtDur(secs: number): string {
  const s = Number(secs) || 0;
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function SessionRow({ domainId, visitorId, session }: { domainId: number; visitorId: string; session: Session }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["visitor-journey", domainId, visitorId, session.session_id],
    queryFn: () => analyticsApi.visitorsJourney(domainId, visitorId, session.session_id).then((r) => r.data?.data ?? r.data),
    enabled: open,
  });

  const timeline: TimelineItem[] = data
    ? [
        ...((data.events ?? []) as JourneyEvent[]).map(describeEvent),
        ...((data.custom_events ?? []) as JourneyCustomEvent[]).map(describeCustomEvent),
      ].sort((a, b) => a.ts - b.ts)
    : [];

  return (
    <div className="border border-outline-variant/15 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-surface-container/50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          {open ? <ChevronDown className="w-3.5 h-3.5 shrink-0 text-on-surface-variant" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0 text-on-surface-variant rtl:rotate-180" />}
          <span className="text-xs text-on-surface truncate">{pathOf(session.entry_url) || "/"}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary" className="text-[10px]">{session.page_count} page{session.page_count === 1 ? "" : "s"}</Badge>
          <span className="text-[11px] text-on-surface-variant">{fmtDur(session.duration_seconds)}</span>
          <span className="text-[11px] text-on-surface-variant">{formatDate(session.started_at)}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-outline-variant/10 px-3 py-2.5 bg-surface-container/30">
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs text-on-surface-variant py-3">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading journey…
            </div>
          ) : timeline.length === 0 ? (
            <p className="text-xs text-on-surface-variant py-2">No events recorded for this session.</p>
          ) : (
            <div className="space-y-2">
              {timeline.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${item.iconColor}`} />
                    <span className="text-xs text-on-surface flex-1">{item.text}</span>
                    <span className="text-[10px] text-on-surface-variant/70 shrink-0">
                      {new Date(item.ts * 1000).toLocaleTimeString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VisitorDrawer({ domainId, visitorId, onClose }: { domainId: number; visitorId: string; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["visitor-show", domainId, visitorId],
    queryFn: () => analyticsApi.visitorsShow(domainId, visitorId).then((r) => r.data?.data ?? r.data),
  });

  const sessions: Session[] = data?.sessions ?? [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg h-full bg-surface border-s border-outline-variant/20 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/15 shrink-0">
          <div>
            <p className="text-sm font-black text-on-surface font-mono">{visitorId.slice(0, 18)}…</p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {isLoading ? "Loading…" : `${data?.session_count ?? sessions.length} session${(data?.session_count ?? sessions.length) === 1 ? "" : "s"}`}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-surface-container-high rounded-xl animate-pulse" />)
          ) : sessions.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-8 text-center">No sessions found.</p>
          ) : (
            sessions.map((s) => (
              <SessionRow key={s.session_id} domainId={domainId} visitorId={visitorId} session={s} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Content() {
  const { selectedDomainId } = useAuthStore();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const t = useTranslations("visitors");
  const locale = useLocale();

  const { data, isLoading } = useQuery({
    queryKey: ["visitors", selectedDomainId, page],
    queryFn: () => analyticsApi.visitorsList(selectedDomainId!, { page }).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const { data: botStats } = useQuery({
    queryKey: ["bot-stats", selectedDomainId],
    queryFn: () => analyticsApi.botStats(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const deviceIcon = (type: string) => {
    if (type === "mobile") return <Smartphone className="w-3.5 h-3.5" />;
    if (type === "tablet") return <Tablet className="w-3.5 h-3.5" />;
    return <Monitor className="w-3.5 h-3.5" />;
  };

  const tableHeaders = [
    t("visitorId"),
    t("country"),
    t("device"),
    t("browser"),
    t("sessions"),
    t("lastSeen")
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">{t("title")}</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">{t("subtitle")}</p>
      </div>

      <UsageUpgradeBanner domainId={selectedDomainId} />

      {/* Bot stats card */}
      {botStats && (
        <Card className="border-rose-500/20 bg-rose-500/5">
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <ShieldOff className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-rose-300 uppercase tracking-widest">Bots Blocked</p>
              <p className="text-sm text-on-surface">
                <span className="font-bold">{Number(botStats.today).toLocaleString()}</span>
                <span className="text-on-surface-variant"> today · </span>
                <span className="font-bold">{Number(botStats.total).toLocaleString()}</span>
                <span className="text-on-surface-variant"> all-time</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  {tableHeaders.map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-outline-variant/10">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-container-high rounded animate-pulse w-24" /></td>
                      ))}
                    </tr>
                  ))
                ) : (data?.data || []).map((v: any) => (
                  <tr
                    key={v.visitor_id}
                    className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors cursor-pointer"
                    onClick={() => setSelected(v.visitor_id)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-primary">{v.visitor_id?.slice(0, 12)}…</td>
                    <td className="px-4 py-3 text-on-surface flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-on-surface-variant" />{countryName(v.country, locale)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-on-surface-variant">{deviceIcon(v.device_type)}{v.device_type || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-on-surface">{v.browser || "—"}</td>
                    <td className="px-4 py-3"><Badge variant="secondary">{v.session_count ?? 0}</Badge></td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{v.last_seen ? formatDate(v.last_seen) : "—"}</td>
                  </tr>
                ))}
                {!isLoading && !(data?.data?.length) && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-on-surface-variant">No visitor data yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {data?.meta && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/20">
              <span className="text-xs text-on-surface-variant">Page {data.meta.current_page} of {data.meta.last_page}</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-xs rounded-lg border border-outline-variant/30 disabled:opacity-40 hover:bg-surface-container transition-colors">Prev</button>
                <button disabled={page >= data.meta.last_page} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-xs rounded-lg border border-outline-variant/30 disabled:opacity-40 hover:bg-surface-container transition-colors">Next</button>
              </div>
            </div>
          )}
          <ListLockFooter domainId={selectedDomainId} />
        </CardContent>
      </Card>

      {selected && selectedDomainId && (
        <VisitorDrawer domainId={selectedDomainId} visitorId={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export default function VisitorsPage() {
  return <Content />;
}
