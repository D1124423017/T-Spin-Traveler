import { describe, expect, it, vi } from "vitest";
import { translations } from "../src/data/i18n.js";
import {
  DEBUG_RIFT_ENERGY_GRANT,
  createDebugProgressTools,
  resetGameSaveProgress,
} from "../src/debug/debugProgressTools.js";
import {
  DEFAULT_META_PROGRESS,
  LEGACY_META_PROGRESS_STORAGE_KEY,
} from "../src/core/metaProgress.js";

describe("debug Rift Energy tools", () => {
  it("adds 10000 energy through the existing progress save path", () => {
    const state = { metaProgress: { riftEnergy: 50 } };
    let persisted = { riftEnergy: 50 };
    const saveMetaProgress = vi.fn((next) => {
      persisted = structuredClone(next);
    });
    const tools = createDebugProgressTools({
      state,
      loadMetaProgress: () => structuredClone(persisted),
      saveMetaProgress,
      grantRiftEnergy: (progress, amount) => ({
        ...progress,
        riftEnergy: progress.riftEnergy + amount,
      }),
    });

    expect(DEBUG_RIFT_ENERGY_GRANT).toBe(10000);
    expect(tools.addRiftEnergy()).toBe(10050);
    expect(state.metaProgress.riftEnergy).toBe(10050);
    expect(persisted.riftEnergy).toBe(10050);
    expect(saveMetaProgress).toHaveBeenCalledOnce();
  });

  it("provides the debug button copy in both supported languages", () => {
    expect(translations.zh.debugAddRiftEnergy10000).toBe("增加 10000 能量");
    expect(translations.en.debugAddRiftEnergy10000).toBe("Add 10000 Rift Energy");
    expect(translations.zh.debugResetAll).toBe("全部重製");
    expect(translations.en.debugResetAll).toBe("Reset All");
    expect(translations.zh.debugResetAllConfirm).toBe("再按一次確認重製");
    expect(translations.en.debugResetAllConfirm).toBe("Press again to confirm reset");
    expect(translations.zh.debugResetAllDone).toBe("已重製進度");
    expect(translations.en.debugResetAllDone).toBe("Progress reset");
  });

  it("requires confirmation and resets only game-owned progress", () => {
    let currentTime = 1000;
    let persistedMeta = {
      ...structuredClone(DEFAULT_META_PROGRESS),
      riftEnergy: 54321,
      ascensionTier: 3,
      equipment: {
        wheelLevel: 4,
        drawCount: 9,
        ownedIds: ["rift-observer-hood"],
        equipped: {
          head: "rift-observer-hood",
          cloak: null,
          weapon: null,
        },
      },
    };
    const storageValues = new Map([
      [LEGACY_META_PROGRESS_STORAGE_KEY, "legacy"],
      ["unrelated-key", "keep-me"],
    ]);
    const storage = {
      removeItem: vi.fn((key) => storageValues.delete(key)),
    };
    const state = {
      metaProgress: structuredClone(persistedMeta),
      save: {
        bestWave: 20,
        bestCombo: 8,
        bestB2B: 4,
        bestDamage: 999,
        bestHit: 80,
        perfectClears: 2,
        tutorialCompleted: true,
        settings: { language: "en", masterVolume: 0.7 },
      },
      equipmentUi: {
        view: "roulette",
        filter: "weapon",
        motion: { active: true },
        message: { key: "busy", vars: {}, until: 5000 },
        selectedOwnedIndex: 3,
      },
    };
    const saveMetaProgress = vi.fn((next) => {
      persistedMeta = structuredClone(next);
    });
    const persistGameSave = vi.fn();
    const tools = createDebugProgressTools({
      state,
      loadMetaProgress: () => structuredClone(persistedMeta),
      saveMetaProgress,
      grantRiftEnergy: (progress) => progress,
      persistGameSave,
      storage,
      now: () => currentTime,
    });

    expect(tools.getResetStatus()).toBe("idle");
    expect(tools.resetAllProgress()).toEqual({ status: "confirm" });
    expect(tools.getResetStatus()).toBe("confirm");
    expect(saveMetaProgress).not.toHaveBeenCalled();

    currentTime += 100;
    expect(tools.resetAllProgress().status).toBe("reset");
    expect(state.metaProgress).toEqual(structuredClone(DEFAULT_META_PROGRESS));
    expect(state.save).toEqual(resetGameSaveProgress({
      settings: { language: "en", masterVolume: 0.7 },
    }));
    expect(state.equipmentUi).toMatchObject({
      view: "inventory",
      filter: "all",
      motion: null,
      selectedOwnedIndex: 0,
    });
    expect(saveMetaProgress).toHaveBeenCalledOnce();
    expect(persistGameSave).toHaveBeenCalledWith(state.save);
    expect(storage.removeItem).toHaveBeenCalledWith(LEGACY_META_PROGRESS_STORAGE_KEY);
    expect(storageValues.get("unrelated-key")).toBe("keep-me");
    expect(tools.getResetStatus()).toBe("reset");
  });
});
