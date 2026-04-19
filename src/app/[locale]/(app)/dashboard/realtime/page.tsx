"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Eye } from "lucide-react";

// RealtimeEvent shape for future WebSocket integration
type RealtimeEvent = { id: string; type: string; page: string; visitor_id: string; country: string; ts: string };

export default function RealtimePage() {
  const { selectedDomainId, token } = useAuthStore();
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const events: RealtimeEvent[] = [];

  useEffect(() => {
    if (!selectedDomainId || !token) return;
    // Poll active visitors every 30s as fallback
    const poll = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost"}/api/analytics/active-visitors?domain_id=${selectedDomainId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setActiveCount(data.count ?? data.active_visitors ?? 0);
        }
      } catch {}
    };
    poll();
    const t = setInterval(poll, 30000);
    return () => clearInterval(t);
  }, [selectedDomainId, token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Real-Time</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Live visitor activity on your site</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="sm:col-span-1">
          <CardContent className="p-6 flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            </div>
            <p className="text-4xl font-black text-on-surface">{activeCount ?? "…"}</p>
            <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Active Now</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
              <Activity className="w-4 h-4" /> Live Event Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-10 text-on-surface-variant text-sm">
                <Eye className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Events will appear here as visitors interact with your site
              </div>
            ) : (
              <div className="space-y-1.5 max-h-80 overflow-y-auto">
                {events.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-surface-container transition-colors text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                    <span className="text-on-surface-variant">{e.type}</span>
                    <span className="text-on-surface truncate flex-1">{e.page}</span>
                    <span className="text-on-surface-variant text-xs shrink-0">{e.country}</span>
                    <span className="text-on-surface-variant text-xs shrink-0">{e.ts}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
