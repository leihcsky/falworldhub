import type { ReactNode } from "react";
import { SiteBreadcrumbs, type BreadcrumbItem } from "@/components/layout/site-breadcrumbs";

type LegalPageProps = {
  title: string;
  description?: string;
  updatedLabel?: string;
  crumbs: BreadcrumbItem[];
  breadcrumbLabel: string;
  children: ReactNode;
};

/** Shared layout for About / Contact / Terms / Privacy. */
export function LegalPage({
  title,
  description,
  updatedLabel,
  crumbs,
  breadcrumbLabel,
  children,
}: LegalPageProps) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 md:py-12">
      <SiteBreadcrumbs items={crumbs} label={breadcrumbLabel} />

      <header className="space-y-3 border-b pb-8">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="text-base text-muted-foreground md:text-lg">
            {description}
          </p>
        ) : null}
        {updatedLabel ? (
          <p className="text-sm text-muted-foreground">{updatedLabel}</p>
        ) : null}
      </header>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground md:text-[15px] md:leading-7">
        {children}
      </div>
    </div>
  );
}

type LegalSectionProps = {
  title: string;
  children: ReactNode;
};

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
