"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api";
import { toast } from "@/lib/use-toast";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Search, X, PauseCircle, PlayCircle, XCircle,
  ArrowUpCircle, CalendarPlus, Plus, ChevronLeft, ChevronRight,
} from "lucide-react";

// ── Inline modal ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-on-surface">{title}</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const statusVariant = (s: string) =>
  s === "active" ? "success" : s === "cancelled" ? "error" : s === "paused" ? "warning" : "secondary";

function Content() {
  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // modal state
  const [upgradeModal, setUpgradeModal] = useState<any>(null);
  const [extendModal, setExtendModal] = useState<any>(null);
  const [assignModal, setAssignModal] = useState(false);

  // form values
  const [upgradePlanId, setUpgradePlanId] = useState("");
  const [extendDays, setExtendDays] = useState("30");
  const [assignUserId, setAssignUserId] = useState("");
  const [assignPlanId, setAssignPlanId] = useState("");
  const [assignNotes, setAssignNotes] = useState("");
  const [formError, setFormError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-subscriptions", page, search, statusFilter],
    queryFn: () =>
      adminApi.listSubscriptions({ search: search || undefined, status: statusFilter || undefined, page } as any).then((r) => r.data),
  });

  const { data: plansData } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: () => adminApi.listPlans().then((r) => r.data),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });

  const cancelMut = useMutation({
    mutationFn: (id: number) => adminApi.cancelSubscription(id),
    onSuccess: () => { toast.success("Subscription cancelled"); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  const pauseMut = useMutation({
    mutationFn: (id: number) => adminApi.pauseSubscription(id),
    onSuccess: () => { toast.success("Subscription paused"); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  const resumeMut = useMutation({
    mutationFn: (id: number) => adminApi.resumeSubscription(id),
    onSuccess: () => { toast.success("Subscription resumed"); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  const upgradeMut = useMutation({
    mutationFn: ({ id, plan_id }: { id: number; plan_id: number }) =>
      adminApi.upgradeSubscription(id, plan_id),
    onSuccess: () => { toast.success("Plan changed"); setUpgradeModal(null); invalidate(); },
    onError: (e: any) => setFormError(e.message),
  });

  const extendMut = useMutation({
    mutationFn: ({ id, days }: { id: number; days: number }) =>
      adminApi.extendSubscription(id, days),
    onSuccess: () => { toast.success("Subscription extended"); setExtendModal(null); invalidate(); },
    onError: (e: any) => setFormError(e.message),
  });

  const assignMut = useMutation({
    mutationFn: () =>
      adminApi.assignUserSubscription(Number(assignUserId), {
        plan_id: Number(assignPlanId),
        notes: assignNotes || undefined,
      }),
    onSuccess: () => {
      toast.success("Subscription assigned");
      setAssignModal(false);
      setAssignUserId(""); setAssignPlanId(""); setAssignNotes(""); setFormError("");
      invalidate();
    },
    onError: (e: any) => setFormError(e.message),
  });

  const subs = data?.data || [];
  const meta = data?.meta;
  const plans = plansData?.data || plansData || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Subscriptions</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Manage all user subscriptions</p>
        </div>
        <Button onClick={() => { setFormError(""); setAssignModal(true); }}>
          <Plus className="w-4 h-4" /> Assign Subscription
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <Input
            placeholder="Search by user name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-outline-variant/30 bg-surface-container text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-outline-variant/20">
                {["User", "Plan", "Status", "Start", "Renewal", "MRR", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-outline-variant/10">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-container-high rounded animate-pulse w-24" /></td>
                    ))}
                  </tr>
                ))
                : subs.map((s: any) => (
                  <tr key={s.id} className="border-b border-outline-variant/10 hover:bg-surface-container/40 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/${locale}/admin/users/${s.user?.id}`)}
                        className="font-medium text-on-surface hover:text-primary transition-colors text-left"
                      >
                        {s.user?.name || s.user?.email || "—"}
                      </button>
                      <p className="text-xs text-on-surface-variant">{s.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{s.plan?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(s.status) as any}>{s.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">
                      {s.current_period_start ? formatDate(s.current_period_start) : "—"}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">
                      {s.current_period_end ? formatDate(s.current_period_end) : "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-on-surface">
                      ${Number(s.plan?.price_monthly || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* Change Plan */}
                        <button
                          title="Change plan"
                          onClick={() => { setFormError(""); setUpgradePlanId(String(s.plan_id || "")); setUpgradeModal(s); }}
                          className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                        >
                          <ArrowUpCircle className="w-4 h-4" />
                        </button>
                        {/* Extend */}
                        <button
                          title="Extend subscription"
                          onClick={() => { setFormError(""); setExtendDays("30"); setExtendModal(s); }}
                          className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                        >
                          <CalendarPlus className="w-4 h-4" />
                        </button>
                        {/* Pause / Resume */}
                        {s.status === "active" ? (
                          <button
                            title="Pause subscription"
                            onClick={() => { if (confirm("Pause this subscription?")) pauseMut.mutate(s.id); }}
                            className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-warning transition-colors"
                          >
                            <PauseCircle className="w-4 h-4" />
                          </button>
                        ) : s.status === "paused" ? (
                          <button
                            title="Resume subscription"
                            onClick={() => resumeMut.mutate(s.id)}
                            className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-success transition-colors"
                          >
                            <PlayCircle className="w-4 h-4" />
                          </button>
                        ) : null}
                        {/* Cancel */}
                        {s.status !== "cancelled" && (
                          <button
                            title="Cancel subscription"
                            onClick={() => { if (confirm("Cancel this subscription?")) cancelMut.mutate(s.id); }}
                            className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-error transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-on-surface-variant">
          <span>{meta.total} total subscriptions</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg hover:bg-surface-container-high disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {page} of {meta.last_page}</span>
            <button
              onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
              disabled={page >= meta.last_page}
              className="p-1.5 rounded-lg hover:bg-surface-container-high disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {upgradeModal && (
        <Modal title={`Change Plan — ${upgradeModal.user?.name || upgradeModal.user?.email}`} onClose={() => setUpgradeModal(null)}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">New Plan</label>
              <select
                value={upgradePlanId}
                onChange={(e) => setUpgradePlanId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant/30 bg-surface-container text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select a plan…</option>
                {plans.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} — ${Number(p.price_monthly || 0).toFixed(2)}/mo</option>
                ))}
              </select>
            </div>
            {formError && <p className="text-xs text-error">{formError}</p>}
            <Button
              className="w-full"
              disabled={!upgradePlanId || upgradeMut.isPending}
              onClick={() => upgradeMut.mutate({ id: upgradeModal.id, plan_id: Number(upgradePlanId) })}
            >
              {upgradeMut.isPending ? "Saving…" : "Update Plan"}
            </Button>
          </div>
        </Modal>
      )}

      {/* Extend Modal */}
      {extendModal && (
        <Modal title={`Extend Subscription — ${extendModal.user?.name || extendModal.user?.email}`} onClose={() => setExtendModal(null)}>
          <div className="space-y-4">
            <p className="text-sm text-on-surface-variant">
              Current expiry: <strong className="text-on-surface">{extendModal.current_period_end ? formatDate(extendModal.current_period_end) : "N/A"}</strong>
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Days to add</label>
              <Input
                type="number"
                min={1}
                max={3650}
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {[7, 14, 30, 90, 365].map((d) => (
                <button
                  key={d}
                  onClick={() => setExtendDays(String(d))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${Number(extendDays) === d ? "bg-primary text-white border-primary" : "border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"}`}
                >
                  {d}d
                </button>
              ))}
            </div>
            {formError && <p className="text-xs text-error">{formError}</p>}
            <Button
              className="w-full"
              disabled={!extendDays || Number(extendDays) < 1 || extendMut.isPending}
              onClick={() => extendMut.mutate({ id: extendModal.id, days: Number(extendDays) })}
            >
              {extendMut.isPending ? "Saving…" : `Extend by ${extendDays} days`}
            </Button>
          </div>
        </Modal>
      )}

      {/* Assign Subscription Modal */}
      {assignModal && (
        <Modal title="Assign Subscription to User" onClose={() => setAssignModal(false)}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">User ID</label>
              <Input
                type="number"
                placeholder="User ID (from Users list)"
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Plan</label>
              <select
                value={assignPlanId}
                onChange={(e) => setAssignPlanId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant/30 bg-surface-container text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select a plan…</option>
                {plans.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} — ${Number(p.price_monthly || 0).toFixed(2)}/mo</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Notes (optional)</label>
              <Input
                placeholder="e.g. Manual promo assignment"
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
              />
            </div>
            {formError && <p className="text-xs text-error">{formError}</p>}
            <Button
              className="w-full"
              disabled={!assignUserId || !assignPlanId || assignMut.isPending}
              onClick={() => assignMut.mutate()}
            >
              {assignMut.isPending ? "Assigning…" : "Assign Subscription"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function AdminSubscriptionsPage() {
  return <Content />;
}
