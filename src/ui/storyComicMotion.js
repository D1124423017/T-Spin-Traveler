export const STORY_UI_MOTION = Object.freeze({
  titleDelayMs: 20,
  titleDurationMs: 320,
  textDelayMs: 120,
  textDurationMs: 380,
  controlsDelayMs: 250,
  controlsDurationMs: 320,
  shimmerCycleMs: 3200,
});

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function easeOutCubic(value) {
  const t = clamp01(value);
  return 1 - (1 - t) ** 3;
}

function zeroNear(value) {
  return Math.abs(value) < 0.0001 ? 0 : value;
}

function layerProgress(elapsedMs, delayMs, durationMs) {
  return easeOutCubic((elapsedMs - delayMs) / Math.max(1, durationMs));
}

export function getStoryUiEntryMotion({
  elapsedMs = 0,
  reducedMotion = false,
} = {}) {
  if (reducedMotion) {
    return {
      title: { alpha: 1, offsetX: 0, offsetY: 0 },
      textBox: { alpha: 1, offsetX: 0, offsetY: 0 },
      controls: { alpha: 1, offsetX: 0, offsetY: 0 },
    };
  }

  const title = layerProgress(elapsedMs, STORY_UI_MOTION.titleDelayMs, STORY_UI_MOTION.titleDurationMs);
  const textBox = layerProgress(elapsedMs, STORY_UI_MOTION.textDelayMs, STORY_UI_MOTION.textDurationMs);
  const controls = layerProgress(elapsedMs, STORY_UI_MOTION.controlsDelayMs, STORY_UI_MOTION.controlsDurationMs);

  return {
    title: {
      alpha: title,
      offsetX: zeroNear(-30 * (1 - title)),
      offsetY: zeroNear(-4 * (1 - title)),
    },
    textBox: {
      alpha: textBox,
      offsetX: 0,
      offsetY: zeroNear(22 * (1 - textBox)),
    },
    controls: {
      alpha: controls,
      offsetX: zeroNear(14 * (1 - controls)),
      offsetY: zeroNear(12 * (1 - controls)),
    },
  };
}

export function getStoryUiShimmer({
  now = 0,
  reducedMotion = false,
} = {}) {
  if (reducedMotion) {
    return {
      titlePhase: 0,
      panelPhase: 0,
      buttonPhase: 0,
      intensity: 0,
    };
  }

  const phase = ((Number(now) || 0) % STORY_UI_MOTION.shimmerCycleMs) / STORY_UI_MOTION.shimmerCycleMs;
  const pulse = 0.5 + Math.sin(phase * Math.PI * 2) * 0.5;
  return {
    titlePhase: phase,
    panelPhase: (phase + 0.38) % 1,
    buttonPhase: (phase + 0.18) % 1,
    intensity: 0.06 + pulse * 0.06,
  };
}
