"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { User, Mail, Globe, X, Clock, MousePointerClick, Layers, ExternalLink } from "lucide-react";
import { formatDate, countryName } from "@/lib/utils";
import { useLocale } from "next-intl";

function fmtDuration(secs: number | null | undefined): string {
  if (secs == null || secs < 0) return "—";
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m < 60) return s ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function pagePath(url: string): string {
  try {
    const u = new URL(url);
    return (u.pathname + u.search) || "/";
  } catch {
    return url;
  }
}

function JourneyDrawer({ domainId, externalId, onClose }: { domainId: number; externalId: string; onClose: () => void }) {
  const locale = useLocale();
  const { data, isLoading } = useQuery({
    queryKey: ["identity-journey", domainId, externalId],
    queryFn: () => analyticsApi.identitiesShow(domainId, externalId).then((r) => r.data?.data),
    enabled: !!externalId,
  });

  const identity = data?.identity;
  const stats = data?.stats;
  const sessions = data?.sessions || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-surface h-full overflow-y-auto shadow-2xl ltr:border-l rtl:border-r border-outline-variant/20">
        {/* Header */}
        <div className="sticky top-0 bg-surface/95 backdrop-blur border-b border-outline-variant/20 px-6 py-4 flex items-start justify-between z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-on-surface truncate">{identity?.name || identity?.email || externalId}</p>
              <p className="text-xs text-on-surface-variant truncate flex items-center gap-1"><Mail className="w-3 h-3" />{identity?.email || externalId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant"><X className="w-5 h-5" /></button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 px-6 py-4">
          {[
            { icon: Layers, label: "Sessions", value: stats?.sessions ?? "—" },
            { icon: MousePointerClick, label: "Page views", value: stats?.pageviews ?? "—" },
            { icon: Clock, label: "Total time", value: stats ? fmtDuration(stats.total_time_seconds) : "—" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-outline-variant/20 p-3">
              <s.icon className="w-4 h-4 text-primary mb-1" />
              <p className="text-lg font-black text-on-surface leading-none">{s.value}</p>
              <p className="text-[11px] text-on-surface-variant mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Journey */}
        <div className="px-6 pb-10 space-y-5">
          <h2 className="text-sm font-bold text-on-surface uppercase tracking-widest">User journey</h2>

          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-surface-container-high rounded-xl animate-pulse" />)}
            </div>
          )}

          {!isLoading && sessions.length === 0 && (
            <p className="text-sm text-on-surface-variant py-8 text-center">No page-view activity recorded yet for this person.</p>
          )}

          {!isLoading && sessions.map((sess: any, si: number) => (
            <div key={sess.session_id} className="rounded-xl border border-outline-variant/20 overflow-hidden">
              <div className="bg-surface-container/50 px-4 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="font-semibold text-on-surface">Session {sessions.length - si}</span>
                <span className="text-on-surface-variant">{formatDate(sess.started_at)}</span>
                <span className="text-on-surface-variant">· {sess.pageviews} pages</span>
                <span className="text-on-surface-variant">· {fmtDuration(sess.duration_seconds)}</span>
                {sess.country && <span className="text-on-surface-variant flex items-center gap-1">· <Globe className="w-3 h-3" />{countryName(sess.country, locale)}</span>}
                {sess.device && <span className="text-on-surface-variant">· {sess.device}</span>}
              </div>
              <ol className="relative">
                {(sess.pages || []).map((p: any, pi: number) => (
                  <li key={pi} className="flex items-start gap-3 px-4 py-2.5 border-t border-outline-variant/10 first:border-t-0">
                    <div className="flex flex-col items-center pt-0.5">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">{pi + 1}</span>
                      {pi < sess.pages.length - 1 && <span className="w-px flex-1 bg-outline-variant/30 mt-1" style={{ minHeight: 8 }} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-on-surface truncate" title={p.title || p.url}>{p.title || pagePath(p.url)}</p>
                      <a href={p.url} target="_blank" rel="noreferrer" className="text-xs text-on-surface-variant hover:text-primary truncate flex items-center gap-1">
                        {pagePath(p.url)}<ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                    <span className="text-xs text-on-surface-variant whitespace-nowrap flex items-center gap-1 pt-0.5"><Clock className="w-3 h-3" />{fmtDuration(p.dwell_seconds)}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Content() {
  const { selectedDomainId } = useAuthStore();
  const locale = useLocale();
  const [selected, setSelected] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["identities", selectedDomainId],
    queryFn: () => analyticsApi.identitiesList(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Identities</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Identified visitors linked via <code className="text-primary">eye.identify()</code> — click a row to see their journey</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  {["Name", "Email", "External ID", "Country", "Sessions", "Last Seen"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-outline-variant/10">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-container-high rounded animate-pulse w-24" /></td>
                      ))}
                    </tr>
                  ))
                ) : (data?.data || []).map((v: any) => (
                  <tr key={v.external_id} onClick={() => setSelected(v.external_id)} className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="font-medium text-on-surface">{v.name || "—"}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-on-surface-variant"><Mail className="w-3 h-3" />{v.email || "—"}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{v.external_id || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-on-surface-variant"><Globe className="w-3 h-3" />{v.country ? countryName(v.country, locale) : "—"}</span>
                    </td>
                    <td className="px-4 py-3"><Badge variant="secondary">{v.sessions_count || 0}</Badge></td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{v.last_seen ? formatDate(v.last_seen) : "—"}</td>
                  </tr>
                ))}
                {!isLoading && !data?.data?.length && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-on-surface-variant">No identified visitors yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selected && selectedDomainId && (
        <JourneyDrawer domainId={selectedDomainId} externalId={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export default function IdentitiesPage() {
  return <Content />;
}
