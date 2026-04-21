"use client";

import { useQuery } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

const qc = new QueryClient();

function Content() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: () => adminApi.listSubscriptions().then((r) => r.data),
  });

  const statusV = (s: string) => s === "active" ? "success" : s === "past_due" ? "warning" : s === "canceled" ? "error" : "secondary";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Subscriptions</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">All active and past subscriptions</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20">
                {["User", "Plan", "Status", "Start", "Renewal", "MRR"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-outline-variant/10">
                  {Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-container-high rounded animate-pulse w-24" /></td>)}
                </tr>
              )) : (data?.data || []).map((s: any) => (
                <tr key={s.id} className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-on-surface">{s.user?.name || s.user?.email}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{s.plan?.name}</td>
                  <td className="px-4 py-3"><Badge variant={statusV(s.status) as any}>{s.status}</Badge></td>
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(s.starts_at)}</td>
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{s.current_period_end ? formatDate(s.current_period_end) : "—"}</td>
                  <td className="px-4 py-3 font-semibold text-on-surface">${((s.plan?.price || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminSubscriptionsPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
