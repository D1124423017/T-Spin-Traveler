import { describe, expect, it } from "vitest";
import {
  buildDamageEquation,
  damageSourceColor,
  getDamageEquationTerms,
} from "../src/ui/combatReadout.js";

const translate = (key) => ({
  damageEquationHint: "formula hint",
  damageBase: "Base",
  damageSpinBonus: "Spin",
  damageMultiplier: "Multiplier",
  dmgShort: "DMG",
}[key] || key);

describe("combat readout helpers", () => {
  it("builds localized equation terms", () => {
    const breakdown = {
      total: 42,
      parts: [
        { key: "damageBase", value: 10, source: "base" },
        { key: "damageSpinBonus", value: 20, source: "spin" },
      ],
      multipliers: [
        { key: "damageMultiplier", value: "x1.20" },
      ],
    };

    expect(getDamageEquationTerms(breakdown, { translate })).toMatchObject([
      { text: "Base +10", color: "#b9c2ff" },
      { text: "Spin +20", color: "#d7c2ff" },
      { text: "Multiplier x1.20", source: "multiplier" },
    ]);
    expect(buildDamageEquation(breakdown, { translate })).toBe("Base +10 + Spin +20 × Multiplier x1.20 = 42 DMG");
  });

  it("supports empty and compact output", () => {
    const breakdown = {
      total: 100,
      parts: Array.from({ length: 7 }, (_, index) => ({ key: "damageBase", value: index + 1, source: "base" })),
      multipliers: [],
    };

    expect(buildDamageEquation(null, { translate })).toBe("formula hint");
    expect(buildDamageEquation(breakdown, { translate, compact: true })).toContain("+...");
  });

  it("maps damage source colors", () => {
    expect(damageSourceColor("combo")).toBe("#7ef7ff");
    expect(damageSourceColor("unknown")).toBe("#f5f1e6");
  });
});
