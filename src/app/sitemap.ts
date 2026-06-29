import { MetadataRoute } from "next";
import { headers } from "next/headers";

export default function sitemap(): MetadataRoute.Sitemap {
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
    { path: "/privacy", changeFrequency: "yearly", priority: 0.4 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
  ];

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
