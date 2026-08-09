import { toLocale } from "@/i18n/locale";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { BreedingCalculator } from "@/components/breeding/breeding-calculator";
import { VersionBadge } from "@/components/layout/version-badge";
import { PalImage } from "@/components/pals/pal-image";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { POPULAR_PAL_SLUGS } from "@/lib/constants";
import { getGameDataMeta } from "@/lib/game-version";
import {
  breadcrumbJsonLd,
  buildMetadata,
  datasetJsonLd,
  faqPageJsonLd,
} from "@/lib/seo";
import { cn } from "@/lib/utils";
import { breedingRepository, palRepository } from "@/repositories";

type BreedingCalculatorPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: BreedingCalculatorPageProps) {
  const { locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "Meta" });

  return buildMetadata({
    title: t("calculatorTitle"),
    description: t("calculatorDescription"),
    path: "/breeding-calculator",
    locale,
    keywords: [
      "palworld breeding calculator",
      "palworld breeding chart",
      "palworld breeding combinations",
      "palworld breeding guide",
      "how to breed pals",
      "palworld parent calculator",
      "palworld reverse breeding",
    ],
  });
}

export default async function BreedingCalculatorPage({
  params,
}: BreedingCalculatorPageProps) {
  const { locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  setRequestLocale(locale);

  const t = await getTranslations();
  const version = getGameDataMeta();
  const [pals, breeding] = await Promise.all([
    palRepository.getAll(),
    breedingRepository.getData(),
  ]);

  const breedableCount = pals.filter((pal) => pal.breedable).length;
  const popularTargets = POPULAR_PAL_SLUGS.map((slug) =>
    pals.find((pal) => pal.slug === slug)
  ).filter((pal): pal is NonNullable<typeof pal> => Boolean(pal));

  const faqs = [
    {
      question: t("Calculator.faq1Q"),
      answer: t("Calculator.faq1A"),
    },
    {
      question: t("Calculator.faq2Q"),
      answer: t("Calculator.faq2A"),
    },
    {
      question: t("Calculator.faq3Q"),
      answer: t("Calculator.faq3A"),
    },
    {
      question: t("Calculator.faq4Q"),
      answer: t("Calculator.faq4A", {
        version: version.gameVersionLabel,
      }),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
      <JsonLd
        data={[
          breadcrumbJsonLd(
            [
              { name: t("Nav.home"), path: "/" },
              { name: t("Nav.calculator"), path: "/breeding-calculator" },
            ],
            locale
          ),
          datasetJsonLd(
            t("Calculator.datasetName"),
            t("Calculator.datasetDescription"),
            "/breeding-calculator",
            locale
          ),
          faqPageJsonLd(faqs),
        ]}
      />

      <header className="mb-6 space-y-3 text-center md:mb-8">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {t("Calculator.title")}
        </h1>
        <p className="mx-auto max-w-3xl text-sm text-muted-foreground md:text-base">
          {t("Calculator.description")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>
            {t("Calculator.summary", {
              breedable: breedableCount,
              unique: breeding.unique.length,
              version: version.gameVersionLabel,
            })}
          </span>
          <VersionBadge variant="detailed" />
        </div>
      </header>

      <section className="mb-12" aria-label={t("Calculator.title")}>
        <Suspense
          fallback={
            <p className="text-center text-sm text-muted-foreground">
              {t("Common.loadingCalculator")}
            </p>
          }
        >
          <BreedingCalculator pals={pals} breeding={breeding} />
        </Suspense>
      </section>

      <section className="mb-12 space-y-6 border-t pt-12">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("Calculator.howToTitle")}
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-lg font-medium tracking-tight">
              {t("Calculator.howToForwardTitle")}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              {t("Calculator.howToForwardBody")}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium tracking-tight">
              {t("Calculator.howToReverseTitle")}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              {t("Calculator.howToReverseBody")}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("Calculator.worksTitle")}
        </h2>
        <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          <p>{t("Calculator.worksP1")}</p>
          <p>{t("Calculator.worksP2")}</p>
          <p>{t("Calculator.worksP3")}</p>
          <p>{t("Calculator.worksP4")}</p>
        </div>
      </section>

      {popularTargets.length > 0 ? (
        <section className="mb-12 space-y-4 border-t pt-12">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              {t("Calculator.popularTitle")}
            </h2>
            <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
              {t("Calculator.popularDescription")}
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularTargets.map((pal) => (
              <li
                key={pal.id}
                className="flex items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5"
              >
                <PalImage src={pal.image} alt="" size={40} className="rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{pal.name}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    <Link
                      href={`/breeding/${pal.slug}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {t("Calculator.popularOpenGuide")}
                    </Link>
                    <Link
                      href={`/breeding-calculator?target=${pal.id}`}
                      className="text-muted-foreground underline-offset-4 hover:underline"
                    >
                      {t("Calculator.popularUseCalculator")}
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mb-12 space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("Calculator.faqTitle")}
        </h2>
        <dl className="max-w-3xl space-y-6">
          {faqs.map((faq) => (
            <div key={faq.question} className="space-y-2">
              <dt className="font-medium">{faq.question}</dt>
              <dd className="text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-4 border-t pt-12">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("Calculator.exploreTitle")}
        </h2>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          {t("Calculator.exploreBody")}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/pals" className={cn(buttonVariants({ size: "lg" }))}>
            {t("Calculator.explorePals")}
          </Link>
          {popularTargets[0] ? (
            <Link
              href={`/breeding/${popularTargets[0].slug}`}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              {t("Calculator.explorePopular")}
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
