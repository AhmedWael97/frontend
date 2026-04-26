"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { uxApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Smile, Meh, Frown, AlertTriangle, CheckCircle, CircleHelp } from "lucide-react";

type IssueExplanation = {
  label: string;
  severity: "high" | "medium" | "low";
  meaning: string;
  why: string;
  action: string;
};

const ISSUE_EXPLANATIONS: Record<string, IssueExplanation> = {
  dead_click: {
    label: "Dead Click",
    severity: "medium",
    meaning: "Visitors click something that looks interactive, but nothing happens.",
    why: "The element may be styled like a button/link, covered by another layer, or missing a click handler.",
    action: "Check the clicked element on this page, confirm it is actually clickable, and test it on mobile and desktop.",
  },
  rage_click: {
    label: "Rage Click",
    severity: "high",
    meaning: "Visitors click repeatedly in a short time because they are frustrated.",
    why: "A feature may be slow, broken, or unclear, so people keep trying the same action.",
    action: "Inspect the page section receiving repeated clicks and improve feedback, loading state, or reliability.",
  },
  form_abandon: {
    label: "Form Abandonment",
    severity: "medium",
    meaning: "Visitors start a form but leave before submitting.",
    why: "The form may be too long, confusing, asking for too much, or failing validation silently.",
    action: "Simplify fields, make errors clear, and reduce required inputs where possible.",
  },
  broken_link: {
    label: "Broken Link",
    severity: "high",
    meaning: "Visitors reached a link or route that does not work correctly.",
    why: "The destination URL may be invalid, removed, blocked, or misconfigured.",
    action: "Fix or remove broken links and add redirects for moved pages.",
  },
  js_error: {
    label: "JavaScript Error",
    severity: "high",
    meaning: "A browser error stopped part of the page from working.",
    why: "Code exceptions, undefined values, or third-party script failures can break user interactions.",
    action: "Review error patterns for this page and fix the failing component first.",
  },
  scroll_depth: {
    label: "Scroll Depth",
    severity: "low",
    meaning: "How far down a page visitors usually scroll.",
    why: "Low depth can mean the content above the fold is enough, or users lose interest early.",
    action: "Move key information and call-to-action higher on the page and test section order.",
  },
  time_on_page: {
    label: "Time on Page",
    severity: "low",
    meaning: "How long visitors stay on a page before leaving.",
    why: "Very short time can mean mismatch or confusion; very long time can mean users are stuck.",
    action: "Compare page intent vs user behavior and improve clarity, next steps, and page speed.",
  },
  click: {
    label: "Interaction Pattern",
    severity: "low",
    meaning: "A repeated click interaction pattern was detected.",
    why: "Visitors are engaging with a specific element frequently.",
    action: "Review if this interaction supports your business goal and make it easier if important.",
  },
};

function parseIssueDetails(raw: unknown): Record<string, unknown> {
  if (raw == null) {
    return {};
  }

  if (typeof raw === "object") {
    return raw as Record<string, unknown>;
  }

  const text = String(raw).trim();
  if (!text || text === "[]" || text === "{}") {
    return {};
  }

  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Ignore parse errors and fall back to empty details.
  }

  return {};
}

function pickFirstText(details: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = details[key];
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

function pickFirstNumber(details: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = details[key];
    if (value == null) continue;
    const num = Number(value);
    if (!Number.isNaN(num)) return num;
  }
  return null;
}

