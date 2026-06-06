import {
  heroB2BSheet,
  heroCombo1Sheet,
  heroCombo2Sheet,
  heroCombo3Sheet,
  heroImpactBurstSheet,
  heroLineClearSlashSheet,
  heroSwordWaveSheet,
  heroTetrisSheet,
  heroTSpinSheet,
  heroUltimateSheet,
} from "../data/assets.js";
import {
  getAnimationDuration,
  getAnimationHitDelay,
} from "./animationTiming.js";

const FRAMES_16 = Object.freeze(Array.from({ length: 16 }, (_, index) => index));
const HERO_DRAW_STANDARD = Object.freeze({ x: -224, y: -349, w: 448, h: 504 });
const HERO_DRAW_WIDE = Object.freeze({ x: -232, y: -363, w: 464, h: 522 });
const HERO_DRAW_ULTIMATE = Object.freeze({ x: -258, y: -303, w: 516, h: 448 });

function fixedFrameRects({
  cellWidth,
  cellHeight,
  x = 0,
  y = 0,
  w = cellWidth,
  h = cellHeight,
}) {
  return Object.freeze(FRAMES_16.map((frame) => Object.freeze({
    x: (frame % 4) * cellWidth + x,
    y: Math.floor(frame / 4) * cellHeight + y,
    w,
    h,
  })));
}

// Use one viewport for every frame so transparent atlas padding does not shrink
// the hero or introduce frame-to-frame anchor movement.
const HERO_TALL_FRAME_RECTS = fixedFrameRects({
  cellWidth: 512,
  cellHeight: 768,
  y: 192,
  w: 512,
  h: 576,
});
const HERO_ULTIMATE_FRAME_RECTS = fixedFrameRects({
  cellWidth: 512,
  cellHeight: 768,
  x: 72,
  y: 448,
  w: 368,
  h: 320,
});

function sheetConfig({
  id,
  image,
  frameMs,
  timing,
  hitFrame,
  hitRatio,
  label,
  draw,
  frameRects,
  bottomOffset,
  blendFrames = false,
}) {
  return Object.freeze({
    id,
    image,
    columns: 4,
    rows: 4,
    frames: FRAMES_16,
    frameMs,
    timing,
    hitFrame,
    hitRatio,
    label,
    draw,
    frameRects,
    bottomOffset,
    noKeying: true,
    cropInset: 0,
    blendFrames,
  });
}

