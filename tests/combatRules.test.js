import { describe, expect, it } from "vitest";
import {
  formatRotationKind,
  getBaseAttackRows,
  getDefeatCheckPriority,
  getComboAttackStyle,
  getDefeatSafetyResult,
  getHeroAttackStyle,
  getMoveRating,
  getOverlayRenderPath,
  getPlayingFlowSafetyResult,
  getRotationDamageBonus,
  isPlayerHpDefeated,
  shouldSettleRunRiftEnergy,
  shouldTriggerDefeat,
} from "../src/combat/combatRules.js";

describe("combat rule helpers", () => {
  it("calculates base attack rows by clear type", () => {
    expect(getBaseAttackRows(0, null)).toBe(0);
    expect(getBaseAttackRows(4, null)).toBe(4);
    expect(getBaseAttackRows(2, "full")).toBe(4);
  });

  it("selects combo and hero attack styles", () => {
    expect(getComboAttackStyle(1)).toBe("");
    expect(getComboAttackStyle(2)).toBe("combo1");
    expect(getComboAttackStyle(4)).toBe("combo3");
    expect(getHeroAttackStyle(0, null, true, 0, "")).toBe("ultimate");
    expect(getHeroAttackStyle(1, null, false, 0, "combo2")).toBe("combo");
    expect(getHeroAttackStyle(1, "full", false, 0, "")).toBe("tspin");
    expect(getHeroAttackStyle(4, null, false, 1, "")).toBe("b2b");
    expect(getHeroAttackStyle(4, null, false, 0, "")).toBe("tetris");
    expect(getHeroAttackStyle(3, null, false, 0, "")).toBe("tripleSlash");
    expect(getHeroAttackStyle(2, null, false, 0, "")).toBe("doubleSlash");
    expect(getHeroAttackStyle(1, null, false, 0, "")).toBe("slash");
  });

  it("formats rotation bonuses without global state", () => {
    expect(formatRotationKind("ccw")).toBe("Z");
    expect(getRotationDamageBonus(2, "T", "full", "cw")).toMatchObject({
      multiplier: 1,
      label: "T-CW SPIN",
    });
    expect(getRotationDamageBonus(1, "T", null, "180")).toMatchObject({
      multiplier: 1.2,
      label: "T 180 BONUS",
    });
  });

  it("rates moves from explicit combat context", () => {
    expect(getMoveRating(0, null, true)).toBe("PERFECT");
    expect(getMoveRating(2, null, false, { combo: 2 })).toBe("CLEAN");
    expect(getMoveRating(4, null, false)).toBe("BRUTAL");
    expect(getMoveRating(1, null, false, { b2bActive: true })).toBe("ARCANE");
  });

  it("keeps HP defeat checks explicit", () => {
    expect(isPlayerHpDefeated(1)).toBe(false);
    expect(isPlayerHpDefeated(0)).toBe(true);
    expect(isPlayerHpDefeated(-4)).toBe(true);
  });

  it("builds defeat safety results for active runs only", () => {
    expect(getDefeatSafetyResult({ mode: "playing", runFinalized: false, playerHp: 12, spawnBlocked: false })).toMatchObject({
      defeated: false,
      playerHp: 12,
    });
    expect(getDefeatSafetyResult({ mode: "playing", runFinalized: false, playerHp: 0, spawnBlocked: false })).toMatchObject({
      defeated: true,
      messageKey: "messagePlayerDefeat",
      reason: "playerHp",
      playerHp: 0,
    });
    expect(getDefeatSafetyResult({ mode: "playing", runFinalized: false, playerHp: -8, spawnBlocked: true })).toMatchObject({
      defeated: true,
      messageKey: "messagePlayerDefeat",
      reason: "playerHp",
      playerHp: 0,
    });
    expect(getDefeatSafetyResult({ mode: "playing", runFinalized: false, playerHp: 12, spawnBlocked: true })).toMatchObject({
      defeated: true,
      messageKey: "messageSpawnTop",
      reason: "spawnBlocked",
      playerHp: 12,
    });
    expect(getDefeatSafetyResult({ mode: "upgrade", runFinalized: false, playerHp: 0, spawnBlocked: true })).toMatchObject({
      defeated: false,
      playerHp: 0,
    });
    expect(getDefeatSafetyResult({ mode: "playing", runFinalized: true, playerHp: -4, spawnBlocked: true })).toMatchObject({
      defeated: false,
      playerHp: -4,
    });
  });

  it("prioritizes explicit spawn blocked defeat before playing-flow recovery", () => {
    expect(getDefeatCheckPriority({
      mode: "playing",
      runFinalized: false,
      playerHp: 12,
      spawnBlocked: true,
    })).toMatchObject({
      result: {
        defeated: true,
        messageKey: "messageSpawnTop",
        reason: "spawnBlocked",
        playerHp: 12,
      },
      shouldRunPlayingFlowSafety: false,
    });
  });

  it("keeps HP defeat above spawn blocked defeat", () => {
    expect(getDefeatCheckPriority({
      mode: "playing",
      runFinalized: false,
      playerHp: 0,
      spawnBlocked: true,
    })).toMatchObject({
      result: {
        defeated: true,
        messageKey: "messagePlayerDefeat",
        reason: "playerHp",
        playerHp: 0,
      },
      shouldRunPlayingFlowSafety: false,
    });
  });

  it("keeps ordinary playing-flow safety recovery available without explicit spawn blocked", () => {
    expect(getDefeatCheckPriority({
      mode: "playing",
      runFinalized: false,
      playerHp: 12,
      spawnBlocked: null,
    })).toMatchObject({
      result: {
        defeated: false,
        playerHp: 12,
      },
      shouldRunPlayingFlowSafety: true,
    });
  });

  it("allows defeat from pause or upgrade overlays but not after finalization", () => {
    expect(shouldTriggerDefeat({ mode: "pause", runFinalized: false })).toBe(true);
    expect(shouldTriggerDefeat({ mode: "paused", runFinalized: false })).toBe(true);
    expect(shouldTriggerDefeat({ mode: "upgrade", runFinalized: false })).toBe(true);
    expect(shouldTriggerDefeat({ mode: "defeat", runFinalized: false })).toBe(false);
    expect(shouldTriggerDefeat({ mode: "victory", runFinalized: true })).toBe(false);
  });

  it("routes defeat and victory to the result overlay path", () => {
    expect(getOverlayRenderPath({ mode: "defeat" })).toBe("result");
    expect(getOverlayRenderPath({ mode: "victory" })).toBe("result");
    expect(getOverlayRenderPath({ mode: "playing" })).toBe("none");
  });

  it("keeps upgrade, pause, countdown, and loading paths separate from result overlays", () => {
    expect(getOverlayRenderPath({ mode: "upgrade" })).toBe("upgrade");
    expect(getOverlayRenderPath({ mode: "ascensionResult" })).toBe("ascensionResult");
    expect(getOverlayRenderPath({ mode: "paused" })).toBe("pause");
    expect(getOverlayRenderPath({ mode: "start", assetLoadingDone: false })).toBe("assetLoading");
    expect(getOverlayRenderPath({ mode: "start", assetLoadingDone: true })).toBe("start");
  });

  it("classifies playing-flow stalls without using hidden rows alone", () => {
    expect(getPlayingFlowSafetyResult({ mode: "playing", runFinalized: false, hasActivePiece: false })).toMatchObject({
      action: "spawn",
      reason: "activeMissing",
    });
    expect(getPlayingFlowSafetyResult({
      mode: "playing",
      runFinalized: false,
      hasActivePiece: true,
      activeAboveVisible: true,
      activeGroundedAboveVisible: true,
    })).toMatchObject({
      action: "defeat",
      reason: "activeGroundedAboveVisible",
      messageKey: "messageLockAbove",
    });
    expect(getPlayingFlowSafetyResult({
      mode: "playing",
      runFinalized: false,
      hasActivePiece: true,
      activeAboveVisible: true,
      activeOverlapsBoard: true,
    })).toMatchObject({
      action: "defeat",
      reason: "activeOverlapsAboveVisible",
      messageKey: "messageSpawnTop",
    });
    expect(getPlayingFlowSafetyResult({
      mode: "playing",
      runFinalized: false,
      hasActivePiece: true,
      activeAboveVisible: true,
      activeOverlapsBoard: false,
      activeGroundedAboveVisible: false,
    })).toMatchObject({ action: "none" });
    expect(getPlayingFlowSafetyResult({
      mode: "playing",
      runFinalized: false,
      hasActivePiece: true,
      activeOverlapsBoard: true,
      activeAboveVisible: false,
    })).toMatchObject({
      action: "spawn",
      reason: "activeOverlapsLockedBoard",
    });
    expect(getPlayingFlowSafetyResult({
      mode: "playing",
      runFinalized: true,
      hasActivePiece: false,
    })).toMatchObject({ action: "none" });
  });

  it("settles Rift Energy only once per run", () => {
    expect(shouldSettleRunRiftEnergy({ riftEnergySettled: false })).toBe(true);
    expect(shouldSettleRunRiftEnergy({ riftEnergySettled: true })).toBe(false);
  });
});
