"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Eye, Copy, Check, Loader2, PartyPopper, Download, Mail, MessageCircle, AlertTriangle } from "lucide-react";
import { installGuideApi } from "@/api/installGuide";

const COPY = {
  en: {
    tagline: "Install guide",
    loading: "Loading your install guide…",
    invalidTitle: "This link isn't valid",
    invalidBody: "It may have expired or the domain was removed. Ask whoever sent it for a fresh one, or log in to eye-analysis.online to get your snippet.",
    title: (d: string) => `Let's connect ${d}`,
    subtitle: "Pick your platform below, add the tag, done. Takes about 2 minutes.",
    platforms: [
      { key: "html", label: "HTML", hint: "Paste this right before the closing </head> tag, on every page of your site." },
      { key: "wordpress", label: "WordPress", hint: "Download our plugin below → WordPress admin → Plugins → Add New → Upload → Activate → paste your token." },
      { key: "shopify", label: "Shopify", hint: "Online Store → Themes → ⋯ → Edit code → layout/theme.liquid → paste just before </head> → Save." },
      { key: "gtm", label: "Tag Manager", hint: "New Tag → Custom HTML → paste the snippet → Trigger: All Pages → Submit & publish." },
    ],
    downloadPlugin: "Download WordPress plugin",
    emailDev: "Email a developer",
    whatsapp: "Send via WhatsApp",
    listening: "Listening for events…",
    listeningSub: (d: string) => `Open ${d} in another tab. This page updates automatically the moment the tag fires — nothing else to click.`,
    connected: "You're connected! 🎉",
    connectedSub: (d: string) => `EYE is now receiving data from ${d}.`,
    loginCta: "Log in to see your dashboard",
    mailSubject: (d: string) => `Please install EYE tracking on ${d}`,
    mailBody: (d: string, s: string) => `Hi,\n\nPlease add this tracking snippet to ${d}, just before the closing </head> tag on every page:\n\n${s}\n\nThanks!`,
    waText: (d: string, s: string) => `Please add this tracking snippet to ${d}, just before </head> on every page:\n\n${s}`,
  },
  ar: {
    tagline: "دليل التثبيت",
    loading: "جارٍ تحميل دليل التثبيت…",
    invalidTitle: "هذا الرابط غير صالح",
    invalidBody: "قد يكون منتهي الصلاحية أو تم حذف النطاق. اطلب رابطًا جديدًا ممن أرسله لك، أو سجّل الدخول إلى eye-analysis.online للحصول على الكود.",
    title: (d: string) => `لنقم بربط ${d}`,
    subtitle: "اختر منصتك بالأسفل، أضف الكود، وانتهى الأمر. يستغرق حوالي دقيقتين.",
    platforms: [
      { key: "html", label: "HTML", hint: "الصق هذا الكود قبل وسم </head> مباشرة، في كل صفحات موقعك." },
      { key: "wordpress", label: "WordPress", hint: "نزّل الإضافة بالأسفل ← لوحة تحكم ووردبريس ← الإضافات ← إضافة جديد ← رفع ← تفعيل ← الصق رمزك." },
      { key: "shopify", label: "Shopify", hint: "المتجر الإلكتروني ← القوالب ← ⋯ ← تعديل الكود ← layout/theme.liquid ← الصق قبل </head> ← حفظ." },
      { key: "gtm", label: "Tag Manager", hint: "وسم جديد ← HTML مخصص ← الصق الكود ← المشغّل: كل الصفحات ← إرسال ونشر." },
    ],
    downloadPlugin: "تنزيل إضافة ووردبريس",
    emailDev: "أرسل للمطوّر بالبريد",
    whatsapp: "أرسل عبر واتساب",
    listening: "بانتظار وصول الأحداث…",
    listeningSub: (d: string) => `افتح ${d} في تبويب آخر. تتحدث هذه الصفحة تلقائيًا بمجرد أن يعمل الكود — لا حاجة للنقر على شيء.`,
    connected: "تم الاتصال! 🎉",
    connectedSub: (d: string) => `يستقبل EYE الآن بيانات من ${d}.`,
    loginCta: "سجّل الدخول لمشاهدة لوحة التحكم",
    mailSubject: (d: string) => `يرجى تثبيت كود تتبع EYE على ${d}`,
    mailBody: (d: string, s: string) => `مرحبًا،\n\nيرجى إضافة كود التتبع هذا إلى ${d}، قبل وسم </head> مباشرة في كل صفحة:\n\n${s}\n\nشكرًا!`,
    waText: (d: string, s: string) => `يرجى إضافة كود التتبع هذا إلى ${d}، قبل </head> في كل صفحة:\n\n${s}`,
  },
};

