import { toLocale } from "@/i18n/locale";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage, LegalSection } from "@/components/layout/legal-page";
import { JsonLd } from "@/components/seo/json-ld";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ContactPageProps) {
  const { locale: rawLocale } = await params;
  const locale = toLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "Meta" });

  return buildMetadata({
    title: t("contactTitle"),
    description: t("contactDescription"),
    path: "/contact",
    locale,
  });
}

export default async function ContactPage({ params }: ContactPageProps) {
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
            { name: t("Nav.contact"), path: "/contact" },
          ],
          locale
        )}
      />
      <LegalPage
        title={t("Contact.title")}
        description={t("Contact.intro", { siteName: SITE_NAME })}
        crumbs={[
          { name: t("Nav.home"), path: "/" },
          { name: t("Nav.contact") },
        ]}
        breadcrumbLabel={t("Common.breadcrumb")}
      >
        <LegalSection title={t("Contact.emailLabel")}>
          <p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>{t("Contact.emailHint")}</p>
        </LegalSection>
        <LegalSection title={t("Contact.topicsTitle")}>
          <ul className="list-disc space-y-2 pl-5">
            <li>{t("Contact.topic1")}</li>
            <li>{t("Contact.topic2")}</li>
            <li>{t("Contact.topic3")}</li>
          </ul>
        </LegalSection>
        <LegalSection title={t("Contact.responseTitle")}>
          <p>{t("Contact.responseBody", { siteName: SITE_NAME })}</p>
        </LegalSection>
      </LegalPage>
    </>
  );
}
