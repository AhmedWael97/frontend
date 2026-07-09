"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { supportApi, type SupportChat } from "@/api/support";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const POLL_MS = 4000;
const IDLE_POLL_MS = 45000;

/**
 * Live customer-service chat bubble (replaces the old AI assistant).
 * Messages go to a real person; a superadmin replies from the admin dashboard.
 * Polls while open so replies land without a refresh.
 */
export default function SupportChatBubble() {
  const locale = useLocale();
  const ar = locale === "ar";
  const { token } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState<SupportChat | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  const load = async (read = false) => {
    try {
      const r = await supportApi.myChat(read);
      setChat((r.data?.data ?? r.data) as SupportChat);
    } catch {
      /* keep the widget quiet on failure */
    }
  };

  // Fast poll while open so replies land live; a slow one while closed just to
  // keep the unread badge honest.
  useEffect(() => {
    if (!token) return;
    load(open);
    const t = setInterval(() => load(open), open ? POLL_MS : IDLE_POLL_MS);
    return () => clearInterval(t);
  }, [open, token]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages?.length]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    setBody("");
    try {
      const r = await supportApi.send(text);
      setChat((r.data?.data ?? r.data) as SupportChat);
    } catch {
      setBody(text); // give the message back so it isn't lost
    } finally {
      setSending(false);
    }
  };

  if (!token) return null;

  const messages = chat?.messages ?? [];

  return (
    <>
      {open && (
        <div className="fixed bottom-24 end-5 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-outline-variant/15 bg-surface-container px-4 py-3">
            <div>
              <p className="text-sm font-bold text-on-surface">{ar ? "الدعم الفني" : "Customer support"}</p>
              <p className="text-[11px] text-on-surface-variant">
                {ar ? "نرد عليك في أقرب وقت" : "We reply as soon as we can"}
              </p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <p className="mt-8 text-center text-sm text-on-surface-variant">
                {ar ? "اكتب رسالتك وسنعود إليك." : "Send us a message and we'll get back to you."}
              </p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={cn("flex", m.is_admin ? "justify-start" : "justify-end")}>
                <div
                  className={cn(
                    "max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm",
                    m.is_admin
                      ? "bg-surface-container text-on-surface"
                      : "bg-primary text-on-primary"
                  )}
                >
                  {m.body}
                </div>
              </div>
            ))}
            <div ref={bottom} />
          </div>

          <form onSubmit={submit} className="flex items-center gap-2 border-t border-outline-variant/15 p-3">
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={ar ? "اكتب رسالتك…" : "Type your message…"}
              maxLength={5000}
              className="h-10 flex-1 rounded-xl border border-outline-variant/30 bg-surface px-3 text-base sm:text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="submit"
              disabled={sending || !body.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rtl:rotate-180" />}
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={ar ? "الدعم الفني" : "Customer support"}
        className="fixed bottom-5 end-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-xl transition hover:scale-105"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        {!open && (chat?.unread_for_user ?? 0) > 0 && (
          <span className="absolute -top-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white">
            {chat!.unread_for_user}
          </span>
        )}
      </button>
    </>
  );
}
