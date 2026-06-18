import {
  drawOverlayGlassPanel,
  drawOverlayGlassSection,
  drawOverlayTitleRule,
} from "./overlayGlassSkin.js";

export function getRatingColor(rating) {
  if (rating === "PERFECT") return "#fff0a6";
  if (rating === "ARCANE") return "#d7c2ff";
  if (rating === "BRUTAL") return "#ff8f98";
  if (rating === "CLEAN") return "#9df7da";
  return "#f5f1e6";
}

export function getNextBossWave(currentPeak) {
  return Math.max(20, Math.ceil((Math.max(0, currentPeak) + 1) / 10) * 10);
}

export function createResultOverlayRenderer({
  ctx,
  state,
  overlayReadability,
  riftEnergyIcon,
  t,
  fmt,
  label,
  fitLabel,
  wrapText,
  roundedRect,
  drawDimOverlay,
  drawMenuButton,
  drawImageContain,
}) {
  function drawResultOverlay({
    victory,
    message,
    buttons,
    damageSources,
  }) {
    const accent = victory ? "#fff0a6" : "#ff8f98";
    const panel = { x: 318, y: 62, w: 644, h: 536 };
    const skinDeps = { ctx, roundedRect, state };
    ctx.save();
    drawDimOverlay(overlayReadability.scrim.result);
    drawOverlayGlassPanel(skinDeps, panel, {
      colors: victory
        ? ["#fff0a6", "#9b78ff", "#6de8ff", "#fff0a6"]
        : ["#ff8f98", "#9b78ff", "#6de8ff", "#ff8f98"],
      glowIntensity: 0.72,
      glowRadius: 28,
      selectedIntensity: 0.24,
    });
    ctx.textAlign = "left";
    label(victory ? t("victory") : t("defeat"), 382, 134, 48, "#f5f1e6");
    drawOverlayTitleRule(skinDeps, 384, 158, 220, accent);
    wrapText(message, 384, 186, 504, 28, "rgba(238,244,252,0.76)", 19);
    drawRunSummary(damageSources);
    drawMenuButton(
      buttons.retry.x,
      buttons.retry.y,
      buttons.retry.w,
      buttons.retry.h,
      t("retry"),
      "R",
      "primary",
    );
    drawMenuButton(
      buttons.upgrade.x,
      buttons.upgrade.y,
      buttons.upgrade.w,
      buttons.upgrade.h,
      t("upgradeMenu"),
      "",
    );
    drawMenuButton(
      buttons.menu.x,
      buttons.menu.y,
      buttons.menu.w,
      buttons.menu.h,
      t("menu"),
      "Esc",
    );
    ctx.restore();
  }

  function drawRunSummary(damageSources) {
    const rows = [
      [t("waveLabel"), state.stats.peakWave, `${t("bestLabel")} ${state.save.bestWave || 0}`],
      [t("runMaxCombo"), state.stats.maxCombo, `${t("bestLabel")} ${state.save.bestCombo || 0}`],
      [t("runB2BCount"), state.stats.b2bCount, `${t("bestLabel")} ${state.save.bestB2B || 0}`],
      [t("runPerfectClear"), state.stats.perfectClears, `${t("bestLabel")} ${state.save.perfectClears || 0}`],
      [t("runSpinCount"), `${state.stats.spins} / ${t("allSpinShort")} ${state.stats.allSpins}`, ""],
      [t("summaryDamage"), state.stats.damage, `${t("bestLabel")} ${state.save.bestDamage || 0}`],
      [t("summaryBestHit"), state.stats.bestHit, `${t("bestLabel")} ${state.save.bestHit || 0}`],
    ];
    ctx.save();
    label(fmt("rating", { rating: state.stats.rating }), 384, 244, 23, getRatingColor(state.stats.rating));
    for (let i = 0; i < rows.length; i += 1) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 384 + col * 258;
      const y = 278 + row * 32;
      drawOverlayGlassSection({ ctx, roundedRect, state }, { x, y: y - 22, w: 244, h: 28 }, {
        accent: false,
        color: "#8fe8dc",
        edgeSensitivity: 18,
        glowFillOpacity: 0.01,
        radius: 7,
      });
      label(rows[i][0], x + 12, y - 3, 13, "rgba(238,244,252,0.54)");
      label(String(rows[i][1]), x + 118, y - 3, 15, "#f5f1e6");
      if (rows[i][2]) label(rows[i][2], x + 168, y - 3, 11, "#9fb4ff");
    }
    drawResultRiftEnergyPanel(384, 390, 510, 60);
    label(t("summaryDamageSources"), 384, 472, 14, "#8fe8dc");
    wrapText(damageSources || "-", 520, 472, 360, 18, "rgba(238,244,252,0.66)", 12);
    label(getNextRunGoalText(), 384, 498, 13, "#fff0a6");
    ctx.restore();
  }

  function drawResultRiftEnergyPanel(x, y, w, h) {
    const earned = state.runStats?.riftEnergyEarned || 0;
    const total = state.metaProgress?.riftEnergy || 0;
    ctx.save();
    const glow = earned > 0;
    drawOverlayGlassSection({ ctx, roundedRect, state }, { x, y, w, h }, {
      color: glow ? "#fff0a6" : "#8fe8dc",
      edgeSensitivity: 30,
      selected: glow,
      selectedIntensity: glow ? 0.36 : 0.12,
    });
    drawImageContain(riftEnergyIcon, x + 12, y + 8, 44, 44);
    label(t("riftEnergy").toUpperCase(), x + 68, y + 21, 12, "#d7c2ff");
    fitLabel(
      fmt("riftEnergyEarned", { amount: earned }),
      x + 68,
      y + 43,
      228,
      16,
      "#fff0a6",
      12,
      "900",
      true,
    );
    fitLabel(
      fmt("riftEnergyTotal", { amount: total }),
      x + 314,
      y + 43,
      174,
      14,
      "#9fb4ff",
      11,
      "800",
      true,
    );
    ctx.restore();
  }

  function getNextRunGoalText() {
    const currentPeak = state.stats.peakWave || state.wave || 0;
    return fmt("nextRunHookDynamic", { wave: getNextBossWave(currentPeak) });
  }

  return {
    drawResultOverlay,
  };
}
