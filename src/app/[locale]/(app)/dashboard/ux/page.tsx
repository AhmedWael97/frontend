"use client";

import { useQuery } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { uxApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Smile, Meh, Frown, AlertTriangle, CheckCircle } from "lucide-react";

const qc = new QueryClient();

function ScoreGauge({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = score >= 70 ? "#4ade80" : score >= 40 ? "#facc15" : "#f87171";
  const Icon = score >= 70 ? Smile : score >= 40 ? Meh : Frown;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#464554" strokeWidth="8" strokeOpacity="0.3" />
          <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
            strokeLinecap="round" className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-6 h-6 mb-1" style={{ color }} />
          <span className="text-2xl font-black text-on-surface">{Math.round(score)}</span>
        </div>
      </div>
      <p className="text-sm font-semibold" style={{ color }}>
        {score >= 70 ? "Good" : score >= 40 ? "Needs Improvement" : "Poor"}
      </p>
    </div>
  );
}

function Content() {
  const { selectedDomainId } = useAuthStore();

  const { data: scores } = useQuery({
    queryKey: ["ux-scores", selectedDomainId],
    queryFn: () => uxApi.scores(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const { data: issues } = useQuery({
    queryKey: ["ux-issues", selectedDomainId],
    queryFn: () => uxApi.issues(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const severityVariant = (s: string) => s === "high" ? "error" : s === "medium" ? "warning" : "secondary";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">UX Intelligence</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">User experience health scores and friction issues</p>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: "overall", label: "Overall" },
          { key: "performance", label: "Performance" },
          { key: "engagement", label: "Engagement" },
          { key: "satisfaction", label: "Satisfaction" },
        ].map((m) => (
          <Card key={m.key}>
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{m.label}</p>
              <ScoreGauge score={scores?.[m.key] ?? 0} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* UX Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Detected Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(issues || []).length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-2 text-on-surface-variant">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <p className="text-sm">No UX issues detected. Keep it up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(issues || []).map((issue: any) => (
                <div key={issue.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-surface-container transition-colors">
                  <Badge variant={severityVariant(issue.severity) as any} className="mt-0.5 shrink-0">{issue.severity}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface">{issue.title}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{issue.description}</p>
                    <p className="text-xs text-primary mt-1 font-medium">{issue.page}</p>
                  </div>
                  <span className="text-xs text-on-surface-variant shrink-0">{issue.affected_visitors?.toLocaleString()} visitors</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function UxPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
