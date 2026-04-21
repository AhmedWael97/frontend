"use client";

import { useQuery } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { CreditCard, Zap, ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { billingApi } from "@/lib/api";

const qc = new QueryClient();

function Content() {

  const { data: billing } = useQuery({
    queryKey: ["billing"],
    queryFn: () => billingApi.show().then((r) => r.data),
  });

  const plan = billing?.subscription?.plan ?? billing?.plan;
  const sub = billing?.subscription;
  const usage = billing?.usage;
  const limits = billing?.limits;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Billing</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Manage your subscription and payment history</p>
      </div>

      {/* Current Plan */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-lg font-black text-on-surface">{plan?.name || "Free"}</span>
                <Badge variant={sub?.status === "active" ? "success" : "secondary"}>{sub?.status || "active"}</Badge>
              </div>
              <p className="text-on-surface-variant text-sm">{plan?.description || "Your current plan"}</p>
              {sub?.current_period_end && (
                <p className="text-xs text-on-surface-variant mt-2">Renews {formatDate(sub.current_period_end)}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-on-surface">${plan?.price_monthly ?? plan?.price ?? 0}<span className="text-sm font-normal text-on-surface-variant">/mo</span></div>
              <Button size="sm" className="mt-2"><ArrowUpRight className="w-4 h-4" /> Upgrade</Button>
            </div>
          </div>

          {/* Usage bars */}
          {(usage || limits) && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-outline-variant/10">
              {[
                { label: "Domains", used: usage?.domains ?? 0, limit: limits?.domains ?? 0 },
                { label: "Pageviews / month", used: usage?.pageviews ?? 0, limit: limits?.pageviews_per_month ?? 0 },
              ].map((u) => (
                <div key={u.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface-variant">{u.label}</span>
                    <span className="text-on-surface">{u.used?.toLocaleString()} / {u.limit?.toLocaleString()}</span>
                  </div>
                  <Progress value={u.limit ? (u.used / u.limit) * 100 : 0} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20">
                {["Date", "Amount", "Status", "Description"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(billing?.payments || []).map((p: any) => (
                <tr key={p.id} className="border-b border-outline-variant/10">
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3 font-semibold text-on-surface">${(p.amount / 100).toFixed(2)}</td>
                  <td className="px-4 py-3"><Badge variant={p.status === "paid" ? "success" : "secondary"}>{p.status}</Badge></td>
                  <td className="px-4 py-3 text-on-surface-variant">{p.description || plan?.name}</td>
                </tr>
              ))}
              {!billing?.payments?.length && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant">No payments yet</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BillingPage() {
  return <QueryClientProvider client={qc}><Content /></QueryClientProvider>;
}
