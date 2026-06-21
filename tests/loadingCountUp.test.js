import { describe, expect, it } from "vitest";
import { getLoadingCountUpProgress } from "../src/ui/loadingCountUp.js";

describe("loading count-up progress", () => {
  it("starts from zero and formats a percentage", () => {
    const model = getLoadingCountUpProgress({
      targetProgress: 0,
      elapsedMs: 0,
    });

    expect(model).toEqual({
      targetProgress: 0,
      displayProgress: 0,
      displayPercent: 0,
      percentText: "0%",
    });
  });

  it("smoothly chases the target without exceeding it", () => {
    const early = getLoadingCountUpProgress({
      targetProgress: 0.82,
      elapsedMs: 160,
    });
    const later = getLoadingCountUpProgress({
      targetProgress: 0.82,
      elapsedMs: 720,
    });

    expect(early.displayProgress).toBeGreaterThan(0);
    expect(early.displayProgress).toBeLessThan(0.82);
    expect(later.displayProgress).toBeGreaterThan(early.displayProgress);
    expect(later.displayProgress).toBeLessThanOrEqual(0.82);
    expect(Number.parseInt(later.percentText, 10)).toBe(later.displayPercent);
  });

  it("never reports a display value above the target before completion", () => {
    const model = getLoadingCountUpProgress({
      targetProgress: 0.42,
      elapsedMs: 5000,
    });

    expect(model.displayProgress).toBe(0.42);
    expect(model.percentText).toBe("42%");
  });

  it("lands on 100 during completion shimmer", () => {
    const almostDone = getLoadingCountUpProgress({
      targetProgress: 1,
      elapsedMs: 500,
      completionProgress: 0.5,
    });
    const done = getLoadingCountUpProgress({
      targetProgress: 1,
      elapsedMs: 500,
      completionProgress: 1,
    });

    expect(almostDone.displayPercent).toBeGreaterThanOrEqual(98);
    expect(done.displayProgress).toBe(1);
    expect(done.percentText).toBe("100%");
  });
});
