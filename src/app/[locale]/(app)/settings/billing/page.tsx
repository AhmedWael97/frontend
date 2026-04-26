"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/lib/use-toast";

import { CreditCard, Zap, ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { billingApi } from "@/lib/api";

function Content() {
  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();

  const { data: billing } = useQuery({
    queryKey: ["billing"],
    queryFn: () => billingApi.show().then((r) => r.data),
  });

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [transactionReference, setTransactionReference] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const paymentMethods = billing?.payment_methods ?? [];
  const bankTransfer = billing?.bank_transfer;

  const activePlanId = billing?.subscription?.plan?.id ?? null;

  const effectivePlanId = selectedPlanId ?? activePlanId;
  const effectiveMethodId = selectedMethodId ?? bankTransfer?.id ?? paymentMethods?.[0]?.id ?? null;

  const selectedPlan = useMemo(
    () => (billing?.plans ?? []).find((p: any) => p.id === effectivePlanId) ?? null,
    [billing?.plans, effectivePlanId]
  );

  const selectedMethod = useMemo(
    () => (paymentMethods ?? []).find((m: any) => m.id === effectiveMethodId) ?? null,
    [billing?.payment_methods, effectiveMethodId]
  );

  const subscribeMutation = useMutation({
    mutationFn: (formData: FormData) => billingApi.subscribe(formData),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Billing request submitted.");
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      setReceiptFile(null);
      setTransactionReference("");
    },
  });

  const onSubmit = () => {
    if (!effectivePlanId) {
      toast.error("Please select a plan.");
      return;
    }
    if (!effectiveMethodId) {
      toast.error("Please select a payment method.");
      return;
    }

    if (selectedMethod?.type === "bank_transfer" && !receiptFile) {
      toast.error("Please attach your bank transfer receipt image.");
      return;
    }

    const form = new FormData();
    form.append("plan_id", String(effectivePlanId));
    form.append("payment_method_id", String(effectiveMethodId));
    if (transactionReference.trim()) {
      form.append("transaction_reference", transactionReference.trim());
    }
    if (receiptFile) {
      form.append("receipt", receiptFile);
    }

    subscribeMutation.mutate(form);
  };

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
              <Button size="sm" className="mt-2" onClick={() => router.push(`/${locale}/settings/billing/plans`)}><ArrowUpRight className="w-4 h-4" /> Compare</Button>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Choose Plan & Pay</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(billing?.plans ?? []).map((p: any) => {
              const isCurrent = activePlanId === p.id;
              const isSelected = effectivePlanId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`text-left rounded-xl border p-4 transition ${isSelected
                    ? "border-primary bg-primary/5"
                    : "border-outline-variant/25 hover:border-primary/40"
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-on-surface">{p.name}</p>
                    <div className="flex items-center gap-2">
                      {isCurrent && <Badge variant="secondary">Current</Badge>}
                      {isSelected && <Badge variant="success">Selected</Badge>}
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">{p.description || "Plan details"}</p>
                  <p className="text-lg font-black mt-3 text-on-surface">${Number(p.price_monthly || 0).toFixed(2)}<span className="text-xs text-on-surface-variant font-normal"> / month</span></p>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-outline-variant/25 p-4 space-y-4">
            <div>
              <p className="text-sm font-semibold text-on-surface">Payment Method</p>
              <select
                className="mt-2 w-full rounded-md border border-outline-variant/25 bg-surface px-3 py-2 text-sm"
                value={effectiveMethodId ?? ""}
                onChange={(e) => setSelectedMethodId(Number(e.target.value))}
              >
                {(paymentMethods ?? []).map((m: any) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {selectedMethod?.type === "bank_transfer" && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Bank Transfer Details</p>
                <div className="mt-2 space-y-1 text-sm text-on-surface">
                  {bankTransfer?.details && Object.keys(bankTransfer.details).length > 0 ? (
                    Object.entries(bankTransfer.details).map(([key, value]) => (
                      <p key={key}><span className="font-semibold">{key.replaceAll("_", " ")}:</span> {String(value)}</p>
                    ))
                  ) : (
                    <p className="text-on-surface-variant">Bank details will be provided by admin.</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-sm text-on-surface">
                <span className="block mb-1 font-medium">Transaction Reference (optional)</span>
                <input
                  type="text"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  className="w-full rounded-md border border-outline-variant/25 bg-surface px-3 py-2"
                  placeholder="Bank transfer reference"
                />
              </label>

              <label className="text-sm text-on-surface">
                <span className="block mb-1 font-medium">Transaction Receipt Image {selectedMethod?.type === "bank_transfer" ? "*" : ""}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                  className="w-full rounded-md border border-outline-variant/25 bg-surface px-3 py-2"
                />
              </label>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-on-surface-variant">
                {selectedPlan
                  ? `You are requesting ${selectedPlan.name} at $${Number(selectedPlan.price_monthly || 0).toFixed(2)} per month.`
                  : "Select a plan to continue."}
              </p>
              <Button onClick={onSubmit} disabled={subscribeMutation.isPending || !selectedPlan}>
                {subscribeMutation.isPending ? "Submitting..." : "Submit Payment Request"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20">
                {["Date", "Amount", "Status", "Reference", "Receipt"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(billing?.payments || []).map((p: any) => (
                <tr key={p.id} className="border-b border-outline-variant/10">
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(p.paid_at || p.created_at)}</td>
                  <td className="px-4 py-3 font-semibold text-on-surface">${Number(p.amount || 0).toFixed(2)}</td>
                  <td className="px-4 py-3"><Badge variant={p.status === "paid" ? "success" : "secondary"}>{p.status}</Badge></td>
                  <td className="px-4 py-3 text-on-surface-variant">{p.reference || "-"}</td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {p?.metadata?.receipt_url ? (
                      <a href={p.metadata.receipt_url} target="_blank" rel="noreferrer" className="text-primary underline">View</a>
                    ) : "-"}
                  </td>
                </tr>
              ))}
              {!billing?.payments?.length && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">No payments yet</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BillingPage() {
  return <Content />;
}
