"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * TEMPORARY fake-data version — exists so GTM's "Add order information" wizard
 * has real, individually-selectable DOM elements to point at right now, before
 * this page is wired to real order data. Every value below is a placeholder.
 * TODO: replace with real order details once GTM tagging is confirmed working.
 */
const FAKE_ORDER = {
  transactionId: "ORD-2026-004821",
  plan: "Business",
  amount: "5940",
  currency: "EGP",
  email: "ezcreators1@gmail.com",
  date: "August 15, 2026",
};

export default function BillingSuccessPage() {
  const locale = useLocale();

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
              <span id="order-transaction-id" className="text-sm font-semibold text-on-surface font-mono">{FAKE_ORDER.transactionId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Plan</span>
              <span id="order-plan-description" className="text-sm font-semibold text-on-surface">{FAKE_ORDER.plan} Plan</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Amount paid</span>
              <span className="text-sm font-semibold text-on-surface">
                <span id="order-amount">{FAKE_ORDER.amount}</span>{" "}
                <span id="order-currency">{FAKE_ORDER.currency}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Billed to</span>
              <span id="order-email" className="text-sm font-semibold text-on-surface">{FAKE_ORDER.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Date</span>
              <span id="order-date" className="text-sm font-semibold text-on-surface">{FAKE_ORDER.date}</span>
            </div>
          </div>

          <Link href={`/${locale}/dashboard`}>
            <Button size="lg" className="w-full">Go to my dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
