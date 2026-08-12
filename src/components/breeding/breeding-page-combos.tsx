"use client";

import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDeferredValue, useMemo, useState } from "react";
import type {
  PalSummary,
  ParentBreedingResult,
  ReverseBreedingResult,
} from "@/types";
import { BreedingComboCard } from "@/components/breeding/breeding-combo-card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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
  const deferredChildQuery = useDeferredValue(childQuery);
  const deferredParentQuery = useDeferredValue(parentQuery);

  const filteredChild = useMemo(() => {
    const q = deferredChildQuery.trim();
    if (!q) return asChild;
    return asChild.filter(
      (combo) =>
        matchesName(combo.parent1, q) || matchesName(combo.parent2, q)
    );
  }, [asChild, deferredChildQuery]);

  const filteredParent = useMemo(() => {
    const q = deferredParentQuery.trim();
    if (!q) return asParent;
    return asParent.filter((combo) => matchesName(combo.partner, q));
  }, [asParent, deferredParentQuery]);

  const tabTriggerClass = cn(
    "cursor-pointer px-3 py-2.5 text-sm font-semibold whitespace-normal transition-colors",
    // Idle: readable, button-like
    "border border-border/80 bg-background/80 text-foreground/75",
    // Hover (inactive): clear click affordance
    "hover:border-primary/45 hover:bg-primary/10 hover:text-foreground",
    // Active
    "data-active:border-primary data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm",
    "data-active:hover:border-primary data-active:hover:bg-primary data-active:hover:text-primary-foreground"
  );

  return (
    <Tabs defaultValue="as-child" className="gap-5">
      <TabsList className="mx-auto grid h-auto w-full max-w-xl grid-cols-2 gap-2 bg-transparent p-0">
        <TabsTrigger value="as-child" className={tabTriggerClass}>
          {t("tabAsChild", { name: pal.name })}
        </TabsTrigger>
        <TabsTrigger value="as-parent" className={tabTriggerClass}>
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
          onChange={setChildQuery}
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
              <div
                key={`${combo.parent1.id}-${combo.parent2.id}-${combo.genderHint ?? ""}-${index}`}
                className="space-y-1.5"
              >
                <BreedingComboCard
                  parent1={combo.parent1}
                  parent2={combo.parent2}
                />
                {combo.genderHint ? (
                  <p className="px-1 text-xs font-medium text-primary">
                    {t("genderHint", { hint: combo.genderHint })}
                  </p>
                ) : null}
              </div>
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
          onChange={setParentQuery}
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
              <div
                key={`${combo.partner.id}-${combo.child.id}-${combo.genderHint ?? ""}`}
                className="space-y-1.5"
              >
                <BreedingComboCard
                  parent1={pal}
                  parent2={combo.partner}
                  child={combo.child}
                />
                {combo.genderHint ? (
                  <p className="px-1 text-xs font-medium text-primary">
                    {t("genderHint", { hint: combo.genderHint })}
                  </p>
                ) : null}
              </div>
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
