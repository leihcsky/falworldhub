import type {
  BreedingCombination,
  BreedingDataFile,
  BreedingResult,
  PalSummary,
  ParentBreedingResult,
  ReverseBreedingResult,
} from "@/types";

function normalizePair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

function toMap(pals: PalSummary[]): Map<string, PalSummary> {
  return new Map(pals.map((pal) => [pal.id, pal]));
}

function asSummary(map: Map<string, PalSummary>, id: string): PalSummary {
  return (
    map.get(id) ?? {
      id,
      name: id,
      slug: id,
      image: "/images/pals/placeholder.svg",
      type: [],
      tribe: id,
      combiRank: 0,
      combiDuplicatePriority: 0,
      breedable: false,
    }
  );
}

function findUniqueChild(
  unique: BreedingCombination[],
  parent1: PalSummary,
  parent2: PalSummary
): string | null {
  const tribes = new Set([parent1.tribe, parent2.tribe]);

  for (const combo of unique) {
    const comboTribes = new Set([
      combo.parent1Tribe ?? "",
      combo.parent2Tribe ?? "",
    ]);
    const byTribe =
      combo.parent1Tribe &&
      combo.parent2Tribe &&
      tribes.size === comboTribes.size &&
      [...tribes].every((tribe) => comboTribes.has(tribe));

    const byId =
      normalizePair(combo.parent1, combo.parent2).join("|") ===
      normalizePair(parent1.id, parent2.id).join("|");

    if (byTribe || byId) return combo.child;
  }

  return null;
}

/**
 * Standard Palworld breeding power formula.
 * Target rank = floor((A + B + 1) / 2), then nearest breedable CombiRank.
 */
/**
 * Pick breedable Pal closest to `target` CombiRank.
 * When `sortedByRank` is true, candidates must be ascending by combiRank (faster).
 */
function pickNearestByRank(
  candidates: PalSummary[],
  target: number,
  sortedByRank = false
): PalSummary | null {
  if (candidates.length === 0) return null;

  if (!sortedByRank) {
    let best = candidates[0];
    let bestDiff = Math.abs(best.combiRank - target);

    for (let i = 1; i < candidates.length; i += 1) {
      const candidate = candidates[i];
      const diff = Math.abs(candidate.combiRank - target);
      if (diff < bestDiff) {
        best = candidate;
        bestDiff = diff;
        continue;
      }
      if (
        diff === bestDiff &&
        candidate.combiDuplicatePriority > best.combiDuplicatePriority
      ) {
        best = candidate;
      }
    }

    return best;
  }

  let lo = 0;
  let hi = candidates.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (candidates[mid].combiRank < target) lo = mid + 1;
    else hi = mid;
  }

  const start = Math.max(0, lo - 2);
  const end = Math.min(candidates.length, lo + 3);
  let best = candidates[start];
  let bestDiff = Math.abs(best.combiRank - target);

  for (let i = start + 1; i < end; i += 1) {
    const candidate = candidates[i];
    const diff = Math.abs(candidate.combiRank - target);
    if (diff < bestDiff) {
      best = candidate;
      bestDiff = diff;
      continue;
    }
    if (
      diff === bestDiff &&
      candidate.combiDuplicatePriority > best.combiDuplicatePriority
    ) {
      best = candidate;
    }
  }

  // Same rank distance may exist further away if ranks are sparse — expand ties.
  for (let i = start - 1; i >= 0; i -= 1) {
    const diff = Math.abs(candidates[i].combiRank - target);
    if (diff > bestDiff) break;
    if (
      diff < bestDiff ||
      candidates[i].combiDuplicatePriority > best.combiDuplicatePriority
    ) {
      best = candidates[i];
      bestDiff = diff;
    }
  }
  for (let i = end; i < candidates.length; i += 1) {
    const diff = Math.abs(candidates[i].combiRank - target);
    if (diff > bestDiff) break;
    if (
      diff < bestDiff ||
      candidates[i].combiDuplicatePriority > best.combiDuplicatePriority
    ) {
      best = candidates[i];
      bestDiff = diff;
    }
  }

  return best;
}

