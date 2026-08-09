import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  name: string;
  /** Omit path on the current (last) crumb. */
  path?: string;
};

type SiteBreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
  /** Accessible name for the nav landmark */
  label?: string;
  /** Replaces the last crumb (e.g. a Pal switcher). */
  currentSlot?: ReactNode;
};

/** Visible trail that mirrors BreadcrumbList JSON-LD for detail pages. */
export function SiteBreadcrumbs({
  items,
  className,
  label = "Breadcrumb",
  currentSlot,
}: SiteBreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label={label} className={cn("min-w-0", className)}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.name}-${index}`}
              className="flex min-w-0 items-center gap-1"
            >
              {index > 0 ? (
                <ChevronRight
                  className="size-3.5 shrink-0 opacity-60"
                  aria-hidden
                />
              ) : null}
              {isLast && currentSlot ? (
                <div className="min-w-0" aria-current="page">
                  {currentSlot}
                </div>
              ) : isLast || !item.path ? (
                <span
                  className="truncate font-medium text-foreground"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="truncate transition-colors hover:text-foreground"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
