import { describe, expect, it } from "vitest";
import { UPGRADES } from "../src/data/upgrades.js";
import {
  getSpecialBondCounts,
  getSpecialBondPreview,
  getSpecialBondTier,
  getSpecialUpgradeFamily,
  isSpecialUpgradeId,
} from "../src/combat/specialUpgrades.js";

function getUpgrade(id) {
  return UPGRADES.find((upgrade) => upgrade.id === id);
}

describe("special Angel / Devil upgrades", () => {
  it("replaces the old special cards with six new unique cards", () => {
    const ids = UPGRADES.map((upgrade) => upgrade.id);

    expect(ids).not.toContain("angel_card");
    expect(ids).not.toContain("devil_card");
    expect(ids).toEqual(expect.arrayContaining([
      "angel_halo_sanctuary",
      "angel_cleansing_prism",
      "angel_perfect_benediction",
      "devil_blood_moon_pact",
      "devil_abyss_chain",
      "devil_fallen_crown",
    ]));
  });

  it("counts unique Angel and Devil bond pieces", () => {
    const counts = getSpecialBondCounts([
      { id: "angel_halo_sanctuary" },
      { id: "angel_halo_sanctuary" },
      { id: "angel_cleansing_prism" },
      { id: "devil_blood_moon_pact" },
    ]);

    expect(counts).toEqual({ angel: 2, devil: 1 });
    expect(getSpecialBondTier("angel", counts)).toBe(2);
    expect(getSpecialBondTier("devil", counts)).toBe(1);
  });

  it("previews bond progress for a draft card", () => {
    const upgrade = getUpgrade("devil_abyss_chain");
    const preview = getSpecialBondPreview(upgrade, [{ id: "devil_blood_moon_pact" }]);

    expect(isSpecialUpgradeId(upgrade.id)).toBe(true);
    expect(getSpecialUpgradeFamily(upgrade).key).toBe("devil");
    expect(preview.before).toBe(1);
    expect(preview.after).toBe(2);
    expect(preview.activates).toBe(true);
  });
});
