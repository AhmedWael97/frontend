"use client";

import { useQuery } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { User, Mail, Globe } from "lucide-react";
import { formatDate } from "@/lib/utils";

const qc = new QueryClient();

function Content() {
  const { selectedDomainId } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["identities", selectedDomainId],
    queryFn: () => analyticsApi.identities(selectedDomainId!, {}).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Identities</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Identified visitors linked via <code className="text-primary">eye.identify()</code></p>
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
                  <tr key={v.id} className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
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
                      <span className="flex items-center gap-1.5 text-on-surface-variant"><Globe className="w-3 h-3" />{v.country || "—"}</span>
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
    </div>
  );
}

export default function IdentitiesPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
