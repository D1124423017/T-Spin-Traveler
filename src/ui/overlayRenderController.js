export function createOverlayRenderController(getBindings) {
  function bindings() {
    return getBindings();
  }

  function drawMetaUpgradeOverlay() {
    const {
      ctx,
      state,
      t,
      fmt,
      canvasFont,
      label,
      fitLabel,
      wrapText,
      roundedRect,
      drawImageContain,
      drawMainMenuScene,
      drawDimOverlay,
      drawCard,
      drawCornerGlyph,
      drawMenuButton,
      drawMetaUpgradeScreen,
      metaUpgradeIcons,
      riftEnergyIcon,
      now,
    } = bindings();

    drawMetaUpgradeScreen({
      ctx,
      progress: state.metaProgress,
      pointer: state.pointer,
      message: state.metaUpgradeMessage,
      now: now(),
      t,
      fmt,
      canvasFont,
      label,
      fitLabel,
      wrapText,
      roundedRect,
      drawImageContain,
      drawMainMenuScene,
      drawDimOverlay,
      drawCard,
      drawCornerGlyph,
      drawMenuButton,
      metaUpgradeIcons,
      riftEnergyIcon,
    });
  }

  function drawEquipmentOverlay() {
    bindings().equipmentScreenRenderer.drawEquipmentScreen();
  }

  function drawSettingsOverlay(source = "pause") {
    bindings().settingsScreenRenderer.draw(source);
  }

  function drawStartOverlay() {
    const { state, drawStartMenuOverlay } = bindings();
    drawStartMenuOverlay();
    if (state.settingsOpen) drawSettingsOverlay("start");
  }

  function drawAscensionResultOverlay() {
    const {
      ctx,
      state,
      getMessage,
      t,
      fmt,
      drawDimOverlay,
      resultScrim,
      drawCard,
      drawCornerGlyph,
      label,
      wrapText,
      roundedRect,
      drawMenuButton,
      renderAscensionResultOverlay,
    } = bindings();

    renderAscensionResultOverlay({
      ctx,
      run: state.ascensionRun,
      metaProgress: state.metaProgress,
      message: getMessage(),
      t,
      fmt,
      drawDimOverlay,
      resultScrim,
      drawCard,
      drawCornerGlyph,
      label,
      wrapText,
      roundedRect,
      drawMenuButton,
    });
  }

  function drawAscensionChallengeHud() {
    const {
      ctx,
      state,
      fmt,
      fitLabel,
      roundedRect,
      renderAscensionChallengeHud,
    } = bindings();

    renderAscensionChallengeHud({
      ctx,
      run: state.ascensionRun,
      fmt,
      fitLabel,
      roundedRect,
    });
  }

  function drawUpgradeOverlay() {
    bindings().upgradeScreenRenderer.drawUpgradeOverlay();
  }

  return {
    drawAscensionChallengeHud,
    drawAscensionResultOverlay,
    drawEquipmentOverlay,
    drawMetaUpgradeOverlay,
    drawSettingsOverlay,
    drawStartOverlay,
    drawUpgradeOverlay,
  };
}
