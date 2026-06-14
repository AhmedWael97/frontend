/**
 * Central SEO config + JSON-LD structured-data builders.
 *
 * One source of truth for the public site URL (used by metadata, robots,
 * sitemap, canonical/hreflang and structured data) so we never ship the wrong
 * canonical domain again.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://eye-analsyis.live").replace(/\/$/, "");
export const SITE_NAME = "EYE Analytics";
export const TWITTER_HANDLE = "@eye_analytics";

export const DEFAULT_KEYWORDS = [
  "visitor analytics", "website analytics", "heatmaps", "session replay",
  "funnel analysis", "user behavior", "conversion optimization",
  "real-time analytics", "privacy-first analytics", "GDPR compliant analytics",
  "cookieless analytics", "campaign attribution", "ROAS analytics", "eye analytics",
];

/** Organization — helps Google build a knowledge panel / brand entity. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Privacy-first, AI-powered visitor analytics: live tracking, heatmaps, session replay, funnels, campaign revenue attribution and ROAS.",
  };
}

/** WebSite entity for the brand. */
export function websiteJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: locale === "ar" ? "ar" : "en",
  };
}

/** SoftwareApplication — eligible for the software product rich result. */
export function softwareApplicationJsonLd(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free plan available",
    },
  };
}

/** FAQPage — eligible for FAQ rich results. Pass localized Q/A pairs. */
export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

/** BreadcrumbList — helps Google show breadcrumb trails in results. */
export function breadcrumbJsonLd(crumbs: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url.startsWith("http") ? c.url : `${SITE_URL}${c.url}`,
    })),
  };
}
