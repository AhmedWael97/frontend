"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertTriangle, XCircle, Info, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toolsApi, type SeoCheck, type SeoCheckItem } from "@/api/tools";
import { trackViewPlans, eyeTrack } from "@/lib/track";

const STATUS: Record<string, { Icon: typeof CheckCircle2; cls: string }> = {
  pass: { Icon: CheckCircle2, cls: "text-emerald-500" },
  warn: { Icon: AlertTriangle, cls: "text-amber-500" },
  fail: { Icon: XCircle, cls: "text-error" },
};

export default function SeoCheckerTool({ locale }: { locale: string }) {
  const ar = locale === "ar";
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SeoCheck | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const full = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
      const r = await toolsApi.seoCheckPublic(full);
      const data = (r.data?.data ?? r.data) as SeoCheck;
      setResult(data);
      eyeTrack("tool_used", { tool: "seo_checker", url: full, score: data.score });
    } catch (err: any) {
      setError(err?.message || (ar ? "تعذّر فحص هذا الرابط." : "Could not check that URL."));
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s: number) => (s >= 80 ? "text-emerald-500" : s >= 50 ? "text-amber-500" : "text-error");
  const items: SeoCheckItem[] = result ? [...result.issues, ...result.passing] : [];

  return (
    <div className="not-prose space-y-6">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com"
          className="flex-1 h-12 text-base"
        />
        <Button type="submit" disabled={loading} className="h-12 gap-2 sm:px-8">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
          {ar ? "افحص السيو" : "Check SEO"}
        </Button>
      </form>

      {error && <div className="rounded-lg bg-error-container/30 border border-error/20 px-4 py-3 text-sm text-error">{error}</div>}

      {result && (
        <div className="rounded-2xl border border-outline-variant/20 overflow-hidden">
          <div className="flex flex-wrap items-center gap-6 border-b border-outline-variant/15 bg-surface-container/40 px-5 py-4">
            <div className="text-center">
              <p className={`text-4xl font-black ${scoreColor(result.score)}`}>{result.score}</p>
              <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">{ar ? "الدرجة" : "Score"}</p>
            </div>
            <p className="text-sm text-on-surface-variant">
              {ar
                ? `نجح ${result.passed} من ${result.total} فحصاً`
                : `${result.passed} of ${result.total} checks passed`}
            </p>
          </div>

          <div className="divide-y divide-outline-variant/10">
            {items.map((c) => {
              const s = STATUS[c.status] ?? STATUS.warn;
              const { Icon } = s;
              return (
                <div key={c.id} className="flex gap-3 p-4">
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${s.cls}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-on-surface">{c.label}</p>
                    <p className="text-sm text-on-surface-variant">{c.message}</p>
                    {c.suggestion && <p className="mt-1 text-sm text-primary">{c.suggestion}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-outline-variant/15 bg-primary/[0.04] px-5 py-4 text-center">
            <p className="text-sm text-on-surface-variant mb-2">
              {ar
                ? "أراد تتبّع مواقعك بحثاً عن هذه المشاكل تلقائياً؟"
                : "Want to track sites for these issues automatically?"}
            </p>
            <a
              href={`/${locale}/auth/register`}
              onClick={() => trackViewPlans()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary hover:opacity-90"
            >
              {ar ? "ابدأ مجاناً مع EYE" : "Start free with EYE"}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
