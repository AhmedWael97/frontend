"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Menu, X, Eye } from "lucide-react";

export default function Navbar() {
  const locale = useLocale();
  const t = useTranslations("landing.nav");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const NAV_LINKS = [
    { label: t("features"),   href: "#features" },
    { label: t("howItWorks"), href: "#how-it-works" },
    { label: t("docs"),       href: "/docs" },
    { label: t("pricing"),    href: "/pricing" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-surface/90 backdrop-blur-xl border-b border-outline-variant/20 shadow-lg shadow-black/10 dark:shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-on-surface">
            EYE<span className="text-indigo-500 dark:text-indigo-400">.</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) =>
            link.href.startsWith("#") ? (
              <a key={link.label} href={link.href} className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors rounded-lg hover:bg-surface-container">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={`/${locale}${link.href}`} className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors rounded-lg hover:bg-surface-container">
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Link href={`/${locale}/auth/login`}>
            <Button variant="ghost" size="sm" className="text-on-surface-variant">
              {t("signIn")}
            </Button>
          </Link>
          <Link href={`/${locale}/auth/register`}>
            <Button size="sm" className="bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25">
              {t("startFree")}
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-outline-variant/20 bg-surface/95 backdrop-blur-xl px-4 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) =>
            link.href.startsWith("#") ? (
              <a key={link.label} href={link.href} onClick={() => setOpen(false)} className="px-4 py-3 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={`/${locale}${link.href}`} onClick={() => setOpen(false)} className="px-4 py-3 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors">
                {link.label}
              </Link>
            )
          )}
          <div className="flex gap-2 mt-2 pt-2 border-t border-outline-variant/20">
            <Link href={`/${locale}/auth/login`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">{t("signIn")}</Button>
            </Link>
            <Link href={`/${locale}/auth/register`} className="flex-1">
              <Button size="sm" className="w-full bg-indigo-500 hover:bg-indigo-400 text-white">{t("startFree")}</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
