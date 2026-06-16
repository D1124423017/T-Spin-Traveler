import { getEquippedEquipment } from "../core/equipmentProgress.js";
import { getEquipmentStatBonuses } from "../core/equipmentStats.js";

export function createEquipmentCombatState({ wave = 1 } = {}) {
  return {
    wave: safeWave(wave),
    firstTspinUsed: false,
    firstMultiLineGuardUsed: false,
    firstTspinGuardUsed: false,
    firstB2bDelayUsed: false,
    firstDifficultDelayUsed: false,
    guardBreakRetainUsed: false,
    fullBlockRestoreUsed: false,
    lowHpGuardDoubleUsed: false,
    lineAttackCount: 0,
    fatalSaveUsed: false,
  };
}

export function startEquipmentCombatWave(combatState = {}, wave = 1) {
  return {
    ...createEquipmentCombatState({ wave }),
    lineAttackCount: safeCount(combatState?.lineAttackCount),
    fatalSaveUsed: Boolean(combatState?.fatalSaveUsed),
  };
}

export function getEquipmentBattleStartGuard(progress = {}) {
  return getEquippedItems(progress).reduce((total, item) => (
    item.effect.type === "battleStartGuard"
      ? total + safeCount(item.effect.guard)
      : total
  ), 0);
}

export function resolveEquipmentAttack({
  progress = {},
  combatState = createEquipmentCombatState(),
  context = {},
} = {}) {
  const items = getEquippedItems(progress);
  const state = normalizeCombatState(combatState, context.wave);
  const lines = safeCount(context.lines);
  const isLineAttack = lines > 0;
  const isTspin = context.spinType === "full" || context.spinType === "mini";
  const isB2b = Boolean(context.b2bActive);
  const isPerfect = Boolean(context.perfect);
  const isUltimate = Boolean(context.ultimateActive);
  const isNormalAttack = isLineAttack
    && lines < 4
    && !isTspin
    && !isB2b
    && !isPerfect
    && !isUltimate;
  const nextState = {
    ...state,
    lineAttackCount: state.lineAttackCount + (isLineAttack ? 1 : 0),
  };
  let effectDamageBonus = 0;
  let guardBonus = 0;
  let enemyDelay = 0;

  for (const item of items) {
    const effect = item.effect;
    switch (effect.type) {
      case "lineAttackFlat":
        if (isLineAttack) effectDamageBonus += safeCount(effect.damage);
        break;
      case "normalAttackFlat":
        if (isNormalAttack) effectDamageBonus += safeCount(effect.damage);
        break;
      case "tspinDamageFlat":
        if (isTspin && isLineAttack) effectDamageBonus += safeCount(effect.damage);
        break;
      case "comboThreeGuard":
        if (isLineAttack && safeCount(context.combo) === safeCount(effect.comboThreshold)) {
          guardBonus += safeCount(effect.guard);
        }
        break;
      case "b2bDamageFlat":
        if (isLineAttack && isB2b) effectDamageBonus += safeCount(effect.damage);
        break;
      case "firstWaveTspinDamage":
        if (isLineAttack && isTspin && !nextState.firstTspinUsed) {
          effectDamageBonus += safeCount(effect.damage);
          nextState.firstTspinUsed = true;
        }
        break;
      case "perfectClearGuard":
        if (isLineAttack && isPerfect) guardBonus += safeCount(effect.guard);
        break;
      case "comboFourDamage":
        if (isLineAttack && safeCount(context.combo) >= safeCount(effect.comboThreshold)) {
          effectDamageBonus += safeCount(effect.damage);
        }
        break;
      case "allAndTspinDamage":
        if (isLineAttack) effectDamageBonus += safeCount(effect.allDamage);
        if (isLineAttack && isTspin) effectDamageBonus += safeCount(effect.tspinDamage);
        break;
      case "b2bTetrisDamage":
        if (isLineAttack && (isB2b || lines === 4)) {
          effectDamageBonus += safeCount(effect.damage);
        }
        break;
      case "fifthLineAttackDamage":
        if (
          isLineAttack
          && nextState.lineAttackCount % Math.max(1, safeCount(effect.attackInterval)) === 0
        ) {
          effectDamageBonus += safeCount(effect.damage);
        }
        break;
      case "ultimatePerfectDamage":
        if (isLineAttack && (isUltimate || isPerfect)) {
          effectDamageBonus += safeCount(effect.damage);
        }
        break;
      case "doubleDamageFlat":
        if (lines === 2) effectDamageBonus += safeCount(effect.damage);
        break;
      case "firstMultiLineGuard":
        if (
          isLineAttack
          && lines >= safeCount(effect.minimumLines)
          && !nextState.firstMultiLineGuardUsed
        ) {
          guardBonus += safeCount(effect.guard);
          nextState.firstMultiLineGuardUsed = true;
        }
        break;
      case "tetrisDamageFlat":
        if (lines === 4) effectDamageBonus += safeCount(effect.damage);
        break;
      case "comboThresholdDamage":
        if (isLineAttack && safeCount(context.combo) >= safeCount(effect.comboThreshold)) {
          effectDamageBonus += safeCount(effect.damage);
        }
        break;
      case "firstTspinGuard":
        if (isLineAttack && isTspin && !nextState.firstTspinGuardUsed) {
          guardBonus += safeCount(effect.guard);
          nextState.firstTspinGuardUsed = true;
        }
        break;
      case "tripleTetrisDamage":
        if (lines === 3 || lines === 4) effectDamageBonus += safeCount(effect.damage);
        break;
      case "firstB2bDelay":
        if (isLineAttack && isB2b && !nextState.firstB2bDelayUsed) {
          enemyDelay += safeCount(effect.delay);
          nextState.firstB2bDelayUsed = true;
        }
        break;
      case "perfectClearDamage":
        if (isLineAttack && isPerfect) effectDamageBonus += safeCount(effect.damage);
        break;
      case "firstDifficultDelay":
        if (
          isLineAttack
          && (lines === 4 || isTspin)
          && !nextState.firstDifficultDelayUsed
        ) {
          enemyDelay += safeCount(effect.delay);
          nextState.firstDifficultDelayUsed = true;
        }
        break;
      case "comboSixDamage":
        if (isLineAttack && safeCount(context.combo) >= safeCount(effect.comboThreshold)) {
          effectDamageBonus += safeCount(effect.damage);
        }
        break;
      default:
        break;
    }
  }

  const attackStatBonus = isLineAttack
    ? getEquipmentStatBonuses(progress).attackBonus
    : 0;
  return {
    combatState: nextState,
    attackStatBonus,
    effectDamageBonus,
    damageBonus: attackStatBonus + effectDamageBonus,
    guardBonus,
    enemyDelay,
  };
}

