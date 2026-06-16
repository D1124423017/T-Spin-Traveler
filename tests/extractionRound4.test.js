import { describe, expect, it, vi } from "vitest";
import {
  createModeOverlayRouter,
  resolveModeOverlayPath,
} from "../src/core/modeRouter.js";
import { createControlStateAdapter } from "../src/input/controlStateAdapter.js";
import { createMetaScreenPointerRouter } from "../src/input/metaScreenPointerRouter.js";
import { createBondCalloutController } from "../src/ui/bondCalloutController.js";
import {
  createScreenNoteController,
  getScreenNoteViewState,
} from "../src/ui/screenNoteController.js";

describe("control state adapter", () => {
  it("normalizes, reads, serializes, and rebinds controls through one adapter", () => {
    const state = { controls: { left: ["arrowleft"], hold: ["shift"] } };
    const adapter = createControlStateAdapter({
      getState: () => state,
      controlActions: [{ id: "left" }, { id: "hold" }],
      defaultControls: { left: ["arrowleft"], hold: ["shift"] },
    });

    expect(adapter.getControlKeys("hold")).toEqual(["shift"]);
    adapter.bindControl("hold", "ArrowLeft");
    expect(state.controls).toEqual({ left: [], hold: ["arrowleft"] });
    expect(adapter.allControlKeys()).toEqual(["arrowleft"]);
    expect(adapter.serializeControls(state.controls)).toEqual(state.controls);
  });
});

describe("screen note controller", () => {
  it("calculates compact and faded states without DOM access", () => {
    expect(getScreenNoteViewState({
      mode: "playing",
      battleCountdownActive: false,
      tutorialActive: false,
      controlHintsFullUntil: 100,
      now: 200,
    })).toEqual({
      menu: false,
      compact: true,
      countdown: false,
      faded: true,
    });
  });

  it("updates localized DOM hints and classes", () => {
    const classes = new Map();
    const note = {
      classList: {
        toggle: (key, value) => classes.set(key, value),
      },
      replaceChildren: vi.fn(),
    };
    const shell = { setAttribute: vi.fn() };
    const documentTarget = {
      documentElement: { lang: "" },
      title: "",
      querySelector: (selector) => selector === ".screen-note" ? note : shell,
      createElement: () => ({}),
    };
    const controller = createScreenNoteController({
      state: {
        language: "en",
        mode: "paused",
        settingsOpen: false,
        tutorial: null,
        controlHintsFullUntil: 0,
      },
      uiLayout: { compactHints: ["hint.one", "hint.two"] },
      translate: (key) => key,
      isBattleCountdownActive: () => false,
      documentTarget,
      now: () => 200,
    });

    controller.syncControlHints();

    expect(documentTarget.documentElement.lang).toBe("en");
    expect(documentTarget.title).toBe("startTitle");
    expect(note.replaceChildren).toHaveBeenCalledOnce();
    expect(classes.get("compact")).toBe(true);
  });
});

describe("presentation routing helpers", () => {
  it("routes known modes and falls back for unknown modes", () => {
    const drawPauseOverlay = vi.fn();
    const drawEquipmentOverlay = vi.fn();
    const drawFallbackModeOverlay = vi.fn();
    const drawModeOverlay = createModeOverlayRouter({
      drawAscensionResultOverlay: vi.fn(),
      drawEquipmentOverlay,
      drawMetaUpgradeOverlay: vi.fn(),
      drawUpgradeOverlay: vi.fn(),
      drawMoveGuideOverlay: vi.fn(),
      drawPauseOverlay,
      drawAssetLoadingScreen: vi.fn(),
      drawStartOverlay: vi.fn(),
      drawFallbackModeOverlay,
    });

    expect(drawModeOverlay("pause")).toBe("pause");
    expect(drawPauseOverlay).toHaveBeenCalledOnce();
    expect(drawModeOverlay("equipment")).toBe("equipment");
    expect(drawEquipmentOverlay).toHaveBeenCalledOnce();
    drawModeOverlay("unknown");
    expect(drawFallbackModeOverlay).toHaveBeenCalledOnce();
  });

  it("keeps story overlay routing outside combat rules", () => {
    expect(resolveModeOverlayPath({
      mode: "story",
      overlayPath: "fallback",
    })).toBe("story");
    expect(resolveModeOverlayPath({
      mode: "upgrade",
      overlayPath: "upgrade",
    })).toBe("upgrade");
  });

  it("builds bond upgrade and effect callouts", () => {
    const showBondCallout = vi.fn();
    const controller = createBondCalloutController({
      translate: (key) => key,
      format: (key, vars) => `${key}:${vars.before}-${vars.after}`,
      showBondCallout,
    });

    controller.showSpecialBondUpgradeCallout({
      activates: true,
      family: { key: "angel", labelKey: "angelBond" },
      before: 1,
      after: 2,
    });
    controller.showSpecialBondEffectCallout("devil", "effect");

    expect(showBondCallout).toHaveBeenNthCalledWith(1, {
      family: "angel",
      text: "bondHintUpgrade:1-2",
      detail: "bondCalloutActivated",
      durationMs: 1450,
    });
    expect(showBondCallout).toHaveBeenNthCalledWith(2, {
      family: "devil",
      text: "effect",
      detail: "bondCalloutEffect",
      durationMs: 1250,
    });
  });
});

describe("meta screen pointer router", () => {
  it("routes meta purchases and ascension result actions through callbacks", () => {
    const purchaseMetaUpgrade = vi.fn();
    const returnToMetaUpgradeFromAscension = vi.fn();
    const router = createMetaScreenPointerRouter({
      state: {
        ascensionRun: { status: "success" },
        metaUpgradeMessage: {},
      },
      metaUpgradeDefs: { hp: { id: "hp" } },
      getMetaUpgradeBackButtonRect: () => ({ x: 0, y: 0, w: 10, h: 10 }),
      getMetaAscensionEntryRect: () => ({ x: 20, y: 0, w: 10, h: 10 }),
      getMetaUpgradeRowRects: () => ({
        hp: { buyX: 40, buyY: 0, buyW: 10, buyH: 10 },
      }),
      getAscensionResultButtonRects: () => ({
        single: { x: 0, y: 20, w: 10, h: 10 },
        primary: { x: 20, y: 20, w: 10, h: 10 },
        secondary: { x: 40, y: 20, w: 10, h: 10 },
      }),
      actions: {
        playSfx: vi.fn(),
        purchaseMetaUpgrade,
        returnToMetaUpgradeFromAscension,
        setGameMode: vi.fn(),
        startAscensionChallenge: vi.fn(),
      },
    });

    expect(router.handleMetaUpgradePointerDown(45, 5)).toBe(true);
    expect(purchaseMetaUpgrade).toHaveBeenCalledWith("hp");
    expect(router.handleAscensionResultPointerDown(5, 25)).toBe(true);
    expect(returnToMetaUpgradeFromAscension).toHaveBeenCalledOnce();
  });
});
