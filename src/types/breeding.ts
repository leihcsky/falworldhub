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

export interface BreedingResult {
  child: PalSummary | null;
  parents: [PalSummary, PalSummary];
  source?: "unique" | "formula";
}

export interface ReverseBreedingResult {
  child: PalSummary;
  combinations: Array<{
    parent1: PalSummary;
    parent2: PalSummary;
    source?: "unique" | "formula";
  }>;
}

/** Outcomes when a fixed Pal is used as one parent. */
export interface ParentBreedingResult {
  parent: PalSummary;
  combinations: Array<{
    partner: PalSummary;
    child: PalSummary;
    source?: "unique" | "formula";
  }>;
}

export interface PalSummary {
  id: string;
  name: string;
  slug: string;
  image: string;
  type: string[];
  tribe: string;
  combiRank: number;
  combiDuplicatePriority: number;
  breedable: boolean;
}
