export function createGameModeOverlayRenderer({
  ctx,
  state,
  overlayReadability,
  t,
  getMessage,
  label,
  wrapText,
  drawDimOverlay,
  drawCard,
  drawMenuButton,
}) {
  function drawFallbackModeOverlay() {
    ctx.save();
    drawDimOverlay(overlayReadability.scrim.standard);
    drawCard(318, 126, 644, 324);
    const title =
      state.mode === "start"
        ? t("startTitle")
        : state.mode === "paused"
          ? t("paused")
          : state.mode === "victory"
            ? t("victory")
            : t("defeat");
    label(title, 382, 206, 48, "#f5f1e6");
    const sub = state.mode === "start" ? t("startSubtitle") : getMessage();
    wrapText(sub, 384, 260, 504, 28, "rgba(238,244,252,0.76)", 19);
    if (state.mode === "start") {
      drawMenuButton(384, 318, 510, 54, t("endless"), "Enter");
      drawMenuButton(384, 386, 510, 44, t("mainStageStart"), t("mainStageEgyptShort"));
      drawMenuButton(384, 454, 244, 44, t("settings"), "Esc");
      drawMenuButton(650, 454, 244, 44, t("practice"), "spins");
      label(t("startHint"), 384, 534, 18, "#9fb4ff");
      if (!state.save.tutorialCompleted) label(t("firstRunHint"), 384, 562, 14, "#fff0a6");
    } else {
      drawMenuButton(384, 318, 248, 44, t("retry"), "Enter");
      drawMenuButton(646, 318, 248, 44, t("menu"), "Esc");
    }
    ctx.restore();
  }

  return {
    drawFallbackModeOverlay,
  };
}
