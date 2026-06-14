import { getEquipmentRarityStyle } from "../data/equipment.js";

const TAU = Math.PI * 2;
const DEEP_RIFT = "#090718";

export function drawEquipmentCanvasRotor({
  ctx,
  geometry,
  segments = [],
  rotation = 0,
  presentation = {},
  visualPower = 0,
  currentTime = 0,
} = {}) {
  if (!ctx || !geometry || segments.length === 0) return false;

  const innerRadius = geometry.rotorInnerRadius;
  const outerRadius = geometry.rotorOuterRadius;
  const step = TAU / segments.length;
  const gap = Math.min(0.018, step * 0.07);
  const shimmer = 0.5 + Math.sin(currentTime * 0.0021) * 0.5;

  ctx.save();
  ctx.translate(geometry.center.x, geometry.center.y);
  ctx.beginPath();
  ctx.arc(0, 0, outerRadius, 0, TAU);
  ctx.clip();
  ctx.rotate(rotation);
  drawRotorFoundation(ctx, innerRadius, outerRadius, visualPower);

  for (const segment of segments) {
    drawRaritySector({
      ctx,
      segment,
      step,
      gap,
      innerRadius,
      outerRadius,
      glyphRadius: geometry.slotRadius,
      glyphSize: geometry.slotGlyphSize,
      visualPower,
      shimmer,
    });
  }

  drawRotorRings({
    ctx,
    innerRadius,
    outerRadius,
    visualPower,
    ringCount: presentation.ringCount || 1,
    currentTime,
  });
  ctx.restore();
  return true;
}

function drawRotorFoundation(ctx, innerRadius, outerRadius, visualPower) {
  const base = ctx.createRadialGradient(
    0,
    0,
    innerRadius * 0.42,
    0,
    0,
    outerRadius,
  );
  base.addColorStop(0, "#24153f");
  base.addColorStop(0.28, "#111633");
  base.addColorStop(0.74, "#090d24");
  base.addColorStop(1, DEEP_RIFT);
  ctx.fillStyle = base;
  ctx.shadowColor = `rgba(114, 77, 255, ${0.28 + visualPower * 0.28})`;
  ctx.shadowBlur = 18 + visualPower * 18;
  ctx.beginPath();
  ctx.arc(0, 0, outerRadius, 0, TAU);
  ctx.fill();

  ctx.globalCompositeOperation = "lighter";
  const coreGlow = ctx.createRadialGradient(
    0,
    0,
    innerRadius * 0.52,
    0,
    0,
    outerRadius,
  );
  coreGlow.addColorStop(0, "rgba(160, 91, 255, 0)");
  coreGlow.addColorStop(0.58, `rgba(91, 79, 214, ${0.06 + visualPower * 0.06})`);
  coreGlow.addColorStop(1, "rgba(84, 163, 255, 0)");
  ctx.fillStyle = coreGlow;
  ctx.beginPath();
  ctx.arc(0, 0, outerRadius, 0, TAU);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
}

function drawRaritySector({
  ctx,
  segment,
  step,
  gap,
  innerRadius,
  outerRadius,
  glyphRadius,
  glyphSize,
  visualPower,
  shimmer,
}) {
  const style = getEquipmentRarityStyle(segment.rarity);
  const start = -Math.PI / 2 + segment.index * step + gap;
  const end = start + step - gap * 2;
  const centerAngle = start + (end - start) / 2;
  const fill = ctx.createRadialGradient(
    0,
    0,
    innerRadius,
    0,
    0,
    outerRadius,
  );
  fill.addColorStop(0, style.fillBottom);
  fill.addColorStop(0.48, style.fillTop);
  fill.addColorStop(
    1,
    colorWithAlpha(style.color, 0.18 + visualPower * 0.09),
  );

  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, outerRadius, start, end);
  ctx.arc(0, 0, innerRadius, end, start, true);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.shadowColor = style.color;
  ctx.shadowBlur = 3 + visualPower * 7;
  ctx.strokeStyle = colorWithAlpha(
    style.color,
    0.38 + visualPower * 0.18,
  );
  ctx.lineWidth = 1.1 + style.lineWidth * 0.32;
  ctx.stroke();

  drawSectorBevel(
    ctx,
    start,
    end,
    innerRadius,
    outerRadius,
    visualPower,
  );

  ctx.translate(
    Math.cos(centerAngle) * glyphRadius,
    Math.sin(centerAngle) * glyphRadius,
  );
  ctx.rotate(centerAngle + Math.PI / 2);
  drawRarityGlyph(
    ctx,
    segment.rarity,
    style,
    glyphSize,
    visualPower,
    shimmer,
  );
  ctx.restore();
}

