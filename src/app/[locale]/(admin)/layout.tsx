"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import {
  LayoutDashboard, Users, CreditCard, Repeat2, DollarSign,
  Globe, ScrollText, Palette, Activity
} from "lucide-react";

const navItems = [
  { href: "admin", label: "Overview", icon: LayoutDashboard },
  { href: "admin/users", label: "Users", icon: Users },
  { href: "admin/plans", label: "Plans", icon: CreditCard },
  { href: "admin/subscriptions", label: "Subscriptions", icon: Repeat2 },
  { href: "admin/payments", label: "Payments", icon: DollarSign },
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

  useEffect(() => {
    if (!token || user?.role !== "superadmin") router.push(`/${locale}/dashboard`);
  }, [token, user, locale, router]);

  if (!token || user?.role !== "superadmin") return null;

  return (
    <div className="flex min-h-screen">
      {/* Admin sidebar */}
      <aside className="w-56 shrink-0 bg-surface-container border-r border-outline-variant/20 flex flex-col py-6 gap-1 fixed h-full ltr:left-64 rtl:right-64 z-30">
        <div className="px-4 mb-4">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Super Admin</span>
        </div>
        {navItems.map((item) => {
          const href = `/${locale}/${item.href}`;
          const active = pathname === href || (item.href !== "admin" && pathname.startsWith(href));
          const Icon = item.icon;
          return (
            <button key={item.href} onClick={() => router.push(href)}
              className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${active ? "bg-indigo-500/10 text-indigo-400" : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"}`}>
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </aside>
      {/* Main content */}
      <main className="flex-1 ltr:ml-56 rtl:mr-56 p-6 ltr:pl-[calc(256px+224px+24px)] rtl:pr-[calc(256px+224px+24px)]">
        {children}
      </main>
    </div>
  );
}
