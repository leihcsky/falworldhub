/**
 * Regression checks for breeding accuracy.
 * Run: npm run test:breeding
 *
 * These fixtures catch the class of bugs where formula search incorrectly
 * includes unique-only / variant children (e.g. Anubis+Azurmane → Pierdon Cryst).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pals = JSON.parse(readFileSync(join(root, "data/pals.json"), "utf8"));
const breeding = JSON.parse(
  readFileSync(join(root, "data/breeding.json"), "utf8")
);

const byId = new Map(pals.map((pal) => [pal.id, pal]));
const byName = new Map(pals.map((pal) => [pal.name.toLowerCase(), pal]));
const uniqueChildren = new Set(breeding.unique.map((combo) => combo.child));

function requirePal(nameOrId) {
  const pal = byId.get(nameOrId) ?? byName.get(String(nameOrId).toLowerCase());
  if (!pal) throw new Error(`Missing Pal: ${nameOrId}`);
  return pal;
}

function normalizePair(a, b) {
  return a < b ? [a, b] : [b, a];
}

function findUniqueChildIds(parent1, parent2) {
  const tribes = new Set([parent1.tribe, parent2.tribe]);
  const pairKey = normalizePair(parent1.id, parent2.id).join("|");
  const children = [];
  const seen = new Set();

  for (const combo of breeding.unique) {
    const comboTribes = new Set([
      combo.parent1Tribe ?? "",
      combo.parent2Tribe ?? "",
    ]);
    const byTribe =
      Boolean(combo.parent1Tribe && combo.parent2Tribe) &&
      tribes.size === comboTribes.size &&
      [...tribes].every((tribe) => comboTribes.has(tribe));
    const byPair =
      normalizePair(combo.parent1, combo.parent2).join("|") === pairKey;
    if (!(byTribe || byPair) || seen.has(combo.child)) continue;
    seen.add(combo.child);
    children.push(combo.child);
  }
  return children;
}

function pickNearest(candidates, target) {
  let best = null;
  let bestDiff = Infinity;
  for (const pal of candidates) {
    const diff = Math.abs(pal.combiRank - target);
    if (
      diff < bestDiff ||
      (diff === bestDiff &&
        pal.combiDuplicatePriority > (best?.combiDuplicatePriority ?? -1))
    ) {
      best = pal;
      bestDiff = diff;
    }
  }
  return best;
}

function findChild(parent1Id, parent2Id, femaleParentId) {
  const parent1 = requirePal(parent1Id);
  const parent2 = requirePal(parent2Id);

  if (parent1.id === parent2.id) {
    return parent1.breedable ? parent1.id : null;
  }

  const uniqueIds = findUniqueChildIds(parent1, parent2);
  if (uniqueIds.length === 1) return uniqueIds[0];
  if (uniqueIds.length > 1) {
    // Katress × Wixen only
    const key = normalizePair(parent1.id, parent2.id).join("|");
    if (key === "CatMage|FoxMage") {
      if (femaleParentId === "CatMage") return "CatMage_Fire";
      if (femaleParentId === "FoxMage") return "FoxMage_Dark";
      return null;
    }
    return uniqueIds[0];
  }

  if (!parent1.breedable || !parent2.breedable) return null;
  const target = Math.floor((parent1.combiRank + parent2.combiRank + 1) / 2);
  const candidates = pals.filter(
    (pal) => pal.breedable && !uniqueChildren.has(pal.id)
  );
  const best = pickNearest(candidates, target);
  if (best && uniqueChildren.has(best.id)) return null;
  return best?.id ?? null;
}

const fixtures = [
  {
    name: "Anubis + Azurmane → Anubis (not Pierdon Cryst)",
    parents: ["Anubis", "Azurmane"],
    expect: "Anubis",
  },
  {
    name: "Univolt Cryst + Azurmane → Anubis",
    parents: ["Univolt Cryst", "Azurmane"],
    expect: "Anubis",
  },
  {
    name: "Elgrove Cryst + Pierdon Cryst → Anubis",
    parents: ["Elgrove Cryst", "Pierdon Cryst"],
    expect: "Anubis",
  },
  {
    name: "Pierdon + Wumpo → Pierdon Cryst (unique)",
    parents: ["Pierdon", "Wumpo"],
    expect: "Pierdon Cryst",
  },
  {
    name: "Pierdon Cryst + Pierdon Cryst → Pierdon Cryst",
    parents: ["Pierdon Cryst", "Pierdon Cryst"],
    expect: "Pierdon Cryst",
  },
  {
    name: "Female Katress + Male Wixen → Katress Ignis",
    parents: ["Katress", "Wixen"],
    female: "Katress",
    expect: "Katress Ignis",
  },
  {
    name: "Female Wixen + Male Katress → Wixen Noct",
    parents: ["Katress", "Wixen"],
    female: "Wixen",
    expect: "Wixen Noct",
  },
  {
    name: "Anubis + Anubis → Anubis",
    parents: ["Anubis", "Anubis"],
    expect: "Anubis",
  },
];

let failed = 0;

for (const fixture of fixtures) {
  const [a, b] = fixture.parents.map((name) => requirePal(name));
  const female = fixture.female ? requirePal(fixture.female).id : undefined;
  const childId = findChild(a.id, b.id, female);
  const child = childId ? byId.get(childId) : null;
  const expected = requirePal(fixture.expect);
  const ok = child?.id === expected.id;
  if (!ok) {
    failed += 1;
    console.error(
      `FAIL  ${fixture.name}\n      got: ${child?.name ?? "null"} (${childId})\n      expected: ${expected.name}`
    );
  } else {
    console.log(`ok    ${fixture.name}`);
  }
}

// Invariant: sampling formula pairs must never land on unique-only children.
const breedable = pals.filter((pal) => pal.breedable);
const sampleParents = breedable.filter((pal) => !uniqueChildren.has(pal.id)).slice(0, 40);
let invariantFails = 0;
for (let i = 0; i < sampleParents.length; i += 1) {
  for (let j = i; j < sampleParents.length; j += 1) {
    const childId = findChild(sampleParents[i].id, sampleParents[j].id);
    if (childId && uniqueChildren.has(childId) && sampleParents[i].id !== sampleParents[j].id) {
      // Same-species of a unique child is allowed; cross-species formula is not.
      const uniqueHit = findUniqueChildIds(sampleParents[i], sampleParents[j]);
      if (uniqueHit.length === 0) {
        invariantFails += 1;
        if (invariantFails <= 5) {
          console.error(
            `FAIL  formula leaked unique child: ${sampleParents[i].name} + ${sampleParents[j].name} → ${byId.get(childId)?.name}`
          );
        }
      }
    }
  }
}
if (invariantFails === 0) {
  console.log("ok    formula never returns unique-only children (sample)");
} else {
  failed += invariantFails;
}

if (failed > 0) {
  console.error(`\n${failed} breeding check(s) failed.`);
  process.exit(1);
}

console.log(`\nAll breeding checks passed (${fixtures.length} fixtures).`);
