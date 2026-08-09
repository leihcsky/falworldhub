import typesData from "../../data/types.json";
import workData from "../../data/work-suitability.json";
import type { ElementType, WorkSuitabilityType } from "@/types";

const elements = typesData as ElementType[];
const workTypes = workData as WorkSuitabilityType[];

export const elementsByName = new Map(
  elements.map((item) => [item.name, item] as const)
);

export const workById = new Map(
  workTypes.map((item) => [item.id, item] as const)
);

export function getElementMeta(name: string): ElementType | undefined {
  return elementsByName.get(name);
}

export function getWorkMeta(id: string): WorkSuitabilityType | undefined {
  return workById.get(id);
}
