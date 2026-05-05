"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api";
import { toast } from "@/lib/use-toast";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Globe, Trash2, Search, BarChart2, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/auth";

function Content() {
  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { setToken, setUser, setImpersonating } = useAuthStore();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-domains", page, search],
    queryFn: () => adminApi.listDomains({ search: search || undefined, page } as any).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteDomain(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-domains"] }); toast.success("Domain deleted"); },
    onError: (e: any) => toast.error(e.message),
  });

  // Impersonate user then navigate to dashboard (where they see their domains/analytics)
  const impersonateMutation = useMutation({
    mutationFn: (userId: number) => adminApi.impersonateUser(userId),
    onSuccess: (res) => {
      const adminToken = localStorage.getItem("eye_token");
      if (adminToken) localStorage.setItem("eye_token_admin_backup", adminToken);
      setToken(res.data.token);
      setUser(null);
      setImpersonating(true);
      router.push(`/${locale}/dashboard`);
    },
    onError: (e: any) => toast.error(e.message || "Could not impersonate user"),
  });

  const domains = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Domains</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">All tracked domains across all accounts</p>
        </div>
        {meta && <span className="text-sm text-on-surface-variant">{meta.total} total domains</span>}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <Input
          placeholder="Search by domain or owner emailâ€¦"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[780px]">
            <thead>
              <tr className="border-b border-outline-variant/20">
                {["Domain", "Owner", "Status", "Events (30d)", "Created", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-outline-variant/10">
                    {Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-container-high rounded animate-pulse w-24" /></td>)}
                  </tr>
                ))
                : domains.map((d: any) => (
                  <tr key={d.id} className="border-b border-outline-variant/10 hover:bg-surface-container/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-medium text-on-surface">{d.domain}</span>
                      </span>
                      {d.name && d.name !== d.domain && (
                        <p className="text-xs text-on-surface-variant pl-5">{d.name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {d.user ? (
                        <button
                          onClick={() => router.push(`/${locale}/admin/users/${d.user.id}`)}
                          className="text-sm text-on-surface hover:text-primary transition-colors font-medium"
                        >
                          {d.user.name || d.user.email}
                          <p className="text-xs text-on-surface-variant font-normal">{d.user.email}</p>
                        </button>
                      ) : "â€”"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={d.active ? "success" : "secondary"}>{d.active ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {d.events_30d != null ? d.events_30d.toLocaleString() : "â€”"}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(d.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* View Analytics â€” impersonate the owner then go to dashboard */}
                        {d.user && (
                          <button
                            title="View analytics as domain owner"
                            onClick={() => impersonateMutation.mutate(d.user.id)}
                            disabled={impersonateMutation.isPending}
                            className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
                          >
                            <BarChart2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Open domain in new tab */}
                        <a
                          href={`https://${d.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open domain"
                          className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        {/* Delete */}
                        <button
                          title="Delete domain"
                          onClick={() => { if (confirm(`Delete domain "${d.domain}"? All tracking data will be lost.`)) deleteMutation.mutate(d.id); }}
                          className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-error transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-on-surface-variant">
          <span>{meta.total} total domains</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg hover:bg-surface-container-high disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {page} of {meta.last_page}</span>
            <button
              onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
              disabled={page >= meta.last_page}
              className="p-1.5 rounded-lg hover:bg-surface-container-high disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDomainsPage() {
  return <Content />;
}

