import {
  EQUIPMENT_WHEEL_SEGMENT_COUNT,
  buildEquipmentWheelSegments,
} from "../data/equipment.js";
import {
  getEquipmentRewardDuration,
  getEquipmentWheelPresentation,
} from "./equipmentWheelPresentation.js";

const TAU = Math.PI * 2;

export function createEquipmentSpinMotion({
  now = 0,
  wheelLevel = 1,
  rarity = "common",
  itemId = "",
  duplicate = false,
  reducedMotion = false,
  random = Math.random,
} = {}) {
  const presentation = getEquipmentWheelPresentation(wheelLevel);
  const segments = buildEquipmentWheelSegments(wheelLevel);
  const matches = segments.filter((segment) => segment.rarity === rarity);
  const target = matches[Math.floor((Number(random()) || 0) * matches.length)] || segments[0];
  const step = TAU / EQUIPMENT_WHEEL_SEGMENT_COUNT;
  const targetRotation = -(target.index + 0.5) * step;
  const durationMs = reducedMotion ? 1 : presentation.spinDurationMs;
  const revealDurationMs = getEquipmentRewardDuration(rarity, reducedMotion);
  return {
    kind: "draw",
    startedAt: now,
    durationMs,
    startRotation: 0,
    endRotation: (reducedMotion ? 0 : presentation.spinTurns * TAU) + targetRotation,
    targetIndex: target.index,
    cheat: wheelLevel >= 4,
    wheelLevel,
    rarity,
    itemId,
    duplicate,
    interferenceStrength: presentation.interferenceStrength,
    revealStartedAt: now + durationMs * (reducedMotion ? 0 : 0.76),
    revealDurationMs,
    reducedMotion,
  };
}

export function createEquipmentUpgradeMotion({
  now = 0,
  wheelLevel = 1,
  reducedMotion = false,
} = {}) {
  const presentation = getEquipmentWheelPresentation(wheelLevel);
  return {
    kind: "upgrade",
    startedAt: now,
    durationMs: reducedMotion ? 1 : 920 + wheelLevel * 90,
    startRotation: 0,
    endRotation: reducedMotion ? 0 : TAU * (1.1 + wheelLevel * 0.14),
    targetIndex: -1,
    cheat: true,
    wheelLevel,
    interferenceStrength: presentation.interferenceStrength,
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
      revealActive: false,
      revealProgress: 0,
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
  const revealProgress = motion.revealStartedAt === undefined
    ? 0
    : Math.max(
      0,
      Math.min(
        1,
        (now - motion.revealStartedAt) / Math.max(1, motion.revealDurationMs),
      ),
    );
  const interference = getInterferenceOffset(motion, progress);
  return {
    active: progress < 1,
    progress,
    rotation: motion.startRotation
      + (motion.endRotation - motion.startRotation) * eased
      + interference,
    cheatProgress,
    revealActive: motion.revealStartedAt !== undefined
      && now >= motion.revealStartedAt
      && now < motion.revealStartedAt + motion.revealDurationMs,
    revealProgress,
    settled: progress >= 1,
  };
}

function getInterferenceOffset(motion, progress) {
  if (motion.reducedMotion || !motion.interferenceStrength || progress < 0.54) return 0;
  const settle = Math.sin(Math.min(1, (progress - 0.54) / 0.46) * Math.PI);
  const frequency = 7 + Math.max(1, motion.wheelLevel || 1);
  return Math.sin(progress * Math.PI * frequency) * motion.interferenceStrength * settle;
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
