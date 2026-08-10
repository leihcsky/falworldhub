"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { BreedingDataFile, Pal, PalSummary } from "@/types";
import { findChildClient, findParentsClient } from "@/lib/breeding";
import { BreedingComboCard } from "@/components/breeding/breeding-combo-card";
import { PalSlot } from "@/components/breeding/pal-slot";
import { MetaIcon } from "@/components/pals/meta-icon";
import { PalImage } from "@/components/pals/pal-image";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";
import { formatDexNumber } from "@/lib/pal-format";
import { getElementMeta, getWorkMeta } from "@/lib/pal-meta";
import { surfaceClass } from "@/lib/surface";
import { cn } from "@/lib/utils";

type BreedingCalculatorProps = {
  pals: Pal[];
  breeding: BreedingDataFile;
  defaultTargetId?: string;
};

function toSummary(pal: Pal): PalSummary {
  return {
    id: pal.id,
    name: pal.name,
    slug: pal.slug,
    image: pal.image,
    type: pal.type,
    tribe: pal.tribe,
    combiRank: pal.combiRank,
    combiDuplicatePriority: pal.combiDuplicatePriority,
    breedable: pal.breedable,
  };
}

export function BreedingCalculator({
  pals,
  breeding,
  defaultTargetId,
}: BreedingCalculatorProps) {
  const t = useTranslations("Calculator");
  const tPals = useTranslations("Pals");
  const searchParams = useSearchParams();
  const targetFromQuery = searchParams.get("target") ?? undefined;
  const initialTarget = defaultTargetId ?? targetFromQuery;

  const [mode, setMode] = useState<"forward" | "reverse">(
    initialTarget ? "reverse" : "forward"
  );
  const [parent1, setParent1] = useState<string>();
  const [parent2, setParent2] = useState<string>();
  const [femaleParentId, setFemaleParentId] = useState<string>();
  const [target, setTarget] = useState<string | undefined>(initialTarget);

  useEffect(() => {
    if (!targetFromQuery) return;
    setTarget(targetFromQuery);
    setMode("reverse");
  }, [targetFromQuery]);

  useEffect(() => {
    setFemaleParentId(undefined);
  }, [parent1, parent2]);

  const summaries = useMemo(() => pals.map(toSummary), [pals]);
  const palById = useMemo(
    () => new Map(pals.map((pal) => [pal.id, pal])),
    [pals]
  );

  const breedablePals = useMemo(
    () => summaries.filter((pal) => pal.breedable),
    [summaries]
  );

  const forwardResult = useMemo(() => {
    if (!parent1 || !parent2) return null;
    return findChildClient(breeding, summaries, parent1, parent2, {
      femaleParentId,
    });
  }, [breeding, summaries, parent1, parent2, femaleParentId]);

  const reverseResult = useMemo(() => {
    if (!target) return null;
    return findParentsClient(breeding, summaries, target, { formulaLimit: 48 });
  }, [breeding, summaries, target]);

  const needsGender = Boolean(
    forwardResult?.genderOptions &&
      forwardResult.genderOptions.length > 0 &&
      !forwardResult.child
  );

  const childPal = forwardResult?.child
    ? (palById.get(forwardResult.child.id) ?? null)
    : null;

  function findParentsForChild(childId: string) {
    setTarget(childId);
    setMode("reverse");
  }

  return (
    <Tabs
      value={mode}
      onValueChange={(value) => {
        if (value === "forward" || value === "reverse") setMode(value);
      }}
      className="gap-6"
    >
      <TabsList className="mx-auto grid h-10 w-full max-w-md grid-cols-2">
        <TabsTrigger value="forward" className="text-sm">
          {t("tabForward")}
        </TabsTrigger>
        <TabsTrigger value="reverse" className="text-sm">
          {t("tabReverse")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="forward" className="space-y-6 outline-none">
        <div className={cn(surfaceClass(), "px-4 py-8 md:px-8")}>
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-3">
            <PalSlot
              pals={breedablePals}
              value={parent1}
              onChange={setParent1}
              label={t("parent1")}
              placeholder={t("selectParent1")}
            />

            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xl font-bold text-primary"
              aria-hidden
            >
              +
            </span>

            <PalSlot
              pals={breedablePals}
              value={parent2}
              onChange={setParent2}
              label={t("parent2")}
              placeholder={t("selectParent2")}
            />

            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xl font-bold text-muted-foreground"
              aria-hidden
            >
              =
            </span>

            <ChildResultSlot
              child={forwardResult?.child ?? null}
              detail={childPal}
              waiting={!parent1 || !parent2 || needsGender}
              noResult={Boolean(
                parent1 &&
                  parent2 &&
                  !needsGender &&
                  !forwardResult?.child
              )}
              labels={{
                child: t("childPal"),
                waiting: needsGender ? t("genderNeeded") : t("childWaiting"),
                empty: t("noResult"),
              }}
            />
          </div>
        </div>

        {needsGender && forwardResult?.genderOptions ? (
          <div className={cn(surfaceClass(), "space-y-4 px-4 py-5 md:px-6")}>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">
                {t("genderTitle")}
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {t("genderBody")}
              </p>
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">
                {t("genderFemaleLabel")}
              </legend>
              <div className="flex flex-wrap gap-2">
                {forwardResult.genderOptions.map((option) => {
                  const female = palById.get(option.femaleParentId);
                  if (!female) return null;
                  const selected = femaleParentId === option.femaleParentId;
                  return (
                    <button
                      key={option.femaleParentId}
                      type="button"
                      onClick={() => setFemaleParentId(option.femaleParentId)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/80 bg-background hover:border-primary/40 hover:bg-primary/5"
                      )}
                    >
                      <PalImage
                        src={female.image}
                        alt=""
                        size={28}
                        className="rounded"
                      />
                      {t("genderOption", { name: female.name })}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        ) : null}

        {childPal && forwardResult?.child ? (
          <ChildResultPanel
            pal={childPal}
            source={forwardResult.source}
            genderHint={
              forwardResult.genderOptions && femaleParentId
                ? (() => {
                    const option = forwardResult.genderOptions.find(
                      (item) => item.femaleParentId === femaleParentId
                    );
                    if (!option) return undefined;
                    const female = palById.get(option.femaleParentId);
                    const male = palById.get(option.maleParentId);
                    if (!female || !male) return undefined;
                    return t("genderResultHint", {
                      hint: `Female ${female.name} + Male ${male.name}`,
                    });
                  })()
                : undefined
            }
            labels={{
              title: t("childResultTitle"),
              sourceUnique: t("sourceUnique"),
              sourceFormula: t("sourceFormula"),
              rarity: tPals("rarity"),
              hp: tPals("hp"),
              attack: tPals("attack"),
              defense: tPals("defense"),
              partnerSkill: tPals("partnerSkill"),
              work: t("childWork"),
              viewChildDetails: t("viewChildDetails"),
              breedingGuide: t("breedingGuide"),
              findParents: t("findParentsForChild"),
            }}
            onFindParents={() => findParentsForChild(childPal.id)}
          />
        ) : null}
      </TabsContent>

      <TabsContent value="reverse" className="space-y-6 outline-none">
        <div className={cn(surfaceClass(), "flex justify-center px-4 py-8")}>
          <PalSlot
            pals={breedablePals}
            value={target}
            onChange={setTarget}
            label={t("targetPal")}
            placeholder={t("selectTarget")}
          />
        </div>

        {reverseResult ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  {t("howToBreed", { name: reverseResult.child.name })}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("combinationCount", {
                    count: reverseResult.combinations.length,
                  })}
                </p>
              </div>
              <Link
                href={`/breeding/${reverseResult.child.slug}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                {t("openSeoPage")}
              </Link>
            </div>

            {reverseResult.combinations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("noCombinations")}
              </p>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {reverseResult.combinations.map((combo, index) => (
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
                        {t("genderResultHint", { hint: combo.genderHint })}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            {t("reverseHint")}
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}

function ChildResultSlot({
  child,
  detail,
  waiting,
  noResult,
  labels,
}: {
  child: PalSummary | null;
  detail: Pal | null;
  waiting: boolean;
  noResult: boolean;
  labels: {
    child: string;
    waiting: string;
    empty: string;
  };
}) {
  return (
    <div className="w-full max-w-[220px] space-y-2">
      <p className="text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {labels.child}
      </p>
      <div
        className={cn(
          surfaceClass(),
          "flex min-h-[168px] flex-col items-center justify-center gap-2 border-solid px-3 py-4",
          child && "ring-1 ring-primary/20"
        )}
      >
        {child ? (
          <>
            <PalImage
              src={child.image}
              alt={child.name}
              size={88}
              className="rounded-xl"
            />
            <span className="line-clamp-2 text-center text-sm font-semibold">
              {child.name}
            </span>
            {detail ? (
              <div className="flex items-center gap-1">
                {detail.type.map((type) => {
                  const meta = getElementMeta(type);
                  return (
                    <MetaIcon
                      key={type}
                      kind="element"
                      id={meta?.id ?? type.toLowerCase()}
                      label={type}
                      icon={meta?.icon}
                      className="size-4"
                    />
                  );
                })}
              </div>
            ) : null}
          </>
        ) : (
          <>
            <span className="flex size-20 items-center justify-center rounded-xl bg-muted/50 text-sm text-muted-foreground">
              ?
            </span>
            <span className="text-center text-sm text-muted-foreground">
              {waiting ? labels.waiting : noResult ? labels.empty : labels.waiting}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs tabular-nums text-muted-foreground">
      <span className="font-medium text-foreground/70">{label}</span>
      <span className="text-foreground">{value}</span>
    </span>
  );
}

function ChildResultPanel({
  pal,
  source,
  genderHint,
  labels,
  onFindParents,
}: {
  pal: Pal;
  source?: "unique" | "formula";
  genderHint?: string;
  labels: {
    title: string;
    sourceUnique: string;
    sourceFormula: string;
    rarity: string;
    hp: string;
    attack: string;
    defense: string;
    partnerSkill: string;
    work: string;
    viewChildDetails: string;
    breedingGuide: string;
    findParents: string;
  };
  onFindParents: () => void;
}) {
  const works = pal.workSuitability.filter((work) => work.level > 0);

  return (
    <div className={cn(surfaceClass(), "space-y-5 px-4 py-5 md:px-6")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {labels.title}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">{pal.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDexNumber(pal.dexNumber, pal.dexSuffix)}
            <span className="mx-1.5 text-border">·</span>
            {labels.rarity} {pal.rarity}
          </p>
          {genderHint ? (
            <p className="mt-1 text-sm font-medium text-primary">{genderHint}</p>
          ) : null}
        </div>
        {source ? (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              source === "unique"
                ? "bg-primary/12 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {source === "unique" ? labels.sourceUnique : labels.sourceFormula}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <PalImage
          src={pal.image}
          alt={pal.name}
          size={112}
          className="mx-auto rounded-2xl sm:mx-0"
        />

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {pal.type.map((type) => {
              const meta = getElementMeta(type);
              return (
                <span
                  key={type}
                  className="inline-flex items-center gap-1.5 rounded-md bg-muted/80 px-2 py-1 text-xs"
                >
                  <MetaIcon
                    kind="element"
                    id={meta?.id ?? type.toLowerCase()}
                    label={type}
                    icon={meta?.icon}
                    className="size-4"
                  />
                  {type}
                </span>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <StatPill label={labels.hp} value={pal.stats.hp} />
            <StatPill label={labels.attack} value={pal.stats.attack} />
            <StatPill label={labels.defense} value={pal.stats.defense} />
          </div>

          {works.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                {labels.work}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {works.map((work) => {
                  const meta = getWorkMeta(work.id);
                  return (
                    <span
                      key={work.id}
                      title={`${work.name} Lv ${work.level}`}
                      className="inline-flex items-center gap-1 rounded-md bg-muted/80 px-1.5 py-1 text-xs tabular-nums text-muted-foreground"
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
            </div>
          ) : null}

          {pal.partnerSkill?.name ? (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {labels.partnerSkill}
              </p>
              <p className="text-sm font-medium">{pal.partnerSkill.name}</p>
              {pal.partnerSkill.description ? (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {pal.partnerSkill.description}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
        <Link
          href={`/pals/${pal.slug}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          {labels.viewChildDetails}
        </Link>
        <Link
          href={`/breeding/${pal.slug}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          {labels.breedingGuide}
        </Link>
        <Button type="button" onClick={onFindParents}>
          {labels.findParents}
        </Button>
      </div>
    </div>
  );
}
