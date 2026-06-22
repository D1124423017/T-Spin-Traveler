import { getLoadingCountUpProgress } from "./loadingCountUp.js";

export const LOADING_OVERLAY_RECT = Object.freeze({ x: 236, y: 530, w: 808, h: 132 });

export const LOADING_HUD_LAYOUT = Object.freeze({
  x: 236,
  y: 530,
  w: 808,
  h: 132,
  titleY: 544,
  subtitleY: 565,
  percentY: 590,
  barX: 264,
  barY: 612,
  barW: 752,
  barH: 16,
  messageY: 646,
  debugX: 24,
  debugY: 650,
});

export const LOADING_PERCENT_TYPOGRAPHY = Object.freeze({
  fontSize: 36,
  shadowAlpha: 0.42,
  shadowBlur: 14,
  strokeWidth: 3,
  lighterAlpha: 0.16,
});

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

function readReducedMotion() {
  return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
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
  reducedMotion = readReducedMotion(),
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
  const hasCriticalError = safeFirstPaint ? safeFirstPaint.error > 0 : safeSummary.error > 0;
  const message = hasCriticalError
    ? translate("loadingAssetError")
    : completionProgress > 0
      ? translate("loadingComplete")
      : translate("loadingPreparingAssets");
  return {
    rect: LOADING_OVERLAY_RECT,
    layout: LOADING_HUD_LAYOUT,
    summary: safeSummary,
    firstPaintSummary: safeFirstPaint,
    now,
    elapsed,
    pulse: 0.5 + Math.sin(now * 0.006) * 0.5,
    orbit: now * 0.0012,
    scan: (now * 0.00018) % 1,
    shimmer: (now * 0.00032) % 1,
    backgroundMotion: createLoadingBackgroundMotion(now, Boolean(reducedMotion)),
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
    hasCriticalError,
  };
}

export function createLoadingBackgroundMotion(now = 0, reducedMotion = false) {
  const time = Math.max(0, Number(now) || 0);
  const intensity = reducedMotion ? 0.28 : 1;
  const maxDriftPx = reducedMotion ? 1.4 : 5.4;
  return {
    reducedMotion: Boolean(reducedMotion),
    intensity,
    maxDriftPx,
    driftX: Math.sin(time * 0.00022) * maxDriftPx,
    driftY: Math.cos(time * 0.00018) * maxDriftPx * 0.72,
    particleCount: reducedMotion ? 10 : 32,
    corePulse: 0.5 + Math.sin(time * 0.0011) * 0.5,
    auroraAlpha: reducedMotion ? 0.18 : 0.56,
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
    backgroundMotion,
    layout,
  } = model;
  const canvas = ctx.canvas || {};
  const canvasW = canvas.width || 1280;
  const canvasH = canvas.height || 720;

  if (isRenderableImage(loadingBackground)) {
    drawLoadingBackgroundImage(ctx, loadingBackground, canvasW, canvasH, model.now, pulse, backgroundMotion);
    drawLoadingAuroraBackdrop(ctx, canvasW, canvasH, model.now, pulse, orbit, {
      fillBase: false,
      intensity: backgroundMotion.auroraAlpha,
    });
  } else {
    drawLoadingAuroraBackdrop(ctx, canvasW, canvasH, model.now, pulse, orbit, {
      intensity: backgroundMotion.auroraAlpha,
    });
  }
  drawRiftCorePulse(ctx, canvasW, canvasH, model.now, pulse, backgroundMotion);
  drawLoadingBackgroundParticles(ctx, canvasW, canvasH, model.now, pulse, backgroundMotion);
  drawDimOverlay(isRenderableImage(loadingBackground) ? 0.12 : 0.2);
  ctx.save();
  ctx.globalAlpha *= 1 - smoothstep(0.72, 1, completionProgress) * 0.55;
  drawCinematicLoadingHud(ctx, model, layout, {
    canvasFont,
    drawCornerGlyph,
    roundedRect,
    scan,
    shimmer,
    pulse,
    displayProgress,
    message,
    completionProgress,
  });
  if (completionProgress > 0) drawCompletionLightSweep(ctx, canvasW, canvasH, completionProgress);
  if (model.debugEnabled) {
    drawLoadingDebugInfo(ctx, model, layout, elapsed, summary);
  }
  ctx.restore();
}

