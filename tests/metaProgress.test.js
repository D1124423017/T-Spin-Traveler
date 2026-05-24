import { describe, expect, it } from "vitest";
import {
  META_UPGRADE_DEFS,
  buyMetaUpgrade,
  calculateRiftEnergyEarned,
  getMetaBonuses,
  getMetaUpgradeCost,
  normalizeMetaProgress,
} from "../src/core/metaProgress.js";

describe("rift energy rewards", () => {
  it("uses the configured reward formula", () => {
    expect(calculateRiftEnergyEarned({
      waveReached: 12,
      normalEnemyKills: 9,
      bossKills: 1,
      perfectClearCount: 2,
      spinCount: 7,
      maxCombo: 11,
    })).toBe(181);
  });

  it("rewards more normal enemy kills, boss kills, and wave progress", () => {
    const baseline = calculateRiftEnergyEarned({ waveReached: 3, normalEnemyKills: 1 });
    expect(calculateRiftEnergyEarned({ waveReached: 3, normalEnemyKills: 2 })).toBeGreaterThan(baseline);
    expect(calculateRiftEnergyEarned({ waveReached: 10, bossKills: 1 })).toBeGreaterThan(
      calculateRiftEnergyEarned({ waveReached: 10, normalEnemyKills: 1 }),
    );
    expect(calculateRiftEnergyEarned({ waveReached: 12, normalEnemyKills: 1 })).toBeGreaterThan(
      calculateRiftEnergyEarned({ waveReached: 3, normalEnemyKills: 1 }),
    );
  });
});

describe("meta upgrades", () => {
  it("keeps cost tables stable", () => {
    expect(META_UPGRADE_DEFS.hp.costs).toEqual([50, 75, 100, 125, 150, 200, 250, 300, 375, 450]);
    expect(META_UPGRADE_DEFS.attack.costs).toEqual([60, 90, 120, 160, 200, 260, 320, 400, 500, 650]);
    expect(META_UPGRADE_DEFS.guard.costs).toEqual([50, 75, 100, 125, 150, 200, 250, 300, 375, 450]);
    expect(getMetaUpgradeCost("hp", 0)).toBe(50);
    expect(getMetaUpgradeCost("hp", 10)).toBeNull();
  });

  it("does not allow max level overflow", () => {
    const progress = normalizeMetaProgress({
      riftEnergy: 9999,
      metaUpgrades: { hpLevel: 99, attackLevel: 99, guardLevel: 99 },
    });

    expect(progress.metaUpgrades.hpLevel).toBe(10);
    expect(progress.metaUpgrades.attackLevel).toBe(10);
    expect(progress.metaUpgrades.guardLevel).toBe(10);
    expect(buyMetaUpgrade(progress, "hp")).toMatchObject({ ok: false, reason: "maxed" });
  });

  it("blocks purchases when Rift Energy is insufficient", () => {
    const result = buyMetaUpgrade({
      riftEnergy: 49,
      metaUpgrades: { hpLevel: 0, attackLevel: 0, guardLevel: 0 },
    }, "hp");

    expect(result).toMatchObject({ ok: false, reason: "notEnough", cost: 50 });
    expect(result.progress.metaUpgrades.hpLevel).toBe(0);
    expect(result.progress.riftEnergy).toBe(49);
  });

  it("spends Rift Energy and increases the selected level", () => {
    const result = buyMetaUpgrade({
      riftEnergy: 75,
      metaUpgrades: { hpLevel: 0, attackLevel: 0, guardLevel: 0 },
    }, "hp");

    expect(result).toMatchObject({ ok: true, cost: 50, level: 1 });
    expect(result.progress.riftEnergy).toBe(25);
    expect(result.progress.metaUpgrades.hpLevel).toBe(1);
  });

  it("calculates permanent HP, attack, and Guard bonuses", () => {
    expect(getMetaBonuses({
      riftEnergy: 0,
      metaUpgrades: { hpLevel: 3, attackLevel: 4, guardLevel: 2 },
    })).toEqual({
      hpBonus: 15,
      attackPercent: 8,
      attackMultiplier: 1.08,
      guardBonus: 6,
    });
  });
});
