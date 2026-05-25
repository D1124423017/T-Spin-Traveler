import { describe, expect, it } from "vitest";
import {
  getTraitDetailTitle,
  getTraitHudLabel,
  getTraitProgressStatusText,
} from "../src/ui/traitPanel.js";

const format = (key, vars = {}) => ({
  traitFull: "Full Trait",
  traitOvercapCount: `Overcap +${vars.count}`,
}[key] || key);

const translate = (key) => ({
  "traitHud.defense": "Def",
  "traitHud.bossKiller": "Boss",
}[key] || key);

describe("trait panel display helpers", () => {
  it("shows count, full, and overcap status", () => {
    const options = { format, getFullCount: () => 6 };

    expect(getTraitProgressStatusText({ tag: "Spin", count: 3 }, options)).toBe("3/6");
    expect(getTraitProgressStatusText({ tag: "Spin", count: 6, isFull: true }, options)).toBe("Full Trait");
    expect(getTraitProgressStatusText({ tag: "Spin", count: 8, isFull: true, overcap: 2 }, options)).toBe("Overcap +2");
  });

  it("builds detail titles without knowing game state", () => {
    expect(getTraitDetailTitle({
      tag: "Spin",
      label: "Spin",
      count: 8,
      fullCount: 6,
      isFull: true,
      overcap: 2,
    }, { format, getFullCount: () => 6 })).toBe("Spin 8/6 Overcap +2");
  });

  it("uses localized HUD label keys with fallback", () => {
    expect(getTraitHudLabel({ tag: "Defense", label: "Defense" }, { translate })).toBe("Def");
    expect(getTraitHudLabel({ tag: "Boss Killer", label: "Boss Killer" }, { translate })).toBe("Boss");
    expect(getTraitHudLabel({ tag: "Unknown", label: "Mystery" }, { translate })).toBe("Mystery");
  });
});
