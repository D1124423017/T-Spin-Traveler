import {
  ASCENSION_BASE_LEVEL_CAP,
  ASCENSION_CHALLENGES,
  ASCENSION_LEVELS_PER_TIER,
  META_UPGRADE_LEVEL_KEYS,
} from "../data/ascensionChallenges.js";

function toNonNegativeInt(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

function getTierValue(value) {
  return toNonNegativeInt(
    typeof value === "object" && value !== null ? value.ascensionTier : value,
  );
}

function cloneProgress(progress = {}) {
  return {
    ...progress,
    completedAscensions: Array.isArray(progress?.completedAscensions)
      ? [...progress.completedAscensions]
      : [],
    metaUpgrades: {
      ...(progress?.metaUpgrades || {}),
    },
  };
}

function cloneRun(run = {}) {
  return {
    ...run,
  };
}

function toRomanNumeral(value) {
  const numerals = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let remaining = Math.max(1, toNonNegativeInt(value));
  let result = "";
  for (const [amount, numeral] of numerals) {
    while (remaining >= amount) {
      result += numeral;
      remaining -= amount;
    }
  }
  return result;
}

export function getAscensionStageNumber(value = 0) {
  return getTierValue(value) + 1;
}

export function getAscensionStageName(value = 0) {
  return toRomanNumeral(getAscensionStageNumber(value));
}

export function getAscensionMaxLevel(value = 0) {
  return ASCENSION_BASE_LEVEL_CAP + getTierValue(value) * ASCENSION_LEVELS_PER_TIER;
}

export function getAscensionChallengeForTier(targetTier) {
  const safeTargetTier = toNonNegativeInt(targetTier);
  return ASCENSION_CHALLENGES.find((challenge) => challenge.targetTier === safeTargetTier) || null;
}

export function getNextAscensionChallenge(progress = {}) {
  return getAscensionChallengeForTier(getTierValue(progress) + 1);
}

export function hasCompletedAscension(progress = {}, challengeId) {
  return Array.isArray(progress?.completedAscensions)
    && progress.completedAscensions.includes(challengeId);
}

export function areAllMetaUpgradesAtCurrentCap(progress = {}) {
  const cap = getAscensionMaxLevel(progress);
  const upgrades = progress?.metaUpgrades || {};
  return META_UPGRADE_LEVEL_KEYS.every(
    (levelKey) => toNonNegativeInt(upgrades[levelKey]) >= cap,
  );
}

export function canUnlockAscensionChallenge(progress = {}) {
  const challenge = getNextAscensionChallenge(progress);
  return Boolean(
    challenge
    && challenge.sourceTier === getTierValue(progress)
    && !hasCompletedAscension(progress, challenge.id)
    && areAllMetaUpgradesAtCurrentCap(progress),
  );
}

export function createAscensionChallengeRun(challenge) {
  if (!challenge) return null;
  return {
    challengeId: challenge.id,
    targetTier: challenge.targetTier,
    targetLines: challenge.targetLines,
    durationMs: challenge.durationSeconds * 1000,
    remainingMs: challenge.durationSeconds * 1000,
    linesCleared: 0,
    status: "waiting",
    failureReason: "",
  };
}

export function startAscensionChallengeRun(run) {
  if (!run || run.status !== "waiting") return cloneRun(run);
  return {
    ...cloneRun(run),
    status: "active",
  };
}

export function advanceAscensionChallengeRun(run, elapsedMs) {
  if (!run || run.status !== "active") return cloneRun(run);
  const safeElapsed = Number.isFinite(Number(elapsedMs))
    ? Math.max(0, Number(elapsedMs))
    : 0;
  const remainingMs = Math.max(0, run.remainingMs - safeElapsed);
  return {
    ...cloneRun(run),
    remainingMs,
    status: remainingMs > 0 ? "active" : "failed",
    failureReason: remainingMs > 0 ? "" : "time",
  };
}

export function recordAscensionChallengeLines(run, lines) {
  if (!run || run.status !== "active") return cloneRun(run);
  const safeLines = toNonNegativeInt(lines);
  const linesCleared = Math.min(run.targetLines, run.linesCleared + safeLines);
  return {
    ...cloneRun(run),
    linesCleared,
    status: linesCleared >= run.targetLines ? "success" : "active",
  };
}

export function failAscensionChallengeRun(run, reason = "defeat") {
  if (!run || !["waiting", "active"].includes(run.status)) return cloneRun(run);
  return {
    ...cloneRun(run),
    status: "failed",
    failureReason: reason,
  };
}

export function applyAscensionChallengeResult(progress = {}, challengeId, succeeded = false) {
  const nextProgress = cloneProgress(progress);
  if (!succeeded) return nextProgress;

  const challenge = getNextAscensionChallenge(progress);
  if (
    !challenge
    || challenge.id !== challengeId
    || !canUnlockAscensionChallenge(progress)
  ) {
    return nextProgress;
  }

  nextProgress.ascensionTier = challenge.targetTier;
  nextProgress.completedAscensions = Array.from(new Set([
    ...nextProgress.completedAscensions,
    challenge.id,
  ]));
  return nextProgress;
}
