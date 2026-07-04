"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { ClipboardList, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpDialog } from "@/components/HelpDialog";

type Form = {
  form: string;
  starts: number;
  submits: number;
  abandons: number;
  completion_rate: number;
  fields: { field: string; reached: number }[];
  drop_points: { field: string; drops: number }[];
};

const PERIODS = [{ l: "7d", v: "7" }, { l: "30d", v: "30" }, { l: "90d", v: "90" }];

function shortForm(sel: string) {
  return sel.length > 40 ? "…" + sel.slice(-38) : sel || "(form)";
}

function FormCard({ f }: { f: Form }) {
  const maxReach = Math.max(1, ...f.fields.map((x) => x.reached));
  const worstDrop = f.drop_points[0];
  const rateColor = f.completion_rate >= 50 ? "text-emerald-400" : f.completion_rate >= 20 ? "text-amber-400" : "text-red-400";
  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <p className="font-mono text-xs text-on-surface-variant truncate">{shortForm(f.form)}</p>
            <div className="flex items-center gap-3 mt-1 text-sm">
              <span className="text-on-surface-variant">{f.starts} started</span>
              <span className="text-emerald-400">{f.submits} submitted</span>
              <span className="text-red-400">{f.abandons} abandoned</span>
            </div>
          </div>
          <div className="text-right">
            <p className={cn("text-2xl font-black leading-none", rateColor)}>{f.completion_rate}%</p>
            <p className="text-[11px] text-on-surface-variant">completion</p>
          </div>
        </div>

        {/* Field reach funnel */}
        {f.fields.length > 0 && (
          <div className="space-y-1.5">
            {f.fields.map((x) => (
              <div key={x.field} className="flex items-center gap-2 text-xs">
                <span className="w-28 truncate text-on-surface-variant font-mono">{x.field}</span>
                <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(x.reached / maxReach) * 100}%` }} />
                </div>
                <span className="w-10 text-end text-on-surface">{x.reached}</span>
              </div>
            ))}
          </div>
        )}

        {/* Where they quit */}
        {worstDrop && (
          <div className="flex items-start gap-2 rounded-lg bg-red-500/5 border border-red-500/15 px-3 py-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-on-surface-variant">
              Most quit at <span className="font-mono font-semibold text-red-400">{worstDrop.field}</span> ({worstDrop.drops} drop-offs).
              {f.drop_points.length > 1 && ` Then: ${f.drop_points.slice(1, 3).map((d) => `${d.field} (${d.drops})`).join(", ")}.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Content() {
  const { selectedDomainId } = useAuthStore();
  const [days, setDays] = useState("30");

  const { data, isLoading } = useQuery({
    queryKey: ["forms", selectedDomainId, days],
    queryFn: () => analyticsApi.forms(selectedDomainId!, { days: Number(days) }).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  const forms: Form[] = data?.forms || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2"><ClipboardList className="w-6 h-6 text-primary" /> Form Analytics</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Which field makes people abandon your forms — tracked automatically, no code.</p>
        </div>
        <div className="flex items-center gap-2">
          <HelpDialog title="Form Analytics">
            <p>EYE watches every <strong>&lt;form&gt;</strong> on your site automatically — no setup. For each form it records which fields visitors focus, whether they submit, and the <strong>last field they touched before leaving</strong>.</p>
            <div>
              <p className="font-semibold text-on-surface mb-1">How to read it</p>
              <ul className="list-disc ms-5 space-y-1">
                <li><strong>Completion %</strong> — submitted ÷ started. Low = the form leaks.</li>
                <li><strong>Field bars</strong> — how many reached each field. A sharp drop between two fields = that field scares people off.</li>
                <li><strong>“Most quit at …”</strong> — the exact field where abandonment happens. Fix that field first (simplify it, make it optional, explain why you ask).</li>
              </ul>
            </div>
            <p>No field <strong>values</strong> are ever captured — only field names and interaction counts.</p>
          </HelpDialog>
          {PERIODS.map((p) => (
            <button key={p.v} onClick={() => setDays(p.v)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", days === p.v ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:text-on-surface")}>{p.l}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 bg-surface-container-high rounded-xl animate-pulse" />)}</div>
      ) : forms.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-on-surface-variant">No form activity yet. Once visitors interact with a form on your site, it appears here automatically.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {forms.map((f) => <FormCard key={f.form} f={f} />)}
        </div>
      )}
    </div>
  );
}

export default function FormsPage() {
  return <Content />;
}
