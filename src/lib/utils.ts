import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number, locale = "en"): string {
  return new Intl.NumberFormat(locale).format(n);
}

export function formatDate(date: string | Date, locale = "en", timezone = "UTC"): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: timezone,
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Resolve a country to its full, locale-aware name (e.g. "EG" → "Egypt",
 * "السعودية" in Arabic). Only ISO 3166-1 alpha-2 codes resolve; anything else
 * (already-full names, unknown values) is passed through unchanged.
 */
export function countryName(code?: string | null, locale = "en"): string {
  if (!code) return "—";
  const c = code.trim();
  if (!/^[A-Za-z]{2}$/.test(c)) return c;
  try {
    const dn = new Intl.DisplayNames([locale], { type: "region" });
    return dn.of(c.toUpperCase()) || c;
  } catch {
    return c;
  }
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}