export function resolveEquipmentGuardImpact({
  progress = {},
  combatState = createEquipmentCombatState(),
  wave = 1,
  currentGuard = 0,
  maxGuard = 0,
  blocked = 0,
  incomingDamage = 0,
} = {}) {
  const state = normalizeCombatState(combatState, wave);
  const safeCurrentGuard = safeCount(currentGuard);
  const safeMaxGuard = Math.max(safeCurrentGuard, safeCount(maxGuard));
  const safeBlocked = Math.min(safeCurrentGuard, safeCount(blocked));
  const safeIncomingDamage = safeCount(incomingDamage);
  const nextState = { ...state };
  let guardAfter = Math.max(0, safeCurrentGuard - safeBlocked);
  let retainedGuard = 0;
  let restoredGuard = 0;

  for (const item of getEquippedItems(progress)) {
    const effect = item.effect;
    if (
      effect.type === "guardBreakRetain"
      && !nextState.guardBreakRetainUsed
      && safeCurrentGuard > 0
      && safeBlocked >= safeCurrentGuard
    ) {
      const gain = Math.min(
        Math.max(0, safeMaxGuard - guardAfter),
        safeCount(effect.guard),
      );
      guardAfter += gain;
      retainedGuard += gain;
      if (gain > 0) nextState.guardBreakRetainUsed = true;
    }
    if (
      effect.type === "fullBlockGuardRestore"
      && !nextState.fullBlockRestoreUsed
      && safeIncomingDamage > 0
      && safeBlocked >= safeIncomingDamage
    ) {
      const gain = Math.min(
        Math.max(0, safeMaxGuard - guardAfter),
        safeCount(effect.guard),
      );
      guardAfter += gain;
      restoredGuard += gain;
      if (gain > 0) nextState.fullBlockRestoreUsed = true;
    }
  }

  return {
    combatState: nextState,
    guardAfter,
    retainedGuard,
    restoredGuard,
  };
}

