import Link from "next/link";
import { Eye, Github, Twitter, Linkedin } from "lucide-react";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Changelog", href: "#" },
    { label: "Roadmap", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "GDPR", href: "#" },
  ],
  Developers: [
    { label: "API Docs", href: "#" },
    { label: "Tracker Script", href: "#" },
    { label: "Webhooks", href: "#" },
    { label: "Status", href: "#" },
  ],
};

interface FooterProps {
  locale: string;
}

export default function Footer({ locale }: FooterProps) {
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
                EYE<span className="text-indigo-400">.</span>
              </span>
            </Link>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs">
              AI-powered visitor intelligence that helps you understand, convert, and retain every visitor.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: Twitter, href: "#" },
                { icon: Github, href: "#" },
                { icon: Linkedin, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <Icon className="w-4 h-4" />
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
                      <a
                        href={link.href}
                        className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={`/${locale}${link.href}`}
                        className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
                      >
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
            © {new Date().getFullYear()} EYE Analytics. All rights reserved.
          </p>
          <p className="text-xs text-on-surface-variant">
            Privacy-first analytics. GDPR compliant. No cookies required.
          </p>
        </div>
      </div>
    </footer>
  );
}
