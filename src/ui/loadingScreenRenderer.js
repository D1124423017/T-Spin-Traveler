export function createLoadingScreenRenderer({
  ctx,
  state,
  debugHudEnabled,
  debugHudBuild,
  getAssetLoadingSummary,
  getFirstPaintReadiness = () => null,
  createLoadingOverlayModel,
  drawLoadingOverlay,
  canvasFont,
  drawCornerGlyph,
  drawDimOverlay,
  roundedRect,
  translate,
  completionDelayMs = 0,
}) {
  function drawAssetLoadingScreen(now = performance.now()) {
    const model = createLoadingOverlayModel({
      summary: getAssetLoadingSummary(),
      firstPaintSummary: getFirstPaintReadiness(),
      now,
      startedAt: state.assetLoadingStartedAt,
      completionStartedAt: state.assetLoadingCompletingAt || 0,
      completionDelayMs,
      debugEnabled: debugHudEnabled,
      debugBuild: debugHudBuild,
      drawError: state.debug.drawError,
      translate,
    });
    drawLoadingOverlay(ctx, model, {
      canvasFont,
      drawCornerGlyph,
      drawDimOverlay,
      roundedRect,
    });
  }

  return {
    drawAssetLoadingScreen,
  };
}
