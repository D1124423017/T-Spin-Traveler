export function drawRoundedRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const value = parseInt(clean.length === 3 ? clean.replace(/(.)/g, "$1$1") : clean, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function pointInRect(px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

export function insetSpriteFrameRect(rect, img, insetSize = 0) {
  const inset = Math.min(insetSize, rect.w / 8, rect.h / 8);
  if (inset <= 0) return { ...rect };
  const maxW = img?.naturalWidth || rect.x + rect.w;
  const maxH = img?.naturalHeight || rect.y + rect.h;
  const x = clamp(rect.x + inset, 0, Math.max(0, maxW - 1));
  const y = clamp(rect.y + inset, 0, Math.max(0, maxH - 1));
  const w = Math.max(1, Math.min(rect.w - inset * 2, maxW - x));
  const h = Math.max(1, Math.min(rect.h - inset * 2, maxH - y));
  return { x, y, w, h };
}

export function getSpriteFrameRect(config, frame) {
  if (config.frameRects && config.frameRects[frame]) return config.frameRects[frame];
  const cols = config.columns;
  const cellW = config.image.naturalWidth / cols;
  const cellH = config.image.naturalHeight / config.rows;
  const col = frame % cols;
  const row = Math.floor(frame / cols);
  const x0 = Math.round(col * cellW);
  const y0 = Math.round(row * cellH);
  const x1 = Math.round((col + 1) * cellW);
  const y1 = Math.round((row + 1) * cellH);
  return {
    x: x0,
    y: y0,
    w: Math.max(1, x1 - x0),
    h: Math.max(1, y1 - y0),
  };
}

export function animateNumber(current, target, dt, duration) {
  if (typeof current !== "number") return target;
  const next = lerp(current, target, clamp(dt / duration, 0, 1));
  return Math.abs(next - target) < 0.08 ? target : next;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
