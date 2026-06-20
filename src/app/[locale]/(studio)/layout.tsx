"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { domainsApi } from "@/lib/api";
import { FlaskConical, ArrowLeft, Menu, X, Globe } from "lucide-react";

/**
 * A/B Testing Studio — a separate context (convert.com-style) that shares the
 * same login/token and selected domain as the main app, with its own chrome.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, selectedDomainId, setSelectedDomainId } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) { setHydrated(true); return; }
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) router.replace(`/${locale}/auth/login`);
    else if (user && !user.email_verified_at) router.replace(`/${locale}/auth/verify-email`);
  }, [token, user, locale, hydrated, router]);

  useEffect(() => { setOpen(false); }, [pathname]);

  const { data: domainsRaw } = useQuery({
    queryKey: ["domains"],
    queryFn: () => domainsApi.list().then((r) => r.data?.data ?? r.data),
    enabled: hydrated && !!token,
    staleTime: 60_000,
  });
  const domains: { id: number; domain: string }[] = Array.isArray(domainsRaw) ? domainsRaw : [];

  useEffect(() => {
    if (!selectedDomainId && domains.length > 0) setSelectedDomainId(domains[0].id);
  }, [domains, selectedDomainId, setSelectedDomainId]);

  if (!hydrated || !token) return null;

  const nav = [{ href: "studio/experiments", label: "Experiments", icon: FlaskConical }];

  return (
    <div className="min-h-screen bg-surface">
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-outline-variant/20 bg-surface-container px-4 py-3">
        <button onClick={() => setOpen(true)} className="w-10 h-10 rounded-lg hover:bg-surface-container-high text-on-surface inline-flex items-center justify-center" aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xs font-black text-primary">A/B Studio</span>
      </header>

      {open && <button aria-label="Close" onClick={() => setOpen(false)} className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />}

      <aside className={`fixed top-0 z-50 h-full w-64 lg:w-60 bg-surface-container flex flex-col py-6 gap-1 ltr:left-0 ltr:border-r rtl:right-0 rtl:border-l border-outline-variant/20 transition-transform duration-200 ${open ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full lg:!translate-x-0"}`}>
        <div className="lg:hidden absolute top-3 ltr:right-3 rtl:left-3">
          <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-lg hover:bg-surface-container-high text-on-surface-variant inline-flex items-center justify-center" aria-label="Close menu"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-5 mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Experiments</span>
          <p className="text-sm font-black text-primary mt-0.5 flex items-center gap-1.5"><FlaskConical className="w-4 h-4" /> A/B Studio</p>
        </div>

        {/* Domain selector (shared with the main dashboard) */}
        <div className="px-3 mb-2">
          <div className="relative">
            <Globe className="absolute ltr:left-2.5 rtl:right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant pointer-events-none" />
            <select
              value={selectedDomainId ?? ""}
              onChange={(e) => setSelectedDomainId(Number(e.target.value))}
              className="w-full ltr:pl-8 rtl:pr-8 py-2 rounded-lg border border-outline-variant/30 bg-surface text-sm text-on-surface"
            >
              {domains.length === 0 && <option value="">No domains</option>}
              {domains.map((d) => <option key={d.id} value={d.id}>{d.domain}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-0.5 mt-1">
          {nav.map((item) => {
            const href = `/${locale}/${item.href}`;
            const active = pathname.startsWith(href);
            const Icon = item.icon;
            return (
              <button key={item.href} onClick={() => router.push(href)}
                className={`flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors ${active ? "bg-primary/15 text-primary" : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"}`}>
                <Icon className="w-4 h-4 shrink-0" /> {item.label}
              </button>
            );
          })}
        </div>

        <div className="px-3 pt-3 border-t border-outline-variant/20">
          <button onClick={() => router.push(`/${locale}/dashboard`)} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors">
            <ArrowLeft className="w-4 h-4 shrink-0 rtl:rotate-180" /> Back to Dashboard
          </button>
        </div>
      </aside>

      <main className="lg:ltr:ml-60 lg:rtl:mr-60 p-4 sm:p-6 lg:p-8 min-h-screen">{children}</main>
    </div>
  );
}