function drawSectorBevel(
  ctx,
  start,
  end,
  innerRadius,
  outerRadius,
  visualPower,
) {
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = `rgba(235, 209, 143, ${0.22 + visualPower * 0.1})`;
  ctx.lineWidth = 1;
  for (const angle of [start, end]) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * (innerRadius + 5), Math.sin(angle) * (innerRadius + 5));
    ctx.lineTo(Math.cos(angle) * (outerRadius - 5), Math.sin(angle) * (outerRadius - 5));
    ctx.stroke();
  }
  ctx.strokeStyle = `rgba(255, 239, 181, ${0.13 + visualPower * 0.08})`;
  ctx.beginPath();
  ctx.arc(0, 0, outerRadius - 7, start, end);
  ctx.stroke();
  ctx.restore();
}

function drawRarityGlyph(
  ctx,
  rarity,
  style,
  size,
  visualPower,
  shimmer,
) {
  const glowAlpha = 0.28 + visualPower * 0.18 + shimmer * 0.08;
  const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.72);
  halo.addColorStop(0, colorWithAlpha(style.color, glowAlpha));
  halo.addColorStop(0.48, colorWithAlpha(style.color, 0.09));
  halo.addColorStop(1, colorWithAlpha(style.color, 0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.72, 0, TAU);
  ctx.fill();

  ctx.shadowColor = style.color;
  ctx.shadowBlur = 5 + visualPower * 8;
  ctx.strokeStyle = style.titleColor;
  ctx.fillStyle = colorWithAlpha(style.color, 0.34 + visualPower * 0.16);
  ctx.lineWidth = 1.35 + visualPower * 0.55;

  if (rarity === "rare") {
    drawDiamond(ctx, size * 0.34, true);
    drawCrossRays(ctx, size * 0.47);
    return;
  }
  if (rarity === "relic") {
    drawStar(ctx, size * 0.48, size * 0.16, 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.28, 0, TAU);
    ctx.stroke();
    return;
  }
  if (rarity === "legendary") {
    drawStar(ctx, size * 0.5, size * 0.19, 6);
    ctx.fill();
    ctx.stroke();
    drawDiamond(ctx, size * 0.2, false);
    return;
  }

  drawDiamond(ctx, size * 0.32, false);
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(1.6, size * 0.055), 0, TAU);
  ctx.fill();
}

function drawDiamond(ctx, radius, fill) {
  ctx.beginPath();
  ctx.moveTo(0, -radius);
  ctx.lineTo(radius * 0.72, 0);
  ctx.lineTo(0, radius);
  ctx.lineTo(-radius * 0.72, 0);
  ctx.closePath();
  if (fill) ctx.fill();
  ctx.stroke();
}

function drawCrossRays(ctx, radius) {
  ctx.save();
  ctx.globalAlpha *= 0.72;
  ctx.beginPath();
  ctx.moveTo(-radius, 0);
  ctx.lineTo(radius, 0);
  ctx.moveTo(0, -radius);
  ctx.lineTo(0, radius);
  ctx.stroke();
  ctx.restore();
}

function drawStar(ctx, outerRadius, innerRadius, points) {
  ctx.beginPath();
  for (let index = 0; index < points * 2; index += 1) {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + index * Math.PI / points;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawRotorRings({
  ctx,
  innerRadius,
  outerRadius,
  visualPower,
  ringCount,
  currentTime,
}) {
  ctx.save();
  ctx.shadowColor = "rgba(149, 102, 255, 0.66)";
  ctx.shadowBlur = 5 + visualPower * 8;
  ctx.strokeStyle = `rgba(220, 188, 115, ${0.58 + visualPower * 0.14})`;
  ctx.lineWidth = 2;
  for (const radius of [innerRadius, outerRadius]) {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, TAU);
    ctx.stroke();
  }

  ctx.globalCompositeOperation = "lighter";
  for (let index = 0; index < ringCount; index += 1) {
    const radius = innerRadius + 14 + index * 7;
    if (radius >= outerRadius - 14) break;
    ctx.save();
    ctx.rotate(currentTime * 0.00008 * (index % 2 ? -1 : 1));
    ctx.setLineDash([3 + index * 2, 10 - Math.min(5, index)]);
    ctx.strokeStyle = index % 2
      ? `rgba(104, 223, 255, ${0.08 + visualPower * 0.06})`
      : `rgba(184, 113, 255, ${0.1 + visualPower * 0.08})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  ctx.setLineDash([]);
  ctx.restore();
}

function colorWithAlpha(hex, alpha) {
  const value = String(hex || "#ffffff").replace("#", "");
  const normalized = value.length === 3
    ? value.split("").map((character) => character + character).join("")
    : value.padEnd(6, "f").slice(0, 6);
  const numeric = Number.parseInt(normalized, 16);
  return `rgba(${(numeric >> 16) & 255}, ${(numeric >> 8) & 255}, ${numeric & 255}, ${alpha})`;
}
