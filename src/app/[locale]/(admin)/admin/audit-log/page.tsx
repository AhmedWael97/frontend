"use client";

import { useQuery } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { User, Globe, Key, ShieldCheck } from "lucide-react";

const qc = new QueryClient();

const EVENT_ICONS: Record<string, React.ElementType> = {
  login: Key,
  register: User,
  domain_created: Globe,
  "2fa_enabled": ShieldCheck,
};

function Content() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit"],
    queryFn: () => adminApi.auditLog().then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Audit Log</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Security and activity events</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-outline-variant/10">
            {isLoading ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="px-4 py-3 flex gap-3">
                <div className="w-8 h-8 bg-surface-container-high rounded-lg animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-surface-container-high rounded animate-pulse w-48" />
                  <div className="h-3 bg-surface-container-high rounded animate-pulse w-32" />
                </div>
              </div>
            )) : (data?.data || []).map((e: any) => {
              const Icon = EVENT_ICONS[e.event] || Key;
              return (
                <div key={e.id} className="px-4 py-3 flex items-start gap-3 hover:bg-surface-container/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-on-surface-variant" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-on-surface">
                      <span className="font-semibold">{e.user?.name || e.user?.email || "System"}</span>
                      {" "}<span className="text-on-surface-variant">{e.description || e.event}</span>
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{e.ip_address} · {e.user_agent?.slice(0, 60)}</p>
                  </div>
                  <span className="text-xs text-on-surface-variant shrink-0">{formatDate(e.created_at)}</span>
                </div>
              );
            })}
            {!isLoading && !data?.data?.length && (
              <div className="px-4 py-10 text-center text-on-surface-variant text-sm">No audit events found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminAuditLogPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
