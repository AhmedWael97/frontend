"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Check, Copy, Plus, Trash2, Zap } from "lucide-react";

type EventDraft = {
  id: string;
  name: string;
  propertyKey: string;
  propertyValue: string;
};

const newDraft = (): EventDraft => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: "",
  propertyKey: "plan",
  propertyValue: "pro",
});

function Content() {
  const { selectedDomainId } = useAuthStore();
  const qClient = useQueryClient();
  const [events, setEvents] = useState<EventDraft[]>([
    { id: "event-1", name: "checkout_start", propertyKey: "plan", propertyValue: "pro" },
  ]);
  const [copied, setCopied] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["custom-events", selectedDomainId],
    queryFn: () => analyticsApi.customEvents(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const dbEvents = Array.isArray(data) ? data : [];

  const saveEventsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDomainId) throw new Error("Select a domain first.");

      const validEvents = events
        .map((evt) => ({
          name: evt.name.trim(),
          key: evt.propertyKey.trim() || "value",
          value: evt.propertyValue.trim(),
        }))
        .filter((evt) => evt.name.length > 0);

      if (!validEvents.length) {
        throw new Error("Add at least one event name before saving.");
      }

      for (const evt of validEvents) {
        await analyticsApi.customEventsStore(selectedDomainId, {
          name: evt.name,
          props: { [evt.key]: evt.value },
          url: typeof window !== "undefined" ? window.location.href : "",
        });
      }

      return validEvents.length;
    },
    onSuccess: (savedCount: number) => {
      setSaveResult(`Saved ${savedCount} custom event${savedCount > 1 ? "s" : ""}. They should appear in the table shortly.`);
      qClient.invalidateQueries({ queryKey: ["custom-events", selectedDomainId] });
    },
    onError: (err: any) => {
      setSaveResult(err?.message || "Could not save events.");
    },
  });

  const firstEvent = events[0] ?? newDraft();
  const snippet = useMemo(() => {
    const safeEvent = (firstEvent.name || "custom_event").trim();
    const safeKey = (firstEvent.propertyKey || "key").trim();
    const safeValue = (firstEvent.propertyValue || "value").trim();

    return `window.EYE.track('${safeEvent}', { ${safeKey}: '${safeValue}' });`;
  }, [firstEvent.name, firstEvent.propertyKey, firstEvent.propertyValue]);

  const copySnippet = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Custom Events</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Track custom interactions and conversions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Create & Save Custom Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-on-surface-variant">
            Custom events are created by calling <code className="text-primary">window.EYE.track()</code> in your website code.
          </p>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Editable Event Table</p>
            <div className="overflow-x-auto rounded-lg border border-outline-variant/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container">
                    <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Event Name</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Property Key</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Property Value</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((evt, idx) => (
                    <tr key={evt.id} className="border-b border-outline-variant/10 last:border-b-0">
                      <td className="px-3 py-2 min-w-[220px]">
                        <Input
                          value={evt.name}
                          onChange={(e) => setEvents((prev) => prev.map((x) => x.id === evt.id ? { ...x, name: e.target.value } : x))}
                          placeholder={`event name ${idx + 1} (e.g. signup_click)`}
                        />
                      </td>
                      <td className="px-3 py-2 min-w-[180px]">
                        <Input
                          value={evt.propertyKey}
                          onChange={(e) => setEvents((prev) => prev.map((x) => x.id === evt.id ? { ...x, propertyKey: e.target.value } : x))}
                          placeholder="property key (e.g. plan)"
                        />
                      </td>
                      <td className="px-3 py-2 min-w-[180px]">
                        <Input
                          value={evt.propertyValue}
                          onChange={(e) => setEvents((prev) => prev.map((x) => x.id === evt.id ? { ...x, propertyValue: e.target.value } : x))}
                          placeholder="property value (e.g. pro)"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setEvents((prev) => prev.length > 1 ? prev.filter((x) => x.id !== evt.id) : prev)}
                          disabled={events.length <= 1}
                          title="Remove event row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setEvents((prev) => [...prev, newDraft()])}
            >
              <Plus className="w-4 h-4 mr-1" /> Add event row
            </Button>
          </div>

          <div className="rounded-lg border border-outline-variant/20 bg-surface-container p-3">
            <pre className="text-xs text-on-surface whitespace-pre-wrap break-words">{snippet}</pre>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={copySnippet}>
              {copied ? <><Check className="w-4 h-4 mr-1" /> Copied</> : <><Copy className="w-4 h-4 mr-1" /> Copy snippet</>}
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                setSaveResult(null);
                saveEventsMutation.mutate();
              }}
              disabled={!selectedDomainId || saveEventsMutation.isPending}
            >
              {saveEventsMutation.isPending ? "Saving..." : "Save events"}
            </Button>
            <p className="text-xs text-on-surface-variant">Place this in your site button click handler, checkout flow, or form submit logic.</p>
          </div>
          {saveResult && (
            <p className="text-xs text-on-surface-variant">{saveResult}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">
              Saved Events In Database — Last 30 Days
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant px-2 py-1 rounded-md bg-surface-container border border-outline-variant/20">
                {dbEvents.length} event{dbEvents.length === 1 ? "" : "s"}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => qClient.invalidateQueries({ queryKey: ["custom-events", selectedDomainId] })}
                disabled={!selectedDomainId}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <p className="px-4 pt-4 text-xs text-on-surface-variant">
            This table shows what is already saved in database. Historical analytics rows are aggregated records and cannot be edited or removed directly from this table.
          </p>
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
                ) : dbEvents.map((e: any) => (
                  <tr key={e.name} className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-primary" />
                        <span className="font-medium text-on-surface">{e.name}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-on-surface">{(e.occurrences ?? e.count)?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{e.unique_visitors?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{e.avg_value ? `$${e.avg_value.toFixed(2)}` : "—"}</td>
                  </tr>
                ))}
                {!isLoading && !dbEvents.length && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-on-surface-variant">
                      No saved custom events in database yet. Click <span className="text-primary font-semibold">Save events</span> above, wait a few seconds, then click <span className="text-primary font-semibold">Refresh</span>.
                    </td>
                  </tr>
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
  return <Content />;
}
