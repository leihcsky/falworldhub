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

type PrivacyPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PrivacyPageProps) {
  const { locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "Meta" });

  return buildMetadata({
    title: t("privacyTitle"),
    description: t("privacyDescription"),
    path: "/privacy",
    locale,
  });
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
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
    "s11",
  ] as const;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: t("Nav.home"), path: "/" },
            { name: t("Nav.privacy"), path: "/privacy" },
          ],
          locale
        )}
      />
      <LegalPage
        title={t("Privacy.title")}
        description={t("Privacy.intro", {
          siteName: SITE_NAME,
          siteUrl: SITE_URL,
        })}
        updatedLabel={t("Privacy.updated", { date: LEGAL_UPDATED_AT })}
        crumbs={[
          { name: t("Nav.home"), path: "/" },
          { name: t("Nav.privacy") },
        ]}
        breadcrumbLabel={t("Common.breadcrumb")}
      >
        {sections.map((key) => (
          <LegalSection key={key} title={t(`Privacy.${key}Title`)}>
            <p>
              {t(`Privacy.${key}Body`, {
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
