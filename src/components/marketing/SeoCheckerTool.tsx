"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertTriangle, XCircle, Info, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toolsApi, type SeoCheck, type SeoCheckItem } from "@/api/tools";
import { trackViewPlans, eyeTrack } from "@/lib/track";

const mono = { fontFamily: "var(--font-mono-marketing)" };
const STATUS: Record<string, { Icon: typeof CheckCircle2; cls: string }> = {
  pass: { Icon: CheckCircle2, cls: "text-green-400" },
  warn: { Icon: AlertTriangle, cls: "text-amber-400" },
  fail: { Icon: XCircle, cls: "text-red-400" },
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

  const scoreColor = (s: number) => (s >= 80 ? "text-green-400" : s >= 50 ? "text-amber-400" : "text-red-400");
  const items: SeoCheckItem[] = result ? [...result.issues, ...result.passing] : [];

  return (
    <div className="not-prose space-y-6">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com"
          className="flex-1 h-12 text-base rounded-none bg-[#0A0A0A] border border-[#262626] text-white focus:ring-[#00E5FF]/40 focus:border-[#00E5FF]/50"
        />
        <Button type="submit" disabled={loading} className="h-12 gap-2 sm:px-8 rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
          {ar ? "افحص السيو" : "Check SEO"}
        </Button>
      </form>

      {error && <div className="rounded-none bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400">{error}</div>}

      {result && (
        <div className="border border-[#262626] overflow-hidden">
          <div className="flex flex-wrap items-center gap-6 border-b border-[#262626] bg-[#0A0A0A] px-5 py-4">
            <div className="text-center">
              <p className={`text-4xl font-bold ${scoreColor(result.score)}`} style={mono}>{result.score}</p>
              <p className="text-[11px] uppercase tracking-widest text-neutral-500" style={mono}>{ar ? "الدرجة" : "Score"}</p>
            </div>
            <p className="text-sm text-neutral-400">
              {ar
                ? `نجح ${result.passed} من ${result.total} فحصاً`
                : `${result.passed} of ${result.total} checks passed`}
            </p>
          </div>

          <div className="divide-y divide-[#262626]">
            {items.map((c) => {
              const s = STATUS[c.status] ?? STATUS.warn;
              const { Icon } = s;
              return (
                <div key={c.id} className="flex gap-3 p-4">
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${s.cls}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">{c.label}</p>
                    <p className="text-sm text-neutral-400">{c.message}</p>
                    {c.suggestion && <p className="mt-1 text-sm text-[#00E5FF]">{c.suggestion}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#262626] bg-[#00E5FF]/5 px-5 py-4 text-center">
            <p className="text-sm text-neutral-400 mb-2">
              {ar
                ? "أراد تتبّع مواقعك بحثاً عن هذه المشاكل تلقائياً؟"
                : "Want to track sites for these issues automatically?"}
            </p>
            <a
              href={`/${locale}/auth/register`}
              onClick={() => trackViewPlans()}
              className="inline-flex items-center gap-1.5 rounded-none bg-[#00E5FF] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#33EAFF]"
            >
              {ar ? "ابدأ مجاناً مع EYE" : "Start free with EYE"}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
