export function createModeOverlayRouter({
  drawAscensionResultOverlay,
  drawEquipmentOverlay,
  drawMetaUpgradeOverlay,
  drawUpgradeOverlay,
  drawMoveGuideOverlay,
  drawPauseOverlay,
  drawAssetLoadingScreen,
  drawStartOverlay,
  drawStoryOverlay,
  drawFallbackModeOverlay,
} = {}) {
  const handlers = {
    ascensionResult: drawAscensionResultOverlay,
    equipment: drawEquipmentOverlay,
    metaUpgrade: drawMetaUpgradeOverlay,
    upgrade: drawUpgradeOverlay,
    guide: drawMoveGuideOverlay,
    pause: drawPauseOverlay,
    assetLoading: drawAssetLoadingScreen,
    start: drawStartOverlay,
    story: drawStoryOverlay,
  };

  return function drawModeOverlay(overlayPath) {
    const handler = handlers[overlayPath] || drawFallbackModeOverlay;
    handler();
    return overlayPath;
  };
}

export function resolveModeOverlayPath({
  mode = "playing",
  overlayPath = "none",
} = {}) {
  if (mode === "story") return "story";
  return overlayPath;
}
