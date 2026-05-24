import { describe, expect, it } from "vitest";
import { calculateDamage } from "../src/combat/damage.js";

const baseSnapshot = {
  combo: 0,
  b2bActive: false,
  perfect: false,
  upgrades: {},
  enemy: {},
  balance: { comboMilestoneEvery: 5, comboMilestoneDamage: 50 },
};

describe("damage calculation", () => {
  it("calculates line clear damage", () => {
    expect(calculateDamage({ lines: 1 }, baseSnapshot).damage).toBe(10);
    expect(calculateDamage({ lines: 2 }, baseSnapshot).damage).toBe(25);
    expect(calculateDamage({ lines: 3 }, baseSnapshot).damage).toBe(45);
    expect(calculateDamage({ lines: 4 }, baseSnapshot).damage).toBe(70);
  });

  it("gives T-Spins more damage than regular line clears", () => {
    const single = calculateDamage({ lines: 1, pieceType: "I" }, baseSnapshot).damage;
    const tSpin = calculateDamage({ lines: 1, pieceType: "T", spinType: "full" }, baseSnapshot).damage;

    expect(tSpin).toBeGreaterThan(single);
  });

  it("adds combo, B2B, and Perfect Clear damage", () => {
    expect(calculateDamage({ lines: 2 }, { ...baseSnapshot, combo: 3 }).damage).toBeGreaterThan(25);
    expect(calculateDamage({ lines: 4 }, { ...baseSnapshot, b2bActive: true }).damage).toBeGreaterThan(70);
    expect(calculateDamage({ lines: 4 }, { ...baseSnapshot, perfect: true }).damage).toBeGreaterThan(70);
  });
});
