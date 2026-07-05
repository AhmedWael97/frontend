"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { toast } from "@/lib/use-toast";
import { Loader2, Send, Eye, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const AUDIENCES = [
  { key: "all", label: "All users" },
  { key: "no_domain", label: "No domain added" },
  { key: "has_domain", label: "Has a domain" },
] as const;

export default function AdminEmailPage() {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("<p>Hi there,</p>\n<p>...</p>");
  const [audience, setAudience] = useState("all");
  const [testEmail, setTestEmail] = useState("");
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState<"test" | "campaign" | null>(null);

  const { data: aud } = useQuery({
    queryKey: ["admin-email-audiences"],
    queryFn: () => adminApi.emailAudiences().then((r) => r.data as Record<string, number>),
  });

  const doSend = async (test: boolean) => {
    if (!subject.trim() || !html.trim()) { toast.error("Subject and body required."); return; }
    if (test && !testEmail.trim()) { toast.error("Enter a test email."); return; }
    if (!test && !confirm(`Send this campaign to ${aud?.[audience] ?? "?"} users? This cannot be undone.`)) return;
    setSending(test ? "test" : "campaign");
    try {
      const r = await adminApi.emailSend({ subject, html, audience, test_email: test ? testEmail : undefined });
      toast.success(r.data?.message || "Sent.");
    } catch (e: any) {
      toast.error(e?.message || "Send failed.");
    } finally { setSending(null); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2"><Mail className="w-6 h-6 text-primary" /> Email Campaign</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Send a branded HTML email to a segment. Queued + throttled; unsubscribe footer added automatically.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface" placeholder="A quick update from EYE" />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">HTML body</label>
            <button onClick={() => setPreview((v) => !v)} className="text-xs text-primary font-semibold inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {preview ? "Edit" : "Preview"}</button>
          </div>
          {preview ? (
            <div className="mt-1 border border-outline-variant/20 rounded-lg bg-white overflow-hidden">
              <iframe title="preview" srcDoc={html} className="w-full h-72 bg-white" />
            </div>
          ) : (
            <textarea value={html} onChange={(e) => setHtml(e.target.value)} rows={12} className="mt-1 w-full bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface font-mono" />
          )}
          <p className="text-[11px] text-on-surface-variant mt-1">Plain HTML (headings, paragraphs, links). It's wrapped in the EYE branded frame with header, footer, and unsubscribe link.</p>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Audience</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {AUDIENCES.map((a) => (
              <button key={a.key} onClick={() => setAudience(a.key)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium", audience === a.key ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:text-on-surface")}>
                {a.label} {aud ? <span className="opacity-70">({aud[a.key] ?? 0})</span> : null}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant/15 p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Test first (recommended)</p>
          <div className="flex flex-wrap gap-2">
            <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="you@example.com" className="flex-1 min-w-[200px] bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface" />
            <button onClick={() => doSend(true)} disabled={sending !== null} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-high text-on-surface text-sm font-semibold disabled:opacity-60">
              {sending === "test" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send test
            </button>
          </div>
        </div>

        <button onClick={() => doSend(false)} disabled={sending !== null} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-on-primary px-4 py-3 text-sm font-bold disabled:opacity-60">
          {sending === "campaign" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send campaign to {aud?.[audience] ?? "…"} users
        </button>
      </div>
    </div>
  );
}
