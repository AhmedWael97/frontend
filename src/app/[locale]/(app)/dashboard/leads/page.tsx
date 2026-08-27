"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { growthApi } from "@/api";
import { toast } from "@/lib/use-toast";
import { Users, Plus, Trash2, Upload, Sparkles, Send, Flame, Loader2, Mail } from "lucide-react";

type Lead = {
  id: number; company: string | null; website: string | null; contact_name: string | null;
  email: string | null; source: string; status: string; score: number; notes: string | null;
  last_contacted_at: string | null;
};

type LeadStats = {
  total: number; new: number; contacted: number; delivered: number; bounced: number;
  unsubscribed: number; replied: number; won: number; lost: number;
  with_email: number; drafts_pending: number; reply_rate: number;
};

const STATUSES = ["new", "contacted", "replied", "won", "lost"];
const PER_PAGE = 25;

/** One number from the pipeline. Clicking filters the table to that slice. */
function StatTile({ label, value, hint, tone, active, onClick }: {
  label: string; value: string | number; hint?: string; tone?: string; active?: boolean; onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`text-left rounded-xl border p-3.5 transition-colors ${
        active ? "border-primary bg-primary/5" : "border-outline-variant/30 bg-surface-container-lowest"
      } ${onClick ? "hover:border-primary/60 cursor-pointer" : "cursor-default"}`}
    >
      <div className={`text-2xl font-black tabular-nums ${tone ?? "text-on-surface"}`}>{value}</div>
      <div className="text-xs font-semibold text-on-surface-variant mt-0.5">{label}</div>
      {hint ? <div className="text-[11px] text-on-surface-variant/70 mt-0.5">{hint}</div> : null}
    </button>
  );
}
const STATUS_CLS: Record<string, string> = {
  new: "bg-sky-500/15 text-sky-400", contacted: "bg-amber-500/15 text-amber-400",
  replied: "bg-indigo-500/15 text-indigo-400", won: "bg-emerald-500/15 text-emerald-400", lost: "bg-rose-500/15 text-rose-400",
};

