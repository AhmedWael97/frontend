"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Gauge, ChevronLeft, ChevronRight, Info } from "lucide-react";

type DayRow = {
  date: string;
  score: number;
  visitors: number;
  sessions: number;
  avg_duration: number;
  avg_pages: number;
  avg_scroll: number;
  bounce_rate: number;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function scoreClasses(score: number): { bg: string; text: string; ring: string } {
  if (score >= 70) return { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/20" };
  if (score >= 40) return { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/20" };
  return { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", ring: "ring-rose-500/20" };
}

function fmtDur(secs: number): string {
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

export default function TrafficQualityPage() {
  const locale = useLocale();
  const ar = locale === "ar";
  const { selectedDomainId } = useAuthStore();

  const [mode, setMode] = useState<"month" | "year">("month");
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-11

  const { from, to } = useMemo(() => {
    if (mode === "month") {
      const start = `${year}-${pad(month + 1)}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const end = `${year}-${pad(month + 1)}-${pad(lastDay)}`;
      return { from: start, to: end };
    }
    return { from: `${year}-01-01`, to: `${year}-12-31` };
  }, [mode, year, month]);

  const { data, isLoading } = useQuery({
    queryKey: ["traffic-quality", selectedDomainId, from, to],
    queryFn: () =>
      analyticsApi.trafficQuality(selectedDomainId!, { from, to }).then((r) => r.data?.data ?? r.data),
    enabled: !!selectedDomainId,
  });

  const days: DayRow[] = data?.days ?? [];

  const monthNames = ar
    ? ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Year view: aggregate the fetched days into one card per month.
  const monthCards = useMemo(() => {
    if (mode !== "year") return [];
    const buckets: Record<number, DayRow[]> = {};
    for (const d of days) {
      const m = Number(d.date.split("-")[1]) - 1;
      (buckets[m] ??= []).push(d);
    }
    return Array.from({ length: 12 }, (_, m) => {
      const rows = buckets[m] ?? [];
      if (rows.length === 0) return { month: m, score: null as number | null, visitors: 0, days: 0 };
      const avgScore = Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length);
      const visitors = rows.reduce((s, r) => s + r.visitors, 0);
      return { month: m, score: avgScore, visitors, days: rows.length };
    });
  }, [days, mode]);

  const goPrev = () => {
    if (mode === "month") {
      if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1);
    } else {
      setYear((y) => y - 1);
    }
  };
  const goNext = () => {
    if (mode === "month") {
      if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1);
    } else {
      setYear((y) => y + 1);
    }
  };

  if (!selectedDomainId) {
    return <div className="p-6 text-on-surface-variant">{ar ? "اختر نطاقًا أولاً." : "Select a domain first."}</div>;
  }

  return (
    <TooltipProvider>
      <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-on-surface flex items-center gap-2">
              <Gauge className="w-6 h-6 text-primary" />
              {ar ? "جودة الزيارات" : "Traffic Quality"}
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              {ar
                ? "نقاط 0-100 لكل يوم: هل الزوار حقيقيون ومهتمون، أم مجرد نقرات إعلان بدون تفاعل؟"
                : "0-100 score per day: are visitors real and engaged, or just ad clicks with no follow-through?"}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-outline-variant/20 p-1">
            <Button size="sm" variant={mode === "month" ? "default" : "ghost"} onClick={() => setMode("month")}>
              {ar ? "شهر" : "Month"}
            </Button>
            <Button size="sm" variant={mode === "year" ? "default" : "ghost"} onClick={() => setMode("year")}>
              {ar ? "سنة" : "Year"}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button size="icon" variant="outline" onClick={goPrev} aria-label="prev">
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </Button>
          <span className="text-lg font-bold text-on-surface min-w-[160px] text-center">
            {mode === "month" ? `${monthNames[month]} ${year}` : year}
          </span>
          <Button size="icon" variant="outline" onClick={goNext} aria-label="next">
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-on-surface-variant">{ar ? "جارٍ التحميل..." : "Loading..."}</div>
        ) : mode === "month" ? (
          days.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">
              {ar ? "لا توجد بيانات لهذا الشهر." : "No data for this month."}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {days.map((d) => {
                const c = scoreClasses(d.score);
                const dateObj = new Date(d.date + "T00:00:00");
                const dayLabel = ar
                  ? dateObj.toLocaleDateString("ar-EG", { day: "numeric", month: "short" })
                  : dateObj.toLocaleDateString("en-US", { day: "numeric", month: "short" });
                return (
                  <Tooltip key={d.date}>
                    <TooltipTrigger asChild>
                      <div className={`rounded-xl border border-outline-variant/15 p-3 cursor-default ring-1 ${c.ring} ${c.bg}`}>
                        <p className="text-[11px] text-on-surface-variant mb-1">{dayLabel}</p>
                        <p className={`text-2xl font-black ${c.text}`}>{d.score}</p>
                        <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                          {d.visitors} {ar ? "زائر" : "visitors"}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs space-y-1">
                      <p>{ar ? "متوسط المدة" : "Avg duration"}: {fmtDur(d.avg_duration)}</p>
                      <p>{ar ? "صفحات/جلسة" : "Pages/session"}: {d.avg_pages}</p>
                      <p>{ar ? "أقصى تمرير" : "Max scroll"}: {d.avg_scroll}%</p>
                      <p>{ar ? "معدل الارتداد" : "Bounce rate"}: {d.bounce_rate}%</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {monthCards.map((mc) => {
              const c = mc.score === null ? { bg: "bg-surface-container", text: "text-on-surface-variant/50", ring: "ring-outline-variant/10" } : scoreClasses(mc.score);
              return (
                <div key={mc.month} className={`rounded-xl border border-outline-variant/15 p-4 ring-1 ${c.ring} ${c.bg}`}>
                  <p className="text-xs text-on-surface-variant mb-1">{monthNames[mc.month]}</p>
                  <p className={`text-3xl font-black ${c.text}`}>{mc.score ?? "—"}</p>
                  <p className="text-[11px] text-on-surface-variant/70 mt-1">
                    {mc.visitors} {ar ? "زائر" : "visitors"} · {mc.days} {ar ? "يوم بيانات" : "days of data"}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-start gap-2 text-xs text-on-surface-variant/70 rounded-lg bg-surface-container/30 p-3">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            {ar
              ? "النقاط = متوسط أربعة مقاييس (0-100 لكل منها): مدة الجلسة (120 ثانية = 100)، صفحات/جلسة (5 صفحات = 100)، أقصى تمرير للصفحة، و(100 - معدل الارتداد). لا ذكاء اصطناعي — صيغة ثابتة وواضحة."
              : "Score = average of four 0-100 metrics: session duration (120s = 100), pages/session (5 pages = 100), max scroll depth, and (100 − bounce rate). No AI — deterministic, explainable formula."}
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
