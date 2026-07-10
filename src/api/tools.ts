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

export const toolsApi = {
  /** POST /tools/speed-check */
  speedCheck: (url: string) => client.post("/tools/speed-check", { url }),
};
