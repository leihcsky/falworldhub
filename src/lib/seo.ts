import type { Metadata } from "next";
import { defaultLocale, locales, type AppLocale } from "@/i18n/routing";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./constants";

type BuildMetadataInput = {
  title: string;
  description?: string;
  /** Locale-unprefixed path, e.g. `/pals/anubis` */
  path?: string;
  locale?: AppLocale;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
};

/** Build a locale-aware pathname. Default locale has no prefix (`as-needed`). */
export function localizedPath(path = "/", locale: AppLocale = defaultLocale): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return normalized === "" ? "/" : normalized;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

export function absoluteUrl(path = "/", locale: AppLocale = defaultLocale): string {
  return `${SITE_URL}${localizedPath(path, locale)}`;
}

export function localeAlternates(path = "/") {
  const languages = Object.fromEntries(
    locales.map((locale) => [locale, absoluteUrl(path, locale)])
  ) as Record<string, string>;

  languages["x-default"] = absoluteUrl(path, defaultLocale);

  return languages;
}

export function buildMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  locale = defaultLocale,
  keywords = [],
  image = "/og-default.png",
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path, locale);
  const fullTitle = title.includes(SITE_NAME)
    ? title
    : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    keywords: [
      "palworld breeding calculator",
      "palworld database",
      "palworld pals",
      ...keywords,
    ],
    alternates: {
      canonical: url,
      languages: localeAlternates(path),
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale,
      type: "website",
      images: [{ url: `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [`${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function softwareApplicationJsonLd(locale: AppLocale = defaultLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/", locale),
    inLanguage: locale,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
  locale: AppLocale = defaultLocale
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, locale),
    })),
  };
}

export function datasetJsonLd(
  name: string,
  description: string,
  path: string,
  locale: AppLocale = defaultLocale
) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name,
    description,
    url: absoluteUrl(path, locale),
    inLanguage: locale,
    license: absoluteUrl("/terms", locale),
    isAccessibleForFree: true,
    creator: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  };
}

export function collectionPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
  locale?: AppLocale;
  itemCount: number;
}) {
  const locale = input.locale ?? defaultLocale;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path, locale),
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: input.itemCount,
      name: input.name,
    },
  };
}

export function itemListJsonLd(input: {
  name: string;
  path: string;
  locale?: AppLocale;
  items: Array<{ name: string; path: string }>;
}) {
  const locale = input.locale ?? defaultLocale;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    url: absoluteUrl(input.path, locale),
    numberOfItems: input.items.length,
    itemListElement: input.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path, locale),
    })),
  };
}

export function faqPageJsonLd(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
