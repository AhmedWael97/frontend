"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/lib/use-toast";
import { eyeTrack } from "@/lib/track";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

/**
 * Google One-Tap: opportunistic 1-tap sign-in prompt. Loads Google GSI, shows
 * the One-Tap card, and on credential POSTs the JWT to /auth/google/one-tap.
 * Silent on any failure (unconfigured client id, closed prompt, unauthorized
 * origin) — it never blocks the page. Skipped when already logged in.
 */
export default function GoogleOneTap() {
  const router = useRouter();
  const locale = useLocale();
  const { token, setToken, setUser } = useAuthStore();
  const done = useRef(false);

  useEffect(() => {
    if (!CLIENT_ID || token) return;
    // Google's GSI script probes native app bridges internally and throws
    // uncaught errors inside Instagram/Facebook's in-app WebView (seen in
    // production as "window.webkit.messageHandlers" / "Java object is gone"
    // js_errors) — a known GSI-vs-in-app-browser incompatibility, not
    // something we can catch from our side. Skip entirely there; the
    // email/password + explicit "Continue with Google" button still work.
    if (/Instagram|FBAN|FBAV/i.test(navigator.userAgent)) return;
    let cancelled = false;

    const handle = async (resp: { credential?: string }) => {
      if (done.current || !resp?.credential) return;
      done.current = true;
      eyeTrack("google_one_tap_credential", {});
      try {
        const ref = new URLSearchParams(window.location.search).get("ref") || undefined;
        const r = await authApi.googleOneTap(resp.credential, ref);
        setToken(r.data.token);
        setUser(r.data.user);
        toast.success(locale === "ar" ? "تم الدخول عبر Google" : "Signed in with Google");
        router.push(r.data.user?.role === "superadmin" ? `/${locale}/admin` : `/${locale}/dashboard`);
      } catch {
        done.current = false; // allow a retry on the next prompt
      }
    };

    const init = () => {
      const g = (window as any).google;
      if (!g?.accounts?.id || cancelled) return;
      try {
        g.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handle,
          cancel_on_tap_outside: false,
          itp_support: true,
        });
        g.accounts.id.prompt();
        eyeTrack("google_one_tap_shown", {});
      } catch {
        /* opportunistic */
      }
    };

    const existing = document.getElementById("gsi-client");
    if (existing && (window as any).google?.accounts?.id) {
      init();
    } else if (!existing) {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.id = "gsi-client";
      s.onload = init;
      document.head.appendChild(s);
    } else {
      existing.addEventListener("load", init, { once: true });
    }

    return () => {
      cancelled = true;
    };
  }, [token, locale, router, setToken, setUser]);

  return null;
}
