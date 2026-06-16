import { describe, expect, it } from "vitest";
import { createStoryModeController } from "../src/core/storyModeController.js";

function createController({ scene = { id: "prologue", panels: [{ id: "p1" }, { id: "p2" }] } } = {}) {
  const calls = [];
  const state = { mode: "start", story: null };
  const controller = createStoryModeController({
    state,
    getScene: (sceneId) => (sceneId === scene?.id ? scene : null),
    setGameMode: (mode) => {
      state.mode = mode;
      calls.push(["setGameMode", mode]);
    },
    startGameplay: (runMode) => calls.push(["startGameplay", runMode]),
    playSfx: (name) => calls.push(["playSfx", name]),
    now: () => 123,
  });
  return { calls, controller, state };
}

describe("story mode controller", () => {
  it("enters story mode without starting gameplay immediately", () => {
    const { calls, controller, state } = createController();

    expect(controller.startStory("prologue", "endless")).toBe(true);

    expect(state.mode).toBe("story");
    expect(state.story).toMatchObject({
      sceneId: "prologue",
      runMode: "endless",
      panelIndex: 0,
      totalPanels: 2,
      startedAt: 123,
    });
    expect(calls).toEqual([
      ["setGameMode", "story"],
      ["playSfx", "uiConfirm"],
    ]);
  });

  it("starts gameplay only after the final panel advances", () => {
    const { calls, controller, state } = createController();
    controller.startStory("prologue", "storyEgypt");
    calls.length = 0;

    expect(controller.nextStoryPanel()).toBe(true);
    expect(state.story).toMatchObject({ panelIndex: 1, completed: false });
    expect(calls).toEqual([["playSfx", "uiConfirm"]]);

    expect(controller.nextStoryPanel()).toBe(true);
    expect(state.story).toBe(null);
    expect(calls).toEqual([
      ["playSfx", "uiConfirm"],
      ["startGameplay", "storyEgypt"],
    ]);
  });

  it("skip starts gameplay and clears story state", () => {
    const { calls, controller, state } = createController();
    controller.startStory("prologue", "endless");
    calls.length = 0;

    expect(controller.skipStory()).toBe(true);

    expect(state.story).toBe(null);
    expect(calls).toEqual([
      ["playSfx", "uiCancel"],
      ["startGameplay", "endless"],
    ]);
  });

  it("falls back to gameplay when a scene is missing", () => {
    const { calls, controller, state } = createController({ scene: null });

    expect(controller.startStory("missing", "endless")).toBe(false);

    expect(state.mode).toBe("start");
    expect(state.story).toBe(null);
    expect(calls).toEqual([["startGameplay", "endless"]]);
  });
});
