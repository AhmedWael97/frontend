"use client";

import { useQuery } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analyticsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Building2, Globe, Users } from "lucide-react";

const qc = new QueryClient();

function Content() {
  const { selectedDomainId } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["companies", selectedDomainId],
    queryFn: () => analyticsApi.companiesList(selectedDomainId!).then((r) => r.data),
    enabled: !!selectedDomainId,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Companies</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">IP-to-company intelligence — identify which businesses visit your site</p>
      </div>

      {data?.plan_required && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
          <Building2 className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="font-semibold text-on-surface mb-1">Pro Feature</p>
          <p className="text-sm text-on-surface-variant">Upgrade to Pro to unlock company identification via IP lookup.</p>
        </div>
      )}

      {!data?.plan_required && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    {["Company", "Industry", "Country", "Employees", "Visits", "Last Visit"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-outline-variant/10">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-container-high rounded animate-pulse w-24" /></td>
                        ))}
                      </tr>
                    ))
                  ) : (data?.data || []).map((c: any) => (
                    <tr key={c.id} className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center">
                            <Building2 className="w-3.5 h-3.5 text-secondary" />
                          </div>
                          <span className="font-medium text-on-surface">{c.name}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">{c.industry || "—"}</td>
                      <td className="px-4 py-3"><span className="flex items-center gap-1.5 text-on-surface-variant"><Globe className="w-3 h-3" />{c.country}</span></td>
                      <td className="px-4 py-3"><span className="flex items-center gap-1.5 text-on-surface-variant"><Users className="w-3 h-3" />{c.employee_range || "—"}</span></td>
                      <td className="px-4 py-3"><Badge variant="secondary">{c.visits}</Badge></td>
                      <td className="px-4 py-3 text-on-surface-variant text-xs">{c.last_visit || "—"}</td>
                    </tr>
                  ))}
                  {!isLoading && !data?.data?.length && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-on-surface-variant">No company data yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function CompaniesPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
