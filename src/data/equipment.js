import { RARITY } from "./upgrades.js";

export const EQUIPMENT_SLOT_ORDER = Object.freeze(["head", "cloak", "weapon"]);
export const EQUIPMENT_FILTER_ORDER = Object.freeze([
  "all",
  ...EQUIPMENT_SLOT_ORDER,
]);
export const EQUIPMENT_SCREEN_VIEWS = Object.freeze({
  inventory: "inventory",
  roulette: "roulette",
});
export const EQUIPMENT_RARITY_ORDER = Object.freeze([
  "common",
  "rare",
  "relic",
  "legendary",
]);
export const EQUIPMENT_DRAW_COSTS = Object.freeze({
  first: 100,
  repeat: 500,
});
export const EQUIPMENT_WHEEL_UPGRADE_COSTS = Object.freeze([
  2000,
  5000,
  10000,
  20000,
]);
export const EQUIPMENT_WHEEL_SEGMENT_COUNT = 24;

export const EQUIPMENT_WHEEL_LEVELS = Object.freeze([
  Object.freeze({
    level: 1,
    nameKey: "equipmentWheelLevel1",
    weights: Object.freeze({ common: 70, rare: 25, relic: 5, legendary: 0 }),
    visualPower: 0.2,
  }),
  Object.freeze({
    level: 2,
    nameKey: "equipmentWheelLevel2",
    weights: Object.freeze({ common: 50, rare: 35, relic: 13, legendary: 2 }),
    visualPower: 0.4,
  }),
  Object.freeze({
    level: 3,
    nameKey: "equipmentWheelLevel3",
    weights: Object.freeze({ common: 32, rare: 38, relic: 22, legendary: 8 }),
    visualPower: 0.6,
  }),
  Object.freeze({
    level: 4,
    nameKey: "equipmentWheelLevel4",
    weights: Object.freeze({ common: 20, rare: 32, relic: 28, legendary: 20 }),
    visualPower: 0.8,
  }),
  Object.freeze({
    level: 5,
    nameKey: "equipmentWheelLevel5",
    weights: Object.freeze({ common: 10, rare: 25, relic: 30, legendary: 35 }),
    visualPower: 1,
  }),
]);

export const EQUIPMENT_ITEMS = Object.freeze([
  equipment("wanderer-observer-hood", "head", "common", {
    type: "lineAttackFlat",
    damage: 1,
  }),
  equipment("torn-traveler-cloak", "cloak", "common", {
    type: "battleStartGuard",
    guard: 2,
  }),
  equipment("shard-crystal-dagger", "weapon", "common", {
    type: "normalAttackFlat",
    damage: 2,
  }),
  equipment("star-pattern-headwrap", "head", "rare", {
    type: "tspinDamageFlat",
    damage: 3,
  }),
  equipment("resonance-cloak", "cloak", "rare", {
    type: "comboThreeGuard",
    comboThreshold: 3,
    guard: 2,
  }),
  equipment("pulse-crystal-blade", "weapon", "rare", {
    type: "b2bDamageFlat",
    damage: 3,
  }),
  equipment("rift-observer-crown", "head", "relic", {
    type: "firstWaveTspinDamage",
    damage: 6,
    usesPerWave: 1,
  }),
  equipment("phase-long-cloak", "cloak", "relic", {
    type: "perfectClearGuard",
    guard: 6,
  }),
  equipment("orbital-longsword", "weapon", "relic", {
    type: "comboFourDamage",
    comboThreshold: 4,
    damage: 5,
  }),
  equipment("royal-crystal-crown", "head", "legendary", {
    type: "allAndTspinDamage",
    allDamage: 3,
    tspinDamage: 3,
  }),
  equipment("royal-nightfall-cloak", "cloak", "legendary", {
    type: "lowHpFirstGuardDouble",
    hpThresholdPercent: 50,
    guardMultiplier: 2,
    usesPerWave: 1,
  }),
  equipment("rift-sovereignty-blade", "weapon", "legendary", {
    type: "b2bTetrisDamage",
    damage: 8,
  }),
  equipment("rift-king-mask", "head", "legendary", {
    type: "fifthLineAttackDamage",
    attackInterval: 5,
    damage: 10,
  }),
  equipment("fate-deception-cloak", "cloak", "legendary", {
    type: "fatalSaveOnce",
    hpRetained: 1,
    guard: 10,
    usesPerBattle: 1,
  }),
  equipment("cheaters-amethyst-sword", "weapon", "legendary", {
    type: "ultimatePerfectDamage",
    damage: 15,
  }),
]);

