"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analyticsApi, pipelinesApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Plus, Trash2, GripVertical, ArrowDown, Target, X, Film } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import InsightPanel from "@/components/ai/InsightPanel";

type Step = { name: string; url_pattern: string; match_type: string };

function Content() {
  const { selectedDomainId } = useAuthStore();
  const locale = useLocale();
  const qClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [steps, setSteps] = useState<Step[]>([{ name: "", url_pattern: "", match_type: "contains" }]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [addingStep, setAddingStep] = useState(false);
  const [newStep, setNewStep] = useState<Step>({ name: "", url_pattern: "", match_type: "contains" });

  const { data: funnels, isLoading } = useQuery({
    queryKey: ["funnels", selectedDomainId],
    queryFn: () => pipelinesApi.list(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => pipelinesApi.create(selectedDomainId!, data),
    onSuccess: () => {
      qClient.invalidateQueries({ queryKey: ["funnels"] });
      setNewName("");
      setSteps([{ name: "", url_pattern: "", match_type: "contains" }]);
      setCreateError(null);
    },
    onError: (err: any) => {
      const fieldErrors = err?.errors ?? {};
      const firstField = Object.keys(fieldErrors)[0];
      const firstMessage = firstField && Array.isArray(fieldErrors[firstField])
        ? fieldErrors[firstField][0]
        : err?.message || "Validation failed.";
      setCreateError(firstMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => pipelinesApi.delete(selectedDomainId!, id),
    onSuccess: () => { qClient.invalidateQueries({ queryKey: ["funnels"] }); setSelected(null); },
  });

  const addStepMutation = useMutation({
    mutationFn: (step: Step) => pipelinesApi.addStep(selectedDomainId!, selected.id, step),
    onSuccess: () => {
      qClient.invalidateQueries({ queryKey: ["funnels"] });
      setAddingStep(false);
      setNewStep({ name: "", url_pattern: "", match_type: "contains" });
    },
  });

  const removeStepMutation = useMutation({
    mutationFn: (stepId: number) => pipelinesApi.removeStep(selectedDomainId!, selected.id, stepId),
    onSuccess: () => qClient.invalidateQueries({ queryKey: ["funnels"] }),
  });

  // Keep selected in sync after refetch
  const selectedFunnel = funnels?.find((f: any) => f.id === selected?.id) ?? selected;

  const { data: funnelMetrics, isLoading: isFunnelMetricsLoading } = useQuery({
    queryKey: ["funnel-metrics", selectedDomainId, selectedFunnel?.id],
    queryFn: () =>
      analyticsApi.funnel(selectedDomainId!, selectedFunnel.id).then((r) => {
        const payload = r.data;
        return Array.isArray(payload) ? payload : (payload?.data ?? []);
      }),
    enabled: !!selectedDomainId && !!selectedFunnel?.id,
  });

  const metricByStepId = new Map<number, any>(
    (funnelMetrics || []).map((m: any) => [Number(m.step_id), m]),
  );

  const sortedSteps = [...(selectedFunnel?.steps || [])].sort(
    (a: any, b: any) => Number(a.order ?? 0) - Number(b.order ?? 0),
  );

  const funnelData = sortedSteps.map((s: any, i: number) => {
    const metric = metricByStepId.get(Number(s.id));
    return {
      name: s.name || `Step ${i + 1}`,
      visitors: Number(metric?.visitors ?? 0),
      sessions: Number(metric?.sessions ?? 0),
    };
  });

  const firstStepSessions = funnelData[0]?.sessions ?? 0;
  const lastStepSessions = funnelData[funnelData.length - 1]?.sessions ?? 0;
  const overallConversionPct = firstStepSessions > 0
    ? Math.round((lastStepSessions / firstStepSessions) * 1000) / 10
    : 0;

  const stepDropOffs = funnelData.slice(1).map((step, idx) => {
    const prev = funnelData[idx]?.sessions ?? 0;
    if (prev <= 0) return 0;
    return Math.max(0, Math.round((1 - step.sessions / prev) * 1000) / 10);
  });

  const avgDropOffPct = stepDropOffs.length
    ? Math.round((stepDropOffs.reduce((sum, n) => sum + n, 0) / stepDropOffs.length) * 10) / 10
    : 0;

  const health = (() => {
    if (firstStepSessions < 20) {
      return {
        label: "Needs more data",
        color: "text-on-surface-variant",
        summary: "Not enough sessions yet to judge accurately. Keep collecting traffic.",
      };
    }
    if (overallConversionPct >= 35 && avgDropOffPct <= 25) {
      return {
        label: "Good",
        color: "text-emerald-400",
        summary: "This funnel is performing well. Most users continue through steps.",
      };
    }
    if (overallConversionPct >= 15 && avgDropOffPct <= 45) {
      return {
        label: "Needs enhancement",
        color: "text-amber-400",
        summary: "Some users are dropping off. Improve copy, clarity, and speed on weak steps.",
      };
    }
    return {
      label: "Bad",
      color: "text-rose-400",
      summary: "High drop-off detected. The funnel needs immediate UX and flow improvements.",
    };
  })();

  const canCreate = !!newName && !!selectedDomainId && steps.every((s) => s.name && s.url_pattern);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Funnels</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Conversion funnel analysis</p>
        </div>
      </div>

      <InsightPanel domainId={selectedDomainId} page="funnels" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: list + create form */}
        <div className="space-y-4">
          {/* Create form */}
          <div className="p-3 rounded-xl border border-outline-variant/20 bg-surface-container space-y-3">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">New Funnel</p>
            <Input
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                if (createError) setCreateError(null);
              }}
              placeholder="Funnel name e.g. Checkout Flow"
              className="text-sm"
            />

            <div className="space-y-2">
              <p className="text-xs text-on-surface-variant">Steps (in order)</p>
              {steps.map((s, i) => (
                <div key={i} className="space-y-1.5 p-2 bg-surface rounded-lg border border-outline-variant/10">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-primary w-5">{i + 1}</span>
                    <Input
                      value={s.name}
                      onChange={(e) => {
                        setSteps(steps.map((x, j) => j === i ? { ...x, name: e.target.value } : x));
                        if (createError) setCreateError(null);
                      }}
                      placeholder="Step name e.g. Homepage"
                      className="text-xs h-7"
                    />
                    {steps.length > 1 && (
                      <button onClick={() => setSteps(steps.filter((_, j) => j !== i))} className="text-on-surface-variant hover:text-error">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1.5 pl-5">
                    <Input
                      value={s.url_pattern}
                      onChange={(e) => {
                        setSteps(steps.map((x, j) => j === i ? { ...x, url_pattern: e.target.value } : x));
                        if (createError) setCreateError(null);
                      }}
                      placeholder="URL pattern e.g. /checkout"
                      className="text-xs h-7 flex-1"
                    />
                    <select
                      value={s.match_type}
                      onChange={(e) => {
                        setSteps(steps.map((x, j) => j === i ? { ...x, match_type: e.target.value } : x));
                        if (createError) setCreateError(null);
                      }}
                      className="text-xs h-7 px-1.5 rounded-md border border-outline-variant/30 bg-surface text-on-surface"
                    >
                      <option value="contains">contains</option>
                      <option value="equals">equals</option>
                      <option value="starts_with">starts with</option>
                      <option value="regex">regex</option>
                    </select>
                  </div>
                </div>
              ))}
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-xs h-7"
                onClick={() => setSteps([...steps, { name: "", url_pattern: "", match_type: "contains" }])}
              >
                <Plus className="w-3 h-3 mr-1" /> Add step
              </Button>
            </div>

            <Button
              size="sm"
              className="w-full"
              disabled={!canCreate || createMutation.isPending}
              onClick={() => createMutation.mutate({
                name: newName,
                domain_id: selectedDomainId,
                steps: steps.map((step, idx) => ({ ...step, order: idx + 1 })),
              })}
            >
              {createMutation.isPending ? "Creating…" : "Create Funnel"}
            </Button>
            {createError && (
              <p className="text-xs text-error">{createError}</p>
            )}
            {!selectedDomainId && (
              <p className="text-xs text-on-surface-variant">Select a domain from the top bar first.</p>
            )}
          </div>

          {/* Funnel list */}
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-surface-container rounded-xl animate-pulse" />)
            : (funnels || []).map((f: any) => (
              <div key={f.id} onClick={() => setSelected(f)} className={`p-3 rounded-xl cursor-pointer border transition-colors ${selectedFunnel?.id === f.id ? "border-primary bg-primary/5" : "border-outline-variant/20 hover:bg-surface-container"}`}>
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
            <p className="text-sm text-on-surface-variant text-center py-4">No funnels yet.</p>
          )}
        </div>

        {/* Right: chart + step manager */}
        <Card className="lg:col-span-2">
          {selectedFunnel ? (
            <>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">{selectedFunnel.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-outline-variant/20 bg-surface-container p-3">
                  <p className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Funnel health</p>
                  <p className={`text-sm font-bold mt-1 ${health.color}`}>{health.label}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{health.summary}</p>
                  <div className="mt-2 text-xs text-on-surface">
                    <p>
                      Conversion = (last step sessions / first step sessions) = {lastStepSessions} / {firstStepSessions || 1} = {overallConversionPct}%
                    </p>
                    <p>
                      Avg drop-off = average step loss = {avgDropOffPct}%
                    </p>
                  </div>
                </div>

                {funnelData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
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
                  <div className="text-center py-8 text-on-surface-variant text-sm">
                    No conversion data yet — visitors will appear here as they hit the tracked pages.
                  </div>
                )}

                {/* Step list */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Steps</p>
                  {sortedSteps.map((s: any, i: number) => (
                    <div key={s.id ?? i}>
                      <div className="flex items-center gap-3 p-2.5 bg-surface-container rounded-lg text-sm">
                        <GripVertical className="w-4 h-4 text-on-surface-variant shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-on-surface font-medium truncate">{s.name}</p>
                          <p className="text-xs text-on-surface-variant truncate">
                            <span className="opacity-60">{s.match_type ?? "contains"}:</span>{" "}
                            <code className="text-primary">{s.url_pattern}</code>
                          </p>
                        </div>
                        {i < sortedSteps.length - 1 && (
                          <a
                            href={`/${locale}/dashboard/replay?pipeline=${selectedFunnel.id}&step=${s.order ?? i + 1}&label=${encodeURIComponent(s.name || `Step ${i + 1}`)}`}
                            title="Watch sessions that dropped after this step"
                            className="text-on-surface-variant hover:text-primary transition-colors shrink-0"
                          >
                            <Film className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => removeStepMutation.mutate(s.id)}
                          disabled={removeStepMutation.isPending}
                          className="text-on-surface-variant hover:text-error transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {i < sortedSteps.length - 1 && (
                        <div className="flex justify-center my-1">
                          <ArrowDown className="w-3.5 h-3.5 text-on-surface-variant" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isFunnelMetricsLoading && (
                    <p className="text-xs text-on-surface-variant">Loading funnel metrics...</p>
                  )}

                  {/* Add step inline */}
                  {addingStep ? (
                    <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
                      <Input
                        value={newStep.name}
                        onChange={(e) => setNewStep({ ...newStep, name: e.target.value })}
                        placeholder="Step name e.g. Cart"
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Input
                          value={newStep.url_pattern}
                          onChange={(e) => setNewStep({ ...newStep, url_pattern: e.target.value })}
                          placeholder="URL pattern e.g. /cart"
                          className="text-sm flex-1"
                        />
                        <select
                          value={newStep.match_type}
                          onChange={(e) => setNewStep({ ...newStep, match_type: e.target.value })}
                          className="text-sm px-2 rounded-md border border-outline-variant/30 bg-surface text-on-surface"
                        >
                          <option value="contains">contains</option>
                          <option value="equals">equals</option>
                          <option value="starts_with">starts with</option>
                          <option value="regex">regex</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={!newStep.name || !newStep.url_pattern || addStepMutation.isPending}
                          onClick={() => addStepMutation.mutate(newStep)}
                        >
                          {addStepMutation.isPending ? "Adding…" : "Add Step"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setAddingStep(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" className="w-full text-xs" onClick={() => setAddingStep(true)}>
                      <Plus className="w-3 h-3 mr-1" /> Add step to this funnel
                    </Button>
                  )}
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
  return <Content />;
}