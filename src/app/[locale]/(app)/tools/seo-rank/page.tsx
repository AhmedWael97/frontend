"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { SearchCheck, Plus, Trash2, Upload, ArrowUp, ArrowDown, Minus } from "lucide-react";

type Hist = { date: string; position: number | null };
type KeywordRow = {
  id: number; keyword: string; latest_position: number | null; latest_date: string | null;
  latest_url: string | null; change: number | null; best_position: number | null; history: Hist[];
};

const CSV_TEMPLATE = "date,keyword,position,url\n2026-06-01,running shoes,7,https://example.com/shoes";

function Sparkline({ history }: { history: Hist[] }) {
  const pts = history.filter((h) => h.position != null).map((h) => h.position as number);
  if (pts.length < 2) return <span className="text-on-surface-variant text-xs">—</span>;
  const max = Math.max(...pts), min = Math.min(...pts);
  const range = max - min || 1;
  const w = 90, h = 24;
  // Lower position = better → invert Y so "up" = better rank.
  const d = pts.map((p, i) => `${(i / (pts.length - 1)) * w},${((p - min) / range) * h}`).join(" ");
  return <svg width={w} height={h} className="overflow-visible"><polyline points={d} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" /></svg>;
}

function Content() {
  const { selectedDomainId } = useAuthStore();
  const qc = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [csv, setCsv] = useState("");
  const [showImport, setShowImport] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["seo-rank", selectedDomainId],
    queryFn: () => analyticsApi.seoRank(selectedDomainId!).then((r) => r.data?.data ?? r.data),
    enabled: !!selectedDomainId,
  });
  const rows: KeywordRow[] = data?.keywords ?? [];

  const invalidate = () => qc.invalidateQueries({ queryKey: ["seo-rank", selectedDomainId] });
  const addMut = useMutation({ mutationFn: () => analyticsApi.seoRankAddKeyword(selectedDomainId!, keyword.trim()), onSuccess: () => { setKeyword(""); invalidate(); } });
  const importMut = useMutation({
    mutationFn: () => analyticsApi.seoRankImport(selectedDomainId!, csv),
    onSuccess: (r) => { const d = r.data?.data ?? r.data; setCsv(""); setShowImport(false); invalidate(); window.alert(`Imported ${d?.imported ?? 0} rows${d?.skipped ? `, skipped ${d.skipped}` : ""}.`); },
  });
  const delMut = useMutation({ mutationFn: (id: number) => analyticsApi.seoRankDeleteKeyword(selectedDomainId!, id), onSuccess: invalidate });

  if (!selectedDomainId) return <div className="flex items-center justify-center h-64"><p className="text-on-surface-variant">Select a domain to track rankings.</p></div>;
  const td = "px-3 py-2.5 text-sm text-on-surface";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2"><SearchCheck className="w-6 h-6 text-primary" /> SEO Rank Tracking</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Track keyword positions over time. Import from your rank tool (CSV) or enter manually.</p>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-2 sm:items-center">
          <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Track a keyword, e.g. running shoes" className="flex-1" onKeyDown={(e) => e.key === "Enter" && keyword.trim() && addMut.mutate()} />
          <Button onClick={() => addMut.mutate()} disabled={!keyword.trim() || addMut.isPending} className="gap-1.5"><Plus className="w-4 h-4" /> Track keyword</Button>
          <Button variant="outline" onClick={() => setShowImport((v) => !v)} className="gap-1.5"><Upload className="w-4 h-4" /> Import CSV</Button>
        </CardContent>
        {showImport && (
          <CardContent className="pt-0 space-y-2">
            <p className="text-xs text-on-surface-variant">CSV header: <code>date,keyword,position,url</code> (url optional).</p>
            <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={5} placeholder={CSV_TEMPLATE} className="w-full rounded-lg border border-outline-variant/40 bg-surface text-sm text-on-surface p-3 font-mono focus:outline-none focus:ring-2 focus:ring-primary/40" />
            <Button onClick={() => importMut.mutate()} disabled={!csv.trim() || importMut.isPending} className="gap-1.5"><Upload className="w-4 h-4" /> Import</Button>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-on-surface">Tracked keywords</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead><tr className="border-b border-outline-variant/20 text-xs uppercase tracking-widest text-on-surface-variant">
                <th className="px-3 py-2.5 text-left">Keyword</th><th className="px-3 py-2.5 text-right">Position</th><th className="px-3 py-2.5 text-right">Change</th><th className="px-3 py-2.5 text-right">Best</th><th className="px-3 py-2.5 text-left">Trend</th><th className="px-3 py-2.5 w-8"></th>
              </tr></thead>
              <tbody>
                {isLoading ? Array.from({ length: 4 }).map((_, i) => (<tr key={i} className="border-b border-outline-variant/10">{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-3 py-2.5"><div className="h-4 bg-surface-container-high rounded animate-pulse w-16" /></td>)}</tr>))
                  : rows.map((r) => (
                    <tr key={r.id} className="border-b border-outline-variant/10">
                      <td className={td + " font-medium"}>{r.keyword}</td>
                      <td className={td + " text-right tabular-nums font-semibold"}>{r.latest_position ?? "—"}</td>
                      <td className={td + " text-right tabular-nums"}>
                        {r.change == null || r.change === 0 ? <span className="text-on-surface-variant inline-flex items-center gap-0.5"><Minus className="w-3 h-3" /></span>
                          : r.change > 0 ? <span className="text-emerald-400 inline-flex items-center gap-0.5"><ArrowUp className="w-3 h-3" />{r.change}</span>
                          : <span className="text-rose-400 inline-flex items-center gap-0.5"><ArrowDown className="w-3 h-3" />{Math.abs(r.change)}</span>}
                      </td>
                      <td className={td + " text-right tabular-nums text-on-surface-variant"}>{r.best_position ?? "—"}</td>
                      <td className={td}><Sparkline history={r.history} /></td>
                      <td className="px-3 py-2.5 text-right"><button onClick={() => delMut.mutate(r.id)} className="text-on-surface-variant hover:text-rose-400" aria-label="Untrack"><Trash2 className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  ))}
                {!isLoading && rows.length === 0 && <tr><td colSpan={6} className="px-3 py-10 text-center text-on-surface-variant text-sm">No keywords tracked yet — add one above.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SeoRankPage() {
  return <Content />;
}
