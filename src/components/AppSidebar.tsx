"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Radio, Users, BarChart3, GitMerge, Sparkles,
  Zap, Code2, UserCheck, Building2, PlaySquare, Share2, Download,
  Globe, CreditCard, User, Shield,
  Bell, Webhook, Link2, Eye, ChevronDown, ChevronUp,
  ArrowDownToLine, Gauge, Bug, Lightbulb, Megaphone, Flame, Star,
  SearchCheck, Settings, FileText, Layers, Repeat, FlaskConical, LayoutGrid, Gem, Scale, Menu, ClipboardList, Gift,
} from "lucide-react";
import React, { useState } from "react";

// ── Hub groups — the 4 mini-dashboards ───────────────────────────────────────
const HUB_GROUPS = [
  {
    groupKey: "analyticsHub" as const,
    hubHref:  "/dashboard",
    hubIcon:  BarChart3,
    color:    "text-primary",
    items: [
      { key: "portfolio",      href: "/dashboard/portfolio",        icon: LayoutGrid },
      { key: "realtime",       href: "/dashboard/realtime",         icon: Radio },
      { key: "visitors",       href: "/dashboard/visitors",         icon: Users },
      { key: "analytics",      href: "/dashboard/analytics",        icon: BarChart3 },
      { key: "compare",        href: "/dashboard/compare",          icon: Scale },
      { key: "campaigns",      href: "/dashboard/campaigns",        icon: Megaphone },
      { key: "channels",       href: "/dashboard/channels",         icon: Layers },
      { key: "engagedVisitors",href: "/dashboard/engaged-visitors", icon: Flame },
      { key: "retention",      href: "/dashboard/retention",        icon: Repeat },
      { key: "ltv",            href: "/dashboard/ltv",              icon: Gem },
      { key: "experiments",    href: "/studio/experiments",         icon: FlaskConical },
      { key: "funnels",        href: "/dashboard/funnels",          icon: GitMerge },
      { key: "customEvents",   href: "/dashboard/custom-events",    icon: Code2 },
      { key: "identities",     href: "/dashboard/identities",       icon: UserCheck },
      { key: "companies",      href: "/dashboard/companies",        icon: Building2 },
      { key: "summary",        href: "/dashboard/summary",          icon: Star },
    ],
  },
  {
    groupKey: "intelligenceHub" as const,
    hubHref:  "/dashboard/intelligence",
    hubIcon:  Zap,
    color:    "text-sky-400",
    items: [
      { key: "ux",             href: "/dashboard/ux",               icon: Zap },
      { key: "heatmaps",       href: "/dashboard/heatmaps",         icon: Flame },
      { key: "forms",          href: "/dashboard/forms",            icon: ClipboardList },
      { key: "replay",         href: "/dashboard/replay",           icon: PlaySquare },
      { key: "performance",    href: "/dashboard/performance",      icon: Gauge },
      { key: "scrollDepth",    href: "/dashboard/scroll-depth",     icon: ArrowDownToLine },
      { key: "webVitals",      href: "/dashboard/web-vitals",       icon: Gauge },
      { key: "jsErrors",       href: "/dashboard/errors",           icon: Bug },
      { key: "ownerBrief",     href: "/dashboard/owner-brief",      icon: Lightbulb },
    ],
  },
  {
    groupKey: "reportsHub" as const,
    hubHref:  "/dashboard/reports",
    hubIcon:  FileText,
    color:    "text-violet-400",
    items: [
      { key: "ai",             href: "/dashboard/ai",               icon: Sparkles },
      { key: "leads",          href: "/dashboard/leads",            icon: Users },
      { key: "sharedReports",  href: "/dashboard/shared-reports",   icon: Share2 },
      { key: "exports",        href: "/dashboard/exports",          icon: Download },
      { key: "utmBuilder",     href: "/tools/utm-builder",          icon: Link2 },
      { key: "speedChecker",   href: "/free-tools/speed-checker",   icon: Gauge },
      { key: "seoChecker",     href: "/tools/seo-checker",          icon: SearchCheck },
      { key: "seoRank",        href: "/tools/seo-rank",             icon: SearchCheck },
      { key: "sitemapCreator", href: "/tools/sitemap-creator",      icon: Layers },
    ],
  },
  {
    groupKey: "settingsHub" as const,
    hubHref:  "/settings",
    hubIcon:  Settings,
    color:    "text-on-surface-variant",
    items: [
      { key: "domains",        href: "/settings/domains",           icon: Globe },
      { key: "team",           href: "/settings/team",              icon: Users },
      { key: "referrals",      href: "/settings/referrals",         icon: Gift },
      { key: "billing",        href: "/settings/billing",           icon: CreditCard },
      { key: "profile",        href: "/settings/profile",           icon: User },
      { key: "security",       href: "/settings/security",          icon: Shield },
      { key: "alerts",         href: "/settings/alerts",            icon: Bell },
      { key: "webhooks",       href: "/settings/webhooks",          icon: Webhook },
      { key: "notifications",  href: "/settings/notifications",     icon: Bell },
    ],
  },
] as const;