export default function PublicInstallGuidePage() {
  const params = useParams();
  const token = String(params?.token || "");
  const locale = useLocale();
  const c = locale === "ar" ? COPY.ar : COPY.en;

  const [status, setStatus] = useState<"loading" | "invalid" | "ready">("loading");
  const [domain, setDomain] = useState("");
  const [tab, setTab] = useState("html");
  const [copied, setCopied] = useState(false);
  const [verified, setVerified] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://eye-analysis.online").replace(/\/$/, "");
  const snippet = domain ? `<script src="${appUrl}/tracker/eye.js" data-token="${token}" data-api="${appUrl}/api/collect" async></script>` : "";
  const platform = c.platforms.find((p) => p.key === tab) ?? c.platforms[0];

  useEffect(() => {
    if (!token) return;
    installGuideApi.show(token)
      .then((r) => {
        const data = (r.data?.data ?? r.data) as { domain: string; verified: boolean };
        setDomain(data.domain);
        setVerified(!!data.verified);
        setStatus("ready");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  useEffect(() => {
    if (status !== "ready" || verified) return;
    let stop = false;
    let n = 0;
    const tick = async () => {
      if (stop || n++ > 300) return;
      try {
        const r = await installGuideApi.verify(token);
        const ok = !!(r.data?.data?.verified ?? r.data?.verified);
        if (ok) { if (!stop) setVerified(true); return; }
      } catch { /* keep polling */ }
      if (!stop) pollRef.current = setTimeout(tick, 3000);
    };
    pollRef.current = setTimeout(tick, 3000);
    return () => { stop = true; if (pollRef.current) clearTimeout(pollRef.current); };
  }, [status, verified, token]);

  const copySnippet = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailto = `mailto:?subject=${encodeURIComponent(c.mailSubject(domain))}&body=${encodeURIComponent(c.mailBody(domain, snippet))}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(c.waText(domain, snippet))}`;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="flex items-center justify-center px-5 sm:px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black tracking-tighter text-primary uppercase">EYE</span>
          <span className="text-xs text-on-surface-variant ltr:ml-2 rtl:mr-2">· {c.tagline}</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-xl">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-3 text-on-surface-variant">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-sm">{c.loading}</p>
            </div>
          )}

          {status === "invalid" && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-7 h-7 text-error" />
              </div>
              <h1 className="text-xl font-black text-on-surface">{c.invalidTitle}</h1>
              <p className="text-sm text-on-surface-variant mt-2 max-w-sm mx-auto">{c.invalidBody}</p>
              <Link href={`/${locale}/auth/login`} className="inline-block mt-6 rounded-xl bg-primary text-on-primary font-bold px-6 py-3 text-sm">
                {c.loginCta}
              </Link>
            </div>
          )}

          {status === "ready" && !verified && (
            <div>
              <h1 className="text-2xl font-black text-on-surface text-center">{c.title(domain)}</h1>
              <p className="text-sm text-on-surface-variant mt-2 mb-6 text-center">{c.subtitle}</p>

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
                <pre className="bg-surface-container-lowest rounded-xl p-4 text-xs text-on-surface-variant overflow-x-auto border border-outline-variant/20 font-mono">{snippet}</pre>
                <button onClick={copySnippet} className="absolute top-2.5 right-2.5 p-2 bg-surface-container rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 mb-8">
                <a href={mailto} className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-primary">
                  <Mail className="w-3.5 h-3.5" /> {c.emailDev}
                </a>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-emerald-500">
                  <MessageCircle className="w-3.5 h-3.5" /> {c.whatsapp}
                </a>
              </div>

              <div className="text-center">
                <div className="relative w-10 h-10 mx-auto mb-3">
                  <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                  <div className="relative w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  </div>
                </div>
                <p className="text-sm font-bold text-on-surface">{c.listening}</p>
                <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">{c.listeningSub(domain)}</p>
              </div>
            </div>
          )}

          {status === "ready" && verified && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
                <PartyPopper className="w-8 h-8 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-black text-on-surface">{c.connected}</h1>
              <p className="text-sm text-on-surface-variant mt-2">{c.connectedSub(domain)}</p>
              <Link href={`/${locale}/auth/login`} className="inline-block mt-6 rounded-xl bg-primary text-on-primary font-bold px-6 py-3 text-sm">
                {c.loginCta}
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
