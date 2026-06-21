import { getLoadingCountUpProgress } from "./loadingCountUp.js";

export const LOADING_OVERLAY_RECT = Object.freeze({ x: 318, y: 160, w: 644, h: 332 });

const DEFAULT_LOADING_TEXT = Object.freeze({
  loadingTitle: "Rift Synchronizing",
  loadingSubtitle: "Preparing the first sight of the kingdom",
  loadingPreparingAssets: "Preparing rift assets...",
  loadingComplete: "Rift gate aligned",
  loadingAssetError: "Some critical rift assets failed to load.",
});

function defaultTranslate(key) {
  return DEFAULT_LOADING_TEXT[key] || key;
}

function easeOutCubic(value) {
  const t = Math.max(0, Math.min(1, value));
  return 1 - ((1 - t) ** 3);
}

function smoothstep(edge0, edge1, value) {
  if (edge0 === edge1) return value >= edge1 ? 1 : 0;
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function createLoadingOverlayModel({
  summary = {},
  now = 0,
  startedAt = 0,
  debugEnabled = false,
  debugBuild = "",
  drawError = "",
  firstPaintSummary = null,
  completionStartedAt = 0,
  completionDelayMs = 0,
  translate = defaultTranslate,
} = {}) {
  const safeSummary = {
    loading: summary.loading || 0,
    loaded: summary.loaded || 0,
    error: summary.error || 0,
    total: summary.total || 0,
  };
  const safeFirstPaint = firstPaintSummary ? {
    ready: firstPaintSummary.ready === true,
    loading: firstPaintSummary.loading?.length || 0,
    loaded: firstPaintSummary.loaded || 0,
    error: firstPaintSummary.error || 0,
    total: firstPaintSummary.total || 0,
  } : null;
  const elapsed = now - startedAt;
  const progressSource = safeFirstPaint || safeSummary;
  const hasProgressSource = progressSource.total > 0;
  const realProgress = progressSource.total > 0
    ? Math.max(0, Math.min(1, (progressSource.loaded + progressSource.error) / progressSource.total))
    : 0;
  const stagedProgress = Math.min(0.94, 0.16 + easeOutCubic(elapsed / 1800) * 0.74);
  const gateReady = hasProgressSource && (safeFirstPaint ? safeFirstPaint.ready : safeSummary.loading === 0);
  const completionProgress = completionStartedAt && completionDelayMs > 0
    ? Math.max(0, Math.min(1, (now - completionStartedAt) / completionDelayMs))
    : 0;
  const progress = hasProgressSource
    ? gateReady
      ? Math.max(realProgress, completionProgress > 0 ? 1 : 0.98)
      : Math.min(0.96, Math.max(realProgress, stagedProgress))
    : 0;
  const countUp = getLoadingCountUpProgress({
    targetProgress: progress,
    elapsedMs: elapsed,
    completionProgress,
  });
  const hasError = (safeFirstPaint?.error || safeSummary.error) > 0;
  const message = hasError
    ? translate("loadingAssetError")
    : completionProgress > 0
      ? translate("loadingComplete")
      : translate("loadingPreparingAssets");
  return {
    rect: LOADING_OVERLAY_RECT,
    summary: safeSummary,
    firstPaintSummary: safeFirstPaint,
    now,
    elapsed,
    pulse: 0.5 + Math.sin(now * 0.006) * 0.5,
    orbit: now * 0.0012,
    scan: (now * 0.00018) % 1,
    shimmer: (now * 0.00032) % 1,
    progress,
    displayProgress: countUp.displayProgress,
    displayPercent: countUp.displayPercent,
    percentText: countUp.percentText,
    realProgress,
    gateReady,
    completionProgress,
    title: translate("loadingTitle"),
    subtitle: translate("loadingSubtitle"),
    message,
    counterText: `${progressSource.loaded + progressSource.error}/${progressSource.total || "..."}`,
    debugEnabled,
    debugBuild,
    drawError,
  };
}

export function drawLoadingOverlay(ctx, model, {
  canvasFont,
  drawCornerGlyph,
  drawDimOverlay,
  loadingBackground,
  roundedRect,
}) {
  const {
    rect,
    summary,
    elapsed,
    pulse,
    displayProgress,
    message,
    orbit,
    scan,
    shimmer,
    completionProgress,
  } = model;
  const { x, y, w, h } = rect;
  const canvas = ctx.canvas || {};
  const canvasW = canvas.width || 1280;
  const canvasH = canvas.height || 720;

  if (isRenderableImage(loadingBackground)) {
    drawLoadingBackgroundImage(ctx, loadingBackground, canvasW, canvasH, model.now, pulse);
    drawLoadingAuroraBackdrop(ctx, canvasW, canvasH, model.now, pulse, orbit, { fillBase: false });
  } else {
    drawLoadingAuroraBackdrop(ctx, canvasW, canvasH, model.now, pulse, orbit);
  }
  drawDimOverlay(0.26);
  ctx.save();
  ctx.globalAlpha *= 1 - smoothstep(0.72, 1, completionProgress) * 0.55;
  drawLoadingBackdropDial(ctx, x + w / 2, y + 166, pulse, orbit);
  const glow = ctx.createLinearGradient(x, y, x + w, y + h);
  glow.addColorStop(0, "rgba(126, 231, 255, 0.14)");
  glow.addColorStop(0.46, "rgba(184, 141, 255, 0.2)");
  glow.addColorStop(1, "rgba(255, 224, 162, 0.13)");
  ctx.fillStyle = "rgba(3, 5, 14, 0.9)";
  ctx.shadowColor = completionProgress > 0
    ? "rgba(255, 240, 166, 0.52)"
    : "rgba(184, 141, 255, 0.38)";
  ctx.shadowBlur = 32 + pulse * 8;
  roundedRect(x, y, w, h, 14, true, false);
  ctx.shadowBlur = 0;
  ctx.fillStyle = glow;
  roundedRect(x + 8, y + 8, w - 16, h - 16, 10, true, false);
  drawLoadingPanelScan(ctx, x, y, w, h, scan, roundedRect);
  drawLoadingConstellation(ctx, x, y, w, h, pulse, orbit);
  drawLoadingRunes(ctx, x, y, w, h, orbit, pulse);
  ctx.strokeStyle = completionProgress > 0
    ? "rgba(255, 240, 166, 0.62)"
    : "rgba(126, 231, 255, 0.4)";
  ctx.lineWidth = 1.9;
  roundedRect(x, y, w, h, 14, false, true);
  drawCornerGlyph(x + w / 2, y + 24, completionProgress > 0 ? "#fff0a6" : "#d7c2ff");
  ctx.textAlign = "center";
  ctx.font = canvasFont("900", 34, model.title, true);
  drawShinyText(ctx, model.title, x + w / 2, y + 72, w - 80, shimmer, {
    base: "#f8f3cf",
    shine: "#7ef7ff",
    shadow: "rgba(126, 231, 255, 0.46)",
  });
  ctx.font = canvasFont("800", 14, model.subtitle, true);
  ctx.fillStyle = "rgba(218, 227, 255, 0.72)";
  ctx.fillText(model.subtitle, x + w / 2, y + 102, w - 92);
  drawLoadingPercent(ctx, model.percentText, x + w / 2, y + 178, w - 110, shimmer, canvasFont);
  ctx.font = canvasFont("900", 20, message, true);
  drawShinyText(ctx, message, x + w / 2, y + 222, w - 110, shimmer + 0.28, {
    base: summary.error > 0 ? "#ffb7bd" : "#f8f3cf",
    shine: "#fff0a6",
    shadow: "rgba(184, 141, 255, 0.42)",
  });
  ctx.fillStyle = "rgba(238,244,252,0.66)";
  ctx.font = canvasFont("800", 13, model.counterText, true);
  ctx.fillText(model.counterText, x + w / 2, y + 294);
  const barX = x + 78;
  const barY = y + 248;
  const barW = w - 156;
  ctx.fillStyle = "rgba(4, 9, 20, 0.76)";
  roundedRect(barX, barY, barW, 16, 8, true, false);
  const fillW = Math.max(displayProgress > 0 ? 18 : 0, barW * displayProgress);
  const bar = ctx.createLinearGradient(barX, barY, barX + barW, barY);
  bar.addColorStop(0, "#7ef7ff");
  bar.addColorStop(0.5, "#d7c2ff");
  bar.addColorStop(1, "#fff0a6");
  ctx.globalAlpha = 0.76 + pulse * 0.24;
  ctx.fillStyle = bar;
  roundedRect(barX, barY, fillW, 16, 8, true, false);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(238,244,252,0.2)";
  roundedRect(barX, barY, barW, 16, 8, false, true);
  drawLoadingBarSpark(ctx, barX, barY, barW, displayProgress, pulse);
  drawLoadingParticles(ctx, x, y, w, h, model.now, pulse);
  if (completionProgress > 0) drawCompletionShimmer(ctx, x, y, w, h, completionProgress, roundedRect);
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

function isRenderableImage(image) {
  return Boolean(image && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
}

function drawLoadingBackgroundImage(ctx, image, width, height, now, pulse) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawW = image.naturalWidth * scale;
  const drawH = image.naturalHeight * scale;
  const driftX = Math.sin(now * 0.00022) * 5;
  const driftY = Math.cos(now * 0.00018) * 4;
  ctx.save();
  ctx.drawImage(
    image,
    (width - drawW) / 2 + driftX,
    (height - drawH) / 2 + driftY,
    drawW,
    drawH,
  );
  const vignette = ctx.createRadialGradient(
    width * 0.5,
    height * 0.48,
    Math.min(width, height) * 0.18,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.72,
  );
  vignette.addColorStop(0, `rgba(23, 9, 58, ${0.03 + pulse * 0.03})`);
  vignette.addColorStop(0.52, "rgba(3, 4, 15, 0.08)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.46)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawLoadingAuroraBackdrop(ctx, width, height, now, pulse, orbit, {
  fillBase = true,
} = {}) {
  const base = ctx.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, "#02050d");
  base.addColorStop(0.45, "#09071e");
  base.addColorStop(1, "#060912");
  ctx.save();
  if (fillBase) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 4; i += 1) {
    const cx = width * (0.2 + i * 0.22) + Math.sin(orbit * 1.5 + i) * 48;
    const cy = height * (0.18 + (i % 2) * 0.36) + Math.cos(orbit * 1.2 + i) * 34;
    const radius = Math.max(width, height) * (0.28 + i * 0.03);
    const glow = ctx.createRadialGradient(cx, cy, 12, cx, cy, radius);
    glow.addColorStop(0, i % 2 ? "rgba(126, 231, 255, 0.13)" : "rgba(156, 95, 255, 0.16)");
    glow.addColorStop(0.42, i % 2 ? "rgba(58, 105, 255, 0.05)" : "rgba(89, 38, 170, 0.07)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.72 + pulse * 0.12;
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
}

function drawLoadingPercent(ctx, text, x, y, maxWidth, shimmer, canvasFont) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = canvasFont("900", 58, text, true);
  ctx.shadowColor = "rgba(126, 231, 255, 0.55)";
  ctx.shadowBlur = 24;
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(5, 6, 20, 0.78)";
  ctx.strokeText(text, x, y, maxWidth);
  const width = Math.min(maxWidth, Math.max(128, ctx.measureText(text).width + 44));
  const sweep = x - width / 2 + ((shimmer % 1) * (width + 180)) - 90;
  const fill = ctx.createLinearGradient(sweep - 60, y - 42, sweep + 110, y + 10);
  fill.addColorStop(0, "#d7c2ff");
  fill.addColorStop(0.46, "#fff0a6");
  fill.addColorStop(0.64, "#7ef7ff");
  fill.addColorStop(1, "#f8f3cf");
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y, maxWidth);
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.24;
  ctx.fillText(text, x, y, maxWidth);
  ctx.restore();
}

