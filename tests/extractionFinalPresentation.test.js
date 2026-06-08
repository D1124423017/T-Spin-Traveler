import { describe, expect, it, vi } from "vitest";
import { createCombatAnimationStateController } from "../src/render/combatAnimationStateController.js";
import { createBattleFeedbackController } from "../src/ui/battleFeedbackController.js";
import { createOverlayRenderController } from "../src/ui/overlayRenderController.js";

describe("overlay render controller", () => {
  it("adapts non-result overlays without owning mode flow", () => {
    const drawMetaUpgradeScreen = vi.fn();
    const drawStartMenuOverlay = vi.fn();
    const renderAscensionResultOverlay = vi.fn();
    const renderAscensionChallengeHud = vi.fn();
    const settingsDraw = vi.fn();
    const upgradeDraw = vi.fn();
    const state = {
      settingsOpen: true,
      metaProgress: { riftEnergy: 12 },
      pointer: { x: 3, y: 4 },
      metaUpgradeMessage: { key: "message" },
      ascensionRun: { status: "active" },
    };
    const bindings = {
      ctx: {},
      state,
      t: vi.fn(),
      fmt: vi.fn(),
      getMessage: () => "status",
      canvasFont: vi.fn(),
      label: vi.fn(),
      fitLabel: vi.fn(),
      wrapText: vi.fn(),
      roundedRect: vi.fn(),
      drawImageContain: vi.fn(),
      drawMainMenuScene: vi.fn(),
      drawStartMenuOverlay,
      drawDimOverlay: vi.fn(),
      drawCard: vi.fn(),
      drawCornerGlyph: vi.fn(),
      drawMenuButton: vi.fn(),
      drawMetaUpgradeScreen,
      renderAscensionResultOverlay,
      renderAscensionChallengeHud,
      settingsScreenRenderer: { draw: settingsDraw },
      upgradeScreenRenderer: { drawUpgradeOverlay: upgradeDraw },
      resultScrim: "rgba(0,0,0,0.7)",
      metaUpgradeIcons: {},
      riftEnergyIcon: {},
      now: () => 1234,
    };
    const controller = createOverlayRenderController(() => bindings);

    controller.drawMetaUpgradeOverlay();
    controller.drawStartOverlay();
    controller.drawAscensionResultOverlay();
    controller.drawAscensionChallengeHud();
    controller.drawUpgradeOverlay();

    expect(drawMetaUpgradeScreen).toHaveBeenCalledWith(expect.objectContaining({
      progress: state.metaProgress,
      pointer: state.pointer,
      message: state.metaUpgradeMessage,
      now: 1234,
    }));
    expect(drawStartMenuOverlay).toHaveBeenCalledOnce();
    expect(settingsDraw).toHaveBeenCalledWith("start");
    expect(renderAscensionResultOverlay).toHaveBeenCalledWith(expect.objectContaining({
      run: state.ascensionRun,
      message: "status",
      resultScrim: bindings.resultScrim,
    }));
    expect(renderAscensionChallengeHud).toHaveBeenCalledWith(expect.objectContaining({
      run: state.ascensionRun,
    }));
    expect(upgradeDraw).toHaveBeenCalledOnce();
    expect(controller.drawResultOverlay).toBeUndefined();
  });
});

describe("battle feedback controller", () => {
  it("preserves clear feedback conditions and bounded readout queues", () => {
    const state = {
      b2bActive: true,
      b2bChain: 3,
      operationReadouts: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
      combatPopups: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
      enemyHit: 0,
      enemyHitIntensity: 0,
    };
    const showComboFeedback = vi.fn();
    const showB2BFeedback = vi.fn();
    const showTSpinFeedback = vi.fn();
    const showPerfectClearFeedback = vi.fn();
    const showDamageNumber = vi.fn();
    const controller = createBattleFeedbackController({
      state,
      translate: (key) => key,
      format: (key, vars) => `${key}:${Object.values(vars).join(",")}`,
      positions: {
        combo: "combo-pos",
        b2b: "b2b-pos",
        tspin: "tspin-pos",
        perfect: "perfect-pos",
        damage: "damage-pos",
      },
      buildOperationReadout: () => ({ id: "new-readout" }),
      buildCombatPopup: () => ({ id: "new-popup" }),
      showComboFeedback,
      showB2BFeedback,
      showTSpinFeedback,
      showPerfectClearFeedback,
      showDamageNumber,
    });

    controller.pushOperationReadout(4, "T", "full", {});
    controller.showBattleClearFeedback({
      lines: 4,
      pieceType: "T",
      spinType: "full",
      damage: 42,
      context: { combo: 3, perfect: true },
    });
    controller.showPlayerDamageFeedback({
      damage: 90,
      b2bHit: true,
      comboBurst: false,
      context: { lines: 4, spinType: "full", perfect: false },
    });

    expect(state.operationReadouts).toHaveLength(4);
    expect(state.operationReadouts[0]).toEqual({ id: "new-readout" });
    expect(state.combatPopups).toHaveLength(5);
    expect(state.combatPopups[0]).toEqual({ id: "new-popup" });
    expect(showComboFeedback).toHaveBeenCalledOnce();
    expect(showB2BFeedback).toHaveBeenCalledOnce();
    expect(showTSpinFeedback).toHaveBeenCalledOnce();
    expect(showPerfectClearFeedback).toHaveBeenCalledOnce();
    expect(showDamageNumber).toHaveBeenCalledWith({
      amount: 90,
      position: "damage-pos",
    });
    expect(state.enemyHit).toBeGreaterThan(230);
    expect(state.enemyHitIntensity).toBeGreaterThan(1);
  });
});

