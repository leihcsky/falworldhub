import type { PalSummary } from "@/types";
import { PalImage } from "@/components/pals/pal-image";
import { Link } from "@/i18n/navigation";
import { surfaceHoverClass } from "@/lib/surface";
import { cn } from "@/lib/utils";

type BreedingComboCardProps = {
  parent1: PalSummary;
  parent2: PalSummary;
  /** When set, shows Parent + Parent = Child */
  child?: PalSummary;
};

function PalChip({
  pal,
  hrefPrefix = "/pals",
}: {
  pal: PalSummary;
  hrefPrefix?: "/pals" | "/breeding";
}) {
  return (
    <Link
      href={`${hrefPrefix}/${pal.slug}`}
      className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-0.5 transition-colors hover:bg-muted/70"
    >
      <PalImage src={pal.image} alt={pal.name} size={36} />
      <span className="truncate text-sm font-medium">{pal.name}</span>
    </Link>
  );
}

/** Avatar-over-name slot — better for 3-pal outcome cards. */
function PalStack({
  pal,
  hrefPrefix = "/pals",
}: {
  pal: PalSummary;
  hrefPrefix?: "/pals" | "/breeding";
}) {
  return (
    <Link
      href={`${hrefPrefix}/${pal.slug}`}
      className="flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-lg px-1 py-1 text-center transition-colors hover:bg-muted/70"
    >
      <PalImage src={pal.image} alt="" size={40} className="rounded-lg" />
      <span className="w-full text-xs font-medium leading-snug break-words hyphens-auto">
        {pal.name}
      </span>
    </Link>
  );
}

function Op({ children, tone = "primary" }: { children: string; tone?: "primary" | "muted" }) {
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center self-center rounded-full text-sm font-bold leading-none",
        tone === "primary"
          ? "bg-primary/12 text-primary"
          : "bg-muted text-muted-foreground"
      )}
      aria-hidden
    >
      {children}
    </span>
  );
}

export function BreedingComboCard({
  parent1,
  parent2,
  child,
}: BreedingComboCardProps) {
  if (child) {
    return (
      <div className={cn(surfaceHoverClass(), "flex items-start gap-1 px-2.5 py-3")}>
        <PalStack pal={parent1} />
        <Op>+</Op>
        <PalStack pal={parent2} />
        <Op tone="muted">=</Op>
        <PalStack pal={child} hrefPrefix="/breeding" />
      </div>
    );
  }

  return (
    <div className={cn(surfaceHoverClass(), "flex items-center gap-1 px-2.5 py-2")}>
      <PalChip pal={parent1} />
      <Op>+</Op>
      <PalChip pal={parent2} />
    </div>
  );
}
