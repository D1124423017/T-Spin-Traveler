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
    orbit: now * 0.0012,
    scan: (now * 0.00018) % 1,
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
  const { rect, summary, elapsed, pulse, progress, message, orbit, scan } = model;
  const { x, y, w, h } = rect;

  drawDimOverlay(0.76);
  ctx.save();
  drawLoadingBackdropDial(ctx, x + w / 2, y + 112, pulse, orbit);
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
  drawLoadingPanelScan(ctx, x, y, w, h, scan, roundedRect);
  drawLoadingConstellation(ctx, x, y, w, h, pulse, orbit);
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
  drawLoadingBarSpark(ctx, barX, barY, barW, progress, pulse);
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

function drawLoadingBackdropDial(ctx, cx, cy, pulse, orbit) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.42;
  for (let i = 0; i < 5; i += 1) {
    const radius = 74 + i * 23 + Math.sin(orbit * 1.7 + i) * 2;
    const start = orbit * (0.2 + i * 0.04) + i * 0.7;
    const end = start + Math.PI * (0.44 + i * 0.04);
    ctx.strokeStyle = i % 2 ? "rgba(126, 231, 255, 0.11)" : "rgba(216, 194, 255, 0.12)";
    ctx.lineWidth = i === 0 ? 1.7 : 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, start, end);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.08 + pulse * 0.08;
  ctx.fillStyle = "rgba(255, 240, 166, 0.64)";
  ctx.beginPath();
  ctx.arc(cx, cy, 5 + pulse * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLoadingPanelScan(ctx, x, y, w, h, scan, roundedRect) {
  const sweepX = x + scan * (w + 140) - 94;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const beam = ctx.createLinearGradient(sweepX, y, sweepX + 86, y + h);
  beam.addColorStop(0, "rgba(126, 231, 255, 0)");
  beam.addColorStop(0.5, "rgba(126, 231, 255, 0.08)");
  beam.addColorStop(1, "rgba(255, 240, 166, 0)");
  ctx.fillStyle = beam;
  roundedRect(x + 9, y + 9, w - 18, h - 18, 8, true, false);
  ctx.restore();
}

function drawLoadingConstellation(ctx, x, y, w, h, pulse, orbit) {
  const points = [
    [x + 86, y + 58],
    [x + 145, y + 42],
    [x + 196, y + 70],
    [x + w - 170, y + 52],
    [x + w - 106, y + 76],
    [x + w - 78, y + h - 56],
    [x + 104, y + h - 48],
  ];
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = "rgba(126, 231, 255, 0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < points.length - 1; i += 1) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    if (i === 0) ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
  }
  ctx.stroke();
  for (let i = 0; i < points.length; i += 1) {
    const [px, py] = points[i];
    const twinkle = 0.42 + Math.sin(orbit * 2.4 + i * 1.3) * 0.28 + pulse * 0.18;
    ctx.fillStyle = i % 3 === 0 ? "rgba(255, 240, 166, 0.62)" : "rgba(126, 231, 255, 0.58)";
    ctx.globalAlpha = Math.max(0.18, twinkle);
    ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
  }
  ctx.restore();
}

function drawLoadingBarSpark(ctx, barX, barY, barW, progress, pulse) {
  if (progress <= 0) return;
  const sparkX = barX + Math.max(10, Math.min(barW - 2, barW * progress));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = "rgba(255, 240, 166, 0.76)";
  ctx.shadowBlur = 16 + pulse * 8;
  ctx.fillStyle = "rgba(255, 248, 214, 0.92)";
  ctx.beginPath();
  ctx.arc(sparkX, barY + 6, 4 + pulse * 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
