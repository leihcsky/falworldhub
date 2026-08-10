import { toLocale } from "@/i18n/locale";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage, LegalSection } from "@/components/layout/legal-page";
import { JsonLd } from "@/components/seo/json-ld";
import { Link } from "@/i18n/navigation";
import { SITE_NAME } from "@/lib/constants";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: AboutPageProps) {
  const { locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "Meta" });

  return buildMetadata({
    title: t("aboutTitle"),
    description: t("aboutDescription"),
    path: "/about",
    locale,
  });
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: t("Nav.home"), path: "/" },
            { name: t("Nav.about"), path: "/about" },
          ],
          locale
        )}
      />
      <LegalPage
        title={t("About.title", { siteName: SITE_NAME })}
        description={t("About.intro", { siteName: SITE_NAME })}
        crumbs={[
          { name: t("Nav.home"), path: "/" },
          { name: t("Nav.about") },
        ]}
        breadcrumbLabel={t("Common.breadcrumb")}
      >
        <LegalSection title={t("About.s1Title")}>
          <p>{t("About.s1Body")}</p>
        </LegalSection>
        <LegalSection title={t("About.s2Title")}>
          <p>{t("About.s2Body")}</p>
        </LegalSection>
        <LegalSection title={t("About.s3Title")}>
          <p>{t("About.s3Body")}</p>
        </LegalSection>
        <LegalSection title={t("About.s4Title")}>
          <p>{t("About.s4Body", { siteName: SITE_NAME })}</p>
        </LegalSection>
        <LegalSection title={t("About.s5Title")}>
          <p>
            {t("About.s5Body")}{" "}
            <Link
              href="/contact"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {t("Nav.contact")}
            </Link>
          </p>
        </LegalSection>
      </LegalPage>
    </>
  );
}
