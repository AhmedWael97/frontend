"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { uxApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Bug, ChevronDown, ChevronRight, AlertTriangle, Users } from "lucide-react";

type JsError = {
  message: string;
  file: string;
  line: number;
  stack: string;
  occurrences: number;
  affected_visitors: number;
  last_seen: string;
};

function shortFile(file: string) {
  if (!file) return "unknown source";
  try {
    const u = new URL(file);
    return u.pathname.split("/").pop() || u.pathname;
  } catch {
    return file.split("/").pop() || file;
  }
}

function timeAgo(dateStr: string) {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return dateStr;
  }
}

function ErrorRow({ error }: { error: JsError }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="cursor-pointer hover:bg-surface-container/50 transition-colors pb-3"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0 text-rose-400">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-surface break-words leading-snug">
              {error.message || "(no message)"}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              <span className="text-xs text-on-surface-variant font-mono truncate max-w-[260px]">
                {shortFile(error.file)}
                {error.line > 0 && `:${error.line}`}
              </span>
              <span className="flex items-center gap-1 text-xs text-rose-400">
                <AlertTriangle className="w-3 h-3" />
                {Number(error.occurrences).toLocaleString()} {Number(error.occurrences) === 1 ? "time" : "times"}
              </span>
              <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                <Users className="w-3 h-3" />
                {Number(error.affected_visitors).toLocaleString()} {Number(error.affected_visitors) === 1 ? "visitor" : "visitors"}
              </span>
              <span className="text-xs text-on-surface-variant/60">{timeAgo(error.last_seen)}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 pb-4">
          <div className="space-y-3 border-t border-outline-variant/20 pt-3">
            {error.file && (
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Source</p>
                <p className="text-xs font-mono text-on-surface break-all">{error.file}</p>
              </div>
            )}
            {error.stack ? (
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Stack Trace</p>
                <pre className="text-xs font-mono text-on-surface/80 bg-surface-container rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                  {error.stack}
                </pre>
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant/60 italic">No stack trace captured.</p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function Content() {
  const { selectedDomainId } = useAuthStore();

  const { data, isLoading } = useQuery<JsError[]>({
    queryKey: ["js-errors", selectedDomainId],
    queryFn: () => uxApi.errors(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  if (!selectedDomainId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-on-surface-variant">Select a domain to view JS errors.</p>
      </div>
    );
  }

  const errors = data ?? [];
  const totalOccurrences = errors.reduce((s, e) => s + Number(e.occurrences), 0);
  const totalVisitors = errors.reduce((s, e) => s + Number(e.affected_visitors), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
          <Bug className="w-6 h-6 text-primary" />
          JS Error Monitor
        </h1>
        <p className="text-on-surface-variant text-sm mt-0.5">
          JavaScript errors caught from real visitor sessions — grouped by message and source.
        </p>
      </div>

      {!isLoading && errors.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <Card className="flex-1 min-w-[120px]">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-black text-rose-400">{errors.length}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Unique errors</p>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[120px]">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-black text-on-surface">{totalOccurrences.toLocaleString()}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Total occurrences</p>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[120px]">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-black text-on-surface">{totalVisitors.toLocaleString()}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Affected visitors</p>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center h-40">
          <p className="text-on-surface-variant text-sm">Loading…</p>
        </div>
      )}

      {!isLoading && errors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Bug className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-3" />
            <p className="text-on-surface-variant text-sm">No JS errors recorded.</p>
            <p className="text-on-surface-variant/60 text-xs mt-1">
              Errors are captured automatically from visitor sessions via window.onerror.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, i) => (
            <ErrorRow key={`${error.message}-${error.file}-${error.line}-${i}`} error={error} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function JsErrorsPage() {
  return <Content />;
}
