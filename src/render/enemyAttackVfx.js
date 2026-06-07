import {
  enemyAttackSheets,
  enemyImpactArcaneSheet,
  enemyImpactPhysicalSheet,
  enemyImpactStoneSheet,
  enemyPharaohImpactSheet,
  enemyPharaohProjectileSheet,
  enemyRiftProjectileSheet,
} from "../data/assets.js";
import { getAnimationDuration } from "./animationTiming.js";

const FRAMES_16 = Object.freeze(Array.from({ length: 16 }, (_, index) => index));
const FIXED_90_FRAME_TIMING = Object.freeze(FRAMES_16.map(() => 90));
const FIXED_80_FRAME_TIMING = Object.freeze(FRAMES_16.map(() => 80));
const FIXED_EFFECT_TIMING = Object.freeze(FRAMES_16.map(() => 60));

export const ENEMY_HIT_DELAY_MS = 360;
export const ENEMY_ATTACK_FRAME_MS = 90;
export const ENEMY_ATTACK_DURATION_MS = FRAMES_16.length * ENEMY_ATTACK_FRAME_MS;
export const SCARAB_ATTACK_FRAME_MS = 80;
export const SCARAB_ATTACK_DURATION_MS = FRAMES_16.length * SCARAB_ATTACK_FRAME_MS;
export const ENEMY_EFFECT_FRAME_MS = 60;
export const ENEMY_EFFECT_DURATION_MS = FRAMES_16.length * ENEMY_EFFECT_FRAME_MS;
export const BOSS_EFFECT_FRAME_MS = 60;
export const BOSS_EFFECT_DURATION_MS = FRAMES_16.length * BOSS_EFFECT_FRAME_MS;

function bodyConfig({
  id,
  image,
  draw,
  bottomOffset,
  frameMs = ENEMY_ATTACK_FRAME_MS,
}) {
  const timing = frameMs === SCARAB_ATTACK_FRAME_MS
    ? FIXED_80_FRAME_TIMING
    : FIXED_90_FRAME_TIMING;
  return Object.freeze({
    id,
    image,
    columns: 4,
    rows: 4,
    frames: FRAMES_16,
    frameMs,
    timing,
    hitFrame: Math.floor(ENEMY_HIT_DELAY_MS / frameMs),
    hitTimeMs: ENEMY_HIT_DELAY_MS,
    draw,
    bottomOffset,
    noKeying: true,
    cropInset: 0,
  });
}

export const ENEMY_ATTACK_BODY_ANIMATIONS = Object.freeze({
  blue_slime: bodyConfig({
    id: "enemy-egypt-rift-scarab-attack",
    image: enemyAttackSheets.riftScarab16,
    draw: { x: -195, y: -416, w: 390, h: 520 },
    bottomOffset: 40,
    frameMs: SCARAB_ATTACK_FRAME_MS,
  }),
  slime: bodyConfig({
    id: "enemy-egypt-mummy-attack",
    image: enemyAttackSheets.mummy16,
    draw: { x: -165, y: -336, w: 330, h: 440 },
    bottomOffset: 34,
  }),
  mushroom: bodyConfig({
    id: "enemy-egypt-priest-attack",
    image: enemyAttackSheets.priest16,
    draw: { x: -170, y: -349, w: 340, h: 453 },
    bottomOffset: 35,
  }),
  beetle: bodyConfig({
    id: "enemy-egypt-anubis-guard-attack",
    image: enemyAttackSheets.anubisGuard16,
    draw: { x: -170, y: -349, w: 340, h: 453 },
    bottomOffset: 35,
  }),
  vine: bodyConfig({
    id: "enemy-egypt-sphinx-attack",
    image: enemyAttackSheets.sphinx16,
    draw: { x: -200, y: -429, w: 400, h: 533 },
    bottomOffset: 42,
  }),
  king: bodyConfig({
    id: "enemy-egypt-pharaoh-king-attack",
    image: enemyAttackSheets.pharaohKing16,
    draw: { x: -244, y: -546, w: 488, h: 650 },
    bottomOffset: 34,
  }),
});

const ATTACK_STYLES = Object.freeze({
  blue_slime: Object.freeze({ impact: "physical", impactScale: 0.82, intensity: 0.9 }),
  slime: Object.freeze({ impact: "physical", impactScale: 0.9, intensity: 0.95 }),
  mushroom: Object.freeze({
    impact: "arcane",
    projectile: true,
    projectileScale: 0.9,
    impactScale: 0.96,
    intensity: 1,
  }),
  beetle: Object.freeze({ impact: "physical", impactScale: 1.04, intensity: 1.1 }),
  vine: Object.freeze({ impact: "stone", impactScale: 1.12, intensity: 1.2 }),
});

const IMPACT_IMAGES = Object.freeze({
  physical: enemyImpactPhysicalSheet,
  arcane: enemyImpactArcaneSheet,
  stone: enemyImpactStoneSheet,
});

