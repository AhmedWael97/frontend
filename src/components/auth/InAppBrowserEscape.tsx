"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { ExternalLink, X } from "lucide-react";
import { eyeTrack } from "@/lib/track";

// Facebook's Android in-app browser (FB_IAB) has a long-standing, widely
// reported bug: text-input focus / the virtual keyboard doesn't reliably
// work. Confirmed in our own data — button clicks (Google/Facebook login)
// fire fine, but onFocus on the email/password inputs almost never does,
// and registration completions are stuck at zero despite real traffic.
// Nothing on our side can fix Facebook's webview, so the only real
// mitigation is getting the visitor OUT of it before they hit the form.
export default function InAppBrowserEscape() {
  const locale = useLocale();
  const ar = locale === "ar";
  const [visible, setVisible] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    if (!/Instagram|FBAN|FBAV/i.test(ua)) return;
    setIsAndroid(/Android/i.test(ua));
    setVisible(true);
    eyeTrack("in_app_browser_detected", { platform: /Android/i.test(ua) ? "android" : "ios" });
  }, []);

  if (!visible) return null;

  const openInChrome = () => {
    eyeTrack("in_app_browser_escape_click", {});
    // Forces Android Chrome to open this exact URL, bypassing the broken
    // in-app webview entirely — a well-known intent:// escape trick.
    const url = window.location.href.replace(/^https?:\/\//, "");
    window.location.href = `intent://${url}#Intent;scheme=https;package=com.android.chrome;end`;
  };

  return (
    <div className="sticky top-0 z-50 bg-amber-500 text-amber-950 px-4 py-3 text-sm font-semibold flex items-center gap-3 shadow-lg">
      <span className="flex-1">
        {ar
          ? "متصفح فيسبوك المدمج قد يمنع الكتابة في النموذج. افتح الصفحة في متصفحك الحقيقي لإتمام التسجيل."
          : "Facebook's built-in browser can block typing in this form. Open this page in your real browser to sign up."}
      </span>
      {isAndroid ? (
        <button
          onClick={openInChrome}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-amber-950 text-amber-50 px-3 py-1.5 text-xs font-bold whitespace-nowrap"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {ar ? "افتح في Chrome" : "Open in Chrome"}
        </button>
      ) : (
        <span className="shrink-0 text-xs font-bold whitespace-nowrap">
          {ar ? "⋮ ← افتح في Safari" : "Tap ⋯ → Open in Safari"}
        </span>
      )}
      <button
        onClick={() => setVisible(false)}
        aria-label={ar ? "إغلاق" : "Dismiss"}
        className="shrink-0 text-amber-950/70 hover:text-amber-950"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
