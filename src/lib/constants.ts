export const SITE_NAME = "Palworld Hub";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://palworldhub.best";

export const SITE_DESCRIPTION =
  "Palworld breeding calculator and Pal database. Find breeding combinations, reverse lookup target Pals, and browse Pal stats.";

/** Public contact address shown on Contact / Privacy pages. */
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@palworldhub.best";

/** Display date for Terms / Privacy “last updated” lines. */
export const LEGAL_UPDATED_AT = "August 9, 2026";

/** Path-only nav config; labels come from i18n messages. */
export const NAV_ITEMS = [
  { href: "/", labelKey: "home" },
  { href: "/pals", labelKey: "pals" },
  { href: "/breeding", labelKey: "breeding" },
  { href: "/breeding-calculator", labelKey: "calculator" },
] as const;

/** Footer legal / support links (kept out of the primary nav). */
export const LEGAL_NAV_ITEMS = [
  { href: "/about", labelKey: "about" },
  { href: "/privacy", labelKey: "privacy" },
  { href: "/terms", labelKey: "terms" },
  { href: "/copyright", labelKey: "copyright" },
  { href: "/contact", labelKey: "contact" },
] as const;

export const POPULAR_PAL_SLUGS = [
  "anubis",
  "jetragon",
  "frostallion",
  "grizzbolt",
  "mossanda",
  "digtoise",
] as const;
