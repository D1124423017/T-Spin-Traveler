import {
  drawOverlayGlassPanel,
  drawOverlayGlassSection,
  drawOverlayTitleRule,
} from "./overlayGlassSkin.js";

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
    const skinDeps = { ctx, roundedRect, state };
    ctx.save();
    drawDimOverlay(overlayReadability.scrim.pause);
    drawOverlayGlassPanel(skinDeps, menu, {
      glowIntensity: 0.68,
      glowRadius: 26,
      selectedIntensity: 0.24,
    });
    label(t("pauseMenu"), menu.x + 48, menu.y + 76, 42, "#f5f1e6");
    drawOverlayTitleRule(skinDeps, menu.x + 50, menu.y + 94, menu.w - 100, "#8fe8dc");
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
    drawOverlayGlassSection({ ctx, roundedRect, state }, { x, y: y - 24, w: 190, h: 32 }, {
      accent: false,
      color: "#8fe8dc",
      edgeSensitivity: 18,
      glowFillOpacity: 0.01,
      radius: 8,
    });
    label(name, x + 14, y - 3, 14, "rgba(238,244,252,0.58)");
    label(String(value), x + 128, y - 3, 15, "#f5f1e6");
    ctx.restore();
  }

  return {
    drawPauseOverlay,
  };
}
