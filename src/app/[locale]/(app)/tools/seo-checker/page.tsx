"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, CheckCircle2, XCircle, AlertTriangle, Info,
  Globe, RefreshCw, ChevronDown, ChevronUp,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Severity = "critical" | "high" | "warning" | "info" | "pass";
type Status   = "pass" | "fail" | "warn";

type Check = {
  id: string;
  label: string;
  message: string;
  status: Status;
  severity: Severity;
  suggestion: string | null;
};

type SeoResult = {
  url: string;
  score: number;
  passed: number;
  total: number;
  issues: Check[];
  passing: Check[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const severityOrder: Record<Severity, number> = {
  critical: 0,
  high: 1,
  warning: 2,
  info: 3,
  pass: 4,
};

function scoreColor(score: number) {
  if (score >= 80) return "text-green-500";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
}

function scoreBg(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

function SeverityIcon({ severity, status }: { severity: Severity; status: Status }) {
  if (status === "pass")
    return <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />;
  if (severity === "critical" || severity === "high")
    return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
  if (severity === "warning")
    return <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />;
  return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
}

function SeverityBadge({ severity, status }: { severity: Severity; status: Status }) {
  if (status === "pass") return <Badge variant="success">Pass</Badge>;
  if (severity === "critical") return <Badge variant="error">Critical</Badge>;
  if (severity === "high") return <Badge variant="error">High</Badge>;
  if (severity === "warning") return <Badge variant="warning">Warning</Badge>;
  return <Badge variant="secondary">Info</Badge>;
}

// ── Check row ─────────────────────────────────────────────────────────────────
function CheckRow({ check }: { check: Check }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-outline-variant/10 last:border-0">
      <button
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface-container/30 transition-colors"
        onClick={() => check.suggestion && setOpen((v) => !v)}
      >
        <SeverityIcon severity={check.severity} status={check.status} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-on-surface">{check.label}</span>
            <SeverityBadge severity={check.severity} status={check.status} />
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">{check.message}</p>
        </div>
        {check.suggestion && (
          <span className="text-on-surface-variant shrink-0 mt-0.5">
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        )}
      </button>
      {open && check.suggestion && (
        <div className="px-11 pb-3">
          <p className="text-xs text-primary bg-primary/5 rounded-lg px-3 py-2 border border-primary/20">
            💡 {check.suggestion}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Score gauge ───────────────────────────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const radius = 52;
  const circ   = 2 * Math.PI * radius;
  const dash   = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="currentColor" strokeWidth="10"
          className="text-outline-variant/20" />
        <circle cx="64" cy="64" r={radius} fill="none" strokeWidth="10"
          stroke={score >= 80 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444"}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 64 64)" />
        <text x="64" y="64" textAnchor="middle" dominantBaseline="central"
          className={`font-black text-2xl fill-current ${scoreColor(score)}`}
          style={{ fontSize: 26, fontWeight: 900 }}
          fill={score >= 80 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444"}>
          {score}
        </text>
      </svg>
      <span className={`text-sm font-bold ${scoreColor(score)}`}>
        {score >= 80 ? "Good" : score >= 50 ? "Needs Work" : "Poor"}
      </span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SeoCheckerPage() {
  const { token } = useAuthStore();
  const [url, setUrl]         = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<SeoResult | null>(null);
  const [error, setError]     = useState("");
  const [showPassing, setShowPassing] = useState(false);

  async function runCheck() {
    const target = url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`;
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/tools/seo-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ url: target }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.data?.message || json?.message || "An error occurred.");
        return;
      }
      const data: SeoResult = json.data;
      // Sort issues by severity
      data.issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Network error.");
    } finally {
      setLoading(false);
    }
  }

  const critical = result?.issues.filter(c => c.severity === "critical").length ?? 0;
  const high     = result?.issues.filter(c => c.severity === "high").length ?? 0;
  const warnings = result?.issues.filter(c => c.severity === "warning").length ?? 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
          <Globe className="w-6 h-6 text-primary" /> SEO Checker
        </h1>
        <p className="text-on-surface-variant text-sm mt-0.5">
          Analyse any URL for on-page SEO issues and get actionable recommendations.
        </p>
      </div>

      {/* URL input */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && url && runCheck()}
              placeholder="https://example.com"
              className="flex-1 font-mono text-sm"
            />
            <Button onClick={runCheck} disabled={!url.trim() || loading} className="gap-2 shrink-0">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? "Analysing…" : "Check SEO"}
            </Button>
          </div>
          {error && <p className="mt-2 text-sm text-error">{error}</p>}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Score overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Gauge */}
            <Card className="col-span-2 md:col-span-1">
              <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                <ScoreGauge score={result.score} />
              </CardContent>
            </Card>

            {/* Stats */}
            {[
              { label: "Checks Run", value: result.total, color: "text-on-surface" },
              { label: "Passing",    value: result.passed, color: "text-green-500" },
              { label: "Critical",   value: critical,       color: "text-red-500" },
              { label: "Warnings",   value: warnings,       color: "text-yellow-500" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4 flex flex-col items-center justify-center gap-1 h-full">
                  <span className={`text-3xl font-black ${s.color}`}>{s.value}</span>
                  <span className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">{s.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Score bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-outline-variant/20 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${scoreBg(result.score)}`}
                style={{ width: `${result.score}%` }}
              />
            </div>
            <span className={`text-sm font-bold ${scoreColor(result.score)}`}>{result.score}/100</span>
          </div>

          {/* Issues */}
          {result.issues.length > 0 && (
            <Card>
              <CardHeader className="px-4 py-3 border-b border-outline-variant/20">
                <CardTitle className="text-sm font-bold">
                  Issues Found ({result.issues.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {result.issues.map((c) => <CheckRow key={c.id} check={c} />)}
              </CardContent>
            </Card>
          )}

          {/* Passing checks (collapsible) */}
          {result.passing.length > 0 && (
            <Card>
              <button
                className="w-full flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 hover:bg-surface-container/20 transition-colors"
                onClick={() => setShowPassing((v) => !v)}
              >
                <span className="text-sm font-bold text-green-500">
                  ✓ Passing Checks ({result.passing.length})
                </span>
                {showPassing ? <ChevronUp className="w-4 h-4 text-on-surface-variant" /> : <ChevronDown className="w-4 h-4 text-on-surface-variant" />}
              </button>
              {showPassing && (
                <CardContent className="p-0">
                  {result.passing.map((c) => <CheckRow key={c.id} check={c} />)}
                </CardContent>
              )}
            </Card>
          )}

          {/* Checked URL note */}
          <p className="text-xs text-on-surface-variant text-center">
            Analysed: <span className="font-mono">{result.url}</span>
          </p>
        </>
      )}
    </div>
  );
}
