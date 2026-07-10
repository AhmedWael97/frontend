"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { Lightbulb, AlertTriangle, Flame, TrendingUp, Info, ChevronRight } from "lucide-react";
import { analyticsApi } from "@/lib/api";
import { cn } from "@/lib/utils";

type Severity = "good" | "warning" | "critical" | "info";

interface Finding {
  kind: string;
  severity: Severity;
  title: string;
  detail: string;
  action: string;
}

const SEV: Record<Severity, { dot: string; Icon: typeof Info }> = {
  critical: { dot: "text-error", Icon: Flame },
  warning: { dot: "text-amber-500", Icon: AlertTriangle },
  good: { dot: "text-emerald-500", Icon: TrendingUp },
  info: { dot: "text-on-surface-variant", Icon: Info },
};

/**
 * Deterministic insight panel — statistics-based findings, no AI, no button.
 * It's free and instant, so it just loads. Distinct from the AI banner (which is
 * click-to-run and phrases a single verdict).
 */
export default function InsightPanel({
  domainId,
  page = "overview",
  className,
}: {
  domainId: number | null | undefined;
  page?: string;
  className?: string;
}) {
  const ar = useLocale() === "ar";

  const { data, isLoading } = useQuery({
    queryKey: ["insights", domainId, page],
    queryFn: () => analyticsApi.insights(domainId!, page).then((r) => r.data?.data ?? r.data),
    enabled: !!domainId,
    staleTime: 10 * 60 * 1000,
  });

  if (!domainId) return null;

  const findings: Finding[] = data?.findings ?? [];

  if (isLoading) {
    return (
      <div className={cn("rounded-2xl border border-outline-variant/20 p-4", className)}>
        <div className="h-4 w-40 animate-pulse rounded bg-surface-container-high" />
      </div>
    );
  }

  if (findings.length === 0) {
    return (
      <div className={cn("flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-3", className)}>
        <TrendingUp className="h-4 w-4 text-emerald-500" />
        <span className="text-sm text-on-surface">
          {ar ? "لا مشاكل واضحة الآن — الأرقام ضمن المعدل الطبيعي." : "Nothing urgent — your numbers are within their normal range."}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-outline-variant/20 overflow-hidden", className)}>
      <div className="flex items-center gap-2 border-b border-outline-variant/15 bg-surface-container/40 px-4 py-2.5">
        <Lightbulb className="h-4 w-4 text-primary" />
        <span className="text-sm font-bold text-on-surface">
          {ar ? "ماذا تفعل الآن" : "What to do now"}
        </span>
        <span className="text-xs text-on-surface-variant">
          {ar ? `${findings.length} توصية` : `${findings.length} finding${findings.length > 1 ? "s" : ""}`}
        </span>
      </div>

      <div className="divide-y divide-outline-variant/10">
        {findings.map((f, i) => {
          const s = SEV[f.severity] ?? SEV.info;
          const { Icon } = s;
          return (
            <div key={i} className="flex gap-3 p-4">
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", s.dot)} />
              <div className="min-w-0">
                <p className="text-sm font-bold text-on-surface">{f.title}</p>
                <p className="mt-0.5 text-sm text-on-surface-variant">{f.detail}</p>
                <p className="mt-1.5 flex items-start gap-1 text-sm font-semibold text-primary">
                  <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 rtl:rotate-180" />
                  <span>{f.action}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
