"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowRight, Loader2, ScanSearch, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toolsApi } from "@/api/tools";
import { eyeTrack } from "@/lib/track";

type Issue = { id: string; label: string; message: string; severity: string };
type ScanResult = { url: string; score: number; passed: number; total: number; issues: Issue[] };

/**
 * URL-first hero: the visitor types their own site and gets a real audit before
 * being asked for anything.
 *
 * Production numbers drove this. 22,689 mobile visitors reached the landing,
 * 3,199 opened the register page and 235 signed up — but only 50 ever reached
 * the add-domain page and effectively none installed the script, because
 * pasting a <script> tag into a site's <head> is impossible on the phone they
 * arrived on. Leading with "sign up" asks for commitment before showing any
 * value, and self-selects nobody: a visitor who does not own a website can
 * still tap it. A URL box shows value in one tap, works on mobile, and filters
 * for the only audience that can ever convert — people who own a site.
 *
 * Runs against the public, unauthenticated SEO checker (throttle 10/min), so
 * no account is involved until the visitor asks to save the report.
 */
export default function HeroSiteScan() {
  const locale = useLocale();
  const ar = locale === "ar";
  const router = useRouter();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);

  const t = (en: string, arText: string) => (ar ? arText : en);

  /** Accept "example.com", "www.example.com/path" or a full URL alike. */
  const normalize = (raw: string): { host: string; url: string } | null => {
    const trimmed = raw.trim().replace(/^https?:\/\//i, "").replace(/^\/+/, "");
    const host = trimmed.split("/")[0].toLowerCase();
    // Reject anything without a dot-separated TLD before we spend a request.
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host)) return null;
    return { host, url: `https://${trimmed}` };
  };

  const scan = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = normalize(value);
    if (!target) {
      setError(t("Enter a website address, like example.com", "أدخل عنوان موقع، مثل example.com"));
      return;
    }
    setError("");
    setResult(null);
    setBusy(true);
    eyeTrack("hero_scan_submit", { host: target.host });
    try {
      const res = await toolsApi.seoCheckPublic(target.url);
      const data = (res.data?.data ?? res.data) as ScanResult;
      setResult(data);
      eyeTrack("hero_scan_result", { host: target.host, score: data?.score ?? null });
    } catch {
      setError(t("Couldn't reach that site. Check the address and try again.", "تعذّر الوصول إلى الموقع. تحقّق من العنوان وحاول مجددًا."));
      eyeTrack("hero_scan_error", { host: target.host });
    } finally {
      setBusy(false);
    }
  };

  const claim = () => {
    const target = normalize(value);
    eyeTrack("hero_scan_claim", { host: target?.host ?? "" });
    router.push(`/${locale}/get-started${target ? `?site=${encodeURIComponent(target.host)}` : ""}`);
  };

  const scoreTone =
    !result ? "" : result.score >= 80 ? "text-green-400" : result.score >= 50 ? "text-amber-400" : "text-red-400";

  return (
    <div className="mb-6">
      <form onSubmit={scan} className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="relative flex-1">
          <ScanSearch className="w-4 h-4 text-neutral-500 absolute top-1/2 -translate-y-1/2 ltr:left-3.5 rtl:right-3.5 pointer-events-none" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => eyeTrack("hero_scan_focus", {})}
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label={t("Your website address", "عنوان موقعك")}
            placeholder={t("yourwebsite.com", "موقعك.com")}
            /* text-base keeps iOS from zooming the viewport on focus. */
            className="w-full h-12 rounded-none border border-[#262626] bg-[#0A0A0A] text-white text-base placeholder:text-neutral-600 ltr:pl-10 rtl:pr-10 ltr:pr-3 rtl:pl-3 outline-none focus:border-[#00E5FF] transition-colors"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={busy}
          className="w-full sm:w-auto rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none px-7 h-12 text-base font-semibold gap-2 disabled:opacity-70"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {busy ? t("Scanning…", "جارٍ الفحص…") : t("Scan my site free", "افحص موقعي مجانًا")}
        </Button>
      </form>

      <p className="text-xs sm:text-sm font-medium text-green-400 mt-3" style={{ fontFamily: "var(--font-mono, monospace)" }}>
        {t("No signup. Real results in seconds.", "بدون تسجيل. نتائج حقيقية خلال ثوانٍ.")}
      </p>

      {error ? (
        <p className="mt-3 text-sm text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-5 border border-[#262626] bg-[#0A0A0A] p-4 text-left rtl:text-right">
          <div className="flex items-baseline gap-3 mb-3">
            <span className={`text-3xl font-bold ${scoreTone}`}>{result.score}</span>
            <span className="text-sm text-neutral-400">
              {t(
                `${result.passed} of ${result.total} checks passed`,
                `${result.passed} من ${result.total} فحوصات ناجحة`,
              )}
            </span>
          </div>

          {result.issues?.length ? (
            <ul className="space-y-2 mb-4">
              {result.issues.slice(0, 3).map((issue) => (
                <li key={issue.id} className="flex items-start gap-2 text-sm text-neutral-300">
                  <AlertTriangle
                    className={`w-4 h-4 mt-0.5 shrink-0 ${issue.severity === "high" ? "text-red-400" : "text-amber-400"}`}
                  />
                  <span>
                    <span className="text-white font-medium">{issue.label}</span> — {issue.message}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-300 mb-4">
              {t("No SEO issues found on this page.", "لا توجد مشاكل سيو في هذه الصفحة.")}
            </p>
          )}

          {result.issues?.length > 3 ? (
            <p className="text-xs text-neutral-500 mb-3">
              {t(
                `+${result.issues.length - 3} more issues in the full report`,
                `+${result.issues.length - 3} مشاكل أخرى في التقرير الكامل`,
              )}
            </p>
          ) : null}

          <Button
            onClick={claim}
            size="lg"
            className="w-full sm:w-auto rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none px-7 h-12 text-base font-semibold gap-2"
          >
            {t("See who visits & why they leave", "اعرف من يزور ولماذا يغادر")}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
