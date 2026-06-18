import {
  OVERLAY_READABILITY,
  clamp,
  hexToRgba,
  pointInRect,
} from "../render/drawUtils.js";
import { drawBorderGlow } from "./borderGlow.js";

const DEFAULT_PANEL_COLORS = Object.freeze([
  "#6de8ff",
  "#9b78ff",
  "#fff0a6",
  "#7ef7ff",
]);

function getOverlayNow(deps = {}) {
  if (Number.isFinite(deps.now)) return deps.now;
  if (typeof deps.now === "function") return deps.now();
  if (Number.isFinite(deps.state?.debug?.lastDrawAt)) return deps.state.debug.lastDrawAt;
  return globalThis.performance?.now?.() || 0;
}

function getOverlayPointer(deps = {}) {
  return deps.pointer || deps.state?.pointer || null;
}

function getReducedMotion(deps = {}) {
  if (typeof deps.prefersReducedMotion === "function") return Boolean(deps.prefersReducedMotion());
  return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
}

function createGradient(ctx, x0, y0, x1, y1, stops) {
  if (typeof ctx?.createLinearGradient !== "function") return null;
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  if (!gradient || typeof gradient.addColorStop !== "function") return null;
  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  return gradient;
}

function fillSafeRect(ctx, x, y, w, h) {
  if (typeof ctx?.fillRect === "function") ctx.fillRect(x, y, w, h);
}