const BOSS_PHASE_STYLES = Object.freeze([
  Object.freeze({ bodyScale: 1, projectileScale: 1, impactScale: 1.08, intensity: 1.18, shake: 10 }),
  Object.freeze({ bodyScale: 1.04, projectileScale: 1.08, impactScale: 1.16, intensity: 1.34, shake: 12 }),
  Object.freeze({ bodyScale: 1.08, projectileScale: 1.16, impactScale: 1.24, intensity: 1.52, shake: 14 }),
  Object.freeze({ bodyScale: 1.12, projectileScale: 1.24, impactScale: 1.34, intensity: 1.72, shake: 16 }),
]);

function createBossAttackVfx(phase, style) {
  const baseBodyConfig = ENEMY_ATTACK_BODY_ANIMATIONS.king;
  const bodyConfigValue = Object.freeze({
    ...baseBodyConfig,
    renderScale: style.bodyScale,
    intensity: style.intensity,
  });
  const projectile = Object.freeze({
    id: "enemy-pharaoh-projectile-king",
    image: enemyPharaohProjectileSheet,
    columns: 4,
    rows: 4,
    frames: FRAMES_16,
    frameMs: BOSS_EFFECT_FRAME_MS,
    timing: FIXED_EFFECT_TIMING,
    noKeying: true,
    cropInset: 0,
    startMs: 0,
    durationMs: ENEMY_HIT_DELAY_MS,
    scale: style.projectileScale,
    intensity: style.intensity,
  });
  const impact = Object.freeze({
    id: "enemy-pharaoh-impact-king",
    image: enemyPharaohImpactSheet,
    columns: 4,
    rows: 4,
    frames: FRAMES_16,
    frameMs: BOSS_EFFECT_FRAME_MS,
    timing: FIXED_EFFECT_TIMING,
    noKeying: true,
    cropInset: 0,
    startMs: ENEMY_HIT_DELAY_MS,
    durationMs: BOSS_EFFECT_DURATION_MS,
    scale: style.impactScale,
    intensity: style.intensity,
  });
  const bodyDurationMs = getAnimationDuration(bodyConfigValue);

  return Object.freeze({
    kind: "king",
    phase,
    bodyConfig: bodyConfigValue,
    bodyDurationMs,
    hitDelayMs: ENEMY_HIT_DELAY_MS,
    totalDurationMs: Math.max(
      bodyDurationMs,
      projectile.startMs + projectile.durationMs,
      impact.startMs + impact.durationMs,
    ),
    intensity: style.intensity,
    shake: style.shake,
    projectile,
    impact,
  });
}

const BOSS_ATTACK_VFX_BY_PHASE = Object.freeze(
  BOSS_PHASE_STYLES.map((style, index) => createBossAttackVfx(index + 1, style)),
);

export function resolveEnemyAttackVfx(kind, phase = 1) {
  if (kind === "king") {
    const phaseIndex = Math.min(BOSS_ATTACK_VFX_BY_PHASE.length, Math.max(1, Math.floor(phase))) - 1;
    return BOSS_ATTACK_VFX_BY_PHASE[phaseIndex];
  }

  const bodyConfigValue = ENEMY_ATTACK_BODY_ANIMATIONS[kind];
  const style = ATTACK_STYLES[kind];
  if (!bodyConfigValue || !style) return null;

  const bodyDurationMs = getAnimationDuration(bodyConfigValue);
  const projectileStartMs = 0;
  const projectileDurationMs = ENEMY_HIT_DELAY_MS;
  const impactStartMs = ENEMY_HIT_DELAY_MS;
  const impactDurationMs = ENEMY_EFFECT_DURATION_MS;
  const impactImage = IMPACT_IMAGES[style.impact] || enemyImpactPhysicalSheet;
  const projectile = style.projectile
    ? Object.freeze({
      id: `enemy-rift-projectile-${kind}`,
      image: enemyRiftProjectileSheet,
      columns: 4,
      rows: 4,
      frames: FRAMES_16,
      frameMs: ENEMY_EFFECT_FRAME_MS,
      timing: FIXED_EFFECT_TIMING,
      noKeying: true,
      cropInset: 0,
      startMs: projectileStartMs,
      durationMs: projectileDurationMs,
      scale: style.projectileScale || 1,
    })
    : null;
  const impact = Object.freeze({
    id: `enemy-impact-${style.impact}-${kind}`,
    image: impactImage,
    columns: 4,
    rows: 4,
    frames: FRAMES_16,
    frameMs: ENEMY_EFFECT_FRAME_MS,
    timing: FIXED_EFFECT_TIMING,
    noKeying: true,
    cropInset: 0,
    startMs: impactStartMs,
    durationMs: impactDurationMs,
    scale: style.impactScale || 1,
  });

  return Object.freeze({
    kind,
    bodyConfig: bodyConfigValue,
    bodyDurationMs,
    hitDelayMs: ENEMY_HIT_DELAY_MS,
    totalDurationMs: Math.max(
      bodyDurationMs,
      projectile ? projectile.startMs + projectile.durationMs : 0,
      impact.startMs + impact.durationMs,
    ),
    intensity: style.intensity || 1,
    projectile,
    impact,
  });
}
