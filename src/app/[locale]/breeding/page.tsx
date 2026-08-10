import { toLocale } from "@/i18n/locale";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BreedingComboCard } from "@/components/breeding/breeding-combo-card";
import { BreedingGuideSearch } from "@/components/breeding/breeding-guide-search";
import { SiteBreadcrumbs } from "@/components/layout/site-breadcrumbs";
import { PalImage } from "@/components/pals/pal-image";
import { JsonLd } from "@/components/seo/json-ld";
import { RelatedHubLinks } from "@/components/seo/related-hub-links";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { POPULAR_PAL_SLUGS } from "@/lib/constants";
import {
  breadcrumbJsonLd,
  buildMetadata,
  datasetJsonLd,
  faqPageJsonLd,
} from "@/lib/seo";
import { surfaceClass } from "@/lib/surface";
import { cn } from "@/lib/utils";
import { breedingRepository, palRepository } from "@/repositories";
import type { PalSummary } from "@/types";

type BreedingHubPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-static";

function toSummary(pal: {
  id: string;
  name: string;
  slug: string;
  image: string;
  type: string[];
  tribe: string;
  combiRank: number;
  combiDuplicatePriority: number;
  breedable: boolean;
}): PalSummary {
  return {
    id: pal.id,
    name: pal.name,
    slug: pal.slug,
    image: pal.image,
    type: pal.type,
    tribe: pal.tribe,
    combiRank: pal.combiRank,
    combiDuplicatePriority: pal.combiDuplicatePriority,
    breedable: pal.breedable,
  };
}

export async function generateMetadata({ params }: BreedingHubPageProps) {
  const { locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "Meta" });

  return buildMetadata({
    title: t("breedingHubTitle"),
    description: t("breedingHubDescription"),
    path: "/breeding",
    locale,
    keywords: [
      "palworld breeding combos",
      "palworld breeding combinations",
      "palworld breeding database",
      "palworld breeding chart",
      "palworld unique breeding",
      "how to breed pals",
    ],
  });
}

export default async function BreedingHubPage({ params }: BreedingHubPageProps) {
  const { locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  setRequestLocale(locale);

  const t = await getTranslations();
  const [pals, uniqueRecipes] = await Promise.all([
    palRepository.getAll(),
    breedingRepository.getAll(),
  ]);

  const byId = new Map(pals.map((pal) => [pal.id, pal]));
  const breedable = pals
    .filter((pal) => pal.breedable)
    .sort((a, b) => a.name.localeCompare(b.name));

  const featuredCombos = uniqueRecipes
    .map((combo) => {
      const parent1 = byId.get(combo.parent1);
      const parent2 = byId.get(combo.parent2);
      const child = byId.get(combo.child);
      if (!parent1 || !parent2 || !child) return null;
      return {
        parent1: toSummary(parent1),
        parent2: toSummary(parent2),
        child: toSummary(child),
      };
    })
    .filter((combo): combo is NonNullable<typeof combo> => Boolean(combo))
    .slice(0, 18);

  const popular = (
    await Promise.all(
      POPULAR_PAL_SLUGS.map(async (slug) => {
        const pal = pals.find((item) => item.slug === slug && item.breedable);
        if (!pal) return null;
        const reverse = await breedingRepository.findParents(pal.id, {
          formulaLimit: 6,
        });
        return {
          pal,
          combos: (reverse?.combinations ?? []).slice(0, 3),
        };
      })
    )
  ).filter((item): item is NonNullable<typeof item> => Boolean(item));

  const faqs = [
    {
      question: t("BreedingHub.faq1Q"),
      answer: t("BreedingHub.faq1A"),
    },
    {
      question: t("BreedingHub.faq2Q"),
      answer: t("BreedingHub.faq2A"),
    },
    {
      question: t("BreedingHub.faq3Q"),
      answer: t("BreedingHub.faq3A"),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10 md:py-12">
      <JsonLd
        data={[
          breadcrumbJsonLd(
            [
              { name: t("Nav.home"), path: "/" },
              { name: t("Nav.breeding"), path: "/breeding" },
            ],
            locale
          ),
          datasetJsonLd(
            t("BreedingHub.title"),
            t("BreedingHub.description"),
            "/breeding",
            locale
          ),
          faqPageJsonLd(faqs),
        ]}
      />

      <SiteBreadcrumbs
        items={[
          { name: t("Nav.home"), path: "/" },
          { name: t("Nav.breeding") },
        ]}
        label={t("Common.breadcrumb")}
      />

      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {t("BreedingHub.title")}
        </h1>
        <p className="mx-auto max-w-3xl text-sm text-muted-foreground md:text-base">
          {t("BreedingHub.description")}
        </p>
        <p className="text-sm font-medium text-foreground/80">
          {t("BreedingHub.summary", {
            unique: uniqueRecipes.length,
            breedable: breedable.length,
          })}
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          <Link
            href="/breeding-calculator"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            {t("BreedingHub.ctaCalculator")}
          </Link>
          <Link
            href="/pals"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            {t("BreedingHub.ctaPals")}
          </Link>
        </div>
      </header>

      {featuredCombos.length > 0 ? (
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              {t("BreedingHub.featuredTitle")}
            </h2>
            <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
              {t("BreedingHub.featuredDescription")}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {featuredCombos.map((combo) => (
              <BreedingComboCard
                key={`${combo.parent1.id}-${combo.parent2.id}-${combo.child.id}`}
                parent1={combo.parent1}
                parent2={combo.parent2}
                child={combo.child}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-6 border-t pt-10">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("BreedingHub.popularTitle")}
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            {t("BreedingHub.popularDescription")}
          </p>
        </div>
        <div className="space-y-8">
          {popular.map(({ pal, combos }) => (
            <div key={pal.id} className={cn(surfaceClass(), "space-y-3 p-4 md:p-5")}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/breeding/${pal.slug}`}
                  className="flex items-center gap-2.5 font-semibold tracking-tight hover:text-primary"
                >
                  <PalImage src={pal.image} alt="" size={36} className="rounded-lg" />
                  <span>{pal.name}</span>
                </Link>
                <Link
                  href={`/breeding/${pal.slug}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  {t("BreedingHub.popularViewAll", { name: pal.name })}
                </Link>
              </div>
              {combos.length > 0 ? (
                <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                  {combos.map((combo, index) => (
                    <BreedingComboCard
                      key={`${combo.parent1.id}-${combo.parent2.id}-${index}`}
                      parent1={combo.parent1}
                      parent2={combo.parent2}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 border-t pt-10">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("BreedingHub.allTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("BreedingHub.allDescription")}
          </p>
        </div>
        <BreedingGuideSearch pals={breedable} />
      </section>

      <section className="space-y-4 border-t pt-10">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("BreedingHub.howTitle")}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("BreedingHub.howBody")}
        </p>
        <div className="max-w-3xl space-y-2">
          <h3 className="font-medium text-foreground">
            {t("BreedingHub.howTipTitle")}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("BreedingHub.howTipBody")}
          </p>
        </div>
      </section>

      <section className="space-y-6 border-t pt-10">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("BreedingHub.faqTitle")}
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

      <RelatedHubLinks current="breeding" />
    </div>
  );
}
