import { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Host-aware base: the app is served on multiple domains (e.g. eye-analsyis.live
  // and eye-analysis.online). A sitemap may only list URLs on the SAME host it's
  // served from, so we derive the base from the incoming request rather than a
  // hardcoded SITE_URL — otherwise Google rejects it ("URL not allowed for a
  // Sitemap at this location").
  const h = headers();
  const host = h.get("host") || "eye-analsyis.live";
  const proto = h.get("x-forwarded-proto") || "https";
  const base = `${proto}://${host}`;

  const locales = ["en", "ar"];

  // Public, indexable marketing pages.
  const pages: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
    { path: "", changeFrequency: "weekly", priority: 1.0 },
    { path: "/pricing", changeFrequency: "monthly", priority: 0.9 },
    { path: "/docs", changeFrequency: "monthly", priority: 0.7 },
    { path: "/help", changeFrequency: "monthly", priority: 0.7 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
    { path: "/live-demo", changeFrequency: "monthly", priority: 0.8 },
    { path: "/cookieless-analytics", changeFrequency: "monthly", priority: 0.9 },
    { path: "/heatmaps", changeFrequency: "monthly", priority: 0.9 },
    { path: "/identify-visitors", changeFrequency: "monthly", priority: 0.9 },
    { path: "/about", changeFrequency: "yearly", priority: 0.5 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
    { path: "/changelog", changeFrequency: "weekly", priority: 0.5 },
    { path: "/roadmap", changeFrequency: "monthly", priority: 0.4 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.4 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
    { path: "/cookie-policy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/gdpr", changeFrequency: "yearly", priority: 0.3 },
  ];

  // Published blog posts (dynamic) — high-value for organic SEO.
  let blogSlugs: string[] = [];
  try {
    const res = await fetch(`${base}/api/v1/blog`, { next: { revalidate: 600 } });
    if (res.ok) {
      const json = await res.json();
      blogSlugs = ((json.data ?? json) as { slug: string }[]).map((p) => p.slug).filter(Boolean);
    }
  } catch {}
  for (const slug of blogSlugs) {
    pages.push({ path: `/blog/${slug}`, changeFrequency: "monthly", priority: 0.7 });
  }

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of pages) {
      entries.push({
        url: `${base}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}${page.path}`])),
        },
      });
    }
  }

  return entries;
}
