import { describe, expect, it } from "vitest";
import { translations } from "../src/data/i18n.js";
import {
  getMetaAscensionEntryRect,
  getMetaUpgradeBackButtonRect,
  getMetaUpgradeRowRects,
} from "../src/ui/hudLayout.js";

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
});
