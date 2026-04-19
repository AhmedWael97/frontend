"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { Check, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PLANS = [
  {
    name: "Free",
    slug: "free",
    price_monthly: 0,
    price_yearly: 0,
    description: "Perfect for personal projects and small sites.",
    popular: false,
    features: {
      domains: "1 domain",
      events_per_day: "10,000 events/day",
      retention: "30-day data retention",
      ai_analysis: "Daily AI analysis",
      pipelines: true,
      ux_intelligence: true,
      b2b_enrichment: false,
      session_replay: false,
      api_access: false,
      priority_support: false,
    },
  },
  {
    name: "Pro",
    slug: "pro",
    price_monthly: 29,
    price_yearly: 290,
    description: "For growing businesses that need more power.",
    popular: true,
    features: {
      domains: "5 domains",
      events_per_day: "100,000 events/day",
      retention: "90-day data retention",
      ai_analysis: "6-hour AI analysis",
      pipelines: true,
      ux_intelligence: true,
      b2b_enrichment: true,
      session_replay: false,
      api_access: true,
      priority_support: false,
    },
  },
  {
    name: "Business",
    slug: "business",
    price_monthly: 99,
    price_yearly: 990,
    description: "Unlimited scale for large teams and agencies.",
    popular: false,
    features: {
      domains: "Unlimited domains",
      events_per_day: "1M events/day",
      retention: "365-day data retention",
      ai_analysis: "Hourly AI analysis",
      pipelines: true,
      ux_intelligence: true,
      b2b_enrichment: true,
      session_replay: true,
      api_access: true,
      priority_support: true,
    },
  },
];

const COMPARISON_ROWS = [
  { label: "Domains", key: "domains", type: "text" },
  { label: "Events per day", key: "events_per_day", type: "text" },
  { label: "Data retention", key: "retention", type: "text" },
  { label: "AI analysis frequency", key: "ai_analysis", type: "text" },
  { label: "Funnel pipelines", key: "pipelines", type: "bool" },
  { label: "UX Intelligence & heatmaps", key: "ux_intelligence", type: "bool" },
  { label: "B2B company enrichment", key: "b2b_enrichment", type: "bool" },
  { label: "Session replay", key: "session_replay", type: "bool" },
  { label: "API access", key: "api_access", type: "bool" },
  { label: "Priority support", key: "priority_support", type: "bool" },
];

export default function PricingPage() {
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Navbar */}
      <nav className="border-b border-outline-variant/10 bg-surface/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter text-primary uppercase">EYE</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href={`/${locale}/auth/login`}>
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href={`/${locale}/auth/register`}>
              <Button size="sm">Get started free</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-xs font-bold tracking-widest uppercase">Pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
            Start free, scale as you grow. No hidden fees, no per-seat pricing.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {PLANS.map((plan) => (
            <div
              key={plan.slug}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.popular
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-outline-variant/20 bg-surface-container"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-primary text-on-primary">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-black text-on-surface mb-1">{plan.name}</h2>
                <p className="text-sm text-on-surface-variant">{plan.description}</p>
              </div>

              <div className="mb-8">
                {plan.price_monthly === 0 ? (
                  <div className="text-4xl font-black text-on-surface">Free</div>
                ) : (
                  <div>
                    <span className="text-4xl font-black text-on-surface">${plan.price_monthly}</span>
                    <span className="text-on-surface-variant text-sm"> /month</span>
                    <p className="text-xs text-on-surface-variant mt-1">
                      ${plan.price_yearly}/year — save 2 months
                    </p>
                  </div>
                )}
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                <li className="flex items-start gap-2.5 text-sm text-on-surface">
                  <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  {plan.features.domains}
                </li>
                <li className="flex items-start gap-2.5 text-sm text-on-surface">
                  <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  {plan.features.events_per_day}
                </li>
                <li className="flex items-start gap-2.5 text-sm text-on-surface">
                  <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  {plan.features.retention}
                </li>
                <li className="flex items-start gap-2.5 text-sm text-on-surface">
                  <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  {plan.features.ai_analysis}
                </li>
                {plan.features.b2b_enrichment && (
                  <li className="flex items-start gap-2.5 text-sm text-on-surface">
                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    B2B company enrichment
                  </li>
                )}
                {plan.features.session_replay && (
                  <li className="flex items-start gap-2.5 text-sm text-on-surface">
                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    Session replay
                  </li>
                )}
                {plan.features.api_access && (
                  <li className="flex items-start gap-2.5 text-sm text-on-surface">
                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    API access
                  </li>
                )}
                {plan.features.priority_support && (
                  <li className="flex items-start gap-2.5 text-sm text-on-surface">
                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    Priority support
                  </li>
                )}
              </ul>

              <Link href={`/${locale}/auth/register`}>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.price_monthly === 0 ? "Get started free" : `Start ${plan.name}`}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Full comparison table */}
        <div className="mb-20">
          <h2 className="text-2xl font-black tracking-tight text-center mb-8">Full feature comparison</h2>
          <div className="overflow-x-auto rounded-2xl border border-outline-variant/20">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container">
                  <th className="text-left px-6 py-4 font-bold text-on-surface-variant w-1/2">Feature</th>
                  {PLANS.map((p) => (
                    <th key={p.slug} className={`text-center px-6 py-4 font-black ${p.popular ? "text-primary" : "text-on-surface"}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.key} className={`border-b border-outline-variant/10 ${i % 2 === 0 ? "bg-surface" : "bg-surface-container/40"}`}>
                    <td className="px-6 py-3.5 text-on-surface-variant font-medium">{row.label}</td>
                    {PLANS.map((p) => {
                      const val = p.features[row.key as keyof typeof p.features];
                      return (
                        <td key={p.slug} className="text-center px-6 py-3.5">
                          {row.type === "bool" ? (
                            val ? (
                              <Check className="w-4 h-4 text-green-400 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-on-surface-variant/30 mx-auto" />
                            )
                          ) : (
                            <span className={`text-xs font-semibold ${p.popular ? "text-primary" : "text-on-surface"}`}>
                              {String(val)}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-20">
          <h2 className="text-2xl font-black tracking-tight text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I change plans at any time?",
                a: "Yes, you can upgrade or downgrade at any time. Upgrades take effect immediately; downgrades at the end of the billing cycle.",
              },
              {
                q: "What happens when I reach my event limit?",
                a: "Events are silently dropped once your daily limit is reached. We always return 200 to the tracker so your site is never impacted.",
              },
              {
                q: "Is there a free trial for paid plans?",
                a: "The Free plan is free forever. Paid plan trials can be arranged — reach out to our support team.",
              },
              {
                q: "Does EYE comply with GDPR?",
                a: "Yes. EYE collects no PII. Visitor IDs are random UUIDs with no link to email or IP. Full opt-out and data deletion APIs are available.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-outline-variant/20 bg-surface-container p-5">
                <p className="font-bold text-on-surface mb-1.5">{q}</p>
                <p className="text-sm text-on-surface-variant">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center rounded-2xl border border-primary/20 bg-primary/5 p-12">
          <h2 className="text-3xl font-black tracking-tight mb-3">Ready to get started?</h2>
          <p className="text-on-surface-variant mb-6">No credit card required. Set up in under 5 minutes.</p>
          <Link href={`/${locale}/auth/register`}>
            <Button size="lg" className="px-10">
              Start for free
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
