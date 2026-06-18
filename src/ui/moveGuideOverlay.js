import {
  drawOverlayGlassPanel,
  drawOverlayGlassSection,
  drawOverlayTitleRule,
} from "./overlayGlassSkin.js";

export function createMoveGuideOverlayRenderer({
  ctx,
  overlayReadability,
  t,
  label,
  fitLabel,
  wrapText,
  roundedRect,
  drawDimOverlay,
  drawMenuButton,
}) {
  function drawMoveGuideOverlay() {
    const panel = { x: 204, y: 76, w: 872, h: 584 };
    const contentX = panel.x + 52;
    const rowX = panel.x + 56;
    const rowW = panel.w - 112;
    const skinDeps = { ctx, roundedRect };
    ctx.save();
    drawDimOverlay(overlayReadability.scrim.standard);
    drawOverlayGlassPanel(skinDeps, panel, {
      glowIntensity: 0.7,
      glowRadius: 28,
      selectedIntensity: 0.24,
    });
    label(t("moveGuide"), contentX, panel.y + 74, 44, "#f5f1e6");
    drawOverlayTitleRule(skinDeps, contentX + 2, panel.y + 90, 354, "#8fe8dc");
    wrapText(t("moveGuideSubtitle"), contentX + 2, panel.y + 118, panel.w - 112, 20, "#9fb4ff", 14);
    const rows = [
      ["T-Spin", t("guideTSpinText"), "#f2d36b"],
      ["T-Spin Mini", t("guideTSpinMiniText"), "#d7c2ff"],
      ["All-Spin Mini", t("guideAllSpinMiniText"), "#9df7da"],
      ["Back-to-Back", t("guideB2BText"), "#fff0a6"],
      ["Perfect Clear", t("guidePerfectClearText"), "#fff0a6"],
      ["Incoming Cancel", t("guideIncomingCancelText"), "#ffb7bd"],
    ];
    rows.forEach((row, index) => {
      drawGuideRow(rowX, 214 + index * 54, row[0], row[1], row[2], rowW);
    });
    drawDamageRulesBox(rowX, 544, rowW, 54);
    drawMenuButton(232, 606, 180, 40, t("back"), "Esc");
    ctx.restore();
  }

  function drawDamageRulesBox(x, y, w, h) {
    ctx.save();
    drawOverlayGlassSection({ ctx, roundedRect }, { x, y, w, h }, {
      color: "#fff0a6",
      edgeSensitivity: 24,
      selected: true,
      selectedIntensity: 0.12,
    });
    label(t("damageFormula"), x + 18, y + 25, 16, "#fff0a6");
    wrapText(t("damageRuleLine"), x + 150, y + 19, w - 174, 14, "rgba(238,244,252,0.7)", 10);
    label(`${t("effectTierTitle")}: ${t("effectTierText")}`, x + 18, y + 46, 11, "rgba(238,244,252,0.58)");
    ctx.restore();
  }

  function drawGuideRow(x, y, title, text, color, width = 620) {
    ctx.save();
    drawOverlayGlassSection({ ctx, roundedRect }, { x, y, w: width, h: 48 }, {
      color,
      edgeSensitivity: 26,
    });
    fitLabel(title, x + 22, y + 30, 190, 17, color, 13, "800", true);
    wrapText(text, x + 238, y + 20, width - 264, 16, "rgba(238,244,252,0.74)", 12);
    ctx.restore();
  }

  return {
    drawMoveGuideOverlay,
  };
}
