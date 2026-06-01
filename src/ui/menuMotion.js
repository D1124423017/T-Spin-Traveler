import { clamp, hexToRgba } from "../render/drawUtils.js";

export const MENU_REVEAL_DURATION_MS = 1280;
export const MENU_BUTTON_STAGGER_MS = 82;

function easeOutCubic(t) {
  const n = clamp(t, 0, 1);
  return 1 - Math.pow(1 - n, 3);
}

function easeOutQuart(t) {
  const n = clamp(t, 0, 1);
  return 1 - Math.pow(1 - n, 4);
}

export function createMenuMotionModel({ now = 0, startedAt = 0 } = {}) {
  const elapsed = Math.max(0, now - startedAt);
  const revealRaw = clamp(elapsed / MENU_REVEAL_DURATION_MS, 0, 1);
  const reveal = easeOutCubic(revealRaw);
  return {
    now,
    elapsed,
    reveal,
    revealRaw,
    titleAlpha: easeOutQuart((elapsed - 80) / 620),
    panelAlpha: easeOutCubic((elapsed - 180) / 620),
    ambientAlpha: 0.46 + Math.sin(now * 0.0018) * 0.08,
    riftPhase: now * 0.001,
    shimmerPhase: (now * 0.00018) % 1,
  };
}

export function getMenuButtonMotion(model, index = 0) {
  const elapsed = Math.max(0, model?.elapsed || 0);
  const reveal = easeOutCubic((elapsed - 360 - index * MENU_BUTTON_STAGGER_MS) / 520);
  return {
    reveal,
    alpha: 0.38 + reveal * 0.62,
    glow: reveal * (0.72 + Math.sin((model?.now || 0) * 0.003 + index) * 0.08),
  };
}

export function drawMenuAmbientMotion(ctx, model, {
  cx = 636,
  cy = 318,
} = {}) {
  const reveal = clamp(model?.reveal ?? 1, 0, 1);
  const phase = model?.riftPhase || 0;
  if (reveal <= 0) return;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = reveal * (model?.ambientAlpha ?? 0.46);

  for (let i = 0; i < 4; i += 1) {
    const radius = 82 + i * 34 + Math.sin(phase * 0.9 + i) * 2.5;
    const start = phase * (0.18 + i * 0.035) + i * 1.17;
    const span = Math.PI * (0.54 + i * 0.08);
    ctx.strokeStyle = i % 2
      ? "rgba(126, 231, 255, 0.13)"
      : "rgba(216, 190, 255, 0.14)";
    ctx.lineWidth = i === 0 ? 1.6 : 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, start, start + span);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 9, start + Math.PI, start + Math.PI + span * 0.42);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255, 240, 166, 0.1)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 7; i += 1) {
    const a = phase * 0.12 + i * 0.897;
    const inner = 58 + (i % 3) * 22;
    const outer = inner + 34 + Math.sin(phase + i) * 7;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner * 0.58);
    ctx.lineTo(cx + Math.cos(a + 0.18) * outer, cy + Math.sin(a + 0.18) * outer * 0.58);
    ctx.stroke();
  }

  for (let i = 0; i < 18; i += 1) {
    const drift = (phase * 0.035 + i * 0.113) % 1;
    const twinkle = 1 - Math.abs(drift - 0.5) * 2;
    const x = cx - 196 + ((i * 53) % 392) + Math.sin(phase * 0.7 + i) * 7;
    const y = cy - 116 + drift * 234;
    ctx.fillStyle = i % 3 === 0 ? "#fff0a6" : i % 2 ? "#d7c2ff" : "#7ef7ff";
    ctx.globalAlpha = reveal * (0.04 + twinkle * 0.12);
    ctx.fillRect(x, y, 1.8 + twinkle * 1.2, 1.8 + twinkle * 1.2);
  }
  ctx.restore();
}

export function drawMenuTitleWake(ctx, model, {
  x = 70,
  y = 184,
  w = 360,
} = {}) {
  const alpha = clamp(model?.titleAlpha ?? 1, 0, 1);
  if (alpha <= 0) return;
  const sweep = ((model?.shimmerPhase ?? 0) * (w + 160)) - 80;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.18 * alpha;
  const line = ctx.createLinearGradient(x + sweep, y, x + sweep + 90, y);
  line.addColorStop(0, "rgba(255, 240, 166, 0)");
  line.addColorStop(0.5, "rgba(255, 240, 166, 0.74)");
  line.addColorStop(1, "rgba(126, 231, 255, 0)");
  ctx.strokeStyle = line;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();

  for (let i = 0; i < 5; i += 1) {
    const px = x + 28 + i * 62 + Math.sin((model?.riftPhase || 0) + i) * 3;
    const py = y - 8 + Math.cos((model?.riftPhase || 0) * 1.3 + i) * 4;
    ctx.fillStyle = hexToRgba(i % 2 ? "#7ef7ff" : "#fff0a6", 0.42);
    ctx.fillRect(px, py, 3, 3);
  }
  ctx.restore();
}
