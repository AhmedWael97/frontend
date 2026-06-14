import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isAr = params.locale === "ar";
  const title = isAr ? "الأسعار — خطط EYE" : "Pricing — EYE plans";
  const description = isAr
    ? "خطط واضحة وبسيطة لتحليلات EYE — ابدأ مجاناً ورقِّ خطتك عند النمو. تتبّع الزوار، الخرائط الحرارية، إعادة الجلسات والمزيد."
    : "Simple, transparent pricing for EYE analytics — start free and upgrade as you grow. Visitor tracking, heatmaps, session replay and more.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${params.locale}/pricing`,
      languages: { en: "/en/pricing", ar: "/ar/pricing" },
    },
    openGraph: { title, description, url: `/${params.locale}/pricing`, type: "website" },
    twitter: { title, description },
  };
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
