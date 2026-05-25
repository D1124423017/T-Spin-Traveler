import { TRAIT_DEFS } from "../data/upgrades.js";
export { isBossEnemy, isBossLikeEnemy, isMiniBossEnemy } from "./enemyTypes.js";

function clampValue(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getTraitDef(traitId, traitDefs = TRAIT_DEFS) {
  return traitDefs[traitId] || null;
}

function getTraitCount(traits, traitId) {
  if (typeof traits === "number") return Math.max(0, Math.floor(traits));
  if (!traits || !traitId) return 0;
  if (Array.isArray(traits)) {
    return traits.reduce((count, trait) => {
      if (!trait) return count;
      const matchesEntry = trait.tag === traitId || trait.id === traitId;
      const matchesTags = Array.isArray(trait.tags) && trait.tags.includes(traitId);
      return count + (matchesEntry || matchesTags ? Math.max(0, Math.floor(trait.count || 1)) : 0);
    }, 0);
  }
  if (traits instanceof Map) return Math.max(0, Math.floor(traits.get(traitId) || 0));
  if (typeof traits === "object") {
    const value = traits[traitId];
    if (typeof value === "number") return Math.max(0, Math.floor(value));
    return Math.max(0, Math.floor(value?.count || 0));
  }
  return 0;
}

export function getTraitFullCount(traitId, traitDefs = TRAIT_DEFS) {
  const def = getTraitDef(traitId, traitDefs);
  if (!def?.breakpoints?.length) return 0;
  return def.breakpoints[def.breakpoints.length - 1];
}

export function getTraitStage(traitId, count = 0, traitDefs = TRAIT_DEFS) {
  const def = getTraitDef(traitId, traitDefs);
  if (!def?.breakpoints?.length) return 0;
  return def.breakpoints.reduce((stage, breakpoint) => stage + (count >= breakpoint ? 1 : 0), 0);
}

export function getTraitProgress(traits, traitId, traitDefs = TRAIT_DEFS) {
  const count = getTraitCount(traits, traitId);
  const fullCount = getTraitFullCount(traitId, traitDefs);
  const stage = getTraitStage(traitId, count, traitDefs);
  const nextThreshold = getTraitDef(traitId, traitDefs)?.breakpoints?.find((breakpoint) => count < breakpoint) || null;
  const overcap = fullCount > 0 ? Math.max(0, count - fullCount) : 0;
  return {
    traitId,
    count,
    fullCount,
    stage,
    nextThreshold,
    isFull: fullCount > 0 && count >= fullCount,
    overcap,
  };
}

export function getTraitOvercap(traits, traitId, traitDefs = TRAIT_DEFS) {
  return getTraitProgress(traits, traitId, traitDefs).overcap;
}

function getOvercapRuleValue(overcap, rule) {
  if (!rule || typeof rule !== "object") return 0;
  const every = Math.max(1, Math.floor(rule.every || 1));
  const value = typeof rule.value === "number" ? rule.value : 0;
  const cap = typeof rule.cap === "number" ? rule.cap : Number.POSITIVE_INFINITY;
  const raw = Math.floor(overcap / every) * value;
  return clampValue(raw, 0, cap);
}

export function getTraitOvercapBonus(traits, traitId, traitDefs = TRAIT_DEFS) {
  const def = getTraitDef(traitId, traitDefs);
  const progress = getTraitProgress(traits, traitId, traitDefs);
  const bonus = {
    count: progress.count,
    fullCount: progress.fullCount,
    isFull: progress.isFull,
    overcap: progress.overcap,
  };
  const overcapConfig = def?.overcap || {};
  for (const [key, rule] of Object.entries(overcapConfig)) {
    if (!rule || typeof rule !== "object" || !("value" in rule)) continue;
    bonus[key] = getOvercapRuleValue(progress.overcap, rule);
  }
  return bonus;
}

export function getSpinTraitBonus(traits) {
  const bonus = getTraitOvercapBonus(traits, "Spin");
  return {
    overcap: bonus.overcap,
    damage: bonus.damage || 0,
    guard: bonus.guard || 0,
  };
}

export function getComboTraitBonus(traits) {
  const bonus = getTraitOvercapBonus(traits, "Combo");
  const config = TRAIT_DEFS.Combo?.overcap || {};
  return {
    overcap: bonus.overcap,
    damagePerCombo: bonus.damagePerCombo || 0,
    delay: bonus.delay || 0,
    traitDelayCap: config.traitDelayCap || 3,
  };
}

export function getDefenseTraitBonus(traits) {
  const bonus = getTraitOvercapBonus(traits, "Defense");
  return {
    overcap: bonus.overcap,
    maxGuard: bonus.maxGuard || 0,
    clearGuard: bonus.clearGuard || 0,
    reflectDamage: bonus.reflectDamage || 0,
  };
}

export function getSurvivalTraitBonus(traits) {
  const bonus = getTraitOvercapBonus(traits, "Survival");
  return {
    overcap: bonus.overcap,
    waveHeal: bonus.waveHeal || 0,
  };
}

export function getGarbageTraitBonus(traits) {
  const bonus = getTraitOvercapBonus(traits, "Garbage");
  return {
    overcap: bonus.overcap,
    counterDamagePerRow: bonus.counterDamagePerRow || 0,
    graceDelay: bonus.graceDelay || 0,
  };
}

export function getB2BTraitBonus(traits) {
  const bonus = getTraitOvercapBonus(traits, "B2B");
  return {
    overcap: bonus.overcap,
    damage: bonus.damage || 0,
    guard: bonus.guard || 0,
  };
}

export function getBurstTraitBonus(traits) {
  const bonus = getTraitOvercapBonus(traits, "Burst");
  return {
    overcap: bonus.overcap,
    damage: bonus.damage || 0,
  };
}

export function getUtilityTraitBonus(traits) {
  const bonus = getTraitOvercapBonus(traits, "Utility");
  return {
    overcap: bonus.overcap,
    ultimateCharge: bonus.ultimateCharge || 0,
  };
}

export function getBossKillerTraitBonus(traits) {
  const bonus = getTraitOvercapBonus(traits, "Boss Killer");
  return {
    overcap: bonus.overcap,
    damage: bonus.damage || 0,
    maxHpRatio: bonus.maxHpRatio || 0,
  };
}

export function getPerfectClearTraitBonus(traits) {
  const progress = getTraitProgress(traits, "Perfect");
  const config = TRAIT_DEFS.Perfect?.overcap || {};
  const overcapBonus = getTraitOvercapBonus(traits, "Perfect");
  const hasTrait = progress.count >= 1;
  const isFull = progress.count >= progress.fullCount && progress.fullCount > 0;
  const baseRatio = isFull
    ? config.fullBossMaxHpRatio || 0.45
    : config.baseBossMaxHpRatio || 0.35;
  const bossMaxHpRatio = clampValue(
    baseRatio + (overcapBonus.bossMaxHpRatio || 0),
    0,
    config.maxBossMaxHpRatio || 0.7,
  );
  const guard = hasTrait
    ? Math.min(config.maxGuard || 30, (isFull ? config.fullGuard || 15 : config.baseGuard || 8) + (overcapBonus.guard || 0))
    : 0;
  return {
    count: progress.count,
    fullCount: progress.fullCount,
    isFull,
    overcap: progress.overcap,
    delay: hasTrait ? config.baseDelay || 1 : 0,
    guard,
    bossMaxHpRatio,
    executesNormalEnemy: isFull,
  };
}

export function isTraitHighValueClear({ lines = 0, spinType = null, b2bActive = false, perfect = false } = {}) {
  if (lines <= 0) return false;
  const difficultClear = lines === 4 || Boolean(spinType);
  return Boolean(lines >= 4 || spinType || perfect || (difficultClear && b2bActive));
}

const UPGRADE_EFFECT_APPLIERS = {
  addUpgradeValue(effect, runtime) {
    runtime.state.upgrades[effect.key] += effect.value;
  },
  setUpgradeFlag(effect, runtime) {
    runtime.state.upgrades[effect.key] = effect.value;
  },
  setUpgradeMin(effect, runtime) {
    runtime.state.upgrades[effect.key] = Math.max(runtime.state.upgrades[effect.key], effect.value);
  },
  addStateValue(effect, runtime) {
    runtime.state[effect.key] += effect.value;
  },
  addGuard(effect, runtime) {
    runtime.state.guard = Math.min(runtime.getEffectiveMaxGuard(), runtime.state.guard + effect.value);
  },
  increasePlayerMaxHp(effect, runtime) {
    increasePlayerMaxHp(runtime.state, runtime.basePlayerMaxHp, effect.value, effect.healValue ?? effect.value);
  },
};

export const SUPPORTED_UPGRADE_EFFECT_TYPES = Object.freeze(Object.keys(UPGRADE_EFFECT_APPLIERS));

export function applyUpgradeEffect(upgrade, runtime) {
  const effects = Array.isArray(upgrade?.effects) ? upgrade.effects : [];
  for (const effect of effects) applyEffect(effect, runtime);
}

function applyEffect(effect, runtime) {
  const apply = UPGRADE_EFFECT_APPLIERS[effect.type];
  if (!apply) throw new Error(`Unknown upgrade effect type: ${effect.type}`);
  apply(effect, runtime);
}

function increasePlayerMaxHp(state, basePlayerMaxHp, amount, healAmount) {
  state.upgrades.maxHpBonus += amount;
  state.playerMaxHp = basePlayerMaxHp + state.upgrades.maxHpBonus;
  state.playerHp = Math.min(state.playerMaxHp, state.playerHp + healAmount);
}
