import { heroHitSheet } from "../data/assets.js";

const FRAMES_16 = Object.freeze(Array.from({ length: 16 }, (_, index) => index));
const HERO_HIT_TIMING = Object.freeze(FRAMES_16.map(() => 60));

export const HERO_HIT_FRAME_MS = 60;
export const HERO_HIT_DURATION_MS = HERO_HIT_TIMING.reduce(
  (total, frameMs) => total + frameMs,
  0,
);

export const PLAYER_HIT_ANIMATION = Object.freeze({
  id: "hero-hit",
  image: heroHitSheet,
  columns: 4,
  rows: 4,
  frames: FRAMES_16,
  frameMs: HERO_HIT_FRAME_MS,
  timing: HERO_HIT_TIMING,
  draw: Object.freeze({ x: -210, y: -510, w: 420, h: 630 }),
  bottomOffset: 42,
  noKeying: true,
  cropInset: 0,
});
