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
    { label: locale === "ar" ? "عرض حيّ" : "Live demo", href: "/live-demo" },
    { label: locale === "ar" ? "أدوات مجانية" : "Free Tools", href: "/free-tools" },
    { label: t("docs"),       href: "/docs" },
    { label: t("guide"),      href: "/help" },
    { label: t("pricing"),    href: "/pricing" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 bg-black transition-colors duration-200 ${
        scrolled ? "border-b border-[#262626]" : "border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-none border border-[#262626] bg-[#0A0A0A] flex items-center justify-center group-hover:border-[#00E5FF] transition-colors">
            <Eye className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            EYE<span className="text-[#00E5FF]">.</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) =>
            link.href.startsWith("#") ? (
              <a key={link.label} href={link.href} className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors rounded-none">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={`/${locale}${link.href}`} className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors rounded-none">
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Link href={`/${locale}/auth/login`}>
            <Button variant="ghost" size="sm" className="rounded-none text-neutral-400 hover:text-white hover:bg-[#171717]">
              {t("signIn")}
            </Button>
          </Link>
          <Link href={`/${locale}/auth/register`}>
            <Button size="sm" className="rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black font-semibold shadow-none">
              {t("startFree")}
            </Button>
          </Link>
        </div>

        {/* Mobile: always-visible CTA + hamburger */}
        <div className="md:hidden flex items-center gap-1.5">
          <Link href={`/${locale}/auth/register`}>
            <Button size="sm" className="rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black h-9 px-3 text-sm font-semibold shadow-none">
              {t("startFree")}
            </Button>
          </Link>
          <button className="p-2 rounded-none text-neutral-400 hover:text-white hover:bg-[#171717] transition-colors" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#262626] bg-black px-4 py-4 flex flex-col gap-0.5">
          {NAV_LINKS.map((link) =>
            link.href.startsWith("#") ? (
              <a key={link.label} href={link.href} onClick={() => setOpen(false)} className="px-4 py-3 text-sm font-medium text-neutral-400 hover:text-white hover:bg-[#171717] rounded-none transition-colors">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={`/${locale}${link.href}`} onClick={() => setOpen(false)} className="px-4 py-3 text-sm font-medium text-neutral-400 hover:text-white hover:bg-[#171717] rounded-none transition-colors">
                {link.label}
              </Link>
            )
          )}
          <div className="flex gap-2 mt-2 pt-3 border-t border-[#262626]">
            <Link href={`/${locale}/auth/login`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full rounded-none border-[#262626] text-white hover:bg-[#171717]">{t("signIn")}</Button>
            </Link>
            <Link href={`/${locale}/auth/register`} className="flex-1">
              <Button size="sm" className="w-full rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none">{t("startFree")}</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
