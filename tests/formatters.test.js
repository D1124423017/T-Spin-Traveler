import { describe, expect, it } from "vitest";
import {
  formatControlKey,
  formatDamageSources,
  formatMetaUpgradeEffect,
} from "../src/ui/formatters.js";

const translate = (key) => ({
  damageBase: "Base",
  enemyInfoWeakness: "Weak",
  summaryUpgradeSource: "Upgrade",
}[key] || key);

const format = (key, values) => `${key}:${values.value}`;

describe("ui formatters", () => {
  it("formats top damage sources with localized labels", () => {
    expect(formatDamageSources({
      base: 10,
      spin: 25,
      combo: 12,
      weakness: 4,
      upgrade: 8,
    }, { translate })).toBe("Spin 25 / Combo 12 / Base 10 / Upgrade 8");
    expect(formatDamageSources({}, { translate })).toBe("-");
  });

  it("formats meta upgrade effects by upgrade id", () => {
    expect(formatMetaUpgradeEffect({ id: "hp", valuePerLevel: 5 }, 2, { format })).toBe("metaUpgradeHpEffect:10");
    expect(formatMetaUpgradeEffect({ id: "unknown", valuePerLevel: 3 }, 2, { format })).toBe("+6");
    expect(formatMetaUpgradeEffect({ id: "guard", valuePerLevel: 2 }, -1, { format })).toBe("metaUpgradeGuardEffect:0");
  });

  it("formats keyboard controls", () => {
    expect(formatControlKey("arrowleft")).toBe("←");
    expect(formatControlKey(" ")).toBe("SPACE");
    expect(formatControlKey("a")).toBe("A");
    expect(formatControlKey("escape")).toBe("ESC");
  });
});
