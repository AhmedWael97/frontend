"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pipelinesApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Plus, Trash2, GripVertical, ArrowDown, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const qc = new QueryClient();

function Content() {
  const { selectedDomainId } = useAuthStore();
  const qClient = useQueryClient();
  const [newName, setNewName] = useState("");

  const { data: funnels, isLoading } = useQuery({
    queryKey: ["funnels", selectedDomainId],
    queryFn: () => pipelinesApi.list(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const [selected, setSelected] = useState<any>(null);
  const [steps, setSteps] = useState<{ name: string; event: string }[]>([]);

  const createMutation = useMutation({
    mutationFn: (data: any) => pipelinesApi.create(selectedDomainId!, data),
    onSuccess: () => { qClient.invalidateQueries({ queryKey: ["funnels"] }); setNewName(""); setSteps([]); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => pipelinesApi.delete(selectedDomainId!, id),
    onSuccess: () => { qClient.invalidateQueries({ queryKey: ["funnels"] }); setSelected(null); },
  });

  const funnelData = selected?.steps?.map((s: any, i: number) => ({
    name: s.name || `Step ${i + 1}`,
    visitors: s.visitors || 0,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Funnels</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Conversion funnel analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel list */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New funnel name…" className="text-sm" />
            <Button size="sm" onClick={() => createMutation.mutate({ name: newName, domain_id: selectedDomainId, steps })} disabled={!newName || !selectedDomainId}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {!selectedDomainId && (
            <p className="text-xs text-on-surface-variant">Select a domain from the top bar first.</p>
          )}
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-surface-container rounded-xl animate-pulse" />)
          ) : (funnels || []).map((f: any) => (
            <div key={f.id} onClick={() => setSelected(f)} className={`p-3 rounded-xl cursor-pointer border transition-colors ${selected?.id === f.id ? "border-primary bg-primary/5" : "border-outline-variant/20 hover:bg-surface-container"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-on-surface">{f.name}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(f.id); }} className="text-on-surface-variant hover:text-error transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">{f.steps?.length || 0} steps</p>
            </div>
          ))}
          {!isLoading && !funnels?.length && (
            <p className="text-sm text-on-surface-variant text-center py-6">No funnels yet. Create one above.</p>
          )}
        </div>

        {/* Funnel chart / step builder */}
        <Card className="lg:col-span-2">
          {selected ? (
            <>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">{selected.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {funnelData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={funnelData}>
                      <XAxis dataKey="name" tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#171f33", border: "1px solid #464554", borderRadius: 8, color: "#dae2fd" }} />
                      <Bar dataKey="visitors" radius={[4, 4, 0, 0]}>
                        {funnelData.map((_: any, i: number) => (
                          <Cell key={i} fill={`hsl(${240 + i * 20}, 80%, ${70 - i * 8}%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-10 text-on-surface-variant text-sm">No conversion data yet for this funnel</div>
                )}

                {/* Step list */}
                <div className="mt-4 space-y-2">
                  {(selected.steps || []).map((s: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 bg-surface-container rounded-lg text-sm">
                      <GripVertical className="w-4 h-4 text-on-surface-variant" />
                      <span className="flex-1 text-on-surface">{s.name || s.event}</span>
                      {i < selected.steps.length - 1 && <ArrowDown className="w-3.5 h-3.5 text-on-surface-variant" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-64 text-on-surface-variant text-sm">
              Select a funnel to view its chart and steps
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function FunnelsPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