function drawCinematicLoadingHud(ctx, model, layout, {
  canvasFont,
  drawCornerGlyph,
  roundedRect,
  scan,
  shimmer,
  pulse,
  displayProgress,
  message,
  completionProgress,
}) {
  const {
    x,
    y,
    w,
    h,
    titleY,
    subtitleY,
    percentY,
    barX,
    barY,
    barW,
    barH,
    messageY,
  } = layout;
  const centerX = x + w / 2;
  const railGlow = ctx.createLinearGradient(barX, barY, barX + barW, barY);
  railGlow.addColorStop(0, "rgba(126, 231, 255, 0.18)");
  railGlow.addColorStop(0.48, "rgba(184, 141, 255, 0.26)");
  railGlow.addColorStop(1, "rgba(255, 240, 166, 0.16)");

  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.textAlign = "center";
  ctx.font = canvasFont("900", 18, model.title, true);
  drawShinyText(ctx, model.title, centerX, titleY, w - 180, shimmer, {
    base: "#f8f3cf",
    shine: "#7ef7ff",
    shadow: "rgba(126, 231, 255, 0.46)",
  });
  ctx.font = canvasFont("800", 11, model.subtitle, true);
  ctx.fillStyle = "rgba(218, 227, 255, 0.52)";
  ctx.fillText(model.subtitle, centerX, subtitleY, w - 190);
  drawLoadingPercent(ctx, model.percentText, centerX, percentY, 220, shimmer, canvasFont);

  ctx.save();
  ctx.shadowColor = completionProgress > 0
    ? "rgba(255, 240, 166, 0.46)"
    : "rgba(126, 231, 255, 0.36)";
  ctx.shadowBlur = 18 + pulse * 5;
  ctx.fillStyle = "rgba(3, 5, 14, 0.36)";
  roundedRect(barX - 24, barY - 12, barW + 48, 40, 18, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(126, 231, 255, 0.16)";
  ctx.lineWidth = 1.2;
  roundedRect(barX - 24, barY - 12, barW + 48, 40, 18, false, true);
  drawLoadingRailGlyphs(ctx, barX, barY, barW, barH, pulse);
  drawLoadingRailScan(ctx, barX, barY - 12, barW, 40, scan, roundedRect);
  ctx.restore();

  ctx.fillStyle = "rgba(4, 9, 20, 0.72)";
  roundedRect(barX, barY, barW, barH, barH / 2, true, false);
  const fillW = Math.max(displayProgress > 0 ? barH : 0, barW * displayProgress);
  const bar = ctx.createLinearGradient(barX, barY, barX + barW, barY);
  bar.addColorStop(0, "#7ef7ff");
  bar.addColorStop(0.5, "#d7c2ff");
  bar.addColorStop(1, "#fff0a6");
  ctx.globalAlpha = 0.72 + pulse * 0.22;
  ctx.fillStyle = bar;
  roundedRect(barX, barY, fillW, barH, barH / 2, true, false);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(238,244,252,0.22)";
  roundedRect(barX, barY, barW, barH, barH / 2, false, true);
  ctx.fillStyle = railGlow;
  roundedRect(barX, barY + barH - 3, barW, 3, 2, true, false);
  drawLoadingBarSpark(ctx, barX, barY, barW, displayProgress, pulse);

  ctx.font = canvasFont("800", 13, message, true);
  drawShinyText(ctx, message, centerX, messageY, w - 220, shimmer + 0.28, {
    base: model.hasCriticalError ? "#ffb7bd" : "#f8f3cf",
    shine: "#fff0a6",
    shadow: "rgba(184, 141, 255, 0.42)",
  });
  ctx.fillStyle = "rgba(238,244,252,0.66)";
  ctx.font = canvasFont("800", 10, model.counterText, true);
  ctx.fillText(model.counterText, centerX + barW / 2 + 36, barY + 12);
  drawCornerGlyph(barX - 42, barY + barH / 2, completionProgress > 0 ? "#fff0a6" : "#d7c2ff");
  drawCornerGlyph(barX + barW + 42, barY + barH / 2, completionProgress > 0 ? "#fff0a6" : "#d7c2ff");
  ctx.restore();
}

function isRenderableImage(image) {
  return Boolean(image && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
}

function drawLoadingBackgroundImage(ctx, image, width, height, now, pulse, motion) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawW = image.naturalWidth * scale;
  const drawH = image.naturalHeight * scale;
  const driftX = motion?.driftX || 0;
  const driftY = motion?.driftY || 0;
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
  intensity = 0.56,
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
    ctx.globalAlpha = (0.72 + pulse * 0.12) * intensity;
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
}

function drawRiftCorePulse(ctx, width, height, now, pulse, motion) {
  const intensity = motion?.intensity ?? 1;
  if (intensity <= 0) return;
  const corePulse = motion?.corePulse ?? pulse;
  const cx = width * 0.5;
  const cy = height * 0.51;
  const radius = Math.min(width, height) * (0.24 + corePulse * 0.035);
  const glow = ctx.createRadialGradient(cx, cy, 18, cx, cy, radius);
  glow.addColorStop(0, `rgba(184, 141, 255, ${0.16 * intensity})`);
  glow.addColorStop(0.26, `rgba(126, 231, 255, ${0.06 * intensity})`);
  glow.addColorStop(0.62, `rgba(92, 45, 196, ${0.035 * intensity})`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawLoadingBackgroundParticles(ctx, width, height, now, pulse, motion) {
  const count = motion?.particleCount || 0;
  if (count <= 0) return;
  const intensity = motion?.intensity ?? 1;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < count; i += 1) {
    const lane = i % 8;
    const speed = 0.000035 + (i % 5) * 0.000011;
    const drift = (now * speed + i * 0.137) % 1;
    const x = width * (0.12 + lane * 0.11) + Math.sin(now * 0.00032 + i) * 16;
    const y = height * (0.84 - drift * 0.72) + Math.cos(now * 0.00024 + i * 1.7) * 10;
    const alpha = (0.08 + (i % 4) * 0.025 + pulse * 0.04) * intensity;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = i % 3 === 0 ? "#7ef7ff" : i % 3 === 1 ? "#d7c2ff" : "#fff0a6";
    ctx.fillRect(x, y, i % 6 === 0 ? 2.6 : 1.8, i % 6 === 0 ? 2.6 : 1.8);
  }
  ctx.restore();
}

function drawLoadingPercent(ctx, text, x, y, maxWidth, shimmer, canvasFont) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = canvasFont("900", LOADING_PERCENT_TYPOGRAPHY.fontSize, text, true);
  ctx.shadowColor = `rgba(126, 231, 255, ${LOADING_PERCENT_TYPOGRAPHY.shadowAlpha})`;
  ctx.shadowBlur = LOADING_PERCENT_TYPOGRAPHY.shadowBlur;
  ctx.lineWidth = LOADING_PERCENT_TYPOGRAPHY.strokeWidth;
  ctx.strokeStyle = "rgba(5, 6, 20, 0.78)";
  ctx.strokeText(text, x, y, maxWidth);
  const width = Math.min(maxWidth, Math.max(104, ctx.measureText(text).width + 34));
  const sweep = x - width / 2 + ((shimmer % 1) * (width + 180)) - 90;
  const fill = ctx.createLinearGradient(sweep - 54, y - 34, sweep + 96, y + 8);
  fill.addColorStop(0, "#d7c2ff");
  fill.addColorStop(0.46, "#fff0a6");
  fill.addColorStop(0.64, "#7ef7ff");
  fill.addColorStop(1, "#f8f3cf");
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y, maxWidth);
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = LOADING_PERCENT_TYPOGRAPHY.lighterAlpha;
  ctx.fillText(text, x, y, maxWidth);
  ctx.restore();
}

