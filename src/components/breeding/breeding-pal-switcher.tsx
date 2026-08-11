"use client";

import { ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { PalSummary } from "@/types";
import { PalImage } from "@/components/pals/pal-image";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "@/i18n/navigation";
import { matchesPalQuery } from "@/lib/pal-search";
import { cn } from "@/lib/utils";

type BreedingPalSwitcherProps = {
  pals: PalSummary[];
  currentSlug: string;
};

/** Compact searchable jump control — sits in the breadcrumb row. */
export function BreedingPalSwitcher({
  pals,
  currentSlug,
}: BreedingPalSwitcherProps) {
  const t = useTranslations("BreedingPage");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const sortedPals = useMemo(
    () => [...pals].sort((a, b) => a.name.localeCompare(b.name)),
    [pals]
  );
  const filteredPals = useMemo(
    () => sortedPals.filter((pal) => matchesPalQuery(pal, query)),
    [sortedPals, query]
  );
  const current = pals.find((pal) => pal.slug === currentSlug);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={t("switchLabel")}
            className={cn(
              "h-9 max-w-[min(100%,18rem)] gap-2 border-primary/35 bg-primary/5 px-2.5 font-medium text-foreground shadow-sm",
              "hover:border-primary/55 hover:bg-primary/10",
              open && "border-primary/60 bg-primary/10 ring-2 ring-primary/20"
            )}
          />
        }
      >
        {current ? (
          <PalImage src={current.image} alt="" size={22} className="rounded" />
        ) : null}
        <span className="truncate">{current?.name ?? t("switchPlaceholder")}</span>
        <span className="hidden items-center gap-1 border-l border-primary/25 pl-2 text-xs font-medium text-primary sm:inline-flex">
          {t("switchHint")}
          <ChevronsUpDown className="size-3.5 opacity-80" />
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-primary sm:hidden" />
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t("switchSearch")}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>{t("switchEmpty")}</CommandEmpty>
            <CommandGroup>
              {filteredPals.map((pal) => {
                const isSelected = pal.slug === currentSlug;
                return (
                  <CommandItem
                    key={pal.id}
                    value={pal.id}
                    onSelect={() => {
                      setOpen(false);
                      setQuery("");
                      if (pal.slug === currentSlug) return;
                      router.push(`/breeding/${pal.slug}`);
                    }}
                    className={cn(
                      isSelected &&
                        "bg-primary/10 text-foreground data-selected:bg-primary/15"
                    )}
                  >
                    <PalImage src={pal.image} alt="" size={28} />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {pal.name}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
