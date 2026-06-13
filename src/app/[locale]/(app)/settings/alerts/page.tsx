"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { alertRulesApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Plus, Trash2, Bell } from "lucide-react";

// Each alert type maps to a check in CheckAlertRulesJob. `key` is the field the
// threshold value is stored under; `unit`/`hint` are for the UI only.
const ALERT_TYPES = [
  { value: "traffic_drop",    label: "Traffic drop",    unit: "%", key: "percent",     def: 30,  hint: "Total traffic vs yesterday" },
  { value: "traffic_anomaly", label: "Traffic anomaly", unit: "σ", key: "sensitivity", def: 2.5, hint: "Last hour vs a 14-day same-hour baseline (z-score)" },
  { value: "error_spike",     label: "Error spike",     unit: "%", key: "percent",     def: 5,   hint: "JS error rate over the last hour" },
  { value: "conversion_drop", label: "Conversion drop", unit: "%", key: "percent",     def: 30,  hint: "Completed orders vs the prior day" },
  { value: "quota_warning",   label: "Quota warning",   unit: "%", key: "percent",     def: 80,  hint: "Daily event quota used" },
] as const;

type AlertType = typeof ALERT_TYPES[number];
const typeConfig = (t: string): AlertType =>
  ALERT_TYPES.find((x) => x.value === t) ?? ALERT_TYPES[0];

const CHANNELS = [
  { value: "email", label: "Email" },
  { value: "in_app", label: "In-app" },
  { value: "both", label: "Both" },
  { value: "slack", label: "Slack" },
  { value: "discord", label: "Discord" },
];
const isWebhookChannel = (c: string) => c === "slack" || c === "discord";

function Content() {
  const { selectedDomainId } = useAuthStore();
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ type: ALERT_TYPES[0].value as string, value: ALERT_TYPES[0].def as number, channel: "email", webhook_url: "" });

  const { data: rules, isLoading } = useQuery({
    queryKey: ["alert-rules", selectedDomainId],
    queryFn: () => alertRulesApi.list(selectedDomainId!).then((r) => r.data?.data ?? r.data),
    enabled: !!selectedDomainId,
  });

  const createMutation = useMutation({
    mutationFn: () => {
      const cfg = typeConfig(form.type);
      return alertRulesApi.create(selectedDomainId!, {
        type: form.type,
        threshold: { [cfg.key]: Number(form.value) },
        channel: form.channel,
        ...(isWebhookChannel(form.channel) && form.webhook_url ? { webhook_url: form.webhook_url } : {}),
      });
    },
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

  const applyDefaultsMutation = useMutation({
    mutationFn: () => alertRulesApi.applyDefaults("email"),
    onSuccess: (r) => {
      const d = r.data?.data ?? r.data;
      queryClient.invalidateQueries({ queryKey: ["alert-rules"] });
      window.alert(`Added ${d?.created ?? 0} default rule(s) across ${d?.domains ?? 0} site(s).`);
    },
  });

  function onTypeChange(type: string) {
    setForm((f) => ({ ...f, type, value: typeConfig(type).def }));
  }

  const activeCfg = typeConfig(form.type);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Alerts</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Get notified about drops, error spikes, and traffic anomalies — checked every 15 minutes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => applyDefaultsMutation.mutate()} disabled={applyDefaultsMutation.isPending}>
            {applyDefaultsMutation.isPending ? "Applying…" : "Apply defaults to all sites"}
          </Button>
          <Button onClick={() => setAdding(true)}><Plus className="w-4 h-4" /> Add Rule</Button>
        </div>
      </div>

      {adding && (
        <Card>
          <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">New Alert Rule</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant font-semibold uppercase tracking-widest">Alert</label>
                <select value={form.type} onChange={(e) => onTypeChange(e.target.value)} className="bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface">
                  {ALERT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant font-semibold uppercase tracking-widest">
                  Threshold ({activeCfg.unit})
                </label>
                <Input
                  type="number"
                  step={activeCfg.key === "sensitivity" ? "0.1" : "1"}
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
                  className="w-28"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant font-semibold uppercase tracking-widest">Channel</label>
                <select value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))} className="bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface">
                  {CHANNELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              {isWebhookChannel(form.channel) && (
                <div className="space-y-1.5 w-full">
                  <label className="text-xs text-on-surface-variant font-semibold uppercase tracking-widest">
                    {form.channel === "slack" ? "Slack" : "Discord"} webhook URL
                  </label>
                  <Input
                    type="url"
                    value={form.webhook_url}
                    onChange={(e) => setForm((f) => ({ ...f, webhook_url: e.target.value }))}
                    placeholder={form.channel === "slack" ? "https://hooks.slack.com/services/…" : "https://discord.com/api/webhooks/…"}
                    className="w-full"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || (isWebhookChannel(form.channel) && !form.webhook_url.trim())}
                >
                  Save Rule
                </Button>
                <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mt-3">{activeCfg.hint}.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-surface-container rounded-xl animate-pulse" />) : (rules || []).map((r: any) => {
          const cfg = typeConfig(r.type);
          const value = r.threshold?.[cfg.key] ?? r.threshold?.value ?? "—";
          return (
            <Card key={r.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Bell className="w-4 h-4 text-primary" /></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-on-surface">{cfg.label} · {value}{cfg.unit}</p>
                  <p className="text-xs text-on-surface-variant">{cfg.hint} · notify via {r.channel}</p>
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
          );
        })}
        {!isLoading && !rules?.length && <p className="text-center text-on-surface-variant text-sm py-8">No alert rules yet</p>}
      </div>
    </div>
  );
}

export default function AlertsPage() {
  return <Content />;
}
