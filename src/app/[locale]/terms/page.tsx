import { toLocale } from "@/i18n/locale";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage, LegalSection } from "@/components/layout/legal-page";
import { JsonLd } from "@/components/seo/json-ld";
import {
  CONTACT_EMAIL,
  LEGAL_UPDATED_AT,
  SITE_NAME,
  SITE_URL,
} from "@/lib/constants";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

type TermsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: TermsPageProps) {
  const { locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "Meta" });

  return buildMetadata({
    title: t("termsTitle"),
    description: t("termsDescription"),
    path: "/terms",
    locale,
  });
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  setRequestLocale(locale);

  const t = await getTranslations();
  const sections = [
    "s1",
    "s2",
    "s3",
    "s4",
    "s5",
    "s6",
    "s7",
    "s8",
    "s9",
    "s10",
  ] as const;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: t("Nav.home"), path: "/" },
            { name: t("Nav.terms"), path: "/terms" },
          ],
          locale
        )}
      />
      <LegalPage
        title={t("Terms.title")}
        description={t("Terms.intro", {
          siteName: SITE_NAME,
          siteUrl: SITE_URL,
        })}
        updatedLabel={t("Terms.updated", { date: LEGAL_UPDATED_AT })}
        crumbs={[
          { name: t("Nav.home"), path: "/" },
          { name: t("Nav.terms") },
        ]}
        breadcrumbLabel={t("Common.breadcrumb")}
      >
        {sections.map((key) => (
          <LegalSection key={key} title={t(`Terms.${key}Title`)}>
            <p>
              {t(`Terms.${key}Body`, {
                siteName: SITE_NAME,
                email: CONTACT_EMAIL,
              })}
            </p>
          </LegalSection>
        ))}
      </LegalPage>
    </>
  );
}
