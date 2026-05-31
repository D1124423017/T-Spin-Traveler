import { describe, expect, it } from "vitest";
import {
  clampUpgradeSelectionIndex,
  getNextUpgradeSelectionIndex,
} from "../src/ui/upgradeCards.js";
import { translations } from "../src/data/i18n.js";

describe("upgrade card selection helpers", () => {
  it("clamps the selected card index to available choices", () => {
    expect(clampUpgradeSelectionIndex(-1, 3)).toBe(0);
    expect(clampUpgradeSelectionIndex(0, 3)).toBe(0);
    expect(clampUpgradeSelectionIndex(2, 3)).toBe(2);
    expect(clampUpgradeSelectionIndex(3, 3)).toBe(2);
    expect(clampUpgradeSelectionIndex(1, 0)).toBe(0);
  });

  it("moves selection with clamp semantics", () => {
    expect(getNextUpgradeSelectionIndex(1, -1, 3)).toBe(0);
    expect(getNextUpgradeSelectionIndex(1, 1, 3)).toBe(2);
    expect(getNextUpgradeSelectionIndex(0, -1, 3)).toBe(0);
    expect(getNextUpgradeSelectionIndex(2, 1, 3)).toBe(2);
  });

  it("localizes the keyboard upgrade picker hint", () => {
    expect(translations.zh.upgradeHelp).toBe("← / → 選擇　Space 確認　1 / 2 / 3 快速選擇");
    expect(translations.en.upgradeHelp).toBe("← / → Select   Space Confirm   1 / 2 / 3 Quick Pick");
  });
});
