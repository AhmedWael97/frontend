"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Globe, ArrowRight, ArrowLeft, Copy, Check, Loader2, PartyPopper, Download, Mail, MessageCircle, Link2 } from "lucide-react";
import { domainsApi } from "@/lib/api";
import { toolsApi } from "@/api/tools";
import { useSetupGate } from "@/lib/useSetupGate";
import { AiChatBubble } from "@/components/AiChatBubble";
import { useAuthStore } from "@/store/auth";
import { eyeTrack, trackDomainAdded } from "@/lib/track";

const COPY = {
  en: {
    stepLabels: ["Your website", "Install the tag", "Go live"],
    platforms: [
      { key: "html", label: "HTML", hint: "Paste this right before the closing </head> tag, on every page of your site." },
      { key: "wordpress", label: "WordPress", hint: "Download our plugin below → WordPress admin → Plugins → Add New → Upload → Activate → paste your token." },
      { key: "shopify", label: "Shopify", hint: "Online Store → Themes → ⋯ → Edit code → layout/theme.liquid → paste just before </head> → Save." },
      { key: "gtm", label: "Tag Manager", hint: "New Tag → Custom HTML → paste the snippet → Trigger: All Pages → Submit & publish." },
    ],
    invalidDomain: "Enter a valid domain like example.com — no http://, no paths.",
    createError: "Could not add that domain.",
    step0Title: "What's your website?",
    step0Sub: "Just the domain — we'll give you a tracking tag on the next step.",
    placeholder: "example.com",
    continue: "Continue",
    step1Title: (d: string) => `Add this tag to ${d}`,
    step1Sub: "One line of code. Takes about 2 minutes.",
    downloadPlugin: "Download WordPress plugin",
    emailDev: "Email a developer",
    whatsapp: "Send via WhatsApp",
    addedIt: "I've added it",
    listening: "Listening for events…",
    listeningSub: (d: string) => `Open ${d} in another tab. The moment the tag fires, this page updates automatically — nothing to click.`,
    connected: "You're connected! 🎉",
    connectedSub: (d: string) => `EYE is now receiving data from ${d}.`,
    redirecting: "Taking you to your dashboard…",
    mailSubject: (d: string) => `Please install EYE tracking on ${d}`,
    mailBody: (d: string, s: string) => `Hi,\n\nPlease add this tracking snippet to ${d}, just before the closing </head> tag on every page:\n\n${s}\n\nThanks!`,
    waText: (d: string, s: string) => `Please add this tracking snippet to ${d}, just before </head> on every page:\n\n${s}`,
  },
  ar: {
    stepLabels: ["موقعك", "تثبيت الكود", "التفعيل"],
    platforms: [
      { key: "html", label: "HTML", hint: "الصق هذا الكود قبل وسم </head> مباشرة، في كل صفحات موقعك." },
      { key: "wordpress", label: "WordPress", hint: "نزّل الإضافة بالأسفل ← لوحة تحكم ووردبريس ← الإضافات ← إضافة جديد ← رفع ← تفعيل ← الصق رمزك." },
      { key: "shopify", label: "Shopify", hint: "المتجر الإلكتروني ← القوالب ← ⋯ ← تعديل الكود ← layout/theme.liquid ← الصق قبل </head> ← حفظ." },
      { key: "gtm", label: "Tag Manager", hint: "وسم جديد ← HTML مخصص ← الصق الكود ← المشغّل: كل الصفحات ← إرسال ونشر." },
    ],
    invalidDomain: "أدخل نطاقًا صحيحًا مثل example.com — بدون http://‎ وبدون مسارات.",
    createError: "تعذّرت إضافة هذا النطاق.",
    step0Title: "ما هو موقعك؟",
    step0Sub: "النطاق فقط — سنعطيك كود التتبع في الخطوة التالية.",
    placeholder: "example.com",
    continue: "متابعة",
    step1Title: (d: string) => `أضف هذا الكود إلى ${d}`,
    step1Sub: "سطر واحد من الكود. يستغرق حوالي دقيقتين.",
    downloadPlugin: "تنزيل إضافة ووردبريس",
    emailDev: "أرسل للمطوّر بالبريد",
    whatsapp: "أرسل عبر واتساب",
    addedIt: "لقد أضفته",
    listening: "بانتظار وصول الأحداث…",
    listeningSub: (d: string) => `افتح ${d} في تبويب آخر. بمجرد أن يعمل الكود، ستتحدث هذه الصفحة تلقائيًا — لا حاجة للنقر على شيء.`,
    connected: "تم الاتصال! 🎉",
    connectedSub: (d: string) => `يستقبل EYE الآن بيانات من ${d}.`,
    redirecting: "جاري نقلك إلى لوحة التحكم…",
    mailSubject: (d: string) => `يرجى تثبيت كود تتبع EYE على ${d}`,
    mailBody: (d: string, s: string) => `مرحبًا،\n\nيرجى إضافة كود التتبع هذا إلى ${d}، قبل وسم </head> مباشرة في كل صفحة:\n\n${s}\n\nشكرًا!`,
    waText: (d: string, s: string) => `يرجى إضافة كود التتبع هذا إلى ${d}، قبل </head> في كل صفحة:\n\n${s}`,
  },
};

