"use client";

import { useQuery } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { aiApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Sparkles, Users, TrendingUp } from "lucide-react";

const qc = new QueryClient();

function Content() {
  const { selectedDomainId } = useAuthStore();

  const { data: segments, isLoading: segLoad } = useQuery({
    queryKey: ["ai-segments", selectedDomainId],
    queryFn: () => aiApi.segments(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const { data: suggestions, isLoading: sugLoad } = useQuery({
    queryKey: ["ai-suggestions", selectedDomainId],
    queryFn: () => aiApi.suggestions(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const { data: quota } = useQuery({
    queryKey: ["ai-quota", selectedDomainId],
    queryFn: () => aiApi.quota(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const priorityColor = (p: string) => {
    if (p === "high") return "error";
    if (p === "medium") return "warning";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">AI Insights</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">AI-powered audience segments and recommendations</p>
        </div>
        {quota && (
          <div className="text-right text-xs text-on-surface-variant">
            <div className="font-semibold text-on-surface">{quota.used} / {quota.limit}</div>
            <div>AI credits used</div>
            <Progress value={(quota.used / quota.limit) * 100} className="mt-1 w-24" />
          </div>
        )}
      </div>

      {/* Segments */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> Audience Segments
        </h2>
        {segLoad ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 bg-surface-container rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(segments || []).map((s: any) => (
              <Card key={s.id} className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-bold text-on-surface">{s.name}</h3>
                    <Badge variant="secondary">{s.visitor_count?.toLocaleString()} visitors</Badge>
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-2">{s.description}</p>
                  <p className="text-xs text-primary mt-2 font-semibold">{s.conversion_rate}% conv. rate</p>
                </CardContent>
              </Card>
            ))}
            {!segments?.length && <p className="text-sm text-on-surface-variant col-span-3 py-6 text-center">No segments generated yet</p>}
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> AI Recommendations
        </h2>
        {sugLoad ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-surface-container rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {(suggestions || []).map((s: any) => (
              <Card key={s.id}>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-on-surface">{s.title}</p>
                      <Badge variant={priorityColor(s.priority) as any}>{s.priority}</Badge>
                    </div>
                    <p className="text-xs text-on-surface-variant">{s.description}</p>
                  </div>
                  {s.impact && <span className="text-xs font-bold text-green-400 shrink-0">+{s.impact}%</span>}
                </CardContent>
              </Card>
            ))}
            {!suggestions?.length && <p className="text-sm text-on-surface-variant py-6 text-center">No recommendations yet. Add more traffic to generate insights.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AiPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
