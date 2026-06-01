import { describe, expect, it } from "vitest";
import {
  MENU_REVEAL_DURATION_MS,
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
  });

  it("reaches full reveal after the menu intro duration", () => {
    const model = createMenuMotionModel({ now: MENU_REVEAL_DURATION_MS + 100, startedAt: 0 });

    expect(model.reveal).toBe(1);
    expect(model.titleAlpha).toBe(1);
    expect(model.panelAlpha).toBe(1);
  });

  it("staggers button reveal without changing interaction geometry", () => {
    const early = createMenuMotionModel({ now: 430, startedAt: 0 });
    const first = getMenuButtonMotion(early, 0);
    const later = getMenuButtonMotion(early, 3);

    expect(first.reveal).toBeGreaterThan(later.reveal);
    expect(first.alpha).toBeGreaterThanOrEqual(0.38);
    expect(first.alpha).toBeLessThanOrEqual(1);
    expect(later.alpha).toBeGreaterThanOrEqual(0.38);
  });
});
