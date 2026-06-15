import { describe, expect, it, vi } from "vitest";
import { getAssetLoadingTransition } from "../src/core/assetLoadingController.js";
import { createGameModeSetter } from "../src/core/gameModeHelpers.js";
import {
  readActivePieceDebugInfo,
  readHiddenRowsDebugInfo,
} from "../src/debug/debugStateReaders.js";
import { createEnemyStageRenderer } from "../src/render/enemyStageRenderer.js";
import { createPlayerStageRenderer } from "../src/render/playerStageRenderer.js";
import { createCombatReadoutModel } from "../src/ui/combatReadoutModel.js";
import { createResultOverlayModel } from "../src/ui/resultOverlayModel.js";

const translate = (key) => ({
  dmgShort: "DMG",
  hitB2B: "B2B",
  hitCombo: "COMBO",
  hitPerfect: "PERFECT",
  hitTSpin: "T-SPIN",
  hitTSpinMini: "T-SPIN MINI",
  hitTetris: "TETRIS",
  "line.tetris": "TETRIS",
  perfectClearTitle: "PERFECT CLEAR",
}[key] || key);

function createCanvasContextStub() {
  const gradient = { addColorStop: vi.fn() };
  return new Proxy({
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
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

describe("combat readout model", () => {
  const model = createCombatReadoutModel({
    translate,
    format: (key, vars) => `${key}:${vars.lines}`,
    buildDamageEquation: () => "equation",
    boardX: 500,
    boardY: 40,
    random: () => 0.25,
  });

  it("builds the same operation and popup presentation data", () => {
    const meta = {
      combo: 4,
      b2b: true,
      effectiveLines: 5,
      damage: 18,
      breakdown: {},
    };
    expect(model.buildOperationReadout(4, "I", null, meta)).toMatchObject({
      title: "TETRIS",
      combo: 4,
      b2b: true,
      effectiveLines: 5,
      damage: 18,
      equation: "equation",
      life: 1650,
    });
    expect(model.buildCombatPopup(4, "I", null, meta)).toMatchObject({
      type: "b2b",
      text: "TETRIS + COMBO + B2B",
      subText: "18 DMG",
      x: 396,
      seed: 250,
    });
  });

  it("keeps perfect clear presentation dominant", () => {
    expect(model.buildCombatPopup(4, "I", null, {
      combo: 5,
      b2b: true,
      perfect: true,
      damage: 40,
    })).toMatchObject({
      type: "perfect",
      text: "PERFECT",
      life: 1240,
      maxLife: 1240,
      scale: 1.18,
    });
  });
});

describe("low-risk coordinator helpers", () => {
  it("reports asset completion without mutating state", () => {
    const isComplete = vi.fn(() => true);
    const transition = getAssetLoadingTransition({
      loadingDone: false,
      startedAt: 100,
      now: 800,
      summary: { loaded: 5, loading: 0 },
      minMs: 500,
      maxMs: 2000,
      isComplete,
    });
    expect(transition).toMatchObject({ completed: true, elapsed: 700 });
    expect(isComplete).toHaveBeenCalledWith(
      { loaded: 5, loading: 0 },
      700,
      { minMs: 500, maxMs: 2000 },
    );
  });

  it("synchronizes canvas and DOM presentation modes", () => {
    const state = { mode: "start" };
    const setDomOverlayMode = vi.fn();
    const setFeedbackMode = vi.fn();
    const setMode = createGameModeSetter({
      state,
      setDomOverlayMode,
      setFeedbackMode,
    });
    expect(setMode("playing")).toBe("playing");
    expect(state.mode).toBe("playing");
    expect(setDomOverlayMode).toHaveBeenCalledWith("playing");
    expect(setFeedbackMode).toHaveBeenCalledWith("playing");
  });

  it("creates debug snapshots without exposing mutable pieces", () => {
    const piece = { type: "T", x: 3, y: -1, shape: [[1]] };
    expect(readActivePieceDebugInfo(piece)).toEqual({ type: "T", x: 3, y: -1 });
    const hidden = readHiddenRowsDebugInfo(
      [[null, "I"], [null, null], ["T", null]],
      2,
      (row) => row.some(Boolean),
    );
    expect(hidden).toEqual({ occupied: true, rows: [true, false] });
  });

  it("builds result overlay input from state", () => {
    const state = {
      mode: "defeat",
      stats: { damageSources: { line: 3 } },
    };
    expect(createResultOverlayModel({
      state,
      message: "Run ended",
      buttons: { retry: {} },
      translate: (key) => key,
    })).toMatchObject({
      victory: false,
      message: "Run ended",
      buttons: { retry: {} },
      damageSources: "line 3",
    });
  });
});

describe("stage renderer wiring", () => {
  const characterBaselines = {
    player: {
      scale: 1,
      centerOffsetX: 0,
      groundY: 500,
      localY: 100,
      glowRadius: 80,
      sigilYOffset: 10,
      sigilRadius: 40,
      shadowW: 100,
      animationScale: 1,
      animationBottomOffset: 0,
    },
    enemy: {
      scale: 1,
      centerOffsetX: 0,
      groundY: 500,
      localY: 100,
      glowRadius: 80,
      sigilYOffset: 10,
      sigilRadius: 40,
      shadowW: 100,
    },
  };
  const uiLayout = {
    panelPadding: 10,
    playerPanel: { x: 0, y: 0, w: 200 },
    playerStage: { x: 0, w: 200 },
    enemyPanel: { x: 300, y: 0, w: 200 },
    enemyStage: { x: 300, w: 200 },
  };

  it("draws the player idle path through injected presentation callbacks", () => {
    const ctx = createCanvasContextStub();
    const drawHeroIdleBase = vi.fn();
    const drawPlayerRelicProgress = vi.fn();
    const renderer = createPlayerStageRenderer({
      ctx,
      state: {
        playerHit: 0,
        attacks: [],
        playerHp: 100,
        playerMaxHp: 100,
        heroAnimation: null,
        heroLevelUpFx: null,
      },
      uiLayout,
      characterBaselines,
      heroAnimations: {},
      heroLevelUpEffect: { image: {}, draw: {} },
      playerHitAnimation: { image: {}, draw: {} },
      heroHitDurationMs: 100,
      debugHudEnabled: false,
      getDebugArtTuning: () => ({
        playerScale: 1,
        heroAttackScale: 1,
      }),
      getBaselineAnchorY: () => 400,
      alignDrawBoxToBaseline: (draw) => draw,
      drawHpBar: vi.fn(),
      drawGuardMeter: vi.fn(),
      drawStageGlow: vi.fn(),
      drawPresentationSigil: vi.fn(),
      drawCharacterShadow: vi.fn(),
      drawNoaAttackPose: vi.fn(),
      drawHeroIdleBase,
      drawHeroIdleEnergy: vi.fn(),
      drawFallbackHeroAttackAnimation: vi.fn(),
      drawPlayerRelicProgress,
      drawSpriteAnimationFrame: vi.fn(),
      isImageReady: () => false,
      t: translate,
      now: () => 100,
    });

    expect(() => renderer.drawPlayer()).not.toThrow();
    expect(drawHeroIdleBase).toHaveBeenCalledOnce();
    expect(drawPlayerRelicProgress).toHaveBeenCalledOnce();
  });

  it("draws the enemy fallback path through the panel renderer", () => {
    const ctx = createCanvasContextStub();
    const drawSlimeFallback = vi.fn();
    const enemyPanelRenderer = {
      drawBossPhaseBar: vi.fn(),
      drawEnemyBehaviorChips: vi.fn(),
      drawEnemyIntent: vi.fn(),
      getEnemyIntent: vi.fn(() => ({ color: "#ffffff" })),
    };
    const renderer = createEnemyStageRenderer({
      ctx,
      state: {
        enemyHit: 0,
        enemyHitIntensity: 0,
        enemyHpDisplay: 10,
        enemyHp: 10,
        enemyHpTrail: 10,
        enemyMaxHp: 10,
        enemyAnimation: null,
        enemyDeathVfx: null,
        enemyType: {
          id: "slime",
          color: "#00ff00",
          filter: "none",
        },
      },
      uiLayout,
      characterBaselines,
      enemyBattlePortraits: {},
      slimeArt: {},
      enemyDeathAnimation: { image: {}, draw: {} },
      enemyAttackAnimations: {},
      getEnemyDeathTransitionState: vi.fn(),
      debugHudEnabled: false,
      getDebugArtTuning: () => ({
        enemyScale: 1,
        enemyAttackScale: 1,
      }),
      getBaselineAnchorY: () => 400,
      alignDrawBoxToBaseline: (draw) => draw,
      drawHpBar: vi.fn(),
      drawStageGlow: vi.fn(),
      drawPresentationSigil: vi.fn(),
      drawCharacterShadow: vi.fn(),
      scaleAroundBaseline: vi.fn(),
      drawEnemyOverlay: vi.fn(),
      drawEnemySilhouette: vi.fn(),
      drawSlimeFallback,
      drawImageContain: vi.fn(),
      drawSpriteAnimationFrame: vi.fn(),
      isImageReady: () => false,
      enemyPanelRenderer,
      t: translate,
      now: () => 100,
    });

    expect(() => renderer.drawEnemy()).not.toThrow();
    expect(enemyPanelRenderer.drawEnemyIntent).toHaveBeenCalledOnce();
    expect(drawSlimeFallback).toHaveBeenCalledOnce();
  });
});