describe("combat animation state controller", () => {
  it("updates presentation state without scheduling hits or applying damage", () => {
    const state = {
      attacks: [],
      floaters: [],
      bursts: [],
      enemyType: { id: "king" },
      enemyCountdown: 1,
      enemyAttackDamage: 12,
      shake: 0,
      enemyAnimation: null,
      lastBossPhase: 1,
    };
    const playSfx = vi.fn();
    const spawnEnemyDeathParticles = vi.fn();
    const slash = { id: "slash" };
    const enemyConfig = { id: "enemy" };
    const controller = createCombatAnimationStateController({
      state,
      heroAnimations: { slash },
      heroLevelUpEffect: { id: "level" },
      enemyAttackAnimations: { king: enemyConfig },
      enemyAttackDurationMs: 700,
      enemyHitDelayMs: 350,
      bossWindupMs: 900,
      bossPhaseBannerMs: 1200,
      enemyDeathDurationMs: 800,
      heavyAttackWarningDamage: 10,
      boardX: 100,
      boardY: 50,
      cols: 10,
      tileSize: 20,
      resolvePlayerAttackVfx: () => ({
        totalDurationMs: 640,
        hitDelayMs: 280,
        heroConfig: slash,
        heroKind: "slash",
        style: "arc",
      }),
      resolveEnemyAttackVfx: () => ({
        bodyDurationMs: 720,
      }),
      getAnimationDuration: () => 500,
      getBossPhase: () => 3,
      format: (key, vars) => `${key}:${vars.phase}`,
      translate: (key) => key,
      playSfx,
      spawnEnemyDeathParticles,
      now: () => 1234,
    });

    controller.startPlayerAttackPresentation({
      attackStyle: "slash",
      comboAttackStyle: "",
      damage: 40,
      isTSpin: false,
      special: false,
      lines: 2,
      context: {},
    });
    controller.startEnemyAttackPresentation(
      { id: "king", attackSprite: true },
      3,
      { bodyConfig: enemyConfig, totalDurationMs: 880, shake: 12 },
    );
    controller.triggerBossPhaseSignal(3);
    controller.triggerHeavyAttackWarning();
    controller.startEnemyDeathTransition({ id: "king" }, true);

    expect(controller.getHeroAnimationDuration("slash")).toBe(640);
    expect(controller.getHeroHitDelay("slash")).toBe(280);
    expect(controller.getEnemyAnimationDuration("king")).toBe(720);
    expect(controller.getEnemyHitDelay()).toBe(350);
    expect(state.heroAnimation).toEqual({
      kind: "slash",
      startedAt: 1234,
      duration: 500,
    });
    expect(state.attacks).toHaveLength(2);
    expect(state.attacks[1]).toMatchObject({
      type: "enemy",
      bossPhase: 3,
      duration: 880,
    });
    expect(state.bossPhaseBanner).toEqual({
      phase: 3,
      life: 1200,
      duration: 1200,
    });
    expect(state.bossWindup).toMatchObject({
      phase: 3,
      life: 900,
      duration: 900,
    });
    expect(state.floaters.some((entry) => entry.text === "heavyAttackIncoming")).toBe(true);
    expect(state.enemyDeathVfx).toMatchObject({
      enemy: { id: "king" },
      revealNext: true,
      duration: 800,
    });
    expect(spawnEnemyDeathParticles).toHaveBeenCalledWith({ id: "king" });
    expect(playSfx).toHaveBeenCalledWith("enemyWarnStrong");
    expect(state.pendingHits).toBeUndefined();
  });
});
