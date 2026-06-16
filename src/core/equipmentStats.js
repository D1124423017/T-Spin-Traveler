import { getMetaBonuses } from "./metaProgress.js";
import { getEquippedEquipment } from "./equipmentProgress.js";

export const DEFAULT_PLAYER_BASE_STATS = Object.freeze({
  maxHp: 100,
  attack: 10,
  guard: 0,
});

export const EMPTY_EQUIPMENT_STAT_BONUS = Object.freeze({
  maxHpBonus: 0,
  attackBonus: 0,
  guardBonus: 0,
});

export function normalizeEquipmentStatBonus(stats = {}) {
  return {
    maxHpBonus: toSafeBonus(stats?.maxHpBonus),
    attackBonus: toSafeBonus(stats?.attackBonus),
    guardBonus: toSafeBonus(stats?.guardBonus),
  };
}

export function getEquipmentStatBonuses(progress = {}) {
  const equipped = getEquippedEquipment(progress);
  return Object.values(equipped).reduce((total, item) => {
    const stats = normalizeEquipmentStatBonus(item?.stats);
    total.maxHpBonus += stats.maxHpBonus;
    total.attackBonus += stats.attackBonus;
    total.guardBonus += stats.guardBonus;
    return total;
  }, { ...EMPTY_EQUIPMENT_STAT_BONUS });
}

export function calculateEquipmentStats({
  baseStats = DEFAULT_PLAYER_BASE_STATS,
  equipmentProgress = {},
} = {}) {
  const base = {
    maxHp: toSafeStat(baseStats?.maxHp, DEFAULT_PLAYER_BASE_STATS.maxHp),
    attack: toSafeStat(baseStats?.attack, DEFAULT_PLAYER_BASE_STATS.attack),
    guard: toSafeStat(baseStats?.guard, DEFAULT_PLAYER_BASE_STATS.guard),
  };
  const equipmentBonuses = getEquipmentStatBonuses(equipmentProgress);
  return {
    baseStats: base,
    equipmentBonuses,
    finalStats: {
      maxHp: base.maxHp + equipmentBonuses.maxHpBonus,
      attack: base.attack + equipmentBonuses.attackBonus,
      guard: base.guard + equipmentBonuses.guardBonus,
    },
  };
}

export function getEquipmentLoadoutStats(metaProgress = {}, options = {}) {
  const {
    baseMaxHp = DEFAULT_PLAYER_BASE_STATS.maxHp,
    baseAttack = DEFAULT_PLAYER_BASE_STATS.attack,
  } = options;
  const metaBonuses = getMetaBonuses(metaProgress);
  return calculateEquipmentStats({
    baseStats: {
      maxHp: baseMaxHp + metaBonuses.hpBonus,
      attack: Math.round(baseAttack * metaBonuses.attackMultiplier),
      guard: metaBonuses.guardBonus,
    },
    equipmentProgress: metaProgress?.equipment,
  });
}

function toSafeBonus(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

function toSafeStat(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : fallback;
}
