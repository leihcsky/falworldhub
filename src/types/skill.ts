export interface Skill {
  id: string;
  name: string;
  description: string;
  type: string;
  power: number;
  coolTime: number;
  /** @deprecated use coolTime */
  cooldown?: number;
  category?: string;
  disabled?: boolean;
}
