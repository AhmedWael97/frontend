"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/use-toast";
import { upgradeTicketsApi, billingApi, type UpgradeTicket } from "@/api";
import { TicketThread } from "@/components/upgrade/TicketThread";
import { Plus, MessageSquare, ArrowLeft, Paperclip, Loader2 } from "lucide-react";

const STATUS_TONE: Record<string, string> = {
  open: "bg-sky-500/10 text-sky-500",
  pending_user: "bg-amber-500/10 text-amber-500",
  resolved: "bg-emerald-500/10 text-emerald-500",
  closed: "bg-surface-container text-on-surface-variant",
};

function NewRequest({ onCreated }: { onCreated: (id: number) => void }) {
  const qc = useQueryClient();
  const [planId, setPlanId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const { data: billing } = useQuery({ queryKey: ["billing"], queryFn: () => billingApi.show().then((r) => r.data) });
  const plans: any[] = (billing?.plans ?? []).filter((p: any) => Number(p.price_monthly) > 0);

  const create = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      if (planId) fd.append("plan_id", planId);
      fd.append("message", message.trim());
      if (file) fd.append("attachment", file);
      return upgradeTicketsApi.create(fd).then((r) => r.data);
    },
    onSuccess: (t: UpgradeTicket) => {
      qc.invalidateQueries({ queryKey: ["upgrade-tickets"] });
      toast.success("Request sent — our team will reply shortly.");
      onCreated(t.id);
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not send request."),
  });

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Request a plan upgrade</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-on-surface-variant">
          Tell us which plan you want and we&#39;ll set it up for you. You can chat with our team and share files here.
        </p>
        <label className="block text-xs text-on-surface-variant">Plan you want
          <select value={planId} onChange={(e) => setPlanId(e.target.value)}
            className="mt-1 w-full h-9 px-2 rounded-lg border border-outline-variant/40 bg-surface text-sm text-on-surface">
            <option value="">Not sure / discuss</option>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
          placeholder="Tell us a bit about what you need…"
          className="w-full resize-none rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-sm text-on-surface" />
        <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/40 px-2.5 py-1.5 hover:bg-surface-container">
            <Paperclip className="w-3.5 h-3.5" /> {file ? file.name : "Attach a file (optional)"}
          </span>
          <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <Button onClick={() => create.mutate()} disabled={!message.trim() || create.isPending} className="gap-2">
          {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Send request
        </Button>
      </CardContent>
    </Card>
  );
}

function Content() {
  const qc = useQueryClient();
  const params = useSearchParams();
  const [selected, setSelected] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const id = params.get("id");
    if (id) setSelected(Number(id));
  }, [params]);

  const { data: tickets } = useQuery({
    queryKey: ["upgrade-tickets"],
    queryFn: () => upgradeTicketsApi.list().then((r) => (r.data ?? []) as UpgradeTicket[]),
  });

  const { data: ticket } = useQuery({
    queryKey: ["upgrade-ticket", selected],
    queryFn: () => upgradeTicketsApi.show(selected!).then((r) => r.data as UpgradeTicket),
    enabled: !!selected,
    refetchInterval: 8000,
  });

  const reply = useMutation({
    mutationFn: ({ body, file }: { body: string; file: File | null }) => {
      const fd = new FormData();
      if (body) fd.append("body", body);
      if (file) fd.append("attachment", file);
      return upgradeTicketsApi.reply(selected!, fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["upgrade-ticket", selected] });
      qc.invalidateQueries({ queryKey: ["upgrade-tickets"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not send."),
  });

  const list = tickets ?? [];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" /> Upgrade requests
        </h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Request a plan upgrade and chat with our team.</p>
      </div>

      {selected && ticket ? (
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-outline-variant/15 pb-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setSelected(null)} className="text-on-surface-variant hover:text-on-surface">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <CardTitle className="text-sm flex-1 truncate">{ticket.subject}</CardTitle>
              <Badge className={STATUS_TONE[ticket.status]}>{ticket.status.replace("_", " ")}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[460px]">
              <TicketThread
                messages={ticket.messages ?? []}
                viewerIsAdmin={false}
                sending={reply.isPending}
                onSend={(body, file) => reply.mutate({ body, file })}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {creating || list.length === 0
            ? <NewRequest onCreated={(id) => { setCreating(false); setSelected(id); }} />
            : (
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-base">Your requests</CardTitle>
                  <Button size="sm" onClick={() => setCreating(true)} className="gap-1"><Plus className="w-4 h-4" /> New</Button>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {list.map((t) => (
                    <button key={t.id} onClick={() => setSelected(t.id)}
                      className="w-full text-left p-3 rounded-xl border border-outline-variant/20 hover:bg-surface-container transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-on-surface flex-1 truncate">{t.subject}</span>
                        <Badge className={STATUS_TONE[t.status]}>{t.status.replace("_", " ")}</Badge>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {t.last_message_at ? new Date(t.last_message_at).toLocaleString() : ""}
                      </p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
        </div>
      )}
    </div>
  );
}

export default function UpgradeRequestsPage() {
  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  );
}