export function resolveEquipmentGuardGain({
  progress = {},
  combatState = createEquipmentCombatState(),
  wave = 1,
  currentHp = 0,
  maxHp = 0,
  currentGuard = 0,
  maxGuard = 0,
  baseGain = 0,
} = {}) {
  const state = normalizeCombatState(combatState, wave);
  const requestedBaseGain = safeCount(baseGain);
  const capacity = Math.max(0, safeCount(maxGuard) - safeCount(currentGuard));
  let multiplier = 1;
  let usesLowHpDouble = false;

  for (const item of getEquippedItems(progress)) {
    const effect = item.effect;
    if (effect.type !== "lowHpFirstGuardDouble" || state.lowHpGuardDoubleUsed) continue;
    const threshold = Math.max(0, Number(effect.hpThresholdPercent) || 0) / 100;
    const hpRatio = Number(maxHp) > 0 ? Number(currentHp) / Number(maxHp) : 1;
    if (requestedBaseGain > 0 && capacity > 0 && hpRatio < threshold) {
      multiplier = Math.max(multiplier, Number(effect.guardMultiplier) || 1);
      usesLowHpDouble = true;
    }
  }

  const gain = Math.min(capacity, Math.floor(requestedBaseGain * multiplier));
  return {
    combatState: {
      ...state,
      lowHpGuardDoubleUsed: state.lowHpGuardDoubleUsed || (usesLowHpDouble && gain > 0),
    },
    baseGain: requestedBaseGain,
    multiplier,
    gain,
  };
}

export function resolveEquipmentFatalHit({
  progress = {},
  combatState = createEquipmentCombatState(),
  wave = 1,
  currentHp = 0,
  damage = 0,
} = {}) {
  const state = normalizeCombatState(combatState, wave);
  const incomingDamage = safeCount(damage);
  if (incomingDamage < safeCount(currentHp) || state.fatalSaveUsed) {
    return {
      combatState: state,
      damage: incomingDamage,
      guardGain: 0,
      saved: false,
    };
  }

  const item = getEquippedItems(progress)
    .find(({ effect }) => effect.type === "fatalSaveOnce");
  if (!item) {
    return {
      combatState: state,
      damage: incomingDamage,
      guardGain: 0,
      saved: false,
    };
  }

  const retainedHp = Math.min(
    safeCount(currentHp),
    Math.max(1, safeCount(item.effect.hpRetained)),
  );
  return {
    combatState: {
      ...state,
      fatalSaveUsed: true,
    },
    damage: Math.max(0, safeCount(currentHp) - retainedHp),
    guardGain: safeCount(item.effect.guard),
    saved: true,
  };
}

function getEquippedItems(progress) {
  return Object.values(getEquippedEquipment(progress)).filter(Boolean);
}

function normalizeCombatState(combatState, wave) {
  const currentWave = safeWave(wave ?? combatState?.wave);
  if (safeWave(combatState?.wave) !== currentWave) {
    return startEquipmentCombatWave(combatState, currentWave);
  }
  return {
    wave: currentWave,
    firstTspinUsed: Boolean(combatState?.firstTspinUsed),
    firstMultiLineGuardUsed: Boolean(combatState?.firstMultiLineGuardUsed),
    firstTspinGuardUsed: Boolean(combatState?.firstTspinGuardUsed),
    firstB2bDelayUsed: Boolean(combatState?.firstB2bDelayUsed),
    firstDifficultDelayUsed: Boolean(combatState?.firstDifficultDelayUsed),
    guardBreakRetainUsed: Boolean(combatState?.guardBreakRetainUsed),
    fullBlockRestoreUsed: Boolean(combatState?.fullBlockRestoreUsed),
    lowHpGuardDoubleUsed: Boolean(combatState?.lowHpGuardDoubleUsed),
    lineAttackCount: safeCount(combatState?.lineAttackCount),
    fatalSaveUsed: Boolean(combatState?.fatalSaveUsed),
  };
}

function safeCount(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

function safeWave(value) {
  return Math.max(1, safeCount(value) || 1);
}
