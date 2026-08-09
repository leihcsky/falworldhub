"use client";

import { useTranslations } from "next-intl";
import type { Pal, PalActiveSkillRef, PalDrop } from "@/types";
import { MetaIcon } from "@/components/pals/meta-icon";
import { getElementMeta, getWorkMeta } from "@/lib/pal-meta";
import { getSkillMeta } from "@/lib/skill-meta";
import { surfaceClass, surfaceHoverClass } from "@/lib/surface";
import { cn } from "@/lib/utils";

type PalStatsProps = {
  pal: Pal;
};

type StatItem = {
  label: string;
  value: string | number;
};

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="h-5 w-1 rounded-full bg-primary" aria-hidden />
      <h2 className="text-xl font-semibold tracking-tight">{children}</h2>
    </div>
  );
}

function StatTile({ label, value }: StatItem) {
  return (
    <div className={cn(surfaceHoverClass(), "px-3 py-3")}>
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums">
        {value}
      </p>
    </div>
  );
}

function StatTileGrid({ items }: { items: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map((item) => (
        <StatTile key={item.label} {...item} />
      ))}
    </div>
  );
}

function DropsSection({
  title,
  emptyLabel,
  defaultLabel,
  levelLabel,
  groups,
}: {
  title: string;
  emptyLabel: string;
  defaultLabel: string;
  levelLabel: (level: number) => string;
  groups: Array<[number, PalDrop[]]>;
}) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      {groups.length > 0 ? (
        <div className="space-y-3">
          {groups.map(([level, items]) => (
            <div key={level} className="space-y-2">
              {groups.length > 1 || level > 0 ? (
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {level > 0 ? levelLabel(level) : defaultLabel}
                </p>
              ) : null}
              <div className="space-y-1.5">
                {items.map((drop) => (
                  <div
                    key={`${level}-${drop.id}-${drop.min}-${drop.max}-${drop.rate}`}
                    className={cn(
                      surfaceClass(),
                      "grid grid-cols-[1fr_auto_auto] items-center gap-3 px-3 py-2.5 text-sm"
                    )}
                  >
                    <span className="font-medium">{drop.name || drop.id}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                      {formatDropQuantity(drop)}
                    </span>
                    <span className="min-w-12 text-right text-sm font-semibold tabular-nums text-primary">
                      {formatDropRate(drop.rate)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      )}
    </section>
  );
}

function formatDropQuantity(drop: PalDrop) {
  if (drop.min === drop.max) return String(drop.min);
  return `${drop.min}–${drop.max}`;
}

function formatDropRate(rate: number) {
  if (Number.isInteger(rate)) return `${rate}%`;
  return `${Number(rate.toFixed(2))}%`;
}

function groupDropsByLevel(drops: PalDrop[]) {
  const groups = new Map<number, PalDrop[]>();
  for (const drop of drops) {
    const level = drop.level || 0;
    const list = groups.get(level) ?? [];
    list.push(drop);
    groups.set(level, list);
  }
  return [...groups.entries()].sort((a, b) => a[0] - b[0]);
}

function localizePalText(text: string, palId: string, palName: string) {
  if (!text) return text;
  return text.replace(new RegExp(`\\b${palId}\\b`, "gi"), palName);
}

function resolveActiveSkill(
  skill: PalActiveSkillRef,
  palId: string,
  palName: string
) {
  const meta = getSkillMeta(skill.id);
  return {
    ...skill,
    name: skill.name || meta?.name || skill.id,
    description: localizePalText(
      skill.description || meta?.description || "",
      palId,
      palName
    ),
    element: skill.element || meta?.type,
    power: skill.power ?? meta?.power,
    coolTime: skill.coolTime ?? meta?.coolTime,
    category: skill.category || meta?.category || "",
  };
}

export function PalStats({ pal }: PalStatsProps) {
  const t = useTranslations("Pals");
  const { stats } = pal;
  const drops = pal.drops ?? [];
  const dropGroups = groupDropsByLevel(drops);
  const activeSkills = (pal.activeSkills ?? []).map((skill) =>
    resolveActiveSkill(skill, pal.id, pal.name)
  );
  const partnerDescription = localizePalText(
    pal.partnerSkill.description || "",
    pal.id,
    pal.name
  );

  const combatStats: StatItem[] = [
    { label: t("hp"), value: stats.hp },
    { label: t("meleeAttack"), value: stats.meleeAttack },
    { label: t("shotAttack"), value: stats.shotAttack },
    { label: t("defense"), value: stats.defense },
    { label: t("support"), value: stats.support },
    { label: t("workSpeed"), value: stats.craftSpeed },
    { label: t("stamina"), value: stats.stamina },
  ];

  const movementStats: StatItem[] = [
    { label: t("slowWalkSpeed"), value: stats.slowWalkSpeed },
    { label: t("walkSpeed"), value: stats.walkSpeed },
    { label: t("runSpeed"), value: stats.runSpeed },
    { label: t("rideSprintSpeed"), value: stats.rideSprintSpeed },
    { label: t("transportSpeed"), value: stats.transportSpeed },
    { label: t("swimSpeed"), value: stats.swimSpeed },
    { label: t("swimDashSpeed"), value: stats.swimDashSpeed },
  ];

  const utilityStats: StatItem[] = [
    { label: t("price"), value: stats.price },
    { label: t("foodAmount"), value: stats.foodAmount },
    { label: t("maxFullStomach"), value: stats.maxFullStomach },
    {
      label: t("fullStomachDecreaseRate"),
      value: stats.fullStomachDecreaseRate,
    },
    { label: t("maleProbability"), value: `${stats.maleProbability}%` },
    { label: t("captureRate"), value: stats.captureRateCorrect },
    { label: t("expRatio"), value: stats.expRatio },
    { label: t("combiRank"), value: pal.combiRank },
    { label: t("rarity"), value: pal.rarity },
    { label: t("size"), value: pal.size || "—" },
    { label: t("nocturnal"), value: pal.nocturnal ? t("yes") : t("no") },
  ];

  const friendshipStats: StatItem[] = [
    { label: t("friendshipHp"), value: stats.friendshipHp },
    { label: t("friendshipAttack"), value: stats.friendshipShotAttack },
    { label: t("friendshipDefense"), value: stats.friendshipDefense },
    { label: t("friendshipWorkSpeed"), value: stats.friendshipCraftSpeed },
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
      <div className="space-y-8">
        <section>
          <SectionTitle>{t("combatStats")}</SectionTitle>
          <StatTileGrid items={combatStats} />
        </section>

        <section>
          <SectionTitle>{t("movementStats")}</SectionTitle>
          <StatTileGrid items={movementStats} />
        </section>

        <section>
          <SectionTitle>{t("utilityStats")}</SectionTitle>
          <StatTileGrid items={utilityStats} />
        </section>

        <section>
          <SectionTitle>{t("friendshipStats")}</SectionTitle>
          <StatTileGrid items={friendshipStats} />
        </section>

        <DropsSection
          title={t("drops")}
          emptyLabel={t("noDrops")}
          defaultLabel={t("dropsDefault")}
          levelLabel={(level) => t("dropsAtLevel", { level })}
          groups={dropGroups}
        />
      </div>

      <div className="space-y-8">
        <section>
          <SectionTitle>{t("partnerSkill")}</SectionTitle>
          <div className={cn(surfaceClass(), "px-4 py-4")}>
            <p className="font-semibold tracking-tight">
              {pal.partnerSkill.name || pal.partnerSkill.id || "—"}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {partnerDescription ||
                (pal.partnerSkill.id ? t("partnerSkillTextMissing") : "—")}
            </p>
          </div>
        </section>

        <section>
          <SectionTitle>{t("workSuitability")}</SectionTitle>
          {pal.workSuitability.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {pal.workSuitability.map((work) => {
                const meta = getWorkMeta(work.id);
                return (
                  <div
                    key={`${work.id}-${work.level}`}
                    className={cn(
                      surfaceHoverClass(),
                      "flex items-center justify-between gap-3 px-3 py-2.5"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-11 items-center justify-center rounded-xl bg-muted/80 ring-1 ring-foreground/[0.04]">
                        <MetaIcon
                          kind="work"
                          id={work.id}
                          label={work.name}
                          icon={meta?.icon}
                          className="size-7"
                        />
                      </span>
                      <span className="text-sm font-semibold">{work.name}</span>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {t("learnLevel", { level: work.level })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </section>

        {activeSkills.length > 0 ? (
          <section>
            <SectionTitle>{t("activeSkills")}</SectionTitle>
            <div className="space-y-2">
              {activeSkills.map((skill) => {
                const elementMeta = skill.element
                  ? getElementMeta(skill.element)
                  : undefined;
                return (
                  <article
                    key={`${skill.id}-${skill.level}`}
                    className={cn(surfaceClass(), "px-3.5 py-3")}
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      {skill.element ? (
                        <MetaIcon
                          kind="element"
                          id={
                            elementMeta?.id ?? skill.element.toLowerCase()
                          }
                          label={skill.element}
                          icon={elementMeta?.icon}
                          className="size-6"
                        />
                      ) : null}
                      <h3 className="text-sm font-semibold">
                        {skill.name || skill.id}
                      </h3>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        {t("learnLevel", { level: skill.level })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {[
                          skill.element,
                          skill.category,
                          `${t("power")} ${skill.power ?? "—"}`,
                          `${t("coolTime")} ${skill.coolTime ?? "—"}`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </div>
                    {skill.description ? (
                      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                        {skill.description}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
