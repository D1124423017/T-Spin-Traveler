export const LOADING_OVERLAY_RECT = Object.freeze({ x: 378, y: 214, w: 524, h: 220 });

export function createLoadingOverlayModel({
  summary = {},
  now = 0,
  startedAt = 0,
  debugEnabled = false,
  debugBuild = "",
  drawError = "",
} = {}) {
  const safeSummary = {
    loading: summary.loading || 0,
    loaded: summary.loaded || 0,
    error: summary.error || 0,
    total: summary.total || 0,
  };
  const elapsed = now - startedAt;
  const progress = safeSummary.total > 0
    ? Math.max(0, Math.min(1, (safeSummary.loaded + safeSummary.error) / safeSummary.total))
    : 0;
  return {
    rect: LOADING_OVERLAY_RECT,
    summary: safeSummary,
    now,
    elapsed,
    pulse: 0.5 + Math.sin(now * 0.006) * 0.5,
    progress,
    message: safeSummary.error > 0
      ? "Some assets failed to load. The game will use fallback visuals."
      : "Loading assets...",
    counterText: `${safeSummary.loaded + safeSummary.error}/${safeSummary.total || "..."}`,
    debugEnabled,
    debugBuild,
    drawError,
  };
}

export function drawLoadingOverlay(ctx, model, {
  canvasFont,
  drawCornerGlyph,
  drawDimOverlay,
  roundedRect,
}) {
  const { rect, summary, elapsed, pulse, progress, message } = model;
  const { x, y, w, h } = rect;

  drawDimOverlay(0.76);
  ctx.save();
  const glow = ctx.createLinearGradient(x, y, x + w, y + h);
  glow.addColorStop(0, "rgba(126, 231, 255, 0.16)");
  glow.addColorStop(0.48, "rgba(184, 141, 255, 0.18)");
  glow.addColorStop(1, "rgba(255, 224, 162, 0.16)");
  ctx.fillStyle = "rgba(4, 7, 14, 0.88)";
  ctx.shadowColor = "rgba(184, 141, 255, 0.34)";
  ctx.shadowBlur = 28;
  roundedRect(x, y, w, h, 10, true, false);
  ctx.shadowBlur = 0;
  ctx.fillStyle = glow;
  roundedRect(x + 8, y + 8, w - 16, h - 16, 8, true, false);
  ctx.strokeStyle = "rgba(255, 240, 166, 0.38)";
  ctx.lineWidth = 1.8;
  roundedRect(x, y, w, h, 10, false, true);
  drawCornerGlyph(x + w / 2, y + 22, "#fff0a6");
  ctx.textAlign = "center";
  ctx.font = canvasFont("900", 26, message, true);
  ctx.fillStyle = summary.error > 0 ? "#ffb7bd" : "#f8f3cf";
  ctx.fillText(message, x + w / 2, y + 92);
  ctx.fillStyle = "rgba(238,244,252,0.68)";
  ctx.font = canvasFont("800", 13, "ASSETS", true);
  ctx.fillText(model.counterText, x + w / 2, y + 124);
  const barX = x + 88;
  const barY = y + 150;
  const barW = w - 176;
  ctx.fillStyle = "rgba(8, 13, 20, 0.68)";
  roundedRect(barX, barY, barW, 12, 6, true, false);
  const fillW = Math.max(18, barW * progress);
  const bar = ctx.createLinearGradient(barX, barY, barX + barW, barY);
  bar.addColorStop(0, "#7ef7ff");
  bar.addColorStop(0.5, "#d7c2ff");
  bar.addColorStop(1, "#fff0a6");
  ctx.globalAlpha = 0.76 + pulse * 0.24;
  ctx.fillStyle = bar;
  roundedRect(barX, barY, fillW, 12, 6, true, false);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(238,244,252,0.18)";
  roundedRect(barX, barY, barW, 12, 6, false, true);
  for (let i = 0; i < 14; i += 1) {
    const a = model.now * 0.0018 + i * 0.55;
    const r = 72 + (i % 4) * 11;
    const sx = x + w / 2 + Math.cos(a) * r;
    const sy = y + 112 + Math.sin(a * 1.4) * 42;
    ctx.globalAlpha = 0.2 + pulse * 0.26;
    ctx.fillStyle = i % 3 === 0 ? "#7ef7ff" : i % 3 === 1 ? "#d7c2ff" : "#fff0a6";
    ctx.fillRect(sx, sy, 2.5, 2.5);
  }
  if (model.debugEnabled) {
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
    ctx.font = "10px monospace";
    ctx.fillStyle = "rgba(157, 247, 218, 0.9)";
    ctx.fillText(`debug: ${model.debugBuild}`, x + 18, y + h - 42);
    ctx.fillText(`asset age: ${Math.round(elapsed)}ms loading:${summary.loading} loaded:${summary.loaded} error:${summary.error}`, x + 18, y + h - 26);
    if (model.drawError) {
      ctx.fillStyle = "#ff8f98";
      ctx.fillText(`draw error: ${model.drawError.slice(0, 72)}`, x + 18, y + h - 10);
    }
  }
  ctx.restore();
}