function drawLoadingRailGlyphs(ctx, barX, barY, barW, barH, pulse) {
  ctx.save();
  ctx.strokeStyle = `rgba(255, 240, 166, ${0.2 + pulse * 0.12})`;
  ctx.lineWidth = 1.1;
  for (const side of [-1, 1]) {
    const x = side < 0 ? barX - 14 : barX + barW + 14;
    ctx.beginPath();
    ctx.moveTo(x, barY - 2);
    ctx.lineTo(x + side * 26, barY + barH / 2);
    ctx.lineTo(x, barY + barH + 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLoadingRailScan(ctx, x, y, w, h, scan, roundedRect) {
  const sweepX = x + scan * (w + 180) - 96;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const beam = ctx.createLinearGradient(sweepX, y, sweepX + 92, y + h);
  beam.addColorStop(0, "rgba(126, 231, 255, 0)");
  beam.addColorStop(0.5, "rgba(126, 231, 255, 0.12)");
  beam.addColorStop(1, "rgba(255, 240, 166, 0)");
  ctx.fillStyle = beam;
  roundedRect(x, y, w, h, 16, true, false);
  ctx.restore();
}

function drawCompletionLightSweep(ctx, width, height, progress) {
  const sweepX = -width * 0.35 + progress * width * 1.7;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const beam = ctx.createLinearGradient(sweepX - 120, 0, sweepX + 160, height);
  beam.addColorStop(0, "rgba(255, 240, 166, 0)");
  beam.addColorStop(0.45, "rgba(255, 240, 166, 0.16)");
  beam.addColorStop(0.56, "rgba(126, 231, 255, 0.16)");
  beam.addColorStop(1, "rgba(126, 231, 255, 0)");
  ctx.fillStyle = beam;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawLoadingDebugInfo(ctx, model, layout, elapsed, summary) {
  ctx.save();
  ctx.textAlign = "left";
  ctx.font = "10px monospace";
  ctx.fillStyle = "rgba(157, 247, 218, 0.9)";
  ctx.fillText(`debug: ${model.debugBuild}`, layout.debugX, layout.debugY);
  ctx.fillText(
    `asset age: ${Math.round(elapsed)}ms loading:${summary.loading} loaded:${summary.loaded} error:${summary.error}`,
    layout.debugX,
    layout.debugY + 14,
  );
  if (model.drawError) {
    ctx.fillStyle = "#ff8f98";
    ctx.fillText(`draw error: ${model.drawError.slice(0, 92)}`, layout.debugX, layout.debugY + 28);
  }
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
