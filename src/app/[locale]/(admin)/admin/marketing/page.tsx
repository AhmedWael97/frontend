"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { TrendingUp, Gift, Wrench } from "lucide-react";

interface FunnelStep { name: string; count: number; unique: number }
interface Referrer { name: string | null; email: string | null; count: number }
interface ToolRow { tool: string; c: number; hosts: number }
interface RecentLead { tool: string; checked_host: string | null; score: number | null; user_id: number | null; created_at: string }

const STEP_LABELS: Record<string, string> = {
  register_view: "Viewed register page",
  register_focus: "Focused a field",
  register_submit: "Submitted form",
  register_error: "Got an error",
  register_complete: "Completed (email)",
  google_one_tap_shown: "Saw Google One-Tap",
  google_one_tap_credential: "Completed (Google)",
};

export default function AdminMarketingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-marketing"],
    queryFn: () => adminApi.marketing().then((r) => r.data?.data ?? r.data),
  });

  const funnel = data?.funnel;
  const steps: FunnelStep[] = funnel?.steps ?? [];
  const maxCount = Math.max(1, ...steps.map((s) => s.unique));
  const tracked = funnel?.tracked_signups_30d ?? 0;
  const actual = funnel?.actual_signups_30d ?? 0;
  const trackingRate = actual > 0 ? Math.round((tracked / actual) * 100) : null;

  const referrals = data?.referrals;
  const topReferrers: Referrer[] = referrals?.top_referrers ?? [];

  const toolLeads = data?.tool_leads;
  const byTool: ToolRow[] = toolLeads?.by_tool ?? [];
  const recent: RecentLead[] = toolLeads?.recent ?? [];

  if (isLoading) return <div className="p-6 text-sm text-on-surface-variant">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Marketing</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Acquisition funnel, referrals, and free-tool leads — last 30 days</p>
      </div>

      {/* Funnel */}
      <div className="rounded-2xl border border-outline-variant/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-on-surface flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Signup funnel
          </h2>
          {trackingRate !== null && (
            <span className="text-xs text-on-surface-variant">
              Tracked {tracked} of {actual} real signups ({trackingRate}%)
            </span>
          )}
        </div>
        <div className="space-y-2">
          {steps.map((s) => (
            <div key={s.name} className="flex items-center gap-3">
              <span className="w-44 shrink-0 text-xs text-on-surface-variant">{STEP_LABELS[s.name] ?? s.name}</span>
              <div className="flex-1 h-6 rounded-lg bg-surface-container overflow-hidden">
                <div
                  className="h-full rounded-lg bg-primary/70 flex items-center px-2"
                  style={{ width: `${Math.max(4, (s.unique / maxCount) * 100)}%` }}
                >
                  <span className="text-[11px] font-bold text-on-primary">{s.unique}</span>
                </div>
              </div>
              <span className="w-16 shrink-0 text-end text-[11px] text-on-surface-variant">{s.count} evt</span>
            </div>
          ))}
          {steps.every((s) => s.count === 0) && (
            <p className="text-sm text-on-surface-variant py-4 text-center">No funnel events in the last 30 days.</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Referrals */}
        <div className="rounded-2xl border border-outline-variant/20 p-5">
          <h2 className="text-sm font-semibold text-on-surface flex items-center gap-2 mb-4">
            <Gift className="w-4 h-4" /> Referral program
          </h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <p className="text-2xl font-black text-on-surface">{referrals?.total ?? 0}</p>
              <p className="text-[11px] text-on-surface-variant">Total invites</p>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-500">{referrals?.rewarded ?? 0}</p>
              <p className="text-[11px] text-on-surface-variant">Rewarded</p>
            </div>
            <div>
              <p className="text-2xl font-black text-amber-500">{referrals?.pending ?? 0}</p>
              <p className="text-[11px] text-on-surface-variant">Pending</p>
            </div>
          </div>
          {topReferrers.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Top referrers</p>
              {topReferrers.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-on-surface truncate">{r.name || r.email}</span>
                  <span className="text-on-surface-variant">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Free-tool leads */}
        <div className="rounded-2xl border border-outline-variant/20 p-5">
          <h2 className="text-sm font-semibold text-on-surface flex items-center gap-2 mb-4">
            <Wrench className="w-4 h-4" /> Free-tool leads
          </h2>
          <div className="flex gap-4 mb-4">
            {byTool.map((t) => (
              <div key={t.tool}>
                <p className="text-xl font-black text-on-surface">{t.c}</p>
                <p className="text-[11px] text-on-surface-variant">{t.tool.replace("_", " ")} ({t.hosts} sites)</p>
              </div>
            ))}
            {byTool.length === 0 && <p className="text-sm text-on-surface-variant">No tool usage yet.</p>}
          </div>
          {recent.length > 0 && (
            <div className="space-y-1 max-h-56 overflow-y-auto">
              <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Recent checks (lead signal)</p>
              {recent.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-outline-variant/10 last:border-0">
                  <span className="truncate text-on-surface">{r.checked_host}</span>
                  <span className="text-on-surface-variant">{r.tool.replace("_checker", "").replace("_creator", "")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
