import { describe, expect, it, vi } from "vitest";
import { createRuntimeSmokeReaderFactory } from "../src/debug/runtimeSmoke.js";
import {
  isPaperPixel,
  sampleCornerColor,
} from "../src/render/keyedSpriteRenderer.js";
import { getMenuActionText } from "../src/ui/menuScreen.js";
import {
  getNextBossWave,
  getRatingColor,
} from "../src/ui/resultOverlayRenderer.js";
import { createSettingsScreenRenderer } from "../src/ui/settingsScreen.js";

describe("extracted overlay helpers", () => {
  it("keeps localized menu action labels unchanged", () => {
    const translate = (key) => ({
      startGame: "開始遊戲",
      upgradeMenu: "升級",
    }[key] || key);

    expect(getMenuActionText("startGame", {
      language: "zh",
      translate,
    })).toBe("開始遊戲");
    expect(getMenuActionText("startGame", {
      language: "en",
      translate,
    })).toBe("START");
    expect(getMenuActionText("upgradeMenu", {
      language: "en",
      translate: () => "Upgrade",
    })).toBe("UPGRADE");
  });

  it("preserves result rating colors and next boss wave targets", () => {
    expect(getRatingColor("PERFECT")).toBe("#fff0a6");
    expect(getRatingColor("ARCANE")).toBe("#d7c2ff");
    expect(getRatingColor("BRUTAL")).toBe("#ff8f98");
    expect(getRatingColor("CLEAN")).toBe("#9df7da");
    expect(getRatingColor("OTHER")).toBe("#f5f1e6");

    expect(getNextBossWave(0)).toBe(20);
    expect(getNextBossWave(19)).toBe(20);
    expect(getNextBossWave(20)).toBe(30);
    expect(getNextBossWave(37)).toBe(40);
  });

  it("keeps keyed sprite corner sampling and paper detection deterministic", () => {
    const data = new Uint8ClampedArray([
      240, 230, 220, 255,
      220, 210, 200, 255,
      200, 190, 180, 255,
      180, 170, 160, 255,
    ]);

    expect(sampleCornerColor(data, 2, 2)).toEqual({
      r: 210,
      g: 200,
      b: 190,
    });
    expect(isPaperPixel(
      new Uint8ClampedArray([230, 225, 220, 255]),
      0,
      { r: 230, g: 225, b: 220 },
    )).toBe(true);
    expect(isPaperPixel(
      new Uint8ClampedArray([20, 30, 40, 255]),
      0,
      { r: 230, g: 225, b: 220 },
    )).toBe(false);
  });

  it("resolves settings render dependencies lazily", () => {
    const drawDimOverlay = vi.fn();
    const drawCard = vi.fn();
    const drawMenuButton = vi.fn();
    const label = vi.fn();
    const getSettingsBackButtonRect = vi.fn(() => ({
      x: 1,
      y: 2,
      w: 3,
      h: 4,
    }));
    const getDeps = vi.fn(() => ({
      ctx: {
        save: vi.fn(),
        restore: vi.fn(),
      },
      layout: {
        settings: {
          x: 10,
          y: 20,
          w: 30,
          h: 40,
          tabX: 50,
          contentX: 60,
          contentY: 70,
        },
      },
      label,
      roundedRect: vi.fn(),
      t: (key) => key,
      wrapText: vi.fn(),
      drawDimOverlay,
      drawCard,
      drawMenuButton,
      getSettingsBackButtonRect,
      settingsTabs: [],
      state: {
        language: "zh",
        settingsTab: "language",
      },
    }));

    const renderer = createSettingsScreenRenderer(getDeps);
    expect(getDeps).not.toHaveBeenCalled();

    renderer.draw("start");

    expect(getDeps).toHaveBeenCalledOnce();
    expect(drawDimOverlay).toHaveBeenCalledOnce();
    expect(drawCard).toHaveBeenCalledWith(10, 20, 30, 40);
    expect(drawMenuButton).toHaveBeenCalledWith(1, 2, 3, 4, "settingsBackMenu", "Esc");
  });

  it("builds runtime smoke readers without owning game state", () => {
    const state = {
      active: null,
      assetLoadingStartedAt: 0,
      countdownMs: 0,
      debug: {},
      dropTimer: 0,
      hitStopMs: 0,
      lockTimer: null,
      mode: "start",
      pauseView: "menu",
      pendingHits: [],
      playerHp: 100,
      runFinalized: false,
      upgradeChoices: [],
    };
    const getReaders = createRuntimeSmokeReaderFactory({
      state,
      hiddenRows: 5,
      isPieceAboveTopBuffer: () => false,
      collides: () => false,
      isActivePieceOverlappingBoard: () => false,
      getHiddenRowsDebugInfo: () => ({ rows: [] }),
      isSpawnBlockedForDefeat: () => false,
      getAssetLoadingSummary: () => ({
        error: 0,
        loaded: 10,
        loading: 0,
        total: 10,
      }),
    });

    const readers = getReaders(100);
    expect(readers.mode()).toBe("start");
    expect(readers.assetLoaded()).toBe(10);
    expect(readers.servedTopBuffer()).toBe(true);
  });
});
