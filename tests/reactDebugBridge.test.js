import { describe, expect, it, vi } from "vitest";
import {
  createReactDebugSnapshot,
  createReactDebugSnapshotReader,
} from "../src/react/bridge/gameStateSnapshot.js";
import {
  REACT_DEBUG_INTENTS,
  createReactDebugIntentBridge,
  isReactDebugEnabled,
} from "../src/react/bridge/uiIntentBridge.js";
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
      now: 160,
    });

    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.gameplay)).toBe(true);
    expect(snapshot.gameplay).not.toBe(state);
    expect(snapshot.gameplay.activePiece).toBe(true);
    expect(snapshot.asset.progress).toBe(0.8);
    expect(snapshot.debug.drawAgeMs).toBe(40);
  });

  it("reads snapshot dependencies safely", () => {
    const readSnapshot = createReactDebugSnapshotReader({
      state: { mode: "equipment", debug: {} },
      getAssetLoadingSummary: () => ({ loaded: 1, total: 2 }),
      getDomOverlayDiagnostics: () => ({ rootReady: true, gsapReady: false, layers: { toast: 1 } }),
      getLegacyDebugVisible: () => false,
      getReactDebugLoadState: () => ({ enabled: true, loading: true }),
      now: () => 500,
    });

    expect(readSnapshot()).toMatchObject({
      mode: "equipment",
      asset: { loaded: 1, total: 2, progress: 0.5 },
      dom: { rootReady: true, layerCount: 1 },
      reactDebug: { enabled: true, loading: true },
    });
  });

  it("dispatches only whitelisted safe intents through callbacks", () => {
    const coreState = { mode: "playing" };
    const refreshSnapshot = vi.fn(() => ({ mode: coreState.mode }));
    const toggleLegacyDebugHud = vi.fn(() => true);
    const bridge = createReactDebugIntentBridge({
      refreshSnapshot,
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
    expect(bridge.dispatch({ type: "setMode", value: "defeat" })).toEqual({
      ok: false,
      reason: "unsupported-intent",
      type: "setMode",
    });
    expect(coreState.mode).toBe("playing");
    expect(refreshSnapshot).toHaveBeenCalledOnce();
    expect(toggleLegacyDebugHud).toHaveBeenCalledOnce();
  });
});
