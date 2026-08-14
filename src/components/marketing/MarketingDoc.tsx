import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared shell for simple marketing/legal/company pages: Navbar + centered prose
 * + Footer. Keeps every footer page consistent without re-cloning the chrome.
 */
export function MarketingDoc({
  locale,
  title,
  subtitle,
  children,
}: {
  locale: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">{title}</h1>
        {subtitle && <p className="text-neutral-400 text-lg mb-10">{subtitle}</p>}
        <div className="space-y-5 text-neutral-400 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-2 [&_a]:text-[#00E5FF] [&_a:hover]:underline [&_strong]:text-white">
          {children}
        </div>
        <div className="mt-12 pt-8 border-t border-[#262626]">
          <Link href={`/${locale}/auth/register`} className="inline-flex items-center rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black px-5 py-3 text-sm font-bold">
            Start free →
          </Link>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
