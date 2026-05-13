"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/api";
import { toast } from "@/lib/use-toast";
import { formatDate } from "@/lib/utils";
import { Check, Undo2 } from "lucide-react";

function fmtMoney(amount: unknown, currency: string | undefined) {
  // Amount is stored as decimal currency units (dollars / EGP), NOT cents.
  // Previously the page divided by 100 here — that turned $9.00 into $0.09.
  const n = Number(amount ?? 0);
  const cur = (currency || "USD").toUpperCase();
  const symbol = cur === "USD" ? "$" : cur === "EGP" ? "EGP " : `${cur} `;
  return `${symbol}${n.toFixed(2)}`;
}

function statusVariant(status: string): "success" | "warning" | "error" | "secondary" {
  switch (status) {
    case "paid":     return "success";
    case "refunded": return "warning";
    case "voided":   return "warning";
    case "pending":  return "secondary";
    case "failed":   return "error";
    default:         return "secondary";
  }
}

function Content() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: () => adminApi.listPayments().then((r) => r.data),
  });

  const approve = useMutation({
    mutationFn: (id: number) => adminApi.approvePayment(id),
    onSuccess: () => {
      toast.success("Payment approved");
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to approve payment"),
  });

  const refund = useMutation({
    mutationFn: (id: number) => adminApi.refundPayment(id),
    onSuccess: () => {
      toast.success("Payment refunded");
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to refund payment"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Payments</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">All payment transactions</p>
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="border-b border-outline-variant/20">
                {["Date", "User", "Amount", "Status", "Reference", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-outline-variant/10">
                  {Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-container-high rounded animate-pulse w-20" /></td>)}
                </tr>
              )) : (data?.data || []).map((p: any) => (
                <tr key={p.id} className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3 text-on-surface">{p.user?.name || p.user?.email}</td>
                  <td className="px-4 py-3 font-semibold text-on-surface tabular-nums">{fmtMoney(p.amount, p.currency)}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(p.status)}>{p.status}</Badge></td>
                  <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{p.reference || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.status === "pending" && (
                        <button
                          onClick={() => {
                            if (confirm("Approve this payment? Tokens / subscription will be credited.")) {
                              approve.mutate(p.id);
                            }
                          }}
                          disabled={approve.isPending}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-40"
                          title="Approve payment"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      {p.status === "paid" && (
                        <button
                          onClick={() => {
                            if (confirm("Refund this payment? Tokens / subscription will be reversed.")) {
                              refund.mutate(p.id);
                            }
                          }}
                          disabled={refund.isPending}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-40"
                          title="Refund payment"
                        >
                          <Undo2 className="w-3.5 h-3.5" /> Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && (data?.data || []).length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-on-surface-variant">No payments yet.</td></tr>
              )}
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
