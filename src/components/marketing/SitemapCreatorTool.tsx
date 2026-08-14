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
          className="flex-1 h-12 text-base rounded-none bg-[#0A0A0A] border border-[#262626] text-white focus:ring-[#00E5FF]/40 focus:border-[#00E5FF]/50"
        />
        <Button type="submit" disabled={loading} className="h-12 gap-2 sm:px-8 rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
          {ar ? "أنشئ خريطة الموقع" : "Generate sitemap"}
        </Button>
      </form>
      {loading && (
        <p className="text-xs text-neutral-500">
          {ar ? "قد يستغرق هذا حتى 30 ثانية لموقع كبير…" : "This can take up to 30 seconds for a larger site…"}
        </p>
      )}

      {error && <div className="rounded-none bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400">{error}</div>}

      {result && (
        <div className="border border-[#262626] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262626] bg-[#0A0A0A] px-5 py-4">
            <p className="text-sm text-neutral-400">
              {ar
                ? `تم العثور على ${result.pages_crawled} صفحة${result.truncated ? " (توقفنا عند الحد الأقصى)" : ""}`
                : `Found ${result.pages_crawled} page${result.pages_crawled === 1 ? "" : "s"}${result.truncated ? " (stopped at the free limit)" : ""}`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={copy}
                className="inline-flex items-center gap-1.5 rounded-none border border-[#262626] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#171717]"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {ar ? "نسخ XML" : "Copy XML"}
              </button>
              <button
                onClick={download}
                className="inline-flex items-center gap-1.5 rounded-none bg-[#00E5FF] px-3 py-1.5 text-xs font-bold text-black hover:bg-[#33EAFF]"
              >
                <Download className="h-3.5 w-3.5" />
                {ar ? "تحميل sitemap.xml" : "Download sitemap.xml"}
              </button>
            </div>
          </div>

          <div className="divide-y divide-[#262626] max-h-72 overflow-y-auto">
            {result.pages.map((p) => (
              <div key={p.url} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span className="truncate text-white">{p.url}</span>
                <span className="shrink-0 text-xs text-neutral-500">{p.priority}</span>
              </div>
            ))}
          </div>

          {result.truncated && (
            <div className="border-t border-[#262626] bg-[#00E5FF]/5 px-5 py-4 text-center">
              <p className="text-sm text-neutral-400 mb-2">
                {ar
                  ? "لموقع أكبر، خريطة الموقع في EYE تدعم حتى 200 صفحة مع تحليلات الأولوية."
                  : "For a bigger site, EYE's sitemap tool supports up to 200 pages with analytics-based priority."}
              </p>
              <a
                href={`/${locale}/auth/register`}
                onClick={() => trackViewPlans()}
                className="inline-flex items-center gap-1.5 rounded-none bg-[#00E5FF] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#33EAFF]"
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
