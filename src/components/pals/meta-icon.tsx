"use client";

import Image from "next/image";
import {
  Circle,
  Droplets,
  Flame,
  Hammer,
  Leaf,
  Moon,
  Mountain,
  Pickaxe,
  Snowflake,
  Sparkles,
  Tractor,
  Truck,
  Wheat,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const ELEMENT_FALLBACK: Record<string, LucideIcon> = {
  Neutral: Circle,
  Fire: Flame,
  Water: Droplets,
  Electric: Zap,
  Grass: Leaf,
  Ice: Snowflake,
  Ground: Mountain,
  Dark: Moon,
  Dragon: Sparkles,
};

const WORK_FALLBACK: Record<string, LucideIcon> = {
  EmitFlame: Flame,
  Watering: Droplets,
  Seeding: Wheat,
  GenerateElectricity: Zap,
  Handcraft: Hammer,
  Collection: Leaf,
  Deforest: Wind,
  Mining: Pickaxe,
  OilExtraction: Droplets,
  ProductMedicine: Sparkles,
  Cool: Snowflake,
  Transport: Truck,
  MonsterFarm: Tractor,
};

type MetaIconProps = {
  kind: "element" | "work";
  id: string;
  label: string;
  icon?: string | null;
  color?: string;
  className?: string;
};

export function MetaIcon({
  kind,
  id,
  label,
  icon,
  color,
  className,
}: MetaIconProps) {
  const [failed, setFailed] = useState(false);
  const Fallback =
    kind === "element"
      ? ELEMENT_FALLBACK[label] || ELEMENT_FALLBACK[id] || Circle
      : WORK_FALLBACK[id] || Hammer;

  if (icon && !failed) {
    return (
      <Image
        src={icon}
        alt=""
        width={32}
        height={32}
        className={cn("size-4 shrink-0 object-contain", className)}
        unoptimized
        aria-hidden
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Fallback
      className={cn("size-4 shrink-0", className)}
      style={color ? { color } : undefined}
      aria-hidden
    />
  );
}
