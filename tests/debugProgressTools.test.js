import { describe, expect, it, vi } from "vitest";
import { translations } from "../src/data/i18n.js";
import {
  DEBUG_RIFT_ENERGY_GRANT,
  createDebugProgressTools,
} from "../src/debug/debugProgressTools.js";

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
  });
});
