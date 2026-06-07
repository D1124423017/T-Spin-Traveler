import {
  resetCanvasFrame,
  resetCanvasTransform,
} from "./renderStyles.js";

export function drawGameplayFrame({
  ctx,
  width,
  height,
  state,
  now = performance.now(),
  drawBackground,
  drawPanels,
  drawPlayer,
  drawTraitList,
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
} = {}) {
  state.debug.lastDrawAt = now;
  resetCanvasFrame(ctx, width, height);
  ctx.save();
  try {
    const jitter = state.shake ? Math.sin(now * 0.06) * state.shake : 0;
    ctx.translate(jitter, 0);
    drawBackground();
    drawPanels();
    drawPlayer();
    drawTraitList();
    drawEnemy();
    drawBoard();
    drawSidePieces();
    drawAttackEffects();
    drawBursts();
    drawParticles();
    drawFloaters();
    drawCombatPopups();
    drawBossPhaseWarning();
    drawBattleCountdown();
    drawFirstWaveCombatHint();
    drawTutorialPrompt();
    drawPerfectClearFx();
    drawOverlay();
    if (!["start", "guide", "upgrade", "metaUpgrade", "victory", "defeat"].includes(state.mode)) {
      drawSettings();
    }
  } finally {
    ctx.restore();
    resetCanvasTransform(ctx);
  }
}
