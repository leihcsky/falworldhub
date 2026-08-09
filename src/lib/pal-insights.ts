import type { ElementType, Pal, WorkSuitabilityType } from "@/types";

export type ElementCount = ElementType & { count: number };
export type WorkCount = WorkSuitabilityType & { count: number };

export function getElementCounts(
  pals: Pal[],
  elements: ElementType[]
): ElementCount[] {
  const counts = new Map<string, number>();

  for (const pal of pals) {
    for (const type of pal.type) {
      counts.set(type, (counts.get(type) ?? 0) + 1);
    }
  }

  return elements.map((element) => ({
    ...element,
    count: counts.get(element.name) ?? 0,
  }));
}

export function getWorkCounts(
  pals: Pal[],
  workTypes: WorkSuitabilityType[]
): WorkCount[] {
  const counts = new Map<string, number>();

  for (const pal of pals) {
    for (const work of pal.workSuitability) {
      if (work.level > 0) {
        counts.set(work.id, (counts.get(work.id) ?? 0) + 1);
      }
    }
  }

  return workTypes.map((work) => ({
    ...work,
    count: counts.get(work.id) ?? 0,
  }));
}

export function getPaldexSummary(pals: Pal[]) {
  const nocturnal = pals.filter((pal) => pal.nocturnal).length;
  const breedable = pals.filter((pal) => pal.breedable).length;
  const maxDex = pals.reduce(
    (max, pal) => Math.max(max, pal.dexNumber || 0),
    0
  );

  return {
    total: pals.length,
    nocturnal,
    breedable,
    maxDex,
  };
}