function strokeSafeLine(ctx, x1, y1, x2, y2) {
  if (typeof ctx?.beginPath !== "function" || typeof ctx?.moveTo !== "function") return;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawCornerTicks(ctx, rect, color = "rgba(255, 240, 166, 0.26)") {
  const tick = Math.min(34, Math.max(18, Math.min(rect.w, rect.h) * 0.09));
  const inset = 16;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4;
  [
    [rect.x + inset, rect.y + inset, tick, 0],
    [rect.x + inset, rect.y + inset, 0, tick],
    [rect.x + rect.w - inset, rect.y + inset, -tick, 0],
    [rect.x + rect.w - inset, rect.y + inset, 0, tick],
    [rect.x + inset, rect.y + rect.h - inset, tick, 0],
    [rect.x + inset, rect.y + rect.h - inset, 0, -tick],
    [rect.x + rect.w - inset, rect.y + rect.h - inset, -tick, 0],
    [rect.x + rect.w - inset, rect.y + rect.h - inset, 0, -tick],
  ].forEach(([x, y, dx, dy]) => strokeSafeLine(ctx, x, y, x + dx, y + dy));
  ctx.restore();
}

export function isOverlayPointerInRect(deps = {}, rect = {}) {
  const pointer = getOverlayPointer(deps);
  return pointInRect(pointer?.x, pointer?.y, rect.x, rect.y, rect.w, rect.h);
}

export function drawOverlayGlassPanel(deps = {}, rect = {}, options = {}) {
  const {
    ctx,
    roundedRect,
  } = deps;
  if (!ctx || typeof roundedRect !== "function") return;

  const radius = options.radius ?? 18;
  const glowColors = options.colors || DEFAULT_PANEL_COLORS;
  const fill = createGradient(ctx, rect.x, rect.y, rect.x + rect.w, rect.y + rect.h, [
    [0, options.topFill || "rgba(6, 13, 22, 0.86)"],
    [0.54, options.middleFill || "rgba(11, 12, 28, 0.78)"],
    [1, options.bottomFill || "rgba(24, 13, 40, 0.72)"],
  ]);

  ctx.save();
  ctx.fillStyle = fill || options.fallbackFill || OVERLAY_READABILITY.surface.fillStrong;
  ctx.shadowColor = options.shadowColor || "rgba(126, 231, 255, 0.12)";
  ctx.shadowBlur = options.shadowBlur ?? 18;
  roundedRect(rect.x, rect.y, rect.w, rect.h, radius, true, false);
  ctx.shadowBlur = 0;

  ctx.strokeStyle = options.strokeStyle || "rgba(126, 231, 255, 0.32)";
  ctx.lineWidth = options.lineWidth || 1.45;
  roundedRect(rect.x, rect.y, rect.w, rect.h, radius, false, true);
  ctx.strokeStyle = options.innerStrokeStyle || "rgba(184, 141, 255, 0.18)";
  ctx.lineWidth = 1.2;
  roundedRect(rect.x + 8, rect.y + 8, rect.w - 16, rect.h - 16, Math.max(8, radius - 5), false, true);

  const scan = createGradient(ctx, rect.x, rect.y, rect.x + rect.w, rect.y, [
    [0, "rgba(255,255,255,0)"],
    [0.5, "rgba(126,231,255,0.06)"],
    [1, "rgba(255,255,255,0)"],
  ]);
  if (scan) {
    ctx.fillStyle = scan;
    fillSafeRect(ctx, rect.x + 16, rect.y + 24, rect.w - 32, 1);
  }
  ctx.fillStyle = options.scanline || "rgba(126, 231, 255, 0.035)";
  for (let y = rect.y + 52; y < rect.y + rect.h - 24; y += 36) {
    fillSafeRect(ctx, rect.x + 18, y, rect.w - 36, 1);
  }
  drawCornerTicks(ctx, rect, options.cornerColor);
  ctx.restore();

  drawBorderGlow(ctx, {
    rect,
    pointer: getOverlayPointer(deps),
    roundedRect,
    now: getOverlayNow(deps),
    reducedMotion: getReducedMotion(deps),
    colors: glowColors,
    edgeSensitivity: options.edgeSensitivity ?? 58,
    fillOpacity: options.fillOpacity ?? 0.02,
    glowIntensity: options.glowIntensity ?? 0.64,
    glowRadius: options.glowRadius ?? 24,
    radius,
    selected: options.selected ?? true,
    selectedIntensity: options.selectedIntensity ?? 0.18,
  });
}

export function drawOverlayGlassSection(deps = {}, rect = {}, options = {}) {
  const {
    ctx,
    roundedRect,
  } = deps;
  if (!ctx || typeof roundedRect !== "function") return false;
  const hovered = options.hovered ?? isOverlayPointerInRect(deps, rect);
  const active = Boolean(options.active || options.selected || hovered);
  const color = options.color || "#8fe8dc";
  const radius = options.radius ?? 10;
  const fillOpacity = active ? 0.2 : 0.12;
  const fill = createGradient(ctx, rect.x, rect.y, rect.x + rect.w, rect.y + rect.h, [
    [0, hexToRgba(color, fillOpacity)],
    [0.42, options.middleFill || OVERLAY_READABILITY.surface.fill],
    [1, options.bottomFill || "rgba(5, 8, 18, 0.76)"],
  ]);

  ctx.save();
  ctx.fillStyle = fill || (active ? hexToRgba(color, 0.16) : OVERLAY_READABILITY.surface.fill);
  roundedRect(rect.x, rect.y, rect.w, rect.h, radius, true, false);
  ctx.strokeStyle = active ? hexToRgba(color, 0.5) : "rgba(126, 231, 255, 0.2)";
  ctx.lineWidth = active ? 1.7 : 1.15;
  roundedRect(rect.x, rect.y, rect.w, rect.h, radius, false, true);
  if (options.accent !== false) {
    ctx.fillStyle = hexToRgba(color, active ? 0.54 : 0.34);
    roundedRect(rect.x, rect.y + 7, 4, Math.max(8, rect.h - 14), 3, true, false);
  }
  if (options.sheen !== false) {
    ctx.fillStyle = "rgba(255,255,255,0.035)";
    fillSafeRect(ctx, rect.x + 14, rect.y + 9, rect.w - 28, 1);
  }
  ctx.restore();

  drawBorderGlow(ctx, {
    rect,
    pointer: getOverlayPointer(deps),
    roundedRect,
    now: getOverlayNow(deps),
    reducedMotion: getReducedMotion(deps),
    colors: options.colors || [color, "#9b78ff", "#fff0a6", "#6de8ff"],
    edgeSensitivity: options.edgeSensitivity ?? 28,
    fillOpacity: options.glowFillOpacity ?? 0.018,
    glowIntensity: active ? 0.78 : 0.32,
    glowRadius: options.glowRadius ?? 17,
    radius,
    selected: Boolean(options.selected),
    selectedIntensity: options.selectedIntensity ?? 0.36,
  });
  return hovered;
}

export function drawOverlayTitleRule(deps = {}, x, y, width, color = "#8fe8dc") {
  const { ctx } = deps;
  if (!ctx) return;
  const w = Math.max(0, Number(width) || 0);
  const glow = createGradient(ctx, x, y, x + w, y, [
    [0, "rgba(255,255,255,0)"],
    [0.18, hexToRgba(color, 0.32)],
    [0.72, "rgba(184, 141, 255, 0.2)"],
    [1, "rgba(255,255,255,0)"],
  ]);
  ctx.save();
  ctx.fillStyle = glow || hexToRgba(color, 0.24);
  fillSafeRect(ctx, x, y, w, 2);
  ctx.restore();
}

export function getOverlayPanelMotion(now, openedAt, {
  reducedMotion = false,
  delay = 0,
  duration = 260,
  y = 14,
} = {}) {
  if (reducedMotion) return { alpha: 1, y: 0 };
  const elapsed = Math.max(0, (Number(now) || 0) - (Number(openedAt) || 0) - delay);
  const progress = clamp(elapsed / Math.max(1, duration), 0, 1);
  const eased = 1 - (1 - progress) ** 3;
  return {
    alpha: eased,
    y: (1 - eased) * y,
  };
}
