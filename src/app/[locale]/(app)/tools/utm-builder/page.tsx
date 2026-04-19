"use client";

import { useState } from "react";
import { Link2, Copy, Check, QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const UTM_PARAMS = [
  { key: "utm_source", label: "Source", placeholder: "google, newsletter, twitter…" },
  { key: "utm_medium", label: "Medium", placeholder: "cpc, email, social…" },
  { key: "utm_campaign", label: "Campaign", placeholder: "spring_sale, product_launch…" },
  { key: "utm_term", label: "Term", placeholder: "keyword (optional)" },
  { key: "utm_content", label: "Content", placeholder: "ad variant (optional)" },
];

export default function UtmBuilderPage() {
  const [base, setBase] = useState("");
  const [params, setParams] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const built = (() => {
    if (!base) return "";
    try {
      const url = new URL(base.startsWith("http") ? base : `https://${base}`);
      Object.entries(params).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
      return url.toString();
    } catch {
      return "";
    }
  })();

  const copy = () => {
    if (!built) return;
    navigator.clipboard.writeText(built);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">UTM Builder</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Build tagged URLs for campaign tracking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant flex items-center gap-2"><Link2 className="w-4 h-4" /> Campaign Parameters</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Base URL <span className="text-error">*</span></label>
              <Input value={base} onChange={(e) => setBase(e.target.value)} placeholder="https://yourwebsite.com/page" />
            </div>
            {UTM_PARAMS.map((p) => (
              <div key={p.key} className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{p.label}</label>
                <Input
                  value={params[p.key] || ""}
                  onChange={(e) => setParams((prev) => ({ ...prev, [p.key]: e.target.value }))}
                  placeholder={p.placeholder}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Generated URL</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {built ? (
                <>
                  <div className="relative">
                    <div className="bg-surface-container-lowest rounded-lg p-3 text-xs text-on-surface font-mono break-all border border-outline-variant/20 min-h-[80px]">{built}</div>
                  </div>
                  <Button onClick={copy} className="w-full">
                    {copied ? <><Check className="w-4 h-4 text-green-400" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy URL</>}
                  </Button>
                </>
              ) : (
                <div className="h-24 flex items-center justify-center text-on-surface-variant text-sm">
                  Fill in the fields above to generate a UTM URL
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center text-on-surface-variant text-sm space-y-2">
              <QrCode className="w-8 h-8 mx-auto opacity-30" />
              <p>QR code generation coming soon</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
