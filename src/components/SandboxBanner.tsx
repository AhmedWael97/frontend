"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { FlaskConical, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useDemoDomain } from "@/lib/useDemoDomain";

/**
 * Shown on every dashboard page while the shared sandbox domain is selected —
 * without this, seeded demo numbers could be mistaken for someone's real
 * traffic. Payment-gateway sandboxes always mark themselves this loudly too.
 */
export function SandboxBanner() {
  const locale = useLocale();
  const { selectedDomainId } = useAuthStore();
  const demo = useDemoDomain();

  if (!demo || selectedDomainId !== demo.id) return null;

  return (
    <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-400">
      <div className="flex items-center gap-2 min-w-0">
        <FlaskConical className="w-4 h-4 shrink-0" />
        <p className="text-xs sm:text-sm font-semibold truncate">
          Demo Sandbox — every page here is real, the data is seeded. Nothing you see is your own traffic.
        </p>
      </div>
      <Link
        href={`/${locale}/connect`}
        className="inline-flex items-center gap-1 text-xs font-bold shrink-0 hover:underline"
      >
        Add my website <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
      </Link>
    </div>
  );
}
