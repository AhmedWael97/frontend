"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

function Content() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: () => adminApi.listPayments().then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Payments</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">All payment transactions</p>
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-outline-variant/20">
                {["Date", "User", "Amount", "Status", "Gateway ID"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-outline-variant/10">
                  {Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-container-high rounded animate-pulse w-20" /></td>)}
                </tr>
              )) : (data?.data || []).map((p: any) => (
                <tr key={p.id} className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3 text-on-surface">{p.user?.name || p.user?.email}</td>
                  <td className="px-4 py-3 font-semibold text-on-surface">${(p.amount / 100).toFixed(2)}</td>
                  <td className="px-4 py-3"><Badge variant={p.status === "paid" ? "success" : p.status === "refunded" ? "warning" : "error"}>{p.status}</Badge></td>
                  <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{p.gateway_payment_id || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPaymentsPage() {
  return <Content />;
}
