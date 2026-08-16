import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * Two ad campaigns now (TikTok, then Meta) have pointed an Arabic/Egypt-
 * majority audience straight at an explicit /en URL. next-intl won't
 * override an explicit locale prefix with Accept-Language detection by
 * design (an explicit /en in the URL is treated as the visitor's own
 * choice) — so a hardcoded ad-creative URL permanently bypasses locale
 * detection, and Arabic in-app browsers auto-translating /en is what
 * caused the #418 hydration-crash storm on the TikTok campaign.
 *
 * This redirects a FIRST-touch Arabic-language visitor away from /en (or
 * the bare, default-locale root) before next-intl runs — but only when no
 * NEXT_LOCALE cookie exists yet. Once next-intl sets that cookie (on the
 * very next response, for either locale), this never fires again for that
 * browser — so it can't loop, and it never overrides a locale the visitor
 * (or a prior visit) already established.
 */
function prefersArabic(acceptLanguage: string | null): boolean {
  if (!acceptLanguage) return false;
  const top = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, qPart] = part.trim().split(";q=");
      return { tag: tag.trim().toLowerCase(), q: qPart ? parseFloat(qPart) : 1 };
    })
    .sort((a, b) => b.q - a.q)[0];
  return !!top && top.tag.startsWith("ar");
}

const ACQ_COOKIE = "eye_acq";

/**
 * First-touch ad attribution: if this visitor has no eye_acq cookie yet and
 * the URL carries utm_source or a platform click id, capture it once. The
 * register forms read this cookie client-side and forward it to
 * POST /auth/register — the only way to trace a registered user back to the
 * ad session that brought them, since ClickHouse's post-login visitor_id
 * never carries the pre-login anonymous session's utm values.
 */
function captureAttribution(request: NextRequest, response: NextResponse): void {
  if (request.cookies.has(ACQ_COOKIE)) return;
  const sp = request.nextUrl.searchParams;
  const utmSource = sp.get("utm_source") || "";
  const clickId = sp.get("gclid") || sp.get("ttclid") || sp.get("fbclid") || "";
  if (!utmSource && !clickId) return;

  const value = encodeURIComponent(JSON.stringify({
    s: utmSource,
    m: sp.get("utm_medium") || "",
    c: sp.get("utm_campaign") || "",
    cid: clickId,
  }));
  response.cookies.set(ACQ_COOKIE, value, {
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
  });
}

export default function middleware(request: NextRequest) {
  const hasLocaleCookie = request.cookies.has("NEXT_LOCALE");
  const { pathname, search } = request.nextUrl;
  // Not already on /ar — covers both an explicit /en prefix and the
  // prefix-less default-locale root (e.g. "/", "/pricing").
  const isNonArabicPath = !pathname.startsWith("/ar");

  let response: NextResponse;
  if (!hasLocaleCookie && isNonArabicPath && prefersArabic(request.headers.get("accept-language"))) {
    const arPath = pathname.startsWith("/en") ? pathname.replace(/^\/en/, "/ar") : `/ar${pathname}`;
    response = NextResponse.redirect(new URL(arPath + search, request.url), 307);
  } else {
    response = intlMiddleware(request);
  }

  captureAttribution(request, response);
  return response;
}

export const config = {
  matcher: ["/((?!_next|_vercel|api|.*\\..*).*)"],
};
