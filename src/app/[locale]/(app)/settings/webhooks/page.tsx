"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { webhooksApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Plus, Trash2, Webhook } from "lucide-react";
import { formatDate } from "@/lib/utils";

const EVENTS = ["pageview", "session_start", "goal_completed", "identified", "custom_event"];

function Content() {
  const { selectedDomainId } = useAuthStore();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["pageview"]);
  const [adding, setAdding] = useState(false);

  const { data: webhooks, isLoading } = useQuery({
    queryKey: ["webhooks", selectedDomainId],
    queryFn: () => webhooksApi.list(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => webhooksApi.create(selectedDomainId!, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["webhooks"] }); setUrl(""); setAdding(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => webhooksApi.delete(selectedDomainId!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["webhooks"] }),
  });

  const toggleEvent = (e: string) => setSelectedEvents((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Webhooks</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Send real-time events to your own endpoints</p>
        </div>
        <Button onClick={() => setAdding(true)}><Plus className="w-4 h-4" /> Add Webhook</Button>
      </div>

      {adding && (
        <Card>
          <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">New Webhook</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Endpoint URL</label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-server.com/hooks/eye" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Events</label>
              <div className="flex flex-wrap gap-2">
                {EVENTS.map((e) => (
                  <button key={e} onClick={() => toggleEvent(e)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${selectedEvents.includes(e) ? "bg-primary/10 border-primary/40 text-primary" : "border-outline-variant/20 text-on-surface-variant hover:bg-surface-container"}`}>{e}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate({ url, events: selectedEvents })} disabled={!url || createMutation.isPending}>Create</Button>
              <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {isLoading ? Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 bg-surface-container rounded-xl animate-pulse" />) : (webhooks || []).map((w: any) => (
          <Card key={w.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0"><Webhook className="w-4 h-4 text-secondary" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{w.url}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(w.events || []).map((e: string) => <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>)}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">Created {formatDate(w.created_at)} · {w.deliveries_count || 0} deliveries</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={w.is_active ? "success" : "secondary"}>{w.is_active ? "Active" : "Disabled"}</Badge>
                  <button onClick={() => deleteMutation.mutate(w.id)} className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-error transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!isLoading && !webhooks?.length && <p className="text-center text-on-surface-variant text-sm py-8">No webhooks configured yet</p>}
      </div>
    </div>
  );
}

export default function WebhooksPage() {
  return <Content />;
}
