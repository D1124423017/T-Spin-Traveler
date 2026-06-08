import { hexToRgba } from "./drawUtils.js";
import { isHeroMeleeAttackStyle } from "./attackEffectRenderer.js";

export function createHeroCombatFallbackRenderer({
  ctx,
  roundedRect,
  drawHeroIdleBase,
}) {
  function drawFallbackHeroAttackAnimation(kind, progress, frameIndex) {
    const meleeLike = isHeroMeleeAttackStyle(kind);
    const strike = Math.sin(progress * Math.PI);
    ctx.save();
    ctx.translate(meleeLike ? strike * 8 : -strike * 3, 0);
    ctx.rotate(meleeLike ? -0.035 + strike * 0.075 : -0.018);
    drawHeroIdleBase();
    ctx.restore();

    if (meleeLike) drawFallbackMeleePose(progress, frameIndex);
    else drawFallbackRangedPose(progress, frameIndex);
  }

  function drawHeroIdleEnergy() {
    const now = performance.now() * 0.001;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowColor = "#a66cff";
    ctx.shadowBlur = 14;
    ctx.globalAlpha = 0.56 + Math.sin(now * 3.2) * 0.12;
    ctx.strokeStyle = "rgba(180, 124, 255, 0.42)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 34, 42 + Math.sin(now * 2.2) * 4, 0.15, Math.PI * 1.18);
    ctx.stroke();
    for (let i = 0; i < 6; i += 1) {
      const a = now * 1.7 + i * 1.05;
      const x = -58 + Math.cos(a) * (10 + i * 4);
      const y = 92 + Math.sin(a * 1.3) * 22;
      ctx.fillStyle = i % 2 ? "#c9a7ff" : "#8c55ff";
      ctx.globalAlpha = 0.28 + ((Math.sin(now * 2 + i) + 1) / 2) * 0.38;
      ctx.fillRect(x, y, 4, 4);
    }
    ctx.restore();
  }

  function drawFallbackMeleePose(progress, frameIndex) {
    const strike = Math.sin(progress * Math.PI);
    const charge = frameIndex <= 1 ? 0.35 + frameIndex * 0.3 : strike;
    const bladeStart = {
      x: -46 + strike * 20,
      y: 70 - charge * 18,
    };
    const bladeEnd = {
      x: 58 + strike * 78,
      y: 10 - strike * 74,
    };
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowColor = "#b98cff";
    ctx.shadowBlur = 24 + strike * 22;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(246, 239, 255, 0.94)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(bladeStart.x, bladeStart.y);
    ctx.lineTo(bladeEnd.x, bladeEnd.y);
    ctx.stroke();
    ctx.strokeStyle = "rgba(169, 104, 255, 0.88)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(bladeStart.x, bladeStart.y);
    ctx.lineTo(bladeEnd.x, bladeEnd.y);
    ctx.stroke();
    if (frameIndex >= 3) {
      ctx.strokeStyle = "rgba(189, 135, 255, 0.62)";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(18, 42, 76 + strike * 42, -0.86, 0.72 + progress * 1.2);
      ctx.stroke();
    }
    for (let i = 0; i < 12; i += 1) {
      const a = progress * 5 + i * 0.62;
      ctx.fillStyle = i % 2 ? "#d6b7ff" : "#8f57ff";
      ctx.globalAlpha = Math.max(0.18, 0.82 - i * 0.045);
      ctx.fillRect(
        bladeEnd.x - 10 + Math.cos(a) * (16 + i * 4),
        bladeEnd.y + Math.sin(a) * (10 + i * 2),
        5,
        5,
      );
    }
    ctx.restore();
  }

  function drawFallbackRangedPose(progress, frameIndex) {
    const charge = Math.min(1, progress * 2.3);
    const recoil = frameIndex >= 4 ? Math.sin((progress - 0.5) * Math.PI * 2) * 8 : 0;
    const gunX = 36 - recoil;
    const gunY = 44;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowColor = "#a66cff";
    ctx.shadowBlur = 20 + charge * 20;
    ctx.fillStyle = "rgba(21, 24, 34, 0.92)";
    roundedRect(gunX - 18, gunY - 10, 72, 24, 7, true, false);
    ctx.strokeStyle = "rgba(235, 222, 255, 0.82)";
    ctx.lineWidth = 2;
    roundedRect(gunX - 18, gunY - 10, 72, 24, 7, false, true);
    ctx.fillStyle = "#9d68ff";
    roundedRect(gunX + 10, gunY - 6, 18, 12, 4, true, false);
    if (frameIndex >= 2) {
      ctx.fillStyle = "rgba(181, 124, 255, 0.78)";
      ctx.beginPath();
      ctx.arc(gunX + 62, gunY + 1, 8 + charge * 8, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 8; i += 1) {
        const a = i * 0.78 + progress * 6;
        ctx.fillRect(gunX + 62 + Math.cos(a) * 20, gunY + 1 + Math.sin(a) * 14, 4, 4);
      }
    }
    if (frameIndex >= 4) {
      ctx.strokeStyle = "rgba(198, 160, 255, 0.82)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(gunX + 64, gunY + 1);
      ctx.lineTo(gunX + 154 + progress * 80, gunY - 8);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawNoaAttackPose(attack) {
    const progress = 1 - attack.life / attack.duration;
    const strength = Math.sin(Math.min(1, progress) * Math.PI);
    const special = attack.special || "clear";
    const color =
      special === "perfect" ? "#8ff7ff" :
      special === "combo" ? "#ffbe5f" :
      special === "spin" ? "#caa2ff" :
      special === "b2b" || special === "tetris" ? "#ffbe5f" :
      "#9fb4ff";
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.2 + strength * 0.8;
    ctx.shadowColor = color;
    ctx.shadowBlur = 28 + strength * 18;
    ctx.strokeStyle = color;
    ctx.lineWidth = special === "clear" ? 4 : 7;
    ctx.beginPath();
    ctx.arc(-6, 16, 54 + strength * 22, -0.6, 1.1 + strength * 0.7);
    ctx.stroke();
    ctx.strokeStyle = "#f6f0ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(28, 42);
    ctx.lineTo(88 + strength * 24, 22 - strength * 22);
    ctx.stroke();
    ctx.fillStyle = color;
    for (let i = 0; i < 7; i += 1) {
      const a = -0.2 + i * 0.2 + progress * 2;
      ctx.fillRect(52 + Math.cos(a) * (28 + i * 4), 26 + Math.sin(a) * 34, 4, 4);
    }
    if (special !== "clear") {
      ctx.strokeStyle = hexToRgba(color, 0.72);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(56, 36, 60 + strength * 26, 18 + strength * 8, -0.28, 0, Math.PI * 1.7);
      ctx.stroke();
    }
    ctx.restore();
  }

  return {
    drawFallbackHeroAttackAnimation,
    drawHeroIdleEnergy,
    drawNoaAttackPose,
  };
}
