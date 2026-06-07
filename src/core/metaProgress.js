import { getAscensionMaxLevel } from "./ascensionChallenge.js";

export const META_PROGRESS_SCHEMA_VERSION = 2;
export const META_PROGRESS_STORAGE_KEY = "tspin-traveler-meta-progress-v2";
export const LEGACY_META_PROGRESS_STORAGE_KEY = "tspin-traveler-meta-progress-v1";

export const META_UPGRADE_DEFS = Object.freeze({
  hp: Object.freeze({
    id: "hp",
    levelKey: "hpLevel",
    nameKey: "metaUpgradeMaxHp",
    iconKey: "hp",
    maxLevel: 20,
    valuePerLevel: 5,
    costs: Object.freeze([
      50, 75, 100, 125, 150, 200, 250, 300, 375, 450,
      550, 675, 825, 1000, 1200, 1450, 1750, 2100, 2500, 3000,
    ]),
  }),
  attack: Object.freeze({
    id: "attack",
    levelKey: "attackLevel",
    nameKey: "metaUpgradeAttack",
    iconKey: "attack",
    maxLevel: 20,
    valuePerLevel: 2,
    multiplierPerLevel: 0.02,
    costs: Object.freeze([
      60, 90, 120, 160, 200, 260, 320, 400, 500, 650,
      800, 975, 1175, 1400, 1675, 2000, 2400, 2850, 3400, 4050,
    ]),
  }),
  guard: Object.freeze({
    id: "guard",
    levelKey: "guardLevel",
    nameKey: "metaUpgradeGuard",
    iconKey: "guard",
    maxLevel: 20,
    valuePerLevel: 3,
    costs: Object.freeze([
      50, 75, 100, 125, 150, 200, 250, 300, 375, 450,
      550, 675, 825, 1000, 1200, 1450, 1750, 2100, 2500, 3000,
    ]),
  }),
});

export const DEFAULT_META_PROGRESS = Object.freeze({
  schemaVersion: META_PROGRESS_SCHEMA_VERSION,
  ascensionTier: 0,
  completedAscensions: Object.freeze([]),
  riftEnergy: 0,
  metaUpgrades: Object.freeze({
    hpLevel: 0,
    attackLevel: 0,
    guardLevel: 0,
  }),
});

