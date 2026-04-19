"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ChevronDown, Globe, Sun, Moon, Monitor, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth";
import { authApi, domainsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";

export function AppHeader() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user, selectedDomainId, setSelectedDomainId, logout } = useAuthStore();
  const [appearance, setAppearance] = useState<"light" | "dark" | "system">(
    (user?.appearance as "light" | "dark" | "system") || "dark"
  );

  const { data: domainsRaw } = useQuery({
    queryKey: ["domains"],
    queryFn: () => domainsApi.list().then((r) => r.data?.data ?? r.data),
    staleTime: 60_000,
  });

  const domains: any[] = useMemo(() => {
    if (Array.isArray(domainsRaw)) return domainsRaw;
    if (Array.isArray((domainsRaw as any)?.data)) return (domainsRaw as any).data;
    return [];
  }, [domainsRaw]);

  useEffect(() => {
    if (!selectedDomainId && domains.length > 0) {
      setSelectedDomainId(domains[0].id);
    } else if (selectedDomainId && domains.length > 0 && !domains.some((d: any) => d.id === selectedDomainId)) {
      setSelectedDomainId(domains[0].id);
    }
  }, [domains, selectedDomainId, setSelectedDomainId]);

  const selectedDomain = domains.find((d: any) => d.id === selectedDomainId);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout();
    router.push(`/${locale}/auth/login`);
  };

  const handleLocaleSwitch = async () => {
    const newLocale = locale === "en" ? "ar" : "en";
    try { await authApi.updatePreferences({ locale: newLocale }); } catch {}
    router.push(`/${newLocale}/dashboard`);
  };

  const handleAppearance = async (value: "light" | "dark" | "system") => {
    setAppearance(value);
    try { await authApi.updatePreferences({ appearance: value }); } catch {}
    const root = document.documentElement;
    if (value === "dark") root.classList.add("dark");
    else if (value === "light") root.classList.remove("dark");
    else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  };

  return (
    <header className="h-14 ltr:pl-64 rtl:pr-64 flex items-center justify-between px-6 border-b border-outline-variant/20 bg-surface-container-low/80 backdrop-blur-sm sticky top-0 z-30">
      {/* Domain Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-sm font-medium text-on-surface transition-colors border border-outline-variant/20">
            <Globe className="w-4 h-4 text-primary" />
            <span className="max-w-[160px] truncate">
              {selectedDomain?.domain || t("dashboard.selectDomain")}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuLabel>{t("nav.domains")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {domains.map((d) => (
            <DropdownMenuItem
              key={d.id}
              onClick={() => setSelectedDomainId(d.id)}
              className={cn(selectedDomainId === d.id && "text-primary")}
            >
              <Globe className="w-3.5 h-3.5" />
              {d.domain}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Appearance */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              {appearance === "dark" ? <Moon className="w-4 h-4" /> :
               appearance === "light" ? <Sun className="w-4 h-4" /> :
               <Monitor className="w-4 h-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleAppearance("light")}><Sun className="w-4 h-4" />{t("settings.light")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAppearance("dark")}><Moon className="w-4 h-4" />{t("settings.dark")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAppearance("system")}><Monitor className="w-4 h-4" />{t("settings.system")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Locale toggle */}
        <Button variant="ghost" size="sm" onClick={handleLocaleSwitch} className="text-xs font-bold px-2">
          {locale === "en" ? "عربي" : "EN"}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-surface-container-high transition-colors">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary-container flex items-center justify-center text-on-primary-fixed text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-sm font-medium text-on-surface max-w-[120px] truncate hidden sm:block">
                {user?.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/${locale}/settings/profile`)}>
              <User className="w-4 h-4" />{t("nav.profile")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/${locale}/settings/billing`)}>
              <Settings className="w-4 h-4" />{t("settings.billing")}
            </DropdownMenuItem>
            {user?.role === "superadmin" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/${locale}/admin`)}>
                  <Settings className="w-4 h-4" />{t("admin.title")}
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-error focus:text-error">
              <LogOut className="w-4 h-4" />{t("nav.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
