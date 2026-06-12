import {
  EQUIPMENT_WHEEL_SEGMENT_COUNT,
  buildEquipmentWheelSegments,
} from "../data/equipment.js";

const TAU = Math.PI * 2;

export function createEquipmentSpinMotion({
  now = 0,
  wheelLevel = 1,
  rarity = "common",
  reducedMotion = false,
  random = Math.random,
} = {}) {
  const segments = buildEquipmentWheelSegments(wheelLevel);
  const matches = segments.filter((segment) => segment.rarity === rarity);
  const target = matches[Math.floor((Number(random()) || 0) * matches.length)] || segments[0];
  const step = TAU / EQUIPMENT_WHEEL_SEGMENT_COUNT;
  const targetRotation = -(target.index + 0.5) * step;
  const turns = reducedMotion ? 0 : 4 + wheelLevel;
  return {
    kind: "draw",
    startedAt: now,
    durationMs: reducedMotion ? 1 : 1800 + wheelLevel * 120,
    startRotation: 0,
    endRotation: turns * TAU + targetRotation,
    targetIndex: target.index,
    cheat: wheelLevel >= 4,
    reducedMotion,
  };
}

export function createEquipmentUpgradeMotion({
  now = 0,
  reducedMotion = false,
} = {}) {
  return {
    kind: "upgrade",
    startedAt: now,
    durationMs: reducedMotion ? 1 : 1100,
    startRotation: 0,
    endRotation: reducedMotion ? 0 : TAU * 1.25,
    targetIndex: -1,
    cheat: true,
    reducedMotion,
  };
}

export function getEquipmentMotionState(motion, now = 0) {
  if (!motion) {
    return {
      active: false,
      progress: 1,
      rotation: 0,
      cheatProgress: 0,
      settled: true,
    };
  }
  const progress = Math.max(
    0,
    Math.min(1, (now - motion.startedAt) / Math.max(1, motion.durationMs)),
  );
  const eased = 1 - ((1 - progress) ** 5);
  const cheatProgress = motion.cheat
    ? getCheatProgress(progress, motion.reducedMotion)
    : 0;
  return {
    active: progress < 1,
    progress,
    rotation: motion.startRotation
      + (motion.endRotation - motion.startRotation) * eased,
    cheatProgress,
    settled: progress >= 1,
  };
}

function getCheatProgress(progress, reducedMotion) {
  if (reducedMotion) return progress < 1 ? 1 : 0;
  if (progress < 0.52 || progress > 0.98) return 0;
  if (progress < 0.67) return easeOutBack((progress - 0.52) / 0.15);
  if (progress < 0.88) return 1;
  return 1 - ((progress - 0.88) / 0.1);
}

function easeOutBack(value) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * ((value - 1) ** 3) + c1 * ((value - 1) ** 2);
}
