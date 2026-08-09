"use client";

import type { Pal } from "@/types";
import { MetaIcon } from "@/components/pals/meta-icon";
import { PalImage } from "@/components/pals/pal-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { formatDexNumber } from "@/lib/pal-format";
import { getElementMeta, getWorkMeta } from "@/lib/pal-meta";

type PalCardProps = {
  pal: Pal;
};

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">
      <span className="font-medium text-foreground/70">{label}</span>
      <span className="text-foreground">{value}</span>
    </span>
  );
}

export function PalCard({ pal }: PalCardProps) {
  const works = pal.workSuitability.filter((work) => work.level > 0);

  return (
    <Link href={`/pals/${pal.slug}`} className="block h-full">
      <Card
        size="sm"
        className="h-full gap-2 border-border/80 bg-card/90 py-2.5 shadow-none transition-colors hover:border-primary/25 hover:bg-accent/40"
      >
        <CardHeader className="flex flex-row items-center gap-2.5 space-y-0 px-2.5">
          <PalImage src={pal.image} alt={pal.name} size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] leading-none text-muted-foreground">
                {formatDexNumber(pal.dexNumber, pal.dexSuffix)}
              </p>
              <div className="flex items-center gap-0.5 opacity-90">
                {pal.type.map((type) => {
                  const meta = getElementMeta(type);
                  return (
                    <MetaIcon
                      key={type}
                      kind="element"
                      id={meta?.id ?? type.toLowerCase()}
                      label={type}
                      icon={meta?.icon}
                      className="size-3.5"
                    />
                  );
                })}
              </div>
            </div>
            <CardTitle className="mt-0.5 truncate text-sm">{pal.name}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 px-2.5">
          <div className="flex flex-wrap gap-1">
            <StatPill label="HP" value={pal.stats.hp} />
            <StatPill label="ATK" value={pal.stats.attack} />
            <StatPill label="DEF" value={pal.stats.defense} />
          </div>

          {works.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {works.map((work) => {
                const meta = getWorkMeta(work.id);
                return (
                  <span
                    key={work.id}
                    title={`${work.name} Lv ${work.level}`}
                    className="inline-flex items-center gap-0.5 rounded-md bg-muted/80 px-1 py-0.5 text-[11px] tabular-nums text-muted-foreground"
                  >
                    <MetaIcon
                      kind="work"
                      id={work.id}
                      label={work.name}
                      icon={meta?.icon}
                      className="size-3.5 opacity-80"
                    />
                    <span>{work.level}</span>
                  </span>
                );
              })}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
