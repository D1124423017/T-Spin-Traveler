export function createPauseOverlayRenderer({
  ctx,
  state,
  uiLayout,
  overlayReadability,
  t,
  label,
  wrapText,
  roundedRect,
  drawDimOverlay,
  drawCard,
  drawMenuButton,
  drawSettingsOverlay,
  controlDisplayValue,
}) {
  function drawPauseOverlay() {
    if (state.pauseView === "settings") {
      drawSettingsOverlay("pause");
      return;
    }
    const menu = uiLayout.pauseMenu;
    ctx.save();
    drawDimOverlay(overlayReadability.scrim.pause);
    drawCard(menu.x, menu.y, menu.w, menu.h);
    label(t("pauseMenu"), menu.x + 48, menu.y + 76, 42, "#f5f1e6");
    wrapText(t("pauseMenuHint"), menu.x + 50, menu.y + 112, menu.w - 100, 22, "rgba(238,244,252,0.62)", 15);
    drawMenuButton(
      menu.x + 56,
      menu.y + 156,
      menu.w - 112,
      48,
      t("resume"),
      controlDisplayValue("pause"),
      "primary",
    );
    drawMenuButton(menu.x + 56, menu.y + 216, menu.w - 112, 44, t("restart"), "R");
    drawMenuButton(menu.x + 56, menu.y + 270, menu.w - 112, 44, t("settings"), "");
    drawMenuButton(menu.x + 56, menu.y + 324, menu.w - 112, 44, t("menu"), "Esc");
    drawPauseStat(menu.x + 58, menu.y + 400, t("waveLabel"), state.wave);
    drawPauseStat(menu.x + 252, menu.y + 400, t("comboLabel"), state.combo);
    ctx.restore();
  }

  function drawPauseStat(x, y, name, value) {
    ctx.save();
    ctx.fillStyle = overlayReadability.surface.fill;
    roundedRect(x, y - 22, 190, 28, 7, true, false);
    ctx.strokeStyle = "rgba(145, 232, 222, 0.16)";
    roundedRect(x, y - 22, 190, 28, 7, false, true);
    label(name, x + 14, y - 3, 14, "rgba(238,244,252,0.58)");
    label(String(value), x + 128, y - 3, 15, "#f5f1e6");
    ctx.restore();
  }

  return {
    drawPauseOverlay,
  };
}
