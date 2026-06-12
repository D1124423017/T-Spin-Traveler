import {
  EQUIPMENT_ITEMS,
  EQUIPMENT_RARITY_ORDER,
  EQUIPMENT_SLOT_ORDER,
  EQUIPMENT_WHEEL_LEVELS,
  getEquipmentById,
  getEquipmentByRarity,
  getEquipmentWheelLevel,
} from "../data/equipment.js";

export const DEFAULT_EQUIPMENT_PROGRESS = Object.freeze({
  wheelLevel: 1,
  ownedEquipment: Object.freeze([]),
  equipped: Object.freeze({
    head: null,
    cloak: null,
    weapon: null,
  }),
  recentDrop: null,
  drawCount: 0,
});

export function normalizeEquipmentProgress(value = {}) {
  const ownedEquipment = Array.from(new Set(
    Array.isArray(value?.ownedEquipment)
      ? value.ownedEquipment.filter((id) => Boolean(getEquipmentById(id)))
      : [],
  ));
  const owned = new Set(ownedEquipment);
  const equippedSource = value?.equipped || {};
  const equipped = Object.fromEntries(EQUIPMENT_SLOT_ORDER.map((slot) => {
    const id = equippedSource[slot];
    const item = getEquipmentById(id);
    return [slot, item?.slot === slot && owned.has(id) ? id : null];
  }));
  return {
    wheelLevel: Math.max(
      1,
      Math.min(EQUIPMENT_WHEEL_LEVELS.length, Math.floor(Number(value?.wheelLevel) || 1)),
    ),
    ownedEquipment,
    equipped,
    recentDrop: getEquipmentById(value?.recentDrop) ? value.recentDrop : null,
    drawCount: Math.max(0, Math.floor(Number(value?.drawCount) || 0)),
  };
}

export function drawEquipment(progress, rng = Math.random) {
  const nextProgress = normalizeEquipmentProgress(progress);
  const wheel = getEquipmentWheelLevel(nextProgress.wheelLevel);
  const rarity = pickWeightedRarity(wheel.weights, rng);
  const candidates = getEquipmentByRarity(rarity);
  const item = candidates[Math.min(
    candidates.length - 1,
    Math.floor(clampRandom(rng()) * candidates.length),
  )] || EQUIPMENT_ITEMS[0];
  const duplicate = nextProgress.ownedEquipment.includes(item.id);
  if (!duplicate) nextProgress.ownedEquipment.push(item.id);
  nextProgress.recentDrop = item.id;
  nextProgress.drawCount += 1;
  return {
    ok: true,
    duplicate,
    item,
    rarity,
    progress: nextProgress,
  };
}

export function upgradeEquipmentWheel(progress) {
  const nextProgress = normalizeEquipmentProgress(progress);
  if (nextProgress.wheelLevel >= EQUIPMENT_WHEEL_LEVELS.length) {
    return { ok: false, reason: "maxed", progress: nextProgress };
  }
  nextProgress.wheelLevel += 1;
  return {
    ok: true,
    level: nextProgress.wheelLevel,
    progress: nextProgress,
  };
}

export function equipOwnedItem(progress, itemId) {
  const nextProgress = normalizeEquipmentProgress(progress);
  const item = getEquipmentById(itemId);
  if (!item) return { ok: false, reason: "unknown", progress: nextProgress };
  if (!nextProgress.ownedEquipment.includes(item.id)) {
    return { ok: false, reason: "notOwned", progress: nextProgress };
  }
  nextProgress.equipped[item.slot] = item.id;
  return { ok: true, item, progress: nextProgress };
}

export function getEquippedEquipment(progress) {
  const normalized = normalizeEquipmentProgress(progress);
  return Object.fromEntries(EQUIPMENT_SLOT_ORDER.map((slot) => [
    slot,
    getEquipmentById(normalized.equipped[slot]),
  ]));
}

export function getOwnedEquipmentForFilter(progress, filter = "all") {
  const normalized = normalizeEquipmentProgress(progress);
  return normalized.ownedEquipment
    .map((id) => getEquipmentById(id))
    .filter((item) => item && (filter === "all" || item.slot === filter));
}

function pickWeightedRarity(weights, rng) {
  let roll = clampRandom(rng()) * 100;
  for (const rarity of EQUIPMENT_RARITY_ORDER) {
    roll -= weights[rarity] || 0;
    if (roll < 0) return rarity;
  }
  return EQUIPMENT_RARITY_ORDER.at(-1);
}

function clampRandom(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(0.999999999, number));
}
