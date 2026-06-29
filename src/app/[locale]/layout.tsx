import type { Metadata, Viewport } from "next";
import { Inter, Readex_Pro } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Providers from "@/components/Providers";
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
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
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
const EYE_LOADER = `(function(){try{var h=location.hostname;if(h==='localhost'||h==='127.0.0.1'||h.endsWith('.local'))return;var o=location.origin;window.EYE_TOKEN=${JSON.stringify(EYE_TOKEN)};window.EYE_API=o+'/api/collect';function go(){var e=document.createElement('script');e.src=o+'/tracker/eye.js';e.async=true;document.head.appendChild(e);}if('requestIdleCallback' in window){requestIdleCallback(go,{timeout:3000});}else{window.addEventListener('load',go);}}catch(e){}})();`;

// ── Google Ads (gtag.js) ─────────────────────────────────────────────────────
// Global site tag for Google Ads conversion tracking. ID is env-overridable.
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-18257861903";
const GTAG_INIT = `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', ${JSON.stringify(GOOGLE_ADS_ID)});`;

// ── TikTok Pixel ─────────────────────────────────────────────────────────────
// Pixel ID is env-overridable (NEXT_PUBLIC_TIKTOK_PIXEL_ID).
const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "D8VGP9BC77U550SVNMH0";
const TIKTOK_PIXEL = `!function (w, d, t) {w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load(${JSON.stringify(TIKTOK_PIXEL_ID)});ttq.page();}(window, document, 'ttq');`;

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
        {/* Google Ads (gtag.js) — conversion tracking */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`} />
        <script dangerouslySetInnerHTML={{ __html: GTAG_INIT }} />
        {/* TikTok Pixel */}
        <script dangerouslySetInnerHTML={{ __html: TIKTOK_PIXEL }} />
      </head>
      <body className={`${inter.variable} ${readexPro.variable} ${isArabic ? "font-arabic" : "font-sans"} antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <NavigationProgress />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

