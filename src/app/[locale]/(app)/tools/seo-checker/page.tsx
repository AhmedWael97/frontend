"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, CheckCircle2, XCircle, AlertTriangle, Info,
  Globe, RefreshCw, ChevronDown, ChevronUp, ScanSearch,
} from "lucide-react";

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  error?: string;
};

type CrawlResult = {
  start_url: string;
  pages_crawled: number;
  site_score: number;
  results: SeoResult[];
};

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Check row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            ðŸ’¡ {check.suggestion}
          </p>
        </div>
      )}
    </div>
  );
}

// â”€â”€ Score gauge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Single page result panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SinglePageResult({ result }: { result: SeoResult }) {
  const [showPassing, setShowPassing] = useState(false);
  const critical = result.issues.filter(c => c.severity === "critical").length;
  const warnings = result.issues.filter(c => c.severity === "warning").length;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <ScoreGauge score={result.score} />
          </CardContent>
        </Card>
        {[
          { label: "Checks Run", value: result.total,   color: "text-on-surface" },
          { label: "Passing",    value: result.passed,  color: "text-green-500" },
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

      <div className="flex items-center gap-3">
        <div className="flex-1 bg-outline-variant/20 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${scoreBg(result.score)}`}
            style={{ width: `${result.score}%` }}
          />
        </div>
        <span className={`text-sm font-bold ${scoreColor(result.score)}`}>{result.score}/100</span>
      </div>

      {result.issues.length > 0 && (
        <Card>
          <CardHeader className="px-4 py-3 border-b border-outline-variant/20">
            <CardTitle className="text-sm font-bold">Issues Found ({result.issues.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {result.issues.map((c) => <CheckRow key={c.id} check={c} />)}
          </CardContent>
        </Card>
      )}

      {result.passing.length > 0 && (
        <Card>
          <button
            className="w-full flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 hover:bg-surface-container/20 transition-colors"
            onClick={() => setShowPassing((v) => !v)}
          >
            <span className="text-sm font-bold text-green-500">âœ“ Passing Checks ({result.passing.length})</span>
            {showPassing ? <ChevronUp className="w-4 h-4 text-on-surface-variant" /> : <ChevronDown className="w-4 h-4 text-on-surface-variant" />}
          </button>
          {showPassing && (
            <CardContent className="p-0">
              {result.passing.map((c) => <CheckRow key={c.id} check={c} />)}
            </CardContent>
          )}
        </Card>
      )}

      <p className="text-xs text-on-surface-variant text-center">
        Analysed: <span className="font-mono">{result.url}</span>
      </p>
    </>
  );
}

// â”€â”€ Crawl result panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CrawlResultPanel({ crawl }: { crawl: CrawlResult }) {
  const [expanded, setExpanded] = useState<string | null>(crawl.results[0]?.url ?? null);

  return (
    <div className="space-y-4">
      {/* Site summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center gap-1">
            <ScoreGauge score={crawl.site_score} />
            <span className="text-xs text-on-surface-variant uppercase tracking-widest">Site Score</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center gap-1">
            <span className="text-3xl font-black text-on-surface">{crawl.pages_crawled}</span>
            <span className="text-xs text-on-surface-variant uppercase tracking-widest">Pages Crawled</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center gap-1">
            <span className="text-3xl font-black text-red-500">
              {crawl.results.reduce((n, r) => n + (r.issues?.filter(c => c.severity === "critical").length ?? 0), 0)}
            </span>
            <span className="text-xs text-on-surface-variant uppercase tracking-widest">Critical Issues</span>
          </CardContent>
        </Card>
      </div>

      {/* Per-page results */}
      <div className="space-y-2">
        {crawl.results.map((page) => (
          <Card key={page.url}>
            <button
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-container/20 transition-colors"
              onClick={() => setExpanded(prev => prev === page.url ? null : page.url)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`text-lg font-black shrink-0 ${scoreColor(page.score ?? 0)}`}>{page.score ?? "?"}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{page.url}</p>
                  {page.error ? (
                    <p className="text-xs text-error">{page.error}</p>
                  ) : (
                    <p className="text-xs text-on-surface-variant">
                      {page.issues?.length ?? 0} issues Â· {page.passing?.length ?? 0} passing
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {(page.issues?.filter(c => c.severity === "critical").length ?? 0) > 0 && (
                  <Badge variant="error">{page.issues.filter(c => c.severity === "critical").length} critical</Badge>
                )}
                {expanded === page.url ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            {expanded === page.url && !page.error && (
              <CardContent className="pt-0 px-4 pb-4 border-t border-outline-variant/10">
                <div className="space-y-3 mt-3">
                  {page.issues?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1">Issues</p>
                      <div className="rounded-lg border border-outline-variant/20 overflow-hidden">
                        {page.issues.map((c) => <CheckRow key={c.id} check={c} />)}
                      </div>
                    </div>
                  )}
                  {page.passing?.length > 0 && (
                    <p className="text-xs text-green-500">âœ“ {page.passing.length} checks passing</p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function SeoCheckerPage() {
  const { token } = useAuthStore();
  const [url, setUrl]           = useState("");
  const [mode, setMode]         = useState<"single" | "crawl">("single");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<SeoResult | null>(null);
  const [crawl, setCrawl]       = useState<CrawlResult | null>(null);
  const [error, setError]       = useState("");

  async function runCheck() {
    const target = url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`;
    setError("");
    setResult(null);
    setCrawl(null);
    setLoading(true);

    try {
      if (mode === "single") {
        const res = await fetch("/api/v1/tools/seo-check", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ url: target }),
        });
        const json = await res.json();
        if (!res.ok) { setError(json?.data?.message || json?.message || "An error occurred."); return; }
        const data: SeoResult = json.data;
        data.issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
        setResult(data);
      } else {
        const res = await fetch("/api/v1/tools/seo-crawl", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ url: target, max_pages: 20 }),
        });
        const json = await res.json();
        if (!res.ok) { setError(json?.data?.message || json?.message || "An error occurred."); return; }
        const data: CrawlResult = json.data;
        data.results.forEach(r => r.issues?.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]));
        setCrawl(data);
      }
    } catch (e: any) {
      setError(e.message || "Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
          <Globe className="w-6 h-6 text-primary" /> SEO Checker
        </h1>
        <p className="text-on-surface-variant text-sm mt-0.5">
          Analyse a single page or crawl your entire site for SEO issues and get actionable recommendations.
        </p>
      </div>

      {/* Mode selector + URL input */}
      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Mode tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode("single")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${mode === "single" ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant hover:text-on-surface"}`}
            >
              <Search className="w-3.5 h-3.5" /> Single Page
            </button>
            <button
              onClick={() => setMode("crawl")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${mode === "crawl" ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant hover:text-on-surface"}`}
            >
              <ScanSearch className="w-3.5 h-3.5" /> Full Site Crawl
            </button>
          </div>
          {mode === "crawl" && (
            <p className="text-xs text-on-surface-variant bg-surface-container rounded-lg px-3 py-2">
              Crawls up to 20 internal pages starting from the URL you enter, following all public links. May take up to 2â€“3 minutes.
            </p>
          )}
          <div className="flex gap-3">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && url && runCheck()}
              placeholder="https://example.com"
              className="flex-1 font-mono text-sm"
            />
            <Button onClick={runCheck} disabled={!url.trim() || loading} className="gap-2 shrink-0">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : mode === "crawl" ? <ScanSearch className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              {loading ? (mode === "crawl" ? "Crawlingâ€¦" : "Analysingâ€¦") : (mode === "crawl" ? "Crawl Site" : "Check SEO")}
            </Button>
          </div>
          {error && <p className="mt-1 text-sm text-error">{error}</p>}
        </CardContent>
      </Card>

      {/* Results */}
      {result && <SinglePageResult result={result} />}
      {crawl  && <CrawlResultPanel crawl={crawl} />}
    </div>
  );
}