// Mirrors StoreDomainRequest server-side validation.
const normalizeDomain = (raw: string) =>
  raw.trim().toLowerCase()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//, "")
    .replace(/^[^/@]*@/, "")
    .split("/")[0].split("?")[0].split("#")[0].split(":")[0]
    .replace(/\.+$/, "");
const HOSTNAME_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

function StepDots({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              i === step ? "bg-primary text-on-primary" : i < step ? "bg-emerald-500/15 text-emerald-500" : "bg-surface-container text-on-surface-variant"
            }`}
          >
            {i < step ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
            <span className="hidden sm:inline">{label}</span>
          </div>
          {i < labels.length - 1 && <div className="w-6 h-px bg-outline-variant/40" />}
        </div>
      ))}
    </div>
  );
}

export default function ConnectWizardPage() {
  const locale = useLocale();
  const c = locale === "ar" ? COPY.ar : COPY.en;
  const router = useRouter();
  const { setSelectedDomainId } = useAuthStore();

  const [step, setStep] = useState(0);
  const [domainInput, setDomainInput] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [domain, setDomain] = useState<{ id: number; domain: string; script_token: string } | null>(null);
  const [tab, setTab] = useState("html");
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const [verified, setVerified] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [audit, setAudit] = useState<{ score: number; passed: number; total: number; platform?: string | null } | null>(null);
  const [auditing, setAuditing] = useState(false);
  const resumed = useRef(false);

  // Resume where the account actually is. The setup gate sends people back here
  // on every login until a tag reports in, so someone who added a domain
  // yesterday must land on the install step rather than be asked for the domain
  // again — the server's domain list is the only honest source for that.
  const { pendingDomain, loading: gateLoading } = useSetupGate();
  useEffect(() => {
    if (resumed.current || gateLoading || domain || !pendingDomain) return;
    resumed.current = true;
    setDomain(pendingDomain);
    setSelectedDomainId(pendingDomain.id);
    setStep(1);
    eyeTrack("connect_wizard_resumed", { domain: pendingDomain.domain });
  }, [pendingDomain, gateLoading, domain, setSelectedDomainId]);

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://eye-analysis.online").replace(/\/$/, "");
  const snippet = domain
    ? `<script src="${appUrl}/tracker/eye.js" data-token="${domain.script_token}" data-api="${appUrl}/api/collect" async></script>`
    : "";
  const platform = c.platforms.find((p) => p.key === tab) ?? c.platforms[0];

  // ── Step 1: register the domain ──────────────────────────────────────────
  const submitDomain = async () => {
    const name = normalizeDomain(domainInput);
    if (!HOSTNAME_RE.test(name) || name.length > 253) {
      setError(c.invalidDomain);
      return;
    }
    setError(""); setSubmitting(true);
    try {
      const r = await domainsApi.create({ domain: name });
      const created = (r.data?.data ?? r.data) as { id: number; domain: string; script_token: string };
      setDomain(created);
      setSelectedDomainId(created.id);
      eyeTrack("connect_wizard_domain_added", { domain: name });
      trackDomainAdded(name); // Google Ads/GA4 domain_added — confirmed success only
      setStep(1);
    } catch (e: any) {
      const fieldErrors = e?.errors?.domain?.[0] || (e?.errors ? Object.values(e.errors).flat().join(" ") : null);
      setError(fieldErrors || e?.message || c.createError);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Free public check — runs itself once the domain is known ────────────
  // Kept beside the install rather than as a gate before it: it reads public
  // pages only and cannot tell us anything about visitors, so making people
  // wait on it would push the one step that matters further away.
  useEffect(() => {
    if (!domain || audit || auditing) return;
    setAuditing(true);
    toolsApi
      .seoCheckPublic(`https://${domain.domain}`)
      .then((r) => {
        const d = (r.data?.data ?? r.data) as { score: number; passed: number; total: number; platform?: string | null };
        if (d && typeof d.score === "number") {
          setAudit(d);
          // Preselect the path that actually applies. Four tabs and a decision
          // sat exactly where people were quitting, and the check already had
          // to fetch their homepage to score it.
          if (d.platform && c.platforms.some((p) => p.key === d.platform)) {
            setTab(d.platform);
            eyeTrack("connect_platform_detected", { platform: d.platform });
          }
        }
      })
      .catch(() => { /* informational only — never blocks the install */ })
      .finally(() => setAuditing(false));
  }, [domain, audit, auditing]);

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

  // Changing the domain has to REMOVE the pending one, not add a second: the
  // free plan allows a single domain, so a typo would otherwise leave the
  // account stuck on "Your plan allows up to 1 domain(s)" with no way back.
  const [changing, setChanging] = useState(false);
  const changeDomain = async () => {
    if (!domain) return;
    setChanging(true);
    try {
      await domainsApi.delete(domain.id);
    } catch {
      /* Already gone, or never ours — either way the wizard should reopen. */
    }
    eyeTrack("connect_wizard_domain_changed", { domain: domain.domain });
    setSelectedDomainId(null);
    setDomain(null);
    setAudit(null);
    setVerified(false);
    setDomainInput("");
    resumed.current = true; // don't let the resume effect pull the old one back
    setStep(0);
    setChanging(false);
  };

  const [helpRequested, setHelpRequested] = useState(false);
  const [requestingHelp, setRequestingHelp] = useState(false);
  const requestHelp = async () => {
    if (!domain) return;
    setRequestingHelp(true);
    try {
      await domainsApi.requestInstallHelp(domain.id);
      setHelpRequested(true);
      eyeTrack("connect_install_help_requested", { domain: domain.domain });
    } catch {
      /* The button below still tells them we have their request either way. */
      setHelpRequested(true);
    } finally {
      setRequestingHelp(false);
    }
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailto = domain
    ? `mailto:?subject=${encodeURIComponent(c.mailSubject(domain.domain))}&body=${encodeURIComponent(c.mailBody(domain.domain, snippet))}`
    : "#";
  const whatsappUrl = domain
    ? `https://wa.me/?text=${encodeURIComponent(c.waText(domain.domain, snippet))}`
    : "#";
  const shareUrl = domain ? `${appUrl}/${locale}/install/${domain.script_token}` : "";

  return (
    <>
    <div className="w-full max-w-xl">
      <StepDots step={step} labels={c.stepLabels} />

      {/* ── Step 0: domain only ──────────────────────────────────────────── */}
      {step === 0 && (
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Globe className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-on-surface">{c.step0Title}</h1>
          <p className="text-sm text-on-surface-variant mt-2 mb-6">{c.step0Sub}</p>
          <div className="flex flex-col gap-3 items-center">
            <input
              autoFocus
              value={domainInput}
              onChange={(e) => { setDomainInput(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && submitDomain()}
              placeholder={c.placeholder}
              dir="ltr"
              className="w-full h-12 rounded-xl border border-outline-variant/30 bg-surface px-4 text-base text-center text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <button
              onClick={submitDomain}
              disabled={!domainInput || submitting}
              className="w-full h-12 rounded-xl bg-primary text-on-primary font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{c.continue} <ArrowRight className="w-4 h-4 rtl:rotate-180" /></>}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 1: install the tag ──────────────────────────────────────── */}
      {step === 1 && domain && (
        <div>
          <button
            type="button"
            onClick={changeDomain}
            disabled={changing}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface mb-3 disabled:opacity-60"
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            {locale === "ar" ? "تغيير النطاق" : "Change domain"}
          </button>
          <h1 className="text-2xl font-black text-on-surface text-center">{c.step1Title(domain.domain)}</h1>
          <p className="text-sm text-on-surface-variant mt-2 mb-4 text-center">{c.step1Sub}</p>

          {/* Free public check. Shown here rather than as a step of its own so
              it never delays the install — and labelled plainly, because
              believing this check was the product is exactly why people stopped
              at a dashboard of zeros. */}
          {(auditing || audit) && (
            <div className="mb-5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3.5 text-center">
              {auditing && !audit ? (
                <p className="text-xs text-on-surface-variant">
                  {locale === "ar" ? "جارٍ فحص صفحاتك العامة…" : "Checking your public pages…"}
                </p>
              ) : audit ? (
                <>
                  <p className="text-sm text-on-surface">
                    <span className={`font-black text-lg ${audit.score >= 80 ? "text-emerald-500" : audit.score >= 50 ? "text-amber-500" : "text-rose-500"}`}>
                      {audit.score}
                    </span>
                    <span className="text-on-surface-variant">/100</span>
                    {" — "}
                    {locale === "ar"
                      ? `${audit.passed} من ${audit.total} فحوصات ناجحة`
                      : `${audit.passed} of ${audit.total} checks passed`}
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    {locale === "ar"
                      ? "هذا الفحص يقرأ صفحاتك العامة فقط. لرؤية الزوار الفعليين أكمل التثبيت بالأسفل."
                      : "That check read your public pages only. Finish the install below to see actual visitors."}
                  </p>
                </>
              ) : null}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 justify-center mb-3">
            {c.platforms.map((p) => (
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
                <Download className="w-3.5 h-3.5" /> {c.downloadPlugin}
              </a>
            </div>
          )}

          <div className="relative mb-4">
            <pre dir="ltr" className="bg-surface-container-lowest rounded-xl p-4 text-xs text-on-surface-variant overflow-x-auto border border-outline-variant/20 font-mono text-left">{snippet}</pre>
            <button onClick={copySnippet} className="absolute top-2.5 end-2.5 p-2 bg-surface-container rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors">
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Last resort before the logout button. 57 accounts reached this
              snippet and 1 installed it, so most people here cannot act on it
              themselves — this hands them a person instead of an exit. */}
          <div className="mb-5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3.5 text-center">
            {helpRequested ? (
              <p className="text-sm text-on-surface">
                <Check className="w-4 h-4 text-emerald-500 inline-block me-1.5 align-text-bottom" />
                {locale === "ar"
                  ? "وصلنا طلبك — سنراسلك على بريدك لتركيبه نيابةً عنك."
                  : "Got it — we'll email you and install it for you."}
              </p>
            ) : (
              <>
                <p className="text-sm text-on-surface mb-2">
                  {locale === "ar" ? "لا تستطيع تعديل موقعك؟" : "Can't edit your site?"}
                </p>
                <button
                  type="button"
                  onClick={requestHelp}
                  disabled={requestingHelp}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary px-3 py-1.5 text-xs font-bold hover:bg-primary/15 disabled:opacity-60"
                >
                  {requestingHelp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
                  {locale === "ar" ? "ركّبوه لي" : "Install it for me"}
                </button>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 mb-6">
            <a href={mailto} className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-primary">
              <Mail className="w-3.5 h-3.5" /> {c.emailDev}
            </a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-emerald-500">
              <MessageCircle className="w-3.5 h-3.5" /> {c.whatsapp}
            </a>
            <button
              onClick={() => { navigator.clipboard.writeText(shareUrl); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-primary"
            >
              {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Link2 className="w-3.5 h-3.5" />} {locale === "ar" ? "انسخ رابط المشاركة" : "Copy shareable link"}
            </button>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full h-12 rounded-xl bg-primary text-on-primary font-bold flex items-center justify-center gap-2"
          >
            {c.addedIt} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
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
              <h1 className="text-2xl font-black text-on-surface">{c.listening}</h1>
              <p className="text-sm text-on-surface-variant mt-2 max-w-sm mx-auto">
                {c.listeningSub(domain.domain)}
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
                <PartyPopper className="w-8 h-8 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-black text-on-surface">{c.connected}</h1>
              <p className="text-sm text-on-surface-variant mt-2">
                {c.connectedSub(domain.domain)}
              </p>
              <p className="text-xs text-on-surface-variant/70 mt-4">{c.redirecting}</p>
            </>
          )}
        </div>
      )}
    </div>

      {/* The setup gate keeps people on this screen, so support has to be
          reachable from it. */}
      <AiChatBubble />
    </>
  );
}
