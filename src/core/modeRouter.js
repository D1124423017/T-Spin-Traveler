export function createModeOverlayRouter({
  drawAscensionResultOverlay,
  drawMetaUpgradeOverlay,
  drawUpgradeOverlay,
  drawMoveGuideOverlay,
  drawPauseOverlay,
  drawAssetLoadingScreen,
  drawStartOverlay,
  drawFallbackModeOverlay,
} = {}) {
  const handlers = {
    ascensionResult: drawAscensionResultOverlay,
    metaUpgrade: drawMetaUpgradeOverlay,
    upgrade: drawUpgradeOverlay,
    guide: drawMoveGuideOverlay,
    pause: drawPauseOverlay,
    assetLoading: drawAssetLoadingScreen,
    start: drawStartOverlay,
  };

  return function drawModeOverlay(overlayPath) {
    const handler = handlers[overlayPath] || drawFallbackModeOverlay;
    handler();
    return overlayPath;
  };
}
