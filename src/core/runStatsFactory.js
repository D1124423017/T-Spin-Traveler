export function createRunStatsFactory({
  damageSourceKeys = [],
} = {}) {
  function makeStats() {
    return {
      peakWave: 1,
      maxCombo: 0,
      b2bCount: 0,
      perfectClears: 0,
      spins: 0,
      allSpins: 0,
      damage: 0,
      bestHit: 0,
      damageSources: Object.fromEntries(damageSourceKeys.map((key) => [key, 0])),
      rating: "GOOD",
    };
  }

  function makeRunStats() {
    return {
      waveReached: 1,
      normalEnemyKills: 0,
      bossKills: 0,
      perfectClearCount: 0,
      spinCount: 0,
      maxCombo: 0,
      riftEnergyEarned: 0,
      riftEnergySettled: false,
    };
  }

  return {
    makeRunStats,
    makeStats,
  };
}
