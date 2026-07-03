"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const LABELS: Record<number, string> = { 1: "Bad", 2: "Weak", 3: "Good", 4: "Excellent" };

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4].map((s) => (
        <Star key={s} className={cn("w-4 h-4", s <= n ? "fill-amber-400 text-amber-400" : "text-outline-variant")} />
      ))}
    </span>
  );
}

export default function AdminFeedbackPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: () => adminApi.feedback().then((r) => r.data),
  });

  const items: any[] = data?.items ?? [];
  const stats = data?.stats;
  const maxBar = Math.max(1, ...Object.values(stats?.breakdown ?? {}).map((v) => Number(v)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">User Feedback</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Post-signup experience ratings and comments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-outline-variant/20 p-5">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant">Responses</p>
          <p className="text-3xl font-black text-on-surface mt-1">{stats?.total ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-outline-variant/20 p-5">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant">Avg rating</p>
          <p className="text-3xl font-black text-amber-400 mt-1 flex items-center gap-2">
            {stats?.avg_rating ?? "—"} <span className="text-sm text-on-surface-variant">/ 4</span>
          </p>
        </div>
        <div className="rounded-2xl border border-outline-variant/20 p-5">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">Breakdown</p>
          <div className="space-y-1">
            {[4, 3, 2, 1].map((r) => (
              <div key={r} className="flex items-center gap-2 text-xs">
                <span className="w-14 text-on-surface-variant">{LABELS[r]}</span>
                <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(Number(stats?.breakdown?.[r] ?? 0) / maxBar) * 100}%` }} />
                </div>
                <span className="w-6 text-end text-on-surface">{stats?.breakdown?.[r] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-outline-variant/20 divide-y divide-outline-variant/10">
        {isLoading && <div className="p-6 text-sm text-on-surface-variant">Loading…</div>}
        {!isLoading && items.length === 0 && <div className="p-8 text-center text-sm text-on-surface-variant">No feedback yet.</div>}
        {items.map((f) => (
          <div key={f.id} className="p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <Stars n={f.rating} />
                <span className="text-sm font-semibold text-on-surface">{LABELS[f.rating]}</span>
              </div>
              <span className="text-xs text-on-surface-variant">{f.created_at ? new Date(f.created_at).toLocaleString() : ""}</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              {f.user_name || "—"} · {f.user_email || "—"}
            </p>
            {f.comment && <p className="text-sm text-on-surface mt-2 whitespace-pre-wrap">{f.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
