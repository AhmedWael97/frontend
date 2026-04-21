"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const qc = new QueryClient();

function Content() {
  const router = useRouter();
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: () => adminApi.listUsers({ search }).then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Users</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">All registered accounts</p>
        </div>
        <div className="relative w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search users…" className="pl-9" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20">
                {["Name", "Email", "Role", "Plan", "Status", "Created"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-outline-variant/10">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-container-high rounded animate-pulse w-24" /></td>
                  ))}
                </tr>
              )) : (data?.data || []).map((u: any) => (
                <tr key={u.id} className="border-b border-outline-variant/10 hover:bg-surface-container/50 cursor-pointer transition-colors" onClick={() => router.push(`/${locale}/admin/users/${u.id}`)}>
                  <td className="px-4 py-3 font-medium text-on-surface">{u.name}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{u.email}</td>
                  <td className="px-4 py-3"><Badge variant={u.role === "admin" ? "warning" : "secondary"}>{u.role}</Badge></td>
                  <td className="px-4 py-3 text-on-surface-variant">{u.subscription?.plan?.name || "Free"}</td>
                  <td className="px-4 py-3"><Badge variant={u.email_verified_at ? "success" : "secondary"}>{u.email_verified_at ? "Verified" : "Unverified"}</Badge></td>
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.meta && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/20">
              <span className="text-xs text-on-surface-variant">Page {data.meta.current_page} of {data.meta.last_page} ({data.meta.total} users)</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-xs rounded-lg border border-outline-variant/30 disabled:opacity-40">Prev</button>
                <button disabled={page >= data.meta.last_page} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-xs rounded-lg border border-outline-variant/30 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminUsersPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
