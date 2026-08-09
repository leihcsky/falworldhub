#!/usr/bin/env node
/**
 * Convert FModel Palworld exports into website MVP JSON + pal images.
 *
 * Usage:
 *   npm run data:import -- --source "E:\1111\FModel\Output\Exports"
 *   npm run data:import -- --source "E:\1111\FModel\Output\Exports" --skip-images
 *
 * Text priority:
 *   1) L10N/en/Pal/DataTable/Text/*
 *   2) Pal/DataTable/Text/* (often Japanese source — skipped for EN site unless --allow-jp-text)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

/** Element index matches game UI textures T_Icon_element_s_XX / T_Icon_element_XX */
const ELEMENT_MAP = {
  Normal: { id: "neutral", name: "Neutral", color: "#A8A77A", index: 0 },
  Fire: { id: "fire", name: "Fire", color: "#EE8130", index: 1 },
  Water: { id: "water", name: "Water", color: "#6390F0", index: 2 },
  Electricity: { id: "electric", name: "Electric", color: "#F7D02C", index: 3 },
  Leaf: { id: "grass", name: "Grass", color: "#7AC74C", index: 4 },
  Dark: { id: "dark", name: "Dark", color: "#705898", index: 5 },
  Dragon: { id: "dragon", name: "Dragon", color: "#6F35FC", index: 6 },
  Earth: { id: "ground", name: "Ground", color: "#E2BF65", index: 7 },
  Ice: { id: "ice", name: "Ice", color: "#96D9D6", index: 8 },
};

/** palwork index matches T_icon_palwork_XX.png under Texture/UI/InGame */
const WORK_MAP = {
  EmitFlame: { id: "EmitFlame", name: "Kindling", palwork: 0 },
  Watering: { id: "Watering", name: "Watering", palwork: 1 },
  Seeding: { id: "Seeding", name: "Planting", palwork: 2 },
  GenerateElectricity: {
    id: "GenerateElectricity",
    name: "Generating Electricity",
    palwork: 3,
  },
  Handcraft: { id: "Handcraft", name: "Handiwork", palwork: 4 },
  Collection: { id: "Collection", name: "Gathering", palwork: 5 },
  Deforest: { id: "Deforest", name: "Lumbering", palwork: 6 },
  Mining: { id: "Mining", name: "Mining", palwork: 7 },
  ProductMedicine: {
    id: "ProductMedicine",
    name: "Medicine Production",
    palwork: 8,
  },
  OilExtraction: { id: "OilExtraction", name: "Oil Extraction", palwork: 9 },
  Cool: { id: "Cool", name: "Cooling", palwork: 10 },
  Transport: { id: "Transport", name: "Transporting", palwork: 11 },
  MonsterFarm: { id: "MonsterFarm", name: "Farming", palwork: 12 },
};

