import {
  clamp,
  hexToRgba,
  pointInRect,
} from "../render/drawUtils.js";

const DEFAULT_COLORS = Object.freeze([
  "#6de8ff",
  "#9b78ff",
  "#fff0a6",
  "#7ef7ff",
]);

function normalizeRect(rect = {}) {
  return {
    x: Number(rect.x) || 0,
    y: Number(rect.y) || 0,
    w: Math.max(0, Number(rect.w) || 0),
    h: Math.max(0, Number(rect.h) || 0),
  };
}

function getPointerPoint(pointer, rect) {
  const hasPointer = Number.isFinite(pointer?.x) && Number.isFinite(pointer?.y);
  if (hasPointer) return { x: pointer.x, y: pointer.y, hasPointer: true };
  return {
    x: rect.x + rect.w / 2,
    y: rect.y + rect.h / 2,
    hasPointer: false,
  };
}

function getNearestSide(point, rect) {
  const distances = [
    { side: "left", distance: Math.abs(point.x - rect.x) },
    { side: "right", distance: Math.abs(point.x - (rect.x + rect.w)) },
    { side: "top", distance: Math.abs(point.y - rect.y) },
    { side: "bottom", distance: Math.abs(point.y - (rect.y + rect.h)) },
  ];
  return distances.reduce((best, next) => (
    next.distance < best.distance ? next : best
  ));
}

export function getBorderGlowState(pointer, rectInput, {
  disabled = false,
  edgeSensitivity = 30,
  selected = false,
  force = false,
  selectedIntensity = 0.42,
} = {}) {
  const rect = normalizeRect(rectInput);
  if (disabled || rect.w <= 0 || rect.h <= 0) {
    return {
      active: false,
      inside: false,
      edgeProximity: 0,
      intensity: 0,
      side: "top",
      localX: 0.5,
      localY: 0.5,
      angle: 0,
    };
  }

  const padding = Math.max(1, Number(edgeSensitivity) || 1);
  const point = getPointerPoint(pointer, rect);
  const inside = pointInRect(point.x, point.y, rect.x, rect.y, rect.w, rect.h);
  const inRange = point.hasPointer && pointInRect(
    point.x,
    point.y,
    rect.x - padding,
    rect.y - padding,
    rect.w + padding * 2,
    rect.h + padding * 2,
  );
  const nearest = getNearestSide(point, rect);
  const pointerEdgeProximity = inRange
    ? 1 - clamp(nearest.distance / padding, 0, 1)
    : 0;
  const forced = Boolean(selected || force);
  const baseIntensity = forced ? clamp(selectedIntensity, 0, 1) : 0;
  const intensity = clamp(Math.max(pointerEdgeProximity, baseIntensity), 0, 1);
  const centerX = rect.x + rect.w / 2;
  const centerY = rect.y + rect.h / 2;

  return {
    active: Boolean(inRange || forced),
    inside,
    edgeProximity: pointerEdgeProximity,
    intensity,
    side: nearest.side,
    localX: clamp((point.x - rect.x) / rect.w, 0, 1),
    localY: clamp((point.y - rect.y) / rect.h, 0, 1),
    angle: Math.atan2(point.y - centerY, point.x - centerX),
  };
}

function addStops(gradient, colors, alphaScale = 1) {
  gradient.addColorStop(0, hexToRgba(colors[0], 0.02 * alphaScale));
  gradient.addColorStop(0.28, hexToRgba(colors[0], 0.64 * alphaScale));
  gradient.addColorStop(0.56, hexToRgba(colors[1], 0.72 * alphaScale));
  gradient.addColorStop(0.8, hexToRgba(colors[2], 0.66 * alphaScale));
  gradient.addColorStop(1, hexToRgba(colors[3] || colors[0], 0.04 * alphaScale));
}

function drawEdgeLight(ctx, rect, state, colors, reducedMotion, now) {
  if (state.intensity <= 0.04) return;
  const phase = reducedMotion ? 0.5 : ((now || 0) % 2200) / 2200;
  const side = state.side;
  const alpha = 0.44 * state.intensity;
  const edgeThickness = Math.max(3, Math.min(10, rect.h * 0.16, rect.w * 0.08));
  const longSpan = (side === "top" || side === "bottom") ? rect.w : rect.h;
  const sweep = longSpan * 0.34;
  const anchorRatio = state.edgeProximity > 0.01
    ? (side === "top" || side === "bottom" ? state.localX : state.localY)
    : phase;
  const start = clamp(anchorRatio * longSpan - sweep / 2, 0, Math.max(0, longSpan - sweep));

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = alpha;
  if (side === "top" || side === "bottom") {
    const y = side === "top" ? rect.y - edgeThickness / 2 : rect.y + rect.h - edgeThickness / 2;
    const x = rect.x + start;
    const glow = ctx.createLinearGradient(x, y, x + sweep, y);
    addStops(glow, colors, 1);
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, sweep, edgeThickness);
  } else {
    const x = side === "left" ? rect.x - edgeThickness / 2 : rect.x + rect.w - edgeThickness / 2;
    const y = rect.y + start;
    const glow = ctx.createLinearGradient(x, y, x, y + sweep);
    addStops(glow, colors, 1);
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, edgeThickness, sweep);
  }
  ctx.restore();
}

export function drawBorderGlow(ctx, {
  rect: rectInput,
  pointer,
  roundedRect,
  radius = 12,
  edgeSensitivity = 30,
  selected = false,
  force = false,
  disabled = false,
  reducedMotion = false,
  now = 0,
  colors = DEFAULT_COLORS,
  fillOpacity = 0.035,
  glowIntensity = 1,
  glowRadius = 18,
  lineWidth = 1.25,
  selectedIntensity = 0.42,
} = {}) {
  const rect = normalizeRect(rectInput);
  const state = getBorderGlowState(pointer, rect, {
    disabled,
    edgeSensitivity,
    selected,
    force,
    selectedIntensity,
  });
  if (
    !ctx
    || !roundedRect
    || typeof ctx.createLinearGradient !== "function"
    || typeof ctx.createRadialGradient !== "function"
    || !state.active
    || state.intensity <= 0
  ) {
    return state;
  }

  const palette = colors.length ? colors : DEFAULT_COLORS;
  const alpha = clamp(state.intensity * glowIntensity, 0, 1);
  const pulse = reducedMotion ? 1 : 0.88 + Math.sin((now || 0) / 460) * 0.12;
  const border = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  addStops(border, palette, 1);

  ctx.save();
  if (fillOpacity > 0) {
    const focus = ctx.createRadialGradient(
      rect.x + rect.w * state.localX,
      rect.y + rect.h * state.localY,
      4,
      rect.x + rect.w * state.localX,
      rect.y + rect.h * state.localY,
      Math.max(rect.w, rect.h) * 0.52,
    );
    focus.addColorStop(0, hexToRgba(palette[0], fillOpacity * 3.4 * alpha));
    focus.addColorStop(0.52, hexToRgba(palette[1], fillOpacity * 1.5 * alpha));
    focus.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = focus;
    roundedRect(rect.x, rect.y, rect.w, rect.h, radius, true, false);
  }

  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = palette[1];
  ctx.shadowBlur = glowRadius * alpha * pulse;
  ctx.strokeStyle = border;
  ctx.lineWidth = lineWidth + alpha * 1.4;
  ctx.globalAlpha = 0.42 + alpha * 0.5;
  roundedRect(rect.x, rect.y, rect.w, rect.h, radius, false, true);
  ctx.restore();

  drawEdgeLight(ctx, rect, state, palette, reducedMotion, now);
  return state;
}
