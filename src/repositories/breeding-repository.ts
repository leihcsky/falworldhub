import breedingData from "../../data/breeding.json";
import type {
  BreedingCombination,
  BreedingDataFile,
  BreedingResult,
  ParentBreedingResult,
  ReverseBreedingResult,
} from "@/types";
import {
  asBreedingData,
  findChildClient,
  findChildrenAsParentClient,
  findParentsClient,
} from "@/lib/breeding";
import { palRepository } from "./pal-repository";

/**
 * Breeding data access + lookup algorithms.
 *
 * MVP: unique overrides from JSON + CombiRank formula.
 * Future: MySQL-backed unique recipes; formula stays in app code.
 */
export interface BreedingRepository {
  getAll(): Promise<BreedingCombination[]>;
  getData(): Promise<BreedingDataFile>;
  findChild(parent1: string, parent2: string): Promise<BreedingResult>;
  findParents(
    childId: string,
    options?: { formulaLimit?: number }
  ): Promise<ReverseBreedingResult | null>;
  findChildrenAsParent(parentId: string): Promise<ParentBreedingResult | null>;
  getCombinationsForPal(palId: string): Promise<BreedingCombination[]>;
}

class JsonBreedingRepository implements BreedingRepository {
  private data: BreedingDataFile;

  constructor() {
    this.data = asBreedingData(
      breedingData as BreedingDataFile | BreedingCombination[]
    );
  }

  async getData(): Promise<BreedingDataFile> {
    return this.data;
  }

  async getAll(): Promise<BreedingCombination[]> {
    return this.data.unique;
  }

  async findChild(parent1: string, parent2: string): Promise<BreedingResult> {
    const pals = await palRepository.getSummaries();
    return findChildClient(this.data, pals, parent1, parent2);
  }

  async findParents(
    childId: string,
    options?: { formulaLimit?: number }
  ): Promise<ReverseBreedingResult | null> {
    const pals = await palRepository.getSummaries();
    return findParentsClient(this.data, pals, childId, {
      formulaLimit: options?.formulaLimit ?? 24,
    });
  }

  async findChildrenAsParent(
    parentId: string
  ): Promise<ParentBreedingResult | null> {
    const pals = await palRepository.getSummaries();
    return findChildrenAsParentClient(this.data, pals, parentId);
  }

  async getCombinationsForPal(palId: string): Promise<BreedingCombination[]> {
    return this.data.unique.filter(
      (combo) =>
        combo.child === palId ||
        combo.parent1 === palId ||
        combo.parent2 === palId
    );
  }
}

export function createBreedingRepository(): BreedingRepository {
  return new JsonBreedingRepository();
}

export const breedingRepository = createBreedingRepository();
