"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { trackPurchase } from "@/lib/track";

type OrderStatus = {
  status: "pending" | "paid" | "failed" | "refunded" | "voided" | string;
  order_id: string;
  amount: number;
  currency: string;
  plan: string | null;
  email: string | null;
  paid_at: string | null;
};

const FIRED_KEY_PREFIX = "eye_ga4_purchase_fired_";
const POLL_MS = 2500;
const POLL_TIMEOUT_MS = 30000;

function apiBase() {
  return `${process.env.NEXT_PUBLIC_API_URL || ""}/api/${process.env.NEXT_PUBLIC_API_VERSION || "v1"}`;
}

function apiHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("eye_token") : null;
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : "",
    "X-Public-Key": process.env.NEXT_PUBLIC_APP_PUBLIC_KEY || "",
    "X-Secret-Key": process.env.NEXT_PUBLIC_APP_SECRET_KEY || "",
  };
}

function BillingSuccessContent() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  // Paymob's hosted iframe redirects the browser tab here (redirection URL is
  // configured in the Paymob dashboard, not our code) with `order` in the
  // query string — the same order id our webhook stored as Payment.reference.
  const orderId = searchParams.get("order") || searchParams.get("order_id") || searchParams.get("merchant_order_id");

  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("no_order");
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const startedAt = Date.now();

    const poll = async () => {
      try {
        const res = await fetch(`${apiBase()}/billing/paymob/status?order_id=${encodeURIComponent(orderId)}`, {
          headers: apiHeaders(),
        });
        const json = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setError(json?.data?.message ?? json?.message ?? "not_found");
          return;
        }

        const data: OrderStatus = json?.data ?? json;

        // Webhook may not have landed yet — keep polling briefly while pending.
        if (data.status === "pending" && Date.now() - startedAt < POLL_TIMEOUT_MS) {
          timer = setTimeout(poll, POLL_MS);
          setOrder(data);
          return;
        }

        setOrder(data);

        // Fire the GA4/Google Ads purchase conversion exactly once per order,
        // using the amount our own DB recorded from the HMAC-verified webhook
        // (never the raw redirect query string) — and only once it's actually paid.
        if (data.status === "paid" && typeof window !== "undefined") {
          const firedKey = `${FIRED_KEY_PREFIX}${data.order_id}`;
          if (!sessionStorage.getItem(firedKey)) {
            trackPurchase(data.amount, data.order_id);
            window.EYE?.purchase?.(data.amount, data.currency, data.order_id);
            sessionStorage.setItem(firedKey, "1");
          }
        }
      } catch {
        if (!cancelled) setError("network");
      }
    };

    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderId]);

  if (error === "no_order") {
    return (
      <StatusCard
        icon={<XCircle className="w-7 h-7 text-red-500" />}
        iconBg="bg-red-500/15"
        title="No order found"
        subtitle="This link is missing order details. If you just paid, check your dashboard — your subscription may already be active."
        locale={locale}
      />
    );
  }

  if (error) {
    return (
      <StatusCard
        icon={<XCircle className="w-7 h-7 text-red-500" />}
        iconBg="bg-red-500/15"
        title="Couldn't load your order"
        subtitle="If you completed payment, your subscription should still be active — check your dashboard or contact support."
        locale={locale}
      />
    );
  }

  if (!order || order.status === "pending") {
    return (
      <StatusCard
        icon={<Loader2 className="w-7 h-7 text-primary animate-spin" />}
        iconBg="bg-primary/15"
        title="Confirming your payment..."
        subtitle="This usually takes a few seconds."
        locale={locale}
      />
    );
  }

  if (order.status !== "paid") {
    return (
      <StatusCard
        icon={<XCircle className="w-7 h-7 text-red-500" />}
        iconBg="bg-red-500/15"
        title="Payment not completed"
        subtitle="Your payment didn't go through. No charge was made — please try again."
        locale={locale}
      />
    );
  }

  return (
    <div className="max-w-xl mx-auto py-12">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight mb-2">Thank you for your order!</h1>
          <p className="text-on-surface-variant text-sm mb-8">Your subscription is now active.</p>

          <div className="text-left rtl:text-right space-y-4 border-y border-outline-variant/15 py-6 mb-8">
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Order ID</span>
              <span id="order-transaction-id" className="text-sm font-semibold text-on-surface font-mono">{order.order_id}</span>
            </div>
            {order.plan && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">Plan</span>
                <span id="order-plan-description" className="text-sm font-semibold text-on-surface">{order.plan} Plan</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Amount paid</span>
              <span className="text-sm font-semibold text-on-surface">
                <span id="order-amount">{order.amount}</span>{" "}
                <span id="order-currency">{order.currency}</span>
              </span>
            </div>
            {order.email && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">Billed to</span>
                <span id="order-email" className="text-sm font-semibold text-on-surface">{order.email}</span>
              </div>
            )}
            {order.paid_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">Date</span>
                <span id="order-date" className="text-sm font-semibold text-on-surface">{formatDate(order.paid_at)}</span>
              </div>
            )}
          </div>

          <Link href={`/${locale}/dashboard`}>
            <Button size="lg" className="w-full">Go to my dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusCard({ icon, iconBg, title, subtitle, locale }: { icon: React.ReactNode; iconBg: string; title: string; subtitle: string; locale: string }) {
  return (
    <div className="max-w-xl mx-auto py-12">
      <Card>
        <CardContent className="p-8 text-center">
          <div className={`w-14 h-14 rounded-full ${iconBg} flex items-center justify-center mx-auto mb-5`}>{icon}</div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight mb-2">{title}</h1>
          <p className="text-on-surface-variant text-sm mb-8">{subtitle}</p>
          <Link href={`/${locale}/dashboard`}>
            <Button size="lg" className="w-full">Go to my dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={null}>
      <BillingSuccessContent />
    </Suspense>
  );
}
