"use client";

import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import type {
  PalSummary,
  ParentBreedingResult,
  ReverseBreedingResult,
} from "@/types";
import { BreedingComboCard } from "@/components/breeding/breeding-combo-card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BreedingPageCombosProps = {
  pal: PalSummary;
  asChild: ReverseBreedingResult["combinations"];
  asParent: ParentBreedingResult["combinations"];
};

function matchesName(pal: PalSummary, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    pal.name.toLowerCase().includes(q) || pal.slug.toLowerCase().includes(q)
  );
}

export function BreedingPageCombos({
  pal,
  asChild,
  asParent,
}: BreedingPageCombosProps) {
  const t = useTranslations("BreedingPage");
  const [childQuery, setChildQuery] = useState("");
  const [parentQuery, setParentQuery] = useState("");
  const [, startTransition] = useTransition();

  const filteredChild = useMemo(() => {
    const q = childQuery.trim();
    if (!q) return asChild;
    return asChild.filter(
      (combo) =>
        matchesName(combo.parent1, q) || matchesName(combo.parent2, q)
    );
  }, [asChild, childQuery]);

  const filteredParent = useMemo(() => {
    const q = parentQuery.trim();
    if (!q) return asParent;
    return asParent.filter((combo) => matchesName(combo.partner, q));
  }, [asParent, parentQuery]);

  return (
    <Tabs defaultValue="as-child" className="gap-5">
      <TabsList className="mx-auto grid h-auto w-full max-w-xl grid-cols-2 p-1">
        <TabsTrigger
          value="as-child"
          className="px-3 py-2 text-sm whitespace-normal"
        >
          {t("tabAsChild", { name: pal.name })}
        </TabsTrigger>
        <TabsTrigger
          value="as-parent"
          className="px-3 py-2 text-sm whitespace-normal"
        >
          {t("tabAsParent", { name: pal.name })}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="as-child" className="space-y-4 outline-none">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("combinationsTitle", { name: pal.name })}
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            {t("combinationsBody", { name: pal.name })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("showingCount", {
              shown: filteredChild.length,
              total: asChild.length,
            })}
          </p>
        </div>

        <ComboSearch
          label={t("searchAsChildLabel", { name: pal.name })}
          placeholder={t("searchAsChildPlaceholder")}
          value={childQuery}
          onChange={(value) => startTransition(() => setChildQuery(value))}
        />

        {asChild.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("noCombinations", { name: pal.name })}
          </p>
        ) : filteredChild.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("searchEmpty")}</p>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredChild.map((combo, index) => (
              <BreedingComboCard
                key={`${combo.parent1.id}-${combo.parent2.id}-${index}`}
                parent1={combo.parent1}
                parent2={combo.parent2}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="as-parent" className="space-y-4 outline-none">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("asParentTitle", { name: pal.name })}
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            {t("asParentBody", { name: pal.name })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("showingCount", {
              shown: filteredParent.length,
              total: asParent.length,
            })}
          </p>
        </div>

        <ComboSearch
          label={t("searchAsParentLabel", { name: pal.name })}
          placeholder={t("searchAsParentPlaceholder")}
          value={parentQuery}
          onChange={(value) => startTransition(() => setParentQuery(value))}
        />

        {asParent.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("noAsParent", { name: pal.name })}
          </p>
        ) : filteredParent.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("searchEmpty")}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredParent.map((combo) => (
              <BreedingComboCard
                key={`${combo.partner.id}-${combo.child.id}`}
                parent1={pal}
                parent2={combo.partner}
                child={combo.child}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function ComboSearch({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative max-w-xl">
      <SearchIcon
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground/55"
        aria-hidden
      />
      <Input
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 border-border/80 bg-card pr-3 pl-9"
      />
    </div>
  );
}
