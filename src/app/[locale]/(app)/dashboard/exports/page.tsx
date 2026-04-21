"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { exportsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Download, Plus, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/utils";

const qc = new QueryClient();

const FORMATS = ["csv", "excel"] as const;
const TYPES = ["visitors", "events", "funnel", "ai"] as const;

function Content() {
  const { selectedDomainId } = useAuthStore();
  const queryClient = useQueryClient();
  const [format, setFormat] = useState<typeof FORMATS[number]>("csv");
  const [type, setType] = useState<typeof TYPES[number]>("visitors");

  const { data, isLoading } = useQuery({
    queryKey: ["exports", selectedDomainId],
    queryFn: async () => [] as any[],
    enabled: !!selectedDomainId,
    refetchInterval: 5000,
  });

  const createMutation = useMutation({
    mutationFn: () => exportsApi.create({ domain_id: selectedDomainId!, format, type }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exports"] }),
  });

  const statusVariant = (s: string) => {
    if (s === "completed") return "success";
    if (s === "failed") return "error";
    if (s === "processing") return "warning";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Exports</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Download your analytics data as CSV, JSON, or Excel</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Create Export</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Data Type</label>
              <div className="flex gap-1">
                {TYPES.map((t) => (
                  <button key={t} onClick={() => setType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${type === t ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:text-on-surface"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Format</label>
              <div className="flex gap-1">
                {FORMATS.map((f) => (
                  <button key={f} onClick={() => setFormat(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${format === f ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:text-on-surface"}`}>{f.toUpperCase()}</button>
                ))}
              </div>
            </div>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !selectedDomainId} className="ml-auto">
              <Plus className="w-4 h-4" /> Create Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Export History</CardTitle>
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ["exports"] })} className="p-1.5 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  {["Type", "Format", "Status", "Records", "Created", "Download"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-outline-variant/10">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-container-high rounded animate-pulse w-20" /></td>
                      ))}
                    </tr>
                  ))
                ) : (data || []).map((e: any) => (
                  <tr key={e.id} className="border-b border-outline-variant/10">
                    <td className="px-4 py-3 font-medium text-on-surface capitalize">{e.type}</td>
                    <td className="px-4 py-3 text-on-surface-variant uppercase text-xs">{e.format}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant(e.status) as any}>{e.status}</Badge></td>
                    <td className="px-4 py-3 text-on-surface-variant">{e.records_count?.toLocaleString() || "—"}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(e.created_at)}</td>
                    <td className="px-4 py-3">
                      {e.status === "completed" && e.download_url ? (
                        <a href={e.download_url} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-surface-container rounded-lg transition-colors text-primary inline-flex">
                          <Download className="w-4 h-4" />
                        </a>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
                {!isLoading && !data?.length && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-on-surface-variant">No exports yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ExportsPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
