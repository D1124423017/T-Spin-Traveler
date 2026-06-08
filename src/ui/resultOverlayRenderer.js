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
  drawCard,
  drawMenuButton,
  drawImageContain,
  formatDamageSources,
}) {
  function drawResultOverlay({
    victory,
    message,
    buttons,
  }) {
    const accent = victory ? "#fff0a6" : "#ff8f98";
    ctx.save();
    drawDimOverlay(overlayReadability.scrim.result);
    drawCard(318, 62, 644, 536);
    ctx.textAlign = "left";
    label(victory ? t("victory") : t("defeat"), 382, 134, 48, "#f5f1e6");
    ctx.fillStyle = accent;
    roundedRect(384, 156, 210, 4, 8, true, false);
    wrapText(message, 384, 186, 504, 28, "rgba(238,244,252,0.76)", 19);
    drawRunSummary();
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

  function drawRunSummary() {
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
      ctx.fillStyle = overlayReadability.surface.fillSoft;
      roundedRect(x, y - 20, 244, 24, 6, true, false);
      label(rows[i][0], x + 12, y - 3, 13, "rgba(238,244,252,0.54)");
      label(String(rows[i][1]), x + 118, y - 3, 15, "#f5f1e6");
      if (rows[i][2]) label(rows[i][2], x + 168, y - 3, 11, "#9fb4ff");
    }
    drawResultRiftEnergyPanel(384, 390, 510, 60);
    label(t("summaryDamageSources"), 384, 472, 14, "#8fe8dc");
    wrapText(formatDamageSources(), 520, 472, 360, 18, "rgba(238,244,252,0.66)", 12);
    label(getNextRunGoalText(), 384, 498, 13, "#fff0a6");
    ctx.restore();
  }

  function drawResultRiftEnergyPanel(x, y, w, h) {
    const earned = state.runStats?.riftEnergyEarned || 0;
    const total = state.metaProgress?.riftEnergy || 0;
    ctx.save();
    const glow = earned > 0;
    const background = ctx.createLinearGradient(x, y, x + w, y + h);
    background.addColorStop(0, "rgba(26, 17, 48, 0.68)");
    background.addColorStop(0.55, "rgba(8, 13, 24, 0.72)");
    background.addColorStop(1, "rgba(20, 33, 48, 0.56)");
    ctx.fillStyle = background;
    ctx.shadowColor = glow ? "rgba(184, 141, 255, 0.26)" : "rgba(126, 231, 255, 0.1)";
    ctx.shadowBlur = glow ? 18 : 9;
    roundedRect(x, y, w, h, 10, true, false);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = glow ? "rgba(255, 240, 166, 0.38)" : "rgba(145, 232, 222, 0.2)";
    ctx.lineWidth = 1.4;
    roundedRect(x, y, w, h, 10, false, true);
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
