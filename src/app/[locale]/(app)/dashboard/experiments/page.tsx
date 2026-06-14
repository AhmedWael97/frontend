"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { FlaskConical, Plus, Trash2, Trophy, X, Sparkles, ExternalLink, ChevronDown } from "lucide-react";

type Experiment = { id: number; key: string; name: string; variants: string[]; is_active: boolean };
type VariantResult = {
  variant: string;
  is_control: boolean;
  visitors: number;
  converters: number;
  orders: number;
  revenue: number;
  conversion_rate: number;
  revenue_per_visitor: number;
  uplift: number | null;
  z: number | null;
  significant: boolean | null;
};

function fmtMoney(n: number, currency?: string) {
  const amount = (Number(n) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
  return currency ? `${currency} ${amount}` : amount;
}

function Results({ domainId, experiment }: { domainId: number; experiment: Experiment }) {
  const { data, isLoading } = useQuery({
    queryKey: ["experiment-results", domainId, experiment.id],
    queryFn: () => analyticsApi.experimentResults(domainId, experiment.id).then((r) => r.data?.data ?? r.data),
  });

  const results: VariantResult[] = data?.results ?? [];
  const currency: string = data?.currency ?? "";

  // Winner = significant variant with the best conversion rate.
  const winner = results
    .filter((r) => r.significant && !r.is_control)
    .sort((a, b) => b.conversion_rate - a.conversion_rate)[0];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-on-surface flex items-center gap-2">
          {experiment.name}
          <code className="text-[11px] font-mono text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">{experiment.key}</code>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-40 bg-surface-container rounded animate-pulse" />
        ) : results.length === 0 ? (
          <p className="text-on-surface-variant text-sm py-6 text-center">No exposures recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead>
                <tr className="border-b border-outline-variant/20 text-xs uppercase tracking-widest text-on-surface-variant">
                  <th className="px-3 py-2 text-left">Variant</th>
                  <th className="px-3 py-2 text-right">Visitors</th>
                  <th className="px-3 py-2 text-right">Conv.</th>
                  <th className="px-3 py-2 text-right">Conv. rate</th>
                  <th className="px-3 py-2 text-right">Revenue</th>
                  <th className="px-3 py-2 text-right">Rev / visitor</th>
                  <th className="px-3 py-2 text-right">Uplift</th>
                  <th className="px-3 py-2 text-right">Significance</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.variant} className="border-b border-outline-variant/10">
                    <td className="px-3 py-2 font-medium text-on-surface">
                      <span className="inline-flex items-center gap-1.5">
                        {winner?.variant === r.variant && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
                        {r.variant}
                        {r.is_control && <span className="text-[10px] uppercase tracking-wide text-on-surface-variant">control</span>}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.visitors.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.converters.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold">{r.conversion_rate}%</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.revenue > 0 ? fmtMoney(r.revenue, currency) : "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.revenue_per_visitor > 0 ? fmtMoney(r.revenue_per_visitor, currency) : "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {r.uplift === null ? "—" : (
                        <span className={r.uplift >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          {r.uplift >= 0 ? "+" : ""}{r.uplift}%
                        </span>
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
              Significance uses a two-proportion z-test vs control (95% = |z| ≥ 1.96). Revenue is attributed to a variant when an
              exposed visitor later purchases.
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

function Content() {
  const { selectedDomainId } = useAuthStore();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Experiment | null>(null);
  const [form, setForm] = useState({ name: "", key: "", variants: ["control", "variant_b"] });
  const [error, setError] = useState("");

  const { data: experiments, isLoading } = useQuery({
    queryKey: ["experiments", selectedDomainId],
    queryFn: () => analyticsApi.experimentsList(selectedDomainId!).then((r) => (r.data?.data ?? r.data) as Experiment[]),
    enabled: !!selectedDomainId,
  });

  const createMut = useMutation({
    mutationFn: () =>
      analyticsApi.experimentsCreate(selectedDomainId!, {
        name: form.name.trim(),
        key: form.key.trim(),
        variants: form.variants.map((v) => v.trim()).filter(Boolean),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["experiments", selectedDomainId] });
      setAdding(false);
      setError("");
      setForm({ name: "", key: "", variants: ["control", "variant_b"] });
    },
    onError: (e: any) => setError(e?.message || "Could not create experiment."),
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
  const canCreate = form.name.trim() && /^[A-Za-z0-9_-]+$/.test(form.key.trim()) && form.variants.filter((v) => v.trim()).length >= 2;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">A/B Experiments</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Compare variants by conversion rate and revenue.</p>
        </div>
        <Button onClick={() => setAdding(true)}><Plus className="w-4 h-4" /> New Experiment</Button>
      </div>

      {/* GrowthBook-powered experiments (rigorous engine) + EYE revenue overlay */}
      <GrowthBookPanel domainId={selectedDomainId} />

      {adding && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">New Experiment</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-xs text-on-surface-variant">Name
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Homepage CTA test" className="mt-1" />
              </label>
              <label className="text-xs text-on-surface-variant">Key (used in code)
                <Input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="homepage_cta" className="mt-1 font-mono" />
              </label>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-on-surface-variant">Variants (first is control)</p>
              {form.variants.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant w-5">{i + 1}</span>
                  <Input
                    value={v}
                    onChange={(e) => setForm({ ...form, variants: form.variants.map((x, j) => (j === i ? e.target.value : x)) })}
                    className="font-mono h-9"
                  />
                  {form.variants.length > 2 && (
                    <button onClick={() => setForm({ ...form, variants: form.variants.filter((_, j) => j !== i) })} className="text-on-surface-variant hover:text-rose-400">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {form.variants.length < 6 && (
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setForm({ ...form, variants: [...form.variants, ""] })}>
                  <Plus className="w-3 h-3 mr-1" /> Add variant
                </Button>
              )}
            </div>
            <div className="rounded-lg bg-surface-container p-3 text-xs text-on-surface-variant font-mono">
              {`// On your site, assign + record the variant:`}<br />
              {`var v = EYE.ab(${JSON.stringify(form.key.trim() || "homepage_cta")}, ${JSON.stringify(form.variants.filter(Boolean))});`}<br />
              {`// …render UI based on v, then track sales as usual with EYE.purchase()`}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createMut.mutate()} disabled={!canCreate || createMut.isPending}>Create</Button>
              <Button variant="ghost" onClick={() => { setAdding(false); setError(""); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          {isLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 bg-surface-container rounded-xl animate-pulse" />)
            : list.length === 0 ? <p className="text-sm text-on-surface-variant py-6 text-center">No experiments yet.</p>
            : list.map((ex) => (
              <div
                key={ex.id}
                onClick={() => setSelected(ex)}
                className={`p-3 rounded-xl cursor-pointer border transition-colors ${selected?.id === ex.id ? "border-primary bg-primary/5" : "border-outline-variant/20 hover:bg-surface-container"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FlaskConical className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-semibold text-on-surface truncate">{ex.name}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); delMut.mutate(ex.id); }} className="text-on-surface-variant hover:text-rose-400 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">{ex.variants?.length ?? 0} variants · {ex.key}</p>
              </div>
            ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? <Results domainId={selectedDomainId} experiment={selected} />
            : <Card><CardContent className="flex items-center justify-center h-48 text-on-surface-variant text-sm">Select an experiment to view results</CardContent></Card>}
        </div>
      </div>
    </div>
  );
}

export default function ExperimentsPage() {
  return <Content />;
}
