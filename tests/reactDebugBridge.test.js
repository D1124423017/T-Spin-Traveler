import { describe, expect, it, vi } from "vitest";
import {
  createReactDebugSnapshot,
  createReactDebugSnapshotReader,
  createReactMainMenuSnapshot,
  createReactMainMenuSnapshotReader,
  getReactUiSandboxOverlayKind,
  isReactUiSandboxMigratedOverlay,
} from "../src/react/bridge/gameStateSnapshot.js";
import {
  REACT_DEBUG_INTENTS,
  REACT_MAIN_MENU_INTENTS,
  createReactDebugIntentBridge,
  createReactMainMenuIntentBridge,
  isReactDebugEnabled,
} from "../src/react/bridge/uiIntentBridge.js";
import {
  createReactUiSandboxIntentHandlers,
  createReactUiSandboxModelReader,
} from "../src/react/bridge/reactUiSandboxModel.js";
import { createReactMainMenuIntentHandlers } from "../src/react/bridge/mainMenuIntentHandlers.js";
import { isDebugHudEnabled } from "../src/debug/debugBootstrap.js";

describe("React debug POC bridge", () => {
  it("only enables the React panel behind debug and reactDebug query flags", () => {
    expect(isReactDebugEnabled("")).toBe(false);
    expect(isReactDebugEnabled("?debug=1")).toBe(false);
    expect(isReactDebugEnabled("?reactDebug=1")).toBe(false);
    expect(isReactDebugEnabled("?debug=1&reactDebug=1")).toBe(true);
    expect(isDebugHudEnabled("?debug=1&reactDebug=1")).toBe(true);
  });

  it("creates a frozen read-only snapshot without retaining mutable state objects", () => {
    const state = {
      mode: "start",
      runMode: "endless",
      wave: 3,
      playerHp: 120,
      enemyHp: 40,
      active: { type: "T" },
      upgradeChoices: ["a"],
      debug: {
        lastUpdateAt: 100,
        lastDrawAt: 120,
        drawError: "",
      },
    };

    const snapshot = createReactDebugSnapshot({
      state,
      assetSummary: { loaded: 8, loading: 2, error: 0, total: 10 },
      domDiagnostics: { rootReady: true, layerCount: 2 },
      legacyDebugVisible: true,
      reactDebug: { enabled: true, loaded: true },
      uiModel: {
        labels: { pauseMenu: "Pause" },
        pause: { wave: 3 },
      },
      now: 160,
    });

    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.gameplay)).toBe(true);
    expect(Object.isFrozen(snapshot.labels)).toBe(true);
    expect(snapshot.gameplay).not.toBe(state);
    expect(snapshot.gameplay.activePiece).toBe(true);
    expect(snapshot.asset.progress).toBe(0.8);
    expect(snapshot.debug.drawAgeMs).toBe(40);
    expect(snapshot.ui.canvasMainMenuActive).toBe(true);
    expect(snapshot.ui.mainMenuManagedByReact).toBe(false);
    expect(snapshot.labels.pauseMenu).toBe("Pause");
  });

  it("reads snapshot dependencies safely", () => {
    const readSnapshot = createReactDebugSnapshotReader({
      state: { mode: "equipment", debug: {} },
      getAssetLoadingSummary: () => ({ loaded: 1, total: 2 }),
      getDomOverlayDiagnostics: () => ({ rootReady: true, gsapReady: false, layers: { toast: 1 } }),
      getLegacyDebugVisible: () => false,
      getReactDebugLoadState: () => ({ enabled: true, loading: true }),
      getUiSandboxModel: () => ({
        labels: { settings: "Settings" },
        settings: { currentTab: "audio", tabs: [{ id: "audio", label: "Audio" }] },
      }),
      now: () => 500,
    });

    expect(readSnapshot()).toMatchObject({
      mode: "equipment",
      asset: { loaded: 1, total: 2, progress: 0.5 },
      dom: { rootReady: true, layerCount: 1 },
      reactDebug: { enabled: true, loading: true },
      labels: { settings: "Settings" },
      settings: { currentTab: "audio" },
    });
  });

  it("selects only safe migrated overlays and leaves main menu on Canvas", () => {
    expect(getReactUiSandboxOverlayKind({ mode: "start" })).toBe("");
    expect(getReactUiSandboxOverlayKind({ mode: "paused" })).toBe("pause");
    expect(getReactUiSandboxOverlayKind({ mode: "guide" })).toBe("guide");
    expect(getReactUiSandboxOverlayKind({ mode: "defeat" })).toBe("result");
    expect(getReactUiSandboxOverlayKind({ mode: "victory" })).toBe("result");
    expect(getReactUiSandboxOverlayKind({ mode: "playing", settingsOpen: true })).toBe("settings");
    expect(getReactUiSandboxOverlayKind({ mode: "upgrade", currentBuildOpen: true })).toBe("currentBuild");
    expect(getReactUiSandboxOverlayKind({ mode: "equipment" })).toBe("");
    expect(isReactUiSandboxMigratedOverlay("settings")).toBe(true);
    expect(isReactUiSandboxMigratedOverlay("equipment")).toBe(false);
  });

  it("marks unported non-main-menu screens as Canvas fallback instead of blanking them", () => {
    const snapshot = createReactDebugSnapshot({
      state: { mode: "equipment", debug: {} },
      reactDebug: { enabled: true, loaded: true },
    });

    expect(snapshot.ui.overlayKind).toBe("");
    expect(snapshot.ui.migratedOverlay).toBe(false);
    expect(snapshot.ui.fallbackCanvasMode).toBe("equipment");
    expect(snapshot.ui.mainMenuManagedByReact).toBe(false);
  });

  it("builds sandbox view models from existing game state without owning the truth", () => {
    const state = {
      mode: "paused",
      runMode: "endless",
      language: "en",
      wave: 4,
      playerHp: 80,
      playerMaxHp: 120,
      enemyHp: 30,
      enemy: { maxHp: 90 },
      settingsTab: "controls",
      tuning: { das: 128, arr: 28, softDrop: 1, lockDelay: 500 },
      stats: {},
      save: {},
      debug: {},
    };
    const readModel = createReactUiSandboxModelReader({
      audio: { masterVolume: 1, musicVolume: 0.8, sfxVolume: 0.5, muted: false },
      controlActions: [{ id: "left", labelKey: "control.left" }],
      controlDisplayValue: () => "Left",
      defaultTuning: state.tuning,
      format: (key, vars = {}) => `${key}:${vars.amount ?? vars.rating ?? vars.wave ?? ""}`,
      getAcquiredRelicGroups: () => [],
      getCurrentBuildDirectionText: () => "No build",
      getCurrentBuildFamilyStats: () => [],
      getMessage: () => "done",
      getResultButtonRects: () => ({}),
      getTraitEntries: () => [],
      githubFeedbackUrl: "https://example.test/issues",
      playerMaxHp: 120,
      settingsTabs: ["controls", "audio"],
      state,
      translate: (key) => ({ endless: "Endless", "control.left": "Move Left" }[key] || key),
      tuningSliders: { das: { unit: "ms" } },
    });

    const model = readModel();
    expect(model.pause).toMatchObject({
      wave: 4,
      runMode: "Endless",
      playerHp: "80 / 120",
      enemyHp: "30 / 90",
    });
    expect(model.settings.tabs).toEqual([
      { id: "controls", label: "settingsTabControls" },
      { id: "audio", label: "settingsTabAudio" },
    ]);
    expect(model.settings.controls[0]).toEqual({
      id: "left",
      label: "Move Left",
      value: "Left",
    });
    expect(state.mode).toBe("paused");
  });

  it("keeps sandbox UI actions behind explicit handlers", () => {
    const state = {
      mode: "paused",
      pauseView: "menu",
      settingsOpen: false,
      runMode: "endless",
    };
    const setGameMode = vi.fn((mode) => {
      state.mode = mode;
    });
    const handlers = createReactUiSandboxIntentHandlers({
      loadMetaProgress: () => ({ riftEnergy: 10 }),
      playSfx: vi.fn(),
      resetGame: vi.fn(() => true),
      setGameMode,
      settingsTabs: ["controls", "audio"],
      state,
    });

    expect(handlers.openPauseSettings()).toBe(true);
    expect(state.pauseView).toBe("settings");
    expect(handlers.setSettingsTab({ tab: "audio" })).toBe(true);
    expect(state.settingsTab).toBe("audio");
    expect(handlers.setSettingsTab({ tab: "danger" })).toBe(false);
    expect(handlers.resumeGame()).toBe(true);
    expect(setGameMode).toHaveBeenLastCalledWith("playing");
  });

  it("dispatches only whitelisted safe intents through callbacks", () => {
    const coreState = { mode: "playing" };
    const refreshSnapshot = vi.fn(() => ({ mode: coreState.mode }));
    const toggleLegacyDebugHud = vi.fn(() => true);
    const resumeGame = vi.fn(() => true);
    const setSettingsTab = vi.fn(() => true);
    const bridge = createReactDebugIntentBridge({
      refreshSnapshot,
      resumeGame,
      setSettingsTab,
      toggleLegacyDebugHud,
    });

    expect(bridge.dispatch({ type: REACT_DEBUG_INTENTS.refreshSnapshot })).toEqual({
      ok: true,
      type: REACT_DEBUG_INTENTS.refreshSnapshot,
      value: { mode: "playing" },
    });
    expect(bridge.dispatch(REACT_DEBUG_INTENTS.toggleLegacyDebugHud)).toEqual({
      ok: true,
      type: REACT_DEBUG_INTENTS.toggleLegacyDebugHud,
      value: true,
    });
    expect(bridge.dispatch({ type: REACT_DEBUG_INTENTS.resumeGame })).toEqual({
      ok: true,
      type: REACT_DEBUG_INTENTS.resumeGame,
      value: true,
    });
    expect(bridge.dispatch({ type: REACT_DEBUG_INTENTS.setSettingsTab, tab: "audio" })).toEqual({
      ok: true,
      type: REACT_DEBUG_INTENTS.setSettingsTab,
      value: true,
    });
    expect(bridge.dispatch({ type: "setMode", value: "defeat" })).toEqual({
      ok: false,
      reason: "unsupported-intent",
      type: "setMode",
    });
    expect(coreState.mode).toBe("playing");
    expect(refreshSnapshot).toHaveBeenCalledOnce();
    expect(toggleLegacyDebugHud).toHaveBeenCalledOnce();
    expect(resumeGame).toHaveBeenCalledOnce();
    expect(setSettingsTab).toHaveBeenCalledWith({
      type: REACT_DEBUG_INTENTS.setSettingsTab,
      tab: "audio",
    });
  });

  it("creates a frozen React main menu view model without owning game state", () => {
    const state = {
      assetLoadingDone: true,
      language: "en",
      mainMenuSelectedIndex: 1,
      mode: "start",
    };
    const translate = (key) => ({
      endless: "Endless",
      mainMenuStory: "Main Stage",
      mainStageEgyptDescription: "Story first",
      mainStageEgyptShort: "Prologue",
      menuControlHint: "Keys",
      menuWorldLocation: "Kingdom",
      startGame: "Start Game",
      startTagline: "Line clear x combat",
      startTitle: "T-Spin Traveler",
      startWorldHint: "NOA crosses the rift.",
    }[key] || key);

    const snapshot = createReactMainMenuSnapshot({
      buttonFrames: {
        primary: "/T-Spin-Traveler/assets/images/ui/menu/main-menu-primary-frame.png?v=test",
        secondary: "/T-Spin-Traveler/assets/images/ui/menu/main-menu-secondary-frame.png?v=test",
      },
      state,
      formatActionLabel: (action) => translate(action.labelKey).toUpperCase(),
      now: 200,
      translate,
    });

    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.actions)).toBe(true);
    expect(Object.isFrozen(snapshot.actions[1])).toBe(true);
    expect(snapshot.enabled).toBe(true);
    expect(snapshot.selectedIndex).toBe(1);
    expect(snapshot.selectedAction).toMatchObject({
      id: "mainStage",
      label: "MAIN STAGE",
      description: "Story first",
      hint: "Prologue",
    });
    expect(snapshot.buttonFrames).toEqual({
      primary: "/T-Spin-Traveler/assets/images/ui/menu/main-menu-primary-frame.png?v=test",
      secondary: "/T-Spin-Traveler/assets/images/ui/menu/main-menu-secondary-frame.png?v=test",
    });
    expect(snapshot.ui).toMatchObject({
      canvasMainMenuActive: false,
      mainMenuManagedByReact: true,
    });

    state.mainMenuSelectedIndex = 4;
    expect(snapshot.selectedIndex).toBe(1);
  });

  it("keeps the React main menu snapshot disabled during first-paint loading", () => {
    const readSnapshot = createReactMainMenuSnapshotReader({
      state: {
        assetLoadingDone: false,
        mainMenuSelectedIndex: 0,
        mode: "start",
      },
      translate: (key) => key,
      now: () => 100,
    });

    expect(readSnapshot()).toMatchObject({
      enabled: false,
      selectedAction: { id: "start" },
    });
  });

  it("dispatches React main menu intents only through whitelisted callbacks", () => {
    const activateMenuAction = vi.fn(() => true);
    const hoverMenuAction = vi.fn(() => true);
    const refreshSnapshot = vi.fn(() => ({ mode: "start" }));
    const bridge = createReactMainMenuIntentBridge({
      activateMenuAction,
      hoverMenuAction,
      refreshSnapshot,
    });

    expect(bridge.dispatch({
      type: REACT_MAIN_MENU_INTENTS.hoverMenuAction,
      actionId: "equipment",
    })).toEqual({
      ok: true,
      type: REACT_MAIN_MENU_INTENTS.hoverMenuAction,
      value: true,
    });
    expect(bridge.dispatch({
      type: REACT_MAIN_MENU_INTENTS.activateMenuAction,
      actionId: "start",
    })).toEqual({
      ok: true,
      type: REACT_MAIN_MENU_INTENTS.activateMenuAction,
      value: true,
    });
    expect(bridge.dispatch(REACT_MAIN_MENU_INTENTS.refreshSnapshot)).toEqual({
      ok: true,
      type: REACT_MAIN_MENU_INTENTS.refreshSnapshot,
      value: { mode: "start" },
    });
    expect(bridge.dispatch({ type: "setGameMode", mode: "defeat" })).toEqual({
      ok: false,
      reason: "unsupported-intent",
      type: "setGameMode",
    });
    expect(hoverMenuAction).toHaveBeenCalledWith({
      type: REACT_MAIN_MENU_INTENTS.hoverMenuAction,
      actionId: "equipment",
    });
    expect(activateMenuAction).toHaveBeenCalledWith({
      type: REACT_MAIN_MENU_INTENTS.activateMenuAction,
      actionId: "start",
    });
    expect(refreshSnapshot).toHaveBeenCalledOnce();
  });

  it("routes React main menu actions through existing callbacks", () => {
    const state = {
      assetLoadingDone: true,
      mainMenuSelectedIndex: 0,
      mode: "start",
    };
    const resetGame = vi.fn(() => true);
    const startStoryScene = vi.fn(() => true);
    const unlockAudio = vi.fn();
    const playSfx = vi.fn();
    const handlers = createReactMainMenuIntentHandlers({
      playSfx,
      resetGame,
      startStoryScene,
      state,
      unlockAudio,
    });

    expect(handlers.hoverMenuAction({ actionId: "mainStage" })).toBe(true);
    expect(state.mainMenuSelectedIndex).toBe(1);
    expect(playSfx).toHaveBeenCalledWith("uiHover");
    expect(handlers.activateMenuAction({ actionId: "start" })).toBe(true);
    expect(resetGame).toHaveBeenCalledWith("endless");
    expect(unlockAudio).toHaveBeenCalled();
    expect(handlers.activateMenuAction({ actionId: "mainStage" })).toBe(true);
    expect(startStoryScene).toHaveBeenCalledWith("prologue", "storyEgypt");
  });

  it("does not let React main menu actions bypass the loading gate", () => {
    const state = {
      assetLoadingDone: false,
      mainMenuSelectedIndex: 0,
      mode: "start",
    };
    const resetGame = vi.fn(() => true);
    const handlers = createReactMainMenuIntentHandlers({
      resetGame,
      state,
    });

    expect(handlers.activateMenuAction({ actionId: "start" })).toBe(false);
    expect(resetGame).not.toHaveBeenCalled();
  });
});
