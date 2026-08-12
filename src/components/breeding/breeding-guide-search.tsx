"use client";

import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDeferredValue, useMemo, useState } from "react";
import type { Pal } from "@/types";
import { PalImage } from "@/components/pals/pal-image";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { formatDexNumber } from "@/lib/pal-format";

type BreedingGuideSearchProps = {
  pals: Pal[];
};

export function BreedingGuideSearch({ pals }: BreedingGuideSearchProps) {
  const t = useTranslations("BreedingHub");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const isPending = query !== deferredQuery;

  const filtered = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    if (!normalized) return pals;
    return pals.filter(
      (pal) =>
        pal.name.toLowerCase().includes(normalized) ||
        pal.slug.toLowerCase().includes(normalized) ||
        String(pal.dexNumber).includes(normalized)
    );
  }, [pals, deferredQuery]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-xl">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground/55"
          aria-hidden
        />
        <Input
          aria-label={t("searchLabel")}
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-10 border-border/80 bg-card pr-16 pl-9"
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs tabular-nums text-muted-foreground">
          {filtered.length}
          {isPending ? "…" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pal) => (
            <li key={pal.id}>
              <Link
                href={`/breeding/${pal.slug}`}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-2.5 transition-colors hover:border-primary/25 hover:bg-accent/40"
              >
                <PalImage src={pal.image} alt="" size={40} className="rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{pal.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDexNumber(pal.dexNumber, pal.dexSuffix)} ·{" "}
                    {t("guideLabel")}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
