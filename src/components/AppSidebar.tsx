"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Radio, Users, BarChart3, GitMerge, Sparkles,
  Zap, Code2, UserCheck, Building2, PlaySquare, Share2, Download,
  MessageSquare, Globe, CreditCard, User, Shield,
  Bell, Webhook, Link2, Eye,
  ArrowDownToLine, Gauge, Bug, Lightbulb,
} from "lucide-react";

const navGroups = [
  {
    label: null,
    items: [
      { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
      { key: "realtime", href: "/dashboard/realtime", icon: Radio },
    ],
  },
  {
    label: "Analytics",
    items: [
      { key: "visitors", href: "/dashboard/visitors", icon: Users },
      { key: "analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { key: "funnels", href: "/dashboard/funnels", icon: GitMerge },
      { key: "customEvents", href: "/dashboard/custom-events", icon: Code2 },
      { key: "identities", href: "/dashboard/identities", icon: UserCheck },
      { key: "companies", href: "/dashboard/companies", icon: Building2 },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { key: "ai", href: "/dashboard/ai", icon: Sparkles },
      { key: "ux", href: "/dashboard/ux", icon: Zap },
      { key: "ownerBrief", href: "/dashboard/owner-brief", icon: Lightbulb },
      { key: "replay", href: "/dashboard/replay", icon: PlaySquare },
      { key: "websiteChatbot", href: "/dashboard/website-chatbot", icon: MessageSquare },
      { key: "scrollDepth", href: "/dashboard/scroll-depth", icon: ArrowDownToLine },
      { key: "webVitals", href: "/dashboard/web-vitals", icon: Gauge },
      { key: "jsErrors", href: "/dashboard/errors", icon: Bug },
    ],
  },
  {
    label: "Reports",
    items: [
      { key: "sharedReports", href: "/dashboard/shared-reports", icon: Share2 },
      { key: "exports", href: "/dashboard/exports", icon: Download },
    ],
  },
  {
    label: "Settings",
    items: [
      { key: "domains", href: "/settings/domains", icon: Globe },
      { key: "billing", href: "/settings/billing", icon: CreditCard },
      { key: "profile", href: "/settings/profile", icon: User },
      { key: "security", href: "/settings/security", icon: Shield },
      { key: "alerts", href: "/settings/alerts", icon: Bell },
      { key: "webhooks", href: "/settings/webhooks", icon: Webhook },
      { key: "notifications", href: "/settings/notifications", icon: Bell },
    ],
  },
  {
    label: "Tools",
    items: [
      { key: "utmBuilder", href: "/tools/utm-builder", icon: Link2 },
    ],
  },
];


import React, { useState } from "react";

export function AppSidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    const full = `/${locale}${href}`;
    return pathname === full || pathname.startsWith(`${full}/`);
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
          "md:translate-x-0 md:static md:block",
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
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 no-scrollbar">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.key}
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
                      <span className="truncate">{t(item.key as Parameters<typeof t>[0])}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
