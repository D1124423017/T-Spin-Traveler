import { clamp } from "../render/drawUtils.js";

export const ELASTIC_RIFT_SLIDER = Object.freeze({
  hitPaddingX: 18,
  hitPaddingY: 22,
  maxOverflowPx: 24,
  releaseMs: 520,
});

export function createElasticRiftSlider(options = {}) {
  let value = normalizeElasticRiftSliderValue(options.value ?? options.min ?? 0, options);
  return {
    setValue(nextValue) {
      value = normalizeElasticRiftSliderValue(nextValue, options);
      return value;
    },
    getValue() {
      return value;
    },
    destroy() {},
  };
}

export function normalizeElasticRiftSliderValue(value, {
  min = 0,
  max = 1,
  step = 0,
} = {}) {
  if (max <= min) return min;
  const numeric = Number.isFinite(value) ? value : min;
  const stepped = step > 0 ? min + Math.round((numeric - min) / step) * step : numeric;
  return clamp(stepped, min, max);
}

export function getElasticRiftSliderRatio(value, {
  min = 0,
  max = 1,
} = {}) {
  if (max <= min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
}

export function getElasticRiftSliderValueFromPointer({
  pointerX,
  trackX,
  trackWidth,
  min = 0,
  max = 1,
  step = 0,
} = {}) {
  const safeTrackWidth = Math.max(1, trackWidth || 1);
  const rawRatio = (pointerX - trackX) / safeTrackWidth;
  const ratio = clamp(rawRatio, 0, 1);
  const value = normalizeElasticRiftSliderValue(min + ratio * (max - min), { min, max, step });
  return {
    value,
    ratio: getElasticRiftSliderRatio(value, { min, max }),
    rawRatio,
    overflow: getElasticRiftSliderOverflow(rawRatio),
  };
}

export function getElasticRiftSliderOverflow(rawRatio, {
  maxOverflowPx = ELASTIC_RIFT_SLIDER.maxOverflowPx,
} = {}) {
  const beyond = rawRatio < 0 ? rawRatio : rawRatio > 1 ? rawRatio - 1 : 0;
  if (beyond === 0) return 0;
  const sign = Math.sign(beyond);
  const pull = clamp(Math.abs(beyond), 0, 0.42);
  return sign * maxOverflowPx * (1 - Math.exp(-pull * 6));
}

export function getElasticRiftSliderReleaseOverflow({
  key,
  releaseKey,
  releaseOverflow = 0,
  releaseStartedAt = 0,
  now = 0,
  releaseMs = ELASTIC_RIFT_SLIDER.releaseMs,
} = {}) {
  if (!key || key !== releaseKey || releaseOverflow === 0 || releaseMs <= 0) return 0;
  const t = clamp((now - releaseStartedAt) / releaseMs, 0, 1);
  if (t >= 1) return 0;
  const decay = (1 - t) * (1 - t);
  return releaseOverflow * decay * Math.cos(t * Math.PI * 2.6);
}

export function isElasticRiftSliderHit(px, py, {
  x,
  y,
  width,
  height = 14,
  hitPaddingX = ELASTIC_RIFT_SLIDER.hitPaddingX,
  hitPaddingY = ELASTIC_RIFT_SLIDER.hitPaddingY,
} = {}) {
  return px >= x - hitPaddingX
    && px <= x + width + hitPaddingX
    && py >= y - hitPaddingY
    && py <= y + height + hitPaddingY;
}

export function drawElasticRiftSlider({
  canvasFont,
  ctx,
  label,
  roundedRect,
  labelText,
  value,
  x,
  y,
  width = 270,
  key = "",
  pointer = {},
  now = 0,
  min = 0,
  max = 1,
  labelY = y - 10,
  showLabel = true,
  valueX = x + width + 34,
  valueY = y - 10,
  valueFontSize,
  formatValue = defaultElasticRiftSliderFormatValue,
} = {}) {
  if (!ctx || !roundedRect) return;
  const ratio = getElasticRiftSliderRatio(value, { min, max });
  const active = pointer.dragging === key;
  const hover = isElasticRiftSliderHit(pointer.x, pointer.y, { x, y, width });
  const sliderState = pointer.elasticSlider || {};
  const dragOverflow = active && sliderState.key === key ? sliderState.overflow || 0 : 0;
  const releaseOverflow = getElasticRiftSliderReleaseOverflow({
    key,
    releaseKey: sliderState.releaseKey,
    releaseOverflow: sliderState.releaseOverflow,
    releaseStartedAt: sliderState.releaseStartedAt,
    now,
  });
  const overflow = active ? dragOverflow : releaseOverflow;
  const height = active ? 18 : hover ? 16 : 12;
  const trackY = y + (12 - height) / 2;
  const fillW = ratio * width;
  const leftOverflow = Math.max(0, -overflow);
  const rightOverflow = Math.max(0, overflow);
  const knobX = x + fillW + overflow * 0.36;
  const shown = formatValue(value);

  ctx.save();
  if (showLabel && labelText) {
    label(labelText, x, labelY, 17, active ? "#fff0a6" : "#f3f2ea");
  }
  ctx.font = canvasFont("900", valueFontSize || (active ? 15 : 14), shown, true);
  ctx.fillStyle = active ? "#fff0a6" : "rgba(238,244,252,0.7)";
  ctx.fillText(shown, valueX, valueY);

  ctx.shadowColor = active ? "rgba(126, 247, 255, 0.42)" : "rgba(126, 247, 255, 0.18)";
  ctx.shadowBlur = active ? 18 : hover ? 12 : 0;
  ctx.fillStyle = "rgba(1, 4, 12, 0.68)";
  roundedRect(x - leftOverflow, trackY, width + leftOverflow + rightOverflow, height, height / 2, true, false);
  ctx.shadowBlur = 0;

  const fillGradient = ctx.createLinearGradient(x - leftOverflow, y, x + width + rightOverflow, y);
  fillGradient.addColorStop(0, "#6de8ff");
  fillGradient.addColorStop(0.52, "#8f70ff");
  fillGradient.addColorStop(1, "#fff0a6");
  ctx.fillStyle = fillGradient;
  roundedRect(x - leftOverflow, trackY, Math.max(0, fillW + leftOverflow + rightOverflow), height, height / 2, true, false);

  drawRiftOverflowGlow(ctx, roundedRect, x, trackY, width, height, overflow);
  drawRiftSliderEtchings(ctx, x, trackY, width, height, active || hover);

  ctx.strokeStyle = active ? "rgba(255, 240, 166, 0.76)" : hover ? "rgba(126, 247, 255, 0.46)" : "rgba(231,244,255,0.28)";
  ctx.lineWidth = active ? 2.4 : 1.8;
  roundedRect(x, trackY, width, height, height / 2, false, true);

  drawRiftEndpoint(ctx, x, y + 6, -1, leftOverflow, active || hover);
  drawRiftEndpoint(ctx, x + width, y + 6, 1, rightOverflow, active || hover);
  drawRiftKnob(ctx, knobX, y + 6, active, hover);
  ctx.restore();
}

export function defaultElasticRiftSliderFormatValue(value) {
  return `${Math.round(value * 100)}%`;
}

function drawRiftOverflowGlow(ctx, roundedRect, x, y, width, height, overflow) {
  if (Math.abs(overflow) < 0.5) return;
  const right = overflow > 0;
  const glowX = right ? x + width - 6 : x - Math.abs(overflow) - 4;
  const glowW = Math.abs(overflow) + 12;
  const gradient = ctx.createLinearGradient(glowX, y, glowX + glowW, y);
  gradient.addColorStop(0, right ? "rgba(126, 247, 255, 0.12)" : "rgba(255, 240, 166, 0.44)");
  gradient.addColorStop(1, right ? "rgba(255, 240, 166, 0.44)" : "rgba(126, 247, 255, 0.12)");
  ctx.save();
  ctx.fillStyle = gradient;
  ctx.shadowColor = right ? "#fff0a6" : "#7ef7ff";
  ctx.shadowBlur = 18;
  roundedRect(glowX, y - 2, glowW, height + 4, (height + 4) / 2, true, false);
  ctx.restore();
}

function drawRiftSliderEtchings(ctx, x, y, width, height, lit) {
  ctx.save();
  ctx.strokeStyle = lit ? "rgba(255, 240, 166, 0.28)" : "rgba(126, 231, 255, 0.12)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i += 1) {
    const tickX = x + (width * i) / 5;
    ctx.beginPath();
    ctx.moveTo(tickX - 4, y + 3);
    ctx.lineTo(tickX + 3, y + height - 3);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRiftEndpoint(ctx, x, y, dir, overflow, lit) {
  const stretch = clamp(overflow / ELASTIC_RIFT_SLIDER.maxOverflowPx, 0, 1);
  const scale = 1 + stretch * 0.22;
  const offset = dir * stretch * 7;
  ctx.save();
  ctx.translate(x + offset, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = lit ? "rgba(255, 240, 166, 0.72)" : "rgba(126, 231, 255, 0.48)";
  ctx.fillStyle = lit ? "rgba(255, 240, 166, 0.18)" : "rgba(126, 231, 255, 0.12)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(dir * 11, 0);
  ctx.lineTo(0, -8);
  ctx.lineTo(dir * -7, 0);
  ctx.lineTo(0, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawRiftKnob(ctx, x, y, active, hover) {
  const radius = active ? 13 : hover ? 12 : 11;
  ctx.save();
  ctx.shadowColor = active ? "#fff0a6" : "#7ef7ff";
  ctx.shadowBlur = active ? 18 : hover ? 12 : 8;
  ctx.fillStyle = active ? "#fff4a8" : "#f3f2ea";
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#101620";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = active ? "rgba(126, 247, 255, 0.8)" : "rgba(143, 112, 255, 0.66)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x, y - radius + 4);
  ctx.lineTo(x + radius - 4, y);
  ctx.lineTo(x, y + radius - 4);
  ctx.lineTo(x - radius + 4, y);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}
