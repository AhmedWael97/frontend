"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";

type QuizItem = {
  id: number;
  visitor_id: string | null;
  completed: boolean;
  step_reached: number;
  role: string | null;
  sites_managed: number | null;
  languages: string[] | null;
  features: string[] | null;
  domains: { domain: string; seo_score?: number; speed_score?: number; pages_found?: number }[] | null;
  plan_assigned: string | null;
  user_name: string | null;
  user_email: string | null;
  created_at: string;
};

const TOTAL_STEPS = 6;

function Chips({ items }: { items: string[] | null }) {
  if (!items || items.length === 0) return <span className="text-on-surface-variant/50">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((i) => (
        <span key={i} className="rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] font-medium text-on-surface-variant">{i}</span>
      ))}
    </div>
  );
}

export default function AdminOnboardingQuizPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-onboarding-quiz"],
    queryFn: () => adminApi.onboardingQuiz().then((r) => r.data?.data ?? r.data),
  });

  const items: QuizItem[] = data?.items ?? [];
  const topFeatures: Record<string, number> = data?.top_features ?? {};
  const completedCount = items.filter((r) => r.completed).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Get Started — Questionnaire</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Every "get started" wizard attempt — completed or abandoned</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-outline-variant/20 p-5">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant">Started</p>
          <p className="text-3xl font-black text-on-surface mt-1">{data?.total ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-outline-variant/20 p-5">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant">Completed</p>
          <p className="text-3xl font-black text-emerald-500 mt-1">{completedCount} <span className="text-sm text-on-surface-variant font-medium">/ {data?.total ?? 0}</span></p>
        </div>
        <div className="rounded-2xl border border-outline-variant/20 p-5">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">Most-wanted features</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(topFeatures).map(([f, c]) => (
              <span key={f} className="rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 text-xs font-semibold">{f} ({c})</span>
            ))}
            {Object.keys(topFeatures).length === 0 && <span className="text-sm text-on-surface-variant">—</span>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant/20 divide-y divide-outline-variant/10">
        {isLoading && <div className="p-6 text-sm text-on-surface-variant">Loading…</div>}
        {!isLoading && items.length === 0 && <div className="p-8 text-center text-sm text-on-surface-variant">No responses yet.</div>}
        {items.map((r) => (
          <div key={r.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-on-surface">{r.user_name || (r.visitor_id ? `Anonymous (${r.visitor_id.slice(0, 10)}…)` : "—")}</span>
                <span className="text-xs text-on-surface-variant">{r.user_email || "—"}</span>
                {r.role && <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant capitalize">{r.role.replace("_", " ")}</span>}
                {r.completed ? (
                  <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[11px] font-semibold">Completed</span>
                ) : (
                  <span className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-[11px] font-semibold">Abandoned — step {r.step_reached}/{TOTAL_STEPS}</span>
                )}
                {r.plan_assigned && <span className="rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 text-[11px] font-semibold">{r.plan_assigned}</span>}
              </div>
              <span className="text-xs text-on-surface-variant">{new Date(r.created_at).toLocaleString()}</span>
            </div>
            <p className="text-xs text-on-surface-variant">{r.sites_managed != null ? `Manages ${r.sites_managed} site(s)` : "—"}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div><p className="text-on-surface-variant/70 mb-1">Languages</p><Chips items={r.languages} /></div>
              <div><p className="text-on-surface-variant/70 mb-1">Interested in</p><Chips items={r.features} /></div>
              <div>
                <p className="text-on-surface-variant/70 mb-1">Domains</p>
                <div className="flex flex-wrap gap-1">
                  {(r.domains ?? []).map((d) => (
                    <span key={d.domain} className="rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] font-mono text-on-surface-variant">
                      {d.domain}{d.seo_score != null ? ` · SEO ${d.seo_score}` : ""}{d.speed_score != null ? ` · Spd ${d.speed_score}` : ""}
                    </span>
                  ))}
                  {(!r.domains || r.domains.length === 0) && <span className="text-on-surface-variant/50">—</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
