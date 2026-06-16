import { describe, expect, it } from "vitest";
import {
  createStoryInputRouter,
  isStoryNextKey,
  isStorySkipKey,
} from "../src/input/storyInputRouter.js";

function createRouter(mode = "story") {
  const calls = [];
  const state = { mode };
  const layout = {
    panelHitRect: { x: 0, y: 0, w: 1280, h: 720 },
    nextButton: { x: 1000, y: 600, w: 160, h: 48 },
    skipButton: { x: 1100, y: 40, w: 120, h: 40 },
  };
  const router = createStoryInputRouter({
    state,
    getLayout: () => layout,
    actions: {
      next: () => calls.push("next"),
      skip: () => calls.push("skip"),
    },
  });
  return { calls, layout, router, state };
}

describe("story input router", () => {
  it("maps Enter and Space to next panel", () => {
    expect(isStoryNextKey({ key: "Enter" })).toBe(true);
    expect(isStoryNextKey({ code: "Space" })).toBe(true);

    const { calls, router } = createRouter();
    expect(router.handleKeyDown({ key: "Enter", code: "Enter" })).toBe(true);
    expect(router.handleKeyDown({ key: " ", code: "Space" })).toBe(true);

    expect(calls).toEqual(["next", "next"]);
  });

  it("maps S and Esc to skip", () => {
    expect(isStorySkipKey({ key: "s" })).toBe(true);
    expect(isStorySkipKey({ key: "Escape" })).toBe(true);

    const { calls, router } = createRouter();
    expect(router.handleKeyDown({ key: "s", code: "KeyS" })).toBe(true);
    expect(router.handleKeyDown({ key: "Escape", code: "Escape" })).toBe(true);

    expect(calls).toEqual(["skip", "skip"]);
  });

  it("ignores repeated story keys and non-story modes", () => {
    const active = createRouter();
    expect(active.router.handleKeyDown({ key: "Enter", repeat: true })).toBe(false);
    expect(active.calls).toEqual([]);

    const inactive = createRouter("playing");
    expect(inactive.router.handleKeyDown({ key: "Enter" })).toBe(false);
    expect(inactive.router.handlePointerDown(1105, 45)).toBe(false);
    expect(inactive.calls).toEqual([]);
  });

  it("prioritizes skip before next and panel clicks", () => {
    const { calls, router } = createRouter();

    expect(router.handlePointerDown(1110, 50)).toBe(true);
    expect(router.handlePointerDown(1010, 610)).toBe(true);
    expect(router.handlePointerDown(500, 260)).toBe(true);

    expect(calls).toEqual(["skip", "next", "next"]);
  });
});
