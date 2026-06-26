"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/use-toast";
import { upgradeTicketsApi, adminApi, type UpgradeTicket } from "@/api";
import { TicketThread } from "@/components/upgrade/TicketThread";
import { MessageSquare, CheckCircle2, Loader2 } from "lucide-react";

const STATUS_TONE: Record<string, string> = {
  open: "bg-sky-500/10 text-sky-500",
  pending_user: "bg-amber-500/10 text-amber-500",
  resolved: "bg-emerald-500/10 text-emerald-500",
  closed: "bg-surface-container text-on-surface-variant",
};

function ResolvePanel({ ticket, onDone }: { ticket: UpgradeTicket; onDone: () => void }) {
  const [planId, setPlanId] = useState<string>(ticket.requested_plan_id ? String(ticket.requested_plan_id) : "");
  const [days, setDays] = useState<string>("30");

  const { data: plans } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: () => adminApi.listPlans().then((r) => (r.data ?? r.data?.data ?? []) as any[]),
  });

  const resolve = useMutation({
    mutationFn: () => upgradeTicketsApi.adminResolve(ticket.id, Number(planId), Number(days) || 30),
    onSuccess: () => { toast.success("Plan applied & ticket resolved."); onDone(); },
    onError: (e: any) => toast.error(e?.message ?? "Could not apply plan."),
  });

  const planList = Array.isArray(plans) ? plans : [];

  return (
    <div className="flex flex-wrap items-end gap-2 p-3 border-t border-outline-variant/15 bg-surface-container/30">
      <label className="text-xs text-on-surface-variant">Apply plan
        <select value={planId} onChange={(e) => setPlanId(e.target.value)}
          className="mt-1 block h-9 px-2 rounded-lg border border-outline-variant/40 bg-surface text-sm text-on-surface">
          <option value="">Select…</option>
          {planList.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>
      <label className="text-xs text-on-surface-variant">Days
        <input type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)}
          className="mt-1 block h-9 w-24 px-2 rounded-lg border border-outline-variant/40 bg-surface text-sm text-on-surface" />
      </label>
      <Button onClick={() => resolve.mutate()} disabled={!planId || resolve.isPending} className="gap-2">
        {resolve.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        Apply & resolve
      </Button>
    </div>
  );
}

function Content() {
  const qc = useQueryClient();
  const params = useSearchParams();
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const id = params.get("id");
    if (id) setSelected(Number(id));
  }, [params]);

  const { data: tickets } = useQuery({
    queryKey: ["admin-upgrade-tickets", status],
    queryFn: () => upgradeTicketsApi.adminList(status || undefined).then((r) => (r.data ?? []) as UpgradeTicket[]),
    refetchInterval: 15000,
  });

  const { data: ticket } = useQuery({
    queryKey: ["admin-upgrade-ticket", selected],
    queryFn: () => upgradeTicketsApi.adminShow(selected!).then((r) => r.data as UpgradeTicket),
    enabled: !!selected,
    refetchInterval: 8000,
  });

  const reply = useMutation({
    mutationFn: ({ body, file }: { body: string; file: File | null }) => {
      const fd = new FormData();
      if (body) fd.append("body", body);
      if (file) fd.append("attachment", file);
      return upgradeTicketsApi.adminReply(selected!, fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-upgrade-ticket", selected] });
      qc.invalidateQueries({ queryKey: ["admin-upgrade-tickets"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not send."),
  });

  const list = tickets ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" /> Upgrade Requests
        </h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Chat with users and apply plan upgrades manually.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="space-y-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="w-full h-9 px-2 rounded-lg border border-outline-variant/40 bg-surface text-sm text-on-surface">
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="pending_user">Pending user</option>
            <option value="resolved">Resolved</option>
          </select>
          {list.length === 0 && <p className="text-sm text-on-surface-variant py-6 text-center">No tickets.</p>}
          {list.map((t) => (
            <button key={t.id} onClick={() => setSelected(t.id)}
              className={`w-full text-left p-3 rounded-xl border transition-colors ${
                selected === t.id ? "border-primary bg-primary/5" : "border-outline-variant/20 hover:bg-surface-container"
              }`}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-on-surface flex-1 truncate">{t.subject}</span>
                <Badge className={STATUS_TONE[t.status]}>{t.status.replace("_", " ")}</Badge>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5 truncate">{t.user?.name} · {t.user?.email}</p>
            </button>
          ))}
        </div>

        {/* Thread */}
        <div className="lg:col-span-2">
          {selected && ticket ? (
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-outline-variant/15 pb-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm flex-1 truncate">{ticket.subject}</CardTitle>
                  <Badge className={STATUS_TONE[ticket.status]}>{ticket.status.replace("_", " ")}</Badge>
                </div>
                <p className="text-xs text-on-surface-variant">{ticket.user?.name} · {ticket.user?.email}</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[420px]">
                  <TicketThread
                    messages={ticket.messages ?? []}
                    viewerIsAdmin
                    sending={reply.isPending}
                    onSend={(body, file) => reply.mutate({ body, file })}
                  />
                </div>
                {ticket.status !== "resolved" && (
                  <ResolvePanel ticket={ticket} onDone={() => {
                    qc.invalidateQueries({ queryKey: ["admin-upgrade-ticket", selected] });
                    qc.invalidateQueries({ queryKey: ["admin-upgrade-tickets"] });
                  }} />
                )}
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent className="flex items-center justify-center h-64 text-on-surface-variant text-sm">Select a ticket</CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminUpgradeTicketsPage() {
  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  );
}
