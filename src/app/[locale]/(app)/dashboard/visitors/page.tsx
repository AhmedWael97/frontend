"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { formatDate } from "@/lib/utils";
import { Monitor, Smartphone, Tablet, Globe } from "lucide-react";

function Content() {
  const { selectedDomainId } = useAuthStore();
  const [page, setPage] = useState(1);
  const [, setSelected] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["visitors", selectedDomainId, page],
    queryFn: () => analyticsApi.visitorsList(selectedDomainId!, { page }).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const deviceIcon = (type: string) => {
    if (type === "mobile") return <Smartphone className="w-3.5 h-3.5" />;
    if (type === "tablet") return <Tablet className="w-3.5 h-3.5" />;
    return <Monitor className="w-3.5 h-3.5" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Visitors</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">All recorded visitor sessions</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  {["Visitor ID", "Country", "Device", "Browser", "Sessions", "Last Seen"].map((h) => (
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
                    key={v.id}
                    className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors cursor-pointer"
                    onClick={() => setSelected(v)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-primary">{v.visitor_id?.slice(0, 12)}…</td>
                    <td className="px-4 py-3 text-on-surface flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-on-surface-variant" />{v.country || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-on-surface-variant">{deviceIcon(v.device_type)}{v.device_type || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-on-surface">{v.browser || "—"}</td>
                    <td className="px-4 py-3"><Badge variant="secondary">{v.sessions_count || 1}</Badge></td>
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
        </CardContent>
      </Card>
    </div>
  );
}

export default function VisitorsPage() {
  return <Content />;
}
