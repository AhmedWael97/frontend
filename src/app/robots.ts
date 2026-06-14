import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
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
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