function drawShinyText(ctx, text, x, y, maxWidth, shimmer, {
  base,
  shine,
  shadow,
}) {
  ctx.save();
  ctx.shadowColor = shadow;
  ctx.shadowBlur = 14;
  const width = Math.min(maxWidth, Math.max(180, ctx.measureText(text).width + 34));
  const sweep = x - width / 2 + ((shimmer % 1) * (width + 160)) - 80;
  const gradient = ctx.createLinearGradient(sweep - 48, y, sweep + 82, y);
  gradient.addColorStop(0, base);
  gradient.addColorStop(0.48, shine);
  gradient.addColorStop(1, base);
  ctx.fillStyle = gradient;
  ctx.fillText(text, x, y, maxWidth);
  ctx.restore();
}

function drawLoadingRunes(ctx, x, y, w, h, orbit, pulse) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = `rgba(255, 240, 166, ${0.18 + pulse * 0.12})`;
  ctx.lineWidth = 1.1;
  const marks = [
    [x + 36, y + 34, 0],
    [x + w - 36, y + 34, Math.PI / 2],
    [x + 36, y + h - 34, -Math.PI / 2],
    [x + w - 36, y + h - 34, Math.PI],
  ];
  for (const [mx, my, rotation] of marks) {
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(rotation + Math.sin(orbit * 1.2) * 0.04);
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(-4, 0);
    ctx.moveTo(4, 0);
    ctx.lineTo(18, 0);
    ctx.moveTo(0, -18);
    ctx.lineTo(0, -4);
    ctx.moveTo(0, 4);
    ctx.lineTo(0, 18);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function drawLoadingParticles(ctx, x, y, w, h, now, pulse) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 22; i += 1) {
    const a = now * 0.0015 + i * 0.57;
    const r = 84 + (i % 6) * 17;
    const sx = x + w / 2 + Math.cos(a) * r;
    const sy = y + h / 2 + Math.sin(a * 1.34) * (46 + (i % 4) * 7);
    ctx.globalAlpha = 0.16 + pulse * 0.24;
    ctx.fillStyle = i % 3 === 0 ? "#7ef7ff" : i % 3 === 1 ? "#d7c2ff" : "#fff0a6";
    ctx.fillRect(sx, sy, 2.4, 2.4);
  }
  ctx.restore();
}

function drawCompletionShimmer(ctx, x, y, w, h, progress, roundedRect) {
  const sweepX = x - w * 0.35 + progress * w * 1.7;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const beam = ctx.createLinearGradient(sweepX - 80, y, sweepX + 100, y + h);
  beam.addColorStop(0, "rgba(255, 240, 166, 0)");
  beam.addColorStop(0.5, "rgba(255, 240, 166, 0.24)");
  beam.addColorStop(1, "rgba(126, 231, 255, 0)");
  ctx.fillStyle = beam;
  roundedRect(x + 8, y + 8, w - 16, h - 16, 10, true, false);
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
  ctx.arc(sparkX, barY + 8, 4 + pulse * 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
