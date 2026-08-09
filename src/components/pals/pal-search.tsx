"use client";

import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import type { Pal, PalElement } from "@/types";
import type { ElementCount, WorkCount } from "@/lib/pal-insights";
import { MetaIcon } from "@/components/pals/meta-icon";
import { PalCard } from "@/components/pals/pal-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SortKey = "dex" | "name" | "rarity";

type PalSearchProps = {
  pals: Pal[];
  elements: ElementCount[];
  workTypes: WorkCount[];
};

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function PalSearch({ pals, elements, workTypes }: PalSearchProps) {
  const t = useTranslations("Pals");
  const [query, setQuery] = useState("");
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [selectedWorks, setSelectedWorks] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("dex");
  const [isPending, startTransition] = useTransition();

  const hasFilters =
    query.trim().length > 0 ||
    selectedElements.length > 0 ||
    selectedWorks.length > 0 ||
    sort !== "dex";

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const next = pals.filter((pal) => {
      const matchesQuery =
        !normalized ||
        pal.name.toLowerCase().includes(normalized) ||
        pal.slug.toLowerCase().includes(normalized) ||
        String(pal.dexNumber).includes(normalized);

      const matchesElement =
        selectedElements.length === 0 ||
        selectedElements.some((element) =>
          pal.type.includes(element as PalElement)
        );

      const matchesWork =
        selectedWorks.length === 0 ||
        selectedWorks.some((workId) =>
          pal.workSuitability.some(
            (item) => item.id === workId && item.level > 0
          )
        );

      return matchesQuery && matchesElement && matchesWork;
    });

    next.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "rarity") {
        if (b.rarity !== a.rarity) return b.rarity - a.rarity;
        return a.dexNumber - b.dexNumber;
      }
      if (a.dexNumber !== b.dexNumber) return a.dexNumber - b.dexNumber;
      return (a.dexSuffix || "").localeCompare(b.dexSuffix || "");
    });

    return next;
  }, [pals, query, selectedElements, selectedWorks, sort]);

  function resetFilters() {
    startTransition(() => {
      setQuery("");
      setSelectedElements([]);
      setSelectedWorks([]);
      setSort("dex");
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card p-3 shadow-sm ring-1 ring-foreground/[0.03]">
        <div className="relative min-w-[220px] flex-1 basis-[min(100%,18rem)]">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground/55"
            aria-hidden
          />
          <Input
            id="pal-search"
            aria-label={t("searchLabel")}
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(event) => {
              const value = event.target.value;
              startTransition(() => setQuery(value));
            }}
            className="h-10 border-border/80 bg-background pr-16 pl-9 shadow-none placeholder:text-muted-foreground/80"
          />
          <span
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs tabular-nums text-muted-foreground"
            aria-live="polite"
          >
            {filtered.length}/{pals.length}
            {isPending ? "…" : ""}
          </span>
        </div>

        <Select
          value={sort}
          onValueChange={(value) => {
            if (!value) return;
            startTransition(() => setSort(value as SortKey));
          }}
        >
          <SelectTrigger
            aria-label={t("sortLabel")}
            className="h-10 w-[148px] shrink-0 border-border/80 bg-background"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dex">{t("sortDex")}</SelectItem>
            <SelectItem value="name">{t("sortName")}</SelectItem>
            <SelectItem value="rarity">{t("sortRarity")}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasFilters}
          onClick={resetFilters}
          className="h-10 shrink-0 bg-background"
        >
          {t("reset")}
        </Button>
      </div>

      <section className="space-y-2" aria-label={t("browseByElement")}>
        <h2 className="text-sm font-medium text-muted-foreground">
          {t("browseByElement")}
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {elements.map((item) => {
            const active = selectedElements.includes(item.name);
            return (
              <Button
                key={item.id}
                type="button"
                size="sm"
                variant={active ? "secondary" : "outline"}
                aria-pressed={active}
                onClick={() =>
                  startTransition(() =>
                    setSelectedElements((current) =>
                      toggleValue(current, item.name)
                    )
                  )
                }
                className={cn(
                  "h-7 gap-1.5 px-2.5 font-normal",
                  active &&
                    "border-primary/30 bg-accent text-accent-foreground hover:bg-accent/80"
                )}
              >
                <MetaIcon
                  kind="element"
                  id={item.id}
                  label={item.name}
                  icon={item.icon}
                  className="opacity-90"
                />
                <span>{item.name}</span>
                <span className="text-xs text-muted-foreground">
                  {item.count}
                </span>
              </Button>
            );
          })}
        </div>
      </section>

      <section className="space-y-2" aria-label={t("browseByWork")}>
        <h2 className="text-sm font-medium text-muted-foreground">
          {t("browseByWork")}
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {workTypes.map((item) => {
            const active = selectedWorks.includes(item.id);
            return (
              <Button
                key={item.id}
                type="button"
                size="sm"
                variant={active ? "secondary" : "outline"}
                aria-pressed={active}
                onClick={() =>
                  startTransition(() =>
                    setSelectedWorks((current) => toggleValue(current, item.id))
                  )
                }
                className={cn(
                  "h-7 gap-1.5 px-2.5 font-normal",
                  active &&
                    "border-primary/30 bg-accent text-accent-foreground hover:bg-accent/80"
                )}
                title={item.name}
              >
                <MetaIcon
                  kind="work"
                  id={item.id}
                  label={item.name}
                  icon={item.icon}
                  className="opacity-90"
                />
                <span>{item.name}</span>
                <span className="text-xs text-muted-foreground">
                  {item.count}
                </span>
              </Button>
            );
          })}
        </div>
      </section>

      <div
        className={cn(
          "grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
          isPending && "opacity-80"
        )}
      >
        {filtered.map((pal) => (
          <PalCard key={pal.id} pal={pal} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {t("empty")}
        </p>
      ) : null}
    </div>
  );
}
