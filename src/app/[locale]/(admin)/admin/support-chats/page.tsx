"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supportApi, type SupportChat, type SupportMessage } from "@/api/support";
import { Send, Loader2, CheckCircle2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const POLL_MS = 4000;

export default function AdminSupportChatsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  const { data: list } = useQuery({
    queryKey: ["admin-support-chats", status],
    queryFn: () => supportApi.adminList(status || undefined).then((r) => r.data?.data ?? r.data),
    refetchInterval: POLL_MS,
  });

  const { data: thread } = useQuery({
    queryKey: ["admin-support-chat", activeId],
    queryFn: () => supportApi.adminShow(activeId!).then((r) => r.data?.data ?? r.data),
    enabled: !!activeId,
    refetchInterval: POLL_MS,
  });

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages?.length]);

  const items: SupportChat[] = list?.items ?? [];
  const stats = list?.stats;

  const reply = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text || !activeId || sending) return;
    setSending(true);
    setBody("");
    try {
      await supportApi.adminReply(activeId, text);
      qc.invalidateQueries({ queryKey: ["admin-support-chat", activeId] });
      qc.invalidateQueries({ queryKey: ["admin-support-chats"] });
    } catch {
      setBody(text);
    } finally {
      setSending(false);
    }
  };

  const close = async () => {
    if (!activeId || !confirm("Close this chat?")) return;
    await supportApi.adminClose(activeId);
    qc.invalidateQueries({ queryKey: ["admin-support-chats"] });
    qc.invalidateQueries({ queryKey: ["admin-support-chat", activeId] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Support Chats</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            Live conversations with your users · {stats?.open ?? 0} open, {stats?.unread ?? 0} unread
          </p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-lg border border-outline-variant/40 bg-surface px-2 text-sm text-on-surface"
        >
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Thread list */}
        <div className="rounded-2xl border border-outline-variant/20 divide-y divide-outline-variant/10 overflow-hidden max-h-[32rem] overflow-y-auto">
          {items.length === 0 && (
            <div className="p-8 text-center text-sm text-on-surface-variant">No chats yet.</div>
          )}
          {items.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "flex w-full items-start gap-3 p-3 text-start transition hover:bg-surface-container",
                activeId === c.id && "bg-surface-container"
              )}
            >
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-on-surface-variant" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-on-surface">{c.user_name || c.user_email}</span>
                  {c.is_guest && (
                    <span className="rounded-full bg-surface-container-high px-1.5 py-0.5 text-[10px] font-semibold text-on-surface-variant">
                      guest
                    </span>
                  )}
                  {(c.unread_for_admin ?? 0) > 0 && (
                    <span className="rounded-full bg-error px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {c.unread_for_admin}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-on-surface-variant">{c.user_email}</p>
                <p className="text-[11px] text-on-surface-variant/70">
                  {c.status} · {c.last_message_at ? new Date(c.last_message_at).toLocaleString() : "—"}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Active thread */}
        <div className="lg:col-span-2 flex h-[32rem] flex-col rounded-2xl border border-outline-variant/20 overflow-hidden">
          {!activeId ? (
            <div className="flex flex-1 items-center justify-center text-sm text-on-surface-variant">
              Select a chat to reply.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-outline-variant/15 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-on-surface">{thread?.user_name || thread?.user_email}</p>
                  <p className="truncate text-xs text-on-surface-variant">{thread?.user_email}</p>
                </div>
                <button onClick={close} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-surface-container hover:text-emerald-500">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Close
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
                {((thread?.messages ?? []) as SupportMessage[]).map((m) => (
                  <div key={m.id} className={cn("flex", m.is_admin ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[75%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm",
                        m.is_admin ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface"
                      )}
                    >
                      {m.body}
                      <span className="mt-1 block text-[10px] opacity-60">
                        {new Date(m.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={bottom} />
              </div>

              <form onSubmit={reply} className="flex items-center gap-2 border-t border-outline-variant/15 p-3">
                <input
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type your reply…"
                  maxLength={5000}
                  className="h-10 flex-1 rounded-xl border border-outline-variant/30 bg-surface px-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="submit"
                  disabled={sending || !body.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary disabled:opacity-50"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
