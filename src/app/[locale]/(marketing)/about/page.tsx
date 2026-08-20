import type { Metadata } from "next";
import { MarketingDoc } from "@/components/marketing/MarketingDoc";
import { SITE_URL, localePath } from "@/lib/seo";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const isAr = params.locale === "ar";
  const title = isAr ? "من نحن — EYE Analytics" : "About Us — EYE Analytics";
  const description = isAr
    ? "EYE منصة تحليلات مواقع تحترم الخصوصية ومدعومة بالذكاء الاصطناعي — زوّار مباشرون، خرائط حرارية، قمع التحويل، وملخصات ذكاء اصطناعي بدون كوكيز."
    : "EYE is a privacy-first, AI-powered visitor analytics platform — live visitors, heatmaps, funnels, and AI summaries, with no advertising cookies.";
  const url = `${SITE_URL}${localePath(params.locale, "/about")}`;
  const images = [`${SITE_URL}${localePath(params.locale, "/opengraph-image")}`];

  return {
    title, description,
    alternates: {
      canonical: url,
      languages: { en: `${SITE_URL}${localePath("en", "/about")}`, ar: `${SITE_URL}${localePath("ar", "/about")}` },
    },
    openGraph: { title, description, url, type: "website", images },
    twitter: { title, description, images },
  };
}

export default function AboutPage({ params }: { params: { locale: string } }) {
  const ar = params.locale === "ar";
  return (
    <MarketingDoc
      locale={params.locale}
      title={ar ? "من نحن" : "About EYE"}
      subtitle={ar ? "تحليلات زوّار تحترم الخصوصية ومدعومة بالذكاء الاصطناعي." : "Privacy-first, AI-powered visitor analytics."}
    >
      {ar ? (
        <>
          <p>EYE منصة تحليلات مواقع تساعد أصحاب المواقع على فهم زوّارهم — زوّار مباشرون، خرائط حرارية، قمع التحويل، وملخصات ذكاء اصطناعي — بدون كوكيز إعلانية ولا تتبّع متطفّل.</p>
          <h2>مهمتنا</h2>
          <p>نجعل تحليلات المواقع بسيطة وقابلة للتنفيذ ومحترمة للخصوصية، حتى يتخذ الفريق قرارات مبنية على بيانات حقيقية لا على التخمين.</p>
          <h2>تواصل</h2>
          <p>لأي سؤال: <a href="mailto:info@eye-analysis.online">info@eye-analysis.online</a></p>
        </>
      ) : (
        <>
          <p>EYE is a website-analytics platform that helps owners understand their visitors — live visitors, heatmaps, funnels, and AI summaries — with no advertising cookies and no invasive tracking.</p>
          <h2>Our mission</h2>
          <p>Make analytics simple, actionable, and privacy-respecting — so teams decide on real data, not guesswork.</p>
          <h2>Contact</h2>
          <p>Questions? <a href="mailto:info@eye-analysis.online">info@eye-analysis.online</a></p>
        </>
      )}
    </MarketingDoc>
  );
}
