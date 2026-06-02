import { describe, expect, it } from "vitest";
import {
  animateNumber,
  clamp,
  drawRoundedRect,
  getSpriteFrameRect,
  hexToRgba,
  insetSpriteFrameRect,
  lerp,
  pointInRect,
  smoothstep,
} from "../src/render/drawUtils.js";
import {
  createHudLayout,
  getControlsResetButtonRect,
  getMainMenuButtonRects,
  getMetaUpgradeBackButtonRect,
  getMetaUpgradeRowRects,
  getResultButtonRects,
  getSettingsBackButtonRect,
  getSettingsContentOrigin,
  getSettingsFeedbackButtonRect,
  getSettingsFeedbackCardRect,
  getUltimateCountdownSeconds,
  getUltimateTimerRatio,
  getHandlingResetButtonRect,
  shouldShowUltimateCountdownWarning,
} from "../src/ui/hudLayout.js";
import { getPiecePreviewLayout } from "../src/ui/piecePreview.js";
import { createCanvasFont, shouldUseDisplayFont, tokenizeForWrap } from "../src/ui/textLayout.js";
import {
  UPGRADE_CARD_ASSET_SIZE,
  UPGRADE_CARD_SAFE_ZONES,
  getCurrentBuildCloseRect,
  getCurrentBuildPanelRect,
  getUpgradeDetailToggleRect,
  getUpgradeDraftLayout,
  getUpgradeCardContentLayout,
  getUpgradeCardRect,
  getUpgradeOverlayPanelRect,
} from "../src/ui/upgradeCards.js";

describe("draw utility helpers", () => {
  it("keeps math helpers deterministic", () => {
    expect(clamp(12, 0, 10)).toBe(10);
    expect(lerp(10, 20, 0.25)).toBe(12.5);
    expect(smoothstep(0, 10, 5)).toBe(0.5);
    expect(hexToRgba("#abc", 0.4)).toBe("rgba(170, 187, 204, 0.4)");
    expect(pointInRect(12, 14, 10, 10, 8, 8)).toBe(true);
    expect(pointInRect(20, 14, 10, 10, 8, 8)).toBe(false);
  });

  it("matches the game animation snap behavior", () => {
    expect(animateNumber("unset", 12, 16, 100)).toBe(12);
    expect(animateNumber(0, 10, 50, 100)).toBe(5);
    expect(animateNumber(9.96, 10, 16, 100)).toBe(10);
  });

  it("draws a rounded rect using the supplied canvas context", () => {
    const calls = [];
    const ctx = {
      beginPath: () => calls.push("beginPath"),
      moveTo: (...args) => calls.push(["moveTo", ...args]),
      lineTo: (...args) => calls.push(["lineTo", ...args]),
      quadraticCurveTo: (...args) => calls.push(["quadraticCurveTo", ...args]),
      fill: () => calls.push("fill"),
      stroke: () => calls.push("stroke"),
    };

    drawRoundedRect(ctx, 10, 20, 30, 40, 5, true, true);

    expect(calls[0]).toBe("beginPath");
    expect(calls).toContain("fill");
    expect(calls).toContain("stroke");
  });

  it("calculates sprite frame rectangles and safe insets", () => {
    const image = { naturalWidth: 101, naturalHeight: 53 };
    const config = { columns: 4, rows: 2, image };

    expect(getSpriteFrameRect(config, 5)).toEqual({ x: 25, y: 27, w: 26, h: 26 });
    expect(insetSpriteFrameRect({ x: 25, y: 27, w: 26, h: 26 }, image, 3)).toEqual({
      x: 28,
      y: 30,
      w: 20,
      h: 20,
    });
  });
});

