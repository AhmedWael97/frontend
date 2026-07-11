"use client";

import { useState } from "react";
import { Loader2, Layers, Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toolsApi, type SitemapCheck } from "@/api/tools";
import { trackViewPlans, eyeTrack } from "@/lib/track";

export default function SitemapCreatorTool({ locale }: { locale: string }) {
  const ar = locale === "ar";
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SitemapCheck | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const full = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
      const r = await toolsApi.sitemapCheck(full);
      const data = (r.data?.data ?? r.data) as SitemapCheck;
      setResult(data);
      eyeTrack("tool_used", { tool: "sitemap_creator", url: full, pages: data.pages_crawled });
    } catch (err: any) {
      setError(err?.message || (ar ? "تعذّر الزحف لهذا الرابط." : "Could not crawl that URL."));
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    if (!result) return;
    const blob = new Blob([result.xml], { type: "application/xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sitemap.xml";
    link.click();
    URL.revokeObjectURL(link.href);
  };

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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
          {ar ? "أنشئ خريطة الموقع" : "Generate sitemap"}
        </Button>
      </form>
      {loading && (
        <p className="text-xs text-on-surface-variant">
          {ar ? "قد يستغرق هذا حتى 30 ثانية لموقع كبير…" : "This can take up to 30 seconds for a larger site…"}
        </p>
      )}

      {error && <div className="rounded-lg bg-error-container/30 border border-error/20 px-4 py-3 text-sm text-error">{error}</div>}

      {result && (
        <div className="rounded-2xl border border-outline-variant/20 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/15 bg-surface-container/40 px-5 py-4">
            <p className="text-sm text-on-surface-variant">
              {ar
                ? `تم العثور على ${result.pages_crawled} صفحة${result.truncated ? " (توقفنا عند الحد الأقصى)" : ""}`
                : `Found ${result.pages_crawled} page${result.pages_crawled === 1 ? "" : "s"}${result.truncated ? " (stopped at the free limit)" : ""}`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={copy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/30 px-3 py-1.5 text-xs font-bold text-on-surface hover:bg-surface-container"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {ar ? "نسخ XML" : "Copy XML"}
              </button>
              <button
                onClick={download}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-on-primary hover:opacity-90"
              >
                <Download className="h-3.5 w-3.5" />
                {ar ? "تحميل sitemap.xml" : "Download sitemap.xml"}
              </button>
            </div>
          </div>

          <div className="divide-y divide-outline-variant/10 max-h-72 overflow-y-auto">
            {result.pages.map((p) => (
              <div key={p.url} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span className="truncate text-on-surface">{p.url}</span>
                <span className="shrink-0 text-xs text-on-surface-variant">{p.priority}</span>
              </div>
            ))}
          </div>

          {result.truncated && (
            <div className="border-t border-outline-variant/15 bg-primary/[0.04] px-5 py-4 text-center">
              <p className="text-sm text-on-surface-variant mb-2">
                {ar
                  ? "لموقع أكبر، خريطة الموقع في EYE تدعم حتى 200 صفحة مع تحليلات الأولوية."
                  : "For a bigger site, EYE's sitemap tool supports up to 200 pages with analytics-based priority."}
              </p>
              <a
                href={`/${locale}/auth/register`}
                onClick={() => trackViewPlans()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary hover:opacity-90"
              >
                {ar ? "ابدأ مجاناً مع EYE" : "Start free with EYE"}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
