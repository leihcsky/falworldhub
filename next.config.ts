import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Cloudflare / OpenNext: skip the image optimizer binary.
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);

initOpenNextCloudflareForDev();
