"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { XIcon } from "lucide-react";
import type { PalSummary } from "@/types";
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
import { surfaceClass } from "@/lib/surface";
import { cn } from "@/lib/utils";

type PalSlotProps = {
  pals: PalSummary[];
  value?: string;
  onChange: (palId: string | undefined) => void;
  label?: string;
  placeholder?: string;
  size?: "md" | "lg";
};

export function PalSlot({
  pals,
  value,
  onChange,
  label,
  placeholder,
  size = "lg",
}: PalSlotProps) {
  const t = useTranslations("Calculator");
  const [open, setOpen] = useState(false);
  const selected = pals.find((pal) => pal.id === value);

  const sortedPals = useMemo(
    () => [...pals].sort((a, b) => a.name.localeCompare(b.name)),
    [pals]
  );

  const isLarge = size === "lg";

  return (
    <div className="w-full max-w-[200px] space-y-2">
      {label ? (
        <p className="text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
      ) : null}

      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative">
          <PopoverTrigger
            className={cn(
              surfaceClass(),
              "flex w-full flex-col items-center justify-center gap-2 border-dashed transition-colors",
              "hover:border-primary/35 hover:bg-accent/30",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              isLarge ? "min-h-[168px] px-3 py-4" : "min-h-[132px] px-3 py-3",
              selected && "border-solid border-border/70",
              open && "border-primary/40"
            )}
          >
            {selected ? (
              <>
                <PalImage
                  src={selected.image}
                  alt={selected.name}
                  size={isLarge ? 88 : 64}
                  className="rounded-xl"
                />
                <span className="line-clamp-2 text-center text-sm font-semibold">
                  {selected.name}
                </span>
              </>
            ) : (
              <>
                <span
                  className={cn(
                    "flex items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/40 text-2xl text-muted-foreground",
                    isLarge ? "size-20" : "size-16"
                  )}
                >
                  +
                </span>
                <span className="text-center text-sm text-muted-foreground">
                  {placeholder ?? t("selectPal")}
                </span>
              </>
            )}
          </PopoverTrigger>

          {selected ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onChange(undefined);
              }}
              className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm ring-1 ring-border/70 transition-colors hover:bg-muted hover:text-foreground"
              aria-label={t("clearPal")}
            >
              <XIcon className="size-3.5" />
            </button>
          ) : null}
        </div>

        <PopoverContent className="w-[300px] p-0" align="center">
          <Command>
            <CommandInput placeholder={t("searchPal")} />
            <CommandList>
              <CommandEmpty>{t("noPalFound")}</CommandEmpty>
              <CommandGroup>
                {sortedPals.map((pal) => {
                  const isSelected = value === pal.id;
                  return (
                    <CommandItem
                      key={pal.id}
                      value={`${pal.name} ${pal.slug}`}
                      onSelect={() => {
                        onChange(pal.id);
                        setOpen(false);
                      }}
                      className={cn(
                        isSelected &&
                          "bg-primary/10 text-foreground data-selected:bg-primary/15"
                      )}
                    >
                      <PalImage src={pal.image} alt={pal.name} size={32} />
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
    </div>
  );
}
