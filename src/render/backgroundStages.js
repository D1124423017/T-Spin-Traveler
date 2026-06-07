export function getBackgroundStageForWave(
  wave,
  {
    normalEnemyCount,
    normalEnemyCyclesBeforeBoss,
    backgroundStages,
    bossStage,
  } = {},
) {
  const cycleLength = Math.max(1, normalEnemyCount * normalEnemyCyclesBeforeBoss + 1);
  if (wave > 0 && (wave - 1) % cycleLength === cycleLength - 1) return bossStage;
  if (!backgroundStages.length) return bossStage;
  return backgroundStages[Math.max(0, wave - 1) % backgroundStages.length];
}
