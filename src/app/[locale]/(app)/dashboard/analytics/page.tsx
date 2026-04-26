"use client";

import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const TOOLTIP_STYLE = { background: "#171f33", border: "1px solid #464554", borderRadius: 8, color: "#dae2fd" };

function SimpleBarChart({ data, dataKey, nameKey = "label" }: { data: any[]; dataKey: string; nameKey?: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 16, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#464554" strokeOpacity={0.2} horizontal={false} />
        <XAxis type="number" tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey={nameKey} tick={{ fill: "#c7c4d7", fontSize: 11 }} axisLine={false} tickLine={false} width={140} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey={dataKey} fill="#c0c1ff" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function NoData({ message = "No data yet" }: { message?: string }) {
  return <p className="text-on-surface-variant text-sm py-8 text-center">{message}</p>;
}

function Content() {
  const { selectedDomainId } = useAuthStore();

  const { data: referrers } = useQuery({
    queryKey: ["referrers", selectedDomainId],
    queryFn: () => analyticsApi.referrers(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const { data: devices } = useQuery({
    queryKey: ["devices", selectedDomainId],
    queryFn: () => analyticsApi.devices(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const { data: pages } = useQuery({
    queryKey: ["pages", selectedDomainId],
    queryFn: () => analyticsApi.pages(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const { data: events } = useQuery({
    queryKey: ["custom-events", selectedDomainId],
    queryFn: () => analyticsApi.customEvents(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  if (!selectedDomainId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-on-surface-variant">Select a domain from the top bar to view analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Analytics</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Traffic breakdown and campaign performance</p>
      </div>

      <Tabs defaultValue="referrers">
        <TabsList>
          <TabsTrigger value="referrers">Referrers</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="devices">Devices & Browsers</TabsTrigger>
          <TabsTrigger value="events">Custom Events</TabsTrigger>
        </TabsList>

        <TabsContent value="referrers" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Top Referrers</CardTitle></CardHeader>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">{t("title")}</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">{t("subtitle")}</p>
                <SimpleBarChart data={referrers} dataKey="visits" nameKey="referrer" />
              ) : <NoData />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Top Pages</CardTitle></CardHeader>
            <CardContent>
              {Array.isArray(pages) && pages.length ? (
                <SimpleBarChart data={pages} dataKey="pageviews" nameKey="url" />
              ) : <NoData />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Device Types</CardTitle></CardHeader>
              <CardContent>
                {devices?.device_types?.length ? (
                  <SimpleBarChart data={devices.device_types} dataKey="count" nameKey="type" />
                ) : <NoData />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Browsers</CardTitle></CardHeader>
              <CardContent>
                {devices?.browsers?.length ? (
                  <SimpleBarChart data={devices.browsers} dataKey="count" nameKey="browser" />
                ) : <NoData />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Operating Systems</CardTitle></CardHeader>
              <CardContent>
                {devices?.os?.length ? (
                  <SimpleBarChart data={devices.os} dataKey="count" nameKey="os" />
                ) : <NoData />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Custom Events</CardTitle></CardHeader>
            <CardContent>
              {Array.isArray(events) && events.length ? (
                <SimpleBarChart data={events} dataKey="count" nameKey="name" />
              ) : <NoData message="No custom events tracked yet. Use eye.track() in your website code." />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AnalyticsPage() {
  return <Content />;
}
