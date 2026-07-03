"use client";

import { useEffect, useState } from "react";
import { Star, X, Send, Loader2 } from "lucide-react";
import { feedbackApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/use-toast";

const LABELS: Record<number, string> = { 1: "Bad", 2: "Weak", 3: "Good", 4: "Excellent" };
const DONE_KEY = "eye_feedback_done";

export function FeedbackModal() {
  const { user, token } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  // Decide whether to show — once per user. localStorage is the fast guard;
  // the backend status is the cross-device source of truth.
  useEffect(() => {
    if (!token) return;
    try {
      if (localStorage.getItem(DONE_KEY)) return;
    } catch {}
    let cancelled = false;
    feedbackApi
      .status()
      .then((r) => {
        const submitted = r.data?.submitted ?? r.data?.data?.submitted;
        if (submitted) {
          try { localStorage.setItem(DONE_KEY, "1"); } catch {}
          return;
        }
        if (!cancelled) setTimeout(() => setOpen(true), 1500);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [token]);

  const dismiss = () => {
    try { localStorage.setItem(DONE_KEY, "1"); } catch {}
    setOpen(false);
  };

  const submit = async () => {
    if (rating < 1) { toast.error("Pick a star rating first."); return; }
    setSaving(true);
    try {
      await feedbackApi.submit(rating, comment.trim() || undefined);
      try { localStorage.setItem(DONE_KEY, "1"); } catch {}
      toast.success("Thanks for the feedback! 🙏");
      setOpen(false);
    } catch {
      toast.error("Couldn't send feedback. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  const shown = hover || rating;
  const firstName = (user?.name || "").split(" ")[0] || "there";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={dismiss} />
      <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-2xl border border-outline-variant/20 p-6">
        <button onClick={dismiss} className="absolute top-4 ltr:right-4 rtl:left-4 p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high" aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-black text-on-surface pe-6">Hi {firstName} 👋</h2>
        <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
          Thanks for checking out EYE-Analysis! We're constantly improving, and the best way is by listening to people actually using it. How has your experience been so far?
        </p>

        {/* Stars */}
        <div className="flex flex-col items-center gap-2 my-6">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(s)}
                className="p-1 transition-transform hover:scale-110"
                aria-label={LABELS[s]}
              >
                <Star className={cn("w-9 h-9 transition-colors", s <= shown ? "fill-amber-400 text-amber-400" : "text-outline-variant")} />
              </button>
            ))}
          </div>
          <p className={cn("text-sm font-bold h-5", shown ? "text-amber-400" : "text-transparent")}>
            {LABELS[shown] || "."}
          </p>
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="What was your first impression? Anything missing, confusing, or buggy? Type whatever comes to mind — I read every response."
          className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 resize-none focus:outline-none focus:border-primary/40"
        />

        <div className="flex items-center justify-between gap-3 mt-4">
          <button onClick={dismiss} className="text-sm text-on-surface-variant hover:text-on-surface">Maybe later</button>
          <button
            onClick={submit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send feedback
          </button>
        </div>
      </div>
    </div>
  );
}
