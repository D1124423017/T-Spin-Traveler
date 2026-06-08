export function createMoveGuideOverlayRenderer({
  ctx,
  overlayReadability,
  t,
  label,
  fitLabel,
  wrapText,
  roundedRect,
  hexToRgba,
  drawDimOverlay,
  drawCard,
  drawMenuButton,
}) {
  function drawMoveGuideOverlay() {
    ctx.save();
    drawDimOverlay(overlayReadability.scrim.standard);
    drawCard(176, 70, 928, 580);
    label(t("moveGuide"), 232, 136, 44, "#f5f1e6");
    label(t("moveGuideSubtitle"), 236, 174, 16, "#9fb4ff");
    const rows = [
      ["T-Spin", t("guideTSpinText"), "#f2d36b"],
      ["T-Spin Mini", t("guideTSpinMiniText"), "#d7c2ff"],
      ["All-Spin Mini", t("guideAllSpinMiniText"), "#9df7da"],
      ["Back-to-Back", t("guideB2BText"), "#fff0a6"],
      ["Perfect Clear", t("guidePerfectClearText"), "#fff0a6"],
      ["Incoming Cancel", t("guideIncomingCancelText"), "#ffb7bd"],
    ];
    rows.forEach((row, index) => {
      drawGuideRow(232, 206 + index * 54, row[0], row[1], row[2], 816);
    });
    drawDamageRulesBox(232, 538, 816, 56);
    drawMenuButton(232, 606, 180, 40, t("back"), "Esc");
    ctx.restore();
  }

  function drawDamageRulesBox(x, y, w, h) {
    ctx.save();
    ctx.fillStyle = overlayReadability.surface.fill;
    roundedRect(x, y, w, h, 8, true, false);
    ctx.strokeStyle = "rgba(255, 240, 166, 0.22)";
    roundedRect(x, y, w, h, 8, false, true);
    label(t("damageFormula"), x + 14, y + 26, 16, "#fff0a6");
    wrapText(t("damageRuleLine"), x + 134, y + 20, w - 154, 14, "rgba(238,244,252,0.66)", 10);
    label(`${t("effectTierTitle")}: ${t("effectTierText")}`, x + 14, y + 48, 11, "rgba(238,244,252,0.56)");
    ctx.restore();
  }

  function drawGuideRow(x, y, title, text, color, width = 620) {
    ctx.save();
    ctx.fillStyle = overlayReadability.surface.fill;
    roundedRect(x, y, width, 48, 8, true, false);
    ctx.fillStyle = hexToRgba(color, 0.28);
    roundedRect(x, y, 5, 48, 5, true, false);
    ctx.strokeStyle = hexToRgba(color, 0.25);
    roundedRect(x, y, width, 48, 8, false, true);
    fitLabel(title, x + 18, y + 30, 176, 17, color, 13, "800", true);
    wrapText(text, x + 218, y + 20, width - 242, 16, "rgba(238,244,252,0.72)", 12);
    ctx.restore();
  }

  return {
    drawMoveGuideOverlay,
  };
}
