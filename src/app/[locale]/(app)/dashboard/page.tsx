"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  Users, Activity, Clock, TrendingDown, TrendingUp, Flame, Globe,
  Plus, AlertTriangle, Share2, BarChart3, Radio, GitMerge, Code2,
  UserCheck, Building2, Star, Megaphone, Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analyticsApi, domainsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { formatNumber } from "@/lib/utils";
import { toast } from "@/lib/use-toast";
import WelcomeChecklist from "@/components/WelcomeChecklist";
import NotInstalledPanel from "@/components/dashboard/NotInstalledPanel";
import { UsageUpgradeBanner } from "@/components/UsageUpgradeBanner";
import InsightPanel from "@/components/ai/InsightPanel";

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({
  href, icon: Icon, label, desc, color = "text-primary",
}: {
  href: string; icon: React.ElementType; label: string; desc: string; color?: string;
}) {
  const locale = useLocale();
  return (
    <Link href={`/${locale}${href}`}>
      <div className="group flex flex-col gap-2 p-4 rounded-xl border border-outline-variant/20 bg-surface-container/30 hover:bg-surface-container/60 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer h-full">
        <div className={`w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center group-hover:scale-110 transition-transform ${color.replace("text-", "bg-").replace("400", "400/15").replace("primary", "primary/10")}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <p className="text-sm font-bold text-on-surface leading-tight">{label}</p>
        <p className="text-[11px] text-on-surface-variant leading-snug">{desc}</p>
      </div>
    </Link>
  );
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  title, value, icon: Icon, trend, trendValue, hint, clickHref,
}: {
  title: string; value: string; icon: React.ElementType;
  trend?: "up" | "down"; trendValue?: string; hint?: string; clickHref?: string;
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
            {hint && !trendValue && <p className="text-xs text-on-surface-variant mt-1.5 leading-snug">{hint}</p>}
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 ltr:ml-3 rtl:mr-3">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  if (clickHref) return <Link href={`/${locale}${clickHref}`}>{inner}</Link>;
  return inner;
}

type DomainRow = { id: number; domain: string; script_token: string; script_verified: boolean };

// ── Analytics Hub Content ─────────────────────────────────────────────────────
function AnalyticsHub() {
  const t  = useTranslations("dashboard");
  const th = useTranslations("hubs.analytics");
  const { selectedDomainId, setSelectedDomainId } = useAuthStore();
  const locale = useLocale();
  const [enteringSandbox, setEnteringSandbox] = useState(false);

  const enterSandbox = async () => {
    setEnteringSandbox(true);
    try {
      const r = await domainsApi.demo();
      const demo = (r.data?.data ?? r.data) as { id: number };
      setSelectedDomainId(demo.id);
    } catch {
      toast.error("Couldn't load the demo sandbox — try again in a moment.");
    } finally {
      setEnteringSandbox(false);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["overview", selectedDomainId],
    queryFn: () => analyticsApi.overview(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
    refetchInterval: 60000,
  });

  const { data: domainList } = useQuery({
    queryKey: ["domains"],
    queryFn: () => domainsApi.list().then((r) => (r.data?.data ?? r.data) as DomainRow[]),
  });

  // Zeros are not data. A domain that has never reported a visitor and has no
  // verified script has not been installed, and showing 0% bounce for it reads
  // as a broken product instead of an unfinished setup. Wait for the overview
  // to load before judging, so a slow request never flashes the panel at a
  // site that is in fact live.
  const currentDomain = domainList?.find((d) => d.id === selectedDomainId);
  const notInstalled =
    !!currentDomain &&
    !currentDomain.script_verified &&
    !isLoading &&
    !(data?.visitors || data?.sessions);

  useEffect(() => {
    if (!data?.visitors) return;
    const key = `eye_milestone_100_${selectedDomainId}`;
    if (!localStorage.getItem(key) && data.visitors >= 100) {
      toast.success(`You just hit ${formatNumber(data.visitors)} visitors!`);
      localStorage.setItem(key, "1");
    }
  }, [data?.visitors, selectedDomainId]);

  if (!selectedDomainId) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-black text-on-surface">{th("noWebsiteTitle" as never)}</p>
            <p className="text-sm text-on-surface-variant mt-1.5 max-w-md mx-auto">
              {th("noWebsiteDesc" as never)}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link href={`/${locale}/connect`}>
              <Button size="lg" className="gap-2"><Plus className="w-4 h-4" />{th("addWebsite" as never)}</Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2" onClick={enterSandbox} disabled={enteringSandbox}>
              <Sparkles className="w-4 h-4" />
              {enteringSandbox
                ? (locale === "ar" ? "جاري التحميل…" : "Loading…")
                : (locale === "ar" ? "استكشف البيئة التجريبية" : "Explore the demo sandbox")}
            </Button>
          </div>
        </div>
        {/* Guided steps — shown even before a domain exists, so new users have a clear path. */}
        <WelcomeChecklist domainId={null} />
      </div>
    );
  }

  const formatSeconds = (s: number) => {
    if (!s) return "0s";
    const m = Math.floor(s / 60), sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const bounceRate = data?.bounce_rate || 0;
  const bounceHint =
    bounceRate > 70 ? th("bounceHintHigh" as never) :
    bounceRate > 50 ? th("bounceHintMid" as never) :
    th("bounceHintLow" as never);

  const uxScore = data?.ux_score?.score as number | undefined;

  const FEATURES = [
    { href: "/dashboard/realtime",        icon: Radio,      label: th("realtime" as never) || "Live Visitors",    desc: th("realtimeDesc" as never) || "Watch visitors arrive in real time", color: "text-emerald-400" },
    { href: "/dashboard/visitors",        icon: Users,      label: th("visitors" as never) || "All Visitors",     desc: th("visitorsDesc" as never) || "Browse every visitor record",         color: "text-blue-400" },
    { href: "/dashboard/analytics",       icon: BarChart3,  label: th("analytics" as never) || "Deep Analytics",  desc: th("analyticsDesc" as never) || "Traffic sources & channels",          color: "text-primary" },
    { href: "/dashboard/campaigns",       icon: Megaphone,  label: th("campaigns" as never) || "Campaigns",       desc: th("campaignsDesc" as never) || "UTM campaign performance",            color: "text-orange-400" },
    { href: "/dashboard/engaged-visitors",icon: Flame,      label: th("engagedVisitors" as never) || "Hot Leads", desc: th("engagedDesc" as never) || "Most likely to convert",                color: "text-rose-400" },
    { href: "/dashboard/funnels",         icon: GitMerge,   label: th("funnels" as never) || "Funnels",           desc: th("funnelsDesc" as never) || "Multi-step conversion flows",           color: "text-violet-400" },
    { href: "/dashboard/custom-events",   icon: Code2,      label: th("customEvents" as never) || "Goal Tracking", desc: th("eventsDesc" as never) || "Custom actions & goals",                color: "text-yellow-400" },
    { href: "/dashboard/identities",      icon: UserCheck,  label: th("identities" as never) || "Known Visitors", desc: th("identitiesDesc" as never) || "Identified users",                   color: "text-sky-400" },
    { href: "/dashboard/companies",       icon: Building2,  label: th("companies" as never) || "Companies",       desc: th("companiesDesc" as never) || "Company-level data",                  color: "text-teal-400" },
    { href: "/dashboard/summary",         icon: Star,       label: th("summary" as never) || "Full Summary",      desc: th("summaryDesc" as never) || "Full period overview",                  color: "text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Hub header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            {th("title" as never) || "Analytics"}
          </h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            {th("description" as never) || "Understand your visitors, traffic sources, and on-site behaviour."}
          </p>
        </div>
        <Link href={`/${locale}/dashboard/shared-reports`}>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-3.5 h-3.5" />
            {th("shareReport" as never)}
          </Button>
        </Link>
      </div>

      <InsightPanel domainId={selectedDomainId} page="overview" />

      {/* Site Health alert */}
      {uxScore !== undefined && uxScore < 70 && (
        <div className="flex items-center gap-3 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-on-surface flex-1">
            {th("siteHealthAlert" as never, { score: uxScore } as never)}
          </span>
          <Link href={`/${locale}/dashboard/ux`} className="text-xs text-primary font-semibold whitespace-nowrap">
            {th("seeIssues" as never)}
          </Link>
        </div>
      )}

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

      {/* Plan usage upsell — events are stored; lower plans only see their allowance */}
      <UsageUpgradeBanner domainId={selectedDomainId} />

      {/* Install gate — replaces the KPIs while a site has never reported data */}
      {notInstalled && currentDomain && (
        <NotInstalledPanel
          domainId={currentDomain.id}
          domainName={currentDomain.domain}
          scriptToken={currentDomain.script_token}
        />
      )}

      {/* KPI cards */}
      <div className={`grid grid-cols-2 lg:grid-cols-5 gap-4${notInstalled ? " opacity-40 pointer-events-none" : ""}`}>
        <KpiCard title={t("visitors")} value={isLoading ? "…" : formatNumber(data?.visitors || 0)} icon={Users} />
        <KpiCard title={t("sessions")} value={isLoading ? "…" : formatNumber(data?.sessions || 0)} icon={Activity} />
        <KpiCard title={t("avgTime")}  value={isLoading ? "…" : formatSeconds(data?.avg_session_duration || 0)} icon={Clock} />
        <KpiCard title={th("bounceRate" as never)}  value={isLoading ? "…" : `${bounceRate.toFixed(1)}%`} icon={TrendingDown} hint={bounceHint} />
        <KpiCard title={th("hotLeads" as never)}    value={isLoading ? "…" : formatNumber(data?.engaged_count || 0)} icon={Flame}
          hint={th("hotLeadsHint" as never)} clickHref="/dashboard/engaged-visitors" />
      </div>

      {/* Onboarding checklist */}
      {selectedDomainId && <WelcomeChecklist domainId={String(selectedDomainId)} />}

      {/* Area chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
            {th("chartTitle" as never)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-56 flex items-center justify-center text-on-surface-variant text-sm">{t("loading" as never) || "…"}</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.chart_data || []}>
                <defs>
                  <linearGradient id="grad-visitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#c0c1ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c0c1ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad-sessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#d0bcff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#d0bcff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#464554" strokeOpacity={0.3} />
                <XAxis dataKey="date" tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#171f33", border: "1px solid #464554", borderRadius: 8, color: "#dae2fd" }} />
                <Area type="monotone" dataKey="visitors" stroke="#c0c1ff" strokeWidth={2} fill="url(#grad-visitors)" name="Visitors" />
                <Area type="monotone" dataKey="sessions" stroke="#d0bcff" strokeWidth={2} fill="url(#grad-sessions)" name="Sessions" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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

        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">{th("devices" as never)}</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <div className="text-on-surface-variant text-sm">Loading…</div> : (
              <div className="space-y-3">
                {[
                  { label: th("desktop" as never), value: (data?.top_devices || []).find((d: { device: string }) => d.device === "desktop")?.count || 0, color: "bg-primary" },
                  { label: th("mobile" as never),  value: (data?.top_devices || []).find((d: { device: string }) => d.device === "mobile")?.count  || 0, color: "bg-secondary" },
                  { label: th("tablet" as never),  value: (data?.top_devices || []).find((d: { device: string }) => d.device === "tablet")?.count  || 0, color: "bg-tertiary" },
                ].map((d) => {
                  const total = (data?.top_devices || []).reduce((sum: number, x: { count?: number }) => sum + (x.count || 0), 0);
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
    </div>
  );
}

export default function DashboardPage() {
  return <AnalyticsHub />;
}
