"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Users, Globe, DollarSign, Activity, Repeat2,
  UserCheck, TrendingUp, ChevronRight,
} from "lucide-react";

function StatCard({ label, value, icon: Icon, trend, href, loading }: {
  label: string; value: string | number | undefined; icon: any;
  trend?: string; href?: string; loading?: boolean;
}) {
  const router = useRouter();
  const locale = useLocale();
  return (
    <Card
      className={href ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
      onClick={href ? () => router.push(`/${locale}/${href}`) : undefined}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">{label}</p>
            <p className="text-3xl font-black text-on-surface">
              {loading ? <span className="inline-block w-16 h-8 bg-surface-container-high rounded animate-pulse" /> : (typeof value === "number" ? formatNumber(value) : value || "0")}
            </p>
            {trend && <p className="text-xs text-on-surface-variant mt-1">{trend}</p>}
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        {href && <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400"><span>Manage</span><ChevronRight className="w-3 h-3" /></div>}
      </CardContent>
    </Card>
  );
}

function Content() {
  const router = useRouter();
  const locale = useLocale();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.stats().then((r) => r.data),
    refetchInterval: 30_000,
  });

  const { data: recentUsersData } = useQuery({
    queryKey: ["admin-users-recent"],
    queryFn: () => adminApi.listUsers({ page: 1 } as any).then((r) => r.data),
  });

  const { data: recentSubsData } = useQuery({
    queryKey: ["admin-subscriptions-recent"],
    queryFn: () => adminApi.listSubscriptions({ status: "active", page: 1 } as any).then((r) => r.data),
  });

  const topStats = [
    { label: "Total Users", value: data?.total_users, icon: Users, href: "admin/users" },
    { label: "Active Users", value: data?.active_users, icon: UserCheck },
    { label: "Active Subscriptions", value: data?.active_subscriptions, icon: Repeat2, href: "admin/subscriptions" },
    { label: "MRR", value: data?.mrr != null ? `$${Number(data.mrr).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : undefined, icon: DollarSign },
    { label: "Active Domains", value: data?.active_domains, icon: Globe, href: "admin/domains" },
    { label: "Events Today", value: data?.events_today, icon: Activity },
  ];

  const recentUsers = recentUsersData?.data?.slice(0, 5) || [];
  const recentSubs = recentSubsData?.data?.slice(0, 5) || [];
  const topPlans = data?.top_plans || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Admin Overview</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Platform-wide statistics and quick access</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {topStats.map((s) => (
          <StatCard key={s.label} {...s} loading={isLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Users */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-widest text-on-surface-variant">Recent Users</CardTitle>
              <button onClick={() => router.push(`/${locale}/admin/users`)} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-0 divide-y divide-outline-variant/10 p-0">
            {recentUsers.length === 0 ? (
              <p className="px-4 py-3 text-sm text-on-surface-variant">No users yet.</p>
            ) : recentUsers.map((u: any) => (
              <button
                key={u.id}
                onClick={() => router.push(`/${locale}/admin/users/${u.id}`)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface-container/40 transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium text-on-surface">{u.name}</p>
                  <p className="text-xs text-on-surface-variant">{u.email}</p>
                </div>
                <Badge variant={u.status === "blocked" ? "error" : "success"} className="text-xs">{u.status || "active"}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Active Subscriptions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-widest text-on-surface-variant">Active Subscriptions</CardTitle>
              <button onClick={() => router.push(`/${locale}/admin/subscriptions`)} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-0 divide-y divide-outline-variant/10 p-0">
            {recentSubs.length === 0 ? (
              <p className="px-4 py-3 text-sm text-on-surface-variant">No active subscriptions.</p>
            ) : recentSubs.map((s: any) => (
              <button
                key={s.id}
                onClick={() => router.push(`/${locale}/admin/users/${s.user?.id}`)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface-container/40 transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium text-on-surface">{s.user?.name || s.user?.email}</p>
                  <p className="text-xs text-on-surface-variant">{s.plan?.name}</p>
                </div>
                <span className="text-xs font-semibold text-on-surface">${Number(s.plan?.price_monthly || 0).toFixed(0)}/mo</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Top Plans */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-widest text-on-surface-variant">Top Plans</CardTitle>
              <button onClick={() => router.push(`/${locale}/admin/plans`)} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                Manage <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-0 divide-y divide-outline-variant/10 p-0">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-4 py-2.5 flex justify-between">
                  <div className="h-4 bg-surface-container-high rounded animate-pulse w-24" />
                  <div className="h-4 bg-surface-container-high rounded animate-pulse w-8" />
                </div>
              ))
            ) : topPlans.length === 0 ? (
              <p className="px-4 py-3 text-sm text-on-surface-variant">No plans found.</p>
            ) : topPlans.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="text-sm text-on-surface">{p.name}</span>
                </div>
                <span className="text-sm font-semibold text-on-surface">{p.subscriptions_count} subs</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader><CardTitle className="text-xs uppercase tracking-widest text-on-surface-variant">Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Create User", icon: Users, href: "admin/users" },
              { label: "Assign Plan", icon: Repeat2, href: "admin/subscriptions" },
              { label: "View Domains", icon: Globe, href: "admin/domains" },
              { label: "Audit Log", icon: Activity, href: "admin/audit-log" },
            ].map(({ label, icon: Icon, href }) => (
              <button
                key={label}
                onClick={() => router.push(`/${locale}/${href}`)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-outline-variant/20 hover:bg-surface-container-high hover:border-indigo-300 transition-all text-center"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-xs font-semibold text-on-surface">{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPage() {
  return <Content />;
}
