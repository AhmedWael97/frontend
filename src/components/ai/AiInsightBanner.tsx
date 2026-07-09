"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Sparkles, Loader2, RefreshCw, AlertTriangle, CheckCircle2, Info, Flame } from "lucide-react";
import { aiApi } from "@/lib/api";
import { cn } from "@/lib/utils";

type Severity = "good" | "warning" | "critical" | "info";

interface Insight {
  verdict: string;
  severity: Severity;
  why: string[];
  actions: string[];
  confidence: "high" | "medium" | "low";
  cached?: boolean;
}

const SEVERITY: Record<Severity, { ring: string; text: string; Icon: typeof Info }> = {
  good: { ring: "border-emerald-500/30 bg-emerald-500/[0.06]", text: "text-emerald-600 dark:text-emerald-400", Icon: CheckCircle2 },
  warning: { ring: "border-amber-500/30 bg-amber-500/[0.06]", text: "text-amber-600 dark:text-amber-400", Icon: AlertTriangle },
  critical: { ring: "border-error/30 bg-error/[0.06]", text: "text-error", Icon: Flame },
  info: { ring: "border-outline-variant/25 bg-surface-container/40", text: "text-on-surface-variant", Icon: Info },
};

/**
 * Backend gate reasons come back as machine codes so we can phrase them here,
 * in the user's language, with the actual next step.
 */
function explain(raw: string | undefined, ar: boolean): string {
  const code = String(raw ?? "");

  if (code.startsWith("email_unverified")) {
    return ar
      ? "فعّل بريدك الإلكتروني أولًا حتى يحلل الذكاء الاصطناعي بياناتك."
      : "Verify your email first, then the AI can analyse your data.";
  }
  if (code.startsWith("not_enough_traffic")) {
    const seen = Number(code.split(":")[1] ?? 0);
    return ar
      ? `يحتاج الذكاء الاصطناعي 200 زيارة على الأقل ليعطي قرارًا موثوقًا. لديك ${seen} حتى الآن.`
      : `The AI needs at least 200 visits to give a reliable verdict. You have ${seen} so far.`;
  }
  if (code.includes("quota")) {
    return ar ? "الذكاء الاصطناعي مشغول الآن. حاول لاحقًا." : "AI is busy right now. Try again later.";
  }

  return code || (ar ? "تعذّر تحليل الصفحة الآن." : "Could not analyse this page right now.");
}

/**
 * "AI read this page for you" banner.
 *
 * Pass the metrics the page already fetched — the backend turns them into a
 * decision, the reasoning, and next steps. Click-to-run (one AI call, then
 * cached), so it costs nothing until the user asks.
 */
export default function AiInsightBanner({
  page,
  domainId,
  data,
  className,
}: {
  page: string;
  domainId: number | null | undefined;
  data: unknown;
  className?: string;
}) {
  const locale = useLocale();
  const ar = locale === "ar";
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gated, setGated] = useState(false);

  const hasData = data != null && (!Array.isArray(data) || data.length > 0);

  const run = async (refresh = false) => {
    if (!domainId || !hasData) return;
    setLoading(true);
    setError("");
    setGated(false);
    try {
      const r = await aiApi.pageInsight(domainId, { page, locale, data, refresh });
      setInsight((r.data?.data ?? r.data) as Insight);
    } catch (e: any) {
      const code = String(e?.message ?? "");
      setGated(code.startsWith("email_unverified") || code.startsWith("not_enough_traffic"));
      setError(explain(code, ar));
    } finally {
      setLoading(false);
    }
  };

  if (!domainId) return null;

  // Collapsed: a single invitation to let the AI read the page.
  if (!insight && !loading && !error) {
    return (
      <button
        onClick={() => run()}
        disabled={!hasData}
        className={cn(
          "group flex w-full items-center gap-3 rounded-2xl border border-primary/25 bg-primary/[0.04] px-4 py-3 text-start transition hover:bg-primary/[0.08] disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-on-surface">
            {ar ? "دع الذكاء الاصطناعي يقرأ هذه الصفحة" : "Let AI read this page for you"}
          </span>
          <span className="block text-xs text-on-surface-variant">
            {hasData
              ? ar ? "قرار واضح + السبب + ما تفعله الآن" : "A clear decision, why, and what to do next"
              : ar ? "لا توجد بيانات كافية بعد" : "Not enough data on this page yet"}
          </span>
        </span>
      </button>
    );
  }

  if (loading) {
    return (
      <div className={cn("flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary/[0.04] px-4 py-3", className)}>
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm text-on-surface-variant">
          {ar ? "الذكاء الاصطناعي يدرس بياناتك…" : "AI is studying your data…"}
        </span>
      </div>
    );
  }

  if (error) {
    // A gate (unverified email / too little traffic) is guidance, not a failure —
    // retrying changes nothing until the user acts.
    if (gated) {
      return (
        <div className={cn("flex items-start gap-3 rounded-2xl border border-outline-variant/25 bg-surface-container/40 px-4 py-3", className)}>
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-on-surface-variant" />
          <span className="text-sm text-on-surface-variant">{error}</span>
        </div>
      );
    }

    return (
      <div className={cn("flex items-center justify-between gap-3 rounded-2xl border border-error/25 bg-error/[0.06] px-4 py-3", className)}>
        <span className="text-sm text-error">{error}</span>
        <button onClick={() => run()} className="text-xs font-bold text-error hover:underline">
          {ar ? "إعادة المحاولة" : "Retry"}
        </button>
      </div>
    );
  }

  const s = SEVERITY[insight!.severity] ?? SEVERITY.info;
  const { Icon } = s;

  return (
    <div className={cn("rounded-2xl border p-4 sm:p-5", s.ring, className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface/70", s.text)}>
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {ar ? "قرار الذكاء الاصطناعي" : "AI verdict"}
            </p>
            <p className="text-base font-black leading-snug text-on-surface">{insight!.verdict}</p>
          </div>
        </div>
        <button
          onClick={() => run(true)}
          title={ar ? "تحديث" : "Re-analyse"}
          className="shrink-0 rounded-lg p-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {insight!.why.length > 0 && (
        <div className="mt-3 ps-11">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{ar ? "لماذا" : "Why"}</p>
          <ul className="mt-1 space-y-1">
            {insight!.why.map((w, i) => (
              <li key={i} className="text-sm text-on-surface-variant">{w}</li>
            ))}
          </ul>
        </div>
      )}

      {insight!.actions.length > 0 && (
        <div className="mt-3 ps-11">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{ar ? "افعل الآن" : "Do now"}</p>
          <ol className="mt-1 space-y-1">
            {insight!.actions.map((a, i) => (
              <li key={i} className="flex gap-2 text-sm text-on-surface">
                <span className="font-bold text-primary">{i + 1}.</span>
                <span>{a}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <p className="mt-3 ps-11 text-[11px] text-on-surface-variant/70">
        {ar ? "ثقة: " : "Confidence: "}{insight!.confidence}
        {insight!.cached && (ar ? " · محفوظ" : " · cached")}
      </p>
    </div>
  );
}
