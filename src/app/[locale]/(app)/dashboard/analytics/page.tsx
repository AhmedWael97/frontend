"use client";

import { useQuery } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";


const qc = new QueryClient();

const TOOLTIP_STYLE = { background: "#171f33", border: "1px solid #464554", borderRadius: 8, color: "#dae2fd" };

function SimpleBarChart({ data, dataKey, nameKey = "label" }: { data: any[]; dataKey: string; nameKey?: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 16, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#464554" strokeOpacity={0.2} horizontal={false} />
        <XAxis type="number" tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey={nameKey} tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey={dataKey} fill="#c0c1ff" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function Content() {
  const { selectedDomainId } = useAuthStore();

  const { data: sources } = useQuery({
    queryKey: ["traffic-sources", selectedDomainId],
    queryFn: () => analyticsApi.trafficSources(selectedDomainId!, { period: "30d" }).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const { data: utms } = useQuery({
    queryKey: ["utms", selectedDomainId],
    queryFn: () => analyticsApi.utmStats(selectedDomainId!, { period: "30d" }).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Analytics</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Traffic breakdown and campaign performance</p>
      </div>

      <Tabs defaultValue="sources">
        <TabsList>
          <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
          <TabsTrigger value="utm">UTM Campaigns</TabsTrigger>
          <TabsTrigger value="browsers">Browsers & OS</TabsTrigger>
          <TabsTrigger value="referrers">Referrers</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Traffic Sources</CardTitle></CardHeader>
            <CardContent>
              {sources?.length ? (
                <SimpleBarChart data={sources} dataKey="visitors" nameKey="source" />
              ) : <p className="text-on-surface-variant text-sm py-8 text-center">No data yet</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utm" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["campaign", "source", "medium", "term"].map((k) => (
              <Card key={k}>
                <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">By {k}</CardTitle></CardHeader>
                <CardContent>
                  {utms?.[k]?.length ? (
                    <SimpleBarChart data={utms[k]} dataKey="visitors" nameKey={k} />
                  ) : <p className="text-on-surface-variant text-sm py-6 text-center">No data</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="browsers" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Browsers</CardTitle></CardHeader>
            <CardContent>
              <p className="text-on-surface-variant text-sm py-8 text-center">Browser data will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrers" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Top Referrers</CardTitle></CardHeader>
            <CardContent>
              <p className="text-on-surface-variant text-sm py-8 text-center">Referrer data will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AnalyticsPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
