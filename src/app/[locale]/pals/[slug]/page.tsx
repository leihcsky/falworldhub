import { toLocale } from "@/i18n/locale";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { BreedingComboCard } from "@/components/breeding/breeding-combo-card";
import { SiteBreadcrumbs } from "@/components/layout/site-breadcrumbs";
import { PalCard } from "@/components/pals/pal-card";
import { PalDetailHero } from "@/components/pals/pal-detail-hero";
import { PalStats } from "@/components/pals/pal-stats";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  buildPalMetaDescription,
  buildPalMetaKeywords,
} from "@/lib/pal-seo";
import { absoluteUrl, breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { breedingRepository, palRepository } from "@/repositories";

function palDexLabel(dexNumber: number, dexSuffix?: string): string {
  // Search-friendly form: "100", "100B" (matches “palworld pal 100” habits).
  if (!dexNumber || dexNumber < 0) return "???";
  return `${dexNumber}${dexSuffix || ""}`;
}

type PalDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamic = "force-static";

export async function generateStaticParams() {
  const pals = await palRepository.getAll();
  return pals.map((pal) => ({ slug: pal.slug }));
}

export async function generateMetadata({ params }: PalDetailPageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = toLocale(rawLocale);
  const pal = await palRepository.getBySlug(slug);
  const t = await getTranslations({ locale, namespace: "Meta" });

  if (!pal) {
    return buildMetadata({
      title: t("notFoundTitle"),
      path: `/pals/${slug}`,
      locale: locale,
      noIndex: true,
    });
  }

  const dex = palDexLabel(pal.dexNumber, pal.dexSuffix);
  const description = buildPalMetaDescription(pal, (values) =>
    t("palDetailDescription", values)
  );

  return buildMetadata({
    title: t("palDetailTitle", { name: pal.name, dex }),
    description,
    path: `/pals/${pal.slug}`,
    locale,
    keywords: buildPalMetaKeywords(pal),
    image: pal.image,
  });
}

export default async function PalDetailPage({ params }: PalDetailPageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = toLocale(rawLocale);
  setRequestLocale(locale);

  const pal = await palRepository.getBySlug(slug);
  if (!pal) notFound();

  const t = await getTranslations();
  const [related, reverse] = await Promise.all([
    palRepository.getRelatedByElement(slug, 6),
    breedingRepository.findParents(pal.id),
  ]);

  const crumbs = [
    { name: t("Nav.home"), path: "/" },
    { name: t("Nav.pals"), path: "/pals" },
    { name: pal.name },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 md:space-y-10 md:py-12">
      <JsonLd
        data={[
          breadcrumbJsonLd(
            [
              { name: t("Nav.home"), path: "/" },
              { name: t("Nav.pals"), path: "/pals" },
              { name: pal.name, path: `/pals/${pal.slug}` },
            ],
            locale
          ),
          {
            "@context": "https://schema.org",
            "@type": "Thing",
            name: pal.name,
            alternateName: `${pal.name} Palworld`,
            description: buildPalMetaDescription(pal, (values) =>
              t("Meta.palDetailDescription", values)
            ),
            image: pal.image,
            url: absoluteUrl(`/pals/${pal.slug}`, locale),
            inLanguage: locale,
          },
        ]}
      />

      <SiteBreadcrumbs items={crumbs} label={t("Common.breadcrumb")} />

      <PalDetailHero
        pal={pal}
        labels={{
          rarity: t("Pals.rarity"),
          size: t("Pals.size"),
          nocturnal: t("Pals.nocturnal"),
          yes: t("Pals.yes"),
          no: t("Pals.no"),
          combiRank: t("Pals.combiRank"),
        }}
      />

      <PalStats pal={pal} />

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-5 w-1 rounded-full bg-primary" aria-hidden />
          <h2 className="text-xl font-semibold tracking-tight">
            {t("Pals.howToBreed", { name: pal.name })}
          </h2>
        </div>
        {reverse && reverse.combinations.length > 0 ? (
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {reverse.combinations.slice(0, 9).map((combo, index) => (
              <BreedingComboCard
                key={`${combo.parent1.id}-${combo.parent2.id}-${index}`}
                parent1={combo.parent1}
                parent2={combo.parent2}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("Pals.noBreedingYet")}
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <Link href={`/breeding/${pal.slug}`} className={cn(buttonVariants())}>
            {t("Pals.openBreedingPage", { name: pal.name })}
          </Link>
          <Link
            href={`/breeding-calculator?target=${pal.id}`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            {t("Pals.openCalculator")}
          </Link>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-primary" aria-hidden />
            <h2 className="text-xl font-semibold tracking-tight">
              {t("Pals.similarPals", { element: pal.type[0] })}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <PalCard key={item.id} pal={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
