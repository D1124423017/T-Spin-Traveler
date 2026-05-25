import { describe, expect, it } from "vitest";
import {
  buildTagLabel,
  getAcquiredRelicGroups,
  getCurrentBuildFamilyStats,
  getTraitBonus,
  getTraitChangeHintsForUpgrade,
  getTraitCount,
  getTraitEffectText,
  getTraitEntries,
  getUpgradeById,
} from "../src/combat/buildStats.js";

const translate = (key) => ({
  "tag.spin": "Spin",
  "tag.combo": "Combo",
  "tag.burst": "Burst",
  "tag.perfect": "Perfect",
  "traitEffect.spin.1": "Spin stage 1",
  traitEffectNone: "None",
}[key] || key);

describe("build and trait stats helpers", () => {
  it("groups acquired upgrades and keeps duplicate counts", () => {
    const groups = getAcquiredRelicGroups([
      { id: "tspin_amp", rarity: "rare" },
      { id: "tspin_amp", rarity: "rare" },
      { id: "combo_clock", rarity: "common" },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups.find((group) => group.id === "tspin_amp")).toMatchObject({
      count: 2,
      tags: ["Spin"],
    });
    expect(groups.find((group) => group.id === "combo_clock")).toMatchObject({
      count: 1,
      tags: ["Combo", "Utility"],
    });
  });

  it("builds localized family stats from grouped upgrades", () => {
    const groups = getAcquiredRelicGroups([
      { id: "tspin_amp" },
      { id: "spin_circuit" },
      { id: "combo_clock" },
    ]);
    const stats = getCurrentBuildFamilyStats(groups, { translate });

    expect(stats[0]).toMatchObject({ label: "Spin", count: 2 });
    expect(stats.some((stat) => stat.label === "Combo" && stat.count === 1)).toBe(true);
  });

  it("creates trait entries, counts, and stage bonuses", () => {
    const groups = getAcquiredRelicGroups([
      { id: "tspin_amp" },
      { id: "spin_circuit" },
      { id: "combo_clock" },
    ]);
    const traits = getTraitEntries(groups, { translate });
    const spin = traits.find((trait) => trait.tag === "Spin");

    expect(getTraitCount("Spin", groups)).toBe(2);
    expect(getTraitBonus("Spin", [6, 12, 20], groups)).toBe(6);
    expect(spin).toMatchObject({
      label: "Spin",
      count: 2,
      stage: 1,
      active: true,
    });
    expect(getTraitEffectText(spin, translate)).toBe("Spin stage 1");
  });

  it("returns progress, upgrade, and overcap hints", () => {
    const noSpinGroups = getAcquiredRelicGroups([]);
    expect(getTraitChangeHintsForUpgrade(getUpgradeById("tspin_amp"), noSpinGroups, { translate })[0]).toMatchObject({
      type: "progress",
      tag: "Spin",
      remaining: 1,
    });

    const oneSpinGroups = getAcquiredRelicGroups([{ id: "tspin_amp" }]);
    expect(getTraitChangeHintsForUpgrade(getUpgradeById("spin_circuit"), oneSpinGroups, { translate })[0]).toMatchObject({
      type: "activate",
      tag: "Spin",
      count: 2,
    });

    const fullSpinGroups = getAcquiredRelicGroups([
      { id: "tspin_amp" },
      { id: "tspin_amp" },
      { id: "tspin_amp" },
      { id: "tspin_amp" },
      { id: "tspin_amp" },
      { id: "tspin_amp" },
    ]);
    expect(getTraitChangeHintsForUpgrade(getUpgradeById("spin_circuit"), fullSpinGroups, { translate })[0]).toMatchObject({
      type: "overcap",
      tag: "Spin",
      overcap: 1,
    });
  });

  it("falls back to raw tag names when translations are missing", () => {
    expect(buildTagLabel("Perfect", (key) => key)).toBe("Perfect");
  });
});