function toReadableIssue(row: any, idx: number) {
  const type = String(row.type ?? "issue");
  const info = ISSUE_EXPLANATIONS[type] ?? {
    label: type.replaceAll("_", " "),
    severity: "low" as const,
    meaning: "A UX signal was detected on this page.",
    why: "The system recorded unusual behavior for this interaction.",
    action: "Review this page and test the related interaction manually.",
  };

  const details = parseIssueDetails(row.details);
  const selector = String(
    row.element_selector ??
      pickFirstText(details, ["el", "selector", "element_selector", "target", "form", "xpath", "xp"])
  ).trim();
  const tag = pickFirstText(details, ["tg", "tag"]);
  const id = pickFirstText(details, ["id", "element_id", "target_id"]);
  const cls = pickFirstText(details, ["cl", "class", "classes", "className"]);
  const text = pickFirstText(details, ["tx", "text", "label", "innerText"]);
  const aria = pickFirstText(details, ["ar", "aria", "aria_label", "ariaLabel"]);
  const role = pickFirstText(details, ["rl", "role"]);
  const href = pickFirstText(details, ["hr", "href"]);
  const name = pickFirstText(details, ["nm", "name"]);
  const inputType = pickFirstText(details, ["tp", "input_type", "type"]);
  const xpath = pickFirstText(details, ["xp", "xpath"]);
  const x = pickFirstNumber(details, ["x", "clientX", "pageX"]);
  const y = pickFirstNumber(details, ["y", "clientY", "pageY"]);
  const page = String(row.url ?? "").trim() || "Unknown page";
  const pageUrl = /^https?:\/\//i.test(page) ? page : "";
  const occurrences = Number(row.occurrences ?? 0);
  const affectedVisitors = Number(row.affected_visitors ?? 0);
  const lastSeen = row.last_seen ? new Date(row.last_seen).toLocaleString() : "Unknown time";

  const metrics: string[] = [];
  if (typeof details.depth === "number") metrics.push(`avg scroll: ${Math.round(Number(details.depth))}%`);
  if (typeof details.duration === "number") metrics.push(`avg time: ${Math.round(Number(details.duration))}s`);
  if (typeof details.ms === "number") metrics.push(`value: ${Math.round(Number(details.ms))} ms`);

  const targetBits: string[] = [];
  if (tag) targetBits.push(`tag=${tag}`);
  if (id) targetBits.push(`#${id}`);
  if (name) targetBits.push(`name=${name}`);
  if (inputType) targetBits.push(`type=${inputType}`);
  if (role) targetBits.push(`role=${role}`);
  if (aria) targetBits.push(`aria=\"${aria}\"`);
  if (text) targetBits.push(`text=\"${text}\"`);
  if (cls) targetBits.push(`class=\"${cls}\"`);
  if (href) targetBits.push(`href=${href}`);
  if (xpath) targetBits.push(`xpath=${xpath}`);
  if (x !== null && y !== null) targetBits.push(`x=${Math.round(x)}, y=${Math.round(y)}`);

  // For JS errors, build a summary from the error message and source location
  if (type === "js_error" && targetBits.length === 0) {
    const errMsg = pickFirstText(details, ["msg", "message"]);
    const errSrc = pickFirstText(details, ["src", "source", "file"]);
    const errLn = pickFirstNumber(details, ["ln", "line"]);
    if (errMsg) targetBits.push(`"${errMsg.slice(0, 120)}"`);
    if (errSrc) {
      const shortSrc = errSrc.split("/").pop() || errSrc;
      targetBits.push(`at ${shortSrc}${errLn !== null ? `:${errLn}` : ""}`);
    }
  }

  const targetSummary = targetBits.join(" | ");

  return {
    id: `${type}-${idx}`,
    type,
    severity: info.severity,
    title: info.label,
    meaning: info.meaning,
    why: info.why,
    action: info.action,
    page,
    pageUrl,
    selector,
    targetSummary,
    metrics: metrics.join(" | "),
    occurrences,
    affectedVisitors,
    lastSeen,
  };
}

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

