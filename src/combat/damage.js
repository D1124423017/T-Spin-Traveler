export const LINE_DAMAGE = Object.freeze([0, 10, 25, 45, 70]);
export const SPIN_DAMAGE_BY_LINES = Object.freeze([0, 35, 85, 115, 150]);
export const ATTACK_ROW_DAMAGE = 15;
export const PERFECT_CLEAR_BASE_DAMAGE = 90;
export const DEFAULT_DAMAGE_SOURCE_KEYS = Object.freeze(["base", "spin", "combo", "b2b", "perfect", "weakness", "upgrade"]);

export function makeDamageSourceMap(keys = DEFAULT_DAMAGE_SOURCE_KEYS) {
  return Object.fromEntries(keys.map((key) => [key, 0]));
}

export function addDamagePart(parts, sources, key, value, source) {
  if (!value) return;
  parts.push({ key, value, source });
  if (source && sources[source] !== undefined) sources[source] += value;
}

export function getComboAttackRows(combo) {
  if (combo < 3) return 0;
  return Math.floor((combo - 1) / 2);
}

export function getComboMilestoneDamage(combo, milestoneEvery = 5, milestoneDamage = 50) {
  if (combo < milestoneEvery) return 0;
  return Math.floor(combo / milestoneEvery) * milestoneDamage;
}

export function getEffectiveClearLines(lines, spinType) {
  if (lines <= 0) return 0;
  return lines * (spinType ? 2 : 1);
}

export function calculateDamage(context = {}, snapshot = {}) {
  const lines = context.lines || 0;
  const pieceType = context.pieceType || "";
  const spinType = context.spinType || null;
  const combo = snapshot.combo || 0;
  const b2bActive = Boolean(snapshot.b2bActive);
  const perfect = Boolean(snapshot.perfect);
  const upgrades = snapshot.upgrades || {};
  const balance = snapshot.balance || {};
  const enemy = snapshot.enemy || {};
  const parts = [];
  const sources = makeDamageSourceMap(snapshot.damageSourceKeys || DEFAULT_DAMAGE_SOURCE_KEYS);

  const isTSpin = spinType === "full";
  const isTSpinMini = spinType === "mini";
  const isAllSpinMini = spinType === "all-mini";
  const isDifficultClear = lines === 4 || (spinType && lines > 0);
  const b2bAttackRows = isDifficultClear && b2bActive ? 1 : 0;
  const comboAttackRows = getComboAttackRows(combo);
  const comboMilestoneBonus = getComboMilestoneDamage(
    combo,
    balance.comboMilestoneEvery || 5,
    balance.comboMilestoneDamage || 50,
  );

  let damage = spinType && lines > 0 ? (SPIN_DAMAGE_BY_LINES[lines] || 0) : (LINE_DAMAGE[lines] || 0);
  addDamagePart(parts, sources, "damageBase", damage, spinType ? "spin" : "base");

  const lineDamage = lines > 0 ? upgrades.lineDamage || 0 : 0;
  damage += lineDamage;
  addDamagePart(parts, sources, "damageLineBonus", lineDamage, "upgrade");

  if (lines > 0 && pieceType === "T" && !spinType) {
    damage += 10;
    addDamagePart(parts, sources, "damageTBonus", 10, "spin");
  }
  if (lines > 0 && (isTSpin || isTSpinMini)) {
    damage += upgrades.tspinBonus || 0;
    addDamagePart(parts, sources, "damageTBonus", upgrades.tspinBonus || 0, "upgrade");
  }
  if (lines > 0 && spinType) {
    damage += upgrades.spinBonus || 0;
    addDamagePart(parts, sources, "damageSpinBonus", upgrades.spinBonus || 0, "upgrade");
  }
  if (lines > 0 && isAllSpinMini) {
    damage += upgrades.allSpinBonus || 0;
    addDamagePart(parts, sources, "damageAllSpinBonus", upgrades.allSpinBonus || 0, "upgrade");
  }

  const comboBonus = comboAttackRows * ATTACK_ROW_DAMAGE;
  if (lines > 0) {
    damage += comboBonus;
    addDamagePart(parts, sources, "damageCombo", comboBonus, "combo");
    damage += comboMilestoneBonus;
    addDamagePart(parts, sources, "damageComboBurst", comboMilestoneBonus, "combo");
  }

  const b2bBonus = b2bAttackRows * ATTACK_ROW_DAMAGE + (b2bAttackRows > 0 ? upgrades.b2bBonus || 0 : 0);
  damage += b2bBonus;
  addDamagePart(parts, sources, "damageB2B", b2bBonus, "b2b");

  if (perfect) {
    damage += PERFECT_CLEAR_BASE_DAMAGE;
    addDamagePart(parts, sources, "damagePerfect", PERFECT_CLEAR_BASE_DAMAGE, "perfect");
  }

  const multipliers = [];
  if (lines === 1 && enemy.armorSingle && !perfect) {
    damage = Math.floor(damage * enemy.armorSingle);
    multipliers.push({ key: "floaterArmored", value: `x${enemy.armorSingle}` });
  }

  return {
    damage,
    parts,
    sources,
    multipliers,
    combo,
    comboAttackRows,
    comboMilestoneBonus,
    b2bAttackRows,
    b2bBonus,
    isDifficultClear,
    effectiveLines: getEffectiveClearLines(lines, spinType),
  };
}
