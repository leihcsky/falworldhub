import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * This site is SSG-first (JSON data + generateStaticParams).
 * Serve prerendered routes from Workers Static Assets and intercept
 * cache hits so the Next server (and Free-plan 10ms CPU) is bypassed.
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
