export type {
  Pal,
  PalActiveSkillRef,
  PalDrop,
  PalElement,
  PalStats,
  PartnerSkill,
  WorkSuitability,
  WorkSuitabilityName,
} from "./pal";
export type {
  BreedingCombination,
  BreedingDataFile,
  BreedingResult,
  GenderedBreedingOption,
  ParentBreedingResult,
  ReverseBreedingResult,
  PalSummary,
} from "./breeding";
export type { Skill } from "./skill";

export interface ElementType {
  id: string;
  /** In-game enum token, e.g. Earth */
  gameId: string;
  name: string;
  color: string;
  /** Public path to game UI icon when imported, e.g. /images/elements/fire.png */
  icon?: string | null;
}

export interface WorkSuitabilityType {
  id: string;
  name: string;
  /** Public path to game UI icon when imported, e.g. /images/work/EmitFlame.png */
  icon?: string | null;
}
