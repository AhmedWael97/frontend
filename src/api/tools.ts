/**
 * Public marketing lead-magnet tools (no login required).
 */
import client from "./client";

export interface SpeedCheck {
  url: string;
  score: number;
  ttfb_ms: number;
  total_ms: number;
  size_kb: number;
  checks: Array<{ id: string; label: string; status: "pass" | "warn" | "fail"; detail: string }>;
}

export interface SeoCheckItem {
  id: string;
  label: string;
  message: string;
  status: "pass" | "fail" | "warn";
  severity: "critical" | "high" | "warning" | "info" | "pass";
  suggestion: string | null;
}

export interface SeoCheck {
  url: string;
  score: number;
  passed: number;
  total: number;
  issues: SeoCheckItem[];
  passing: SeoCheckItem[];
}

export const toolsApi = {
  /** POST /tools/speed-check */
  speedCheck: (url: string) => client.post("/tools/speed-check", { url }),

  /** POST /tools/seo-check-public */
  seoCheckPublic: (url: string) => client.post("/tools/seo-check-public", { url }),
};
