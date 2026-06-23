import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  createReactGameplayHudSnapshot,
  createReactGameplayHudSnapshotReader,
} from "../src/react/bridge/gameStateSnapshot.js";
import { createReactGameplayHudController } from "../src/react/gameplayHudController.js";
import { translations } from "../src/data/i18n.js";

const root = path.resolve(import.meta.dirname, "..");

function translate(key) {
  return translations.en[key] || key;
}

function format(key, vars = {}) {
  return translate(key).replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? `{${name}}`);
}

function basePlayingState(overrides = {}) {
  return {
    assetLoadingDone: true,
    mode: "playing",
    nextUpgradeAt: 8,
    settingsOpen: false,
    ultimateActive: false,
    ultimateCharge: 0,
    ultimateTimer: 0,
    ultimateTimerMax: 15000,
    upgradeMeter: 0,
    upgradeReady: false,
    upgradeTier: 0,
    ...overrides,
  };
}

describe("React gameplay HUD snapshot", () => {
  it("exposes 0/40 4-wide charge and 0/8 upgrade progress as read-only data", () => {
    const state = basePlayingState();
    const snapshot = createReactGameplayHudSnapshot({
      format,
      state,
      translate,
      ultimateRequiredLines: 40,
      upgradeGrowthPerTier: 4,
    });

    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.fourWide)).toBe(true);
    expect(Object.isFrozen(snapshot.upgrade)).toBe(true);
    expect(snapshot.enabled).toBe(true);
    expect(snapshot.fourWide).toMatchObject({
      active: false,
      current: 0,
      ready: false,
      remaining: 40,
      target: 40,
      value: "0 / 40",
    });
    expect(snapshot.fourWide.detail).toBe("40 lines until 4-wide");
    expect(snapshot.fourWide.ratio).toBe(0);
    expect(snapshot.upgrade).toMatchObject({
      current: 0,
      ready: false,
      remaining: 8,
      target: 8,
      value: "0 / 8",
    });
    expect(snapshot.upgrade.detail).toBe("8 until next upgrade");
    expect(snapshot.upgrade.ratio).toBe(0);

    state.ultimateCharge = 40;
    expect(snapshot.fourWide.value).toBe("0 / 40");
  });

  it("reports mid-progress 4-wide and upgrade values without mutating state", () => {
    const state = basePlayingState({
      nextUpgradeAt: 8,
      ultimateCharge: 20,
      upgradeMeter: 7,
    });
    const snapshot = createReactGameplayHudSnapshot({
      format,
      state,
      translate,
      ultimateRequiredLines: 40,
      upgradeGrowthPerTier: 4,
    });

    expect(snapshot.fourWide).toMatchObject({
      current: 20,
      remaining: 20,
      value: "20 / 40",
    });
    expect(snapshot.fourWide.ratio).toBe(0.5);
    expect(snapshot.upgrade).toMatchObject({
      current: 7,
      remaining: 1,
      value: "7 / 8",
    });
    expect(snapshot.upgrade.ratio).toBe(0.875);
    expect(state.upgradeMeter).toBe(7);
  });

  it("reports active 4-wide mode and ready upgrade progress", () => {
    const snapshot = createReactGameplayHudSnapshot({
      format,
      state: basePlayingState({
        nextUpgradeAt: 8,
        ultimateActive: true,
        ultimateCharge: 40,
        ultimateTimer: 9300,
        ultimateTimerMax: 15000,
        upgradeMeter: 8,
        upgradeReady: true,
      }),
      translate,
      ultimateRequiredLines: 40,
      upgradeGrowthPerTier: 4,
    });

    expect(snapshot.fourWide).toMatchObject({
      active: true,
      badge: "ACTIVE",
      current: 40,
      displayMode: "active",
      ready: true,
      remaining: 0,
      value: "ACTIVE",
    });
    expect(snapshot.fourWide.detail).toBe("Board timer active");
    expect(snapshot.fourWide.detail).not.toContain("10s");
    expect(snapshot.fourWide.ratio).toBe(1);
    expect(snapshot.upgrade).toMatchObject({
      current: 8,
      ready: true,
      remaining: 0,
      value: "8 / 8",
    });
    expect(snapshot.upgrade.detail).toBe("Upgrade draft ready");
  });

  it("uses the existing tiered upgrade threshold math after the first upgrade", () => {
    const snapshot = createReactGameplayHudSnapshot({
      format,
      state: basePlayingState({
        nextUpgradeAt: 12,
        upgradeMeter: 10,
        upgradeTier: 1,
      }),
      translate,
      upgradeGrowthPerTier: 4,
    });

    expect(snapshot.upgrade).toMatchObject({
      current: 2,
      remaining: 2,
      target: 4,
      value: "2 / 4",
    });
  });

  it("keeps gameplay HUD disabled outside gameplay or before first-paint assets are ready", () => {
    const readSnapshot = createReactGameplayHudSnapshotReader({
      state: basePlayingState({ assetLoadingDone: false }),
      translate,
    });
    expect(readSnapshot().enabled).toBe(false);
    expect(createReactGameplayHudSnapshot({
      state: basePlayingState({ mode: "start" }),
      translate,
    }).enabled).toBe(false);
  });

  it("mounts only in gameplay and unmounts when leaving gameplay", async () => {
    const state = basePlayingState();
    let mounted = true;
    const mountedController = {
      isMounted: vi.fn(() => mounted),
      unmount: vi.fn(() => {
        mounted = false;
      }),
    };
    const mountReactGameplayHudOverlay = vi.fn(() => mountedController);
    const createReactGameplayHudSnapshotReader = vi.fn((deps) => {
      expect(deps.state).toBe(state);
      expect(deps.ultimateRequiredLines).toBe(40);
      return () => ({ enabled: true, mode: state.mode });
    });
    const controller = createReactGameplayHudController({
      loaders: {
        reactOverlay: () => Promise.resolve({ mountReactGameplayHudOverlay }),
        snapshotBridge: () => Promise.resolve({ createReactGameplayHudSnapshotReader }),
      },
      state,
      ultimateRequiredLines: 40,
      upgradeGrowthPerTier: 4,
    });

    expect(controller.isActive()).toBe(false);
    await controller.load();
    expect(mountReactGameplayHudOverlay).toHaveBeenCalledOnce();
    expect(createReactGameplayHudSnapshotReader).toHaveBeenCalledOnce();
    expect(controller.isActive()).toBe(true);

    state.mode = "upgrade";
    controller.update();
    expect(mountedController.unmount).toHaveBeenCalledOnce();
    expect(controller.isActive()).toBe(false);
  });

  it("does not mount before first-paint readiness", async () => {
    const mountReactGameplayHudOverlay = vi.fn();
    const controller = createReactGameplayHudController({
      loaders: {
        reactOverlay: () => Promise.resolve({ mountReactGameplayHudOverlay }),
      },
      state: basePlayingState({ assetLoadingDone: false }),
    });

    await expect(controller.load()).resolves.toBeNull();
    expect(mountReactGameplayHudOverlay).not.toHaveBeenCalled();
    expect(controller.isActive()).toBe(false);
  });
});

