const WHEEL_PRESENTATION_LEVELS = Object.freeze([
  Object.freeze({
    level: 1,
    ringCount: 1,
    particleCount: 10,
    coreLayers: 1,
    glowStrength: 0.28,
    shimmerStrength: 0.08,
    interferenceStrength: 0,
    pointerScale: 0.94,
    spinTurns: 5,
    spinDurationMs: 1920,
  }),
  Object.freeze({
    level: 2,
    ringCount: 2,
    particleCount: 15,
    coreLayers: 2,
    glowStrength: 0.42,
    shimmerStrength: 0.16,
    interferenceStrength: 0.02,
    pointerScale: 1,
    spinTurns: 6,
    spinDurationMs: 2070,
  }),
  Object.freeze({
    level: 3,
    ringCount: 3,
    particleCount: 21,
    coreLayers: 3,
    glowStrength: 0.58,
    shimmerStrength: 0.28,
    interferenceStrength: 0.05,
    pointerScale: 1.08,
    spinTurns: 7,
    spinDurationMs: 2240,
  }),
  Object.freeze({
    level: 4,
    ringCount: 4,
    particleCount: 29,
    coreLayers: 4,
    glowStrength: 0.78,
    shimmerStrength: 0.46,
    interferenceStrength: 0.1,
    pointerScale: 1.16,
    spinTurns: 8,
    spinDurationMs: 2440,
  }),
  Object.freeze({
    level: 5,
    ringCount: 5,
    particleCount: 38,
    coreLayers: 5,
    glowStrength: 1,
    shimmerStrength: 0.7,
    interferenceStrength: 0.16,
    pointerScale: 1.24,
    spinTurns: 10,
    spinDurationMs: 2680,
  }),
]);

export function getEquipmentWheelPresentation(level = 1) {
  const safeLevel = Math.max(
    1,
    Math.min(WHEEL_PRESENTATION_LEVELS.length, Math.floor(Number(level) || 1)),
  );
  return WHEEL_PRESENTATION_LEVELS[safeLevel - 1];
}

export function getEquipmentRewardDuration(rarity = "common", reducedMotion = false) {
  if (reducedMotion) return 760;
  return {
    common: 1180,
    rare: 1380,
    relic: 1640,
    legendary: 1940,
  }[rarity] || 1180;
}