function parseArgs(argv) {
  const args = {
    source: process.env.FMODEL_EXPORT_DIR || "",
    skipImages: false,
    allowJpText: false,
    gameVersion: process.env.PALWORLD_GAME_VERSION || "1.0",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--source" || token === "-s") {
      args.source = argv[i + 1] ?? "";
      i += 1;
    } else if (token === "--game-version") {
      args.gameVersion = argv[i + 1] ?? args.gameVersion;
      i += 1;
    } else if (token === "--skip-images") {
      args.skipImages = true;
    } else if (token === "--allow-jp-text") {
      args.allowJpText = true;
    } else if (token === "--help" || token === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Import FModel exports into data/ and public/images/pals/

Options:
  --source, -s       Path to FModel Exports folder
  --game-version     Game version label id (default: 1.0)
  --skip-images      Skip copying pal / UI icon PNGs
  --allow-jp-text    Allow Japanese source strings when EN L10N is missing

UI element/work icons (optional):
  Export Pal/Content/Pal/Texture/UI/InGame and UI/Main_Menu from FModel.
  Expected files include T_Icon_element_s_XX.png and T_icon_palwork_XX.png.
`);
}

function todayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

function writeMeta(gameVersion) {
  const metaPath = path.join(ROOT, "data", "meta.json");
  let previous = {};
  if (fs.existsSync(metaPath)) {
    try {
      previous = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    } catch {
      previous = {};
    }
  }

  const sameVersion = previous.gameVersion === gameVersion;
  writeJson(metaPath, {
    gameVersion,
    gameVersionLabel: sameVersion
      ? previous.gameVersionLabel || `Palworld ${gameVersion}`
      : `Palworld ${gameVersion}`,
    isLatest: true,
    dataUpdatedAt: todayUtcDate(),
  });
}

function stripEnum(value, prefix) {
  if (!value || typeof value !== "string") return "";
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

function readRows(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(json) || !json[0]?.Rows) {
    throw new Error(`Unexpected DataTable shape: ${filePath}`);
  }
  return json[0].Rows;
}

function requireRows(filePath) {
  const rows = readRows(filePath);
  if (!rows) throw new Error(`Missing required file: ${filePath}`);
  return rows;
}

function caseInsensitiveGet(map, key) {
  if (!map || key == null) return undefined;
  if (key in map) return map[key];
  const lower = String(key).toLowerCase();
  const found = Object.keys(map).find((k) => k.toLowerCase() === lower);
  return found ? map[found] : undefined;
}

function slugify(name) {
  return String(name)
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function looksJapanese(text) {
  return /[\u3040-\u30ff\u3400-\u9fff]/.test(text);
}

function cleanRichText(text) {
  return String(text)
    .replace(/<characterName id=\|([^|]+)\|\/>/gi, "$1")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<uiCommon[^>]*>/gi, "")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/\{[^}]+\}/g, "")
    .replace(/\r\n|\n|\r/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getRawText(table, key) {
  const hit = caseInsensitiveGet(table, key);
  return hit?.TextData?.LocalizedString || hit?.TextData?.SourceString || "";
}

function resolveText(tables, keys, { allowJpText = false } = {}) {
  for (const table of tables) {
    if (!table) continue;
    for (const key of keys) {
      const raw = getRawText(table, key);
      const text = cleanRichText(raw);
      if (!text || text === "-" || text === "None") continue;
      if (!allowJpText && looksJapanese(text)) continue;
      return text;
    }
  }
  return "";
}

function loadTextBundle(l10nRoot, baseTextRoot, fileNames) {
  const bundle = {};
  for (const name of fileNames) {
    const l10n = readRows(path.join(l10nRoot, name));
    const base = readRows(path.join(baseTextRoot, name));
    bundle[name] = { l10n, base, tables: [l10n, base].filter(Boolean) };
  }
  return bundle;
}

function resolveName(namesTables, characterId, row, allowJpText) {
  const candidates = [];
  if (row.OverrideNameTextID && row.OverrideNameTextID !== "None") {
    candidates.push(row.OverrideNameTextID);
  }
  candidates.push(`PAL_NAME_${characterId}`);
  return (
    resolveText(namesTables, candidates, { allowJpText }) || characterId
  );
}

function resolveIconPath(icons, characterId, textureRoot) {
  const iconRow = caseInsensitiveGet(icons, characterId);
  const assetPath = iconRow?.Icon?.AssetPathName || "";
  const match = assetPath.match(/PalIcon\/(.+)\/(T_[^.]+)\./);
  if (match) {
    const relative = path.join(
      textureRoot,
      "PalIcon",
      match[1],
      `${match[2]}.png`
    );
    if (fs.existsSync(relative)) return relative;
  }

  const fallbacks = [
    path.join(textureRoot, "PalIcon", "Normal", `T_${characterId}_icon_normal.png`),
    path.join(
      textureRoot,
      "PalIcon",
      "Normal",
      "Yakushima",
      `T_${characterId}_icon_normal.png`
    ),
  ];
  return fallbacks.find((file) => fs.existsSync(file)) ?? null;
}

function mapElements(row) {
  return [row.ElementType1, row.ElementType2]
    .map((value) => stripEnum(value, "EPalElementType::"))
    .filter((value) => value && value !== "None")
    .map((gameId) => ELEMENT_MAP[gameId]?.name ?? gameId);
}

function mapWorkSuitability(row) {
  return Object.entries(WORK_MAP)
    .map(([gameKey, meta]) => {
      const level = Number(row[`WorkSuitability_${gameKey}`] ?? 0);
      if (!level) return null;
      return { id: meta.id, name: meta.name, level };
    })
    .filter(Boolean);
}

function mapStats(row) {
  const shotAttack = Number(row.ShotAttack ?? 0);
  const meleeAttack = Number(row.MeleeAttack ?? 0);
  return {
    hp: Number(row.Hp ?? 0),
    attack: shotAttack || meleeAttack,
    meleeAttack,
    shotAttack,
    defense: Number(row.Defense ?? 0),
    support: Number(row.Support ?? 0),
    craftSpeed: Number(row.CraftSpeed ?? 100),

    slowWalkSpeed: Number(row.SlowWalkSpeed ?? 0),
    walkSpeed: Number(row.WalkSpeed ?? 0),
    runSpeed: Number(row.RunSpeed ?? 0),
    rideSprintSpeed: Number(row.RideSprintSpeed ?? 0),
    transportSpeed: Number(row.TransportSpeed ?? 0),
    swimSpeed: Number(row.SwimSpeed ?? 0),
    swimDashSpeed: Number(row.SwimDashSpeed ?? 0),

    stamina: Number(row.Stamina ?? 0),
    price: Number(row.Price ?? 0),
    foodAmount: Number(row.FoodAmount ?? 0),
    maxFullStomach: Number(row.MaxFullStomach ?? 0),
    fullStomachDecreaseRate: Number(row.FullStomachDecreaseRate ?? 0),
    maleProbability: Number(row.MaleProbability ?? 50),
    captureRateCorrect: Number(row.CaptureRateCorrect ?? 1),
    expRatio: Number(row.ExpRatio ?? 1),

    friendshipHp: Number(row.Friendship_HP ?? 0),
    friendshipShotAttack: Number(row.Friendship_ShotAttack ?? 0),
    friendshipDefense: Number(row.Friendship_Defense ?? 0),
    friendshipCraftSpeed: Number(row.Friendship_CraftSpeed ?? 0),
  };
}

function isDexPal(row) {
  return Boolean(row?.IsPal) && Number(row?.ZukanIndex) > 0;
}

/**
 * Quest / Oilrig / Summon / Tower / Boss wrappers share ZukanIndex with real pals
 * but are not Paldex entries (and usually have no icons).
 */
function isSpecialCharacterId(characterId) {
  return (
    /^(BOSS_|RAID_|GYM_|Quest_|SUMMON_|NPC_)/i.test(characterId) ||
    /_(Oilrig|Tower)(_|$)/i.test(characterId) ||
    /_MAX$/i.test(characterId)
  );
}

function dexKey(row) {
  return `${row.ZukanIndex}|${row.ZukanIndexSuffix || ""}`;
}

function scoreCanonicalPal(characterId, row) {
  let score = 0;
  if (!isSpecialCharacterId(characterId)) score += 100;
  if (characterId === row.BPClass) score += 50;
  if (!row.IgnoreCombi) score += 5;
  if (!row.IsBoss && !row.IsRaidBoss && !row.IsTowerBoss) score += 5;
  // Prefer base forms when two rows share the same dex key without suffix
  // e.g. PlantSlime over PlantSlime_Flower.
  score -= characterId.split("_").length;
  score += 1 / (characterId.length + 1);
  return score;
}

/**
 * One Paldex row per (ZukanIndex + suffix), excluding quest/oilrig/summon wrappers.
 */
function selectCanonicalDexIds(monsters) {
  const best = new Map();

  for (const [characterId, row] of Object.entries(monsters)) {
    if (!isDexPal(row) || isSpecialCharacterId(characterId)) continue;
    const key = dexKey(row);
    const score = scoreCanonicalPal(characterId, row);
    const prev = best.get(key);
    if (!prev || score > prev.score) {
      best.set(key, { characterId, score });
    }
  }

  return new Set([...best.values()].map((item) => item.characterId));
}

function buildWazaIndex(wazaRows, skillNameTables, skillDescTables, allowJpText) {
  const byId = new Map();

  for (const row of Object.values(wazaRows)) {
    const id = stripEnum(row.WazaType, "EPalWazaID::");
    if (!id || id === "None") continue;
    if (row.DisabledData) continue;

    const name =
      resolveText(skillNameTables, [`ACTION_SKILL_${id}`], { allowJpText }) ||
      id;
    const description = resolveText(
      skillDescTables,
      [`ACTION_SKILL_${id}`],
      { allowJpText }
    );

    byId.set(id, {
      id,
      name,
      description,
      type:
        ELEMENT_MAP[stripEnum(row.Element, "EPalElementType::")]?.name ||
        stripEnum(row.Element, "EPalElementType::") ||
        "Neutral",
      power: Number(row.DisplayPower ?? row.Power ?? 0),
      coolTime: Number(row.CoolTime ?? 0),
      category: stripEnum(row.Category, "EPalWazaCategory::"),
      disabled: false,
    });
  }

  return byId;
}

function buildActiveSkillsByPal(masterRows, wazaById) {
  const map = new Map();

  for (const row of Object.values(masterRows)) {
    const palId = row.PalId;
    const wazaId = stripEnum(row.WazaID, "EPalWazaID::");
    if (!palId || !wazaId || wazaId === "None") continue;

    const list = map.get(palId) ?? [];
    const skill = wazaById.get(wazaId);
    list.push({
      id: wazaId,
      level: Number(row.Level ?? 0),
      name: skill?.name || wazaId,
      description: skill?.description || "",
      element: skill?.type,
      power: skill?.power,
      coolTime: skill?.coolTime,
      category: skill?.category || "",
    });
    map.set(palId, list);
  }

  for (const [palId, list] of map) {
    list.sort((a, b) => a.level - b.level || a.id.localeCompare(b.id));
    // de-dupe same waza keep lowest level
    const seen = new Set();
    map.set(
      palId,
      list.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
    );
  }

  return map;
}

function resolveItemName(itemId, itemNameTables, allowJpText) {
  if (!itemId || itemId === "None") return "";
  return (
    resolveText(
      itemNameTables,
      [`ITEM_NAME_${itemId}`, itemId],
      { allowJpText }
    ) || itemId
  );
}

/**
 * Build CharacterID → drop entries from DT_PalDropItem*.
 * Includes level-gated rows (Level > 0) for boss / high-level tables.
 */
function buildDropsByCharacter(dropRows, itemNameTables, allowJpText) {
  const map = new Map();
  if (!dropRows) return map;

  for (const row of Object.values(dropRows)) {
    const characterId = row?.CharacterID;
    if (!characterId || characterId === "None") continue;
    const level = Number(row.Level ?? 0) || 0;
    const list = map.get(characterId) ?? [];

    for (let i = 1; i <= 10; i += 1) {
      const itemId = row[`ItemId${i}`];
      if (!itemId || itemId === "None") continue;
      const rate = Number(row[`Rate${i}`] ?? 0);
      const min = Number(row[`min${i}`] ?? 0);
      const max = Number(row[`Max${i}`] ?? 0);
      if (rate <= 0 && min <= 0 && max <= 0) continue;

      list.push({
        id: itemId,
        name: resolveItemName(itemId, itemNameTables, allowJpText),
        min,
        max,
        rate,
        level,
      });
    }

    map.set(characterId, list);
  }

  for (const [characterId, list] of map) {
    list.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      if (b.rate !== a.rate) return b.rate - a.rate;
      return a.name.localeCompare(b.name);
    });
    map.set(characterId, list);
  }

  return map;
}

function dropsForCharacter(dropsByCharacter, characterId) {
  if (!dropsByCharacter?.size) return [];
  return (
    dropsByCharacter.get(characterId) ||
    [...dropsByCharacter.entries()].find(
      ([key]) => key.toLowerCase() === String(characterId).toLowerCase()
    )?.[1] ||
    []
  );
}

function buildPalRecord({
  characterId,
  row,
  text,
  icons,
  partnerSkills,
  activeSkillsByPal,
  dropsByCharacter,
  textureRoot,
  slugCount,
  allowJpText,
  listed = true,
}) {
  const name = resolveName(text.names, characterId, row, allowJpText);
  // Prefer stable id-based slug for unlisted breeding-only variants with missing names.
  let slug = listed ? slugify(name) : slugify(name !== characterId ? name : characterId);
  if (!slug || slug === "en-text") slug = slugify(characterId);
  const seen = slugCount.get(slug) ?? 0;
  slugCount.set(slug, seen + 1);
  if (seen > 0) slug = `${slug}-${slugify(characterId)}`;

  const partner = caseInsensitiveGet(partnerSkills, characterId);
  const partnerSkillId =
    partner?.ActiveSkill?.SkillName &&
    partner.ActiveSkill.SkillName !== "None"
      ? partner.ActiveSkill.SkillName
      : "";

  const partnerName = resolveText(
    text.skillNames,
    [
      row.OverridePartnerSkillNameTextID !== "None"
        ? row.OverridePartnerSkillNameTextID
        : null,
      `PARTNERSKILL_${characterId}`,
    ].filter(Boolean),
    { allowJpText }
  );

  const partnerDescription = resolveText(
    [...text.firstActivated, ...text.skillDescs],
    [
      row.OverridePartnerSkillDescTextID !== "None"
        ? row.OverridePartnerSkillDescTextID
        : null,
      `PAL_FIRST_SPAWN_DESC_${characterId}`,
      `PARTNERSKILL_DESC_${characterId}`,
    ].filter(Boolean),
    { allowJpText }
  );

  const description = resolveText(
    text.longDescs,
    [`PAL_LONG_DESC_${characterId}`],
    { allowJpText }
  );
  const shortDescription = resolveText(
    text.shortDescs,
    [`PAL_SHORT_DESC_${characterId}`],
    { allowJpText }
  );

  const sourceIcon = resolveIconPath(icons, characterId, textureRoot);
  const image = sourceIcon
    ? `/images/pals/${slug}.png`
    : "/images/pals/placeholder.svg";

  const passives = [
    row.PassiveSkill1,
    row.PassiveSkill2,
    row.PassiveSkill3,
    row.PassiveSkill4,
  ].filter((value) => value && value !== "None");

  const activeSkills =
    activeSkillsByPal.get(characterId) ||
    activeSkillsByPal.get(
      [...activeSkillsByPal.keys()].find(
        (key) => key.toLowerCase() === characterId.toLowerCase()
      )
    ) ||
    [];

  return {
    id: characterId,
    slug,
    name,
    dexNumber: Number(row.ZukanIndex),
    dexSuffix: row.ZukanIndexSuffix || "",
    image,
    rarity: Number(row.Rarity ?? 0),
    type: mapElements(row),
    stats: mapStats(row),
    workSuitability: mapWorkSuitability(row),
    partnerSkill: {
      id: partnerSkillId,
      name: partnerName,
      description: partnerDescription,
    },
    activeSkills,
    drops: dropsForCharacter(dropsByCharacter, characterId),
    passives,
    description,
    shortDescription,
    tribe: stripEnum(row.Tribe, "EPalTribeID::"),
    combiRank: Number(row.CombiRank ?? 0),
    combiDuplicatePriority: Number(row.CombiDuplicatePriority ?? 0),
    breedable:
      Boolean(row.IsPal) && !row.IgnoreCombi && Number(row.ZukanIndex) > 0,
    size: stripEnum(row.Size, "EPalSizeType::"),
    nocturnal: Boolean(row.Nocturnal),
    genusCategory: stripEnum(row.GenusCategory, "EPalGenusCategoryType::"),
    listed,
    _sourceIcon: sourceIcon,
  };
}

function buildPals(context) {
  const { monsters, extraIds = [] } = context;
  const pals = [];
  const slugCount = new Map();
  const selected = new Set();
  const canonicalIds = selectCanonicalDexIds(monsters);

  for (const characterId of canonicalIds) {
    const row = monsters[characterId];
    if (!row) continue;
    selected.add(characterId);
    pals.push(
      buildPalRecord({
        ...context,
        characterId,
        row,
        slugCount,
        listed: true,
      })
    );
  }

  // Breeding-only variants (not shown on /pals list).
  for (const characterId of extraIds) {
    const entry = Object.entries(monsters).find(
      ([key]) => key.toLowerCase() === String(characterId).toLowerCase()
    );
    if (!entry) continue;
    const [resolvedId, row] = entry;
    if (!row?.IsPal || selected.has(resolvedId)) continue;
    if (isSpecialCharacterId(resolvedId)) continue;

    selected.add(resolvedId);
    pals.push(
      buildPalRecord({
        ...context,
        characterId: resolvedId,
        row,
        slugCount,
        listed: false,
      })
    );
  }

  pals.sort((a, b) => {
    if (a.listed !== b.listed) return a.listed ? -1 : 1;
    const aDex = a.dexNumber > 0 ? a.dexNumber : 99999;
    const bDex = b.dexNumber > 0 ? b.dexNumber : 99999;
    if (aDex !== bDex) return aDex - bDex;
    return (
      (a.dexSuffix || "").localeCompare(b.dexSuffix || "") ||
      a.id.localeCompare(b.id)
    );
  });

  return pals;
}

function tribeIndex(pals) {
  const map = new Map();
  for (const pal of pals) {
    const list = map.get(pal.tribe) ?? [];
    list.push(pal);
    map.set(pal.tribe, list);
  }
  for (const [tribe, list] of map) {
    list.sort((a, b) => {
      if (a.breedable !== b.breedable) return a.breedable ? -1 : 1;
      if (a.dexNumber !== b.dexNumber) return a.dexNumber - b.dexNumber;
      return a.id.localeCompare(b.id);
    });
    map.set(tribe, list);
  }
  return map;
}

function buildUniqueBreeding(uniqueRows, pals) {
  const byId = new Map(pals.map((pal) => [pal.id, pal]));
  const byIdCi = new Map(pals.map((pal) => [pal.id.toLowerCase(), pal]));
  const tribes = tribeIndex(pals);
  const unique = [];

  for (const row of Object.values(uniqueRows)) {
    const tribeA = stripEnum(row.ParentTribeA, "EPalTribeID::");
    const tribeB = stripEnum(row.ParentTribeB, "EPalTribeID::");
    const childId = row.ChildCharacterID;
    if (!tribeA || !tribeB || !childId) continue;

    const parent1 = tribes.get(tribeA)?.[0];
    const parent2 = tribes.get(tribeB)?.[0];
    const child =
      byId.get(childId) ||
      byIdCi.get(String(childId).toLowerCase()) ||
      null;

    if (!parent1 || !parent2) continue;

    unique.push({
      parent1: parent1.id,
      parent2: parent2.id,
      child: child?.id ?? childId,
      parent1Tribe: tribeA,
      parent2Tribe: tribeB,
    });
  }

  const seen = new Set();
  return unique.filter((combo) => {
    const ordered =
      [combo.parent1, combo.parent2].sort().join("|") + `|${combo.child}`;
    if (seen.has(ordered)) return false;
    seen.add(ordered);
    return true;
  });
}

function copyImages(pals, outDir, skipImages) {
  ensureDir(outDir);
  let copied = 0;
  let missing = 0;

  if (skipImages) {
    return { copied, missing };
  }

  for (const pal of pals) {
    if (!pal._sourceIcon) {
      missing += 1;
      continue;
    }
    const dest = path.join(outDir, `${pal.slug}.png`);
    fs.copyFileSync(pal._sourceIcon, dest);
    copied += 1;
  }

  return { copied, missing };
}

function firstExisting(paths) {
  for (const candidate of paths) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * Copy element + work suitability UI icons when FModel exported Texture/UI/*.
 * Returns maps of id → public path for JSON metadata.
 */
function loadExistingIconMap(filePath, keyField = "id") {
  try {
    if (!fs.existsSync(filePath)) return {};
    const rows = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const map = {};
    for (const row of rows) {
      if (row?.[keyField] && row.icon) map[row[keyField]] = row.icon;
    }
    return map;
  } catch {
    return {};
  }
}

function copyUiMetaIcons(textureRoot, skipImages) {
  const elementIcons = loadExistingIconMap(
    path.join(ROOT, "data", "types.json"),
    "id"
  );
  const workIcons = loadExistingIconMap(
    path.join(ROOT, "data", "work-suitability.json"),
    "id"
  );
  let copied = 0;
  let missing = 0;

  if (skipImages) {
    return { elementIcons, workIcons, copied, missing };
  }

  const inGame = path.join(textureRoot, "UI", "InGame");
  const mainMenu = path.join(textureRoot, "UI", "Main_Menu");
  const elementOut = path.join(ROOT, "public", "images", "elements");
  const workOut = path.join(ROOT, "public", "images", "work");
  ensureDir(elementOut);
  ensureDir(workOut);

  for (const meta of Object.values(ELEMENT_MAP)) {
    const idx = String(meta.index).padStart(2, "0");
    const source = firstExisting([
      path.join(inGame, `T_Icon_element_s_${idx}.png`),
      path.join(mainMenu, `T_Icon_element_${idx}.png`),
      path.join(mainMenu, `T_prt_palstatus_element_${idx}.png`),
    ]);
    if (!source) {
      missing += 1;
      continue;
    }
    const destName = `${meta.id}.png`;
    fs.copyFileSync(source, path.join(elementOut, destName));
    elementIcons[meta.id] = `/images/elements/${destName}`;
    copied += 1;
  }

  for (const meta of Object.values(WORK_MAP)) {
    const idx = String(meta.palwork).padStart(2, "0");
    const source = firstExisting([
      path.join(inGame, `T_icon_palwork_${idx}.png`),
      path.join(inGame, `T_Icon_palwork_${idx}.png`),
    ]);
    if (!source) {
      missing += 1;
      continue;
    }
    const destName = `${meta.id}.png`;
    fs.copyFileSync(source, path.join(workOut, destName));
    workIcons[meta.id] = `/images/work/${destName}`;
    copied += 1;
  }

  return { elementIcons, workIcons, copied, missing };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.source) {
    printHelp();
    console.error("Error: --source is required");
    process.exit(1);
  }

  const sourceRoot = path.resolve(args.source);
  const contentRoot = path.join(sourceRoot, "Pal", "Content");
  const dataTableRoot = path.join(contentRoot, "Pal", "DataTable");
  const textureRoot = path.join(contentRoot, "Pal", "Texture");
  const l10nRoot = path.join(
    contentRoot,
    "L10N",
    "en",
    "Pal",
    "DataTable",
    "Text"
  );
  const baseTextRoot = path.join(dataTableRoot, "Text");

  const paths = {
    monsters: path.join(
      dataTableRoot,
      "Character",
      "DT_PalMonsterParameter_Common.json"
    ),
    icons: path.join(
      dataTableRoot,
      "Character",
      "DT_PalCharacterIconDataTable_Common.json"
    ),
    unique: path.join(dataTableRoot, "Character", "DT_PalCombiUnique.json"),
    partner: path.join(
      dataTableRoot,
      "PassiveSkill",
      "DT_PartnerSkillParameter.json"
    ),
    drops: path.join(
      dataTableRoot,
      "Character",
      "DT_PalDropItem_Common.json"
    ),
    dropsFallback: path.join(
      dataTableRoot,
      "Character",
      "DT_PalDropItem.json"
    ),
    waza: path.join(dataTableRoot, "Waza", "DT_WazaDataTable_Common.json"),
    wazaFallback: path.join(dataTableRoot, "Waza", "DT_WazaDataTable.json"),
    wazaMaster: path.join(
      dataTableRoot,
      "Waza",
      "DT_WazaMasterLevel_Common.json"
    ),
    wazaMasterFallback: path.join(
      dataTableRoot,
      "Waza",
      "DT_WazaMasterLevel.json"
    ),
  };

  console.log(`Importing from ${sourceRoot}`);

  const monsters = requireRows(paths.monsters);
  const icons = requireRows(paths.icons);
  const uniqueRows = requireRows(paths.unique);
  const partnerSkills = readRows(paths.partner) || {};
  const wazaRows =
    readRows(paths.waza) || requireRows(paths.wazaFallback);
  const wazaMasterRows =
    readRows(paths.wazaMaster) || readRows(paths.wazaMasterFallback) || {};

  const textBundle = loadTextBundle(l10nRoot, baseTextRoot, [
    "DT_PalNameText_Common.json",
    "DT_PalNameText.json",
    "DT_PalLongDescriptionText.json",
    "DT_PalShortDescriptionText.json",
    "DT_PalFirstActivatedInfoText.json",
    "DT_SkillNameText_Common.json",
    "DT_SkillNameText.json",
    "DT_SkillDescText_Common.json",
    "DT_SkillDescText.json",
    "DT_ItemNameText_Common.json",
    "DT_ItemNameText.json",
  ]);

  const text = {
    names: [
      textBundle["DT_PalNameText_Common.json"].l10n,
      textBundle["DT_PalNameText.json"].l10n,
      textBundle["DT_PalNameText_Common.json"].base,
      textBundle["DT_PalNameText.json"].base,
    ].filter(Boolean),
    longDescs: textBundle["DT_PalLongDescriptionText.json"].tables,
    shortDescs: textBundle["DT_PalShortDescriptionText.json"].tables,
    firstActivated: textBundle["DT_PalFirstActivatedInfoText.json"].tables,
    skillNames: [
      textBundle["DT_SkillNameText_Common.json"].l10n,
      textBundle["DT_SkillNameText.json"].l10n,
      textBundle["DT_SkillNameText_Common.json"].base,
      textBundle["DT_SkillNameText.json"].base,
    ].filter(Boolean),
    skillDescs: [
      textBundle["DT_SkillDescText_Common.json"].l10n,
      textBundle["DT_SkillDescText.json"].l10n,
      textBundle["DT_SkillDescText_Common.json"].base,
      textBundle["DT_SkillDescText.json"].base,
    ].filter(Boolean),
    itemNames: [
      textBundle["DT_ItemNameText_Common.json"].l10n,
      textBundle["DT_ItemNameText.json"].l10n,
      textBundle["DT_ItemNameText_Common.json"].base,
      textBundle["DT_ItemNameText.json"].base,
    ].filter(Boolean),
  };

  const wazaById = buildWazaIndex(
    wazaRows,
    text.skillNames,
    text.skillDescs,
    args.allowJpText
  );
  const activeSkillsByPal = buildActiveSkillsByPal(wazaMasterRows, wazaById);
  const dropRows = readRows(paths.drops) || readRows(paths.dropsFallback) || {};
  const dropsByCharacter = buildDropsByCharacter(
    dropRows,
    text.itemNames,
    args.allowJpText
  );

  const uniqueChildIds = Object.values(uniqueRows)
    .map((row) => row.ChildCharacterID)
    .filter(Boolean);

  const pals = buildPals({
    monsters,
    text,
    icons,
    partnerSkills,
    activeSkillsByPal,
    dropsByCharacter,
    textureRoot,
    extraIds: uniqueChildIds,
    allowJpText: args.allowJpText,
  });

  const unique = buildUniqueBreeding(uniqueRows, pals);
  const imageStats = copyImages(
    pals,
    path.join(ROOT, "public", "images", "pals"),
    args.skipImages
  );
  const uiIconStats = copyUiMetaIcons(textureRoot, args.skipImages);

  const publicPals = pals.map(({ _sourceIcon, ...pal }) => pal);
  const skills = [...wazaById.values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  writeJson(path.join(ROOT, "data", "pals.json"), publicPals);
  writeJson(path.join(ROOT, "data", "breeding.json"), {
    version: 1,
    formula: "floor((parentA.combiRank + parentB.combiRank + 1) / 2)",
    unique,
  });
  writeJson(
    path.join(ROOT, "data", "types.json"),
    Object.entries(ELEMENT_MAP).map(([gameId, meta]) => ({
      id: meta.id,
      gameId,
      name: meta.name,
      color: meta.color,
      icon: uiIconStats.elementIcons[meta.id] || null,
    }))
  );
  writeJson(
    path.join(ROOT, "data", "work-suitability.json"),
    Object.values(WORK_MAP).map((meta) => ({
      id: meta.id,
      name: meta.name,
      icon: uiIconStats.workIcons[meta.id] || null,
    }))
  );
  writeJson(path.join(ROOT, "data", "skills.json"), skills);
  writeMeta(args.gameVersion);

  const withDesc = publicPals.filter((pal) => pal.description).length;
  const withPartnerName = publicPals.filter((pal) => pal.partnerSkill.name)
    .length;
  const withActiveSkills = publicPals.filter((pal) => pal.activeSkills.length)
    .length;
  const withDrops = publicPals.filter((pal) => pal.drops?.length).length;
  const enSkillNames = skills.filter(
    (skill) => skill.name !== skill.id && !looksJapanese(skill.name)
  ).length;

  const listedCount = publicPals.filter((pal) => pal.listed !== false).length;
  const unlistedCount = publicPals.length - listedCount;

  console.log(`\nDone.`);
  console.log(`  pals.json total           ${publicPals.length}`);
  console.log(`  listed Paldex entries     ${listedCount}`);
  console.log(`  unlisted breeding helpers ${unlistedCount}`);
  console.log(`  breedable                 ${publicPals.filter((p) => p.breedable).length}`);
  console.log(`  breeding unique           ${unique.length}`);
  console.log(`  skills.json               ${skills.length}`);
  console.log(`  pals with EN description  ${withDesc}`);
  console.log(`  pals with EN partner name ${withPartnerName}`);
  console.log(`  pals with active skills   ${withActiveSkills}`);
  console.log(`  pals with drops           ${withDrops}`);
  console.log(`  skills with EN names      ${enSkillNames}`);
  console.log(`  images copied             ${imageStats.copied}`);
  console.log(`  images missing            ${imageStats.missing}`);
  console.log(`  UI meta icons copied      ${uiIconStats.copied}`);
  console.log(`  UI meta icons missing     ${uiIconStats.missing}`);
  console.log(`  meta.json game version    ${args.gameVersion}`);
  console.log(`  meta.json updated         ${todayUtcDate()}`);

  const missingEnL10n = [
    !textBundle["DT_PalLongDescriptionText.json"].l10n &&
      "L10N/en/.../DT_PalLongDescriptionText.json",
    !textBundle["DT_PalFirstActivatedInfoText.json"].l10n &&
      "L10N/en/.../DT_PalFirstActivatedInfoText.json",
    !textBundle["DT_SkillNameText_Common.json"].l10n &&
      "L10N/en/.../DT_SkillNameText_Common.json",
    !textBundle["DT_SkillDescText_Common.json"].l10n &&
      "L10N/en/.../DT_SkillDescText_Common.json",
  ].filter(Boolean);

  if (missingEnL10n.length) {
    console.log(`\nMissing ENGLISH L10N (you exported JP base Text tables):`);
    for (const item of missingEnL10n) console.log(`  - ${item}`);
    console.log(
      `Tip: In FModel open L10N/en packages and export those Text tables.`
    );
    console.log(
      `Temporary workaround: npm run data:import -- --source "..." --allow-jp-text`
    );
  }
}

main();
