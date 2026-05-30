export function getBaseAttackRows(lines, spinType) {
  if (lines <= 0) return 0;
  if (spinType) return [0, 2, 4, 6, 8][lines] || 0;
  return [0, 0, 1, 2, 4][lines] || 0;
}

export function getComboAttackStyle(combo) {
  if (combo < 2) return "";
  return `combo${((combo - 2) % 3) + 1}`;
}

export function getHeroAttackStyle(lines, spinType, perfectClear, b2bBonus, comboAttackStyle = "") {
  if (perfectClear) return "ultimate";
  if (!perfectClear && comboAttackStyle) return comboAttackStyle;
  if (spinType || b2bBonus > 0 || lines >= 4) return "melee";
  if (lines > 0) return "ranged";
  return "ranged";
}

export function formatRotationKind(kind) {
  if (kind === "180") return "180";
  if (kind === "ccw") return "Z";
  return "CW";
}

export function getRotationDamageBonus(lines, pieceType, spinType, rotationKind) {
  if (lines <= 0 || !rotationKind) return { multiplier: 1, label: "", color: "#f8f3cf" };
  if (spinType === "full") {
    return { multiplier: 1, label: `T-${formatRotationKind(rotationKind)} SPIN`, color: "#f2d36b" };
  }
  if (spinType === "mini") {
    return { multiplier: 1, label: `MINI ${formatRotationKind(rotationKind)} SPIN`, color: "#d7c2ff" };
  }
  if (spinType === "all-mini") {
    return { multiplier: 1, label: `${pieceType}-${formatRotationKind(rotationKind)} SPIN`, color: "#9df7da" };
  }
  if (pieceType === "T") {
    return { multiplier: rotationKind === "180" ? 1.2 : rotationKind === "ccw" ? 1.14 : 1.1, label: `T ${formatRotationKind(rotationKind)} BONUS`, color: "#c7a7ff" };
  }
  if (rotationKind === "180") return { multiplier: 1.15, label: "180 STRIKE x1.15", color: "#fff0a6" };
  if (rotationKind === "ccw") return { multiplier: 1.08, label: "Z ROT BONUS x1.08", color: "#9fb4ff" };
  return { multiplier: 1.05, label: "ROT BONUS x1.05", color: "#9df7da" };
}

export function getMoveRating(lines, spinType, perfect, { b2bActive = false, combo = 0 } = {}) {
  if (perfect) return "PERFECT";
  if (spinType === "full" || b2bActive) return "ARCANE";
  if (lines >= 4 || spinType || combo >= 4) return "BRUTAL";
  if (lines >= 2 || combo >= 2) return "CLEAN";
  return "GOOD";
}

export function isPlayerHpDefeated(playerHp) {
  return Number(playerHp) <= 0;
}

export function getDefeatSafetyResult({
  mode = "playing",
  runFinalized = false,
  playerHp = 1,
  spawnBlocked = false,
} = {}) {
  if (mode !== "playing" || runFinalized) {
    return { defeated: false, messageKey: "", reason: "", playerHp };
  }

  if (isPlayerHpDefeated(playerHp)) {
    return {
      defeated: true,
      messageKey: "messagePlayerDefeat",
      reason: "playerHp",
      playerHp: 0,
    };
  }

  if (spawnBlocked) {
    return {
      defeated: true,
      messageKey: "messageSpawnTop",
      reason: "spawnBlocked",
      playerHp,
    };
  }

  return { defeated: false, messageKey: "", reason: "", playerHp };
}

export function shouldTriggerDefeat({ mode = "playing", runFinalized = false } = {}) {
  return mode !== "defeat" && mode !== "victory" && !runFinalized;
}

export function shouldSettleRunRiftEnergy(runStats = {}) {
  return !runStats?.riftEnergySettled;
}
