import { describe, expect, it } from "vitest";
import {
  MENU_PANEL_ENTER_DURATION_MS,
  MENU_REVEAL_DURATION_MS,
  createMenuFocusMotionController,
  createMenuMotionModel,
  getMenuButtonMotion,
} from "../src/ui/menuMotion.js";

describe("menu motion helpers", () => {
  it("keeps reveal progress bounded and deterministic", () => {
    const model = createMenuMotionModel({ now: 640, startedAt: 0 });

    expect(model.elapsed).toBe(640);
    expect(model.reveal).toBeGreaterThan(0);
    expect(model.reveal).toBeLessThan(1);
    expect(model.titleAlpha).toBeGreaterThan(0);
    expect(model.panelAlpha).toBeGreaterThan(0);
    expect(model.rightPanelOffsetX).toBeGreaterThanOrEqual(0);
  });

  it("reaches full reveal after the menu intro duration", () => {
    const model = createMenuMotionModel({ now: MENU_REVEAL_DURATION_MS + 100, startedAt: 0 });

    expect(model.reveal).toBe(1);
    expect(model.titleAlpha).toBe(1);
    expect(model.panelAlpha).toBe(1);
    expect(model.rightPanelOffsetX).toBe(0);
  });

  it("staggers button reveal without changing interaction geometry", () => {
    const early = createMenuMotionModel({ now: 430, startedAt: 0 });
    const first = getMenuButtonMotion(early, 0);
    const later = getMenuButtonMotion(early, 3);

    expect(first.reveal).toBeGreaterThan(later.reveal);
    expect(first.alpha).toBeGreaterThanOrEqual(0);
    expect(first.alpha).toBeLessThanOrEqual(1);
    expect(later.alpha).toBeGreaterThanOrEqual(0);
    expect(first.offsetX).toBeGreaterThan(later.offsetX);
  });

  it("settles the right menu group after a short left-to-right overshoot", () => {
    const entering = createMenuMotionModel({ now: 80, startedAt: 0 });
    const settling = createMenuMotionModel({ now: 520, startedAt: 0 });
    const done = createMenuMotionModel({
      now: MENU_PANEL_ENTER_DURATION_MS + 80,
      startedAt: 0,
    });

    expect(entering.rightPanelOffsetX).toBe(-76);
    expect(settling.rightPanelOffsetX).toBeGreaterThan(0);
    expect(done.rightPanelOffsetX).toBe(0);
  });

  it("skips entrance transforms when reduced motion is requested", () => {
    const model = createMenuMotionModel({
      now: 0,
      startedAt: 0,
      reducedMotion: true,
    });
    const button = getMenuButtonMotion(model, 5);

    expect(model.rightPanelOffsetX).toBe(0);
    expect(model.rightPanelAlpha).toBe(1);
    expect(button).toMatchObject({ alpha: 1, offsetX: 0, reveal: 1 });
  });

  it("moves a single focus target between plaques", () => {
    const controller = createMenuFocusMotionController({ count: 6 });

    controller.update({ selected: 0, now: 0 });
    const firstSettled = controller.update({ selected: 0, now: 240 });
    expect(firstSettled[0].focusProgress).toBe(1);
    expect(firstSettled.filter(({ focusProgress }) => focusProgress === 1)).toHaveLength(1);

    controller.update({ selected: 2, now: 300 });
    const switched = controller.update({ selected: 2, now: 540 });
    expect(switched[0].focusProgress).toBe(0);
    expect(switched[2].focusProgress).toBe(1);
    expect(switched.filter(({ focusProgress }) => focusProgress === 1)).toHaveLength(1);
  });

  it("jumps directly to the selected plaque with reduced motion", () => {
    const controller = createMenuFocusMotionController({ count: 6 });
    const states = controller.update({
      selected: 4,
      now: 0,
      reducedMotion: true,
    });

    expect(states[4]).toEqual({ scaleProgress: 1, focusProgress: 1 });
    expect(states.filter(({ focusProgress }) => focusProgress === 1)).toHaveLength(1);
  });
});
