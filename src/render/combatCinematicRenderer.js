import { clamp } from "./drawUtils.js";

export function getPerfectClearVisualState(fx, now) {
  if (!fx) return null;
  const elapsed = now - fx.startedAt;
  const progress = clamp(elapsed / fx.duration, 0, 1);
  const fadeIn = clamp(progress / 0.12, 0, 1);
  const fadeOut = clamp((1 - progress) / 0.22, 0, 1);
  return {
    elapsed,
    progress,
    alpha: Math.min(fadeIn, fadeOut),
    burst: Math.sin(Math.min(1, progress * 1.28) * Math.PI),
  };
}

export function createCombatCinematicRenderer({
  ctx,
  state,
  width,
  height,
  boardX,
  boardY,
  cols,
  rows,
  tileSize,
  heroUltimateAnimation,
  roundedRect,
  label,
  t,
  fmt,
  canvasFont,
  isImageReady,
  drawSpriteAnimationFrame,
}) {
  function drawBossPhaseWarning() {
    const banner = state.bossPhaseBanner;
    const windup = state.bossWindup;
    if (!banner && !windup) return;
    ctx.save();
    if (windup) {
      const progress = 1 - clamp(windup.life / windup.duration, 0, 1);
      const pulse = Math.sin(progress * Math.PI);
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = `rgba(255, 185, 95, ${0.24 + pulse * 0.46})`;
      ctx.lineWidth = 3 + windup.phase;
      ctx.beginPath();
      ctx.ellipse(994, 346, 92 + pulse * 54, 42 + pulse * 22, -0.18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(177, 116, 255, ${0.16 + pulse * 0.32})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i += 1) {
        const angle = progress * Math.PI * 2 + i * Math.PI * 0.5;
        ctx.beginPath();
        ctx.arc(994 + Math.cos(angle) * 56, 346 + Math.sin(angle) * 24, 18 + pulse * 12, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    if (banner) {
      const alpha = clamp(banner.life / banner.duration, 0, 1);
      const reveal = Math.min(1, (banner.duration - banner.life) / 180);
      const x = width / 2 - 178;
      const y = 86;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(3, 5, 12, ${0.52 * Math.min(reveal, alpha * 2)})`;
      roundedRect(x, y, 356, 64, 14, true, false);
      ctx.strokeStyle = `rgba(255, 185, 95, ${0.38 + reveal * 0.34})`;
      ctx.lineWidth = 2;
      roundedRect(x, y, 356, 64, 14, false, true);
      ctx.textAlign = "center";
      label(fmt("bossPhaseShift", { phase: banner.phase }).toUpperCase(), width / 2, y + 27, 20, "#fff0a6");
      label(t("bossRiftWindup"), width / 2, y + 48, 12, "#ffb95f");
      ctx.textAlign = "left";
    }
    ctx.restore();
  }

  function drawPerfectClearFx(now = performance.now()) {
    const fx = state.perfectClearFx;
    const visual = getPerfectClearVisualState(fx, now);
    if (!visual) return;
    const {
      elapsed,
      progress,
      alpha,
      burst,
    } = visual;
    const cx = boardX + (cols * tileSize) / 2;
    const cy = boardY + rows * tileSize * 0.42;

    ctx.save();
    ctx.fillStyle = `rgba(2, 3, 10, ${0.66 * alpha})`;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    const radial = ctx.createRadialGradient(cx, cy, 40, cx, cy, 540);
    radial.addColorStop(0, `rgba(255, 255, 246, ${0.78 * alpha})`);
    radial.addColorStop(0.22, `rgba(255, 225, 132, ${0.4 * alpha})`);
    radial.addColorStop(0.5, `rgba(154, 116, 255, ${0.22 * alpha})`);
    radial.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    const flash = Math.max(0, 1 - Math.abs(progress - 0.38) / 0.08);
    if (flash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.42 * flash * alpha})`;
      ctx.fillRect(0, 0, width, height);
    }

    for (let i = 0; i < 18; i += 1) {
      const angle = (Math.PI * 2 * i) / 18 + progress * 2.8;
      const inner = 36 + burst * 18;
      const outer = 480 + burst * 220;
      ctx.strokeStyle = i % 3 === 0
        ? `rgba(255, 239, 165, ${0.34 * alpha})`
        : `rgba(150, 236, 255, ${0.24 * alpha})`;
      ctx.lineWidth = i % 3 === 0 ? 5 : 3;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
      ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
      ctx.stroke();
    }

    for (let i = 0; i < 4; i += 1) {
      ctx.strokeStyle = i % 2
        ? `rgba(199, 167, 255, ${0.42 * alpha})`
        : `rgba(255, 244, 168, ${0.36 * alpha})`;
      ctx.lineWidth = 3 + i;
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy,
        92 + i * 58 + burst * 120,
        34 + i * 24 + burst * 46,
        -0.32 + progress * 2.1,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    for (let i = 0; i < 42; i += 1) {
      const seed = fx.seed + i * 19.17;
      const angle = seed + progress * (2.2 + (i % 5) * 0.18);
      const radius = 95 + ((i * 37) % 360) + burst * 92;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius * 0.56;
      const size = 5 + (i % 4) * 2;
      ctx.fillStyle = i % 3 === 0
        ? `rgba(255, 229, 132, ${0.74 * alpha})`
        : `rgba(178, 118, 255, ${0.72 * alpha})`;
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }

    if (progress > 0.28 && progress < 0.72) {
      const strength = Math.sin(((progress - 0.28) / 0.44) * Math.PI);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.86 * strength * alpha})`;
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(-80, cy + 150);
      ctx.lineTo(width + 80, cy - 190);
      ctx.stroke();
      ctx.strokeStyle = `rgba(199, 167, 255, ${0.62 * strength * alpha})`;
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(-80, cy - 74);
      ctx.lineTo(width + 80, cy + 94);
      ctx.stroke();
    }

    if (isImageReady(heroUltimateAnimation.image)) {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.96 * alpha;
      ctx.shadowColor = "rgba(199, 167, 255, 0.9)";
      ctx.shadowBlur = 36 + burst * 28;
      const heroW = 704 + burst * 44;
      const heroH = 402 + burst * 26;
      drawSpriteAnimationFrame(heroUltimateAnimation, elapsed, 42, 202 - burst * 12, heroW, heroH);
      ctx.restore();
    }

    ctx.globalCompositeOperation = "source-over";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(255, 240, 166, 0.9)";
    ctx.shadowBlur = 26 + burst * 24;
    ctx.font = canvasFont("900", 72, t("perfectClearTitle"), true);
    const titleY = 132 + Math.sin(progress * Math.PI) * -8;
    const titleGradient = ctx.createLinearGradient(380, titleY - 54, 900, titleY + 18);
    titleGradient.addColorStop(0, "#ffffff");
    titleGradient.addColorStop(0.5, "#fff0a6");
    titleGradient.addColorStop(1, "#8ff7ff");
    ctx.fillStyle = titleGradient;
    ctx.globalAlpha = alpha;
    ctx.fillText(t("perfectClearTitle"), width / 2, titleY);
    ctx.font = canvasFont("900", 22, t("perfectClearSubtitle").toUpperCase());
    ctx.fillStyle = "#d7c2ff";
    ctx.fillText(t("perfectClearSubtitle").toUpperCase(), width / 2, titleY + 34);
    ctx.font = canvasFont("900", 34, fmt("perfectClearDamage", { damage: fx.damage }).toUpperCase());
    ctx.fillStyle = "#fff0a6";
    ctx.fillText(fmt("perfectClearDamage", { damage: fx.damage }).toUpperCase(), width / 2, titleY + 70);
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
    ctx.restore();
  }

  return {
    drawBossPhaseWarning,
    drawPerfectClearFx,
  };
}
