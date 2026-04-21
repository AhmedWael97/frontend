"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sharedReportsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Copy, Trash2, Plus, Check } from "lucide-react";
import { formatDate } from "@/lib/utils";

const qc = new QueryClient();

function Content() {
  const { selectedDomainId } = useAuthStore();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["shared-reports", selectedDomainId],
    queryFn: () => sharedReportsApi.list(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const createMutation = useMutation({
    mutationFn: () => sharedReportsApi.create({ domain_id: selectedDomainId!, label: "Shared Report" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shared-reports"] }),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: number) => sharedReportsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shared-reports"] }),
  });

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/report/${token}`);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Shared Reports</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Public report links you can share without login</p>
        </div>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          <Plus className="w-4 h-4" /> Create Link
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  {["Token", "Status", "Created", "Expires", "Views", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-outline-variant/10">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-container-high rounded animate-pulse w-24" /></td>
                      ))}
                    </tr>
                  ))
                ) : (data || []).map((r: any) => (
                  <tr key={r.token} className="border-b border-outline-variant/10">
                    <td className="px-4 py-3 font-mono text-xs text-primary">{r.token.slice(0, 16)}…</td>
                    <td className="px-4 py-3"><Badge variant={r.is_active ? "success" : "secondary"}>{r.is_active ? "Active" : "Revoked"}</Badge></td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{r.expires_at ? formatDate(r.expires_at) : "Never"}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{r.view_count || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => copyLink(r.token)} className="p-1.5 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant hover:text-primary">
                          {copied === r.token ? <Check className="w-4 h-4 text-green-600 dark:text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button onClick={() => revokeMutation.mutate(r.id)} className="p-1.5 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant hover:text-error">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && !data?.length && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-on-surface-variant">No shared reports yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SharedReportsPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
