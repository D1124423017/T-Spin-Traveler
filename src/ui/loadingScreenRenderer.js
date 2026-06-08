export function createLoadingScreenRenderer({
  ctx,
  state,
  debugHudEnabled,
  debugHudBuild,
  getAssetLoadingSummary,
  createLoadingOverlayModel,
  drawLoadingOverlay,
  canvasFont,
  drawCornerGlyph,
  drawDimOverlay,
  roundedRect,
}) {
  function drawAssetLoadingScreen(now = performance.now()) {
    const model = createLoadingOverlayModel({
      summary: getAssetLoadingSummary(),
      now,
      startedAt: state.assetLoadingStartedAt,
      debugEnabled: debugHudEnabled,
      debugBuild: debugHudBuild,
      drawError: state.debug.drawError,
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
