import type { Pal } from "@/types";

const META_DESCRIPTION_MAX = 158;

/** Soft-trim for SERP snippets without cutting mid-word when possible. */
export function trimMetaDescription(
  text: string,
  max = META_DESCRIPTION_MAX
): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  const sliced = normalized.slice(0, max - 1);
  const boundary = sliced.lastIndexOf(" ");
  const base = boundary > 80 ? sliced.slice(0, boundary) : sliced;
  return `${base.replace(/[.,;:–-]+$/, "")}…`;
}

/**
 * Programmatic meta description for Pal detail pages.
 * Prefer structured stats over in-game flavor text (better CTR + consistent length).
 */
export function buildPalMetaDescription(
  pal: Pal,
  template: (values: {
    name: string;
    elements: string;
    hp: number;
    attack: number;
    defense: number;
    works: string;
    partner: string;
  }) => string
): string {
  const elements = pal.type.length > 0 ? pal.type.join("/") : "Unknown";
  const works = pal.workSuitability
    .filter((work) => work.level > 0)
    .slice(0, 3)
    .map((work) => `${work.name} ${work.level}`)
    .join(", ");

  return trimMetaDescription(
    template({
      name: pal.name,
      elements,
      hp: pal.stats.hp,
      attack: pal.stats.attack,
      defense: pal.stats.defense,
      works: works || "—",
      partner: pal.partnerSkill?.name?.trim() || "—",
    })
  );
}

export function buildPalMetaKeywords(pal: Pal): string[] {
  const name = pal.name.toLowerCase();
  const keywords = [
    `${name} palworld`,
    `palworld ${name}`,
    `${name} stats`,
    `${name} breeding`,
    `how to breed ${name}`,
  ];

  for (const element of pal.type) {
    keywords.push(`palworld ${element.toLowerCase()} pal`);
  }

  return keywords;
}
