"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/lib/use-toast";

import {
  CreditCard,
  Zap,
  ArrowUpRight,
  ExternalLink,
  Landmark,
  Wallet,
  Shield,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Upload,
  Loader2,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { billingApi } from "@/lib/api";

// ── Types ────────────────────────────────────────────────────────────────────
type PaymentMethod = {
  id: number;
  name: string;
  name_ar?: string;
  type: "paymob" | "bank_transfer" | "stripe" | "paypal" | "manual" | string;
  config?: Record<string, any>;
};

type Plan = {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
  price_monthly: number;
  limits?: Record<string, any>;
};

type Payment = {
  id: number;
  amount: number;
  currency?: string;
  status: "paid" | "pending" | "failed" | "refunded" | "voided" | string;
  paid_at?: string | null;
  created_at: string;
  reference?: string | null;
  metadata?: Record<string, any> | null;
};

// ── Status helpers ───────────────────────────────────────────────────────────
function subStatusMeta(status: string | undefined) {
  switch (status) {
    case "active":    return { tone: "success" as const, label: "Active",    icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
    case "trialing":  return { tone: "secondary" as const, label: "Trial",   icon: <Sparkles className="w-3.5 h-3.5" /> };
    case "paused":    return { tone: "warning" as const, label: "Pending",   icon: <AlertCircle className="w-3.5 h-3.5" /> };
    case "cancelled": return { tone: "warning" as const, label: "Cancelled", icon: <XCircle className="w-3.5 h-3.5" /> };
    case "expired":   return { tone: "error" as const, label: "Expired",     icon: <XCircle className="w-3.5 h-3.5" /> };
    default:          return { tone: "secondary" as const, label: status || "—", icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
  }
}

function paymentStatusMeta(status: string | undefined) {
  switch (status) {
    case "paid":     return { tone: "success" as const, label: "Paid" };
    case "pending":  return { tone: "warning" as const, label: "Pending" };
    case "refunded": return { tone: "warning" as const, label: "Refunded" };
    case "voided":   return { tone: "warning" as const, label: "Voided" };
    case "failed":   return { tone: "error" as const, label: "Failed" };
    default:         return { tone: "secondary" as const, label: status || "—" };
  }
}

function methodMeta(type: string) {
  switch (type) {
    case "paymob":        return { icon: <Wallet className="w-5 h-5" />, tone: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/30",
                                   tagline: "Cards, wallets, Fawry, Vodafone Cash" };
    case "bank_transfer": return { icon: <Landmark className="w-5 h-5" />, tone: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30",
                                   tagline: "Wire transfer + upload receipt" };
    case "stripe":        return { icon: <CreditCard className="w-5 h-5" />, tone: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/30",
                                   tagline: "Credit/debit cards via Stripe" };
    case "paypal":        return { icon: <Wallet className="w-5 h-5" />, tone: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/30",
                                   tagline: "Pay with your PayPal balance" };
    default:              return { icon: <CreditCard className="w-5 h-5" />, tone: "text-on-surface-variant", bg: "bg-surface-container", border: "border-outline-variant/30",
                                   tagline: "Payment method" };
  }
}

function fmtMoney(amount: unknown, currency: string | undefined) {
  const n = Number(amount ?? 0);
  const cur = (currency || "USD").toUpperCase();
  const symbol = cur === "USD" ? "$" : cur === "EGP" ? "EGP " : `${cur} `;
  return `${symbol}${n.toFixed(2)}`;
}

// ── Page ─────────────────────────────────────────────────────────────────────
function Content() {
  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();

  const { data: billing, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["billing"],
    queryFn: () => billingApi.show().then((r) => r.data),
  });

  const paymentMethods: PaymentMethod[] = useMemo(() => billing?.payment_methods ?? [], [billing?.payment_methods]);
  const plans: Plan[] = useMemo(() => billing?.plans ?? [], [billing?.plans]);
  const payments: Payment[] = useMemo(() => billing?.payments ?? [], [billing?.payments]);
  const bankTransfer = billing?.bank_transfer;

  const activePlan = billing?.subscription?.plan;
  const activePlanId: number | null = activePlan?.id ?? null;
  const sub = billing?.subscription;
  const usage = billing?.usage;
  const limits = billing?.limits;

  // ── Selection state ─────────────────────────────────────────────────────────
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [transactionReference, setTransactionReference] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [paymobLoading, setPaymobLoading] = useState(false);

  // Auto-select a sensible default plan + method once data is loaded.
  // Default plan: current plan if any, else the cheapest paid plan, else the first plan.
  useEffect(() => {
    if (selectedPlanId == null && plans.length > 0) {
      if (activePlanId && plans.some((p) => p.id === activePlanId)) {
        setSelectedPlanId(activePlanId);
      } else {
        const sortedPaid = plans
          .filter((p) => Number(p.price_monthly) > 0)
          .sort((a, b) => Number(a.price_monthly) - Number(b.price_monthly));
        setSelectedPlanId(sortedPaid[0]?.id ?? plans[0]?.id ?? null);
      }
    }
  }, [plans, activePlanId, selectedPlanId]);

  // Default payment method: prefer Paymob if available, else bank transfer, else first.
  useEffect(() => {
    if (selectedMethodId == null && paymentMethods.length > 0) {
      const paymob = paymentMethods.find((m) => m.type === "paymob");
      const bank = paymentMethods.find((m) => m.type === "bank_transfer");
      setSelectedMethodId(paymob?.id ?? bank?.id ?? paymentMethods[0].id);
    }
  }, [paymentMethods, selectedMethodId]);

  const selectedPlan = useMemo(() => plans.find((p) => p.id === selectedPlanId) ?? null, [plans, selectedPlanId]);
  const selectedMethod = useMemo(() => paymentMethods.find((m) => m.id === selectedMethodId) ?? null, [paymentMethods, selectedMethodId]);

  const isChangingPlan = selectedPlanId !== activePlanId;

  // ── Mutations ───────────────────────────────────────────────────────────────
  const subscribeMutation = useMutation({
    mutationFn: (formData: FormData) => billingApi.subscribe(formData),
    onSuccess: (res: any) => {
      toast.success(res?.data?.message ?? res?.data?.data?.message ?? "Subscription request submitted.");
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      setReceiptFile(null);
      setTransactionReference("");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.data?.message ?? e?.message ?? "Failed to submit subscription.");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => billingApi.cancel(),
    onSuccess: () => {
      toast.success("Subscription cancelled at period end.");
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.data?.message ?? e?.message ?? "Failed to cancel subscription.");
    },
  });

  // ── Handlers ────────────────────────────────────────────────────────────────
  const onSubmitBankTransfer = () => {
    if (!selectedPlanId)   { toast.error("Please choose a plan first."); return; }
    if (!selectedMethodId) { toast.error("Please choose a payment method."); return; }
    if (!receiptFile)      { toast.error("Please attach your bank transfer receipt."); return; }

    const form = new FormData();
    form.append("plan_id", String(selectedPlanId));
    form.append("payment_method_id", String(selectedMethodId));
    if (transactionReference.trim()) form.append("transaction_reference", transactionReference.trim());
    form.append("receipt", receiptFile);
    subscribeMutation.mutate(form);
  };

  const onPaymob = async () => {
    if (!selectedPlanId) { toast.error("Please choose a plan first."); return; }
    setPaymobLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("eye_token") : null;
      const apiBase = `${process.env.NEXT_PUBLIC_API_URL || ""}/api/${process.env.NEXT_PUBLIC_API_VERSION || "v1"}`;
      const res = await fetch(`${apiBase}/billing/paymob/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
          "X-Public-Key": process.env.NEXT_PUBLIC_APP_PUBLIC_KEY || "",
          "X-Secret-Key": process.env.NEXT_PUBLIC_APP_SECRET_KEY || "",
        },
        body: JSON.stringify({ plan_id: selectedPlanId }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.data?.message ?? json?.message ?? "Paymob initiation failed.");
        return;
      }
      const iframeUrl: string = json?.data?.iframe_url;
      if (iframeUrl) {
        window.open(iframeUrl, "_blank", "noopener,noreferrer");
        toast.success("Paymob checkout opened in a new tab. Complete your payment there.");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Network error.");
    } finally {
      setPaymobLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Header />
        <div className="h-44 bg-surface-container/40 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-surface-container/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Header />
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <p className="text-on-surface font-semibold">Couldn&#39;t load your billing information</p>
            <p className="text-on-surface-variant text-sm mt-1">{(error as any)?.message || "Please try again."}</p>
            <Button onClick={() => refetch()} className="mt-4">Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subMeta = subStatusMeta(sub?.status);

  return (
    <div className="space-y-6">
      <Header />

      {/* ── Current plan ───────────────────────────────────────────────── */}
      <Card className="border-primary/20 bg-primary/5 overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-primary shrink-0" />
                <span className="text-lg font-black text-on-surface">{activePlan?.name || "Free"}</span>
                <Badge variant={subMeta.tone} className="inline-flex items-center gap-1">
                  {subMeta.icon}
                  {subMeta.label}
                </Badge>
              </div>
              <p className="text-on-surface-variant text-sm">
                {activePlan?.description || "You&#39;re on the free tier — upgrade for more domains, events, and AI insights."}
              </p>
              {sub?.current_period_end && (
                <p className="text-xs text-on-surface-variant mt-2">
                  {sub?.status === "active" ? "Renews" : "Ends"} {formatDate(sub.current_period_end)}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-black text-on-surface tabular-nums">
                ${Number(activePlan?.price_monthly ?? 0).toFixed(2)}
                <span className="text-sm font-normal text-on-surface-variant">/mo</span>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 mt-2">
                <Button size="sm" variant="ghost" onClick={() => router.push(`/${locale}/settings/billing/plans`)}>
                  <ArrowUpRight className="w-4 h-4" /> Compare plans
                </Button>
                {sub?.status === "active" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Cancel subscription at the end of the current period?")) {
                        cancelMutation.mutate();
                      }
                    }}
                    disabled={cancelMutation.isPending}
                    className="text-rose-400 hover:bg-rose-500/10"
                  >
                    {cancelMutation.isPending ? "Cancelling…" : "Cancel"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {(usage || limits) && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-outline-variant/10">
              {[
                { label: "Domains",           used: usage?.domains ?? 0,    limit: limits?.domains ?? 0 },
                { label: "Pageviews / month", used: usage?.pageviews ?? 0,  limit: limits?.pageviews_per_month ?? 0 },
              ].map((u) => {
                const unlimited = u.limit === -1 || u.limit === Infinity;
                const pct = unlimited ? 0 : (u.limit ? Math.min(100, (u.used / u.limit) * 100) : 0);
                return (
                  <div key={u.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-on-surface-variant">{u.label}</span>
                      <span className="text-on-surface tabular-nums">
                        {Number(u.used).toLocaleString()} / {unlimited ? "Unlimited" : Number(u.limit).toLocaleString()}
                      </span>
                    </div>
                    <Progress value={pct} />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Choose plan ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Choose a plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <EmptyState
              title="No plans available yet"
              hint="The administrator hasn&#39;t published any plans. Please check back later."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {plans.map((p) => {
                const isCurrent  = activePlanId === p.id;
                const isSelected = selectedPlanId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`text-left rounded-2xl border p-4 transition relative
                      ${isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-outline-variant/25 hover:border-primary/40 hover:bg-surface-container/40"}`}
                  >
                    {isCurrent && (
                      <span className="absolute top-3 ltr:right-3 rtl:left-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                        <CheckCircle2 className="w-3 h-3" /> Current
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-on-surface">{p.name}</p>
                    </div>
                    <p className="text-xs text-on-surface-variant min-h-[2.5em]">{p.description || "Includes core analytics."}</p>
                    <p className="text-2xl font-black mt-3 text-on-surface tabular-nums">
                      ${Number(p.price_monthly || 0).toFixed(2)}
                      <span className="text-xs text-on-surface-variant font-normal"> / month</span>
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Choose payment method ──────────────────────────────────────── */}
      {selectedPlan && Number(selectedPlan.price_monthly) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Payment method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {paymentMethods.length === 0 ? (
              <EmptyState
                title="No payment methods are available right now"
                hint="The administrator hasn&#39;t enabled any payment gateways. Please contact support to subscribe."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {paymentMethods.map((m) => {
                  const meta = methodMeta(m.type);
                  const isSelected = selectedMethodId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethodId(m.id)}
                      className={`text-left rounded-2xl border p-4 transition
                        ${isSelected
                          ? `${meta.border} ${meta.bg} ring-2 ring-primary/30`
                          : "border-outline-variant/25 hover:border-primary/40 hover:bg-surface-container/40"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`p-2 rounded-xl bg-surface-container ${meta.tone}`}>{meta.icon}</span>
                        <div className="min-w-0">
                          <p className="font-bold text-on-surface truncate">{m.name}</p>
                          <p className="text-[11px] text-on-surface-variant truncate">{meta.tagline}</p>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary ltr:ml-auto rtl:mr-auto shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected method action panel */}
            {selectedMethod && (
              <div className="rounded-2xl border border-outline-variant/25 p-4 sm:p-5">
                {/* Paymob */}
                {selectedMethod.type === "paymob" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <p className="text-sm font-bold text-on-surface">Pay with Paymob</p>
                      <Badge variant="secondary" className="ml-auto">Card / Wallet / Fawry</Badge>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      You&#39;ll be redirected to Paymob&#39;s secure checkout in a new tab. We accept Visa,
                      Mastercard, Meeza, Fawry, Vodafone Cash, and instalments.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                      <p className="text-xs text-on-surface-variant">
                        {isChangingPlan
                          ? <>Upgrading to <strong className="text-on-surface">{selectedPlan.name}</strong> at <strong className="text-on-surface">${Number(selectedPlan.price_monthly).toFixed(2)}/mo</strong>.</>
                          : <>Renewing <strong className="text-on-surface">{selectedPlan.name}</strong> at <strong className="text-on-surface">${Number(selectedPlan.price_monthly).toFixed(2)}/mo</strong>.</>}
                      </p>
                      <Button onClick={onPaymob} disabled={paymobLoading} className="gap-2">
                        {paymobLoading
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening…</>
                          : <><ExternalLink className="w-4 h-4" /> Pay now with Paymob</>}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Bank transfer */}
                {selectedMethod.type === "bank_transfer" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-emerald-400" />
                      <p className="text-sm font-bold text-on-surface">Bank transfer</p>
                      <Badge variant="secondary" className="ml-auto">Manual verification</Badge>
                    </div>

                    {bankTransfer?.details && Object.keys(bankTransfer.details).length > 0 ? (
                      <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Transfer to</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-on-surface">
                          {Object.entries(bankTransfer.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between gap-2">
                              <span className="font-semibold text-on-surface-variant capitalize">{key.replaceAll("_", " ")}</span>
                              <span className="font-mono text-xs text-on-surface text-right break-all">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-on-surface-variant">
                        Bank details haven&#39;t been published yet. Please contact support for instructions.
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="text-sm text-on-surface">
                        <span className="block mb-1 font-medium">Transaction reference (optional)</span>
                        <input
                          type="text"
                          value={transactionReference}
                          onChange={(e) => setTransactionReference(e.target.value)}
                          className="w-full rounded-md border border-outline-variant/25 bg-surface px-3 py-2"
                          placeholder="e.g. NBE-2026-00123"
                        />
                      </label>
                      <label className="text-sm text-on-surface">
                        <span className="block mb-1 font-medium">
                          Receipt image <span className="text-rose-400">*</span>
                        </span>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                            className="w-full rounded-md border border-outline-variant/25 bg-surface px-3 py-2 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-on-primary file:text-xs file:font-semibold"
                          />
                        </div>
                        {receiptFile && (
                          <p className="text-[11px] text-emerald-400 mt-1 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {receiptFile.name}
                          </p>
                        )}
                      </label>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                      <p className="text-xs text-on-surface-variant">
                        Once your transfer is verified by an admin, your subscription will activate.
                      </p>
                      <Button
                        onClick={onSubmitBankTransfer}
                        disabled={subscribeMutation.isPending || !receiptFile}
                        className="gap-2"
                      >
                        {subscribeMutation.isPending
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                          : <><Upload className="w-4 h-4" /> Submit transfer</>}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Other gateways (stripe / paypal / manual) — fall back to receipt-style flow */}
                {selectedMethod.type !== "paymob" && selectedMethod.type !== "bank_transfer" && (
                  <div className="space-y-3">
                    <p className="text-sm text-on-surface">
                      Submit a payment request for <strong>{selectedPlan.name}</strong>. An admin will verify and activate your plan.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="text-sm text-on-surface">
                        <span className="block mb-1 font-medium">Transaction reference (optional)</span>
                        <input
                          type="text"
                          value={transactionReference}
                          onChange={(e) => setTransactionReference(e.target.value)}
                          className="w-full rounded-md border border-outline-variant/25 bg-surface px-3 py-2"
                          placeholder="External payment ref"
                        />
                      </label>
                      <label className="text-sm text-on-surface">
                        <span className="block mb-1 font-medium">Receipt image <span className="text-rose-400">*</span></span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                          className="w-full rounded-md border border-outline-variant/25 bg-surface px-3 py-2 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-on-primary file:text-xs file:font-semibold"
                        />
                      </label>
                    </div>
                    <Button onClick={onSubmitBankTransfer} disabled={subscribeMutation.isPending || !receiptFile} className="gap-2">
                      {subscribeMutation.isPending
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                        : <><Upload className="w-4 h-4" /> Submit payment request</>}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Payment history ────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Payment history
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-outline-variant/20">
                {["Date", "Amount", "Status", "Reference", "Receipt"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const ps = paymentStatusMeta(p.status);
                return (
                  <tr key={p.id} className="border-b border-outline-variant/10 hover:bg-surface-container/30 transition-colors">
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(p.paid_at || p.created_at)}</td>
                    <td className="px-4 py-3 font-semibold text-on-surface tabular-nums">{fmtMoney(p.amount, p.currency)}</td>
                    <td className="px-4 py-3"><Badge variant={ps.tone}>{ps.label}</Badge></td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs font-mono">{p.reference || "—"}</td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {p?.metadata?.receipt_url ? (
                        <a href={p.metadata.receipt_url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : "—"}
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-on-surface-variant text-sm">No payments yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="text-2xl font-black text-on-surface tracking-tight">Billing &amp; Subscription</h1>
      <p className="text-on-surface-variant text-sm mt-0.5">Manage your plan, payment methods, and invoices.</p>
    </div>
  );
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-xl border border-dashed border-outline-variant/30 px-6 py-10 text-center">
      <AlertCircle className="w-8 h-8 text-on-surface-variant/40 mx-auto mb-2" />
      <p className="text-sm font-semibold text-on-surface">{title}</p>
      <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">{hint}</p>
    </div>
  );
}

export default function BillingPage() {
  return <Content />;
}
