"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  Users, Activity, Clock, TrendingDown, TrendingUp, Flame, Globe,
  Plus, AlertTriangle, Share2, BarChart2, Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { formatNumber } from "@/lib/utils";
import { toast } from "@/lib/use-toast";
import WelcomeChecklist from "@/components/WelcomeChecklist";

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  title, value, icon: Icon, trend, trendValue, hint, clickHref,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendValue?: string;
  hint?: string;
  clickHref?: string;
}) {
  const locale = useLocale();
  const inner = (
    <Card className={clickHref ? "cursor-pointer hover:ring-2 ring-primary/30 transition-all" : ""}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">{title}</p>
            <p className="text-3xl font-black text-on-surface tracking-tight">{value}</p>
            {trendValue && (
              <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend === "up" ? "text-green-700 dark:text-green-400" : "text-error"}`}>
                {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trendValue}
              </div>
            )}
            {hint && !trendValue && (
              <p className="text-xs text-on-surface-variant mt-1.5 leading-snug">{hint}</p>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 ml-3">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  if (clickHref) return <Link href={`/${locale}${clickHref}`}>{inner}</Link>;
  return inner;
}

// ── Dashboard Content ──────────────────────────────────────────────────────────
function DashboardContent() {
  const t = useTranslations("dashboard");
  const { selectedDomainId } = useAuthStore();
  const locale = useLocale();

  const { data, isLoading } = useQuery({
    queryKey: ["overview", selectedDomainId],
    queryFn: () => analyticsApi.overview(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
    refetchInterval: 60000,
  });

  // ── Milestone toast: celebrate first 100 visitors ────────────────────────
  useEffect(() => {
    if (!data?.visitors) return;
    const key = `eye_milestone_100_${selectedDomainId}`;
    const already = localStorage.getItem(key);
    if (!already && data.visitors >= 100) {
      toast.success(`You just hit ${formatNumber(data.visitors)} visitors! Your tracking is working perfectly.`);
      localStorage.setItem(key, "1");
    }
  }, [data?.visitors, selectedDomainId]);

  // ── No domain selected — guide user to add their site ────────────────────
  if (!selectedDomainId) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-5 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Globe className="w-8 h-8 text-primary" />
        </div>
        <div>
          <p className="text-lg font-bold text-on-surface">Connect your first website</p>
          <p className="text-sm text-on-surface-variant mt-1.5 max-w-xs mx-auto">
            Add your domain and paste one line of code to start seeing who visits your site — in real time.
          </p>
        </div>
        <Link href={`/${locale}/settings/domains`}>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add your website
          </Button>
        </Link>
      </div>
    );
  }

  const formatSeconds = (s: number) => {
    if (!s) return "0s";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const bounceRate = data?.bounce_rate || 0;
  const bounceHint = bounceRate > 70
    ? "High — most visitors leave after 1 page. Check your top landing pages."
    : bounceRate > 50
      ? "Average — some pages may need stronger calls-to-action."
      : "Healthy — visitors are exploring multiple pages.";

  const uxScore = data?.ux_score?.score as number | undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">{t("overview")}</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Last 30 days</p>
        </div>
        <Link href={`/${locale}/dashboard/shared-reports`}>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-3.5 h-3.5" />
            Share Report
          </Button>
        </Link>
      </div>

      {/* Site Health alert — only when score is poor */}
      {uxScore !== undefined && uxScore < 70 && (
        <div className="flex items-center gap-3 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-on-surface flex-1">
            Your <strong>Site Health score is {uxScore}/100</strong> — visitors may be running into problems on your site.
          </span>
          <Link href={`/${locale}/dashboard/ux`} className="text-xs text-primary font-semibold whitespace-nowrap">
            See what to fix →
          </Link>
        </div>
      )}

      {/* KPI cards — 5 cards: core 4 + Hot Leads */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title={t("visitors")}
          value={isLoading ? "…" : formatNumber(data?.visitors || 0)}
          icon={Users}
        />
        <KpiCard
          title={t("sessions")}
          value={isLoading ? "…" : formatNumber(data?.sessions || 0)}
          icon={Activity}
        />
        <KpiCard
          title={t("avgTime")}
          value={isLoading ? "…" : formatSeconds(data?.avg_session_duration || 0)}
          icon={Clock}
        />
        <KpiCard
          title="Bounce Rate"
          value={isLoading ? "…" : `${(bounceRate).toFixed(1)}%`}
          icon={TrendingDown}
          hint={bounceHint}
        />
        {/* Hot Leads — clickable shortcut to the Engaged Visitors feature */}
        <KpiCard
          title="Hot Leads"
          value={isLoading ? "…" : formatNumber(data?.engaged_count || 0)}
          icon={Flame}
          hint="Visitors most likely to convert"
          clickHref="/dashboard/engaged-visitors"
        />
      </div>

      {/* Onboarding checklist — shown until all steps complete or dismissed */}
      {selectedDomainId && (
        <WelcomeChecklist domainId={String(selectedDomainId)} />
      )}

      {/* Area chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Visitors & Sessions — 30 day trend</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-56 flex items-center justify-center text-on-surface-variant text-sm">Loading chart…</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.chart_data || []}>
                <defs>
                  <linearGradient id="visitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c0c1ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c0c1ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="sessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d0bcff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#d0bcff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#464554" strokeOpacity={0.3} />
                <XAxis dataKey="date" tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#171f33", border: "1px solid #464554", borderRadius: 8, color: "#dae2fd" }} />
                <Area type="monotone" dataKey="visitors" stroke="#c0c1ff" strokeWidth={2} fill="url(#visitors)" name="Visitors" />
                <Area type="monotone" dataKey="sessions" stroke="#d0bcff" strokeWidth={2} fill="url(#sessions)" name="Sessions" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top pages */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">{t("topPages")}</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <div className="text-on-surface-variant text-sm">Loading…</div> : (
              <div className="space-y-2">
                {(data?.top_pages || []).slice(0, 8).map((p: { url: string; views: number }) => (
                  <div key={p.url} className="flex items-center justify-between py-1.5 border-b border-outline-variant/10 last:border-0">
                    <span className="text-sm text-on-surface truncate max-w-[70%]">{p.url}</span>
                    <span className="text-xs font-semibold text-primary">{formatNumber(p.views)}</span>
                  </div>
                ))}
                {!(data?.top_pages?.length) && <p className="text-sm text-on-surface-variant">{t("noData")}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Devices */}
        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Devices</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <div className="text-on-surface-variant text-sm">Loading…</div> : (
              <div className="space-y-3">
                {[
                  { label: "Desktop", value: (data?.top_devices || []).find((d: any) => d.device === "desktop")?.count || 0, color: "bg-primary" },
                  { label: "Mobile", value: (data?.top_devices || []).find((d: any) => d.device === "mobile")?.count || 0, color: "bg-secondary" },
                  { label: "Tablet", value: (data?.top_devices || []).find((d: any) => d.device === "tablet")?.count || 0, color: "bg-tertiary" },
                ].map((d) => {
                  const total = (data?.top_devices || []).reduce((sum: number, x: any) => sum + (x.count || 0), 0);
                  const pct = total ? Math.round((d.value / total) * 100) : 0;
                  return (
                    <div key={d.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-on-surface-variant">{d.label}</span>
                        <span className="text-on-surface font-semibold">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div className={`h-full ${d.color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick-access shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/dashboard/ai",               icon: Sparkles,  label: "AI Insights",    desc: "Get growth ideas" },
          { href: "/dashboard/heatmaps",          icon: Flame,     label: "Click Maps",     desc: "See where people click" },
          { href: "/dashboard/engaged-visitors",  icon: Users,     label: "Hot Leads",      desc: "Your best visitors" },
          { href: "/dashboard/ux",                icon: BarChart2, label: "Site Health",    desc: "Find broken experiences" },
        ].map((s) => (
          <Link key={s.href} href={`/${locale}${s.href}`}>
            <Card className="hover:ring-2 ring-primary/20 transition-all cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col gap-1.5">
                <s.icon className="w-5 h-5 text-primary" />
                <p className="text-sm font-bold text-on-surface">{s.label}</p>
                <p className="text-xs text-on-surface-variant">{s.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
