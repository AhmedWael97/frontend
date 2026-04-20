"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import {
  LayoutDashboard, Users, CreditCard, Repeat2, DollarSign,
  Globe, ScrollText, Palette, Activity, Settings, ArrowLeft,
} from "lucide-react";

const navItems = [
  { href: "admin", label: "Overview", icon: LayoutDashboard },
  { href: "admin/users", label: "Users", icon: Users },
  { href: "admin/plans", label: "Plans", icon: CreditCard },
  { href: "admin/subscriptions", label: "Subscriptions", icon: Repeat2 },
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

  if (!hydrated || !token || user?.role !== "superadmin") return null;

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Admin sidebar */}
      <aside className="w-60 shrink-0 bg-surface-container border-r border-outline-variant/20 flex flex-col py-6 gap-1 fixed h-full left-0 z-40">
        <div className="px-5 mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">System Control</span>
          <p className="text-sm font-black text-indigo-700 dark:text-indigo-400 mt-0.5">Super Admin</p>
        </div>

        <div className="flex-1 flex flex-col gap-0.5 mt-2">
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
            <ArrowLeft className="w-4 h-4 shrink-0" />
            Back to Dashboard
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ltr:ml-60 rtl:mr-60 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