const EQUIPMENT_BY_ID = new Map(EQUIPMENT_ITEMS.map((item) => [item.id, item]));

function equipment(id, slot, rarity, effect) {
  return Object.freeze({
    id,
    slot,
    rarity,
    nameKey: `equipment.${id}.name`,
    descriptionKey: `equipment.${id}.description`,
    effectKey: `equipment.${id}.effect`,
    iconAssetKey: id,
    effect: Object.freeze({ ...effect }),
  });
}

export function getEquipmentById(id) {
  return EQUIPMENT_BY_ID.get(id) || null;
}

export function getEquipmentByRarity(rarity) {
  return EQUIPMENT_ITEMS.filter((item) => item.rarity === rarity);
}

export function getEquipmentRarityStyle(rarity) {
  return RARITY[rarity] || RARITY.common;
}

export function getEquipmentWheelLevel(level = 1) {
  const safeLevel = Math.max(1, Math.min(EQUIPMENT_WHEEL_LEVELS.length, Math.floor(Number(level) || 1)));
  return EQUIPMENT_WHEEL_LEVELS[safeLevel - 1];
}

export function getEquipmentDrawCost(progress = {}) {
  return Math.max(0, Math.floor(Number(progress?.drawCount) || 0)) === 0
    ? EQUIPMENT_DRAW_COSTS.first
    : EQUIPMENT_DRAW_COSTS.repeat;
}

export function getEquipmentWheelUpgradeCost(level = 1) {
  const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
  return EQUIPMENT_WHEEL_UPGRADE_COSTS[safeLevel - 1] ?? null;
}

export function buildEquipmentWheelSegments(
  level = 1,
  count = EQUIPMENT_WHEEL_SEGMENT_COUNT,
) {
  const wheel = getEquipmentWheelLevel(level);
  const allocations = allocateSegments(wheel.weights, count);
  const remaining = { ...allocations };
  const segments = [];
  let cursor = 0;
  while (segments.length < count) {
    const available = EQUIPMENT_RARITY_ORDER
      .filter((rarity) => remaining[rarity] > 0)
      .sort((a, b) => {
        const aRatio = remaining[a] / Math.max(1, allocations[a]);
        const bRatio = remaining[b] / Math.max(1, allocations[b]);
        return bRatio - aRatio
          || ((EQUIPMENT_RARITY_ORDER.indexOf(a) - cursor + 8) % 4)
            - ((EQUIPMENT_RARITY_ORDER.indexOf(b) - cursor + 8) % 4);
      });
    const rarity = available[0] || "common";
    segments.push(Object.freeze({
      index: segments.length,
      rarity,
    }));
    remaining[rarity] -= 1;
    cursor = (EQUIPMENT_RARITY_ORDER.indexOf(rarity) + 1) % EQUIPMENT_RARITY_ORDER.length;
  }
  return Object.freeze(segments);
}

function allocateSegments(weights, count) {
  const exact = EQUIPMENT_RARITY_ORDER.map((rarity) => {
    const value = ((weights[rarity] || 0) / 100) * count;
    return { rarity, floor: Math.floor(value), fraction: value - Math.floor(value) };
  });
  let assigned = exact.reduce((sum, entry) => sum + entry.floor, 0);
  exact.sort((a, b) => b.fraction - a.fraction);
  for (const entry of exact) {
    if (assigned >= count) break;
    entry.floor += 1;
    assigned += 1;
  }
  return Object.fromEntries(exact.map(({ rarity, floor }) => [rarity, floor]));
}
