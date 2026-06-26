"use client";

import { useRef, useState } from "react";
import { Paperclip, Send, Loader2, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TicketMessage } from "@/api/upgradeTickets";

function isImage(mime?: string | null) {
  return !!mime && mime.startsWith("image/");
}

/**
 * Shared chat thread for upgrade tickets. `viewerIsAdmin` controls which side
 * "my" bubbles appear on. `onSend` receives the body text and optional file.
 */
export function TicketThread({
  messages,
  viewerIsAdmin,
  onSend,
  sending,
  disabled,
}: {
  messages: TicketMessage[];
  viewerIsAdmin: boolean;
  onSend: (body: string, file: File | null) => void;
  sending: boolean;
  disabled?: boolean;
}) {
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!body.trim() && !file) return;
    onSend(body.trim(), file);
    setBody("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-on-surface-variant py-8">No messages yet.</p>
        )}
        {messages.map((m) => {
          if (m.is_system) {
            return (
              <div key={m.id} className="text-center">
                <span className="inline-block text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-full px-3 py-1">
                  {m.body}
                </span>
              </div>
            );
          }
          const mine = m.is_admin === viewerIsAdmin;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                mine ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface"
              }`}>
                {!mine && m.sender?.name && (
                  <p className="text-[11px] font-semibold opacity-70 mb-0.5">{m.sender.name}</p>
                )}
                {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                {m.attachment_url && (
                  <a href={m.attachment_url} target="_blank" rel="noopener noreferrer"
                    className={`mt-1.5 block rounded-lg overflow-hidden ${mine ? "" : "border border-outline-variant/20"}`}>
                    {isImage(m.attachment_mime) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.attachment_url} alt={m.attachment_name ?? "attachment"} className="max-h-48 rounded-lg" />
                    ) : (
                      <span className="flex items-center gap-1.5 px-2 py-1.5 text-xs underline">
                        <FileText className="w-3.5 h-3.5" /> {m.attachment_name ?? "Download attachment"}
                      </span>
                    )}
                  </a>
                )}
                <p className={`text-[10px] mt-1 ${mine ? "opacity-70" : "text-on-surface-variant"}`}>
                  {new Date(m.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {!disabled && (
        <div className="border-t border-outline-variant/15 p-3 space-y-2">
          {file && (
            <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container rounded-lg px-2 py-1.5">
              <Paperclip className="w-3.5 h-3.5" />
              <span className="flex-1 truncate">{file.name}</span>
              <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}>
                <X className="w-3.5 h-3.5 hover:text-rose-400" />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container shrink-0"
              aria-label="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
              placeholder="Type a message…"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-outline-variant/40 bg-surface px-3 py-2 text-sm text-on-surface max-h-32"
            />
            <Button onClick={submit} disabled={sending || (!body.trim() && !file)} className="shrink-0 h-10 w-10 p-0">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
