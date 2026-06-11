import { describe, expect, it } from "vitest";
import {
  CONTROL_ACTIONS,
  DEFAULT_CONTROLS,
  SETTINGS_TABS,
  TUNING_SLIDERS,
} from "../src/input/controlSettingsConfig.js";
import {
  ROSTER_CELLS,
  createBattlePresentationConfig,
} from "../src/render/battlePresentationConfig.js";

describe("control settings config", () => {
  it("preserves the supported actions, defaults, tabs, and handling ranges", () => {
    expect(CONTROL_ACTIONS.map(({ id }) => id)).toEqual(Object.keys(DEFAULT_CONTROLS));
    expect(DEFAULT_CONTROLS.rotateCW).toEqual(["arrowup", "x"]);
    expect(DEFAULT_CONTROLS.hold).toEqual(["shift", "c"]);
    expect(SETTINGS_TABS).toEqual(["controls", "handling", "audio", "language", "feedback"]);
    expect(TUNING_SLIDERS).toEqual({
      das: { min: 60, max: 240, unit: "ms" },
      arr: { min: 0, max: 80, unit: "ms" },
      softDrop: { min: 1, max: 32, unit: "ms" },
      lockDelay: { min: 200, max: 900, unit: "ms" },
    });
  });
});

describe("battle presentation config", () => {
  it("derives the existing feedback positions and character baselines", () => {
    const config = createBattlePresentationConfig({
      boardX: 476,
      boardY: 72,
      cols: 10,
      rows: 20,
      tile: 29,
      uiLayout: {
        playerStage: { y: 100 },
        enemyStage: { x: 800, y: 120 },
      },
    });

    expect(config.feedbackPositions).toEqual({
      combo: { x: 384, y: 268 },
      b2b: { x: 384, y: 322 },
      tspin: { x: 384, y: 376 },
      perfect: { x: 621, y: 315.6 },
      damage: { x: 834, y: 246 },
    });
    expect(config.characterBaselines.player).toMatchObject({
      groundY: 484,
      centerOffsetX: -6,
      localY: 120,
      scale: 0.88,
    });
    expect(config.characterBaselines.enemy).toMatchObject({
      groundY: 472,
      centerOffsetX: 12,
      localY: 104,
      scale: 1,
    });
    expect(ROSTER_CELLS.noa).toEqual([0, 0]);
    expect(ROSTER_CELLS.king).toEqual([3, 1]);
  });
});
