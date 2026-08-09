import skillsData from "../../data/skills.json";
import type { Skill } from "@/types";

const skillsById = new Map(
  (skillsData as Skill[]).map((skill) => [skill.id, skill] as const)
);

export function getSkillMeta(id: string): Skill | undefined {
  return (
    skillsById.get(id) ||
    [...skillsById.entries()].find(
      ([key]) => key.toLowerCase() === id.toLowerCase()
    )?.[1]
  );
}
