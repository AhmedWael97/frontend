"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { alertRulesApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Plus, Trash2, Bell } from "lucide-react";

const qc = new QueryClient();

const METRICS = ["visitors", "bounce_rate", "sessions", "avg_duration"];
const CONDITIONS = ["gt", "lt", "eq"] as const;

function Content() {
  const { selectedDomainId } = useAuthStore();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ metric: METRICS[0], condition: "gt", threshold: 0, channel: "email" });
  const [adding, setAdding] = useState(false);

  const { data: rules, isLoading } = useQuery({
    queryKey: ["alert-rules", selectedDomainId],
    queryFn: () => alertRulesApi.list(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => alertRulesApi.create(selectedDomainId!, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["alert-rules"] }); setAdding(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => alertRulesApi.delete(selectedDomainId!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alert-rules"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => alertRulesApi.update(selectedDomainId!, id, { is_active: active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alert-rules"] }),
  });

  const conditionLabel = (c: string) => ({ gt: ">", lt: "<", eq: "=" }[c] || c);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Alerts</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Get notified when your metrics hit thresholds</p>
        </div>
        <Button onClick={() => setAdding(true)}><Plus className="w-4 h-4" /> Add Rule</Button>
      </div>

      {adding && (
        <Card>
          <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">New Alert Rule</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant font-semibold uppercase tracking-widest">Metric</label>
                <select value={form.metric} onChange={(e) => setForm(f => ({ ...f, metric: e.target.value }))} className="bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface">
                  {METRICS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant font-semibold uppercase tracking-widest">Condition</label>
                <select value={form.condition} onChange={(e) => setForm(f => ({ ...f, condition: e.target.value }))} className="bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface">
                  {CONDITIONS.map((c) => <option key={c} value={c}>{conditionLabel(c)}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant font-semibold uppercase tracking-widest">Threshold</label>
                <Input type="number" value={form.threshold} onChange={(e) => setForm(f => ({ ...f, threshold: Number(e.target.value) }))} className="w-28" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant font-semibold uppercase tracking-widest">Channel</label>
                <select value={form.channel} onChange={(e) => setForm(f => ({ ...f, channel: e.target.value }))} className="bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface">
                  <option value="email">Email</option>
                  <option value="webhook">Webhook</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}>Save Rule</Button>
                <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-surface-container rounded-xl animate-pulse" />) : (rules || []).map((r: any) => (
          <Card key={r.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Bell className="w-4 h-4 text-primary" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-on-surface">{r.metric} {conditionLabel(r.condition)} {r.threshold}</p>
                <p className="text-xs text-on-surface-variant">Notify via {r.channel}</p>
              </div>
              <Badge variant={r.is_active ? "success" : "secondary"}>{r.is_active ? "Active" : "Paused"}</Badge>
              <button onClick={() => toggleMutation.mutate({ id: r.id, active: !r.is_active })} className="p-1.5 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant hover:text-primary">
                <span className={`block w-9 h-5 rounded-full transition-colors ${r.is_active ? "bg-primary" : "bg-outline-variant"}`}>
                  <span className={`block w-3.5 h-3.5 rounded-full bg-white mt-[3px] transition-transform ${r.is_active ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
                </span>
              </button>
              <button onClick={() => deleteMutation.mutate(r.id)} className="p-1.5 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant hover:text-error">
                <Trash2 className="w-4 h-4" />
              </button>
            </CardContent>
          </Card>
        ))}
        {!isLoading && !rules?.length && <p className="text-center text-on-surface-variant text-sm py-8">No alert rules yet</p>}
      </div>
    </div>
  );
}

export default function AlertsPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
