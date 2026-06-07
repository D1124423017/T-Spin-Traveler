import { describe, expect, it } from "vitest";
import {
  LEGACY_META_PROGRESS_STORAGE_KEY,
  META_PROGRESS_SCHEMA_VERSION,
  META_PROGRESS_STORAGE_KEY,
  META_UPGRADE_DEFS,
  buyMetaUpgrade,
  calculateRiftEnergyEarned,
  getMetaBonuses,
  getMetaUpgradeCost,
  loadMetaProgress,
  normalizeMetaProgress,
  saveMetaProgress,
} from "../src/core/metaProgress.js";

function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    snapshot: () => Object.fromEntries(values),
  };
}

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
    expect(META_UPGRADE_DEFS.hp.costs.slice(0, 10)).toEqual([50, 75, 100, 125, 150, 200, 250, 300, 375, 450]);
    expect(META_UPGRADE_DEFS.attack.costs.slice(0, 10)).toEqual([60, 90, 120, 160, 200, 260, 320, 400, 500, 650]);
    expect(META_UPGRADE_DEFS.guard.costs.slice(0, 10)).toEqual([50, 75, 100, 125, 150, 200, 250, 300, 375, 450]);
    expect(getMetaUpgradeCost("hp", 0)).toBe(50);
    expect(getMetaUpgradeCost("hp", 10)).toBeNull();
  });

  it("extends costs for levels 11 through 20 without changing the first tier", () => {
    const tierTwo = {
      ascensionTier: 1,
      metaUpgrades: { hpLevel: 10, attackLevel: 10, guardLevel: 10 },
    };

    expect(META_UPGRADE_DEFS.hp.costs.slice(10)).toEqual([
      550, 675, 825, 1000, 1200, 1450, 1750, 2100, 2500, 3000,
    ]);
    expect(META_UPGRADE_DEFS.attack.costs.slice(10)).toEqual([
      800, 975, 1175, 1400, 1675, 2000, 2400, 2850, 3400, 4050,
    ]);
    expect(getMetaUpgradeCost("hp", 10, tierTwo)).toBe(550);
    expect(getMetaUpgradeCost("attack", 10, tierTwo)).toBe(800);
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

  it("allows purchasing levels 11 through 20 after ascension without resetting other upgrades", () => {
    let progress = {
      schemaVersion: 2,
      ascensionTier: 1,
      completedAscensions: ["ascension-tier-2"],
      riftEnergy: 100000,
      metaUpgrades: { hpLevel: 10, attackLevel: 10, guardLevel: 10 },
    };

    for (let level = 11; level <= 20; level += 1) {
      const result = buyMetaUpgrade(progress, "hp");
      expect(result).toMatchObject({ ok: true, level });
      progress = result.progress;
    }

    expect(progress.metaUpgrades).toEqual({
      hpLevel: 20,
      attackLevel: 10,
      guardLevel: 10,
    });
    expect(buyMetaUpgrade(progress, "hp")).toMatchObject({
      ok: false,
      reason: "maxed",
    });
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

describe("meta progress v2 migration", () => {
  it("defaults new progress to schema v2 and ascension tier zero", () => {
    expect(normalizeMetaProgress()).toEqual({
      schemaVersion: META_PROGRESS_SCHEMA_VERSION,
      ascensionTier: 0,
      completedAscensions: [],
      riftEnergy: 0,
      metaUpgrades: { hpLevel: 0, attackLevel: 0, guardLevel: 0 },
    });
  });

  it("migrates a v1 save without clearing progress and keeps the legacy key", () => {
    const legacyProgress = {
      riftEnergy: 8253,
      metaUpgrades: { hpLevel: 10, attackLevel: 7, guardLevel: 4 },
    };
    const storage = createMemoryStorage({
      [LEGACY_META_PROGRESS_STORAGE_KEY]: JSON.stringify(legacyProgress),
    });

    expect(loadMetaProgress(storage)).toEqual({
      schemaVersion: META_PROGRESS_SCHEMA_VERSION,
      ascensionTier: 0,
      completedAscensions: [],
      riftEnergy: 8253,
      metaUpgrades: { hpLevel: 10, attackLevel: 7, guardLevel: 4 },
    });

    const snapshot = storage.snapshot();
    expect(JSON.parse(snapshot[LEGACY_META_PROGRESS_STORAGE_KEY])).toEqual(legacyProgress);
    expect(JSON.parse(snapshot[META_PROGRESS_STORAGE_KEY])).toMatchObject({
      schemaVersion: META_PROGRESS_SCHEMA_VERSION,
      ascensionTier: 0,
      riftEnergy: 8253,
      metaUpgrades: { hpLevel: 10, attackLevel: 7, guardLevel: 4 },
    });
  });

  it("supports legacy top-level upgrade levels during migration", () => {
    expect(normalizeMetaProgress({
      riftEnergy: 90,
      hpLevel: 6,
      attackLevel: 5,
      guardLevel: 4,
    })).toMatchObject({
      riftEnergy: 90,
      metaUpgrades: { hpLevel: 6, attackLevel: 5, guardLevel: 4 },
    });
  });

  it("preserves existing levels when an ascension raises the cap", () => {
    expect(normalizeMetaProgress({
      schemaVersion: 2,
      ascensionTier: 1,
      completedAscensions: ["ascension-tier-2"],
      metaUpgrades: { hpLevel: 10, attackLevel: 14, guardLevel: 20 },
    })).toMatchObject({
      ascensionTier: 1,
      completedAscensions: ["ascension-tier-2"],
      metaUpgrades: { hpLevel: 10, attackLevel: 14, guardLevel: 20 },
    });
  });

  it("saves v2 progress without overwriting the v1 backup", () => {
    const storage = createMemoryStorage({
      [LEGACY_META_PROGRESS_STORAGE_KEY]: JSON.stringify({ riftEnergy: 12 }),
    });

    saveMetaProgress({
      ascensionTier: 1,
      completedAscensions: ["ascension-tier-2"],
      riftEnergy: 34,
      metaUpgrades: { hpLevel: 10, attackLevel: 10, guardLevel: 10 },
    }, storage);

    const snapshot = storage.snapshot();
    expect(JSON.parse(snapshot[LEGACY_META_PROGRESS_STORAGE_KEY])).toEqual({ riftEnergy: 12 });
    expect(JSON.parse(snapshot[META_PROGRESS_STORAGE_KEY])).toMatchObject({
      schemaVersion: 2,
      ascensionTier: 1,
      riftEnergy: 34,
    });
  });
});
