"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Zap, Flame, PlaySquare, Gauge, ArrowDownToLine,
  Bug, Lightbulb, CheckCircle, AlertTriangle, XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uxApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({
  href, icon: Icon, label, desc, color = "text-primary",
}: {
  href: string; icon: React.ElementType; label: string; desc: string; color?: string;
}) {
  const locale = useLocale();
  const bgClass = color.includes("sky") ? "bg-sky-400/10" :
    color.includes("rose") ? "bg-rose-400/10" :
    color.includes("violet") ? "bg-violet-400/10" :
    color.includes("yellow") ? "bg-yellow-400/10" :
    color.includes("amber") ? "bg-amber-400/10" :
    color.includes("teal") ? "bg-teal-400/10" :
    color.includes("emerald") ? "bg-emerald-400/10" :
    color.includes("blue") ? "bg-blue-400/10" :
    color.includes("orange") ? "bg-orange-400/10" :
    "bg-primary/10";

  return (
    <Link href={`/${locale}${href}`}>
      <div className="group flex flex-col gap-2 p-4 rounded-xl border border-outline-variant/20 bg-surface-container/30 hover:bg-surface-container/60 hover:border-sky-400/20 hover:shadow-md transition-all cursor-pointer h-full">
        <div className={`w-8 h-8 rounded-lg ${bgClass} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <p className="text-sm font-bold text-on-surface leading-tight">{label}</p>
        <p className="text-[11px] text-on-surface-variant leading-snug">{desc}</p>
      </div>
    </Link>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
function Content() {
  const th = useTranslations("hubs.intelligence");
  const { selectedDomainId } = useAuthStore();

  // Load UX scores for the summary card
  const { data: uxData, isLoading } = useQuery({
    queryKey: ["ux-scores", selectedDomainId],
    queryFn: () => uxApi.scores(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const score = uxData?.score as number | undefined;
  const rating: "good" | "needs-improvement" | "poor" =
    score === undefined ? "poor" :
    score >= 80 ? "good" :
    score >= 60 ? "needs-improvement" : "poor";

  const SCORE_COLOR = { good: "text-emerald-400", "needs-improvement": "text-yellow-400", poor: "text-rose-400" };
  const SCORE_ICON  = { good: CheckCircle, "needs-improvement": AlertTriangle, poor: XCircle };
  const ScoreIcon   = SCORE_ICON[rating];

  const FEATURES = [
    { href: "/dashboard/ux",           icon: Zap,             label: th("ux" as never)          || "Site Health",      desc: th("uxDesc" as never)          || "Site health score & issue list",            color: "text-sky-400"    },
    { href: "/dashboard/heatmaps",     icon: Flame,           label: th("heatmaps" as never)    || "Click Maps",       desc: th("heatmapsDesc" as never)    || "Where visitors click on each page",          color: "text-rose-400"   },
    { href: "/dashboard/replay",       icon: PlaySquare,      label: th("replay" as never)      || "Watch Sessions",   desc: th("replayDesc" as never)      || "Watch real visitor sessions",                color: "text-violet-400" },
    { href: "/dashboard/performance",  icon: Gauge,           label: th("performance" as never) || "Performance",      desc: th("performanceDesc" as never) || "Page load times & slow assets",              color: "text-primary"    },
    { href: "/dashboard/scroll-depth", icon: ArrowDownToLine, label: th("scrollDepth" as never) || "Content Reach",    desc: th("scrollDesc" as never)      || "How far down visitors read",                 color: "text-teal-400"   },
    { href: "/dashboard/web-vitals",   icon: Gauge,           label: th("webVitals" as never)   || "Page Speed",       desc: th("vitalsDesc" as never)      || "Core Web Vitals (LCP, CLS, INP)",            color: "text-yellow-400" },
    { href: "/dashboard/errors",       icon: Bug,             label: th("jsErrors" as never)    || "Broken Pages",     desc: th("errorsDesc" as never)      || "JavaScript errors & crashes",                color: "text-amber-400"  },
    { href: "/dashboard/owner-brief",  icon: Lightbulb,       label: th("ownerBrief" as never)  || "Daily Brief",      desc: th("briefDesc" as never)       || "Your daily AI-written summary",              color: "text-orange-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Hub header */}
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
          <Zap className="w-6 h-6 text-sky-400" />
          {th("title" as never) || "Intelligence"}
        </h1>
        <p className="text-on-surface-variant text-sm mt-0.5">
          {th("description" as never) || "Understand how visitors experience your site and where they get stuck."}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Site health score */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${rating === "good" ? "bg-emerald-400/10" : rating === "needs-improvement" ? "bg-yellow-400/10" : "bg-rose-400/10"}`}>
              <ScoreIcon className={`w-5 h-5 ${SCORE_COLOR[rating]}`} />
            </div>
            <div>
              <p className={`text-xl font-black ${isLoading ? "text-on-surface-variant" : SCORE_COLOR[rating]}`}>
                {isLoading ? "…" : score !== undefined ? `${score}/100` : "N/A"}
              </p>
              <p className="text-xs text-on-surface-variant">Site Health</p>
            </div>
          </CardContent>
        </Card>

        {/* Issues found */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-400/10">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xl font-black text-on-surface">
                {isLoading ? "…" : (uxData?.issues?.length ?? 0)}
              </p>
              <p className="text-xs text-on-surface-variant">Active Issues</p>
            </div>
          </CardContent>
        </Card>

        {/* Heatmap pages */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-400/10">
              <Flame className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-xl font-black text-on-surface">
                {isLoading ? "…" : (uxData?.heatmap_pages ?? "—")}
              </p>
              <p className="text-xs text-on-surface-variant">Heatmap Pages</p>
            </div>
          </CardContent>
        </Card>

        {/* Replays */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-400/10">
              <PlaySquare className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-xl font-black text-on-surface">
                {isLoading ? "…" : (uxData?.replay_sessions ?? "—")}
              </p>
              <p className="text-xs text-on-surface-variant">Session Replays</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature cards grid */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-3">
          {th("features" as never) || "Quick Access"}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.href} {...f} />
          ))}
        </div>
      </div>

      {/* Issues list — if any */}
      {!isLoading && uxData?.issues?.length > 0 && (
        <Card>
          <CardHeader className="border-b border-outline-variant/20 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Current Site Issues
            </CardTitle>
          </CardHeader>
          <div>
            {uxData.issues.slice(0, 6).map((issue: { type: string; count: number; severity: string }, i: number) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/10 last:border-0">
                <span className="text-sm text-on-surface capitalize">{issue.type.replace(/_/g, " ")}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    issue.severity === "high" ? "bg-rose-400/15 text-rose-400" :
                    issue.severity === "medium" ? "bg-yellow-400/15 text-yellow-400" :
                    "bg-emerald-400/15 text-emerald-400"
                  }`}>{issue.severity}</span>
                  <span className="text-sm font-black text-on-surface">{issue.count}×</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function IntelligencePage() {
  return <Content />;
}
