"use client";

import Link from "next/link";
import { Eye, Instagram, Linkedin, Facebook } from "lucide-react";

import { useTranslations } from "next-intl";

interface FooterProps {
  locale: string;
}

// No TikTok glyph in lucide-react (brand icons were deprecated from that
// package) — same 24x24/currentColor convention as the lucide icons above.
function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.6 5.82c-.9-.86-1.4-2.03-1.4-3.32h-3.15v13.87a2.83 2.83 0 1 1-2-2.7v-3.19a6 6 0 1 0 5.15 5.95V9.4a8.3 8.3 0 0 0 4.8 1.53V7.8a4.85 4.85 0 0 1-3.4-1.98z" />
    </svg>
  );
}

// Computed once at module load (same value on server + client) so the year is
// never produced during render — avoids a hydration mismatch (#418).
const CURRENT_YEAR = new Date().getFullYear();

export default function Footer({ locale }: FooterProps) {
  const t = useTranslations("landing.footer");

  const FOOTER_LINKS = {
    [t("product")]: [
      { label: t("features"),     href: "#features" },
      { label: t("pricing"),      href: "/pricing" },
      { label: t("alternatives"), href: "/alternatives" },
      { label: t("changelog"),    href: "/changelog" },
      { label: t("roadmap"),      href: "/roadmap" },
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
    <footer className="border-t border-[#262626] bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-none border border-[#262626] bg-[#0A0A0A] flex items-center justify-center">
                <Eye className="w-4 h-4 text-[#00E5FF]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                EYE<span className="text-[#00E5FF]">.</span>
              </span>
            </Link>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
              {t("tagline")}
            </p>
            <div className="flex items-center gap-3 mt-6">
              {([
                { Icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/eye-analysis-117595421/" },
                { Icon: TikTokIcon, label: "TikTok", href: "https://www.tiktok.com/@eye.analysis" },
                { Icon: Facebook, label: "Facebook", href: "https://www.facebook.com/profile.php?id=61592158749623" },
                { Icon: Instagram, label: "Instagram", href: "https://www.instagram.com/eye_analysis/" },
              ] as const).map(({ Icon, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`EYE on ${label}`} title={label} className="w-9 h-9 rounded-none border border-[#262626] flex items-center justify-center text-neutral-500 hover:text-[#00E5FF] hover:border-[#00E5FF] transition-colors">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-600 mb-4" style={{ fontFamily: "var(--font-mono-marketing)" }}>{section}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("#") ? (
                      <a href={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={`/${locale}${link.href}`} className="text-sm text-neutral-400 hover:text-white transition-colors">
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
        <div className="mt-12 pt-8 border-t border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-600" style={{ fontFamily: "var(--font-mono-marketing)" }}>
            © {CURRENT_YEAR} {t("copyright")}
          </p>
          <p className="text-xs text-neutral-600" style={{ fontFamily: "var(--font-mono-marketing)" }}>
            {t("privacyFirst")}
          </p>
        </div>
      </div>
    </footer>
  );
}

