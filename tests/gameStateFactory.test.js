import { describe, expect, it, vi } from "vitest";
import { createGameState } from "../src/core/gameStateFactory.js";

function createState(overrides = {}) {
  return createGameState({
    makeBoard: vi.fn(() => [["board"]]),
    makeStats: vi.fn(() => ({ peakWave: 0 })),
    loadSave: vi.fn(() => ({ save: true })),
    loadMetaProgress: vi.fn(() => ({ riftEnergy: 12 })),
    makeRunStats: vi.fn(() => ({ waveReached: 1 })),
    createDebugHudState: vi.fn(() => ({ drawError: "" })),
    createEquipmentCombatState: vi.fn(() => ({ wave: 1, fatalSaveUsed: false })),
    normalizeControlsMap: vi.fn((controls) => ({ ...controls })),
    defaultControls: { left: ["a"] },
    defaultTuning: { das: 120 },
    playerMaxHp: 100,
    guardMax: 40,
    firstEnemy: { id: "slime" },
    ultimateDurationMs: 15000,
    now: 1234,
    ...overrides,
  });
}

describe("game state factory", () => {
  it("preserves the coordinator defaults without reading browser storage directly", () => {
    const state = createState();

    expect(state).toMatchObject({
      mode: "start",
      runMode: "endless",
      playerHp: 100,
      playerMaxHp: 100,
      maxGuard: 40,
      enemyHp: 120,
      enemyCountdown: 7,
      enemyType: { id: "slime" },
      ultimateTimerMax: 15000,
      menuSpecialIdleStartedAt: 1234,
      assetLoadingStartedAt: 1234,
      equipmentCombat: { wave: 1, fatalSaveUsed: false },
    });
    expect(state.board).toEqual([["board"]]);
    expect(state.metaProgress).toEqual({ riftEnergy: 12 });
    expect(state.upgrades).toMatchObject({
      tspinBonus: 0,
      perfectRiftCrown: 0,
      devilFallenCrown: 0,
    });
  });

  it("creates independent mutable collections for each run state", () => {
    const first = createState();
    const second = createState();

    first.queue.push("I");
    first.upgrades.tspinBonus = 2;
    first.pointer.elasticSlider.key = "audio:masterVolume";

    expect(second.queue).toEqual([]);
    expect(second.upgrades.tspinBonus).toBe(0);
    expect(second.pointer.elasticSlider.key).toBe("");
  });
});
