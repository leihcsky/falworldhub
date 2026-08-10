import { toLocale } from "@/i18n/locale";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteBreadcrumbs } from "@/components/layout/site-breadcrumbs";
import { VersionBadge } from "@/components/layout/version-badge";
import { PalSearch } from "@/components/pals/pal-search";
import { PopularPalsStrip } from "@/components/pals/popular-pals-strip";
import { JsonLd } from "@/components/seo/json-ld";
import { RelatedHubLinks } from "@/components/seo/related-hub-links";
import { POPULAR_PAL_SLUGS } from "@/lib/constants";
import { getGameDataMeta } from "@/lib/game-version";
import {
  getElementCounts,
  getPaldexSummary,
  getWorkCounts,
} from "@/lib/pal-insights";
import {
  breadcrumbJsonLd,
  buildMetadata,
  collectionPageJsonLd,
  datasetJsonLd,
  faqPageJsonLd,
  itemListJsonLd,
} from "@/lib/seo";
import { palRepository } from "@/repositories";

type PalsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PalsPageProps) {
  const { locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "Meta" });

  return buildMetadata({
    title: t("palsTitle"),
    description: t("palsDescription"),
    path: "/pals",
    locale,
    keywords: [
      "palworld pals",
      "palworld pal list",
      "all palworld pals",
      "palworld database",
      "palworld paldex",
    ],
  });
}

export default async function PalsPage({ params }: PalsPageProps) {
  const { locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  setRequestLocale(locale);

  const t = await getTranslations();
  const version = getGameDataMeta();
  const [pals, elements, workTypes] = await Promise.all([
    palRepository.getAll(),
    palRepository.getElements(),
    palRepository.getWorkSuitabilities(),
  ]);

  const summary = getPaldexSummary(pals);
  const elementCounts = getElementCounts(pals, elements);
  const workCounts = getWorkCounts(pals, workTypes);
  const popularPals = POPULAR_PAL_SLUGS.map((slug) =>
    pals.find((pal) => pal.slug === slug)
  ).filter((pal): pal is NonNullable<typeof pal> => Boolean(pal));

  const faqs = [
    {
      question: t("Pals.faq1Q"),
      answer: t("Pals.faq1A", {
        total: summary.total,
        version: version.gameVersionLabel,
      }),
    },
    {
      question: t("Pals.faq2Q"),
      answer: t("Pals.faq2A"),
    },
    {
      question: t("Pals.faq3Q"),
      answer: t("Pals.faq3A"),
    },
    {
      question: t("Pals.faq4Q"),
      answer: t("Pals.faq4A", {
        breedable: summary.breedable,
      }),
    },
    {
      question: t("Pals.faq5Q"),
      answer: t("Pals.faq5A"),
    },
    {
      question: t("Pals.faq6Q"),
      answer: t("Pals.faq6A"),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
      <JsonLd
        data={[
          breadcrumbJsonLd(
            [
              { name: t("Nav.home"), path: "/" },
              { name: t("Nav.pals"), path: "/pals" },
            ],
            locale
          ),
          collectionPageJsonLd({
            name: t("Pals.title"),
            description: t("Pals.description"),
            path: "/pals",
            locale,
            itemCount: pals.length,
          }),
          datasetJsonLd(
            t("Pals.datasetName"),
            t("Pals.datasetDescription"),
            "/pals",
            locale
          ),
          itemListJsonLd({
            name: t("Pals.itemListName"),
            path: "/pals",
            locale,
            items: pals.map((pal) => ({
              name: pal.name,
              path: `/pals/${pal.slug}`,
            })),
          }),
          faqPageJsonLd(faqs),
        ]}
      />

      <SiteBreadcrumbs
        className="mb-6"
        items={[
          { name: t("Nav.home"), path: "/" },
          { name: t("Nav.pals") },
        ]}
        label={t("Common.breadcrumb")}
      />

      <header className="mb-6 space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {t("Pals.title")}
        </h1>
        <p className="mx-auto max-w-3xl text-sm text-muted-foreground md:text-base">
          {t("Pals.description")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>
            {t("Pals.summary", {
              total: summary.total,
              breedable: summary.breedable,
              nocturnal: summary.nocturnal,
            })}
          </span>
          <VersionBadge variant="detailed" />
        </div>
      </header>

      <section className="mb-12">
        <PalSearch
          pals={pals}
          elements={elementCounts}
          workTypes={workCounts}
        />
      </section>

      <div className="mb-12">
        <PopularPalsStrip
          pals={popularPals}
          title={t("Pals.popularTitle")}
          description={t("Pals.popularDescription")}
        />
      </div>

      <section className="mb-12 space-y-3 border-t pt-12">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("Pals.guideTitle")}
        </h2>
        <p className="max-w-3xl text-muted-foreground">{t("Pals.guideBody")}</p>
      </section>

      <section className="mb-12 space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("Pals.faqTitle")}
        </h2>
        <dl className="max-w-3xl space-y-6">
          {faqs.map((faq) => (
            <div key={faq.question} className="space-y-2">
              <dt className="font-medium">{faq.question}</dt>
              <dd className="text-sm text-muted-foreground">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <RelatedHubLinks current="pals" />
    </div>
  );
}
