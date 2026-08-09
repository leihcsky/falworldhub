import palsData from "../../data/pals.json";
import typesData from "../../data/types.json";
import workSuitabilityData from "../../data/work-suitability.json";
import type {
  ElementType,
  Pal,
  PalElement,
  PalSummary,
  WorkSuitabilityType,
} from "@/types";

/**
 * Pal data access layer.
 *
 * MVP: reads from local JSON files.
 * Future: swap implementations to MySQL without changing page/components.
 */
export interface PalRepository {
  getAll(): Promise<Pal[]>;
  getBySlug(slug: string): Promise<Pal | null>;
  getById(id: string): Promise<Pal | null>;
  search(query: string): Promise<Pal[]>;
  filterByElement(element: PalElement): Promise<Pal[]>;
  getRelatedByElement(slug: string, limit?: number): Promise<Pal[]>;
  getSummaries(): Promise<PalSummary[]>;
  getElements(): Promise<ElementType[]>;
  getWorkSuitabilities(): Promise<WorkSuitabilityType[]>;
}

function toSummary(pal: Pal): PalSummary {
  return {
    id: pal.id,
    name: pal.name,
    slug: pal.slug,
    image: pal.image,
    type: pal.type,
    tribe: pal.tribe,
    combiRank: pal.combiRank,
    combiDuplicatePriority: pal.combiDuplicatePriority,
    breedable: pal.breedable,
  };
}

class JsonPalRepository implements PalRepository {
  private pals: Pal[];
  private elements: ElementType[];
  private workSuitabilities: WorkSuitabilityType[];

  constructor() {
    this.pals = palsData as Pal[];
    this.elements = typesData as ElementType[];
    this.workSuitabilities = workSuitabilityData as WorkSuitabilityType[];
  }

  async getAll(): Promise<Pal[]> {
    // Paldex UI/SEO pages only — hide quest/oilrig/summon wrappers and
    // breeding-only helper rows.
    return this.pals.filter((pal) => pal.listed !== false);
  }

  async getBySlug(slug: string): Promise<Pal | null> {
    return this.pals.find((pal) => pal.slug === slug) ?? null;
  }

  async getById(id: string): Promise<Pal | null> {
    return (
      this.pals.find((pal) => pal.id === id) ??
      this.pals.find((pal) => pal.id.toLowerCase() === id.toLowerCase()) ??
      null
    );
  }

  async search(query: string): Promise<Pal[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return this.pals;

    return this.pals.filter(
      (pal) =>
        pal.name.toLowerCase().includes(normalized) ||
        pal.slug.toLowerCase().includes(normalized) ||
        pal.id.toLowerCase().includes(normalized) ||
        pal.type.some((type) => type.toLowerCase().includes(normalized))
    );
  }

  async filterByElement(element: PalElement): Promise<Pal[]> {
    return this.pals.filter((pal) => pal.type.includes(element));
  }

  async getRelatedByElement(slug: string, limit = 6): Promise<Pal[]> {
    const current = await this.getBySlug(slug);
    if (!current) return [];

    return this.pals
      .filter(
        (pal) =>
          pal.slug !== slug &&
          pal.type.some((type) => current.type.includes(type))
      )
      .slice(0, limit);
  }

  async getSummaries(): Promise<PalSummary[]> {
    return this.pals.map(toSummary);
  }

  async getElements(): Promise<ElementType[]> {
    return this.elements;
  }

  async getWorkSuitabilities(): Promise<WorkSuitabilityType[]> {
    return this.workSuitabilities;
  }
}

export function createPalRepository(): PalRepository {
  return new JsonPalRepository();
}

export const palRepository = createPalRepository();
