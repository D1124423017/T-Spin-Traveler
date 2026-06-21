import { describe, expect, it, vi } from "vitest";
import {
  createAssetLoadingController,
} from "../src/core/assetLoadingController.js";
import {
  createBattleCountdownCueReader,
  getBattleCountdownCue,
} from "../src/core/battleCountdownModel.js";
import { createBuildStatsController } from "../src/core/buildStatsController.js";
import { createRunStatsFactory } from "../src/core/runStatsFactory.js";
import { createBattleParticleSpawner } from "../src/render/battleParticleSpawner.js";
import { createGameplayFrameController } from "../src/render/gameplayFrameController.js";
import { createMenuButtonRenderer } from "../src/ui/menuButtonRenderer.js";

function createCanvasContextStub() {
  const gradient = { addColorStop: vi.fn() };
  return new Proxy({
    globalAlpha: 1,
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    measureText: (text) => ({ width: String(text).length * 8 }),
  }, {
    get(target, key) {
      if (key in target) return target[key];
      if (typeof key === "symbol") return target[key];
      const noop = vi.fn();
      target[key] = noop;
      return noop;
    },
    set(target, key, value) {
      target[key] = value;
      return true;
    },
  });
}

describe("run stats factory", () => {
  it("creates fresh combat and settlement stats", () => {
    const { makeStats, makeRunStats } = createRunStatsFactory({
      damageSourceKeys: ["line", "spin"],
    });
    const stats = makeStats();
    const runStats = makeRunStats();

    expect(stats.damageSources).toEqual({ line: 0, spin: 0 });
    expect(stats.rating).toBe("GOOD");
    expect(runStats).toMatchObject({
      waveReached: 1,
      riftEnergyEarned: 0,
      riftEnergySettled: false,
    });
    expect(makeStats()).not.toBe(stats);
  });
});

describe("build stats controller", () => {
  it("delegates existing trait calculations without owning values", () => {
    const state = {
      acquiredRelics: [{ id: "tspin_amp", rarity: "common" }],
    };
    const controller = createBuildStatsController({
      state,
      translate: (key) => key,
      format: (key, vars) => `${key}:${vars.families}`,
    });

    expect(controller.getTraitCount("Spin")).toBe(1);
    expect(controller.getAcquiredRelicGroups()).toHaveLength(1);
    expect(controller.getCurrentBuildFamilyStats()[0]).toMatchObject({
      count: 1,
    });
    expect(controller.getCurrentBuildDirectionText([])).toBe("currentBuildNoDirection");
  });
});

describe("countdown presentation model", () => {
  it("keeps numeric and START cue thresholds stable", () => {
    const options = { durationMs: 3600, startWindowMs: 600 };
    expect(getBattleCountdownCue(0, options)).toBe("");
    expect(getBattleCountdownCue(500, options)).toBe("START");
    expect(getBattleCountdownCue(3600, options)).toBe("3");

    const state = { countdownMs: 1600 };
    const readCue = createBattleCountdownCueReader({ state, ...options });
    expect(readCue()).toBe("1");
  });
});

describe("asset loading controller", () => {
  it("applies completion state and callback once", () => {
    const state = {
      assetLoadingDone: false,
      assetLoadingStartedAt: 100,
      menuRevealStartedAt: 0,
    };
    const onCompleted = vi.fn();
    const updateAssetLoading = createAssetLoadingController({
      state,
      getSummary: () => ({ loading: 0, loaded: 5 }),
      minMs: 500,
      maxMs: 2000,
      isComplete: () => true,
      onCompleted,
    });

    expect(updateAssetLoading(800)).toBe(true);
    expect(state).toMatchObject({
      assetLoadingDone: true,
      menuRevealStartedAt: 800,
    });
    expect(updateAssetLoading(900)).toBe(false);
    expect(onCompleted).toHaveBeenCalledOnce();
  });

  it("waits for critical first-paint readiness before completing", () => {
    const state = {
      assetLoadingDone: false,
      assetLoadingStartedAt: 100,
      menuRevealStartedAt: 0,
    };
    let criticalReady = false;
    const updateAssetLoading = createAssetLoadingController({
      state,
      getSummary: () => ({ loading: 0, loaded: 5 }),
      getCriticalReadiness: () => ({ ready: criticalReady }),
      minMs: 500,
      maxMs: 2000,
      isComplete: (summary, elapsed, options) => options.criticalReady
        && (summary.loading === 0 || elapsed >= options.maxMs),
    });

    expect(updateAssetLoading(3000)).toBe(false);
    expect(state.assetLoadingDone).toBe(false);

    criticalReady = true;
    expect(updateAssetLoading(3100)).toBe(true);
    expect(state.assetLoadingDone).toBe(true);
  });

  it("holds on the loading-complete shimmer before revealing the menu", () => {
    const state = {
      assetLoadingDone: false,
      assetLoadingStartedAt: 100,
      assetLoadingCompletingAt: 0,
      menuRevealStartedAt: 0,
    };
    const updateAssetLoading = createAssetLoadingController({
      state,
      getSummary: () => ({ loading: 0, loaded: 5 }),
      getCriticalReadiness: () => ({ ready: true }),
      minMs: 500,
      maxMs: 2000,
      completionDelayMs: 320,
      isComplete: () => true,
    });

    expect(updateAssetLoading(800)).toBe(false);
    expect(state.assetLoadingCompletingAt).toBe(800);
    expect(state.assetLoadingDone).toBe(false);
    expect(updateAssetLoading(1119)).toBe(false);
    expect(updateAssetLoading(1120)).toBe(true);
    expect(state.menuRevealStartedAt).toBe(1120);
  });
});

