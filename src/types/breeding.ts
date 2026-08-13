/**
 * Unique / variant breeding override from DT_PalCombiUnique.
 * parent1/parent2/child are character ids (resolved at import).
 */
export interface BreedingCombination {
  parent1: string;
  parent2: string;
  child: string;
  parent1Tribe?: string;
  parent2Tribe?: string;
}

/**
 * Shape of data/breeding.json after FModel import.
 */
export interface BreedingDataFile {
  version: number;
  formula: string;
  unique: BreedingCombination[];
}

export interface GenderedBreedingOption {
  /** Species id that must be female for this outcome. */
  femaleParentId: string;
  /** Species id that must be male for this outcome. */
  maleParentId: string;
  child: PalSummary;
}

export interface BreedingResult {
  child: PalSummary | null;
  parents: [PalSummary, PalSummary];
  source?: "unique" | "formula";
  /**
   * Only for the rare gender-dependent unique pair (Katress × Wixen).
   * When set and `child` is null, the UI should ask which parent is female.
   */
  genderOptions?: GenderedBreedingOption[];
}

export interface ReverseBreedingResult {
  child: PalSummary;
  combinations: Array<{
    parent1: PalSummary;
    parent2: PalSummary;
    source?: "unique" | "formula";
    /** e.g. "Female Katress + Male Wixen" when gender-locked. */
    genderHint?: string;
  }>;
}

/** Outcomes when a fixed Pal is used as one parent. */
export interface ParentBreedingResult {
  parent: PalSummary;
  combinations: Array<{
    partner: PalSummary;
    child: PalSummary;
    source?: "unique" | "formula";
    genderHint?: string;
  }>;
}

export interface PalSummary {
  id: string;
  name: string;
  slug: string;
  image: string;
  type: string[];
  tribe: string;
  dexNumber: number;
  dexSuffix?: string;
  combiRank: number;
  combiDuplicatePriority: number;
  breedable: boolean;
}
