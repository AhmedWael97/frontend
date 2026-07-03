"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import {
  LayoutDashboard, Users, CreditCard, Repeat2, DollarSign,
  Globe, ScrollText, Palette, Activity, Settings, ArrowLeft, Menu, X, MessageSquare, Star,
} from "lucide-react";

const navItems = [
  { href: "admin", label: "Overview", icon: LayoutDashboard },
  { href: "admin/users", label: "Users", icon: Users },
  { href: "admin/plans", label: "Plans", icon: CreditCard },
  { href: "admin/subscriptions", label: "Subscriptions", icon: Repeat2 },
  { href: "admin/upgrade-tickets", label: "Upgrade Requests", icon: MessageSquare },
  { href: "admin/feedback", label: "Feedback", icon: Star },
  { href: "admin/payments", label: "Payments", icon: DollarSign },
  { href: "admin/payment-methods", label: "Payment Methods", icon: Settings },
  { href: "admin/domains", label: "Domains", icon: Globe },
  { href: "admin/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "admin/theme", label: "Theme", icon: Palette },
  { href: "admin/horizon", label: "Horizon", icon: Activity },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user, token } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!token || user?.role !== "superadmin") {
      router.replace(`/${locale}/dashboard`);
    }
  }, [token, user, locale, router, hydrated]);

  // Close drawer whenever route changes (mobile UX)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [sidebarOpen]);

  if (!hydrated || !token || user?.role !== "superadmin") return null;

  return (
    <div className="min-h-screen bg-surface">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-outline-variant/20 bg-surface-container px-4 py-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-surface-container-high text-on-surface"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-end leading-tight">
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">System Control</span>
          <span className="text-xs font-black text-indigo-700 dark:text-indigo-400">Super Admin</span>
        </div>
      </header>

      {/* Backdrop (mobile) */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        />
      )}

      {/* Sidebar — drawer on mobile, fixed on lg+ */}
      <aside
        className={`fixed top-0 z-50 h-full w-64 sm:w-72 lg:w-60 bg-surface-container border-outline-variant/20 flex flex-col py-6 gap-1
          ltr:left-0 ltr:border-r rtl:right-0 rtl:border-l
          transition-transform duration-200 ease-out
          ${sidebarOpen
            ? "translate-x-0"
            : "ltr:-translate-x-full rtl:translate-x-full lg:!translate-x-0"}
        `}
      >
        {/* Mobile close button */}
        <div className="lg:hidden absolute top-3 ltr:right-3 rtl:left-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-container-high text-on-surface-variant"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">System Control</span>
          <p className="text-sm font-black text-indigo-700 dark:text-indigo-400 mt-0.5">Super Admin</p>
        </div>

        <div className="flex-1 flex flex-col gap-0.5 mt-2 overflow-y-auto">
          {navItems.map((item) => {
            const href = `/${locale}/${item.href}`;
            const active = pathname === href || (item.href !== "admin" && pathname.startsWith(href));
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => router.push(href)}
                className={`flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                  active
                    ? "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Back to dashboard */}
        <div className="px-3 pt-3 border-t border-outline-variant/20">
          <button
            onClick={() => router.push(`/${locale}/dashboard`)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0 rtl:rotate-180" />
            Back to Dashboard
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ltr:ml-60 lg:rtl:mr-60 p-4 sm:p-6 lg:p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
