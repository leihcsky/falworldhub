export type PalElement =
  | "Neutral"
  | "Fire"
  | "Water"
  | "Electric"
  | "Grass"
  | "Ice"
  | "Ground"
  | "Dark"
  | "Dragon";

export type WorkSuitabilityName =
  | "Kindling"
  | "Watering"
  | "Planting"
  | "Generating Electricity"
  | "Handiwork"
  | "Gathering"
  | "Lumbering"
  | "Mining"
  | "Oil Extraction"
  | "Medicine Production"
  | "Cooling"
  | "Transporting"
  | "Farming";

export interface WorkSuitability {
  /** Game enum id, e.g. Handcraft */
  id: string;
  name: WorkSuitabilityName;
  level: number;
}

/**
 * Player-facing Pal stats aligned with common wiki/database pages.
 */
export interface PalStats {
  // Combat
  hp: number;
  /** Primary attack shown in UI (ShotAttack) */
  attack: number;
  meleeAttack: number;
  shotAttack: number;
  defense: number;
  support: number;
  craftSpeed: number;

  // Movement / mount
  slowWalkSpeed: number;
  walkSpeed: number;
  runSpeed: number;
  rideSprintSpeed: number;
  transportSpeed: number;
  swimSpeed: number;
  swimDashSpeed: number;

  // Utility
  stamina: number;
  price: number;
  foodAmount: number;
  maxFullStomach: number;
  fullStomachDecreaseRate: number;
  maleProbability: number;
  captureRateCorrect: number;
  expRatio: number;

  // Friendship / trust growth bonuses
  friendshipHp: number;
  friendshipShotAttack: number;
  friendshipDefense: number;
  friendshipCraftSpeed: number;
}

export interface PartnerSkill {
  id: string;
  name: string;
  description: string;
}

export interface PalActiveSkillRef {
  id: string;
  level: number;
  name?: string;
  description?: string;
  element?: string;
  power?: number;
  coolTime?: number;
  category?: string;
}

export interface PalDrop {
  /** Game item id, e.g. Wool */
  id: string;
  name: string;
  min: number;
  max: number;
  /** Drop chance percent, e.g. 100 or 5 */
  rate: number;
  /** Enemy level threshold for this drop row; 0 = default */
  level: number;
}

/**
 * Canonical Pal entity shape.
 * Keep this aligned when migrating JSON → MySQL.
 */
export interface Pal {
  /** Stable game character id (BPClass / row key), e.g. SheepBall */
  id: string;
  /** SEO slug from English display name, e.g. lamball */
  slug: string;
  name: string;
  dexNumber: number;
  dexSuffix?: string;
  image: string;
  rarity: number;
  type: PalElement[];
  stats: PalStats;
  workSuitability: WorkSuitability[];
  partnerSkill: PartnerSkill;
  activeSkills: PalActiveSkillRef[];
  /** Enemy drop table entries (name, quantity, chance) */
  drops: PalDrop[];
  passives: string[];
  description: string;
  shortDescription?: string;
  /** Game tribe id without prefix, used by unique breeding */
  tribe: string;
  combiRank: number;
  combiDuplicatePriority: number;
  /** false when IgnoreCombi or non-standard breeding target */
  breedable: boolean;
  size?: string;
  nocturnal?: boolean;
  genusCategory?: string;
  /**
   * true = Paldex list/detail SEO pages.
   * false = breeding-only / non-dex helper rows (hidden from /pals).
   */
  listed?: boolean;
}
