import { describe, expect, it } from "vitest";
import {
  getAnimationDuration,
  getAnimationFrameDuration,
  getAnimationFrameInfo,
  getAnimationHitDelay,
} from "../src/render/animationTiming.js";

describe("animation timing helpers", () => {
  it("uses per-frame timing before frameMs fallback", () => {
    const config = { frames: [0, 1, 2], frameMs: 60, timing: [20, 40] };

    expect(getAnimationFrameDuration(config, 0)).toBe(20);
    expect(getAnimationFrameDuration(config, 1)).toBe(40);
    expect(getAnimationFrameDuration(config, 2)).toBe(40);
    expect(getAnimationDuration(config)).toBe(100);
  });

  it("returns deterministic frame info for elapsed time", () => {
    const config = { frames: [4, 5, 6], frameMs: 50, timing: [30, 70, 100] };

    expect(getAnimationFrameInfo(config, 0)).toEqual({ frameIndex: 0, frame: 4, local: 0, frameDuration: 30 });
    expect(getAnimationFrameInfo(config, 45)).toEqual({ frameIndex: 1, frame: 5, local: 15 / 70, frameDuration: 70 });
    expect(getAnimationFrameInfo(config, 999)).toEqual({ frameIndex: 2, frame: 6, local: 1, frameDuration: 100 });
  });

  it("calculates hit delay from explicit hit ratio or hit frame", () => {
    expect(getAnimationHitDelay({ frames: [0, 1, 2, 3], frameMs: 50, hitRatio: 0.5 }, 0.78)).toBe(100);
    expect(getAnimationHitDelay({ frames: [0, 1, 2, 3], frameMs: 50, hitFrame: 2 }, 0.78)).toBe(125);
    expect(getAnimationHitDelay({ frames: [], frameMs: 50 }, 0.78)).toBe(0);
  });
});
