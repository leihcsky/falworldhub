/**
 * Data access layer entrypoint.
 *
 * Today: JSON file repositories.
 * Later: replace factory implementations with MySQL-backed repositories
 * without changing route handlers or UI components.
 */
export { palRepository, createPalRepository } from "./pal-repository";
export type { PalRepository } from "./pal-repository";

export {
  breedingRepository,
  createBreedingRepository,
} from "./breeding-repository";
export type { BreedingRepository } from "./breeding-repository";

export { skillRepository, createSkillRepository } from "./skill-repository";
export type { SkillRepository } from "./skill-repository";