function OutreachDialog({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const qc = useQueryClient();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const draftMut = useMutation({
    mutationFn: () => growthApi.draft(lead.id).then((r) => r.data?.data ?? r.data),
    onSuccess: (d) => { setSubject(d?.subject ?? ""); setBody(d?.body ?? ""); },
    onError: () => toast.error("Could not generate a draft."),
  });
  const sendMut = useMutation({
    mutationFn: () => growthApi.send(lead.id, subject, body),
    onSuccess: () => { toast.success("Email sent."); qc.invalidateQueries({ queryKey: ["leads"] }); onClose(); },
    onError: (e: any) => toast.error(e?.message ?? "Send failed."),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Outreach — {lead.company || lead.email}</DialogTitle></DialogHeader>
        <div className="px-6 pb-6 space-y-3">
          {!lead.email && <p className="text-sm text-rose-400">This lead has no email address — add one before sending.</p>}
          <Button size="sm" variant="outline" onClick={() => draftMut.mutate()} disabled={draftMut.isPending} className="gap-1.5">
            {draftMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI draft
          </Button>
          <label className="block text-xs text-on-surface-variant">Subject
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1" />
          </label>
          <label className="block text-xs text-on-surface-variant">Body
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className="mt-1 w-full rounded-lg border border-outline-variant/40 bg-surface text-sm text-on-surface p-3 focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </label>
          <p className="text-[11px] text-on-surface-variant">An unsubscribe link is added automatically. Suppressed/bounced addresses are skipped. Review before sending.</p>
          <Button onClick={() => sendMut.mutate()} disabled={!lead.email || !subject.trim() || !body.trim() || sendMut.isPending} className="gap-1.5 w-full">
            {sendMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Content() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ company: "", website: "", email: "" });
  const [showImport, setShowImport] = useState(false);
  const [csv, setCsv] = useState("");
  const [outreach, setOutreach] = useState<Lead | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["leads", status, page],
    queryFn: () => growthApi
      .leads({ page, per_page: PER_PAGE, ...(status ? { status } : {}) })
      .then((r) => (r.data?.data ?? r.data) as { data: Lead[]; total: number; last_page: number; page: number }),
  });
  const leads: Lead[] = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  const { data: stats } = useQuery({
    queryKey: ["lead-stats"],
    queryFn: () => growthApi.leadsStats().then((r) => (r.data?.data ?? r.data) as LeadStats),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["leads"] });
    qc.invalidateQueries({ queryKey: ["lead-stats"] });
  };

  // A filter change reshuffles the result set, so page 3 of the old filter is
  // meaningless under the new one.
  const filterBy = (s: string) => { setStatus(s); setPage(1); };

  const addMut = useMutation({ mutationFn: () => growthApi.createLead(form), onSuccess: () => { setForm({ company: "", website: "", email: "" }); invalidate(); } });
  const warmMut = useMutation({ mutationFn: () => growthApi.warmLeads().then((r) => r.data?.data ?? r.data), onSuccess: (d) => { invalidate(); toast.success(`Added ${d?.created ?? 0} warm lead(s) from your site visitors.`); } });
  const importMut = useMutation({ mutationFn: () => growthApi.importLeads(csv).then((r) => r.data?.data ?? r.data), onSuccess: (d) => { setCsv(""); setShowImport(false); invalidate(); toast.success(`Imported ${d?.imported ?? 0} leads.`); } });
  const statusMut = useMutation({ mutationFn: ({ id, s }: { id: number; s: string }) => growthApi.updateLead(id, { status: s }), onSuccess: invalidate });
  const delMut = useMutation({ mutationFn: (id: number) => growthApi.deleteLead(id), onSuccess: invalidate });

  const td = "px-3 py-2.5 text-sm text-on-surface";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2"><Users className="w-6 h-6 text-primary" /> Leads</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Turn the companies visiting your sites into customers — compliant, reviewed outreach.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => warmMut.mutate()} disabled={warmMut.isPending} className="gap-1.5">
            {warmMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />} Find warm leads
          </Button>
          <Button variant="outline" onClick={() => setShowImport((v) => !v)} className="gap-1.5"><Upload className="w-4 h-4" /> Import</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <StatTile label="All leads" value={stats?.total ?? "—"} hint={stats ? `${stats.with_email} with an email` : undefined}
          active={status === ""} onClick={() => filterBy("")} />
        <StatTile label="Not contacted" value={stats?.new ?? "—"} hint={stats ? `${stats.drafts_pending} drafts ready` : undefined}
          active={status === "new"} onClick={() => filterBy("new")} />
        {/* Emails actually sent, bounces included — a bounced lead becomes `lost`,
            so counting by status made sends disappear from this number. */}
        <StatTile label="Contacted" value={stats?.contacted ?? "—"} tone="text-amber-400"
          hint={stats ? `${stats.delivered} delivered` : undefined}
          active={status === "contacted"} onClick={() => filterBy("contacted")} />
        <StatTile label="Bounced" value={stats?.bounced ?? "—"} tone="text-rose-400"
          hint={stats ? `${stats.unsubscribed} unsubscribed` : undefined} />
        <StatTile label="Responded" value={stats?.replied ?? "—"} tone="text-indigo-400"
          hint={stats ? `${stats.reply_rate}% of delivered` : undefined}
          active={status === "replied"} onClick={() => filterBy("replied")} />
        <StatTile label="Won" value={stats?.won ?? "—"} tone="text-emerald-400"
          active={status === "won"} onClick={() => filterBy("won")} />
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-2 sm:items-center">
          <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company" className="sm:w-44" />
          <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="Website" className="sm:w-44" />
          <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="flex-1" />
          <Button onClick={() => addMut.mutate()} disabled={addMut.isPending || (!form.company && !form.email)} className="gap-1.5"><Plus className="w-4 h-4" /> Add lead</Button>
        </CardContent>
        {showImport && (
          <CardContent className="pt-0 space-y-2">
            <p className="text-xs text-on-surface-variant">CSV header: <code>company,website,contact_name,email</code></p>
            <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={4} className="w-full rounded-lg border border-outline-variant/40 bg-surface text-sm text-on-surface p-3 font-mono focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="company,website,contact_name,email" />
            <Button onClick={() => importMut.mutate()} disabled={!csv.trim() || importMut.isPending} className="gap-1.5"><Upload className="w-4 h-4" /> Import</Button>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold text-on-surface flex items-center gap-2">
            {status ? <span className="capitalize">{status}</span> : "All leads"} <Badge variant="secondary">{total}</Badge>
          </CardTitle>
          <select value={status} onChange={(e) => filterBy(e.target.value)} className="h-8 px-2 rounded-lg border border-outline-variant/40 bg-surface text-sm text-on-surface">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead><tr className="border-b border-outline-variant/20 text-xs uppercase tracking-widest text-on-surface-variant">
                <th className="px-3 py-2.5 text-left">Company</th><th className="px-3 py-2.5 text-left">Email</th><th className="px-3 py-2.5 text-left">Source</th><th className="px-3 py-2.5 text-left">Status</th><th className="px-3 py-2.5 text-right">Score</th><th className="px-3 py-2.5 w-24"></th>
              </tr></thead>
              <tbody>
                {isLoading ? Array.from({ length: 5 }).map((_, i) => (<tr key={i} className="border-b border-outline-variant/10">{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-3 py-2.5"><div className="h-4 bg-surface-container-high rounded animate-pulse w-20" /></td>)}</tr>))
                  : leads.map((l) => (
                    <tr key={l.id} className="border-b border-outline-variant/10 hover:bg-surface-container/40">
                      <td className={td}><div className="font-semibold">{l.company || "—"}</div><div className="text-xs text-on-surface-variant">{l.website}</div></td>
                      <td className={td + " text-on-surface-variant"}>{l.email || "—"}</td>
                      <td className={td}><span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">{l.source}</span></td>
                      <td className={td}>
                        <select value={l.status} onChange={(e) => statusMut.mutate({ id: l.id, s: e.target.value })} className={`text-xs font-bold rounded-full px-2 py-1 border-0 ${STATUS_CLS[l.status] ?? ""}`}>
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className={td + " text-right tabular-nums"}>{l.score}</td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        <button onClick={() => setOutreach(l)} title="Draft & send" className="text-on-surface-variant hover:text-primary inline-flex"><Mail className="w-4 h-4" /></button>
                        <button onClick={() => delMut.mutate(l.id)} title="Delete" className="text-on-surface-variant hover:text-rose-400 ltr:ml-3 rtl:mr-3 inline-flex"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                {!isLoading && leads.length === 0 && <tr><td colSpan={6} className="px-3 py-10 text-center text-on-surface-variant text-sm">No leads yet — click "Find warm leads" to pull companies that visited your sites.</td></tr>}
              </tbody>
            </table>
          </div>
          {lastPage > 1 && (
            <div className="flex items-center justify-between gap-3 px-3 py-2.5 border-t border-outline-variant/20">
              <span className="text-xs text-on-surface-variant tabular-nums">
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} of {total}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1 || isLoading} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <span className="text-xs text-on-surface-variant tabular-nums">{page} / {lastPage}</span>
                <Button variant="outline" size="sm" disabled={page >= lastPage || isLoading} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {outreach && <OutreachDialog lead={outreach} onClose={() => setOutreach(null)} />}
    </div>
  );
}

export default function LeadsPage() {
  return <Content />;
}
