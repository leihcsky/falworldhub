import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type HubKey = "calculator" | "pals" | "breeding";

const HUBS: Array<{
  key: HubKey;
  href: "/breeding-calculator" | "/pals" | "/breeding";
  labelKey: "linkCalculator" | "linkPals" | "linkCombos";
}> = [
  {
    key: "calculator",
    href: "/breeding-calculator",
    labelKey: "linkCalculator",
  },
  { key: "pals", href: "/pals", labelKey: "linkPals" },
  { key: "breeding", href: "/breeding", labelKey: "linkCombos" },
];

type RelatedHubLinksProps = {
  current: HubKey;
  className?: string;
};

/** Cross-links between the three SEO hub pages with keyword-aligned anchors. */
export async function RelatedHubLinks({
  current,
  className,
}: RelatedHubLinksProps) {
  const t = await getTranslations("RelatedHubs");
  const links = HUBS.filter((hub) => hub.key !== current);

  return (
    <section className={cn("space-y-4 border-t pt-12", className)}>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("title")}
        </h2>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          {t("body")}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {links.map((hub, index) => (
          <Link
            key={hub.key}
            href={hub.href}
            className={cn(
              buttonVariants({
                size: "lg",
                variant: index === 0 ? "default" : "outline",
              })
            )}
          >
            {t(hub.labelKey)}
          </Link>
        ))}
      </div>
    </section>
  );
}
