import { describe, expect, it } from "vitest";
import {
  clampUpgradeSelectionIndex,
  getUpgradeCardContentLayout,
  getUpgradeCardRect,
  getUpgradeDetailToggleRect,
  getNextUpgradeSelectionIndex,
  getUpgradeOverlayPanelRect,
  getUpgradeSelectedDetailRect,
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
    expect(translations.zh.upgradeHelp).toBe("← / → 選擇　Hold鍵 詳細/收合　Space 確認　1 / 2 / 3 快速選擇");
    expect(translations.en.upgradeHelp).toBe("← / → Select   Hold toggles details   Space Confirm   1 / 2 / 3 Quick Pick");
  });

  it("localizes the selected upgrade detail label", () => {
    expect(translations.zh.selectedUpgrade).toBe("目前選擇");
    expect(translations.en.selectedUpgrade).toBe("Selected Upgrade");
    expect(translations.zh.upgradeDetailOpen).toBe("詳細");
    expect(translations.en.upgradeDetailOpen).toBe("Details");
    expect(translations.zh.upgradeDetailClose).toBe("收合");
    expect(translations.en.upgradeDetailClose).toBe("Collapse");
  });

  it("keeps card choices clear of the selected detail bar", () => {
    const panel = getUpgradeOverlayPanelRect();
    const detail = getUpgradeSelectedDetailRect();
    const cards = [0, 1, 2].map(getUpgradeCardRect);
    for (const card of cards) {
      expect(card.y + card.h).toBeLessThanOrEqual(detail.y);
      expect(card.x).toBeGreaterThan(panel.x);
      expect(card.x + card.w).toBeLessThan(panel.x + panel.w);
    }
    expect(detail.y + detail.h).toBeLessThan(panel.y + panel.h);
    expect(getUpgradeDetailToggleRect().x + getUpgradeDetailToggleRect().w).toBeLessThanOrEqual(detail.x + detail.w);
    expect(getUpgradeDetailToggleRect().y).toBeGreaterThanOrEqual(detail.y);
  });

  it("keeps full-width text while reserving the top of the card for baked alien rank art", () => {
    const layout = getUpgradeCardContentLayout(getUpgradeCardRect(0));
    expect(layout.icon).toBeUndefined();
    expect(layout.emblem).toBeUndefined();
    expect(layout.portrait).toMatchObject({ w: expect.any(Number), h: expect.any(Number) });
    expect(layout.portrait.y).toBeLessThan(layout.title.y);
    expect(layout.panels.desc).toBeUndefined();
    expect(layout.panels.title).toBeUndefined();
    expect(layout.panels.tags).toBeUndefined();
    expect(layout.panels.trait).toBeUndefined();
    expect(layout.title.w).toBeGreaterThan(160);
    expect(layout.trait.w).toBeGreaterThan(160);
  });
});
