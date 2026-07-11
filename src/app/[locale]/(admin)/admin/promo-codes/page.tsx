"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Plus, Trash2, Ticket } from "lucide-react";
import { toast } from "@/lib/use-toast";

interface PromoCode {
  id: number;
  code: string;
  campaign_name: string | null;
  discount_type: "percent" | "fixed";
  discount_value: string;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  redemptions_count: number;
}

export default function AdminPromoCodesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "", campaign_name: "", discount_type: "percent", discount_value: "10", max_uses: "", expires_at: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-promo-codes"],
    queryFn: () => adminApi.promoCodes().then((r) => r.data?.data ?? r.data),
  });

  const createMut = useMutation({
    mutationFn: () => adminApi.createPromoCode({
      code: form.code,
      campaign_name: form.campaign_name || null,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at || null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-promo-codes"] });
      setShowForm(false);
      setForm({ code: "", campaign_name: "", discount_type: "percent", discount_value: "10", max_uses: "", expires_at: "" });
      toast.success("Promo code created.");
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not create code."),
  });

  const toggleMut = useMutation({
    mutationFn: (p: PromoCode) => adminApi.updatePromoCode(p.id, { is_active: !p.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-promo-codes"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminApi.deletePromoCode(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-promo-codes"] }),
  });

  const codes: PromoCode[] = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary" /> Promo Codes
          </h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Trackable discount codes per campaign — applied to the USD base price before EGP conversion</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary hover:opacity-90">
          <Plus className="w-4 h-4" /> New code
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="rounded-2xl border border-outline-variant/20 p-5 grid gap-3 sm:grid-cols-3">
          <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="CODE (e.g. TIKTOK20)" className="h-10 rounded-xl border border-outline-variant/30 bg-surface px-3 text-sm uppercase" />
          <input value={form.campaign_name} onChange={(e) => setForm({ ...form, campaign_name: e.target.value })} placeholder="Campaign name (optional)" className="h-10 rounded-xl border border-outline-variant/30 bg-surface px-3 text-sm" />
          <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="h-10 rounded-xl border border-outline-variant/30 bg-surface px-3 text-sm">
            <option value="percent">% off</option>
            <option value="fixed">$ off</option>
          </select>
          <input required type="number" step="0.01" min="0.01" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} placeholder="Discount value" className="h-10 rounded-xl border border-outline-variant/30 bg-surface px-3 text-sm" />
          <input type="number" min="1" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="Max uses (blank = unlimited)" className="h-10 rounded-xl border border-outline-variant/30 bg-surface px-3 text-sm" />
          <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="h-10 rounded-xl border border-outline-variant/30 bg-surface px-3 text-sm" />
          <button type="submit" disabled={createMut.isPending} className="sm:col-span-3 h-10 rounded-xl bg-primary text-on-primary text-sm font-bold">
            {createMut.isPending ? "Creating…" : "Create code"}
          </button>
        </form>
      )}

      <div className="rounded-2xl border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead><tr className="border-b border-outline-variant/20 text-xs uppercase tracking-widest text-on-surface-variant">
              <th className="px-3 py-2.5 text-left">Code</th><th className="px-3 py-2.5 text-left">Campaign</th><th className="px-3 py-2.5 text-right">Discount</th><th className="px-3 py-2.5 text-right">Used</th><th className="px-3 py-2.5 text-left">Expires</th><th className="px-3 py-2.5 text-center">Active</th><th className="px-3 py-2.5"></th>
            </tr></thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="px-3 py-8 text-center text-on-surface-variant">Loading…</td></tr>}
              {!isLoading && codes.length === 0 && <tr><td colSpan={7} className="px-3 py-8 text-center text-on-surface-variant">No promo codes yet.</td></tr>}
              {codes.map((p) => (
                <tr key={p.id} className="border-b border-outline-variant/10">
                  <td className="px-3 py-2.5 font-mono font-bold text-on-surface">{p.code}</td>
                  <td className="px-3 py-2.5 text-on-surface-variant">{p.campaign_name || "—"}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{p.discount_type === "percent" ? `${p.discount_value}%` : `$${p.discount_value}`}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{p.used_count}{p.max_uses ? ` / ${p.max_uses}` : ""}</td>
                  <td className="px-3 py-2.5 text-on-surface-variant">{p.expires_at ? new Date(p.expires_at).toLocaleDateString() : "Never"}</td>
                  <td className="px-3 py-2.5 text-center">
                    <button onClick={() => toggleMut.mutate(p)} className={`px-2 py-1 rounded-lg text-xs font-bold ${p.is_active ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-surface-container text-on-surface-variant"}`}>
                      {p.is_active ? "Active" : "Off"}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button onClick={() => { if (confirm(`Delete ${p.code}?`)) deleteMut.mutate(p.id); }} className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-error">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
