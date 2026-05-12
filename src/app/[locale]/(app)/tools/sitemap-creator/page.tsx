"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth";
import { sitemapApi } from "@/api/sitemap";
import type {
  SitemapJobResponse,
  SitemapHistoryItem,
  SitemapUrlEntry,
  SitemapAiAnalysis,
  SitemapJobSummary,
  SitemapJobStatus,
  TrafficLabel,
} from "@/api/sitemap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Globe, RefreshCw, Download, Clipboard, ClipboardCheck,
  ChevronDown, ChevronUp, Zap, TrendingUp, TrendingDown,
  Eye, AlertTriangle, CheckCircle2, Clock, XCircle, Info,
  BarChart3, Layers, Sparkles, History, FileCode, FileJson,
  FileSpreadsheet, ExternalLink, Link2,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type Step = "idle" | "pending" | "crawling" | "enriching" | "analyzing" | "completed" | "failed";

const STEP_ORDER: Step[] = ["pending", "crawling", "enriching", "analyzing", "completed"];

// ── Helpers ──────────────────────────────────────────────────────────────────

function trafficBadge(label: TrafficLabel) {
  const map: Record<TrafficLabel, { text: string; className: string }> = {
    high_traffic:    { text: "High",          className: "bg-green-500/15 text-green-400 border-green-500/30" },
    medium_traffic:  { text: "Medium",        className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    low_traffic:     { text: "Low",           className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
    zero_traffic:    { text: "Zero",          className: "bg-neutral-700/60 text-neutral-400 border-neutral-600" },
    analytics_only:  { text: "Analytics",    className: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
    crawl_only:      { text: "Crawl only",   className: "bg-neutral-700/60 text-neutral-400 border-neutral-600" },
  };
  const { text, className } = map[label] ?? map.crawl_only;
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium ${className}`}>
      {text}
    </span>
  );
}

function statusColor(status: SitemapJobStatus) {
  if (status === "completed") return "text-green-400";
  if (status === "failed") return "text-red-400";
  return "text-yellow-400";
}

function StepIndicator({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "crawling",   label: "Crawling" },
    { id: "enriching",  label: "Analytics" },
    { id: "analyzing",  label: "AI analysis" },
    { id: "completed",  label: "Done" },
  ];
  const currentIdx = STEP_ORDER.indexOf(step);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {steps.map((s, i) => {
        const sIdx = STEP_ORDER.indexOf(s.id);
        const done   = currentIdx > sIdx;
        const active = currentIdx === sIdx;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border
              ${done   ? "bg-green-500/15 text-green-400 border-green-500/30"  : ""}
              ${active ? "bg-blue-500/20 text-blue-300 border-blue-400/40 animate-pulse" : ""}
              ${!done && !active ? "bg-neutral-800 text-neutral-500 border-neutral-700" : ""}
            `}>
              {done   && <CheckCircle2 className="w-3 h-3" />}
              {active && <RefreshCw className="w-3 h-3 animate-spin" />}
              {!done && !active && <Clock className="w-3 h-3" />}
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-4 ${done ? "bg-green-500/50" : "bg-neutral-700"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function SitemapCreatorPage() {
  const t = useTranslations("sitemap");
  const token = useAuthStore((s) => s.token);

  // Form
  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState(100);
  const [dateRange, setDateRange] = useState<30 | 60 | 90>(90);
  const [includeZero, setIncludeZero] = useState(true);
  const [includeOnly, setIncludeOnly] = useState(true);
  const [optionsOpen, setOptionsOpen] = useState(false);

  // Job state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<number | null>(null);
  const [jobData, setJobData] = useState<SitemapJobResponse | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // History
  const [history, setHistory] = useState<SitemapHistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Results tab
  const [tab, setTab] = useState<"overview" | "urls" | "insights" | "download">("overview");

  // URL table
  const [urlFilter, setUrlFilter] = useState<TrafficLabel | "all">("all");
  const [urlSort, setUrlSort] = useState<"priority" | "pageviews" | "depth">("priority");
  const [expandedUrls, setExpandedUrls] = useState<Set<string>>(new Set());

  // Copy XML
  const [copied, setCopied] = useState(false);

  // Download loading
  const [downloadingFormat, setDownloadingFormat] = useState<"xml" | "json" | "csv" | null>(null);

  // ── Polling ─────────────────────────────────────────────────────────────────

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const startPolling = useCallback((jobId: number) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await sitemapApi.status(jobId);
        const data = res.data?.data ?? res.data;
        setJobData(data);
        if (data.status === "completed" || data.status === "failed") {
          stopPolling();
        }
      } catch {
        stopPolling();
      }
    }, 2000);
  }, [stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  // ── Load History ─────────────────────────────────────────────────────────────

  useEffect(() => {
    sitemapApi.history()
      .then((res) => setHistory(res.data?.data?.jobs ?? res.data?.jobs ?? []))
      .catch(() => {});
  }, []);

  // ── Generate ─────────────────────────────────────────────────────────────────

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setError(null);
    setLoading(true);
    setJobData(null);
    setActiveJobId(null);
    setTab("overview");

    try {
      const res = await sitemapApi.generate({
        url: url.trim(),
        max_pages: maxPages,
        date_range_days: dateRange,
        include_zero_traffic: includeZero,
        include_analytics_only: includeOnly,
      });
      const data = res.data?.data ?? res.data;
      setActiveJobId(data.job_id);
      // Start with a pending state so the progress UI shows
      setJobData({
        id: data.job_id,
        status: "pending",
        pages_crawled: 0,
        start_url: url.trim(),
        domain_id: null,
        analytics_mode: data.analytics_mode,
        created_at: new Date().toISOString(),
        completed_at: null,
        error_message: null,
      });
      startPolling(data.job_id);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // ── Restore job from history ──────────────────────────────────────────────

  async function loadHistoryJob(jobId: number) {
    try {
      const res = await sitemapApi.status(jobId);
      const data = res.data?.data ?? res.data;
      setJobData(data);
      setActiveJobId(jobId);
      setHistoryOpen(false);
      setTab("overview");
    } catch {}
  }

  // ── Download ─────────────────────────────────────────────────────────────────

  async function handleDownload(format: "xml" | "json" | "csv") {
    if (!activeJobId || downloadingFormat) return;
    setDownloadingFormat(format);
    try {
      const res = await sitemapApi.download(activeJobId, format);
      const blob = new Blob([res.data as BlobPart], {
        type: format === "xml" ? "application/xml" : format === "json" ? "application/json" : "text/csv",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `sitemap.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (err: unknown) {
      const errAny = err as { response?: { data?: Blob } };
      if (errAny?.response?.data instanceof Blob) {
        // error body came back as a blob — try to read the message
        try {
          const text = await errAny.response.data.text();
          const parsed = JSON.parse(text);
          const msg = parsed?.data?.message ?? parsed?.message ?? "Download failed.";
          console.error("Sitemap download error:", msg);
        } catch {
          console.error("Sitemap download failed.");
        }
      }
    } finally {
      setDownloadingFormat(null);
    }
  }

  async function handleCopyXml() {
    if (!activeJobId) return;
    try {
      const res = await sitemapApi.download(activeJobId, "xml");
      const blob = res.data as Blob;
      const text = blob instanceof Blob ? await blob.text() : String(blob);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  // ── Derived values ────────────────────────────────────────────────────────────

  const step: Step = (jobData?.status as Step | undefined) ?? "idle";
  const isRunning = ["pending", "crawling", "enriching", "analyzing"].includes(step);
  const isDone = step === "completed";
  const isFailed = step === "failed";

  const urls: SitemapUrlEntry[] = jobData?.sitemap_result ?? [];
  const summary: SitemapJobSummary | undefined = jobData?.summary;
  const ai: SitemapAiAnalysis | undefined = jobData?.ai_analysis;

  const filteredUrls = urlFilter === "all"
    ? urls
    : urls.filter((u) => u.traffic_label === urlFilter);

  const sortedUrls = [...filteredUrls].sort((a, b) => {
    if (urlSort === "priority")  return b.priority - a.priority;
    if (urlSort === "pageviews") return b.pageviews - a.pageviews;
    return (a.depth ?? 99) - (b.depth ?? 99);
  });

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-400" />
            {t("title")}
          </h1>
          <p className="text-neutral-400 mt-1 text-sm">{t("description")}</p>
        </div>

        {/* History button */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setHistoryOpen((o) => !o)}
        >
          <History className="w-4 h-4" />
          {t("history")}
          {history.length > 0 && (
            <span className="rounded-full bg-indigo-500/20 text-indigo-300 text-xs px-1.5">
              {history.length}
            </span>
          )}
        </Button>
      </div>

      {/* History panel */}
      {historyOpen && history.length > 0 && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm text-neutral-300">{t("recentJobs")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-neutral-800">
              {history.slice(0, 10).map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadHistoryJob(item.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-800/50 transition text-left"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{item.start_url}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {new Date(item.created_at).toLocaleDateString()} · {item.pages_crawled} pages
                    </p>
                  </div>
                  <span className={`text-xs font-medium ml-4 shrink-0 ${statusColor(item.status)}`}>
                    {item.status}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate form */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="pt-5 pb-4 px-5">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="flex gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex-1 min-w-0">
                <Input
                  type="url"
                  placeholder={t("urlPlaceholder")}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isRunning || loading}
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                />
              </div>
              <Button
                type="submit"
                disabled={isRunning || loading || !url.trim()}
                className="gap-2 shrink-0"
              >
                {(isRunning || loading) ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Layers className="w-4 h-4" />
                )}
                {isRunning ? t("generating") : t("generateButton")}
              </Button>
            </div>

            {/* Options accordion */}
            <div>
              <button
                type="button"
                onClick={() => setOptionsOpen((o) => !o)}
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition"
              >
                {optionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {t("advancedOptions")}
              </button>

              {optionsOpen && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pl-2 border-l border-neutral-800">
                  {/* Max pages */}
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1.5">{t("maxPages")}</label>
                    <div className="flex gap-2">
                      {([50, 100, 200] as number[]).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setMaxPages(v)}
                          className={`flex-1 rounded py-1.5 text-sm border transition ${
                            maxPages === v
                              ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                              : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date range */}
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1.5">{t("dateRange")}</label>
                    <div className="flex gap-2">
                      {([30, 60, 90] as (30 | 60 | 90)[]).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setDateRange(v)}
                          className={`flex-1 rounded py-1.5 text-sm border transition ${
                            dateRange === v
                              ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                              : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
                          }`}
                        >
                          {v}d
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">{t("includeZeroTraffic")}</span>
                    <button
                      type="button"
                      onClick={() => setIncludeZero((v) => !v)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${includeZero ? "bg-indigo-500" : "bg-neutral-700"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${includeZero ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">{t("includeAnalyticsOnly")}</span>
                    <button
                      type="button"
                      onClick={() => setIncludeOnly((v) => !v)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${includeOnly ? "bg-indigo-500" : "bg-neutral-700"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${includeOnly ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                <XCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* CTA: domain not connected */}
      {jobData && !jobData.analytics_mode && (
        <Card className="bg-indigo-950/30 border-indigo-500/30">
          <CardContent className="pt-4 pb-4 px-5">
            <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
              <div className="p-2 rounded-lg bg-indigo-500/15 shrink-0">
                <Zap className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{t("ctaTitle")}</p>
                <p className="text-xs text-neutral-400 mt-1">{t("ctaDesc")}</p>
              </div>
              <a href="/settings/domains" className="shrink-0">
                <Button variant="outline" size="sm" className="border-indigo-500/40 text-indigo-300 gap-2 hover:bg-indigo-500/10">
                  {t("ctaButton")}
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress / running state */}
      {isRunning && jobData && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="pt-5 pb-5 px-5 space-y-4">
            <StepIndicator step={step} />
            <div className="flex items-center gap-2 text-sm text-neutral-300">
              <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{jobData.start_url}</span>
              <span className="text-neutral-600">·</span>
              <span>{jobData.pages_crawled} {t("pagesCrawled")}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failed state */}
      {isFailed && jobData && (
        <Card className="bg-red-950/20 border-red-500/30">
          <CardContent className="pt-4 pb-4 px-5">
            <div className="flex items-center gap-2 text-sm text-red-400">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{t("failedMessage")}</span>
              {jobData.error_message && (
                <span className="text-neutral-500 ml-1">— {jobData.error_message}</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {isDone && jobData && (
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 rounded-lg bg-neutral-900 border border-neutral-800 p-1">
            {(["overview", "urls", "insights", "download"] as const).map((t_) => (
              <button
                key={t_}
                onClick={() => setTab(t_)}
                className={`flex-1 text-sm py-1.5 rounded-md transition font-medium
                  ${tab === t_
                    ? "bg-indigo-600 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
              >
                {t(t_ as never)}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {tab === "overview" && (
            <div className="space-y-4">
              {/* Stat cards */}
              {summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card className="bg-neutral-900 border-neutral-800">
                    <CardContent className="pt-4 pb-4 px-4 text-center">
                      <p className="text-2xl font-bold text-white">{summary.total_urls}</p>
                      <p className="text-xs text-neutral-500 mt-1">{t("totalUrls")}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-950/20 border-green-500/20">
                    <CardContent className="pt-4 pb-4 px-4 text-center">
                      <p className="text-2xl font-bold text-green-400">{summary.high_traffic}</p>
                      <p className="text-xs text-neutral-500 mt-1">{t("highTraffic")}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-neutral-900 border-neutral-800">
                    <CardContent className="pt-4 pb-4 px-4 text-center">
                      <p className="text-2xl font-bold text-neutral-300">{summary.zero_traffic}</p>
                      <p className="text-xs text-neutral-500 mt-1">{t("zeroTraffic")}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-950/20 border-purple-500/20">
                    <CardContent className="pt-4 pb-4 px-4 text-center">
                      <p className="text-2xl font-bold text-purple-400">{summary.analytics_only}</p>
                      <p className="text-xs text-neutral-500 mt-1">{t("analyticsOnly")}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* AI analysis card */}
              {ai && (
                <Card className="bg-neutral-900 border-neutral-800">
                  <CardHeader className="py-3 px-4 border-b border-neutral-800">
                    <CardTitle className="text-sm text-neutral-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      {t("aiAnalysis")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 pb-4 px-4 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-neutral-500">{t("siteType")}</span>
                      <span className="inline-flex items-center rounded border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-300 font-medium capitalize">
                        {ai.site_type}
                      </span>
                      <span className="text-xs text-neutral-600">
                        {Math.round(ai.site_type_confidence * 100)}% {t("confidence")}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-300">{ai.strategy}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* URLs tab */}
          {tab === "urls" && (
            <div className="space-y-3">
              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-neutral-500">{t("filterByTraffic")}</span>
                {(["all", "high_traffic", "medium_traffic", "low_traffic", "zero_traffic", "analytics_only", "crawl_only"] as (TrafficLabel | "all")[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setUrlFilter(f)}
                    className={`rounded px-2 py-0.5 text-xs border transition
                      ${urlFilter === f
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                        : "border-neutral-700 text-neutral-500 hover:border-neutral-500"
                      }`}
                  >
                    {f === "all" ? t("all") : f.replace(/_/g, " ")}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-neutral-500">{t("sortBy")}</span>
                  <select
                    value={urlSort}
                    onChange={(e) => setUrlSort(e.target.value as typeof urlSort)}
                    className="text-xs bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-300"
                  >
                    <option value="priority">{t("priority")}</option>
                    <option value="pageviews">{t("pageviews")}</option>
                    <option value="depth">{t("depth")}</option>
                  </select>
                </div>
              </div>

              {/* URL list */}
              <div className="rounded-lg border border-neutral-800 divide-y divide-neutral-800 overflow-hidden">
                {sortedUrls.slice(0, 200).map((entry) => {
                  const expanded = expandedUrls.has(entry.url);
                  return (
                    <div key={entry.url} className="bg-neutral-900">
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/50 transition text-left"
                        onClick={() =>
                          setExpandedUrls((prev) => {
                            const next = new Set(prev);
                            next.has(entry.url) ? next.delete(entry.url) : next.add(entry.url);
                            return next;
                          })
                        }
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{entry.url}</p>
                          {entry.title && (
                            <p className="text-xs text-neutral-500 truncate mt-0.5">{entry.title}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {trafficBadge(entry.traffic_label)}
                          <span className="text-xs text-neutral-500 w-10 text-right">p:{entry.priority.toFixed(1)}</span>
                          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-neutral-600" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-600" />}
                        </div>
                      </button>
                      {expanded && (
                        <div className="px-4 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-neutral-400 border-t border-neutral-800/80 pt-2">
                          <span>Changefreq: <span className="text-neutral-300">{entry.changefreq}</span></span>
                          <span>Pageviews: <span className="text-neutral-300">{entry.pageviews.toLocaleString()}</span></span>
                          <span>Visitors: <span className="text-neutral-300">{entry.unique_visitors.toLocaleString()}</span></span>
                          <span>Depth: <span className="text-neutral-300">{entry.depth ?? "—"}</span></span>
                          {entry.avg_depth !== null && (
                            <span>Avg click depth: <span className="text-neutral-300">{entry.avg_depth}</span></span>
                          )}
                          {entry.status_code && entry.status_code >= 400 && (
                            <span className="text-red-400">HTTP {entry.status_code}</span>
                          )}
                          {entry.source === "analytics" && (
                            <span className="col-span-2 text-purple-400">Found only in analytics (not crawled)</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {sortedUrls.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-neutral-500">
                    {t("noUrls")}
                  </div>
                )}
              </div>
              <p className="text-xs text-neutral-600 text-right">
                {t("showing")} {Math.min(sortedUrls.length, 200)} / {sortedUrls.length}
              </p>
            </div>
          )}

          {/* Insights tab */}
          {tab === "insights" && ai && (
            <div className="space-y-3">
              {ai.recommendations.length === 0 && (
                <Card className="bg-neutral-900 border-neutral-800">
                  <CardContent className="pt-5 pb-5 px-5 text-center text-sm text-neutral-500">
                    {t("noRecommendations")}
                  </CardContent>
                </Card>
              )}
              {ai.recommendations.map((rec, i) => (
                <Card key={i} className="bg-neutral-900 border-neutral-800">
                  <CardContent className="pt-4 pb-4 px-4 flex gap-3 items-start">
                    <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-neutral-300">{rec}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Download tab */}
          {tab === "download" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card className="bg-neutral-900 border-neutral-800">
                  <CardContent className="pt-5 pb-5 px-4 text-center space-y-3">
                    <FileCode className="w-8 h-8 text-indigo-400 mx-auto" />
                    <p className="text-sm font-medium text-white">XML</p>
                    <p className="text-xs text-neutral-500">{t("xmlDesc")}</p>
                    <Button onClick={() => handleDownload("xml")} disabled={!!downloadingFormat} variant="outline" size="sm" className="w-full gap-2">
                      {downloadingFormat === "xml" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      {downloadingFormat === "xml" ? t("downloading") : t("downloadXml")}
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-neutral-800">
                  <CardContent className="pt-5 pb-5 px-4 text-center space-y-3">
                    <FileJson className="w-8 h-8 text-yellow-400 mx-auto" />
                    <p className="text-sm font-medium text-white">JSON</p>
                    <p className="text-xs text-neutral-500">{t("jsonDesc")}</p>
                    <Button onClick={() => handleDownload("json")} disabled={!!downloadingFormat} variant="outline" size="sm" className="w-full gap-2">
                      {downloadingFormat === "json" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      {downloadingFormat === "json" ? t("downloading") : t("downloadJson")}
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-neutral-800">
                  <CardContent className="pt-5 pb-5 px-4 text-center space-y-3">
                    <FileSpreadsheet className="w-8 h-8 text-green-400 mx-auto" />
                    <p className="text-sm font-medium text-white">CSV</p>
                    <p className="text-xs text-neutral-500">{t("csvDesc")}</p>
                    <Button onClick={() => handleDownload("csv")} disabled={!!downloadingFormat} variant="outline" size="sm" className="w-full gap-2">
                      {downloadingFormat === "csv" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      {downloadingFormat === "csv" ? t("downloading") : t("downloadCsv")}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader className="py-3 px-4 border-b border-neutral-800 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm text-neutral-300">{t("previewXml")}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-xs"
                    onClick={handleCopyXml}
                  >
                    {copied ? <ClipboardCheck className="w-3.5 h-3.5 text-green-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                    {copied ? t("copied") : t("copyXml")}
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <pre className="p-4 text-xs text-neutral-400 font-mono overflow-x-auto max-h-64 leading-relaxed">
{`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${urls.slice(0, 5).map((u) =>
`  <url>
    <loc>${u.url}</loc>
    <priority>${u.priority.toFixed(1)}</priority>
    <changefreq>${u.changefreq}</changefreq>
  </url>`
).join("\n")}
  ...
</urlset>`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
