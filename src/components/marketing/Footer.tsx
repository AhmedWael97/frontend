"use client";

import Link from "next/link";
import { Eye, Facebook, Twitter, Linkedin } from "lucide-react";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.5 3c.3 2 1.6 3.6 3.5 4v2.4c-1.3.1-2.5-.3-3.6-1v6.1c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.3 0 .6 0 .9.1v2.5c-.3-.1-.6-.1-.9-.1-1.9 0-3.4 1.5-3.4 3.4S8 17.7 9.9 17.7s3.5-1.4 3.5-3.3V3h3.1z" />
    </svg>
  );
}
import { useTranslations } from "next-intl";

interface FooterProps {
  locale: string;
}

// Computed once at module load (same value on server + client) so the year is
// never produced during render — avoids a hydration mismatch (#418).
const CURRENT_YEAR = new Date().getFullYear();

export default function Footer({ locale }: FooterProps) {
  const t = useTranslations("landing.footer");

  const FOOTER_LINKS = {
    [t("product")]: [
      { label: t("features"),  href: "#features" },
      { label: t("pricing"),   href: "/pricing" },
      { label: t("changelog"), href: "/changelog" },
      { label: t("roadmap"),   href: "/roadmap" },
    ],
    [t("company")]: [
      { label: t("about"),    href: "/about" },
      { label: t("blog"),     href: "/blog" },
      { label: t("careers"),  href: "/careers" },
      { label: t("contact"),  href: "/contact" },
    ],
    [t("legal")]: [
      { label: t("privacyPolicy"), href: "/privacy" },
      { label: t("terms"),         href: "/terms" },
      { label: t("cookiePolicy"),  href: "/cookie-policy" },
      { label: t("gdpr"),          href: "/gdpr" },
    ],
    [t("developers")]: [
      { label: t("apiDocs"),       href: "/docs" },
      { label: t("trackerScript"), href: "/docs" },
      { label: t("webhooks"),      href: "/docs" },
      { label: t("status"),        href: "/status" },
    ],
  };

  return (
    <footer className="border-t border-outline-variant/20 bg-surface-container/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-on-surface">
                EYE<span className="text-indigo-500 dark:text-indigo-400">.</span>
              </span>
            </Link>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs">
              {t("tagline")}
            </p>
            <div className="flex items-center gap-3 mt-6">
              {([
                { Icon: Twitter, label: "X", href: "https://x.com/eye_analysis" },
                { Icon: Facebook, label: "Facebook", href: "https://facebook.com/eye_analysis" },
                { Icon: TikTokIcon, label: "TikTok", href: "https://www.tiktok.com/@eye_analysis" },
                { Icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/eye_analysis" },
              ] as const).map(({ Icon, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`EYE on ${label}`} title={label} className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-xs font-black uppercase tracking-widest text-on-surface mb-4">{section}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("#") ? (
                      <a href={link.href} className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={`/${locale}${link.href}`} className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-on-surface-variant">
            © {CURRENT_YEAR} {t("copyright")}
          </p>
          <p className="text-xs text-on-surface-variant">
            {t("privacyFirst")}
          </p>
        </div>
      </div>
    </footer>
  );
}

