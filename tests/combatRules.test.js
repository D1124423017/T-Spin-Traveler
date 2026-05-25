import { describe, expect, it } from "vitest";
import {
  formatRotationKind,
  getBaseAttackRows,
  getComboAttackStyle,
  getHeroAttackStyle,
  getMoveRating,
  getRotationDamageBonus,
  isPlayerHpDefeated,
  shouldSettleRunRiftEnergy,
  shouldTriggerDefeat,
} from "../src/combat/combatRules.js";

describe("combat rule helpers", () => {
  it("calculates base attack rows by clear type", () => {
    expect(getBaseAttackRows(0, null)).toBe(0);
    expect(getBaseAttackRows(4, null)).toBe(4);
    expect(getBaseAttackRows(2, "full")).toBe(4);
  });

  it("selects combo and hero attack styles", () => {
    expect(getComboAttackStyle(1)).toBe("");
    expect(getComboAttackStyle(2)).toBe("combo1");
    expect(getComboAttackStyle(4)).toBe("combo3");
    expect(getHeroAttackStyle(0, null, true, 0, "")).toBe("ultimate");
    expect(getHeroAttackStyle(1, null, false, 0, "combo2")).toBe("combo2");
    expect(getHeroAttackStyle(4, null, false, 0, "")).toBe("melee");
    expect(getHeroAttackStyle(1, null, false, 0, "")).toBe("ranged");
  });

  it("formats rotation bonuses without global state", () => {
    expect(formatRotationKind("ccw")).toBe("Z");
    expect(getRotationDamageBonus(2, "T", "full", "cw")).toMatchObject({
      multiplier: 1,
      label: "T-CW SPIN",
    });
    expect(getRotationDamageBonus(1, "T", null, "180")).toMatchObject({
      multiplier: 1.2,
      label: "T 180 BONUS",
    });
  });

  it("rates moves from explicit combat context", () => {
    expect(getMoveRating(0, null, true)).toBe("PERFECT");
    expect(getMoveRating(2, null, false, { combo: 2 })).toBe("CLEAN");
    expect(getMoveRating(4, null, false)).toBe("BRUTAL");
    expect(getMoveRating(1, null, false, { b2bActive: true })).toBe("ARCANE");
  });

  it("keeps HP defeat checks explicit", () => {
    expect(isPlayerHpDefeated(1)).toBe(false);
    expect(isPlayerHpDefeated(0)).toBe(true);
    expect(isPlayerHpDefeated(-4)).toBe(true);
  });

  it("allows defeat from pause or upgrade overlays but not after finalization", () => {
    expect(shouldTriggerDefeat({ mode: "pause", runFinalized: false })).toBe(true);
    expect(shouldTriggerDefeat({ mode: "upgrade", runFinalized: false })).toBe(true);
    expect(shouldTriggerDefeat({ mode: "defeat", runFinalized: false })).toBe(false);
    expect(shouldTriggerDefeat({ mode: "victory", runFinalized: true })).toBe(false);
  });

  it("settles Rift Energy only once per run", () => {
    expect(shouldSettleRunRiftEnergy({ riftEnergySettled: false })).toBe(true);
    expect(shouldSettleRunRiftEnergy({ riftEnergySettled: true })).toBe(false);
  });
});
