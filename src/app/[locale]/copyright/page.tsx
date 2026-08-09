import { toLocale } from "@/i18n/locale";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage, LegalSection } from "@/components/layout/legal-page";
import { JsonLd } from "@/components/seo/json-ld";
import { Link } from "@/i18n/navigation";
import {
  CONTACT_EMAIL,
  LEGAL_UPDATED_AT,
  SITE_NAME,
  SITE_URL,
} from "@/lib/constants";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

type CopyrightPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: CopyrightPageProps) {
  const { locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "Meta" });

  return buildMetadata({
    title: t("copyrightTitle"),
    description: t("copyrightDescription"),
    path: "/copyright",
    locale,
  });
}

export default async function CopyrightPage({ params }: CopyrightPageProps) {
  const { locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  setRequestLocale(locale);

  const t = await getTranslations();
  const sections = ["s1", "s2", "s3", "s4", "s5"] as const;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: t("Nav.home"), path: "/" },
            { name: t("Nav.copyright"), path: "/copyright" },
          ],
          locale
        )}
      />
      <LegalPage
        title={t("Copyright.title")}
        description={t("Copyright.intro")}
        updatedLabel={t("Copyright.updated", { date: LEGAL_UPDATED_AT })}
        crumbs={[
          { name: t("Nav.home"), path: "/" },
          { name: t("Nav.copyright") },
        ]}
        breadcrumbLabel={t("Common.breadcrumb")}
      >
        {sections.map((key) => (
          <LegalSection key={key} title={t(`Copyright.${key}Title`)}>
            <p>
              {t(`Copyright.${key}Body`, {
                siteName: SITE_NAME,
                email: CONTACT_EMAIL,
                siteUrl: SITE_URL,
              })}
            </p>
          </LegalSection>
        ))}

        <LegalSection title={t("Copyright.relatedTitle")}>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <Link
                href="/terms"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {t("Copyright.relatedTerms")}
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {t("Copyright.relatedPrivacy")}
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {t("Copyright.relatedAbout")}
              </Link>
            </li>
          </ul>
        </LegalSection>
      </LegalPage>
    </>
  );
}
