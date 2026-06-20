import type { Metadata } from "next";
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
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

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
const EYE_HOST = process.env.NEXT_PUBLIC_EYE_HOST || "https://eye-analsyis.live";
const EYE_TOKEN = process.env.NEXT_PUBLIC_EYE_TOKEN || "9d9c35ffcf7fa952ead4341171a76df088bda921239e20f1892673b314ce348d";
const EYE_API = process.env.NEXT_PUBLIC_EYE_API || `${EYE_HOST}/api/collect`;
// Sets the token/api as globals (eye.js reads window.EYE_TOKEN/EYE_API), then
// injects the tracker + replay recorder. Skips localhost so dev never pollutes
// production analytics. Single load each — no data-replay (avoids double-record).
const EYE_LOADER = `(function(){try{var h=location.hostname;if(h==='localhost'||h==='127.0.0.1'||h.endsWith('.local'))return;window.EYE_TOKEN=${JSON.stringify(EYE_TOKEN)};window.EYE_API=${JSON.stringify(EYE_API)};function L(s){var e=document.createElement('script');e.src=s;e.async=true;document.head.appendChild(e);}L(${JSON.stringify(EYE_HOST + "/tracker/eye.js")});L(${JSON.stringify(EYE_HOST + "/tracker/eye-replay.js")});}catch(e){}})();`;

// ── Google Ads (gtag.js) ─────────────────────────────────────────────────────
// Global site tag for Google Ads conversion tracking. ID is env-overridable.
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-18257861903";
const GTAG_INIT = `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', ${JSON.stringify(GOOGLE_ADS_ID)});`;

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