export function AppSidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale   = useLocale();
  const [open, setOpen]           = useState(false);
  // Which groups are manually collapsed (by default all are expanded if active)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const full = (href: string) => `/${locale}${href}`;

  const isActive = (href: string) =>
    pathname === full(href) || pathname.startsWith(`${full(href)}/`);

  const groupIsActive = (group: (typeof HUB_GROUPS)[number]) =>
    isActive(group.hubHref) ||
    group.items.some((i) => isActive(i.href));

  const isExpanded = (group: (typeof HUB_GROUPS)[number]) => {
    // If manually toggled respect that, otherwise auto-expand when group is active
    if (collapsed[group.groupKey] !== undefined) return !collapsed[group.groupKey];
    return groupIsActive(group);
  };

  const toggleGroup = (key: string, currentlyExpanded: boolean) =>
    setCollapsed((prev) => ({ ...prev, [key]: currentlyExpanded }));

  const navLabel = (key: string) => {
    try { return t(key as Parameters<typeof t>[0]); } catch { return key; }
  };

  const NavItem = ({ item }: { item: { key: string; href: string; icon: React.ElementType } }) => {
    const Icon   = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        href={full(item.href)}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
          active
            ? "bg-primary/15 text-primary border border-primary/15"
            : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
        )}
        onClick={() => setOpen(false)}
      >
        <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", active ? "text-primary" : "")} />
        <span className="truncate">{navLabel(item.key)}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 ltr:left-4 rtl:right-4 z-50 md:hidden bg-primary text-on-primary p-2 rounded-lg shadow-lg"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        className={cn(
          "h-full w-64 fixed inset-y-0 ltr:left-0 rtl:right-0 flex flex-col bg-surface-container-low border-e border-outline-variant/20 z-50 transition-transform duration-300",
          // Closed (mobile): slide off the correct edge per direction — left in LTR,
          // right in RTL. Open: slide in. Desktop (md+): always visible.
          open ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full",
          "md:!translate-x-0"
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

        {/* Navigation — 4 hub groups */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 no-scrollbar">
          {HUB_GROUPS.map((group) => {
            const HubIcon  = group.hubIcon;
            const expanded = isExpanded(group);
            const active   = groupIsActive(group);
            const hubExact = isActive(group.hubHref) &&
              !group.items.some((i) => isActive(i.href));

            return (
              <div key={group.groupKey} className="mb-0.5">
                {/* Group header — hub link + collapse toggle */}
                <div className={cn(
                  "flex items-center rounded-xl transition-all",
                  active ? "bg-surface-container/60" : ""
                )}>
                  <Link
                    href={full(group.hubHref)}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 flex-1 px-3 py-2.5 text-sm font-bold rounded-s-xl transition-all",
                      hubExact
                        ? "text-primary"
                        : active
                          ? "text-on-surface"
                          : "text-on-surface-variant hover:text-on-surface"
                    )}
                  >
                    <HubIcon className={cn("w-4 h-4 flex-shrink-0", active ? group.color : "")} />
                    <span>{navLabel(group.groupKey)}</span>
                  </Link>
                  <button
                    onClick={() => toggleGroup(group.groupKey, expanded)}
                    className="p-2 rounded-e-xl text-on-surface-variant hover:text-on-surface transition-colors"
                    aria-label={expanded ? "Collapse" : "Expand"}
                  >
                    {expanded
                      ? <ChevronUp className="w-3.5 h-3.5 opacity-50" />
                      : <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
                  </button>
                </div>

                {/* Sub-items */}
                {expanded && (
                  <div className="mt-0.5 ms-3 ps-3 border-s border-outline-variant/20 space-y-0.5">
                    {group.items.map((item) => (
                      <NavItem key={item.key} item={item} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
