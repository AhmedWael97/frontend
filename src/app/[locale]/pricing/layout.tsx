import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { SITE_URL, localePath } from "@/lib/seo";

// This route lives outside the (marketing) group, so it needs its own copy of
// the marketing type system (same fonts/vars as (marketing)/layout.tsx).
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-marketing",
  display: "swap",
});

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isAr = params.locale === "ar";
  const title = isAr ? "الأسعار — خطط EYE" : "Pricing — EYE plans";
  const description = isAr
    ? "خطط واضحة وبسيطة لتحليلات EYE — ابدأ مجاناً ورقِّ خطتك عند النمو. تتبّع الزوار، الخرائط الحرارية، إعادة الجلسات والمزيد."
    : "Simple, transparent pricing for EYE analytics — start free and upgrade as you grow. Visitor tracking, heatmaps, session replay and more.";
  // An explicit openGraph/twitter object here replaces the root layout's
  // default entirely, including its images (Next.js does not merge) — repeat
  // them here or the page ships with no OG image.
  const images = [`${SITE_URL}${localePath(params.locale, "/opengraph-image")}`];

  return {
    title,
    description,
    alternates: {
      canonical: localePath(params.locale, "/pricing"),
      languages: { en: localePath("en", "/pricing"), ar: localePath("ar", "/pricing") },
    },
    openGraph: { title, description, url: localePath(params.locale, "/pricing"), type: "website", images },
    twitter: { title, description, images },
  };
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${grotesk.variable} ${mono.variable}`} style={{ fontFamily: "var(--font-grotesk)" }}>
      {children}
    </div>
  );
}
