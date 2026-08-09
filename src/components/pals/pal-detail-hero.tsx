import type { Pal } from "@/types";
import { MetaIcon } from "@/components/pals/meta-icon";
import { PalImage } from "@/components/pals/pal-image";
import { formatDexNumber } from "@/lib/pal-format";
import { getElementMeta } from "@/lib/pal-meta";
import { surfaceClass } from "@/lib/surface";
import { cn } from "@/lib/utils";

type PalDetailHeroProps = {
  pal: Pal;
  labels: {
    rarity: string;
    size: string;
    nocturnal: string;
    yes: string;
    no: string;
    combiRank: string;
  };
};

export function PalDetailHero({ pal, labels }: PalDetailHeroProps) {
  const metaBits = [
    `${labels.rarity} ${pal.rarity}`,
    `${labels.size} ${pal.size || "—"}`,
    `${labels.nocturnal} ${pal.nocturnal ? labels.yes : labels.no}`,
    `${labels.combiRank} ${pal.combiRank}`,
  ];

  return (
    <section className={cn(surfaceClass(), "overflow-hidden p-5 md:p-6")}>
      <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-8">
        <div className="relative mx-auto shrink-0 lg:mx-0">
          <div className="absolute inset-0 rounded-[1.35rem] bg-primary/8 blur-2xl" />
          <PalImage
            src={pal.image}
            alt={pal.name}
            size={192}
            priority
            className="relative rounded-2xl border border-border/50 bg-gradient-to-b from-muted/80 to-muted shadow-inner"
          />
        </div>

        <div className="min-w-0 space-y-3">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              {formatDexNumber(pal.dexNumber, pal.dexSuffix)}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {pal.name}
            </h1>
            {pal.shortDescription ? (
              <p className="text-sm font-medium text-foreground/80">
                {pal.shortDescription}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {pal.type.map((type) => {
              const meta = getElementMeta(type);
              return (
                <span
                  key={type}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-sm shadow-sm"
                >
                  <MetaIcon
                    kind="element"
                    id={meta?.id ?? type.toLowerCase()}
                    label={type}
                    icon={meta?.icon}
                    className="size-6"
                  />
                  <span className="font-medium">{type}</span>
                </span>
              );
            })}
          </div>

          <p className="text-sm text-muted-foreground">
            {metaBits.join(" · ")}
          </p>
        </div>

        {pal.description ? (
          <div className="min-w-0 rounded-xl bg-muted/35 px-4 py-4 ring-1 ring-foreground/[0.03] lg:self-stretch">
            <p className="text-sm leading-7 text-muted-foreground md:text-[15px]">
              {pal.description}
            </p>
          </div>
        ) : (
          <div className="hidden lg:block" />
        )}
      </div>
    </section>
  );
}
