export const ASCENSION_BASE_LEVEL_CAP = 10;
export const ASCENSION_LEVELS_PER_TIER = 10;

export const META_UPGRADE_LEVEL_KEYS = Object.freeze([
  "hpLevel",
  "attackLevel",
  "guardLevel",
]);

export const ASCENSION_CHALLENGES = Object.freeze([
  Object.freeze({
    id: "ascension-tier-2",
    sourceTier: 0,
    targetTier: 1,
    durationSeconds: 120,
    targetLines: 40,
  }),
]);
