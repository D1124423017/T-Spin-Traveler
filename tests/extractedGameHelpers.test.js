import { describe, expect, it } from "vitest";
import {
  bindControl,
  getAllControlKeys,
  normalizeControlKey,
  normalizeControlKeys,
  normalizeControlsMap,
  serializeControls,
} from "../src/input/controlBindings.js";
import {
  getCanvasPoint,
  installInputController,
} from "../src/input/inputController.js";
import {
  getSettingsSliderTrackWidth,
  getSettingsSliderTrackX,
} from "../src/input/settingsInputRouter.js";
import { easeOutBack } from "../src/ui/combatFeedbackRenderer.js";
import { createSidePieceLayout } from "../src/ui/sidePieceRenderer.js";

const controlActions = [
  { id: "left" },
  { id: "right" },
  { id: "hold" },
];

const defaultControls = {
  left: ["ArrowLeft"],
  right: ["ArrowRight"],
  softDrop: ["ArrowDown"],
  hardDrop: [" "],
  rotateCW: ["ArrowUp", "x"],
  rotateCCW: ["z"],
  rotate180: ["a"],
  hold: ["Shift", "c"],
  pause: ["p", "Escape"],
  mute: ["m"],
};

describe("extracted game helpers", () => {
  it("normalizes saved controls without replacing intentional empty bindings", () => {
    expect(normalizeControlKey("A")).toBe("a");
    expect(normalizeControlKey(" ")).toBe(" ");
    expect(normalizeControlKeys(["A", "a", "ArrowLeft"])).toEqual(["a", "arrowleft"]);

    expect(normalizeControlsMap({ hold: [] }, {
      controlActions,
      defaultControls,
    })).toEqual({
      left: ["arrowleft"],
      right: ["arrowright"],
      hold: [],
    });
  });

  it("keeps control serialization isolated and removes duplicate bindings", () => {
    const controls = normalizeControlsMap({}, {
      controlActions,
      defaultControls,
    });

    bindControl(controls, "hold", "ArrowLeft", {
      controlActions,
      defaultControls,
    });

    expect(controls.left).toEqual([]);
    expect(controls.hold).toEqual(["arrowleft"]);
    expect(getAllControlKeys({
      controlActions,
      controls,
      defaultControls,
    })).toEqual(["arrowright", "arrowleft"]);

    const serialized = serializeControls(controls, {
      controlActions,
      defaultControls,
    });
    serialized.hold.push("x");
    expect(controls.hold).toEqual(["arrowleft"]);
  });

  it("maps pointer coordinates and settings slider geometry deterministically", () => {
    const canvas = {
      getBoundingClientRect: () => ({
        left: 100,
        top: 50,
        width: 640,
        height: 360,
      }),
    };

    expect(getCanvasPoint(
      { clientX: 420, clientY: 230 },
      canvas,
      1280,
      720,
    )).toEqual({ x: 640, y: 360 });
    expect(getSettingsSliderTrackX({ x: 200 }, "audio")).toBe(200);
    expect(getSettingsSliderTrackX({ x: 200 }, "tuning")).toBe(448);
    expect(getSettingsSliderTrackWidth("audio")).toBe(270);
    expect(getSettingsSliderTrackWidth("tuning")).toBe(278);
  });

  it("preserves Hold and Next layout values after extraction", () => {
    expect(createSidePieceLayout({
      boardX: 476,
      boardY: 72,
      cols: 10,
      tile: 29,
    })).toEqual({
      hold: {
        x: 360,
        y: 76,
        w: 106,
        h: 112,
        previewW: 86,
        previewH: 74,
        cellSize: 18,
      },
      next: {
        x: 778,
        y: 76,
        count: 5,
        w: 96,
        slotH: 58,
        slotGap: 4,
        slotStep: 62,
        previewW: 80,
        previewH: 58,
        cellSize: 15,
      },
    });
  });

  it("keeps combat popup easing endpoints stable", () => {
    expect(easeOutBack(0)).toBeCloseTo(0);
    expect(easeOutBack(1)).toBe(1);
  });

  it("routes keyboard input through callbacks without owning gameplay rules", () => {
    const listeners = new Map();
    const canvasListeners = new Map();
    const calls = [];
    const controls = normalizeControlsMap({}, {
      controlActions: Object.keys(defaultControls).map((id) => ({ id })),
      defaultControls,
    });
    const state = {
      assetLoadingDone: true,
      bindingAction: null,
      controls,
      currentBuildOpen: false,
      input: {
        softDrop: false,
        softDropTimer: 0,
      },
      mode: "playing",
      pauseView: "menu",
      pointer: {
        down: false,
        dragging: null,
      },
      settingsOpen: false,
      upgradePickConfirm: false,
      upgradeSelectedIndex: 0,
    };
    const target = {
      addEventListener: (name, handler) => listeners.set(name, handler),
      removeEventListener: (name) => listeners.delete(name),
      open: () => null,
    };
    const canvas = {
      addEventListener: (name, handler) => canvasListeners.set(name, handler),
      removeEventListener: (name) => canvasListeners.delete(name),
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }),
      style: {},
    };
    const actionList = Object.keys(defaultControls).map((id) => ({ id }));
    const getKeys = (action) => normalizeControlKeys(state.controls[action]);
    const controller = installInputController({
      target,
      canvas,
      state,
      audio: {},
      width: 1280,
      height: 720,
      uiLayout: {
        controlsGrid: { columns: 2, gapX: 1, rowH: 1, rowW: 1, keyW: 1, keyH: 1 },
        pauseButton: { x: 0, y: 0, w: 0, h: 0 },
        pauseMenu: { x: 0, y: 0, w: 0, h: 0 },
        settings: { tabX: 0, y: 0 },
      },
      settingsTabs: [],
      controlActions: actionList,
      defaultControls,
      defaultTuning: {},
      tuningSliders: {},
      githubFeedbackUrl: "",
      debugUiEnabled: false,
      getMainMenuButtonRects: () => ({}),
      getSettingsContentOrigin: () => ({ x: 0, y: 0 }),
      getSettingsBackButtonRect: () => ({ x: 0, y: 0, w: 0, h: 0 }),
      getSettingsFeedbackCardRect: () => ({ x: 0, y: 0, w: 0, h: 0 }),
      getControlsResetButtonRect: () => ({ x: 0, y: 0, w: 0, h: 0 }),
      getHandlingResetButtonRect: () => ({ x: 0, y: 0, w: 0, h: 0 }),
      getStoryComicLayout: () => ({
        panelHitRect: { x: 0, y: 0, w: 1280, h: 720 },
        nextButton: { x: 1000, y: 600, w: 160, h: 48 },
        skipButton: { x: 1100, y: 40, w: 120, h: 40 },
      }),
      getCurrentBuildButtonRect: () => ({ x: 0, y: 0, w: 0, h: 0 }),
      getCurrentBuildCloseRect: () => ({ x: 0, y: 0, w: 0, h: 0 }),
      getUpgradeDetailToggleRect: () => ({ x: 0, y: 0, w: 0, h: 0 }),
      getUpgradeCardRect: () => ({ x: 0, y: 0, w: 0, h: 0 }),
      getResultButtonRects: () => ({}),
      actions: {
        applyAudioSettings: () => {},
        bindControl: () => {},
        chooseUpgrade: () => {},
        getAllControlKeys: () => actionList.flatMap(({ id }) => getKeys(id)),
        getControlKeys: getKeys,
        handleAscensionResultPointerDown: () => {},
        handleMetaUpgradePointerDown: () => {},
        hardDrop: () => calls.push(["hardDrop"]),
        holdPiece: () => calls.push(["hold"]),
        isBattleCountdownActive: () => false,
        isPointOverMenuHero: () => false,
        loadMetaProgress: () => ({}),
        move: (...args) => calls.push(["move", ...args]),
        moveUpgradeSelection: () => {},
        normalizeControlsMap: () => controls,
        playSfx: () => {},
        pressHorizontal: (...args) => calls.push(["pressHorizontal", ...args]),
        previewSfx: () => {},
        previewUpgradeChoice: () => {},
        releaseHorizontal: (...args) => calls.push(["releaseHorizontal", ...args]),
        resetGame: (...args) => calls.push(["resetGame", ...args]),
        resetInputRepeat: () => {},
        returnToMetaUpgradeFromAscension: () => {},
        rotate: (...args) => calls.push(["rotate", ...args]),
        rotate180: () => calls.push(["rotate180"]),
        saveGame: () => {},
        setGameMode: (mode) => {
          state.mode = mode;
          calls.push(["setGameMode", mode]);
        },
        setLanguage: () => {},
        startAscensionChallenge: () => {},
        startStoryScene: (...args) => calls.push(["startStoryScene", ...args]),
        syncControlHints: () => {},
        toggleDebugUi: () => calls.push(["toggleDebugUi"]),
        toggleMute: () => {},
        toggleUpgradeDetail: () => {},
        triggerMenuHeroAction: () => {},
        unlockAudio: () => {},
        updateMenuHeroHoverFromPointer: () => false,
      },
    });

    const keyDown = listeners.get("keydown");
    const keyUp = listeners.get("keyup");
    const event = (key, code = key) => ({
      code,
      key,
      preventDefault: () => {},
      repeat: false,
    });
    keyDown(event("ArrowLeft"));
    keyUp(event("ArrowLeft"));
    keyDown(event("ArrowUp"));
    keyDown(event("z"));
    keyDown(event("a"));
    keyDown(event("Shift"));
    keyDown(event(" ", "Space"));
    keyDown(event("p"));
    keyDown(event("F1"));

    state.mode = "start";
    keyDown(event("Enter"));
    state.mode = "start";
    state.mainMenuSelectedIndex = 1;
    keyDown(event("Enter"));

    expect(calls).toEqual([
      ["pressHorizontal", -1],
      ["releaseHorizontal", -1],
      ["rotate", 1],
      ["rotate", -1],
      ["rotate180"],
      ["hold"],
      ["hardDrop"],
      ["setGameMode", "paused"],
      ["resetGame", "endless"],
      ["startStoryScene", "prologue", "storyEgypt"],
    ]);

    controller.destroy();
    expect(listeners.size).toBe(0);
    expect(canvasListeners.size).toBe(0);
  });
});
