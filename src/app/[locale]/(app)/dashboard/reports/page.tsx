"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Sparkles, Share2, Download, Link2, SearchCheck,
  FileText, Clock, ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { aiApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { formatDistanceToNow } from "date-fns";

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({
  href, icon: Icon, label, desc, color = "text-primary", badge,
}: {
  href: string; icon: React.ElementType; label: string; desc: string;
  color?: string; badge?: string;
}) {
  const locale = useLocale();
  const bgClass =
    color.includes("violet")  ? "bg-violet-400/10" :
    color.includes("sky")     ? "bg-sky-400/10" :
    color.includes("emerald") ? "bg-emerald-400/10" :
    color.includes("orange")  ? "bg-orange-400/10" :
    color.includes("teal")    ? "bg-teal-400/10" :
    "bg-primary/10";

  return (
    <Link href={`/${locale}${href}`}>
      <div className="group relative flex flex-col gap-2 p-4 rounded-xl border border-outline-variant/20 bg-surface-container/30 hover:bg-surface-container/60 hover:border-violet-400/20 hover:shadow-md transition-all cursor-pointer h-full">
        {badge && (
          <span className="absolute top-3 ltr:right-3 rtl:left-3 text-[9px] font-black uppercase tracking-widest bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
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
  const th = useTranslations("hubs.reports");
  const { selectedDomainId } = useAuthStore();

  // Load recent AI reports for summary
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ["ai-reports", selectedDomainId],
    queryFn: () => aiApi.reports(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const reports: { id: number; type: string; status: string; created_at: string }[] =
    Array.isArray(reportsData?.reports) ? reportsData.reports :
    Array.isArray(reportsData)          ? reportsData : [];

  const FEATURES = [
    { href: "/dashboard/ai",             icon: Sparkles,    label: th("ai" as never)          || "AI Insights",       desc: th("aiDesc" as never)          || "AI-generated analysis reports",                color: "text-primary",    badge: "AI" },
    { href: "/dashboard/shared-reports", icon: Share2,      label: th("sharedReports" as never)|| "Share Reports",    desc: th("sharedDesc" as never)      || "Shareable links for stakeholders",              color: "text-sky-400"    },
    { href: "/dashboard/exports",        icon: Download,    label: th("exports" as never)     || "Export Data",       desc: th("exportsDesc" as never)     || "Download raw data as CSV",                      color: "text-emerald-400"},
    { href: "/tools/utm-builder",        icon: Link2,       label: th("utmBuilder" as never)  || "UTM Link Builder",  desc: th("utmDesc" as never)         || "Build UTM campaign tracking links",             color: "text-orange-400" },
    { href: "/tools/seo-checker",        icon: SearchCheck, label: th("seoChecker" as never)  || "SEO Checker",       desc: th("seoDesc" as never)         || "Audit any page or crawl your full site",        color: "text-teal-400"   },
  ];

  const STATUS_COLOR: Record<string, string> = {
    completed: "bg-emerald-400/15 text-emerald-400",
    pending:   "bg-yellow-400/15 text-yellow-400",
    failed:    "bg-rose-400/15 text-rose-400",
  };

  return (
    <div className="space-y-6">
      {/* Hub header */}
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-violet-400" />
          {th("title" as never) || "Reports & Tools"}
        </h1>
        <p className="text-on-surface-variant text-sm mt-0.5">
          {th("description" as never) || "Generate insights, share data with your team, and optimise your content."}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-black text-on-surface">{isLoading ? "…" : reports.length}</p>
              <p className="text-xs text-on-surface-variant">{th("totalReports" as never)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-400/10">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-black text-on-surface">
                {isLoading ? "…" : reports.filter((r) => r.status === "completed").length}
              </p>
              <p className="text-xs text-on-surface-variant">{th("completedReports" as never)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-400/10">
              <Share2 className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <p className="text-xl font-black text-on-surface">—</p>
              <p className="text-xs text-on-surface-variant">{th("sharedLinks" as never)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-400/10">
              <Download className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xl font-black text-on-surface">—</p>
              <p className="text-xs text-on-surface-variant">{th("exportJobs" as never)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature cards grid */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-3">
          {th("features" as never) || "Quick Access"}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.href} {...f} />
          ))}
        </div>
      </div>

      {/* Recent AI reports */}
      {reports.length > 0 && (
        <Card>
          <CardHeader className="border-b border-outline-variant/20 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {th("recentReports" as never)}
              </CardTitle>
              <Link href={`/${locale}/dashboard/ai`} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <div>
            {reports.slice(0, 5).map((report) => (
              <div key={report.id} className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant/10 last:border-0">
                <FileText className="w-4 h-4 text-on-surface-variant shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface capitalize">
                    {report.type.replace(/_/g, " ")} Report
                  </p>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                  </p>
                </div>
                <Badge className={`text-[10px] font-bold ${STATUS_COLOR[report.status] ?? STATUS_COLOR.pending}`}>
                  {report.status === "completed" ? th("statusCompleted" as never) :
                   report.status === "failed"    ? th("statusFailed" as never) :
                   th("statusPending" as never)}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return <Content />;
}
