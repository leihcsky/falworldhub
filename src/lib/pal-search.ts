import type { PalSummary } from "@/types";

/** Strict substring match on display name, slug, or internal id (no fuzzy). */
export function matchesPalQuery(
  pal: Pick<PalSummary, "name" | "slug" | "id">,
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    pal.name.toLowerCase().includes(q) ||
    pal.slug.toLowerCase().includes(q) ||
    pal.id.toLowerCase().includes(q)
  );
}
