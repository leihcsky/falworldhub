import { defineRouting } from "next-intl/routing";

/**
 * Active locales.
 * MVP: English only (default, no URL prefix via `as-needed`).
 * To add a language later:
 * 1. Append the locale here (e.g. "ja", "zh")
 * 2. Create `messages/{locale}.json`
 * 3. Rebuild — SSG + sitemap + hreflang pick it up automatically
 */
export const locales = ["en"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

export const localeNames: Record<AppLocale, string> = {
  en: "English",
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Keep English SEO URLs clean: `/breeding-calculator`
  // Other locales later: `/ja/breeding-calculator`
  localePrefix: "as-needed",
});
