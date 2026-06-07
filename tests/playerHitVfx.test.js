import { describe, expect, it } from "vitest";
import {
  getAnimationDuration,
  getAnimationFrameInfo,
} from "../src/render/animationTiming.js";

class MockMedia {
  addEventListener() {}
  load() {}
}

globalThis.Image = MockMedia;
globalThis.Audio = MockMedia;

const {
  HERO_HIT_DURATION_MS,
  HERO_HIT_FRAME_MS,
  PLAYER_HIT_ANIMATION,
} = await import("../src/render/playerHitVfx.js");

describe("player hit VFX", () => {
  it("plays all 16 hit frames at 60ms for a 960ms presentation window", () => {
    expect(HERO_HIT_FRAME_MS).toBe(60);
    expect(HERO_HIT_DURATION_MS).toBe(960);
    expect(PLAYER_HIT_ANIMATION.frameMs).toBe(HERO_HIT_FRAME_MS);
    expect(PLAYER_HIT_ANIMATION.timing).toHaveLength(16);
    expect(PLAYER_HIT_ANIMATION.timing).toEqual(Array(16).fill(60));
    expect(getAnimationDuration(PLAYER_HIT_ANIMATION)).toBe(HERO_HIT_DURATION_MS);
    expect(getAnimationFrameInfo(PLAYER_HIT_ANIMATION, HERO_HIT_DURATION_MS - 1).frameIndex).toBe(15);
  });

  it("uses a fixed 4 x 4 bottom-center render box", () => {
    expect(PLAYER_HIT_ANIMATION.frames).toHaveLength(16);
    expect(PLAYER_HIT_ANIMATION.columns).toBe(4);
    expect(PLAYER_HIT_ANIMATION.rows).toBe(4);
    expect(PLAYER_HIT_ANIMATION.draw.x + PLAYER_HIT_ANIMATION.draw.w / 2).toBe(0);
    expect(PLAYER_HIT_ANIMATION.bottomOffset).toBeGreaterThan(0);
    expect(PLAYER_HIT_ANIMATION.noKeying).toBe(true);
  });
});