describe("battle particle spawner", () => {
  it("adds only presentation particles and bursts", () => {
    const state = {
      ultimateActive: false,
      particles: [],
      bursts: [],
    };
    const spawner = createBattleParticleSpawner({
      state,
      boardX: 100,
      boardY: 50,
      cols: 4,
      rows: 20,
      hiddenRows: 2,
      tileSize: 10,
      uiLayout: { enemyStage: { x: 700, w: 200 } },
      enemyBaseline: { centerOffsetX: 0, groundY: 500, scale: 1 },
      enemyDeathParticleCount: 3,
      getUltimateWellRange: () => ({ start: 0, end: 4, width: 4 }),
      isUltimateWellColumn: () => true,
      random: () => 0.5,
    });

    spawner.spawnLineParticles([3]);
    spawner.spawnClearBurst(4, 2);
    spawner.spawnEnemyDeathParticles({ color: "#ffffff" });
    spawner.spawnGarbageParticles(1);

    expect(state.bursts).toHaveLength(1);
    expect(state.particles.filter((particle) => particle.kind === "enemy-death")).toHaveLength(3);
    expect(state.particles.length).toBeGreaterThan(10);
  });
});

describe("gameplay frame controller", () => {
  it("routes the same gameplay draw layers and playing HUD", () => {
    const ctx = createCanvasContextStub();
    const state = {
      mode: "playing",
      wave: 1,
      shake: 0,
      debug: {},
    };
    const drawPanels = vi.fn();
    const drawTraitList = vi.fn();
    const drawRunRiftEnergyHud = vi.fn();
    const drawPauseButton = vi.fn();
    const drawOverlay = vi.fn();
    const draw = createGameplayFrameController({
      ctx,
      width: 1280,
      height: 720,
      state,
      drawBattleBackground: vi.fn(),
      drawGameplayFrame: ({
        drawPanels: drawFramePanels,
        drawTraitList: drawFrameTraitList,
        drawOverlay: drawFrameOverlay,
        drawSettings,
      }) => {
        drawFramePanels();
        drawFrameTraitList();
        drawFrameOverlay();
        drawSettings();
      },
      normalEnemyCyclesBeforeBoss: 2,
      getNormalEnemyCount: () => 3,
      drawImageCover: vi.fn(),
      roundedRect: vi.fn(),
      battleSceneRenderer: { drawPanels },
      battleHudRenderer: {
        drawTraitList,
        drawRunRiftEnergyHud,
        drawPauseButton,
      },
      drawPlayer: vi.fn(),
      drawEnemy: vi.fn(),
      drawBoard: vi.fn(),
      drawSidePieces: vi.fn(),
      drawAttackEffects: vi.fn(),
      drawBursts: vi.fn(),
      drawParticles: vi.fn(),
      drawFloaters: vi.fn(),
      drawCombatPopups: vi.fn(),
      drawBossPhaseWarning: vi.fn(),
      drawBattleCountdown: vi.fn(),
      drawFirstWaveCombatHint: vi.fn(),
      drawTutorialPrompt: vi.fn(),
      drawPerfectClearFx: vi.fn(),
      drawOverlay,
    }).draw;

    draw();

    expect(drawPanels).toHaveBeenCalledOnce();
    expect(drawTraitList).toHaveBeenCalledOnce();
    expect(drawOverlay).toHaveBeenCalledOnce();
    expect(drawRunRiftEnergyHud).toHaveBeenCalledOnce();
    expect(drawPauseButton).toHaveBeenCalledOnce();
  });
});

describe("menu button renderer", () => {
  it("binds pointer and timing state to the shared panel renderer", () => {
    const ctx = createCanvasContextStub();
    const roundedRect = vi.fn();
    const drawMenuButton = createMenuButtonRenderer({
      ctx,
      state: { pointer: { x: 10, y: 10 } },
      canvasFont: () => "16px sans-serif",
      fitLabel: vi.fn(),
      roundedRect,
      now: () => 100,
    });

    drawMenuButton(0, 0, 120, 48, "Start", "Enter", "primary");

    expect(roundedRect).toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalledWith("Enter", 102, 25);
  });
});
