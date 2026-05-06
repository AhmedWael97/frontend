"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { aiApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import {
  Sparkles,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  RefreshCw,
  ShoppingCart,
  X,
  Clock,
  ChevronRight,
  BarChart2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TokenPack {
  id: string;
  label: string;
  tokens: number;
  price: number;
  description: string;
}

interface QuotaData {
  ai_tokens: number;
  ai_free_used: boolean;
  is_free_plan: boolean;
  visitor_count: number;
  min_visitors: number;
  can_run_free: boolean;
  last_analyzed_at: string | null;
  token_packs: TokenPack[];
}

interface ReportItem {
  title: string;
  detail: string;
}

interface ReportData {
  summary: string;
  top_insight: string;
  growth_opportunities: ReportItem[];
  risk_areas: ReportItem[];
}

interface Segment {
  id: number;
  name: string;
  description: string;
  visitor_count: number;
  conversion_rate: number;
}

interface Suggestion {
  id: number;
  text: string;
  category: string;
  priority: "high" | "medium" | "low";
  estimated_impact: string | null;
}

// ── Token Balance Badge ───────────────────────────────────────────────────────

function TokenBadge({
  quota,
  onBuyClick,
}: {
  quota: QuotaData;
  onBuyClick: () => void;
}) {
  if (quota.is_free_plan) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-on-surface-variant">
          {quota.can_run_free && !quota.ai_free_used
            ? "1 free analysis available"
            : quota.ai_free_used
            ? "Free analysis used"
            : `Need ${quota.min_visitors.toLocaleString()} visitors`}
        </span>
        <Button size="sm" variant="outline" onClick={onBuyClick}>
          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
          Buy Tokens
        </Button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
        <Zap className="w-3.5 h-3.5" />
        {quota.ai_tokens} token{quota.ai_tokens !== 1 ? "s" : ""}
      </div>
      <Button size="sm" variant="outline" onClick={onBuyClick}>
        <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
        Buy More
      </Button>
    </div>
  );
}

// ── Purchase Modal ─────────────────────────────────────