describe("React gameplay HUD presentation", () => {
  it("keeps the gameplay HUD non-interactive and motion-reduced friendly", () => {
    const css = fs.readFileSync(path.join(root, "src/react/styles/gameplayHudOverlay.css"), "utf8");
    expect(css).toContain(".tst-react-gameplay-hud-layer");
    expect(css).toContain("pointer-events: none");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain(".tst-gameplay-hud-compact");
    expect(css).toContain(".tst-gameplay-hud-row");
    expect(css).toContain(".tst-gameplay-hud-meter-fill-ultimate");
    expect(css).toContain(".tst-gameplay-hud-meter-fill-upgrade");
  });

  it("renders a single compact progress module instead of two large cards", () => {
    const source = fs.readFileSync(path.join(root, "src/react/components/GameplayHudOverlay.js"), "utf8");
    expect(source).toContain("data-tst-gameplay-hud-compact");
    expect(source).toContain("tst-gameplay-hud-divider");
    expect(source).not.toContain("tst-gameplay-hud-card");
  });

  it("defines complete zh and en i18n keys for gameplay HUD text", () => {
    const keys = [
      "gameplayHudFourWideTitle",
      "gameplayHudFourWideRemaining",
      "gameplayHudFourWideActive",
      "gameplayHudFourWideActiveBadge",
      "gameplayHudFourWideActiveCompact",
      "gameplayHudFourWideReady",
      "gameplayHudUpgradeTitle",
      "gameplayHudUpgradeRemaining",
      "gameplayHudUpgradeReady",
    ];
    for (const key of keys) {
      expect(translations.zh[key]).toBeTruthy();
      expect(translations.en[key]).toBeTruthy();
    }
  });

  it("keeps Canvas relic progress as fallback instead of drawing it over React HUD", () => {
    const source = fs.readFileSync(path.join(root, "game.js"), "utf8");
    expect(source).toContain("function drawPlayerRelicProgressFallback()");
    expect(source).toContain("if (isReactGameplayHudActive()) return;");
    expect(source).toContain("drawPlayerRelicProgress: drawPlayerRelicProgressFallback");
    expect(source).not.toContain("drawPlayerRelicProgress: battleHudRenderer.drawPlayerRelicProgress");
  });

  it("keeps the Canvas board-bottom 4-wide countdown as the active timer authority", () => {
    const source = fs.readFileSync(path.join(root, "src/render/battleBoardRenderer.js"), "utf8");
    expect(source).toContain("function drawUltimateCountdownBar()");
    expect(source).toContain("const secondsText = `${getUltimateCountdownSeconds(remaining)}s`;");
    expect(source).toContain("ctx.fillText(\"4-WIDE\"");
  });
});
