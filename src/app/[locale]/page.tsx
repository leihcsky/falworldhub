import { toLocale } from "@/i18n/locale";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PalImage } from "@/components/pals/pal-image";
import { PopularPalsStrip } from "@/components/pals/popular-pals-strip";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { POPULAR_PAL_SLUGS } from "@/lib/constants";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { surfaceHoverClass } from "@/lib/surface";
import { cn } from "@/lib/utils";
import { palRepository } from "@/repositories";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: HomePageProps) {
  const { locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "Meta" });

  return buildMetadata({
    title: t("homeTitle"),
    description: t("homeDescription"),
    path: "/",
    locale,
    keywords: [
      "palworld hub",
      "palworld tools",
      "palworld guides",
      "palworld breeding tools",
      "palworld breeding calculator",
      "palworld pal database",
      "palworld breeding combos",
    ],
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  setRequestLocale(locale);

  const t = await getTranslations();
  const allPals = await palRepository.getAll();

  const popularPals = POPULAR_PAL_SLUGS.map((slug) =>
    allPals.find((pal) => pal.slug === slug)
  ).filter((pal): pal is NonNullable<typeof pal> => Boolean(pal));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14">
      <JsonLd
        data={breadcrumbJsonLd(
          [{ name: t("Nav.home"), path: "/" }],
          locale
        )}
      />

      <section className="space-y-8 border-b pb-12">
        <div className="space-y-5 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            {t("Home.headline")}
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
            {t("Home.intro")}
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
          <Link
            href="/pals"
            className={cn(surfaceHoverClass(), "block space-y-3 p-6 text-left")}
          >
            <h2 className="text-xl font-semibold tracking-tight">
              {t("Home.toolPalsTitle")}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("Home.toolPalsBody")}
            </p>
            <span className="inline-flex text-sm font-medium text-primary">
              {t("Home.toolPalsCta")} →
            </span>
          </Link>
          <Link
            href="/breeding-calculator"
            className={cn(surfaceHoverClass(), "block space-y-3 p-6 text-left")}
          >
            <h2 className="text-xl font-semibold tracking-tight">
              {t("Home.toolCalculatorTitle")}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("Home.toolCalculatorBody")}
            </p>
            <span className="inline-flex text-sm font-medium text-primary">
              {t("Home.toolCalculatorCta")} →
            </span>
          </Link>
          <Link
            href="/breeding"
            className={cn(surfaceHoverClass(), "block space-y-3 p-6 text-left")}
          >
            <h2 className="text-xl font-semibold tracking-tight">
              {t("Home.toolCombosTitle")}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("Home.toolCombosBody")}
            </p>
            <span className="inline-flex text-sm font-medium text-primary">
              {t("Home.toolCombosCta")} →
            </span>
          </Link>
        </div>
      </section>

      <section className="space-y-6 py-12">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("Home.canDoTitle")}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <h3 className="font-medium tracking-tight">
              <Link href="/pals" className="underline-offset-4 hover:underline">
                {t("Home.canDo2Title")}
              </Link>
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t.rich("Home.canDo2Body", {
                pals: (chunks) => (
                  <Link
                    href="/pals"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium tracking-tight">
              <Link
                href="/breeding-calculator"
                className="underline-offset-4 hover:underline"
              >
                {t("Home.canDo1Title")}
              </Link>
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t.rich("Home.canDo1Body", {
                calculator: (chunks) => (
                  <Link
                    href="/breeding-calculator"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {chunks}
                  </Link>
                ),
                combos: (chunks) => (
                  <Link
                    href="/breeding"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium tracking-tight">
              <Link
                href="/breeding"
                className="underline-offset-4 hover:underline"
              >
                {t("Home.canDo3Title")}
              </Link>
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t.rich("Home.canDo3Body", {
                combos: (chunks) => (
                  <Link
                    href="/breeding"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3 border-t py-12">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("Home.howTitle")}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("Home.howBody")}
        </p>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("Home.howTip")}
        </p>
      </section>

      <section className="space-y-4 border-t py-12">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("Home.combosTitle")}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("Home.combosBody")}
        </p>
        <Link
          href="/breeding"
          className={cn(buttonVariants({ variant: "secondary" }))}
        >
          {t("Home.combosCta")}
        </Link>
      </section>

      <section className="space-y-4 border-t py-12">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("Home.popularBreedingTitle")}
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {t("Home.popularBreedingDescription")}
          </p>
        </div>
        <ul className="flex flex-wrap gap-3">
          {popularPals.map((pal) => (
            <li key={pal.id}>
              <Link
                href={`/breeding/${pal.slug}`}
                className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-colors hover:border-foreground/20 hover:bg-muted/40"
              >
                <PalImage src={pal.image} alt="" size={28} />
                <span>{pal.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/breeding-calculator"
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
        >
          {t("Home.popularBreedingCta")}
        </Link>
      </section>

      <PopularPalsStrip
        pals={popularPals}
        title={t("Home.popularPalsTitle")}
        description={t("Home.popularPalsDescription")}
      />

      <section className="space-y-3 border-t py-12">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("Home.dataTitle")}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("Home.dataBody")}
        </p>
      </section>

      <section className="space-y-3 border-t pt-12">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("Home.whoTitle")}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("Home.whoBody")}
        </p>
      </section>
    </div>
  );
}
