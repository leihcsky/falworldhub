import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Cloudflare Pages / static-friendly image handling for MVP.
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
