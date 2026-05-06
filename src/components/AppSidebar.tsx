"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Radio, Users, BarChart3, GitMerge, Sparkles,
  Zap, Code2, UserCheck, Building2, PlaySquare, Share2, Download,
  Globe, CreditCard, User, Shield,
  Bell, Webhook, Link2, Eye, ChevronDown, ChevronUp,
  ArrowDownToLine, Gauge, Bug, Lightbulb, Megaphone, Flame, Star, SearchCheck,
} from "lucide-react";
import React, { useState } from "react";

// ── Human-readable labels (override translation keys for jargon-heavy items) ─
const LABEL_OVERRIDES: Record<string, string> = {
  engagedVisitors: "Hot Leads",
  identities:      "Known Visitors",
  ux:              "Site Health",
  webVitals:       "Page Speed",
  jsErrors:        "Broken Pages",
  scrollDepth:     "Content Reach",
  customEvents:    "Goal Tracking",
  ownerBrief:      "Daily Brief",
  companies:       "Company Visitors",
  sharedReports:   "Share Reports",
  utmBuilder:      "UTM Link Builder",
  seoChecker:      "SEO Checker",
  realtime:        "Live Visitors",
  summary:         "Full Summary",
  heatmaps:        "Click Maps",
  replay:          "Watch Sessions",
  campaigns:       "Campaigns",
  analytics:       "Deep Analytics",
  visitors:        "All Visitors",
  exports:         "Export Data",
  domains:         "My Websites",
  billing:         "Plans & Billing",
};

// ── Core nav (always visible — 5 items, minimal cognitive load) ───────────────
const CORE_NAV = [
  { key: "dashboard",     href: "/dashboard",           icon: LayoutDashboard },
  { key: "realtime",      href: "/dashboard/realtime",  icon: Radio },
  { key: "heatmaps",      href: "/dashboard/heatmaps",  icon: Flame },
  { key: "replay",        href: "/dashboard/replay",    icon: PlaySquare },
  { key: "ai",            href: "/dashboard/ai",        icon: Sparkles },
];

// ── Power nav (revealed via "More tools" toggle) ──────────────────────────────
const MORE_NAV = [
  {
    label: "Analytics",
    items: [
      { key: "summary",        href: "/dashboard/summary",          icon: Star },
      { key: "visitors",       href: "/dashboard/visitors",         icon: Users },
      { key: "analytics",      href: "/dashboard/analytics",        icon: BarChart3 },
      { key: "campaigns",      href: "/dashboard/campaigns",        icon: Megaphone },
      { key: "engagedVisitors",href: "/dashboard/engaged-visitors", icon: Flame },
      { key: "funnels",        href: "/dashboard/funnels",          icon: GitMerge },
      { key: "customEvents",   href: "/dashboard/custom-events",    icon: Code2 },
      { key: "identities",     href: "/dashboard/identities",       icon: UserCheck },
      { key: "companies",      href: "/dashboard/companies",        icon: Building2 },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { key: "ux",             href: "/dashboard/ux",               icon: Zap },
      { key: "ownerBrief",     href: "/dashboard/owner-brief",      icon: Lightbulb },
      { key: "scrollDepth",    href: "/dashboard/scroll-depth",     icon: ArrowDownToLine },
      { key: "webVitals",      href: "/dashboard/web-vitals",       icon: Gauge },
      { key: "jsErrors",       href: "/dashboard/errors",           icon: Bug },
    ],
  },
  {
    label: "Reports & Tools",
    items: [
      { key: "sharedReports",  href: "/dashboard/shared-reports",   icon: Share2 },
      { key: "exports",        href: "/dashboard/exports",          icon: Download },
      { key: "utmBuilder",     href: "/tools/utm-builder",          icon: Link2 },
      { key: "seoChecker",     href: "/tools/seo-checker",          icon: SearchCheck },
    ],
  },
  {
    label: "Settings",
    items: [
      { key: "domains",        href: "/settings/domains",           icon: Globe },
      { key: "billing",        href: "/settings/billing",           icon: CreditCard },
      { key: "profile",        href: "/settings/profile",           icon: User },
      { key: "security",       href: "/settings/security",          icon: Shield },
      { key: "alerts",         href: "/settings/alerts",            icon: Bell },
      { key: "webhooks",       href: "/settings/webhooks",          icon: Webhook },
      { key: "notifications",  href: "/settings/notifications",     icon: Bell },
    ],
  },
];

// All items flat (for active-detection on power pages)
const ALL_ITEMS = CORE_NAV.concat(MORE_NAV.flatMap((g) => g.items));

export function AppSidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) => {
    const full = `/${locale}${href}`;
    return pathname === full || pathname.startsWith(`${full}/`);
  };

  // Auto-open "more" if the current page lives there
  const currentInMore = MORE_NAV.flatMap((g) => g.items).some((item) => isActive(item.href));

  const navLabel = (key: string): string => {
    if (LABEL_OVERRIDES[key]) return LABEL_OVERRIDES[key];
    try { return t(key as Parameters<typeof t>[0]); } catch { return key; }
  };

  const NavItem = ({ item }: { item: (typeof CORE_NAV)[0] }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        href={`/${locale}${item.href}`}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
          active
            ? "bg-gradient-to-r from-primary/20 to-primary-container/10 text-primary border border-primary/15"
            : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
        )}
        onClick={() => setOpen(false)}
      >
        <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-primary" : "")} />
        <span className="truncate">{navLabel(item.key)}</span>
      </Link>
    );
  };

  // Show sidebar always on desktop, toggle on mobile
  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="fixed top-4 ltr:left-4 rtl:right-4 z-50 md:hidden bg-primary text-on-primary p-2 rounded-lg shadow-lg"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle sidebar"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Sidebar overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "h-full w-64 fixed inset-y-0 ltr:left-0 rtl:right-0 flex flex-col bg-surface-container-low border-r border-outline-variant/20 z-50 transition-transform duration-300",
          "md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        style={{ maxWidth: 256 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-outline-variant/20">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg flex-shrink-0">
            <Eye className="w-5 h-5 text-on-primary-fixed" />
          </div>
          <div>
            <h1 className="text-base font-black text-primary tracking-tighter uppercase leading-none">EYE</h1>
            <p className="text-[9px] text-secondary/70 tracking-widest uppercase mt-0.5">AI Intelligence</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
          {/* ── Core items (always visible) ─────────────────────────────── */}
          {CORE_NAV.map((item) => (
            <NavItem key={item.key} item={item} />
          ))}

          {/* ── More tools toggle ────────────────────────────────────────── */}
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all mt-1",
              (moreOpen || currentInMore)
                ? "text-on-surface bg-surface-container"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            )}
          >
            <span>More tools</span>
            {(moreOpen || currentInMore)
              ? <ChevronUp className="w-4 h-4 opacity-60" />
              : <ChevronDown className="w-4 h-4 opacity-60" />}
          </button>

          {/* ── Power-user nav groups ────────────────────────────────────── */}
          {(moreOpen || currentInMore) && (
            <div className="space-y-4 mt-1 pt-1 border-t border-outline-variant/20">
              {MORE_NAV.map((group, gi) => (
                <div key={gi}>
                  <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <NavItem key={item.key} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