export const PLAYER_ATTACK_HERO_ANIMATIONS = Object.freeze({
  slash: sheetConfig({
    id: "slash",
    image: heroLineClearSlashSheet,
    frameMs: 58,
    timing: [70, 66, 60, 56, 52, 48, 46, 50, 58, 64, 68, 70, 72, 76, 82, 86],
    hitFrame: 9,
    label: "Slash",
    draw: HERO_DRAW_STANDARD,
    frameRects: HERO_TALL_FRAME_RECTS,
    bottomOffset: 38,
  }),
  doubleSlash: sheetConfig({
    id: "doubleSlash",
    image: heroLineClearSlashSheet,
    frameMs: 56,
    timing: [68, 64, 58, 54, 50, 48, 50, 58, 56, 52, 48, 54, 64, 72, 80, 86],
    hitFrame: 11,
    label: "Double Slash",
    draw: HERO_DRAW_STANDARD,
    frameRects: HERO_TALL_FRAME_RECTS,
    bottomOffset: 38,
  }),
  tripleSlash: sheetConfig({
    id: "tripleSlash",
    image: heroLineClearSlashSheet,
    frameMs: 54,
    timing: [66, 62, 56, 52, 48, 46, 48, 54, 50, 48, 46, 52, 62, 70, 78, 84],
    hitFrame: 12,
    label: "Triple Slash",
    draw: HERO_DRAW_STANDARD,
    frameRects: HERO_TALL_FRAME_RECTS,
    bottomOffset: 38,
  }),
  combo1: sheetConfig({
    id: "combo1",
    image: heroCombo1Sheet,
    frameMs: 52,
    timing: [56, 52, 48, 46, 44, 42, 44, 48, 50, 52, 56, 62, 68, 74, 80, 84],
    hitFrame: 8,
    label: "Combo I",
    draw: HERO_DRAW_STANDARD,
    frameRects: HERO_TALL_FRAME_RECTS,
    bottomOffset: 38,
  }),
  combo2: sheetConfig({
    id: "combo2",
    image: heroCombo2Sheet,
    frameMs: 54,
    timing: [60, 56, 52, 48, 46, 44, 46, 50, 52, 50, 50, 56, 64, 72, 78, 84],
    hitFrame: 9,
    label: "Combo II",
    draw: HERO_DRAW_STANDARD,
    frameRects: HERO_TALL_FRAME_RECTS,
    bottomOffset: 38,
  }),
  combo3: sheetConfig({
    id: "combo3",
    image: heroCombo3Sheet,
    frameMs: 56,
    timing: [64, 60, 56, 52, 48, 46, 48, 52, 54, 52, 50, 56, 66, 76, 84, 90],
    hitFrame: 10,
    label: "Combo III",
    draw: HERO_DRAW_STANDARD,
    frameRects: HERO_TALL_FRAME_RECTS,
    bottomOffset: 38,
  }),
  combo: sheetConfig({
    id: "combo",
    image: heroCombo2Sheet,
    frameMs: 54,
    timing: [64, 60, 56, 52, 48, 46, 48, 52, 50, 48, 48, 54, 62, 70, 78, 84],
    hitFrame: 10,
    label: "COMBO",
    draw: HERO_DRAW_STANDARD,
    frameRects: HERO_TALL_FRAME_RECTS,
    bottomOffset: 38,
  }),
  tetris: sheetConfig({
    id: "tetris",
    image: heroTetrisSheet,
    frameMs: 64,
    timing: [74, 70, 66, 62, 58, 54, 50, 54, 62, 70, 76, 82, 82, 84, 88, 92],
    hitFrame: 12,
    label: "TETRIS",
    draw: HERO_DRAW_WIDE,
    frameRects: HERO_TALL_FRAME_RECTS,
    bottomOffset: 39,
  }),
  tspin: sheetConfig({
    id: "tspin",
    image: heroTSpinSheet,
    frameMs: 58,
    timing: [68, 64, 60, 56, 52, 48, 48, 54, 58, 62, 66, 72, 76, 80, 84, 88],
    hitFrame: 10,
    label: "T-SPIN",
    draw: HERO_DRAW_STANDARD,
    frameRects: HERO_TALL_FRAME_RECTS,
    bottomOffset: 38,
  }),
  b2b: sheetConfig({
    id: "b2b",
    image: heroB2BSheet,
    frameMs: 60,
    timing: [70, 66, 62, 58, 54, 50, 48, 52, 60, 66, 72, 78, 80, 82, 86, 90],
    hitFrame: 11,
    label: "B2B",
    draw: HERO_DRAW_STANDARD,
    frameRects: HERO_TALL_FRAME_RECTS,
    bottomOffset: 38,
  }),
  ultimate: sheetConfig({
    id: "ultimate",
    image: heroUltimateSheet,
    frameMs: 85,
    hitRatio: 0.55,
    label: "Perfect Clear Rift",
    draw: HERO_DRAW_ULTIMATE,
    frameRects: HERO_ULTIMATE_FRAME_RECTS,
    bottomOffset: 25,
  }),
});

