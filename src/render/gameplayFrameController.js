export function createGameplayFrameController({
  ctx,
  width,
  height,
  state,
  drawBattleBackground,
  drawGameplayFrame,
  normalEnemyCyclesBeforeBoss,
  getNormalEnemyCount,
  drawImageCover,
  roundedRect,
  battleSceneRenderer,
  battleHudRenderer,
  drawPlayer,
  drawEnemy,
  drawBoard,
  drawSidePieces,
  drawAttackEffects,
  drawBursts,
  drawParticles,
  drawFloaters,
  drawCombatPopups,
  drawBossPhaseWarning,
  drawBattleCountdown,
  drawFirstWaveCombatHint,
  drawTutorialPrompt,
  drawPerfectClearFx,
  drawOverlay,
} = {}) {
  function drawBackground() {
    drawBattleBackground({
      ctx,
      width,
      height,
      wave: state.wave,
      normalEnemyCount: getNormalEnemyCount(),
      normalEnemyCyclesBeforeBoss,
      drawImageCover,
      roundedRect,
    });
  }

  function drawSettings() {
    if (state.mode !== "playing") return;
    battleHudRenderer.drawRunRiftEnergyHud();
    battleHudRenderer.drawPauseButton();
  }

  function draw() {
    drawGameplayFrame({
      ctx,
      width,
      height,
      state,
      drawBackground,
      drawPanels: battleSceneRenderer.drawPanels,
      drawPlayer,
      drawTraitList: battleHudRenderer.drawTraitList,
      drawEnemy,
      drawBoard,
      drawSidePieces,
      drawAttackEffects,
      drawBursts,
      drawParticles,
      drawFloaters,
      drawCombatPopups,
      drawBossPhaseWarning,
      drawBattleCountdown,
      drawFirstWaveCombatHint,
      drawTutorialPrompt,
      drawPerfectClearFx,
      drawOverlay,
      drawSettings,
    });
  }

  return {
    draw,
  };
}
