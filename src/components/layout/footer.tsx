import { useTranslations } from "next-intl";
import { SiteLogo } from "@/components/brand/site-logo";
import { FooterFeaturedBadges } from "@/components/layout/footer-featured-badges";
import { VersionBadge } from "@/components/layout/version-badge";
import { Link } from "@/i18n/navigation";
import {
  LEGAL_NAV_ITEMS,
  NAV_ITEMS,
  SITE_NAME,
} from "@/lib/constants";

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();
  const exploreItems = NAV_ITEMS;

  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-[minmax(0,1.4fr)_auto_auto]">
        <div className="space-y-3">
          <SiteLogo size={36} />
          <p className="max-w-sm text-sm text-muted-foreground">
            {t("Footer.blurb")}
          </p>
          <VersionBadge variant="detailed" />
          <FooterFeaturedBadges />
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-medium text-foreground">{t("Footer.explore")}</p>
          <div className="flex flex-col gap-2">
            {exploreItems.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(`Nav.${link.labelKey}`)}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-medium text-foreground">{t("Footer.legal")}</p>
          <div className="flex flex-col gap-2">
            {LEGAL_NAV_ITEMS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(`Nav.${link.labelKey}`)}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          {t("Common.copyright", { year, siteName: SITE_NAME })}
        </p>
      </div>
    </footer>
  );
}
