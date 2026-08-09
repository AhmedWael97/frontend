"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Globe, ArrowRight, Copy, Check, Loader2, PartyPopper, Download, Mail, MessageCircle } from "lucide-react";
import { domainsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { eyeTrack } from "@/lib/track";

const STEP_LABELS = ["Your website", "Install the tag", "Go live"];

const INSTALL_PLATFORMS = [
  { key: "html", label: "HTML", hint: "Paste this right before the closing </head> tag, on every page of your site." },
  { key: "wordpress", label: "WordPress", hint: "Download our plugin below → WordPress admin → Plugins → Add New → Upload → Activate → paste your token." },
  { key: "shopify", label: "Shopify", hint: "Online Store → Themes → ⋯ → Edit code → layout/theme.liquid → paste just before </head> → Save." },
  { key: "gtm", label: "Tag Manager", hint: "New Tag → Custom HTML → paste the snippet → Trigger: All Pages → Submit & publish." },
];

// Mirrors StoreDomainRequest server-side validation.
const normalizeDomain = (raw: string) =>
  raw.trim().toLowerCase()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//, "")
    .replace(/^[^/@]*@/, "")
    .split("/")[0].split("?")[0].split("#")[0].split(":")[0]
    .replace(/\.+$/, "");
const HOSTNAME_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

function StepDots({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEP_LABELS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              i === step ? "bg-primary text-on-primary" : i < step ? "bg-emerald-500/15 text-emerald-500" : "bg-surface-container text-on-surface-variant"
            }`}
          >
            {i < step ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
            <span className="hidden sm:inline">{label}</span>
          </div>
          {i < STEP_LABELS.length - 1 && <div className="w-6 h-px bg-outline-variant/40" />}
        </div>
      ))}
    </div>
  );
}

export default function ConnectWizardPage() {
  const locale = useLocale();
  const router = useRouter();
  const { setSelectedDomainId } = useAuthStore();

  const [step, setStep] = useState(0);
  const [domainInput, setDomainInput] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [domain, setDomain] = useState<{ id: number; domain: string; script_token: string } | null>(null);
  const [tab, setTab] = useState("html");
  const [copied, setCopied] = useState(false);

  const [verified, setVerified] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://eye-analysis.online").replace(/\/$/, "");
  const snippet = domain
    ? `<script src="${appUrl}/tracker/eye.js" data-token="${domain.script_token}" data-api="${appUrl}/api/collect" async></script>`
    : "";
  const platform = INSTALL_PLATFORMS.find((p) => p.key === tab) ?? INSTALL_PLATFORMS[0];

  // ── Step 1: register the domain ──────────────────────────────────────────
  const submitDomain = async () => {
    const name = normalizeDomain(domainInput);
    if (!HOSTNAME_RE.test(name) || name.length > 253) {
      setError("Enter a valid domain like example.com — no http://, no paths.");
      return;
    }
    setError(""); setSubmitting(true);
    try {
      const r = await domainsApi.create({ domain: name });
      const created = (r.data?.data ?? r.data) as { id: number; domain: string; script_token: string };
      setDomain(created);
      setSelectedDomainId(created.id);
      eyeTrack("connect_wizard_domain_added", { domain: name });
      setStep(1);
    } catch (e: any) {
      const fieldErrors = e?.errors?.domain?.[0] || (e?.errors ? Object.values(e.errors).flat().join(" ") : null);
      setError(fieldErrors || e?.message || "Could not add that domain.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 3: poll for the first event, once the domain exists ────────────
  useEffect(() => {
    if (!domain || verified || step < 1) return;
    let stop = false;
    let n = 0;
    const tick = async () => {
      if (stop || n++ > 300) return; // ~15 min ceiling
      try {
        const r = await domainsApi.verify(domain.id);
        const ok = !!(r.data?.verified ?? r.data?.data?.verified);
        if (ok) {
          if (!stop) { setVerified(true); eyeTrack("connect_wizard_verified", { domain: domain.domain }); }
          return;
        }
      } catch { /* keep polling */ }
      if (!stop) pollRef.current = setTimeout(tick, 3000);
    };
    pollRef.current = setTimeout(tick, 3000);
    return () => { stop = true; if (pollRef.current) clearTimeout(pollRef.current); };
  }, [domain, verified, step]);

  // Auto-redirect a couple seconds after the success animation lands.
  useEffect(() => {
    if (!verified) return;
    const t = setTimeout(() => router.push(`/${locale}/dashboard`), 2200);
    return () => clearTimeout(t);
  }, [verified, router, locale]);

  const copySnippet = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailto = domain
    ? `mailto:?subject=${encodeURIComponent(`Please install EYE tracking on ${domain.domain}`)}&body=${encodeURIComponent(
        `Hi,\n\nPlease add this tracking snippet to ${domain.domain}, just before the closing </head> tag on every page:\n\n${snippet}\n\nThanks!`
      )}`
    : "#";
  const whatsappUrl = domain
    ? `https://wa.me/?text=${encodeURIComponent(`Please add this tracking snippet to ${domain.domain}, just before </head> on every page:\n\n${snippet}`)}`
    : "#";

  return (
    <div className="w-full max-w-xl">
      <StepDots step={step} />

      {/* ── Step 0: domain only ──────────────────────────────────────────── */}
      {step === 0 && (
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Globe className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-on-surface">What&apos;s your website?</h1>
          <p className="text-sm text-on-surface-variant mt-2 mb-6">Just the domain — we&apos;ll give you a tracking tag on the next step.</p>
          <div className="flex flex-col gap-3 items-center">
            <input
              autoFocus
              value={domainInput}
              onChange={(e) => { setDomainInput(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && submitDomain()}
              placeholder="example.com"
              className="w-full h-12 rounded-xl border border-outline-variant/30 bg-surface px-4 text-base text-center text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <button
              onClick={submitDomain}
              disabled={!domainInput || submitting}
              className="w-full h-12 rounded-xl bg-primary text-on-primary font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4 rtl:rotate-180" /></>}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 1: install the tag ──────────────────────────────────────── */}
      {step === 1 && domain && (
        <div>
          <h1 className="text-2xl font-black text-on-surface text-center">Add this tag to {domain.domain}</h1>
          <p className="text-sm text-on-surface-variant mt-2 mb-6 text-center">One line of code. Takes about 2 minutes.</p>

          <div className="flex flex-wrap gap-1.5 justify-center mb-3">
            {INSTALL_PLATFORMS.map((p) => (
              <button
                key={p.key}
                onClick={() => setTab(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  tab === p.key ? "border-primary bg-primary/10 text-primary" : "border-outline-variant/40 text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-on-surface-variant text-center mb-3">{platform.hint}</p>
          {tab === "wordpress" && (
            <div className="flex justify-center mb-3">
              <a href="/downloads/eye-analytics.zip" download className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary px-3 py-1.5 text-xs font-bold hover:bg-primary/15">
                <Download className="w-3.5 h-3.5" /> Download WordPress plugin
              </a>
            </div>
          )}

          <div className="relative mb-4">
            <pre className="bg-surface-container-lowest rounded-xl p-4 text-xs text-on-surface-variant overflow-x-auto border border-outline-variant/20 font-mono">{snippet}</pre>
            <button onClick={copySnippet} className="absolute top-2.5 right-2.5 p-2 bg-surface-container rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors">
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 mb-6">
            <a href={mailto} className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-primary">
              <Mail className="w-3.5 h-3.5" /> Email a developer
            </a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-emerald-500">
              <MessageCircle className="w-3.5 h-3.5" /> Send via WhatsApp
            </a>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full h-12 rounded-xl bg-primary text-on-primary font-bold flex items-center justify-center gap-2"
          >
            I&apos;ve added it <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      )}

      {/* ── Step 2: listening for the first event ────────────────────────── */}
      {step === 2 && domain && (
        <div className="text-center">
          {!verified ? (
            <>
              <div className="relative w-16 h-16 mx-auto mb-6">
                <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-primary animate-spin" />
                </div>
              </div>
              <h1 className="text-2xl font-black text-on-surface">Listening for events…</h1>
              <p className="text-sm text-on-surface-variant mt-2 max-w-sm mx-auto">
                Open <span className="font-semibold text-on-surface">{domain.domain}</span> in another tab. The moment the tag fires, this page updates automatically — nothing to click.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
                <PartyPopper className="w-8 h-8 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-black text-on-surface">You&apos;re connected! 🎉</h1>
              <p className="text-sm text-on-surface-variant mt-2">
                EYE is now receiving data from <span className="font-semibold text-on-surface">{domain.domain}</span>.
              </p>
              <p className="text-xs text-on-surface-variant/70 mt-4">Taking you to your dashboard…</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
