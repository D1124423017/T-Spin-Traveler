import { describe, expect, it } from "vitest";
import { translations } from "../src/data/i18n.js";
import {
  createMetaAscensionEntryModel,
  createMetaUpgradeRowModels,
  getMetaUpgradeMessageText,
  getMetaAscensionEntryRect,
  getMetaUpgradeBackButtonRect,
  getMetaUpgradeRowRects,
} from "../src/ui/metaUpgradeScreen.js";

describe("meta upgrade UI", () => {
  it("keeps the ascension prompt separate from upgrade rows and the back button", () => {
    const rows = getMetaUpgradeRowRects();
    const ascension = getMetaAscensionEntryRect();
    const back = getMetaUpgradeBackButtonRect();

    expect(rows.guard.y + rows.guard.h).toBeLessThanOrEqual(ascension.y);
    expect(ascension.x + ascension.w).toBeLessThan(back.x);
  });

  it("provides stage and locked ascension copy in both languages", () => {
    for (const language of ["zh", "en"]) {
      expect(translations[language].metaUpgradeStage).toBeTruthy();
      expect(translations[language].metaAscensionTitle).toBeTruthy();
      expect(translations[language].metaAscensionUnlockRequirement).toBeTruthy();
      expect(translations[language].metaAscensionCapRule).toBeTruthy();
      expect(translations[language].metaAscensionLocked).toBeTruthy();
      expect(translations[language].metaAscensionLockedHint).toBeTruthy();
      expect(translations[language].metaAscensionReady).toBeTruthy();
      expect(translations[language].ascensionChallengeGoal).toContain("{lines}");
      expect(translations[language].ascensionChallengeTimeHud).toContain("{seconds}");
      expect(translations[language].ascensionChallengeSuccessTitle).toBeTruthy();
      expect(translations[language].ascensionChallengeFailedTitle).toBeTruthy();
    }
  });

  it("builds capped row and locked ascension display models without mutating progress", () => {
    const progress = {
      ascensionTier: 0,
      completedAscensions: [],
      riftEnergy: 999,
      metaUpgrades: {
        hpLevel: 10,
        attackLevel: 9,
        guardLevel: 8,
      },
    };
    const snapshot = structuredClone(progress);
    const rows = createMetaUpgradeRowModels(progress);
    const hp = rows.find((row) => row.def.id === "hp");
    const attack = rows.find((row) => row.def.id === "attack");
    const ascension = createMetaAscensionEntryModel(progress);

    expect(hp).toMatchObject({ level: 10, maxLevel: 10, cost: null, maxed: true, canBuy: false });
    expect(attack).toMatchObject({ level: 9, maxLevel: 10, cost: 650, maxed: false, canBuy: true });
    expect(ascension).toMatchObject({ unlocked: false, completed: false, statusKey: "metaAscensionLocked" });
    expect(progress).toEqual(snapshot);
  });

  it("formats only active meta upgrade messages", () => {
    const format = (key, vars) => `${key}:${vars.name || ""}`;
    expect(getMetaUpgradeMessageText(
      { key: "metaUpgradePurchased", vars: { name: "HP" }, until: 200 },
      { format, now: 100 },
    )).toBe("metaUpgradePurchased:HP");
    expect(getMetaUpgradeMessageText(
      { key: "metaUpgradePurchased", vars: { name: "HP" }, until: 200 },
      { format, now: 201 },
    )).toBe("");
  });
});
