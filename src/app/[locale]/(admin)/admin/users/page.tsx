"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api";
import { toast } from "@/lib/use-toast";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Search, Plus, X, Shield, Trash2, Ban, CheckCircle, UserCheck } from "lucide-react";

const qc = new QueryClient();

// ── Simple inline modal ───────────────────────────────────────────────────────
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

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{label}</label>
      {children}
    </div>
  );
}

function Content() {
  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);

  // create form
  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [cRole, setCRole] = useState("user");
  const [cError, setCError] = useState("");

  // edit form
  const [eName, setEName] = useState("");
  const [eEmail, setEEmail] = useState("");
  const [eRole, setERole] = useState("user");
  const [eError, setEError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: () => adminApi.listUsers({ search, page } as any).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => adminApi.createUser({ name: cName, email: cEmail, password: cPassword, role: cRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User created successfully");
      setCreateOpen(false);
      setCName(""); setCEmail(""); setCPassword(""); setCRole("user"); setCError("");
    },
    onError: (e: any) => setCError(e.message || "Failed to create user"),
  });

  const updateMutation = useMutation({
    mutationFn: () => adminApi.updateUser(editUser.id, { name: eName, email: eEmail, role: eRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User updated");
      setEditUser(null);
    },
    onError: (e: any) => setEError(e.message || "Failed to update user"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("User deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  const blockMutation = useMutation({
    mutationFn: ({ id, blocked }: { id: number; blocked: boolean }) =>
      blocked ? adminApi.unblockUser(id) : adminApi.blockUser(id),
    onSuccess: (_d, v) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(v.blocked ? "User unblocked" : "User blocked");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: number) => adminApi.verifyUserEmail(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Email verified"); },
    onError: (e: any) => toast.error(e.message),
  });

  const openEdit = (u: any) => {
    setEditUser(u); setEName(u.name); setEEmail(u.email); setERole(u.role); setEError("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Users</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">All registered accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search users…" className="pl-9" />
          </div>
          <Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Add User</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20">
                {["Name", "Email", "Role", "Plan", "Status", "Created", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-outline-variant/10">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-container-high rounded animate-pulse w-24" /></td>
                  ))}
                </tr>
              )) : (data?.data || []).map((u: any) => (
                <tr key={u.id} className="border-b border-outline-variant/10 hover:bg-surface-container/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-on-surface cursor-pointer hover:text-primary" onClick={() => router.push(`/${locale}/admin/users/${u.id}`)}>{u.name}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === "superadmin" ? "warning" : "secondary"}>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{u.subscription?.plan?.name || "Free"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.status === "blocked" ? "destructive" : u.email_verified_at ? "success" : "secondary"}>
                      {u.status === "blocked" ? "Blocked" : u.email_verified_at ? "Active" : "Unverified"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(u)} title="Edit" className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors">
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                      {!u.email_verified_at && (
                        <button onClick={() => verifyMutation.mutate(u.id)} title="Verify email" className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-green-500 transition-colors">
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => blockMutation.mutate({ id: u.id, blocked: u.status === "blocked" })}
                        title={u.status === "blocked" ? "Unblock" : "Block"}
                        className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-yellow-500 transition-colors"
                      >
                        {u.status === "blocked" ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete ${u.name}? This is permanent.`)) deleteMutation.mutate(u.id); }}
                        title="Delete"
                        className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-error transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.meta && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/20">
              <span className="text-xs text-on-surface-variant">Page {data.meta.current_page} of {data.meta.last_page} ({data.meta.total} users)</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-xs rounded-lg border border-outline-variant/30 disabled:opacity-40 hover:bg-surface-container transition-colors">Prev</button>
                <button disabled={page >= data.meta.last_page} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-xs rounded-lg border border-outline-variant/30 disabled:opacity-40 hover:bg-surface-container transition-colors">Next</button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      {createOpen && (
        <Modal title="Create User" onClose={() => setCreateOpen(false)}>
          <div className="space-y-4">
            <FieldRow label="Name"><Input value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Full name" /></FieldRow>
            <FieldRow label="Email"><Input type="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} placeholder="user@example.com" /></FieldRow>
            <FieldRow label="Password"><Input type="password" value={cPassword} onChange={(e) => setCPassword(e.target.value)} placeholder="Min 8 characters" /></FieldRow>
            <FieldRow label="Role">
              <select value={cRole} onChange={(e) => setCRole(e.target.value)} className="w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40">
                <option value="user">User</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </FieldRow>
            {cError && <p className="text-sm text-error">{cError}</p>}
            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={() => createMutation.mutate()} disabled={!cName || !cEmail || !cPassword || createMutation.isPending}>
                {createMutation.isPending ? "Creating…" : "Create User"}
              </Button>
              <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <Modal title={`Edit ${editUser.name}`} onClose={() => setEditUser(null)}>
          <div className="space-y-4">
            <FieldRow label="Name"><Input value={eName} onChange={(e) => setEName(e.target.value)} /></FieldRow>
            <FieldRow label="Email"><Input type="email" value={eEmail} onChange={(e) => setEEmail(e.target.value)} /></FieldRow>
            <FieldRow label="Role">
              <select value={eRole} onChange={(e) => setERole(e.target.value)} className="w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40">
                <option value="user">User</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </FieldRow>
            {eError && <p className="text-sm text-error">{eError}</p>}
            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving…" : "Save Changes"}
              </Button>
              <Button variant="ghost" onClick={() => setEditUser(null)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}

