import { describe, expect, it } from "vitest";
import { getAnimationDuration } from "../src/render/animationTiming.js";

class MockMedia {
  addEventListener() {}
  load() {}
}

globalThis.Image = MockMedia;
globalThis.Audio = MockMedia;

const {
  ENEMY_DEATH_ANIMATION,
  ENEMY_DEATH_DURATION_MS,
  ENEMY_DEATH_TRANSITION,
  getEnemyDeathTransitionState,
} = await import("../src/render/enemyDeathVfx.js");

describe("enemy death VFX", () => {
  it("uses the full generated 16-frame death sheet within the transition budget", () => {
    expect(ENEMY_DEATH_ANIMATION.frames).toEqual(Array.from({ length: 16 }, (_, index) => index));
    expect(ENEMY_DEATH_ANIMATION.columns).toBe(4);
    expect(ENEMY_DEATH_ANIMATION.rows).toBe(4);
    expect(ENEMY_DEATH_ANIMATION.timing).toHaveLength(16);
    expect(getAnimationDuration(ENEMY_DEATH_ANIMATION)).toBe(1080);
    expect(ENEMY_DEATH_DURATION_MS).toBe(1080);
    expect(ENEMY_DEATH_TRANSITION.particleCount).toBe(28);
  });

  it("dissolves the defeated enemy before revealing the next enemy", () => {
    const start = getEnemyDeathTransitionState(0);
    const overlap = getEnemyDeathTransitionState(760);
    const end = getEnemyDeathTransitionState(1080);
    const finalVictory = getEnemyDeathTransitionState(1080, false);

    expect(start.oldAlpha).toBe(1);
    expect(start.nextAlpha).toBe(0);
    expect(overlap.oldAlpha).toBe(0);
    expect(overlap.nextAlpha).toBeGreaterThan(0);
    expect(end.oldAlpha).toBe(0);
    expect(end.nextAlpha).toBe(1);
    expect(finalVictory.nextAlpha).toBe(0);
  });
});
