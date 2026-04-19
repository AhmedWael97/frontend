import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/tracker/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost"}/tracker/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
