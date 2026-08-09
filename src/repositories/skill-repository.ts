import skillsData from "../../data/skills.json";
import type { Skill } from "@/types";

export interface SkillRepository {
  getAll(): Promise<Skill[]>;
  getById(id: string): Promise<Skill | null>;
  getByType(type: string): Promise<Skill[]>;
}

class JsonSkillRepository implements SkillRepository {
  private skills: Skill[];

  constructor() {
    this.skills = skillsData as Skill[];
  }

  async getAll(): Promise<Skill[]> {
    return this.skills;
  }

  async getById(id: string): Promise<Skill | null> {
    return this.skills.find((skill) => skill.id === id) ?? null;
  }

  async getByType(type: string): Promise<Skill[]> {
    return this.skills.filter(
      (skill) => skill.type.toLowerCase() === type.toLowerCase()
    );
  }
}

export function createSkillRepository(): SkillRepository {
  return new JsonSkillRepository();
}

export const skillRepository = createSkillRepository();
