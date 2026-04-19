"use client";

import { useQuery } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Globe } from "lucide-react";

const qc = new QueryClient();

function Content() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-domains"],
    queryFn: () => adminApi.domains({ page: 1 }).then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Domains</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">All tracked domains across all accounts</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20">
                {["Domain", "Owner", "Status", "Events (30d)", "Created"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-outline-variant/10">
                  {Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-container-high rounded animate-pulse w-24" /></td>)}
                </tr>
              )) : (data?.data || []).map((d: any) => (
                <tr key={d.id} className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-primary" />
                      <span className="font-medium text-on-surface">{d.name}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{d.user?.name || d.user?.email}</td>
                  <td className="px-4 py-3"><Badge variant={d.is_active ? "success" : "secondary"}>{d.is_active ? "Active" : "Inactive"}</Badge></td>
                  <td className="px-4 py-3 text-on-surface-variant">{d.events_30d?.toLocaleString() || "—"}</td>
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(d.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDomainsPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
