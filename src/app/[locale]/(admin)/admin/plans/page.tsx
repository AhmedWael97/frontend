"use client";

import { useQuery } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/api";
import { Check } from "lucide-react";

const qc = new QueryClient();

function Content() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: () => adminApi.listPlans().then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Plans</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Available subscription plans</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 bg-surface-container rounded-xl animate-pulse" />) : (plans || []).map((p: any) => (
          <Card key={p.id} className="relative">
            {p.is_popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-on-primary">Most Popular</span>
              </div>
            )}
            <CardContent className="p-6">
              <h3 className="text-lg font-black text-on-surface">{p.name}</h3>
              <div className="my-3">
                <span className="text-3xl font-black text-on-surface">${p.price}</span>
                <span className="text-on-surface-variant text-sm">/mo</span>
              </div>
              <p className="text-sm text-on-surface-variant mb-4">{p.description}</p>
              <ul className="space-y-2">
                {(p.features || []).map((f: string) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-outline-variant/10 flex justify-between text-xs text-on-surface-variant">
                <span>Active subs: <strong className="text-on-surface">{p.subscriptions_count || 0}</strong></span>
                <Badge variant={p.is_active ? "success" : "secondary"}>{p.is_active ? "Active" : "Inactive"}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AdminPlansPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
