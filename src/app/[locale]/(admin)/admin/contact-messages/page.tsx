"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contactApi, type ContactMessage } from "@/api/contact";
import { Mail, Phone, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminContactMessagesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-contact-messages"],
    queryFn: () => contactApi.adminList().then((r) => r.data),
  });

  const markRead = useMutation({
    mutationFn: (id: number) => contactApi.adminMarkRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-contact-messages"] }),
  });
  const remove = useMutation({
    mutationFn: (id: number) => contactApi.adminDelete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-contact-messages"] }),
  });

  const items: ContactMessage[] = data?.items ?? [];
  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Contact Messages</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Messages sent from the public contact form</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="rounded-2xl border border-outline-variant/20 p-5">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant">Total</p>
          <p className="text-3xl font-black text-on-surface mt-1">{stats?.total ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-outline-variant/20 p-5">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant">New</p>
          <p className="text-3xl font-black text-primary mt-1">{stats?.new ?? "—"}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant/20 divide-y divide-outline-variant/10">
        {isLoading && <div className="p-6 text-sm text-on-surface-variant">Loading…</div>}
        {!isLoading && items.length === 0 && (
          <div className="p-8 text-center text-sm text-on-surface-variant">No messages yet.</div>
        )}
        {items.map((m) => (
          <div key={m.id} className={cn("p-4", m.status === "new" && "bg-primary/[0.04]")}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-on-surface">{m.name}</span>
                  {m.status === "new" && (
                    <span className="rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase px-2 py-0.5">New</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-on-surface-variant mt-1 flex-wrap">
                  <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 hover:text-on-surface">
                    <Mail className="w-3.5 h-3.5" /> {m.email}
                  </a>
                  {m.phone && (
                    <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1 hover:text-on-surface">
                      <Phone className="w-3.5 h-3.5" /> {m.phone}
                    </a>
                  )}
                  <span>{new Date(m.created_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {m.status === "new" && (
                  <button
                    onClick={() => markRead.mutate(m.id)}
                    title="Mark read"
                    className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-emerald-500"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => { if (confirm("Delete this message?")) remove.mutate(m.id); }}
                  title="Delete"
                  className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-error"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm font-semibold text-on-surface">{m.subject}</p>
            <p className="mt-1 text-sm text-on-surface-variant whitespace-pre-wrap">{m.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
