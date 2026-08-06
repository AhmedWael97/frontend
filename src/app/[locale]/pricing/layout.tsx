import type { Metadata } from "next";
import { SITE_URL, localePath } from "@/lib/seo";

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
  return <>{children}</>;
}
