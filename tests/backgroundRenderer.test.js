import { describe, expect, it } from "vitest";
import { getBackgroundStageForWave } from "../src/render/backgroundStages.js";

describe("battle background selection", () => {
  const stages = [{ id: "egypt" }, { id: "forest" }, { id: "ruins" }];
  const boss = { id: "boss" };
  const options = {
    normalEnemyCount: 2,
    normalEnemyCyclesBeforeBoss: 2,
    backgroundStages: stages,
    bossStage: boss,
  };

  it("keeps the existing normal-wave rotation and boss cadence", () => {
    expect(getBackgroundStageForWave(1, options)).toBe(stages[0]);
    expect(getBackgroundStageForWave(2, options)).toBe(stages[1]);
    expect(getBackgroundStageForWave(4, options)).toBe(stages[0]);
    expect(getBackgroundStageForWave(5, options)).toBe(boss);
    expect(getBackgroundStageForWave(6, options)).toBe(stages[2]);
    expect(getBackgroundStageForWave(10, options)).toBe(boss);
  });

  it("falls back to the boss stage when no normal stages exist", () => {
    expect(getBackgroundStageForWave(1, {
      ...options,
      backgroundStages: [],
    })).toBe(boss);
  });
});
