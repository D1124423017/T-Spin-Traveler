import { describe, expect, it, vi } from "vitest";
import {
  getGhostPiece,
  getTopBufferLayout,
} from "../src/render/battleBoardRenderer.js";
import {
  alignDrawBoxToBaseline,
  getBaselineAnchorY,
  scaleDrawBoxFromBottom,
} from "../src/render/characterStageHelpers.js";
import { createLoadingScreenRenderer } from "../src/ui/loadingScreenRenderer.js";
import { createUiTextHelpers } from "../src/ui/uiTextHelpers.js";

describe("extracted render helpers", () => {
  it("calculates board buffer and ghost layout without mutating the active piece", () => {
    expect(getTopBufferLayout(5, 29, 10)).toEqual({
      x: 0,
      y: -145,
      w: 290,
      h: 145,
      rowH: 29,
    });

    const active = {
      type: "T",
      x: 3,
      y: 0,
      shape: [[1]],
    };
    const collides = vi.fn((piece, x, y) => y >= 4);
    const ghost = getGhostPiece(active, "playing", collides);

    expect(ghost).toEqual({
      ...active,
      y: 3,
    });
    expect(active.y).toBe(0);
    expect(getGhostPiece(active, "paused", collides)).toBeNull();
  });

  it("keeps baseline scaling helpers deterministic", () => {
    expect(getBaselineAnchorY(640, 160, 1.25)).toBe(440);
    expect(scaleDrawBoxFromBottom({
      x: 10,
      y: 20,
      w: 100,
      h: 200,
    }, 0.5)).toEqual({
      x: 35,
      y: 120,
      w: 50,
      h: 100,
    });
    expect(alignDrawBoxToBaseline({
      x: 10,
      y: 20,
      w: 100,
      h: 200,
    }, 160, {
      scale: 0.5,
      bottomOffset: 6,
    })).toEqual({
      x: 35,
      y: 66,
      w: 50,
      h: 100,
    });
  });

  it("keeps localized display and message state wiring unchanged", () => {
    const state = {
      language: "zh",
      message: "",
      messageKey: "",
      messageVars: {},
    };
    const translations = {
      zh: {
        greeting: "你好 {name}",
        "upgradeName.test": "測試升級",
        weaknessSpin: "旋轉弱點",
      },
      en: {
        greeting: "Hello {name}",
        fallbackOnly: "Fallback",
      },
    };
    const helpers = createUiTextHelpers({ state, translations });

    expect(helpers.fmt("greeting", { name: "NOA" })).toBe("你好 NOA");
    expect(helpers.t("fallbackOnly")).toBe("Fallback");
    helpers.setMessage("greeting", { name: "NOA" });
    expect(helpers.getMessage()).toBe("你好 NOA");
    expect(helpers.upgradeName({ id: "test", name: "Test" })).toBe("測試升級");
    expect(helpers.enemyWeaknessLabel({ weakness: "spin" })).toBe("旋轉弱點");

    state.language = "en";
    expect(helpers.getMessage()).toBe("Hello NOA");
  });

  it("forwards loading screen state into the existing overlay renderer", () => {
    const createLoadingOverlayModel = vi.fn((model) => model);
    const drawLoadingOverlay = vi.fn();
    const getAssetLoadingSummary = vi.fn(() => ({
      loaded: 3,
      total: 4,
    }));
    const getFirstPaintReadiness = vi.fn(() => ({
      ready: false,
      loaded: 2,
      total: 3,
    }));
    const state = {
      assetLoadingStartedAt: 12,
      assetLoadingCompletingAt: 0,
      debug: {
        drawError: "",
      },
    };
    const renderer = createLoadingScreenRenderer({
      ctx: {},
      state,
      debugHudEnabled: true,
      debugHudBuild: "test",
      getAssetLoadingSummary,
      getFirstPaintReadiness,
      createLoadingOverlayModel,
      drawLoadingOverlay,
      canvasFont: vi.fn(),
      drawCornerGlyph: vi.fn(),
      drawDimOverlay: vi.fn(),
      loadingBackground: "loading-bg",
      roundedRect: vi.fn(),
      translate: (key) => key,
      completionDelayMs: 320,
    });

    renderer.drawAssetLoadingScreen(100);

    expect(createLoadingOverlayModel).toHaveBeenCalledWith({
      summary: {
        loaded: 3,
        total: 4,
      },
      firstPaintSummary: {
        ready: false,
        loaded: 2,
        total: 3,
      },
      now: 100,
      startedAt: 12,
      completionStartedAt: 0,
      completionDelayMs: 320,
      debugEnabled: true,
      debugBuild: "test",
      drawError: "",
      translate: expect.any(Function),
    });
    expect(drawLoadingOverlay).toHaveBeenCalledWith({}, expect.any(Object), expect.objectContaining({
      loadingBackground: "loading-bg",
    }));
  });
});
