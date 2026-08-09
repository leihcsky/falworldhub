import type { MetadataRoute } from "next";
import { locales, type AppLocale } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo";
import { palRepository } from "@/repositories";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pals = await palRepository.getAll();
  const now = new Date();

  const staticPaths = [
    "/",
    "/breeding-calculator",
    "/breeding",
    "/pals",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/copyright",
  ] as const;

  const legalPaths = new Set([
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/copyright",
  ]);

  const staticRoutes = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: absoluteUrl(path, locale as AppLocale),
      lastModified: now,
      changeFrequency: legalPaths.has(path)
        ? ("monthly" as const)
        : ("weekly" as const),
      priority:
        path === "/"
          ? 1
          : path === "/breeding-calculator" || path === "/breeding"
            ? 0.95
            : path === "/pals"
              ? 0.9
              : legalPaths.has(path)
                ? 0.25
                : 0.3,
      alternates: {
        languages: Object.fromEntries(
          locales.map((item) => [item, absoluteUrl(path, item as AppLocale)])
        ),
      },
    }))
  );

  const palRoutes = locales.flatMap((locale) =>
    pals.map((pal) => ({
      url: absoluteUrl(`/pals/${pal.slug}`, locale as AppLocale),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((item) => [
            item,
            absoluteUrl(`/pals/${pal.slug}`, item as AppLocale),
          ])
        ),
      },
    }))
  );

  const breedingRoutes = locales.flatMap((locale) =>
    pals.map((pal) => ({
      url: absoluteUrl(`/breeding/${pal.slug}`, locale as AppLocale),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
      alternates: {
        languages: Object.fromEntries(
          locales.map((item) => [
            item,
            absoluteUrl(`/breeding/${pal.slug}`, item as AppLocale),
          ])
        ),
      },
    }))
  );

  return [...staticRoutes, ...palRoutes, ...breedingRoutes];
}
