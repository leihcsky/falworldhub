import type { PalSummary } from "@/types";
import { formatDexNumber } from "@/lib/pal-format";

/** Strict substring match on name, slug, id, or dex number (no fuzzy). */
export function matchesPalQuery(
  pal: Pick<PalSummary, "name" | "slug" | "id" | "dexNumber" | "dexSuffix">,
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const dex = formatDexNumber(pal.dexNumber, pal.dexSuffix).toLowerCase();
  const dexBare = `${pal.dexNumber}${pal.dexSuffix || ""}`.toLowerCase();
  return (
    pal.name.toLowerCase().includes(q) ||
    pal.slug.toLowerCase().includes(q) ||
    pal.id.toLowerCase().includes(q) ||
    dex.includes(q) ||
    dexBare.includes(q) ||
    String(pal.dexNumber).includes(q)
  );
}
