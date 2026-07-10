"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { FlaskConical, Plus, Trash2, Trophy, Sparkles, ExternalLink, ChevronDown, Play, Pause, Pencil, GitBranch } from "lucide-react";
import { ExperimentBuilder, type ExpFull, type ExpVariation } from "./ExperimentBuilder";
import InsightPanel from "@/components/ai/InsightPanel";

type Experiment = {
  id: number; key: string; name: string; status: string;
  type: "ab" | "split_url"; target_url: string | null;
  goal_type: "purchase" | "event" | "url"; goal_value: string | null;
  variations: ExpVariation[];
};
type ResultRow = {
  key: string; name: string; weight: number; is_control: boolean;
  visitors: number; converters: number; conversion_rate: number;
  uplift: number | null; revenue: number; z: number | null; significant: boolean | null;
};

function Results({ domainId, experiment }: { domainId: number; experiment: Experiment }) {
  const { data, isLoading } = useQuery({
    queryKey: ["experiment-results", domainId, experiment.id],
    queryFn: () => analyticsApi.experimentResults(domainId, experiment.id).then((r) => r.data?.data ?? r.data),
  });

  const results: ResultRow[] = data?.results ?? [];
  const total = results.reduce((s, r) => s + r.visitors, 0);
  const winner = results.filter((r) => r.significant && !r.is_control).sort((a, b) => b.conversion_rate - a.conversion_rate)[0];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-on-surface">{experiment.name} — results</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-40 bg-surface-container rounded animate-pulse" />
        ) : results.length === 0 ? (
          <p className="text-on-surface-variant text-sm py-6 text-center">No visitors recorded yet. Start the experiment and wait for traffic.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[620px]">
              <thead>
                <tr className="border-b border-outline-variant/20 text-xs uppercase tracking-widest text-on-surface-variant">
                  <th className="px-3 py-2 text-left">Variation</th>
                  <th className="px-3 py-2 text-right">Visitors (seen / total)</th>
                  <th className="px-3 py-2 text-right">Conversions</th>
                  <th className="px-3 py-2 text-right">Conv. rate</th>
                  <th className="px-3 py-2 text-right">Uplift</th>
                  <th className="px-3 py-2 text-right">Significance</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.key} className="border-b border-outline-variant/10">
                    <td className="px-3 py-2 font-medium text-on-surface">
                      <span className="inline-flex items-center gap-1.5">
                        {winner?.key === r.key && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
                        {r.name}
                        {r.is_control && <span className="text-[10px] uppercase tracking-wide text-on-surface-variant">control</span>}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.visitors.toLocaleString()} / {total.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.converters.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold">{r.conversion_rate}%</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {r.uplift === null ? "—" : (
                        <span className={r.uplift >= 0 ? "text-emerald-400" : "text-rose-400"}>{r.uplift >= 0 ? "+" : ""}{r.uplift}%</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {r.is_control ? <span className="text-on-surface-variant text-xs">baseline</span>
                        : r.significant === null ? "—"
                        : r.significant ? <Badge variant="success">95%+</Badge>
                        : <span className="text-on-surface-variant text-xs">not yet</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-on-surface-variant mt-3">
              Significance = two-proportion z-test vs control (95% = |z| ≥ 1.96). “Visitors” = unique people who saw each variation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function fmtMoneyPlain(n: number, currency?: string) {
  const amount = (Number(n) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
  return currency ? `${currency} ${amount}` : amount;
}

// EYE revenue overlay for a GrowthBook experiment (rigorous stats live in GrowthBook).
function GbResults({ domainId, id, host }: { domainId: number; id: string; host?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["gb-results", domainId, id],
    queryFn: () => analyticsApi.gbResults(domainId, id).then((r) => r.data?.data ?? r.data),
  });
  const revenue: Record<string, { converters: number; orders: number; revenue: number }> = data?.revenue ?? {};
  const entries = Object.entries(revenue);

  return (
    <div className="px-3 pb-3">
      {isLoading ? (
        <div className="h-16 bg-surface-container rounded animate-pulse" />
      ) : (
        <>
          <p className="text-[11px] uppercase tracking-widest text-on-surface-variant mb-2">EYE revenue by variant</p>
          {entries.length === 0 ? (
            <p className="text-xs text-on-surface-variant">No revenue attributed yet for this experiment.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-[11px] uppercase tracking-wide text-on-surface-variant text-left">
                <th className="py-1">Variant</th><th className="py-1 text-right">Converters</th><th className="py-1 text-right">Orders</th><th className="py-1 text-right">Revenue</th>
              </tr></thead>
              <tbody>
                {entries.map(([variant, m]) => (
                  <tr key={variant} className="border-t border-outline-variant/10">
                    <td className="py-1 font-medium text-on-surface">{variant}</td>
                    <td className="py-1 text-right tabular-nums">{m.converters.toLocaleString()}</td>
                    <td className="py-1 text-right tabular-nums">{m.orders.toLocaleString()}</td>
                    <td className="py-1 text-right tabular-nums font-semibold">{fmtMoneyPlain(m.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {host && (
            <a href={`${host}/experiment/${id}`} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2">
              Open rigorous stats in GrowthBook <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </>
      )}
    </div>
  );
}

function GrowthBookPanel({ domainId }: { domainId: number }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { data: status } = useQuery({
    queryKey: ["gb-status", domainId],
    queryFn: () => analyticsApi.gbStatus(domainId).then((r) => r.data?.data ?? r.data),
  });
  const connected = !!status?.connected;
  const { data: list } = useQuery({
    queryKey: ["gb-list", domainId],
    queryFn: () => analyticsApi.gbList(domainId).then((r) => r.data?.data ?? r.data),
    enabled: connected,
  });
  const experiments: { id: string; name: string; trackingKey: string | null; status: string | null; variations: string[] }[] = list?.experiments ?? [];

  if (status === undefined) return null;

  if (!connected) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 text-sm">
          <p className="font-semibold text-on-surface flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Connect GrowthBook for rigorous experiments</p>
          <p className="text-on-surface-variant mt-1">
            Run experiments through GrowthBook (open-source) for a real stats engine — sequential/Bayesian significance, sample-size, and SRM checks — while EYE overlays your revenue per variant.
          </p>
          <p className="text-on-surface-variant mt-2 text-xs">
            Set <code className="bg-surface px-1 rounded">GROWTHBOOK_API_HOST</code> and <code className="bg-surface px-1 rounded">GROWTHBOOK_API_KEY</code> on the backend, point GrowthBook at EYE’s ClickHouse, and add the GrowthBook SDK with a tracking callback that calls <code className="bg-surface px-1 rounded">EYE.experiment(key, variant)</code>. See integrations/growthbook/README.md.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-on-surface flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> GrowthBook experiments
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {experiments.length === 0 ? (
          <p className="text-sm text-on-surface-variant px-4 pb-4">No experiments in GrowthBook yet.</p>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {experiments.map((ex) => (
              <div key={ex.id}>
                <button onClick={() => setOpenId(openId === ex.id ? null : ex.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-container/50 transition-colors">
                  <FlaskConical className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{ex.name}</p>
                    <p className="text-xs text-on-surface-variant">{ex.variations.length} variations · {ex.trackingKey}</p>
                  </div>
                  {ex.status && <Badge variant="secondary">{ex.status}</Badge>}
                  <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform ${openId === ex.id ? "rotate-180" : ""}`} />
                </button>
                {openId === ex.id && <GbResults domainId={domainId} id={ex.id} host={status?.host} />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ConvertResults({ domainId, id }: { domainId: number; id: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["convert-results", domainId, id],
    queryFn: () => analyticsApi.convertResults(domainId, id).then((r) => r.data?.data ?? r.data),
  });
  const revenue: Record<string, { converters: number; orders: number; revenue: number }> = data?.revenue ?? {};
  const entries = Object.entries(revenue);
  return (
    <div className="px-3 pb-3">
      {isLoading ? (
        <div className="h-16 bg-surface-container rounded animate-pulse" />
      ) : entries.length === 0 ? (
        <p className="text-xs text-on-surface-variant">No EYE revenue attributed yet for this experience.</p>
      ) : (
        <table className="w-full text-sm">
          <thead><tr className="text-[11px] uppercase tracking-wide text-on-surface-variant text-left">
            <th className="py-1">Variant</th><th className="py-1 text-right">Converters</th><th className="py-1 text-right">Orders</th><th className="py-1 text-right">Revenue</th>
          </tr></thead>
          <tbody>
            {entries.map(([variant, m]) => (
              <tr key={variant} className="border-t border-outline-variant/10">
                <td className="py-1 font-medium text-on-surface">{variant}</td>
                <td className="py-1 text-right tabular-nums">{m.converters.toLocaleString()}</td>
                <td className="py-1 text-right tabular-nums">{m.orders.toLocaleString()}</td>
                <td className="py-1 text-right tabular-nums font-semibold">{fmtMoneyPlain(m.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ConvertPanel({ domainId }: { domainId: number }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { data: status } = useQuery({
    queryKey: ["convert-status", domainId],
    queryFn: () => analyticsApi.convertStatus(domainId).then((r) => r.data?.data ?? r.data),
  });
  const connected = !!status?.connected;
  const { data: list } = useQuery({
    queryKey: ["convert-list", domainId],
    queryFn: () => analyticsApi.convertList(domainId).then((r) => r.data?.data ?? r.data),
    enabled: connected,
  });
  const experiments: { id: string; name: string; key: string | null; status: string | null; variations: string[] }[] = list?.experiments ?? [];

  if (status === undefined) return null;

  if (!connected) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 text-sm">
          <p className="font-semibold text-on-surface flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Connect Convert.com</p>
          <p className="text-on-surface-variant mt-1">
            Run A/B tests in Convert.com (visual editor + stats engine) while EYE overlays your revenue per variant.
          </p>
          <p className="text-on-surface-variant mt-2 text-xs">
            Set <code className="bg-surface px-1 rounded">CONVERT_ACCOUNT_ID</code> and <code className="bg-surface px-1 rounded">CONVERT_API_KEY</code> on the backend, and fire <code className="bg-surface px-1 rounded">EYE.experiment(experienceKey, variant)</code> from Convert's tracking hook. See integrations/convert/README.md.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-on-surface flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> Convert.com experiments
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {experiments.length === 0 ? (
          <p className="text-sm text-on-surface-variant px-4 pb-4">No experiences in Convert.com yet.</p>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {experiments.map((ex) => (
              <div key={ex.id}>
                <button onClick={() => setOpenId(openId === ex.id ? null : ex.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-container/50 transition-colors">
                  <FlaskConical className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{ex.name}</p>
                    <p className="text-xs text-on-surface-variant">{ex.variations.length} variations · {ex.key}</p>
                  </div>
                  {ex.status && <Badge variant="secondary">{ex.status}</Badge>}
                  <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform ${openId === ex.id ? "rotate-180" : ""}`} />
                </button>
                {openId === ex.id && <ConvertResults domainId={domainId} id={ex.id} />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const STATUS_STYLE: Record<string, string> = {
  running: "text-emerald-400 bg-emerald-400/10",
  paused: "text-amber-400 bg-amber-400/10",
  draft: "text-on-surface-variant bg-surface-container",
};

function Content() {
  const { selectedDomainId } = useAuthStore();
  const qc = useQueryClient();
  const [builder, setBuilder] = useState<{ open: boolean; experiment: ExpFull | null }>({ open: false, experiment: null });
  const [selected, setSelected] = useState<Experiment | null>(null);

  const { data: experiments, isLoading } = useQuery({
    queryKey: ["experiments", selectedDomainId],
    queryFn: () => analyticsApi.experimentsList(selectedDomainId!).then((r) => (r.data?.data ?? r.data) as Experiment[]),
    enabled: !!selectedDomainId,
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      analyticsApi.experimentsUpdate(selectedDomainId!, id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["experiments", selectedDomainId] }),
  });

  const delMut = useMutation({
    mutationFn: (id: number) => analyticsApi.experimentsDelete(selectedDomainId!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["experiments", selectedDomainId] });
      setSelected(null);
    },
  });

  if (!selectedDomainId) {
    return <div className="flex items-center justify-center h-64"><p className="text-on-surface-variant">Select a domain to manage experiments.</p></div>;
  }

  const list = experiments ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">A/B Experiments</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Build A/B and split-URL tests, split traffic by weight, and compare conversion rates.</p>
        </div>
        {!builder.open && <Button onClick={() => setBuilder({ open: true, experiment: null })}><Plus className="w-4 h-4" /> New Experiment</Button>}
      </div>

      {!builder.open && <InsightPanel domainId={selectedDomainId} page="experiments" />}

      {builder.open ? (
        <ExperimentBuilder
          domainId={selectedDomainId}
          experiment={builder.experiment}
          onClose={() => setBuilder({ open: false, experiment: null })}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            {isLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-surface-container rounded-xl animate-pulse" />)
              : list.length === 0 ? <p className="text-sm text-on-surface-variant py-6 text-center">No experiments yet. Click “New Experiment” to build one.</p>
              : list.map((ex) => {
                const isRunning = ex.status === "running";
                return (
                  <div
                    key={ex.id}
                    onClick={() => setSelected(ex)}
                    className={`p-3 rounded-xl cursor-pointer border transition-colors ${selected?.id === ex.id ? "border-primary bg-primary/5" : "border-outline-variant/20 hover:bg-surface-container"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {ex.type === "split_url" ? <GitBranch className="w-4 h-4 text-primary shrink-0" /> : <FlaskConical className="w-4 h-4 text-primary shrink-0" />}
                        <span className="text-sm font-semibold text-on-surface truncate">{ex.name}</span>
                      </div>
                      <span className={`text-[10px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded ${STATUS_STYLE[ex.status] ?? STATUS_STYLE.draft}`}>{ex.status}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 truncate">
                      {ex.type === "split_url" ? "Split URL" : "A/B"} · {ex.variations?.length ?? 0} variations · goal: {ex.goal_type}
                    </p>
                    <div className="flex items-center gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" className="h-7 text-xs px-2"
                        disabled={statusMut.isPending}
                        onClick={() => statusMut.mutate({ id: ex.id, status: isRunning ? "paused" : "running" })}>
                        {isRunning ? <><Pause className="w-3 h-3 mr-1" /> Pause</> : <><Play className="w-3 h-3 mr-1" /> Start</>}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => setBuilder({ open: true, experiment: ex as unknown as ExpFull })}>
                        <Pencil className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <button onClick={() => { if (confirm("Delete this experiment?")) delMut.mutate(ex.id); }} className="ml-auto text-on-surface-variant hover:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="lg:col-span-2">
            {selected ? <Results domainId={selectedDomainId} experiment={selected} />
              : <Card><CardContent className="flex items-center justify-center h-48 text-on-surface-variant text-sm">Select an experiment to view results</CardContent></Card>}
          </div>
        </div>
      )}

      {/* GrowthBook + Convert.com powered experiments (rigorous engines) + EYE revenue overlay */}
      <GrowthBookPanel domainId={selectedDomainId} />
      <ConvertPanel domainId={selectedDomainId} />
    </div>
  );
}

export default function ExperimentsPage() {
  return <Content />;
}
