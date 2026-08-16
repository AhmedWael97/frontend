import type { Metadata } from "next";
import { SITE_URL, localePath } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isAr = params.locale === "ar";
  const title = isAr ? "ابدأ الآن — أنشئ حسابك في EYE" : "Get Started — Set Up Your EYE Account";
  const description = isAr
    ? "أجب عن بضعة أسئلة عن موقعك، اختبر السيو والسرعة مجاناً، وأنشئ حسابك — شهر مجاني، بدون بطاقة ائتمان."
    : "Answer a few quick questions about your site, get a free SEO and speed check, and create your account — 1 month free, no credit card required.";
  // An explicit openGraph/twitter object here replaces the root layout's
  // default entirely, including its images (Next.js does not merge) — repeat
  // them here or the page ships with no OG image.
  const images = [`${SITE_URL}${localePath(params.locale, "/opengraph-image")}`];

  return {
    title,
    description,
    alternates: {
      canonical: localePath(params.locale, "/get-started"),
      languages: { en: localePath("en", "/get-started"), ar: localePath("ar", "/get-started") },
    },
    openGraph: { title, description, url: localePath(params.locale, "/get-started"), type: "website", images },
    twitter: { title, description, images },
  };
}

export default function GetStartedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
