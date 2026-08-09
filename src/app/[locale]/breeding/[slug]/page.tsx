import { toLocale } from "@/i18n/locale";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { BreedingPageCombos } from "@/components/breeding/breeding-page-combos";
import { BreedingPalSwitcher } from "@/components/breeding/breeding-pal-switcher";
import { SiteBreadcrumbs } from "@/components/layout/site-breadcrumbs";
import { PalImage } from "@/components/pals/pal-image";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { surfaceClass } from "@/lib/surface";
import { cn } from "@/lib/utils";
import { breedingRepository, palRepository } from "@/repositories";

type BreedingPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const pals = await palRepository.getAll();
  return pals.map((pal) => ({ slug: pal.slug }));
}

export async function generateMetadata({ params }: BreedingPageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = toLocale(rawLocale);
  const pal = await palRepository.getBySlug(slug);
  const t = await getTranslations({ locale, namespace: "Meta" });

  if (!pal) {
    return buildMetadata({
      title: t("notFoundTitle"),
      path: `/breeding/${slug}`,
      locale,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: t("breedingTitle", { name: pal.name }),
    description: t("breedingDescription", { name: pal.name }),
    path: `/breeding/${pal.slug}`,
    locale,
    keywords: [
      "palworld breeding combos",
      `${pal.name.toLowerCase()} breeding combos`,
      `how to breed ${pal.name.toLowerCase()}`,
      `palworld ${pal.name.toLowerCase()} breeding`,
      `${pal.name.toLowerCase()} breeding combinations`,
    ],
    image: pal.image,
  });
}

export default async function BreedingSeoPage({ params }: BreedingPageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = toLocale(rawLocale);
  setRequestLocale(locale);

  const pal = await palRepository.getBySlug(slug);
  if (!pal) notFound();

  const t = await getTranslations();
  const [asChild, asParent, allPals] = await Promise.all([
    breedingRepository.findParents(pal.id, {
      // Full reverse scan for searchable combo guides.
      formulaLimit: Number.MAX_SAFE_INTEGER,
    }),
    breedingRepository.findChildrenAsParent(pal.id),
    palRepository.getSummaries(),
  ]);

  const asChildCombos = asChild?.combinations ?? [];
  const asParentCombos = asParent?.combinations ?? [];
  const switcherPals = allPals.filter((item) => item.breedable);

  const palSummary = {
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

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 md:space-y-10">
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: t("Nav.home"), path: "/" },
            { name: t("Nav.breeding"), path: "/breeding" },
            {
              name: t("BreedingPage.headline", { name: pal.name }),
              path: `/breeding/${pal.slug}`,
            },
          ],
          locale
        )}
      />

      <SiteBreadcrumbs
        items={[
          { name: t("Nav.home"), path: "/" },
          { name: t("Nav.breeding"), path: "/breeding" },
          { name: pal.name },
        ]}
        label={t("Common.breadcrumb")}
        currentSlot={
          <BreedingPalSwitcher
            pals={switcherPals}
            currentSlug={pal.slug}
          />
        }
      />

      <header className={cn(surfaceClass(), "space-y-5 p-5 md:p-6")}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <PalImage
            src={pal.image}
            alt={pal.name}
            size={112}
            priority
            className="mx-auto rounded-2xl sm:mx-0"
          />
          <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {t("BreedingPage.headline", { name: pal.name })}
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                {t("BreedingPage.intro", { name: pal.name })}
              </p>
              <p className="text-sm font-medium text-foreground/80">
                {t("BreedingPage.comboCount", {
                  name: pal.name,
                  asChild: asChildCombos.length,
                  asParent: asParentCombos.length,
                })}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              <Link
                href={`/pals/${pal.slug}`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                {t("BreedingPage.viewDetails", { name: pal.name })}
              </Link>
              <Link
                href={`/breeding-calculator?target=${pal.id}`}
                className={cn(buttonVariants())}
              >
                {t("BreedingPage.calculatorCta", { name: pal.name })}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <BreedingPageCombos
        pal={palSummary}
        asChild={asChildCombos}
        asParent={asParentCombos}
      />

      <section className="space-y-3 border-t pt-10">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("BreedingPage.howTitle", { name: pal.name })}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("BreedingPage.howBody", { name: pal.name })}
        </p>
      </section>

      <section
        className={cn(surfaceClass(), "space-y-3 border-t-0 p-5 md:p-6")}
      >
        <h2 className="text-xl font-semibold tracking-tight">
          {t("BreedingPage.calculatorTitle")}
        </h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t("BreedingPage.calculatorBody", { name: pal.name })}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/breeding-calculator?target=${pal.id}`}
            className={cn(buttonVariants())}
          >
            {t("BreedingPage.calculatorCta", { name: pal.name })}
          </Link>
          <Link
            href="/breeding"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            {t("BreedingPage.browseMore")}
          </Link>
        </div>
      </section>
    </div>
  );
}
