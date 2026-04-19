"use client";

import { useQuery } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Eye, Users, Activity, Clock } from "lucide-react";
import { sharedReportsApi } from "@/lib/api";
import { formatNumber } from "@/lib/utils";

const qc = new QueryClient();

function Content() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-report", token],
    queryFn: () => sharedReportsApi.view(token).then((r) => r.data),
  });

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Eye className="w-12 h-12 text-on-surface-variant mx-auto opacity-30" />
          <h1 className="text-xl font-bold text-on-surface">Report not found</h1>
          <p className="text-on-surface-variant text-sm">This report link may have expired or been revoked.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-outline-variant/20 px-6 py-4 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Eye className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-black text-on-surface">EYE Analytics Report</h1>
          {data?.domain && <p className="text-xs text-on-surface-variant">{data.domain.name}</p>}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-surface-container rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Visitors", value: data?.analytics?.visitors, icon: Users },
                { label: "Sessions", value: data?.analytics?.sessions, icon: Activity },
                { label: "Pageviews", value: data?.analytics?.pageviews, icon: Eye },
                { label: "Avg Duration", value: `${Math.floor((data?.analytics?.avg_duration || 0) / 60)}m`, icon: Clock },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <Card key={m.label}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-primary" /></div>
                      <div>
                        <p className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">{m.label}</p>
                        <p className="text-xl font-black text-on-surface">{typeof m.value === "number" ? formatNumber(m.value) : m.value || "—"}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {data?.analytics?.trend && (
              <Card>
                <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">30-Day Trend</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data.analytics.trend}>
                      <defs>
                        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#c0c1ff" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#c0c1ff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#464554" strokeOpacity={0.3} />
                      <XAxis dataKey="date" tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#171f33", border: "1px solid #464554", borderRadius: 8, color: "#dae2fd" }} />
                      <Area type="monotone" dataKey="visitors" stroke="#c0c1ff" strokeWidth={2} fill="url(#g)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-outline-variant/20 px-6 py-4 text-center text-xs text-on-surface-variant">
        Powered by <span className="text-primary font-semibold">EYE Analytics</span>
      </footer>
    </div>
  );
}

export default function PublicReportPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
