import { MetadataRoute } from "next";
import { headers } from "next/headers";

export default function robots(): MetadataRoute.Robots {
  // Host-aware: the app is served on more than one domain, so robots.txt must
  // point to the sitemap on the SAME host it's requested from (otherwise Google
  // rejects the sitemap with "not allowed for a Sitemap at this location").
  const h = headers();
  const host = h.get("host") || "eye-analsyis.live";
  const proto = h.get("x-forwarded-proto") || "https";
  const base = `${proto}://${host}`;

  // Private/app areas should never be indexed; public marketing pages should.
  const privatePaths = ["dashboard", "admin", "settings", "auth"].flatMap((p) => [
    `/en/${p}`,
    `/ar/${p}`,
  ]);

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [...privatePaths, "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
