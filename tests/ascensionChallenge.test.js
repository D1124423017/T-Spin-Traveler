import { describe, expect, it } from "vitest";
import { ASCENSION_CHALLENGES } from "../src/data/ascensionChallenges.js";
import {
  advanceAscensionChallengeRun,
  applyAscensionChallengeResult,
  areAllMetaUpgradesAtCurrentCap,
  canUnlockAscensionChallenge,
  createAscensionChallengeRun,
  failAscensionChallengeRun,
  getAscensionMaxLevel,
  getAscensionStageName,
  getAscensionStageNumber,
  getNextAscensionChallenge,
  recordAscensionChallengeLines,
  startAscensionChallengeRun,
} from "../src/core/ascensionChallenge.js";

function createProgress(overrides = {}) {
  return {
    schemaVersion: 2,
    ascensionTier: 0,
    completedAscensions: [],
    riftEnergy: 0,
    metaUpgrades: {
      hpLevel: 0,
      attackLevel: 0,
      guardLevel: 0,
    },
    ...overrides,
  };
}

describe("ascension challenge data", () => {
  it("defines the Tier 2 challenge as 40 lines within 120 seconds", () => {
    expect(ASCENSION_CHALLENGES).toContainEqual({
      id: "ascension-tier-2",
      sourceTier: 0,
      targetTier: 1,
      durationSeconds: 120,
      targetLines: 40,
    });
  });
});

describe("ascension challenge runtime", () => {
  it("waits for the first playable piece before starting the 120 second timer", () => {
    const challenge = ASCENSION_CHALLENGES[0];
    const waiting = createAscensionChallengeRun(challenge);

    expect(waiting).toMatchObject({
      status: "waiting",
      durationMs: 120000,
      remainingMs: 120000,
      linesCleared: 0,
      targetLines: 40,
    });
    expect(advanceAscensionChallengeRun(waiting, 5000).remainingMs).toBe(120000);

    const active = startAscensionChallengeRun(waiting);
    expect(active.status).toBe("active");
    expect(advanceAscensionChallengeRun(active, 1000).remainingMs).toBe(119000);
  });

  it("accumulates cleared lines and succeeds at 40 before time expires", () => {
    const active = startAscensionChallengeRun(
      createAscensionChallengeRun(ASCENSION_CHALLENGES[0]),
    );
    const halfway = recordAscensionChallengeLines(active, 18);
    const success = recordAscensionChallengeLines(halfway, 22);

    expect(halfway).toMatchObject({ linesCleared: 18, status: "active" });
    expect(success).toMatchObject({ linesCleared: 40, status: "success" });
  });

  it("fails when time reaches zero and records explicit defeat reasons", () => {
    const active = startAscensionChallengeRun(
      createAscensionChallengeRun(ASCENSION_CHALLENGES[0]),
    );

    expect(advanceAscensionChallengeRun(active, 120000)).toMatchObject({
      remainingMs: 0,
      status: "failed",
      failureReason: "time",
    });
    expect(failAscensionChallengeRun(active, "topOut")).toMatchObject({
      status: "failed",
      failureReason: "topOut",
    });
  });
});

describe("ascension rules", () => {
  it("maps ascension tier zero to Stage I with a level cap of 10", () => {
    expect(getAscensionStageNumber(0)).toBe(1);
    expect(getAscensionStageName(0)).toBe("I");
    expect(getAscensionMaxLevel(0)).toBe(10);
  });

  it("raises the cap to 20 after the first ascension", () => {
    const progress = createProgress({
      ascensionTier: 1,
      metaUpgrades: { hpLevel: 10, attackLevel: 10, guardLevel: 10 },
    });

    expect(getAscensionStageNumber(progress)).toBe(2);
    expect(getAscensionStageName(progress)).toBe("II");
    expect(getAscensionMaxLevel(progress)).toBe(20);
    expect(progress.metaUpgrades.hpLevel).toBe(10);
  });

  it("only unlocks the next challenge when every upgrade reaches the current cap", () => {
    const almostReady = createProgress({
      metaUpgrades: { hpLevel: 10, attackLevel: 10, guardLevel: 9 },
    });
    const ready = createProgress({
      metaUpgrades: { hpLevel: 10, attackLevel: 10, guardLevel: 10 },
    });

    expect(areAllMetaUpgradesAtCurrentCap(almostReady)).toBe(false);
    expect(canUnlockAscensionChallenge(almostReady)).toBe(false);
    expect(areAllMetaUpgradesAtCurrentCap(ready)).toBe(true);
    expect(canUnlockAscensionChallenge(ready)).toBe(true);
    expect(getNextAscensionChallenge(ready)?.id).toBe("ascension-tier-2");
  });

  it("does not change permanent progress when the challenge fails or remains incomplete", () => {
    const progress = createProgress({
      riftEnergy: 8253,
      metaUpgrades: { hpLevel: 10, attackLevel: 10, guardLevel: 10 },
    });
    const before = structuredClone(progress);

    expect(applyAscensionChallengeResult(
      progress,
      "ascension-tier-2",
      false,
    )).toEqual(before);
    expect(progress).toEqual(before);
  });

  it("completes an eligible ascension without resetting upgrade levels", () => {
    const progress = createProgress({
      riftEnergy: 8253,
      metaUpgrades: { hpLevel: 10, attackLevel: 10, guardLevel: 10 },
    });

    const result = applyAscensionChallengeResult(
      progress,
      "ascension-tier-2",
      true,
    );

    expect(result).toMatchObject({
      ascensionTier: 1,
      completedAscensions: ["ascension-tier-2"],
      riftEnergy: 8253,
      metaUpgrades: { hpLevel: 10, attackLevel: 10, guardLevel: 10 },
    });
    expect(getAscensionMaxLevel(result)).toBe(20);
    expect(applyAscensionChallengeResult(
      result,
      "ascension-tier-2",
      true,
    )).toEqual(result);
  });

  it("does not offer an already completed or undefined next challenge", () => {
    const completed = createProgress({
      completedAscensions: ["ascension-tier-2"],
      metaUpgrades: { hpLevel: 10, attackLevel: 10, guardLevel: 10 },
    });
    const tierTwo = createProgress({
      ascensionTier: 1,
      completedAscensions: ["ascension-tier-2"],
      metaUpgrades: { hpLevel: 20, attackLevel: 20, guardLevel: 20 },
    });

    expect(canUnlockAscensionChallenge(completed)).toBe(false);
    expect(getNextAscensionChallenge(tierTwo)).toBeNull();
    expect(canUnlockAscensionChallenge(tierTwo)).toBe(false);
  });
});
