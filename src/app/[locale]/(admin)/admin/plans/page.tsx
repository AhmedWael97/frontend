"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api";
import { toast } from "@/lib/use-toast";
import { Check, Plus, X, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

// ── Utilities ─────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-2xl w-full max-w-xl mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-on-surface">{title}</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{label}</label>
      {children}
    </div>
  );
}

const EMPTY_PLAN = {
  name: "", slug: "", description: "",
  price_monthly: "", price_yearly: "",
  limits: '{\n  "domains": 3,\n  "pageviews_per_month": 10000\n}',
  features: '{\n  "custom_domain": true\n}',
  is_active: true, is_public: true, sort_order: "0",
};

function PlanForm({ initial, onSubmit, isPending, error, submitLabel }: {
  initial: typeof EMPTY_PLAN;
  onSubmit: (data: Record<string, unknown>) => void;
  isPending: boolean;
  error: string;
  submitLabel: string;
}) {
  const [f, setF] = useState(initial);

  const set = (k: keyof typeof EMPTY_PLAN, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    let limits: unknown, features: unknown;
    try { limits = JSON.parse(f.limits); } catch { toast.error("Limits is not valid JSON"); return; }
    try { features = JSON.parse(f.features); } catch { toast.error("Features is not valid JSON"); return; }
    onSubmit({
      name: f.name, slug: f.slug, description: f.description || undefined,
      price_monthly: parseFloat(f.price_monthly as string),
      price_yearly: parseFloat(f.price_yearly as string),
      limits, features,
      is_active: f.is_active, is_public: f.is_public,
      sort_order: parseInt(f.sort_order as string, 10) || 0,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FieldRow label="Name"><Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Pro" /></FieldRow>
        <FieldRow label="Slug"><Input value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder="pro" /></FieldRow>
      </div>
      <FieldRow label="Description">
        <textarea value={f.description} onChange={(e) => set("description", e.target.value)} rows={2} placeholder="Plan description…" className="w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
      </FieldRow>
      <div className="grid grid-cols-3 gap-4">
        <FieldRow label="Monthly Price ($)"><Input type="number" min="0" step="0.01" value={f.price_monthly} onChange={(e) => set("price_monthly", e.target.value)} placeholder="29.00" /></FieldRow>
        <FieldRow label="Yearly Price ($)"><Input type="number" min="0" step="0.01" value={f.price_yearly} onChange={(e) => set("price_yearly", e.target.value)} placeholder="290.00" /></FieldRow>
        <FieldRow label="Sort Order"><Input type="number" min="0" value={f.sort_order} onChange={(e) => set("sort_order", e.target.value)} /></FieldRow>
      </div>
      <FieldRow label="Limits (JSON)">
        <textarea value={f.limits} onChange={(e) => set("limits", e.target.value)} rows={4} className="w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
      </FieldRow>
      <FieldRow label="Features (JSON)">
        <textarea value={f.features} onChange={(e) => set("features", e.target.value)} rows={4} className="w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
      </FieldRow>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={f.is_active} onChange={(e) => set("is_active", e.target.checked)} className="rounded" />
          <span className="text-sm text-on-surface">Active</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={f.is_public} onChange={(e) => set("is_public", e.target.checked)} className="rounded" />
          <span className="text-sm text-on-surface">Public</span>
        </label>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button className="flex-1" onClick={handleSubmit} disabled={!f.name || !f.slug || isPending}>
          {isPending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}

function planToForm(p: any): typeof EMPTY_PLAN {
  return {
    name: p.name || "",
    slug: p.slug || "",
    description: p.description || "",
    price_monthly: String(p.price_monthly ?? ""),
    price_yearly: String(p.price_yearly ?? ""),
    limits: JSON.stringify(p.limits || {}, null, 2),
    features: JSON.stringify(p.features || {}, null, 2),
    is_active: Boolean(p.is_active),
    is_public: Boolean(p.is_public),
    sort_order: String(p.sort_order ?? 0),
  };
}

function Content() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<any>(null);
  const [createError, setCreateError] = useState("");
  const [editError, setEditError] = useState("");

  const { data: plans, isLoading } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: () => adminApi.listPlans().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => adminApi.createPlan(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      toast.success("Plan created");
      setCreateOpen(false);
      setCreateError("");
    },
    onError: (e: any) => setCreateError(e.message || "Failed to create plan"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => adminApi.updatePlan(editPlan.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      toast.success("Plan updated");
      setEditPlan(null);
      setEditError("");
    },
    onError: (e: any) => setEditError(e.message || "Failed to update plan"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deletePlan(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-plans"] }); toast.success("Plan deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => adminApi.togglePlanVisibility(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-plans"] }); toast.success("Visibility updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Plans</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Manage subscription plans</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> New Plan</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 bg-surface-container rounded-xl animate-pulse" />) : (plans || []).map((p: any) => (
          <Card key={p.id} className="relative">
            {p.is_popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-on-primary">Most Popular</span>
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-black text-on-surface">{p.name}</h3>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleMutation.mutate(p.id)} title={p.is_public ? "Hide from public" : "Make public"} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors">
                    {p.is_public ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => { setEditPlan(p); setEditError(""); }} title="Edit" className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => { if (confirm(`Delete plan "${p.name}"? This cannot be undone.`)) deleteMutation.mutate(p.id); }} title="Delete" className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-error transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="my-3">
                <span className="text-3xl font-black text-on-surface">${p.price_monthly}</span>
                <span className="text-on-surface-variant text-sm">/mo</span>
                {p.price_yearly && <span className="text-xs text-on-surface-variant ml-2">(${p.price_yearly}/yr)</span>}
              </div>
              <p className="text-sm text-on-surface-variant mb-3">{p.description}</p>
              {p.limits && (
                <div className="mb-3 space-y-1">
                  {Object.entries(p.limits).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-on-surface-variant">{k.replace(/_/g, ' ')}</span>
                      <span className="font-semibold text-on-surface">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
              <ul className="space-y-1.5">
                {Object.entries(p.features || {}).map(([key, val]) => (
                  <li key={key} className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <Check className={`w-3.5 h-3.5 shrink-0 ${val ? 'text-green-600 dark:text-green-400' : 'opacity-30'}`} />
                    <span className={val ? '' : 'opacity-50'}>{key.replace(/_/g, ' ')}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-3 border-t border-outline-variant/10 flex justify-between text-xs text-on-surface-variant">
                <span>Subscribers: <strong className="text-on-surface">{p.subscriptions_count || 0}</strong></span>
                <div className="flex gap-1.5">
                  <Badge variant={p.is_active ? "success" : "secondary"}>{p.is_active ? "Active" : "Inactive"}</Badge>
                  <Badge variant={p.is_public ? "default" : "secondary"}>{p.is_public ? "Public" : "Hidden"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Plan Modal */}
      {createOpen && (
        <Modal title="Create Plan" onClose={() => setCreateOpen(false)}>
          <PlanForm
            initial={EMPTY_PLAN}
            onSubmit={(data) => createMutation.mutate(data)}
            isPending={createMutation.isPending}
            error={createError}
            submitLabel="Create Plan"
          />
        </Modal>
      )}

      {/* Edit Plan Modal */}
      {editPlan && (
        <Modal title={`Edit "${editPlan.name}"`} onClose={() => setEditPlan(null)}>
          <PlanForm
            initial={planToForm(editPlan)}
            onSubmit={(data) => updateMutation.mutate(data)}
            isPending={updateMutation.isPending}
            error={editError}
            submitLabel="Save Changes"
          />
        </Modal>
      )}
    </div>
  );
}

export default function AdminPlansPage() {
  return <Content />;
}
