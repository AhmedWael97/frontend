"use client";

import { useQuery } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Zap } from "lucide-react";

const qc = new QueryClient();

function Content() {
  const { selectedDomainId } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["custom-events", selectedDomainId],
    queryFn: () => analyticsApi.customEvents(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Custom Events</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Track custom interactions and conversions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Events — Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  {["Event Name", "Count", "Unique Visitors", "Avg. Value"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-outline-variant/10">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-container-high rounded animate-pulse w-24" /></td>
                      ))}
                    </tr>
                  ))
                ) : (data || []).map((e: any) => (
                  <tr key={e.name} className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-primary" />
                        <span className="font-medium text-on-surface">{e.name}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-on-surface">{e.count?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{e.unique_visitors?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{e.avg_value ? `$${e.avg_value.toFixed(2)}` : "—"}</td>
                  </tr>
                ))}
                {!isLoading && !data?.length && (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-on-surface-variant">No custom events tracked yet. Add <code className="text-primary">eye.track()</code> calls to your site.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CustomEventsPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