const PLAYER_ATTACK_STYLE_VFX = Object.freeze({
  slash: Object.freeze({
    hero: "slash",
    projectileScale: 0.78,
    projectileAlpha: 0.8,
    projectileLeadMs: 70,
    impactScale: 0.72,
    impactDurationMs: 420,
    intensity: 0.86,
  }),
  doubleSlash: Object.freeze({
    hero: "doubleSlash",
    projectileScale: 0.86,
    projectileAlpha: 0.86,
    projectileLeadMs: 64,
    impactScale: 0.82,
    impactDurationMs: 450,
    intensity: 1,
  }),
  tripleSlash: Object.freeze({
    hero: "tripleSlash",
    projectileScale: 0.94,
    projectileAlpha: 0.9,
    projectileLeadMs: 58,
    impactScale: 0.94,
    impactDurationMs: 480,
    intensity: 1.1,
  }),
  combo1: Object.freeze({
    hero: "combo1",
    projectileScale: 0.86,
    projectileAlpha: 0.9,
    projectileLeadMs: 48,
    impactScale: 0.86,
    impactDurationMs: 430,
    intensity: 1.05,
  }),
  combo2: Object.freeze({
    hero: "combo2",
    projectileScale: 0.98,
    projectileAlpha: 0.94,
    projectileLeadMs: 44,
    impactScale: 0.98,
    impactDurationMs: 470,
    intensity: 1.18,
  }),
  combo3: Object.freeze({
    hero: "combo3",
    projectileScale: 1.1,
    projectileAlpha: 0.98,
    projectileLeadMs: 40,
    impactScale: 1.14,
    impactDurationMs: 510,
    intensity: 1.34,
  }),
  combo: Object.freeze({
    hero: "combo2",
    projectileScale: 0.98,
    projectileAlpha: 0.94,
    projectileLeadMs: 44,
    impactScale: 0.98,
    impactDurationMs: 470,
    intensity: 1.18,
  }),
  tetris: Object.freeze({
    hero: "tetris",
    projectileScale: 1.18,
    projectileAlpha: 1,
    projectileLeadMs: 54,
    impactScale: 1.24,
    impactDurationMs: 560,
    intensity: 1.48,
  }),
  tspin: Object.freeze({
    hero: "tspin",
    projectileScale: 1.08,
    projectileAlpha: 1,
    projectileLeadMs: 50,
    projectileSpin: true,
    impactScale: 1.2,
    impactDurationMs: 560,
    intensity: 1.46,
  }),
  b2b: Object.freeze({
    hero: "b2b",
    projectileScale: 1.24,
    projectileAlpha: 1,
    projectileLeadMs: 48,
    impactScale: 1.34,
    impactDurationMs: 590,
    intensity: 1.6,
  }),
  ultimate: Object.freeze({
    hero: "ultimate",
    projectileScale: 1.5,
    projectileAlpha: 1,
    projectileLeadMs: 92,
    impactScale: 1.72,
    impactDurationMs: 680,
    intensity: 2,
  }),
});

export function getPlayerAttackHeroKind(style, comboStyle = "") {
  if (comboStyle && PLAYER_ATTACK_STYLE_VFX[comboStyle]) return PLAYER_ATTACK_STYLE_VFX[comboStyle].hero;
  return PLAYER_ATTACK_STYLE_VFX[style]?.hero || (PLAYER_ATTACK_HERO_ANIMATIONS[style] ? style : "slash");
}

export function resolvePlayerAttackVfx(style, comboStyle = "") {
  const vfxStyle = comboStyle && PLAYER_ATTACK_STYLE_VFX[comboStyle] ? comboStyle : style;
  const styleConfig = PLAYER_ATTACK_STYLE_VFX[vfxStyle] || PLAYER_ATTACK_STYLE_VFX.slash;
  const heroKind = styleConfig.hero || "slash";
  const heroConfig = PLAYER_ATTACK_HERO_ANIMATIONS[heroKind] || PLAYER_ATTACK_HERO_ANIMATIONS.slash;
  const heroDurationMs = getAnimationDuration(heroConfig);
  const hitDelayMs = getAnimationHitDelay(heroConfig, 0.55);
  const projectileStartMs = Math.max(0, Math.min(hitDelayMs - 140, styleConfig.projectileLeadMs ?? 60));
  const projectileDurationMs = Math.max(180, hitDelayMs - projectileStartMs + 70);
  const impactStartMs = Math.max(0, hitDelayMs - 42);
  const impactDurationMs = styleConfig.impactDurationMs || 460;

  return Object.freeze({
    style: vfxStyle,
    heroKind,
    heroConfig,
    heroDurationMs,
    hitDelayMs,
    totalDurationMs: Math.max(heroDurationMs, impactStartMs + impactDurationMs),
    intensity: styleConfig.intensity || 1,
    projectile: Object.freeze({
      id: `player-projectile-${vfxStyle}`,
      image: heroSwordWaveSheet,
      columns: 4,
      rows: 4,
      frames: FRAMES_16,
      frameMs: Math.max(28, Math.floor(projectileDurationMs / 16)),
      noKeying: true,
      cropInset: 0,
      startMs: projectileStartMs,
      durationMs: projectileDurationMs,
      scale: styleConfig.projectileScale || 1,
      alpha: styleConfig.projectileAlpha || 0.9,
      spin: Boolean(styleConfig.projectileSpin),
    }),
    impact: Object.freeze({
      id: `player-impact-${vfxStyle}`,
      image: heroImpactBurstSheet,
      columns: 4,
      rows: 4,
      frames: FRAMES_16,
      frameMs: Math.max(28, Math.floor(impactDurationMs / 16)),
      noKeying: true,
      cropInset: 0,
      startMs: impactStartMs,
      durationMs: impactDurationMs,
      scale: styleConfig.impactScale || 1,
    }),
  });
}
