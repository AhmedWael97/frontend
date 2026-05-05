"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api";
import { toast } from "@/lib/use-toast";
import { formatDate } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  ArrowLeft, ShieldAlert, UserX, MailCheck, Globe,
  CalendarPlus, ArrowUpCircle, PauseCircle, PlayCircle,
  XCircle, ShieldOff, ShieldCheck, Pencil, X, Plus,
  BarChart2, Trash2,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

// ── Modal helper ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-on-surface">{title}</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><X className="w-5 h-5" /></button>
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

const statusVariant = (s: string) =>
  s === "active" ? "success" : s === "cancelled" ? "error" : s === "paused" ? "warning" : "secondary";

function Content() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { setToken, setUser, setImpersonating } = useAuthStore();

  // modal open states
  const [editOpen, setEditOpen] = useState(false);
  const [assignSubOpen, setAssignSubOpen] = useState(false);
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);
  const [formError, setFormError] = useState("");

  // edit user form
  const [eName, setEName] = useState("");
  const [eEmail, setEEmail] = useState("");
  const [eRole, setERole] = useState("user");

  // assign subscription form
  const [assignPlanId, setAssignPlanId] = useState("");
  const [assignNotes, setAssignNotes] = useState("");

  // change plan form
  const [changePlanId, setChangePlanId] = useState("");

  // extend form
  const [extendDays, setExtendDays] = useState("30");

  const invalidateUser = () => queryClient.invalidateQueries({ queryKey: ["admin-user", id] });

  const { data: userData, isLoading } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => adminApi.getUser(Number(id)).then((r) => r.data),
  });
  const user = userData?.data ?? userData;

  const { data: plansData } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: () => adminApi.listPlans().then((r) => r.data),
  });
  const plans = plansData?.data || plansData || [];

  // ── Mutations ───────────────────────────────────────────────────────────────
  const impersonateMut = useMutation({
    mutationFn: () => adminApi.impersonateUser(Number(id)),
    onSuccess: (res) => {
      const adminToken = localStorage.getItem("eye_token");
      if (adminToken) localStorage.setItem("eye_token_admin_backup", adminToken);
      setToken(res.data.token);
      setUser(null);
      setImpersonating(true);
      router.push(`/${locale}/dashboard`);
    },
    onError: (e: any) => toast.error(e.message || "Impersonation failed"),
  });

  const blockMut = useMutation({
    mutationFn: () => user?.status === "blocked"
      ? adminApi.unblockUser(Number(id))
      : adminApi.blockUser(Number(id)),
    onSuccess: () => { toast.success("User status updated"); invalidateUser(); },
    onError: (e: any) => toast.error(e.message),
  });

  const verifyEmailMut = useMutation({
    mutationFn: () => adminApi.verifyUserEmail(Number(id)),
    onSuccess: () => { toast.success("Email verified"); invalidateUser(); },
    onError: (e: any) => toast.error(e.message),
  });

  const disable2faMut = useMutation({
    mutationFn: () => adminApi.disableUser2fa(Number(id)),
    onSuccess: () => { toast.success("2FA disabled"); invalidateUser(); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleAdminMut = useMutation({
    mutationFn: () => adminApi.toggleUserAdmin(Number(id)),
    onSuccess: () => { toast.success("Role updated"); invalidateUser(); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: () => adminApi.deleteUser(Number(id)),
    onSuccess: () => { toast.success("User deleted"); router.push(`/${locale}/admin/users`); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: () => adminApi.updateUser(Number(id), { name: eName, email: eEmail, role: eRole }),
    onSuccess: () => { toast.success("User updated"); setEditOpen(false); invalidateUser(); },
    onError: (e: any) => setFormError(e.message),
  });

  const assignSubMut = useMutation({
    mutationFn: () => adminApi.assignUserSubscription(Number(id), {
      plan_id: Number(assignPlanId),
      notes: assignNotes || undefined,
    }),
    onSuccess: () => { toast.success("Subscription assigned"); setAssignSubOpen(false); setAssignPlanId(""); setAssignNotes(""); setFormError(""); invalidateUser(); },
    onError: (e: any) => setFormError(e.message),
  });

  const changePlanMut = useMutation({
    mutationFn: () => adminApi.upgradeSubscription(user?.subscription?.id, Number(changePlanId)),
    onSuccess: () => { toast.success("Plan changed"); setChangePlanOpen(false); setChangePlanId(""); setFormError(""); invalidateUser(); },
    onError: (e: any) => setFormError(e.message),
  });

  const extendMut = useMutation({
    mutationFn: () => adminApi.extendSubscription(user?.subscription?.id, Number(extendDays)),
    onSuccess: () => { toast.success("Subscription extended"); setExtendOpen(false); setFormError(""); invalidateUser(); },
    onError: (e: any) => setFormError(e.message),
  });

  const cancelSubMut = useMutation({
    mutationFn: () => adminApi.cancelSubscription(user?.subscription?.id),
    onSuccess: () => { toast.success("Subscription cancelled"); invalidateUser(); },
    onError: (e: any) => toast.error(e.message),
  });

  const pauseSubMut = useMutation({
    mutationFn: () => adminApi.pauseSubscription(user?.subscription?.id),
    onSuccess: () => { toast.success("Subscription paused"); invalidateUser(); },
    onError: (e: any) => toast.error(e.message),
  });

  const resumeSubMut = useMutation({
    mutationFn: () => adminApi.resumeSubscription(user?.subscription?.id),
    onSuccess: () => { toast.success("Subscription resumed"); invalidateUser(); },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-surface-container rounded-2xl animate-pulse w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 bg-surface-container rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const sub = user?.subscription;
  const domains: any[] = user?.domains || [];
  const isBlocked = user?.status === "blocked";

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-start gap-3 flex-wrap">
        <button onClick={() => router.back()} className="p-2 hover:bg-surface-container rounded-xl transition-colors text-on-surface-variant mt-1">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-on-surface tracking-tight">{user?.name}</h1>
            <Badge variant={user?.role === "superadmin" ? "warning" : "secondary"}>{user?.role}</Badge>
            <Badge variant={isBlocked ? "error" : "success"}>{isBlocked ? "Blocked" : "Active"}</Badge>
          </div>
          <p className="text-on-surface-variant text-sm mt-0.5">{user?.email} · ID #{user?.id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => { setEName(user?.name || ""); setEEmail(user?.email || ""); setERole(user?.role || "user"); setFormError(""); setEditOpen(true); }}>
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => impersonateMut.mutate()} disabled={impersonateMut.isPending}>
            <ShieldAlert className="w-3.5 h-3.5" /> Login As
          </Button>
          <Button variant={isBlocked ? "outline" : "destructive"} size="sm" onClick={() => blockMut.mutate()} disabled={blockMut.isPending}>
            <UserX className="w-3.5 h-3.5" /> {isBlocked ? "Unblock" : "Block"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => { if (confirm(`Permanently delete user "${user?.name}"? This cannot be undone.`)) deleteMut.mutate(); }}
            disabled={deleteMut.isPending}
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Account Info ─────────────────────────────────────────────────── */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-xs uppercase tracking-widest text-on-surface-variant">Account Info</CardTitle></CardHeader>
          <CardContent className="space-y-0 divide-y divide-outline-variant/10">
            {([
              ["Registered", formatDate(user?.created_at)],
              ["Timezone", user?.timezone || "UTC"],
              ["Email Verified", user?.email_verified_at ? formatDate(user.email_verified_at) : "Not verified"],
              ["2FA", user?.totp_enabled ? "Enabled" : "Disabled"],
              ["Last Login", user?.last_login_at ? formatDate(user.last_login_at) : "—"],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="flex justify-between py-2.5">
                <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{label}</span>
                <span className="text-sm text-on-surface text-right max-w-[55%] truncate">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Security Actions ──────────────────────────────────────────────── */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-xs uppercase tracking-widest text-on-surface-variant">Security Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {!user?.email_verified_at && (
              <button
                onClick={() => verifyEmailMut.mutate()}
                disabled={verifyEmailMut.isPending}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border border-outline-variant/30 hover:bg-surface-container-high transition-colors text-on-surface disabled:opacity-50"
              >
                <MailCheck className="w-4 h-4 text-primary" /> Mark Email Verified
              </button>
            )}
            {user?.totp_enabled && (
              <button
                onClick={() => { if (confirm("Disable 2FA for this user?")) disable2faMut.mutate(); }}
                disabled={disable2faMut.isPending}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border border-outline-variant/30 hover:bg-surface-container-high transition-colors text-on-surface disabled:opacity-50"
              >
                <ShieldOff className="w-4 h-4 text-warning" /> Disable 2FA
              </button>
            )}
            <button
              onClick={() => { if (confirm(`${user?.role === "superadmin" ? "Revoke" : "Grant"} admin role for this user?`)) toggleAdminMut.mutate(); }}
              disabled={toggleAdminMut.isPending}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border border-outline-variant/30 hover:bg-surface-container-high transition-colors text-on-surface disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              {user?.role === "superadmin" ? "Revoke Admin Role" : "Grant Admin Role"}
            </button>
          </CardContent>
        </Card>

        {/* ── Subscription ─────────────────────────────────────────────────── */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-widest text-on-surface-variant">Subscription</CardTitle>
              {!sub && (
                <button
                  onClick={() => { setFormError(""); setAssignPlanId(""); setAssignNotes(""); setAssignSubOpen(true); }}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Assign Plan
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {sub ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-black text-on-surface">{sub.plan?.name}</p>
                  <Badge variant={statusVariant(sub.status) as any}>{sub.status}</Badge>
                </div>
                <div className="text-xs text-on-surface-variant space-y-1">
                  <p>Start: {sub.current_period_start ? formatDate(sub.current_period_start) : "—"}</p>
                  <p>Renewal: {sub.current_period_end ? formatDate(sub.current_period_end) : "—"}</p>
                  {sub.notes && <p className="italic">Note: {sub.notes}</p>}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => { setFormError(""); setChangePlanId(String(sub.plan_id || "")); setChangePlanOpen(true); }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-outline-variant/30 hover:bg-surface-container-high text-on-surface transition-colors"
                  >
                    <ArrowUpCircle className="w-3.5 h-3.5 text-primary" /> Change Plan
                  </button>
                  <button
                    onClick={() => { setFormError(""); setExtendDays("30"); setExtendOpen(true); }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-outline-variant/30 hover:bg-surface-container-high text-on-surface transition-colors"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-primary" /> Extend
                  </button>
                  {sub.status === "active" && (
                    <button
                      onClick={() => { if (confirm("Pause this subscription?")) pauseSubMut.mutate(); }}
                      disabled={pauseSubMut.isPending}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-outline-variant/30 hover:bg-surface-container-high text-on-surface transition-colors disabled:opacity-50"
                    >
                      <PauseCircle className="w-3.5 h-3.5 text-warning" /> Pause
                    </button>
                  )}
                  {sub.status === "paused" && (
                    <button
                      onClick={() => resumeSubMut.mutate()}
                      disabled={resumeSubMut.isPending}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-outline-variant/30 hover:bg-surface-container-high text-on-surface transition-colors disabled:opacity-50"
                    >
                      <PlayCircle className="w-3.5 h-3.5 text-success" /> Resume
                    </button>
                  )}
                  {sub.status !== "cancelled" && (
                    <button
                      onClick={() => { if (confirm("Cancel this subscription?")) cancelSubMut.mutate(); }}
                      disabled={cancelSubMut.isPending}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-error/30 hover:bg-error/5 text-error transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">Free tier — no active subscription.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Domains ────────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs uppercase tracking-widest text-on-surface-variant">
            Domains ({domains.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {domains.length === 0 ? (
            <p className="px-4 py-6 text-sm text-on-surface-variant">No domains registered yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  {["Domain", "Status", "Created", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {domains.map((d: any) => (
                  <tr key={d.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-medium text-on-surface">{d.domain}</span>
                      </span>
                      {d.name && d.name !== d.domain && (
                        <p className="text-xs text-on-surface-variant pl-5">{d.name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={d.active ? "success" : "secondary"}>{d.active ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">{formatDate(d.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        title="View analytics as this user"
                        onClick={() => impersonateMut.mutate()}
                        disabled={impersonateMut.isPending}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-outline-variant/30 hover:bg-surface-container-high text-on-surface transition-colors disabled:opacity-50"
                      >
                        <BarChart2 className="w-3.5 h-3.5 text-primary" /> View Analytics
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* ── Edit User Modal ───────────────────────────────────────────────────── */}
      {editOpen && (
        <Modal title="Edit User" onClose={() => setEditOpen(false)}>
          <div className="space-y-4">
            <FieldRow label="Name">
              <Input value={eName} onChange={(e) => setEName(e.target.value)} />
            </FieldRow>
            <FieldRow label="Email">
              <Input type="email" value={eEmail} onChange={(e) => setEEmail(e.target.value)} />
            </FieldRow>
            <FieldRow label="Role">
              <select
                value={eRole}
                onChange={(e) => setERole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant/30 bg-surface-container text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="user">User</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </FieldRow>
            {formError && <p className="text-xs text-error">{formError}</p>}
            <Button className="w-full" disabled={updateMut.isPending} onClick={() => updateMut.mutate()}>
              {updateMut.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </Modal>
      )}

      {/* ── Assign Subscription Modal ─────────────────────────────────────────── */}
      {assignSubOpen && (
        <Modal title="Assign Subscription" onClose={() => setAssignSubOpen(false)}>
          <div className="space-y-4">
            <FieldRow label="Plan">
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
            </FieldRow>
            <FieldRow label="Notes (optional)">
              <Input placeholder="e.g. Promo, free trial…" value={assignNotes} onChange={(e) => setAssignNotes(e.target.value)} />
            </FieldRow>
            {formError && <p className="text-xs text-error">{formError}</p>}
            <Button className="w-full" disabled={!assignPlanId || assignSubMut.isPending} onClick={() => assignSubMut.mutate()}>
              {assignSubMut.isPending ? "Assigning…" : "Assign Plan"}
            </Button>
          </div>
        </Modal>
      )}

      {/* ── Change Plan Modal ─────────────────────────────────────────────────── */}
      {changePlanOpen && (
        <Modal title="Change Plan" onClose={() => setChangePlanOpen(false)}>
          <div className="space-y-4">
            <FieldRow label="New Plan">
              <select
                value={changePlanId}
                onChange={(e) => setChangePlanId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant/30 bg-surface-container text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select a plan…</option>
                {plans.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} — ${Number(p.price_monthly || 0).toFixed(2)}/mo</option>
                ))}
              </select>
            </FieldRow>
            {formError && <p className="text-xs text-error">{formError}</p>}
            <Button className="w-full" disabled={!changePlanId || changePlanMut.isPending} onClick={() => changePlanMut.mutate()}>
              {changePlanMut.isPending ? "Saving…" : "Update Plan"}
            </Button>
          </div>
        </Modal>
      )}

      {/* ── Extend Subscription Modal ─────────────────────────────────────────── */}
      {extendOpen && (
        <Modal title="Extend Subscription" onClose={() => setExtendOpen(false)}>
          <div className="space-y-4">
            <p className="text-sm text-on-surface-variant">
              Current expiry: <strong className="text-on-surface">{sub?.current_period_end ? formatDate(sub.current_period_end) : "N/A"}</strong>
            </p>
            <FieldRow label="Days to add">
              <Input type="number" min={1} max={3650} value={extendDays} onChange={(e) => setExtendDays(e.target.value)} />
            </FieldRow>
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
              onClick={() => extendMut.mutate()}
            >
              {extendMut.isPending ? "Saving…" : `Extend by ${extendDays} days`}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function AdminUserDetailPage() {
  return <Content />;
}

function Content() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { setToken, setUser, setImpersonating } = useAuthStore();

  const { data: user, isLoading } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => adminApi.getUser(Number(id)).then((r) => r.data),
  });

  const impersonateMutation = useMutation({
    mutationFn: () => adminApi.impersonateUser(Number(id)),
    onSuccess: (res) => {
      // Back up the admin token so it can be restored on exit
      const adminToken = localStorage.getItem("eye_token");
      if (adminToken) localStorage.setItem("eye_token_admin_backup", adminToken);

      // Swap active token to the impersonation token
      setToken(res.data.token);
      setUser(null); // force re-fetch of user profile as target user
      setImpersonating(true);

      router.push(`/${locale}/dashboard`);
    },
  });

  const banMutation = useMutation({
    mutationFn: () => user?.banned_at
      ? adminApi.unblockUser(Number(id))
      : adminApi.blockUser(Number(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-user", id] }),
  });

  const verifyEmailMutation = useMutation({
    mutationFn: () => adminApi.verifyUserEmail(Number(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-user", id] }),
  });

  if (isLoading) return <div className="h-40 bg-surface-container rounded-xl animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-surface-container rounded-xl transition-colors text-on-surface-variant"><ArrowLeft className="w-4 h-4" /></button>
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">{user?.name}</h1>
          <p className="text-on-surface-variant text-sm">{user?.email}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {!user?.email_verified_at && (
            <Button variant="outline" onClick={() => verifyEmailMutation.mutate()} disabled={verifyEmailMutation.isPending}>
              <MailCheck className="w-4 h-4" /> Verify User
            </Button>
          )}
          <Button variant="outline" onClick={() => impersonateMutation.mutate()} disabled={impersonateMutation.isPending}>
            <ShieldAlert className="w-4 h-4" /> Impersonate
          </Button>
          <Button variant="destructive" onClick={() => banMutation.mutate()} disabled={banMutation.isPending}>
            <UserX className="w-4 h-4" /> {user?.banned_at ? "Unban" : "Ban"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Account Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Role", <Badge key="role" variant={user?.role === "admin" ? "warning" : "secondary"}>{user?.role}</Badge>],
              ["Status", <Badge key="status" variant={user?.banned_at ? "error" : "success"}>{user?.banned_at ? "Banned" : "Active"}</Badge>],
              ["Email Verified", user?.email_verified_at ? formatDate(user.email_verified_at) : "—"],
              ["2FA", user?.totp_enabled ? "Enabled" : "Disabled"],
              ["Registered", formatDate(user?.created_at)],
              ["Timezone", user?.timezone || "UTC"],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between py-2 border-b border-outline-variant/10 last:border-0">
                <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{label}</span>
                <span className="text-sm text-on-surface">{value as any}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Subscription</CardTitle></CardHeader>
          <CardContent>
            {user?.subscription ? (
              <div className="space-y-2">
                <p className="text-lg font-black text-on-surface">{user.subscription.plan?.name}</p>
                <Badge variant={user.subscription.status === "active" ? "success" : "secondary"}>{user.subscription.status}</Badge>
                <p className="text-xs text-on-surface-variant">Expires {user.subscription.current_period_end ? formatDate(user.subscription.current_period_end) : "—"}</p>
              </div>
            ) : <p className="text-on-surface-variant text-sm">Free tier (no active subscription)</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminUserDetailPage() {
  return <Content />;
}
