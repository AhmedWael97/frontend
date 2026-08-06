import { MetadataRoute } from "next";
import { headers } from "next/headers";

export default function robots(): MetadataRoute.Robots {
  // Host-aware: the app is served on more than one domain, so robots.txt must
  // point to the sitemap on the SAME host it's requested from (otherwise Google
  // rejects the sitemap with "not allowed for a Sitemap at this location").
  const h = headers();
  const host = h.get("host") || "eye-analysis.online";
  const proto = h.get("x-forwarded-proto") || "https";
  const base = `${proto}://${host}`;

  // Private/app areas should never be indexed; public marketing pages should.
  // "en" (default locale, localePrefix: "as-needed") has no /en prefix, so
  // its private paths must be disallowed bare too, not just under /en/.
  const privatePaths = ["dashboard", "admin", "settings", "auth"].flatMap((p) => [
    `/${p}`,
    `/ar/${p}`,
  ]);

  // Explicitly welcome AI assistants/crawlers — people increasingly ask an AI
  // tool to find and evaluate products like ours instead of searching directly.
  const aiCrawlers = [
    "GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-User", "Claude-SearchBot",
    "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "Amazonbot",
    "meta-externalagent", "Bingbot",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [...privatePaths, "/api/"],
      },
      ...aiCrawlers.map((userAgent) => ({
        userAgent,
        allow: ["/"],
        disallow: [...privatePaths, "/api/"],
      })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