function PurchaseModal({
  open,
  packs,
  onClose,
  onPurchase,
  isPurchasing,
}: {
  open: boolean;
  packs: TokenPack[];
  onClose: () => void;
  onPurchase: (pack: "starter" | "growth" | "pro") => void;
  isPurchasing: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Buy AI Analysis Tokens
          </DialogTitle>
          <DialogDescription>
            Each token lets you run one full AI analysis on your domain.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {packs.map((pack) => (
            <button
              key={pack.id}
              onClick={() =>
                onPurchase(pack.id as "starter" | "growth" | "pro")
              }
              disabled={isPurchasing}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-outline/40 hover:border-primary/50 hover:bg-primary/5 transition-all text-left disabled:opacity-50"
            >
              <div>
                <p className="font-semibold text-on-surface text-sm">
                  {pack.label}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {pack.description}
                </p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-lg font-black text-primary">
                  ${pack.price}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {pack.tokens} tokens
                </p>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-on-surface-variant mt-2 text-center">
          Payment is processed manually. Tokens are credited immediately.
        </p>
      </DialogContent>
    </Dialog>
  );
}

// ── Analyze Button ─────────────────────────────────────────────────────────────

function AnalyzeButton({
  quota,
  isAnalyzing,
  onAnalyze,
  onBuyClick,
}: {
  quota: QuotaData | undefined;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onBuyClick: () => void;
}) {
  if (!quota) return null;

  const belowVisitorThreshold =
    quota.is_free_plan && quota.visitor_count < quota.min_visitors;
  const freeAlreadyUsed = quota.is_free_plan && quota.ai_free_used;
  const noTokensPaid = !quota.is_free_plan && quota.ai_tokens === 0;
  const blocked = belowVisitorThreshold || (freeAlreadyUsed && noTokensPaid);

  if (belowVisitorThreshold) {
    return (
      <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2.5">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>
          Free analysis requires{" "}
          <strong>{quota.min_visitors.toLocaleString()}</strong> unique visitors
          in 30 days. You have{" "}
          <strong>{quota.visitor_count.toLocaleString()}</strong>.
        </span>
      </div>
    );
  }

  if (freeAlreadyUsed && quota.ai_tokens === 0) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-xs text-on-surface-variant">
          Free analysis used. Purchase tokens to run more analyses.
        </div>
        <Button size="sm" onClick={onBuyClick}>
          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
          Buy Tokens
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={onAnalyze}
      disabled={isAnalyzing || blocked}
      className="gap-2"
    >
      {isAnalyzing ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          Analyzing…
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Run AI Analysis
          {!quota.is_free_plan && quota.ai_tokens > 0 && (
            <span className="opacity-70 text-xs ml-1">
              (1 token)
            </span>
          )}
        </>
      )}
    </Button>
  );
}

// ── Report Section ─────────────────────────────────────────────────────────────

function ReportSection({ report }: { report: ReportData }) {
  return (
    <div className="space-y-4">
      {/* Top Insight banner */}
      {report.top_insight && (
        <div className="flex items-start gap-3 bg-primary/8 border border-primary/20 rounded-xl p-4">
          <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm font-semibold text-on-surface leading-snug">
            {report.top_insight}
          </p>
        </div>
      )}

      {/* Summary */}
      {report.summary && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {report.summary}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Growth Opportunities */}
        {report.growth_opportunities?.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-green-700 dark:text-green-400">
                <TrendingUp className="w-4 h-4" />
                Growth Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.growth_opportunities.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-on-surface-variant">
                    <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-green-500 shrink-0" />
                    <span><strong className="text-on-surface">{item.title}</strong> — {item.detail}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Risk Areas */}
        {report.risk_areas?.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-400">
                <TrendingDown className="w-4 h-4" />
                Risk Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.risk_areas.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-on-surface-variant">
                    <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-red-500 shrink-0" />
                    <span><strong className="text-on-surface">{item.title}</strong> — {item.detail}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── Main Content ──────────────────────────────────────────────────────────────

function Content() {
  const { selectedDomainId } = useAuthStore();
  const queryClient = useQueryClient();
  const [buyOpen, setBuyOpen] = useState(false);
  const [analyzeTriggered, setAnalyzeTriggered] = useState(false);

  const domainId = selectedDomainId!;

  const { data: quota, isLoading: quotaLoad } = useQuery<QuotaData>({
    queryKey: ["ai-quota", domainId],
    queryFn: () => aiApi.quota(domainId).then((r) => r.data),
    enabled: !!domainId,
    refetchInterval: analyzeTriggered ? 8000 : false,
  });

  const { data: report, isLoading: reportLoad } = useQuery<ReportData>({
    queryKey: ["ai-report", domainId],
    queryFn: () => aiApi.report(domainId).then((r) => r.data),
    enabled: !!domainId,
    refetchInterval: analyzeTriggered ? 8000 : false,
  });

  const { data: segments, isLoading: segLoad } = useQuery<Segment[]>({
    queryKey: ["ai-segments", domainId],
    queryFn: () => aiApi.segments(domainId).then((r) => r.data),
    enabled: !!domainId,
    refetchInterval: analyzeTriggered ? 8000 : false,
  });

  const { data: suggestions, isLoading: sugLoad } = useQuery<Suggestion[]>({
    queryKey: ["ai-suggestions", domainId],
    queryFn: () => aiApi.suggestions(domainId).then((r) => r.data),
    enabled: !!domainId,
    refetchInterval: analyzeTriggered ? 8000 : false,
  });

  const { data: tokenPacks } = useQuery<TokenPack[]>({
    queryKey: ["ai-token-packs"],
    queryFn: () => aiApi.tokenPacks().then((r) => r.data),
  });

  const analyzeMutation = useMutation({
    mutationFn: () => aiApi.analyze(domainId),
    onSuccess: () => {
      setAnalyzeTriggered(true);
      // stop polling after 3 minutes
      setTimeout(() => setAnalyzeTriggered(false), 3 * 60 * 1000);
      queryClient.invalidateQueries({ queryKey: ["ai-quota", domainId] });
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: (pack: "starter" | "growth" | "pro") =>
      aiApi.purchaseTokens(pack),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-quota", domainId] });
      setBuyOpen(false);
    },
  });

  const dismissMutation = useMutation({
    mutationFn: (id: number) => aiApi.dismissSuggestion(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["ai-suggestions", domainId] }),
  });

  const priorityColor = (p: string) => {
    if (p === "high") return "destructive";
    if (p === "medium") return "warning";
    return "secondary";
  };

  const hasReport =
    report &&
    (report.summary ||
      report.top_insight ||
      report.growth_opportunities?.length ||
      report.risk_areas?.length);

  // "What you'll get" preview — shown only before any report exists
  const WhatYouGet = !hasReport && !analyzeTriggered && (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-primary/5 rounded-xl border border-primary/15">
      {[
        { icon: BarChart2,     title: "Traffic Summary",       desc: "What's working and what's not, in plain English" },
        { icon: TrendingUp,    title: "Growth Opportunities",  desc: "Specific actions you can take to grow your traffic" },
        { icon: AlertTriangle, title: "Risk Areas",            desc: "Issues silently losing you visitors right now" },
      ].map((item) => (
        <div key={item.title} className="flex flex-col items-center text-center gap-2 py-2">
          <item.icon className="w-6 h-6 text-primary" />
          <p className="text-sm font-semibold text-on-surface">{item.title}</p>
          <p className="text-xs text-on-surface-variant leading-snug">{item.desc}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">
            AI Insights
          </h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            AI-powered audience segments, recommendations, and growth analysis
          </p>
          {quota?.last_analyzed_at && (
            <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last analyzed:{" "}
              {new Date(quota.last_analyzed_at).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {!quotaLoad && quota && (
            <TokenBadge quota={quota} onBuyClick={() => setBuyOpen(true)} />
          )}
          <AnalyzeButton
            quota={quota}
            isAnalyzing={analyzeMutation.isPending || analyzeTriggered}
            onAnalyze={() => analyzeMutation.mutate()}
            onBuyClick={() => setBuyOpen(true)}
          />
        </div>
      </div>

      {/* Error */}
      {analyzeMutation.isError && (
        <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {(analyzeMutation.error as any)?.response?.data?.message ??
            "Analysis failed. Please try again."}
        </div>
      )}

      {/* What you'll get — preview before first analysis */}
      {WhatYouGet}

      {/* Analysis in progress banner */}
      {analyzeTriggered && (
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary">
          <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
          AI is analyzing your data… results will appear shortly.
        </div>
      )}

      {/* AI Report */}
      {(reportLoad && analyzeTriggered) ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-surface-container rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : hasReport ? (
        <ReportSection report={report!} />
      ) : null}

      {/* Segments */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> Audience Segments
        </h2>
        {segLoad ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-28 bg-surface-container rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(segments ?? []).map((s) => (
              <Card
                key={s.id}
                className="hover:border-primary/30 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-bold text-on-surface">
                      {s.name}
                    </h3>
                    <Badge variant="secondary">
                      {s.visitor_count?.toLocaleString()} visitors
                    </Badge>
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-2">
                    {s.description}
                  </p>
                  {s.conversion_rate != null && (
                    <p className="text-xs text-primary mt-2 font-semibold">
                      {s.conversion_rate}% conv. rate
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
            {!segments?.length && (
              <p className="text-sm text-on-surface-variant col-span-3 py-8 text-center">
                No segments generated yet. Run an analysis to get started.
              </p>
            )}
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
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 bg-surface-container rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {(suggestions ?? []).map((s) => (
              <Card key={s.id}>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant={priorityColor(s.priority) as any}>
                        {s.priority}
                      </Badge>
                      {s.category && (
                        <Badge variant="outline" className="capitalize">{s.category}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {s.text}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.estimated_impact && (
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">
                        {s.estimated_impact}
                      </span>
                    )}
                    <button
                      onClick={() => dismissMutation.mutate(s.id)}
                      className="text-on-surface-variant/50 hover:text-on-surface transition-colors"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!suggestions?.length && (
              <p className="text-sm text-on-surface-variant py-8 text-center">
                No recommendations yet. Run an AI analysis to generate insights.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        open={buyOpen}
        packs={tokenPacks ?? quota?.token_packs ?? []}
        onClose={() => setBuyOpen(false)}
        onPurchase={(pack) => purchaseMutation.mutate(pack)}
        isPurchasing={purchaseMutation.isPending}
      />
    </div>
  );
}

export default function AiPage() {
  return <Content />;
}
