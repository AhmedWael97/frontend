"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, X, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { onboardingApi } from "@/lib/api";

// Backend step → frontend step id mapping
const BACKEND_TO_FRONTEND: Record<string, string> = {
  domain_added: "domain",
  script_installed: "first_visitor",
  first_event_received: "first_visitor",
  funnel_created: "funnel",
};

const STEPS = [
  {
    id: "domain",
    label: "Connect your website",
    desc: "Add your domain and paste the tracking snippet",
    href: "/settings/domains",
    cta: "Add domain →",
  },
  {
    id: "first_visitor",
    label: "See your first visitor",
    desc: "Once the snippet is on your site, data starts flowing",
    href: "/dashboard/realtime",
    cta: "Go live →",
  },
  {
    id: "heatmap",
    label: "View a click map",
    desc: "Discover where visitors click and what they ignore",
    href: "/dashboard/heatmaps",
    cta: "Open click maps →",
  },
  {
    id: "ai",
    label: "Run your first AI analysis",
    desc: "Get a plain-English growth report for your site",
    href: "/dashboard/ai",
    cta: "Try AI Insights →",
  },
  {
    id: "funnel",
    label: "Build a conversion funnel",
    desc: "See exactly where visitors drop off before converting",
    href: "/dashboard/funnels",
    cta: "Create funnel →",
  },
];

interface Props {
  domainId: string | null;
  /** Called when the component should be hidden */
  onDismiss?: () => void;
}

export default function WelcomeChecklist({ domainId, onDismiss }: Props) {
  const locale = useLocale();
  const storageKey = `eye_checklist_${domainId ?? "no_domain"}`;

  const [done, setDone] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Fetch backend onboarding status
  const { data: backendStatus } = useQuery({
    queryKey: ["onboarding"],
    queryFn: () => onboardingApi.show().then((r) => r.data?.data ?? r.data),
    staleTime: 30_000,
  });

  // Load persisted progress
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setDone(new Set(JSON.parse(saved) as string[]));
    } catch {}
  }, [storageKey]);

  // Merge backend flags into local done set
  useEffect(() => {
    if (!backendStatus) return;
    const extra: string[] = [];
    for (const [backendKey, frontendId] of Object.entries(BACKEND_TO_FRONTEND)) {
      if (backendStatus[backendKey]) extra.push(frontendId);
    }
    if (extra.length === 0) return;
    setDone((prev) => {
      const next = new Set(prev);
      extra.forEach((id) => next.add(id));
      try { localStorage.setItem(storageKey, JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  }, [backendStatus, storageKey]);

  // Auto-mark "domain" step if a domain is selected
  useEffect(() => {
    if (domainId) markDone("domain");
  }, [domainId]); // eslint-disable-line react-hooks/exhaustive-deps

  const markDone = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev).add(id);
      try { localStorage.setItem(storageKey, JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  };

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(`${storageKey}_dismissed`, "1"); } catch {}
    onDismiss?.();
  };

  // Already dismissed this session
  useEffect(() => {
    try {
      if (localStorage.getItem(`${storageKey}_dismissed`)) setDismissed(true);
    } catch {}
  }, [storageKey]);

  const doneCount = done.size;
  const total = STEPS.length;
  const allDone = doneCount >= total;

  // Hide once all done or manually dismissed
  if (dismissed || allDone) return null;

  const pct = Math.round((doneCount / total) * 100);

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-bold text-on-surface">Getting started</p>
            <span className="text-xs text-on-surface-variant font-semibold">{doneCount}/{total} done</span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden w-full">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded"
          aria-label={collapsed ? "Expand checklist" : "Collapse checklist"}
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
        {/* Allow dismiss only after at least 3 steps done */}
        {doneCount >= 3 && (
          <button
            onClick={handleDismiss}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded"
            aria-label="Dismiss checklist"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Step list */}
      {!collapsed && (
        <div className="border-t border-primary/10">
          {STEPS.map((step) => {
            const isDone = done.has(step.id);
            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 border-b border-primary/10 last:border-0 transition-colors",
                  isDone ? "opacity-50" : "hover:bg-primary/5"
                )}
              >
                <button
                  onClick={() => markDone(step.id)}
                  className="shrink-0 text-primary hover:scale-110 transition-transform"
                  aria-label={isDone ? "Completed" : "Mark as done"}
                >
                  {isDone
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    : <Circle className="w-5 h-5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-semibold", isDone ? "line-through text-on-surface-variant" : "text-on-surface")}>
                    {step.label}
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">{step.desc}</p>
                </div>
                {!isDone && (
                  <Link
                    href={`/${locale}${step.href}`}
                    className="text-xs text-primary font-semibold whitespace-nowrap hover:underline shrink-0"
                  >
                    {step.cta}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
