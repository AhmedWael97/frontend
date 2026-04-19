import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/en/dashboard", "/ar/dashboard", "/en/admin", "/ar/admin", "/api/"],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || "https://eye.ai"}/sitemap.xml`,
  };
}
