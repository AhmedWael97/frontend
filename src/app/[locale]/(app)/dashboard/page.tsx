"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Users, Activity, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { formatNumber } from "@/lib/utils";

const queryClient = new QueryClient();

function KpiCard({
  title, value, icon: Icon, trend, trendValue
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendValue?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">{title}</p>
            <p className="text-3xl font-black text-on-surface tracking-tight">{value}</p>
            {trendValue && (
              <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend === "up" ? "text-green-400" : "text-error"}`}>
                {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trendValue}
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardContent() {
  const t = useTranslations("dashboard");
  const { selectedDomainId } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["overview", selectedDomainId],
    queryFn: () => analyticsApi.overview(selectedDomainId!, { period: "30d" }).then((r) => r.data),
    enabled: !!selectedDomainId,
    refetchInterval: 60000,
  });

  if (!selectedDomainId) {
    return (
      <div className="flex items-center justify-center h-64 text-on-surface-variant">
        Select a domain from the top bar to view analytics
      </div>
    );
  }

  const formatSeconds = (s: number) => {
    if (!s) return "0s";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">{t("overview")}</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Last 30 days</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title={t("visitors")} value={isLoading ? "…" : formatNumber(data?.visitors || 0)} icon={Users} />
        <KpiCard title={t("sessions")} value={isLoading ? "…" : formatNumber(data?.sessions || 0)} icon={Activity} />
        <KpiCard title={t("avgTime")} value={isLoading ? "…" : formatSeconds(data?.avg_duration_seconds || 0)} icon={Clock} />
        <KpiCard title={t("bounceRate")} value={isLoading ? "…" : `${(data?.bounce_rate || 0).toFixed(1)}%`} icon={TrendingDown} />
      </div>

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
              <AreaChart data={data?.trend || []}>
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
                  { label: "Desktop", value: data?.devices?.desktop || 0, color: "bg-primary" },
                  { label: "Mobile", value: data?.devices?.mobile || 0, color: "bg-secondary" },
                  { label: "Tablet", value: data?.devices?.tablet || 0, color: "bg-tertiary" },
                ].map((d) => {
                  const total = (data?.devices?.desktop || 0) + (data?.devices?.mobile || 0) + (data?.devices?.tablet || 0);
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
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
}
