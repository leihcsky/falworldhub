"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronsUpDown } from "lucide-react";
import type { PalSummary } from "@/types";
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
import { PalImage } from "@/components/pals/pal-image";
import { matchesPalQuery } from "@/lib/pal-search";
import { cn } from "@/lib/utils";

type PalComboboxProps = {
  pals: PalSummary[];
  value?: string;
  onChange: (palId: string) => void;
  placeholder?: string;
};

/** Compact combobox kept for secondary UIs; calculator uses PalSlot. */
export function PalCombobox({
  pals,
  value,
  onChange,
  placeholder,
}: PalComboboxProps) {
  const t = useTranslations("Calculator");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = pals.find((pal) => pal.id === value);
  const sortedPals = useMemo(
    () => [...pals].sort((a, b) => a.name.localeCompare(b.name)),
    [pals]
  );
  const filteredPals = useMemo(
    () => sortedPals.filter((pal) => matchesPalQuery(pal, query)),
    [sortedPals, query]
  );

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
            className="h-11 w-full justify-between px-3"
          />
        }
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected ? (
            <>
              <PalImage src={selected.image} alt={selected.name} size={28} />
              <span className="truncate">{selected.name}</span>
            </>
          ) : (
            <span className="text-muted-foreground">
              {placeholder ?? t("selectPal")}
            </span>
          )}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[var(--anchor-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t("searchPal")}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>{t("noPalFound")}</CommandEmpty>
            <CommandGroup>
              {filteredPals.map((pal) => {
                const isSelected = value === pal.id;
                return (
                  <CommandItem
                    key={pal.id}
                    value={pal.id}
                    onSelect={() => {
                      onChange(pal.id);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      isSelected &&
                        "bg-primary/10 text-foreground data-selected:bg-primary/15"
                    )}
                  >
                    <PalImage src={pal.image} alt={pal.name} size={28} />
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
