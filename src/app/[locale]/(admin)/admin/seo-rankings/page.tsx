"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Search } from "lucide-react";

type Row = {
  id: number;
  domain_id: number;
  domain: string;
  keyword: string;
  latest_position: number | null;
  latest_date: string | null;
  latest_url: string | null;
  best_position: number | null;
  checks: number;
  tracked_since: string;
};

function positionBadge(pos: number | null) {
  if (pos === null) return <Badge variant="secondary">Not in top 100</Badge>;
  if (pos <= 3) return <Badge variant="success">#{pos}</Badge>;
  if (pos <= 10) return <Badge className="bg-amber-400/15 text-amber-500 border-amber-400/30">#{pos}</Badge>;
  return <Badge variant="secondary">#{pos}</Badge>;
}

function Content() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-seo-rankings"],
    queryFn: () => adminApi.listSeoRankings().then((r) => (r.data?.data ?? r.data) as { keywords: Row[] }),
  });

  const rows = data?.keywords ?? [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.domain.toLowerCase().includes(q) || r.keyword.toLowerCase().includes(q));
  }, [rows, search]);

  const ranked = rows.filter((r) => r.latest_position !== null).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">SEO Rankings</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Tracked keywords and real Google positions, across all domains</p>
        </div>
        {!isLoading && (
          <span className="text-sm text-on-surface-variant">
            {ranked}/{rows.length} ranked in top 100
          </span>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <Input
          placeholder="Search by domain or keyword…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[780px]">
            <thead>
              <tr className="border-b border-outline-variant/20">
                {["Domain", "Keyword", "Position", "Best Ever", "Checks", "Last Checked", "Tracked Since"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-outline-variant/10">
                    {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-container-high rounded animate-pulse w-24" /></td>)}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-on-surface-variant">
                  {rows.length === 0 ? "No keywords tracked yet — add some via Settings → SEO Rank Tracking on any domain." : "No matches."}
                </td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-outline-variant/10 hover:bg-surface-container/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-on-surface">{r.domain}</td>
                    <td className="px-4 py-3 text-on-surface">{r.keyword}</td>
                    <td className="px-4 py-3">{positionBadge(r.latest_position)}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{r.best_position ?? "—"}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{r.checks}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{r.latest_date ? formatDate(r.latest_date) : "—"}</td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(r.tracked_since)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminSeoRankingsPage() {
  return <Content />;
}