function toNonNegativeInt(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

export function normalizeMetaProgress(value = {}) {
  const upgrades = value?.metaUpgrades || {};
  const ascensionTier = toNonNegativeInt(value?.ascensionTier);
  const normalized = {
    schemaVersion: META_PROGRESS_SCHEMA_VERSION,
    ascensionTier,
    completedAscensions: Array.from(new Set(
      Array.isArray(value?.completedAscensions)
        ? value.completedAscensions.filter((id) => typeof id === "string" && id.length > 0)
        : [],
    )),
    riftEnergy: toNonNegativeInt(value?.riftEnergy),
    metaUpgrades: {
      hpLevel: toNonNegativeInt(upgrades.hpLevel ?? value?.hpLevel),
      attackLevel: toNonNegativeInt(upgrades.attackLevel ?? value?.attackLevel),
      guardLevel: toNonNegativeInt(upgrades.guardLevel ?? value?.guardLevel),
    },
  };
  const maxLevel = getAscensionMaxLevel(ascensionTier);
  for (const def of Object.values(META_UPGRADE_DEFS)) {
    normalized.metaUpgrades[def.levelKey] = Math.min(
      maxLevel,
      normalized.metaUpgrades[def.levelKey],
    );
  }
  return normalized;
}

export function calculateRiftEnergyEarned(stats = {}) {
  const waveReached = Math.max(0, toNonNegativeInt(stats.waveReached));
  const normalEnemyKills = toNonNegativeInt(stats.normalEnemyKills);
  const bossKills = toNonNegativeInt(stats.bossKills);
  const perfectClearCount = toNonNegativeInt(stats.perfectClearCount);
  const spinCount = toNonNegativeInt(stats.spinCount);
  const maxCombo = toNonNegativeInt(stats.maxCombo);

  return (
    normalEnemyKills * (5 + Math.floor(waveReached / 3))
    + bossKills * (30 + Math.floor(waveReached / 2))
    + perfectClearCount * 8
    + spinCount * 2
    + Math.floor(maxCombo / 5) * 5
    + waveReached * 2
  );
}

export function getMetaUpgradeDef(id) {
  return META_UPGRADE_DEFS[id] || null;
}

export function getMetaUpgradeLevel(progress, id) {
  const normalized = normalizeMetaProgress(progress);
  const def = getMetaUpgradeDef(id);
  return def ? normalized.metaUpgrades[def.levelKey] : 0;
}

export function getMetaUpgradeCost(id, level, progress = null) {
  const def = getMetaUpgradeDef(id);
  if (!def) return null;
  const safeLevel = toNonNegativeInt(level);
  const levelCap = progress ? getAscensionMaxLevel(progress) : 10;
  if (safeLevel >= levelCap) return null;
  return def.costs[safeLevel] ?? null;
}

export function buyMetaUpgrade(progress, id) {
  const def = getMetaUpgradeDef(id);
  if (!def) return { ok: false, reason: "unknown", progress: normalizeMetaProgress(progress) };
  const nextProgress = normalizeMetaProgress(progress);
  const level = nextProgress.metaUpgrades[def.levelKey];
  const cost = getMetaUpgradeCost(id, level, nextProgress);
  if (cost === null) return { ok: false, reason: "maxed", progress: nextProgress };
  if (nextProgress.riftEnergy < cost) {
    return { ok: false, reason: "notEnough", cost, progress: nextProgress };
  }
  nextProgress.riftEnergy -= cost;
  nextProgress.metaUpgrades[def.levelKey] = level + 1;
  return { ok: true, cost, progress: nextProgress, level: level + 1 };
}

export function grantRiftEnergy(progress, amount) {
  const nextProgress = normalizeMetaProgress(progress);
  nextProgress.riftEnergy += toNonNegativeInt(amount);
  return nextProgress;
}

export function getMetaBonuses(progress) {
  const normalized = normalizeMetaProgress(progress);
  const hpLevel = normalized.metaUpgrades.hpLevel;
  const attackLevel = normalized.metaUpgrades.attackLevel;
  const guardLevel = normalized.metaUpgrades.guardLevel;
  return {
    hpBonus: hpLevel * META_UPGRADE_DEFS.hp.valuePerLevel,
    attackPercent: attackLevel * META_UPGRADE_DEFS.attack.valuePerLevel,
    attackMultiplier: 1 + attackLevel * META_UPGRADE_DEFS.attack.multiplierPerLevel,
    guardBonus: guardLevel * META_UPGRADE_DEFS.guard.valuePerLevel,
  };
}

export function loadMetaProgress(storage = globalThis?.localStorage) {
  try {
    const raw = storage?.getItem?.(META_PROGRESS_STORAGE_KEY);
    if (raw) return normalizeMetaProgress(JSON.parse(raw));
  } catch {
    // Fall through to the legacy backup when the v2 payload is invalid.
  }
  try {
    const legacyRaw = storage?.getItem?.(LEGACY_META_PROGRESS_STORAGE_KEY);
    if (!legacyRaw) return normalizeMetaProgress(DEFAULT_META_PROGRESS);
    const migrated = normalizeMetaProgress(JSON.parse(legacyRaw));
    storage?.setItem?.(META_PROGRESS_STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return normalizeMetaProgress(DEFAULT_META_PROGRESS);
  }
}

export function saveMetaProgress(progress, storage = globalThis?.localStorage) {
  try {
    storage?.setItem?.(META_PROGRESS_STORAGE_KEY, JSON.stringify(normalizeMetaProgress(progress)));
  } catch {
    // Permanent progress is optional when storage is blocked.
  }
}
