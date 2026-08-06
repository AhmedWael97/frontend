import type { Metadata, Viewport } from "next";
import { Inter, Readex_Pro } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Providers from "@/components/Providers";
import SupportChatBubble from "@/components/SupportChatBubble";
import ExitIntentPopup from "@/components/marketing/ExitIntentPopup";
import { NavigationProgress } from "@/components/NavigationProgress";
import { SITE_URL, SITE_NAME, TWITTER_HANDLE, DEFAULT_KEYWORDS } from "@/lib/seo";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const readexPro = Readex_Pro({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"], // trimmed from 6 weights — lighter mobile font payload
  variable: "--font-arabic",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isAr = params.locale === "ar";
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: "EYE — AI Visitor Intelligence", template: "%s | EYE" },
    description: isAr
      ? "منصة تحليلات زوار مدعومة بالذكاء الاصطناعي: لوحات لحظية، خرائط حرارية، تحليل القمع، وإثراء بيانات الشركات."
      : "AI-powered visitor tracking and analytics platform. Real-time dashboards, heatmaps, funnel analysis, B2B enrichment, and more.",
    keywords: DEFAULT_KEYWORDS,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: isAr ? "ar_SA" : "en_US",
      // Next.js only auto-attaches the opengraph-image.tsx convention file when
      // no explicit `images` is set here — since this object IS set (for
      // siteName/locale), it silently suppressed the image with no error.
      // Confirmed missing via our own new SEO checker tool (dogfooding).
      images: [`${SITE_URL}/${isAr ? "ar" : "en"}/opengraph-image`],
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      images: [`${SITE_URL}/${isAr ? "ar" : "en"}/twitter-image`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    // Search Console / Bing Webmaster site-ownership verification — set once
    // per env var, no code change needed to add/rotate a verification code.
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
      other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
        : undefined,
    },
  };
}

// ── EYE self-tracking (dogfooding) ───────────────────────────────────────────
// We track our own site with our own product. Token/host are env-overridable.
const EYE_TOKEN = process.env.NEXT_PUBLIC_EYE_TOKEN || "9d9c35ffcf7fa952ead4341171a76df088bda921239e20f1892673b314ce348d";
// Sets the token/api as globals (eye.js reads window.EYE_TOKEN/EYE_API), then
// injects the tracker. Loads from the CURRENT origin (location.origin) so the
// app is self-contained on whatever domain it's opened from — e.g. on
// eye-analysis.online it loads /tracker/eye.js and posts to /api/collect on
// eye-analysis.online, not the other domain. Skips localhost so dev never
// pollutes production analytics. Defers to idle/load so it never blocks paint.
// data-replay="true": records session replay (rrweb) — the ~100KB weight was
// previously skipped on our own marketing site for perf, but replay is what
// lets us actually watch the FB-in-app-browser register-page breakage.
// Stub installed synchronously (before the real script loads) so
// EYE.track()/identify()/purchase() calls made in the gap — up to ~3s, since
// the real script is deferred to requestIdleCallback for performance — queue
// instead of silently no-oping. eye.js replays window.EYE.q once it loads.
// Without this, exactly the fastest / highest-intent users (e.g. someone who
// completes registration in a few seconds) were the least likely to ever be
// tracked, because they finished before the deferred loader even ran.
const EYE_LOADER = `(function(){try{var h=location.hostname;if(h==='localhost'||h==='127.0.0.1'||h.endsWith('.local'))return;var o=location.origin;window.EYE_TOKEN=${JSON.stringify(EYE_TOKEN)};window.EYE_API=o+'/api/collect';window.EYE=window.EYE||{q:[]};['track','identify','purchase'].forEach(function(m){window.EYE[m]=window.EYE[m]||function(){window.EYE.q.push([m,arguments]);};});function go(){var e=document.createElement('script');e.src=o+'/tracker/eye.js';e.async=true;e.setAttribute('data-replay','true');document.head.appendChild(e);}if('requestIdleCallback' in window){requestIdleCallback(go,{timeout:3000});}else{window.addEventListener('load',go);}}catch(e){}})();`;

// ── Google Ads (gtag.js) ─────────────────────────────────────────────────────
// Global site tag for Google Ads conversion tracking. ID is env-overridable.
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-18257861903";
// NOTE: gtag.js must load eagerly, not deferred to requestIdleCallback/on-load.
// It was deferred for a perf pass (commit 3eb00be) — but the *only* thing that
// flushes queued dataLayer events (incl. the signup "conversion" event) to
// Google's servers is this script loading. A visitor who registers fast and
// then closes the tab / backgrounds an ad-network in-app browser before the
// idle callback fires never sends the beacon — conversions silently undercount.
// The script tag itself is `async`, so it doesn't block first paint anyway.
const GTAG_INIT = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(GOOGLE_ADS_ID)});`;

// ── TikTok Pixel ─────────────────────────────────────────────────────────────
// NOTE: was wrapped in an idle-defer helper — worse than the gtag bug above,
// since `window.ttq` itself was only defined once the idle callback ran, so
// ttTrack() calls before that weren't even queued, just silently dropped.
// Loads eagerly now; the snippet's own injected script tag is `async` already.
// Pixel ID is env-overridable (NEXT_PUBLIC_TIKTOK_PIXEL_ID).
const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "D8VGP9BC77U550SVNMH0";
const TIKTOK_PIXEL = `!function (w, d, t) {w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load(${JSON.stringify(TIKTOK_PIXEL_ID)});ttq.page();}(window, document, 'ttq');`;

// ── Meta (Facebook) Pixel ────────────────────────────────────────────────────
// Same eager-load rule as gtag/TikTok above — fbq must exist immediately so a
// fast register-then-bounce visitor's CompleteRegistration event isn't dropped.
// Pixel ID is env-overridable (NEXT_PUBLIC_META_PIXEL_ID).
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1080968574489749";
const META_PIXEL = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(META_PIXEL_ID)});fbq('track','PageView');`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  const messages = await getMessages();
  const isArabic = locale === "ar";

  return (
    <html
      lang={locale}
      dir={isArabic ? "rtl" : "ltr"}
      className="dark"
      suppressHydrationWarning
    >
      {/* Runs synchronously before hydration to apply saved theme, avoiding flash */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('eye-appearance');if(t==='light')document.documentElement.classList.remove('dark');else if(t==='system'&&!window.matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.classList.remove('dark');}catch(e){}` }} />
        {/* EYE self-tracking: loads our own tracker + replay (skips localhost) */}
        <script dangerouslySetInnerHTML={{ __html: EYE_LOADER }} />
        {/* Google Ads (gtag.js) — eager (async), so conversions aren't lost to fast bounces */}
        <script async crossOrigin="anonymous" src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`} />
        <script dangerouslySetInnerHTML={{ __html: GTAG_INIT }} />
        {/* TikTok Pixel — eager, so ttq exists immediately and CompleteRegistration isn't dropped */}
        <script dangerouslySetInnerHTML={{ __html: TIKTOK_PIXEL }} />
        {/* Meta Pixel — eager, same reason */}
        <script dangerouslySetInnerHTML={{ __html: META_PIXEL }} />
        <noscript>
          <img height="1" width="1" style={{ display: "none" }} src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} alt="" />
        </noscript>
      </head>
      <body className={`${inter.variable} ${readexPro.variable} ${isArabic ? "font-arabic" : "font-sans"} antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <NavigationProgress />
            {children}
            <div className="print:hidden"><SupportChatBubble /><ExitIntentPopup /></div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