function averageScores(values: Array<number | null | undefined>) {
  const valid = values.filter((value): value is number => typeof value === "number" && !Number.isNaN(value));
  if (!valid.length) return 0;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function Content() {
  const { selectedDomainId } = useAuthStore();

  const { data: scores } = useQuery({
    queryKey: ["ux-scores", selectedDomainId],
    queryFn: () => uxApi.score(selectedDomainId!).then((r) => r.data ?? {}),
    enabled: !!selectedDomainId,
  });

  const { data: issues } = useQuery({
    queryKey: ["ux-issues", selectedDomainId],
    queryFn: () => uxApi.issues(selectedDomainId!).then((r) => {
      const d = r.data;
      const rows = Array.isArray(d) ? d : (d?.data ?? []);
      return rows.map((row: any, idx: number) => toReadableIssue(row, idx));
    }),
    enabled: !!selectedDomainId,
  });

  const normalizedScores = useMemo(() => {
    const breakdown = scores?.breakdown ?? scores ?? {};
    const errorScore = Number(breakdown.error_rate ?? 0);
    const rageScore = Number(breakdown.rage_click_rate ?? 0);
    const formScore = Number(breakdown.form_abandon ?? 0);
    const avgSessionScore = Number(breakdown.avg_session ?? 0);
    const bounceScore = Number(breakdown.bounce_rate ?? 0);

    return {
      overall: scores?.score ?? breakdown.overall ?? 0,
      // Reliability + page flow quality
      performance: breakdown.performance ?? averageScores([errorScore, bounceScore]),
      // Are users staying and moving through the experience?
      engagement: breakdown.engagement ?? averageScores([avgSessionScore, bounceScore]),
      // Do users feel friction or frustration?
      satisfaction: breakdown.satisfaction ?? averageScores([rageScore, formScore]),
    };
  }, [scores]);

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
          { key: "overall", label: "Overall", help: "Combined UX health score" },
          { key: "performance", label: "Performance", help: "Based on errors and bounce rate" },
          { key: "engagement", label: "Engagement", help: "Based on session quality and retention" },
          { key: "satisfaction", label: "Satisfaction", help: "Based on frustration and form completion" },
        ].map((m) => (
          <Card key={m.key}>
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{m.label}</p>
              <ScoreGauge score={normalizedScores?.[m.key as keyof typeof normalizedScores] ?? 0} />
              <p className="text-[11px] text-center text-on-surface-variant">{m.help}</p>
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
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              <p className="text-sm">No UX issues detected. Keep it up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(issues || []).map((issue: any) => (
                <div key={issue.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-surface-container transition-colors">
                  <Badge variant={severityVariant(issue.severity) as any} className="mt-0.5 shrink-0">{issue.severity}</Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-on-surface">{issue.title}</p>
                      <div className="relative group">
                        <button
                          type="button"
                          className="text-on-surface-variant hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
                          aria-label={`About ${issue.title}`}
                        >
                          <CircleHelp className="w-3.5 h-3.5" />
                        </button>
                        <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-80 -translate-x-1/2 rounded-lg border border-outline-variant/30 bg-surface-container p-3 text-[11px] text-on-surface shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                          <p><span className="font-semibold">What it means:</span> {issue.meaning}</p>
                          <p className="mt-1"><span className="font-semibold">Likely reason:</span> {issue.why}</p>
                          <p className="mt-1"><span className="font-semibold">What to do:</span> {issue.action}</p>
                        </div>
                      </div>
                    </div>
                    {issue.pageUrl ? (
                      <a
                        href={issue.pageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary mt-2 font-medium inline-block underline underline-offset-2"
                      >
                        {issue.page}
                      </a>
                    ) : (
                      <p className="text-xs text-primary mt-2 font-medium">{issue.page}</p>
                    )}
                    {issue.selector && (
                      <p className="text-[11px] text-on-surface-variant mt-1">Element selector: {issue.selector}</p>
                    )}
                    {issue.targetSummary && (
                      <p className="text-[11px] text-on-surface-variant mt-1">
                        {issue.type === "js_error" ? "Error: " : "Where user clicked: "}
                        {issue.targetSummary}
                      </p>
                    )}
                    {!issue.selector && !issue.targetSummary && issue.type !== "js_error" && (
                      <p className="text-[11px] text-on-surface-variant/50 mt-1 italic">Click coordinates not captured — event predates tracker update</p>
                    )}
                    {(issue.metrics || issue.occurrences || issue.lastSeen) && (
                      <p className="text-[11px] text-on-surface-variant mt-1">
                        {issue.metrics ? `${issue.metrics} | ` : ""}
                        events: {issue.occurrences?.toLocaleString?.() ?? issue.occurrences} | last seen: {issue.lastSeen}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-on-surface-variant shrink-0">{issue.affectedVisitors?.toLocaleString()} visitors</span>
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
  return <Content />;
}