export function findFormulaChildId(
  pals: PalSummary[],
  parent1: PalSummary,
  parent2: PalSummary
): string | null {
  if (!parent1.breedable || !parent2.breedable) return null;

  const target = Math.floor((parent1.combiRank + parent2.combiRank + 1) / 2);
  const best = pickNearestByRank(
    pals.filter((pal) => pal.breedable),
    target
  );
  return best?.id ?? null;
}

export function findChildClient(
  breeding: BreedingDataFile | BreedingCombination[],
  pals: PalSummary[],
  parent1Id: string,
  parent2Id: string
): BreedingResult {
  const unique = Array.isArray(breeding) ? breeding : breeding.unique;
  const map = toMap(pals);
  const parent1 = asSummary(map, parent1Id);
  const parent2 = asSummary(map, parent2Id);
  const parents: [PalSummary, PalSummary] = [parent1, parent2];

  const uniqueChildId = findUniqueChild(unique, parent1, parent2);
  if (uniqueChildId) {
    return {
      parents,
      child: asSummary(map, uniqueChildId),
      source: "unique",
    };
  }

  const formulaChildId = findFormulaChildId(pals, parent1, parent2);
  return {
    parents,
    child: formulaChildId ? asSummary(map, formulaChildId) : null,
    source: formulaChildId ? "formula" : undefined,
  };
}

export function findParentsClient(
  breeding: BreedingDataFile | BreedingCombination[],
  pals: PalSummary[],
  childId: string,
  options?: { formulaLimit?: number }
): ReverseBreedingResult | null {
  const unique = Array.isArray(breeding) ? breeding : breeding.unique;
  const formulaLimit = options?.formulaLimit ?? 40;
  const map = toMap(pals);
  const child = map.get(childId);
  if (!child) return null;

  const combinations: ReverseBreedingResult["combinations"] = [];
  const seen = new Set<string>();

  for (const combo of unique) {
    if (combo.child !== childId) continue;
    const key = normalizePair(combo.parent1, combo.parent2).join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    combinations.push({
      parent1: asSummary(map, combo.parent1),
      parent2: asSummary(map, combo.parent2),
      source: "unique",
    });
  }

  if (child.breedable) {
    const breedable = pals
      .filter((pal) => pal.breedable)
      .sort((a, b) => a.combiRank - b.combiRank);

    for (let i = 0; i < breedable.length; i += 1) {
      for (let j = i; j < breedable.length; j += 1) {
        if (combinations.length >= formulaLimit) break;
        const a = breedable[i];
        const b = breedable[j];
        const target = Math.floor((a.combiRank + b.combiRank + 1) / 2);
        const result = pickNearestByRank(breedable, target, true);
        if (!result || result.id !== childId) continue;
        const key = normalizePair(a.id, b.id).join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        combinations.push({
          parent1: asSummary(map, a.id),
          parent2: asSummary(map, b.id),
          source: "formula",
        });
      }
      if (combinations.length >= formulaLimit) break;
    }
  }

  return { child, combinations };
}

/**
 * List every partner outcome when `parentId` is used as one parent.
 * Includes unique recipes and formula pairings with each breedable partner.
 */
export function findChildrenAsParentClient(
  breeding: BreedingDataFile | BreedingCombination[],
  pals: PalSummary[],
  parentId: string
): ParentBreedingResult | null {
  const map = toMap(pals);
  const parent = map.get(parentId);
  if (!parent) return null;

  const combinations: ParentBreedingResult["combinations"] = [];
  const seen = new Set<string>();

  if (!parent.breedable) {
    return { parent, combinations };
  }

  const breedable = pals
    .filter((pal) => pal.breedable)
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const partner of breedable) {
    const result = findChildClient(breeding, pals, parentId, partner.id);
    if (!result.child) continue;
    if (seen.has(partner.id)) continue;
    seen.add(partner.id);
    combinations.push({
      partner: asSummary(map, partner.id),
      child: result.child,
      source: result.source,
    });
  }

  return { parent, combinations };
}

export function asBreedingData(
  data: BreedingDataFile | BreedingCombination[]
): BreedingDataFile {
  if (Array.isArray(data)) {
    return {
      version: 0,
      formula: "legacy-unique-only",
      unique: data,
    };
  }
  return data;
}
