"use client";

import { useEffect, useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { npsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/use-toast";

const DONE_KEY = "eye_nps_done";

/**
 * NPS ("how likely to recommend", 0-10) — distinct from FeedbackModal's 1-4
 * CSAT (asked once right after signup). This is asked once, ~14 days into an
 * account with a connected domain, so it reflects real usage, not a first
 * impression. Also the intended source for honest testimonials going forward.
 */
export function NpsWidget() {
  const { token } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    try {
      if (localStorage.getItem(DONE_KEY)) return;
    } catch {}
    let cancelled = false;
    npsApi
      .eligibility()
      .then((r) => {
        const eligible = r.data?.eligible ?? r.data?.data?.eligible;
        if (!eligible) {
          try { localStorage.setItem(DONE_KEY, "1"); } catch {}
          return;
        }
        if (!cancelled) setTimeout(() => setOpen(true), 1500);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [token]);

  const dismiss = async () => {
    try { localStorage.setItem(DONE_KEY, "1"); } catch {}
    setOpen(false);
    try { await npsApi.dismiss(); } catch {}
  };

  const submit = async () => {
    if (score === null) { toast.error("Pick a score first."); return; }
    setSaving(true);
    try {
      await npsApi.submit(score, feedback.trim() || undefined);
      try { localStorage.setItem(DONE_KEY, "1"); } catch {}
      toast.success("Thanks for the feedback! 🙏");
      setOpen(false);
    } catch {
      toast.error("Couldn't send it. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={dismiss} />
      <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-2xl border border-outline-variant/20 p-6">
        <button onClick={dismiss} className="absolute top-4 ltr:right-4 rtl:left-4 p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high" aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-black text-on-surface pe-6">Quick question</h2>
        <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
          How likely are you to recommend EYE to a friend or colleague?
        </p>

        <div className="my-6">
          <div className="grid grid-cols-11 gap-1">
            {Array.from({ length: 11 }, (_, i) => i).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setScore(n)}
                className={cn(
                  "h-9 rounded-lg text-xs font-bold transition-colors border",
                  score === n
                    ? "bg-primary text-on-primary border-primary"
                    : "border-outline-variant/25 text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[11px] text-on-surface-variant mt-1.5">
            <span>Not likely</span>
            <span>Very likely</span>
          </div>
        </div>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          placeholder="What's the main reason for your score? (optional)"
          className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 resize-none focus:outline-none focus:border-primary/40"
        />

        <div className="flex items-center justify-between gap-3 mt-4">
          <button onClick={dismiss} className="text-sm text-on-surface-variant hover:text-on-surface">Maybe later</button>
          <button
            onClick={submit}
            disabled={saving || score === null}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
