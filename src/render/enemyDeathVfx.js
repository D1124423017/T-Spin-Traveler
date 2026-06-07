import { enemyDeathSheet } from "../data/assets.js";
import { clamp, smoothstep } from "./drawUtils.js";

const FRAMES_16 = Object.freeze(Array.from({ length: 16 }, (_, index) => index));
const ENEMY_DEATH_TIMING = Object.freeze([
  54, 56, 58, 60,
  62, 66, 70, 74,
  78, 82, 80, 76,
  72, 68, 64, 60,
]);

export const ENEMY_DEATH_DURATION_MS = ENEMY_DEATH_TIMING.reduce(
  (total, frameMs) => total + frameMs,
  0,
);

export const ENEMY_DEATH_TRANSITION = Object.freeze({
  durationMs: ENEMY_DEATH_DURATION_MS,
  oldFadeStartMs: 90,
  oldFadeEndMs: 760,
  nextFadeStartMs: 620,
  nextFadeEndMs: ENEMY_DEATH_DURATION_MS,
  particleCount: 28,
});

export const ENEMY_DEATH_ANIMATION = Object.freeze({
  id: "enemy-death",
  image: enemyDeathSheet,
  columns: 4,
  rows: 4,
  frames: FRAMES_16,
  frameMs: 68,
  timing: ENEMY_DEATH_TIMING,
  draw: Object.freeze({ x: -198, y: -302, w: 396, h: 396 }),
  noKeying: true,
  cropInset: 0,
});

export function getEnemyDeathTransitionState(elapsedMs, revealNext = true) {
  const elapsed = clamp(elapsedMs, 0, ENEMY_DEATH_TRANSITION.durationMs);
  const oldFade = smoothstep(
    ENEMY_DEATH_TRANSITION.oldFadeStartMs,
    ENEMY_DEATH_TRANSITION.oldFadeEndMs,
    elapsed,
  );
  const nextAlpha = revealNext
    ? smoothstep(
      ENEMY_DEATH_TRANSITION.nextFadeStartMs,
      ENEMY_DEATH_TRANSITION.nextFadeEndMs,
      elapsed,
    )
    : 0;

  return {
    elapsed,
    oldAlpha: 1 - oldFade,
    oldScale: 1 + oldFade * 0.08,
    oldLift: oldFade * 12,
    effectAlpha: Math.min(
      smoothstep(0, 100, elapsed),
      1 - smoothstep(900, ENEMY_DEATH_TRANSITION.durationMs, elapsed),
    ),
    nextAlpha,
    nextLift: (1 - nextAlpha) * 10,
  };
}
