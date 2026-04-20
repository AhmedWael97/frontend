"use client";

import { useQuery } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/api";
import { Users, Globe, DollarSign, Activity } from "lucide-react";
import { formatNumber } from "@/lib/utils";

const qc = new QueryClient();

function Content() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.stats().then((r) => r.data),
  });

  const stats = [
    { label: "Total Users", value: data?.total_users, icon: Users },
    { label: "Active Domains", value: data?.active_domains, icon: Globe },
    { label: "MRR", value: data?.mrr ? `$${data.mrr.toLocaleString()}` : "—", icon: DollarSign },
    { label: "Events (30d)", value: data?.events_30d, icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Admin Overview</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Platform-wide statistics</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">{s.label}</p>
                    <p className="text-3xl font-black text-on-surface">{isLoading ? "…" : (typeof s.value === "number" ? formatNumber(s.value) : s.value || "0")}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