describe("HUD and card layout helpers", () => {
  it("creates the same board-dependent HUD layout values", () => {
    const layout = createHudLayout({ boardX: 476, boardY: 72, cols: 10, rows: 20, tile: 29 });

    expect(layout.boardFrame).toEqual({ x: 458, y: 54, w: 326, h: 616 });
    expect(layout.ultimateMeter).toEqual({ x: 0, y: 590, w: 290, h: 30 });
    expect(getMainMenuButtonRects(layout.menu).settings).toEqual({ x: 838, y: 494, w: 322, h: 44 });
  });

  it("calculates ultimate timer display state", () => {
    expect(getUltimateTimerRatio(false, 15000, 15000)).toBe(0);
    expect(getUltimateTimerRatio(true, 15000, 15000)).toBe(1);
    expect(getUltimateTimerRatio(true, 7500, 15000)).toBe(0.5);
    expect(getUltimateTimerRatio(true, 0, 15000)).toBe(0);
    expect(getUltimateCountdownSeconds(2999)).toBe(3);
    expect(getUltimateCountdownSeconds(1)).toBe(1);
    expect(getUltimateCountdownSeconds(0)).toBe(0);
    expect(shouldShowUltimateCountdownWarning(true, 3001)).toBe(false);
    expect(shouldShowUltimateCountdownWarning(true, 3000)).toBe(true);
    expect(shouldShowUltimateCountdownWarning(true, 1)).toBe(true);
    expect(shouldShowUltimateCountdownWarning(false, 2000)).toBe(false);
  });

  it("calculates overlay, result, settings, and meta rects", () => {
    const layout = createHudLayout({ boardX: 476, boardY: 72, cols: 10, rows: 20, tile: 29 });
    const origin = getSettingsContentOrigin(layout.settings);

    expect(getResultButtonRects().menu).toEqual({ x: 754, y: 528, w: 172, h: 44 });
    expect(getSettingsBackButtonRect(layout.settings)).toEqual({ x: 822, y: 84, w: 274, h: 40 });
    expect(getSettingsFeedbackCardRect(origin)).toEqual({ x: 388, y: 224, w: 640, h: 292 });
    expect(getControlsResetButtonRect(origin, layout.controlsGrid, 10)).toEqual({ x: 848, y: 548, w: 220, h: 38 });
    expect(getHandlingResetButtonRect(origin)).toEqual({ x: 808, y: 596, w: 220, h: 38 });
    expect(getSettingsFeedbackButtonRect(388, 224, 640, 292)).toEqual({ x: 412, y: 454, w: 232, h: 40 });
    expect(getMetaUpgradeRowRects().guard.buyY).toBe(473);
    expect(getMetaUpgradeBackButtonRect()).toEqual({ x: 812, y: 574, w: 240, h: 44 });
  });

  it("calculates upgrade card and current build rects", () => {
    const card = getUpgradeCardRect(2);
    const draftLayout = getUpgradeDraftLayout();
    const cardLayout = getUpgradeCardContentLayout(card);
    const specialCardLayout = getUpgradeCardContentLayout(card, "special");

    expect(getUpgradeOverlayPanelRect()).toEqual({ x: 198, y: 118, w: 934, h: 548 });
    expect(draftLayout.buildRail).toBeUndefined();
    expect(draftLayout.detail).toBeUndefined();
    expect(draftLayout.safeHint).toBeUndefined();
    expect(draftLayout.title).toEqual({ x: 260, y: 180, w: 530, size: 36 });
    expect(draftLayout.bondSummary).toEqual({ x: 684, y: 174 });
    expect(draftLayout.buildButton).toEqual({ x: 942, y: 170, w: 150, h: 36 });
    expect(draftLayout.selectedDetail).toEqual({ x: 262, y: 562, w: 806, h: 82 });
    expect(getUpgradeDetailToggleRect()).toEqual({ x: 938, y: 586, w: 108, h: 34 });
    expect(draftLayout.help.y).toBeGreaterThan(draftLayout.panel.y + draftLayout.panel.h);
    expect(UPGRADE_CARD_ASSET_SIZE).toEqual({ w: 1024, h: 1536 });
    expect(UPGRADE_CARD_SAFE_ZONES.desc).toEqual({ x: 120, y: 1160, w: 784, h: 110 });
    expect(UPGRADE_CARD_SAFE_ZONES.portrait).toEqual({ x: 120, y: 70, w: 784, h: 430 });
    expect(getUpgradeCardRect(0)).toEqual({ x: 271, y: 200, w: 240, h: 360 });
    expect(card).toEqual({ x: 819, y: 200, w: 240, h: 360 });
    expect(cardLayout.portrait.y).toBeLessThan(cardLayout.title.y);
    expect(cardLayout.trait).toEqual({ x: 847, y: 509, w: 184, h: 34 });
    expect(cardLayout.panels.desc).toBeDefined();
    expect(cardLayout.panels.title).toBeUndefined();
    expect(cardLayout.panels.tags).toBeDefined();
    expect(cardLayout.panels.trait).toBeUndefined();
    expect(cardLayout.icon).toBeUndefined();
    expect(specialCardLayout.title.y).toBeGreaterThan(cardLayout.title.y);
    expect(specialCardLayout.trait.y).toBeGreaterThan(specialCardLayout.tags.y);
    expect(getCurrentBuildPanelRect()).toEqual({ x: 190, y: 82, w: 900, h: 560 });
    expect(getCurrentBuildCloseRect()).toEqual({ x: 912, y: 116, w: 132, h: 38 });
  });

  it("centers piece previews without canvas dependencies", () => {
    const shape = [
      [1, 1, 1, 1],
    ];

    expect(getPiecePreviewLayout(shape, 100, 50, 12, 80, 40)).toMatchObject({
      offX: 108,
      offY: 56,
      columns: 4,
      rows: 1,
    });
  });
});

describe("text layout helpers", () => {
  it("selects display fonts only for short latin display text", () => {
    const font = createCanvasFont({ displayFontStack: "Display", uiFontStack: "UI" });

    expect(shouldUseDisplayFont("START")).toBe(true);
    expect(shouldUseDisplayFont("防禦")).toBe(false);
    expect(shouldUseDisplayFont("A very long label that should use the UI font")).toBe(false);
    expect(font("900", 18, "START")).toBe("900 18px Display");
    expect(font("700", 12, "防禦")).toBe("700 12px UI");
  });

  it("tokenizes CJK and newline content for wrapping", () => {
    expect(tokenizeForWrap("Hi 世界\nOK")).toEqual(["Hi", " ", "世", "界", "\n", "OK"]);
  });
});
