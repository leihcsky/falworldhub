"use client";

import { useTranslations } from "next-intl";
import { SiteLogo } from "@/components/brand/site-logo";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { VersionBadge } from "@/components/layout/version-badge";
import { buttonVariants } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  // Avoid `/breeding` matching `/breeding-calculator`.
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-3">
          <SiteLogo size={34} />
          <VersionBadge />
        </div>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_ITEMS.map((link) => {
            const active = isNavActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "default" }),
                  "px-3 text-[15px] font-medium",
                  active
                    ? "bg-primary/10 font-semibold text-primary hover:bg-primary/15 hover:text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <Link
            href="/breeding-calculator"
            className={cn(buttonVariants({ size: "sm" }), "md:hidden")}
          >
            {t("calculatorShort")}
          </Link>
        </div>
      </div>
    </header>
  );
}
