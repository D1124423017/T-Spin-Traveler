import {
  clamp,
  hexToRgba,
  lerp,
} from "./drawUtils.js";

export function isHeroMeleeAttackStyle(style) {
  return [
    "melee",
    "ultimate",
    "slash",
    "doubleSlash",
    "tripleSlash",
    "tetris",
    "tspin",
    "combo",
    "combo1",
    "combo2",
    "combo3",
    "b2b",
  ].includes(String(style || ""));
}

export function getAttackRenderPosition(attack) {
  const progress = 1 - attack.life / attack.duration;
  const eased = 1 - Math.pow(1 - progress, 3);
  return {
    progress,
    x: lerp(attack.x0, attack.x1, eased),
    y: lerp(attack.y0, attack.y1, eased) + Math.sin(progress * Math.PI) * -42,
  };
}

export function createAttackEffectRenderer({
  ctx,
  state,
  isImageReady,
  roundedRect,
  drawSpriteAnimationFrame,
  resolvePlayerAttackVfx,
  resolveEnemyAttackVfx,
  enemyAttackAnimations,
}) {
  function drawAttackEffects() {
    for (const attack of state.attacks) {
      const position = getAttackRenderPosition(attack);
      if (attack.type === "player") {
        drawPlayerAttack(attack, position.x, position.y, position.progress);
      } else if (attack.type === "enemy") {
        drawEnemyAttack(attack, position.x, position.y, position.progress);
      } else {
        drawWaveSpawn(attack, position.progress);
      }
    }
  }

  function drawWaveSpawn(attack, progress) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 1 - progress;
    ctx.strokeStyle = "#98f07e";
    ctx.lineWidth = 5;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.arc(attack.x0, attack.y0, 35 + i * 28 + progress * 96, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(152, 240, 126, 0.18)";
    ctx.beginPath();
    ctx.arc(attack.x0, attack.y0, 90 + progress * 110, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPlayerAttack(attack, x, y, progress) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const special = attack.special || (attack.spin ? "spin" : "clear");
    const melee = isHeroMeleeAttackStyle(attack.heroStyle);
    const glow =
      special === "perfect" ? "#8ff7ff" :
      special === "combo" ? "#ffbe5f" :
      special === "spin" ? "#caa2ff" :
      special === "b2b" || special === "tetris" ? "#ffbe5f" :
      "#9fb4ff";
    const core =
      special === "perfect" ? "#ffffff" :
      special === "combo" ? "#fff0a6" :
      special === "spin" ? "#f1d36b" :
      "#d9f0ff";
    const elapsed = attack.duration - attack.life;
    const vfx = resolvePlayerAttackVfx(attack.heroStyle, attack.comboStyle);
    const drewProjectile = drawPlayerAttackProjectile(attack, vfx, elapsed, glow, core, special);
    if (!drewProjectile) {
      if (melee) drawMeleeAttackPath(attack, x, y, progress, glow, core, special);
      else drawRangedAttackPath(attack, x, y, progress, glow, core, special);
      ctx.shadowColor = glow;
      ctx.shadowBlur = special === "clear" ? 18 : 32;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, special === "clear" ? 11 : 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(x, y, special === "clear" ? 4 : 6, 0, Math.PI * 2);
      ctx.fill();
      if (["spin", "b2b", "perfect", "combo"].includes(special)) {
        ctx.strokeStyle = hexToRgba(core, 0.9);
        ctx.lineWidth = special === "perfect" ? 4 : 3;
        ctx.beginPath();
        ctx.arc(x, y, 28 + Math.sin(progress * Math.PI) * 12, progress * 8, progress * 8 + Math.PI * 1.35);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(attack.x1, attack.y1, 46 + progress * 10, 16 + progress * 4, -0.4, 0, Math.PI * 1.6);
        ctx.stroke();
      }
      if (special === "perfect") {
        for (let i = 0; i < 6; i += 1) {
          const angle = progress * 5 + (Math.PI * 2 * i) / 6;
          ctx.fillStyle = i % 2 ? "#c7a7ff" : "#8ff7ff";
          ctx.fillRect(
            attack.x1 + Math.cos(angle) * 42,
            attack.y1 + Math.sin(angle) * 28,
            6,
            6,
          );
        }
      }
    }
    if (!drawPlayerAttackImpact(attack, vfx, elapsed, glow) && progress > 0.78) {
      drawImpactBurst(attack.x1, attack.y1, glow, progress, special, 0.78);
    }
    ctx.restore();
  }

  function drawPlayerAttackProjectile(attack, vfx, elapsed, glow, core, special) {
    const projectile = vfx.projectile;
    if (!isImageReady(projectile.image)) return false;
    const localElapsed = elapsed - projectile.startMs;
    if (localElapsed < 0 || localElapsed > projectile.durationMs) return true;
    const localProgress = clamp(localElapsed / projectile.durationMs, 0, 1);
    const eased = 1 - Math.pow(1 - localProgress, 3);
    const arc = Math.sin(localProgress * Math.PI);
    const x = lerp(attack.x0 + 24, attack.x1 - 18, eased);
    const y = lerp(attack.y0 - 10, attack.y1, eased) - arc * 44;
    const fade = localProgress > 0.88 ? clamp((1 - localProgress) / 0.12, 0, 1) : 1;
    const scale = projectile.scale * (1 + arc * 0.08);
    const w = 190 * scale * (special === "perfect" ? 1.2 : 1);
    const h = 116 * scale * (special === "perfect" ? 1.12 : 1);
    ctx.save();
    ctx.globalAlpha *= projectile.alpha * fade;
    ctx.shadowColor = glow;
    ctx.shadowBlur = 22 + vfx.intensity * 10;
    ctx.translate(x, y);
    if (projectile.spin) ctx.rotate(-0.18 + localProgress * 0.36);
    drawSpriteAnimationFrame(projectile, localElapsed, -w * 0.5, -h * 0.5, w, h);
    ctx.globalAlpha *= 0.32 * fade;
    ctx.strokeStyle = hexToRgba(core, 0.62);
    ctx.lineWidth = 2 + vfx.intensity;
    ctx.beginPath();
    ctx.moveTo(-w * 0.48, h * 0.18);
    ctx.quadraticCurveTo(-w * 0.18, -h * 0.4, w * 0.42, -h * 0.08);
    ctx.stroke();
    ctx.restore();
    return true;
  }

  function drawPlayerAttackImpact(attack, vfx, elapsed, glow) {
    const impact = vfx.impact;
    if (!isImageReady(impact.image)) return false;
    const localElapsed = elapsed - impact.startMs;
    if (localElapsed < 0 || localElapsed > impact.durationMs) return true;
    const localProgress = clamp(localElapsed / impact.durationMs, 0, 1);
    const fade = localProgress > 0.86 ? clamp((1 - localProgress) / 0.14, 0, 1) : 1;
    const bloom = Math.sin(localProgress * Math.PI);
    const size = 126 * impact.scale * (1 + bloom * 0.18);
    ctx.save();
    ctx.globalAlpha *= fade;
    ctx.shadowColor = glow;
    ctx.shadowBlur = 24 + vfx.intensity * 12;
    drawSpriteAnimationFrame(
      impact,
      localElapsed,
      attack.x1 - size / 2,
      attack.y1 - size / 2,
      size,
      size,
    );
    ctx.restore();
    return true;
  }

  function drawRangedAttackPath(attack, x, y, progress, glow, core, special) {
    ctx.strokeStyle = hexToRgba(glow, special === "clear" ? 0.28 : 0.42);
    ctx.lineWidth = special === "clear" ? 4 : 6;
    ctx.beginPath();
    ctx.moveTo(attack.x0, attack.y0);
    ctx.quadraticCurveTo((attack.x0 + attack.x1) / 2, attack.y0 - 54, x, y);
    ctx.stroke();
    ctx.strokeStyle = hexToRgba(core, 0.58);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(attack.x0, attack.y0 + 6);
    ctx.quadraticCurveTo((attack.x0 + attack.x1) / 2, attack.y0 - 28, x, y + 6);
    ctx.stroke();
    for (let i = 0; i < 8; i += 1) {
      const trailProgress = Math.max(0, progress - i * 0.03);
      ctx.globalAlpha = Math.max(0, 0.52 - i * 0.055);
      ctx.fillStyle = i % 2 ? core : glow;
      ctx.fillRect(
        lerp(attack.x0, attack.x1, trailProgress) - 4,
        lerp(attack.y0, attack.y1, trailProgress) - 4,
        7,
        7,
      );
    }
    ctx.globalAlpha = 1;
  }

  function drawMeleeAttackPath(attack, x, y, progress, glow, core, special) {
    const arc = Math.sin(progress * Math.PI);
    ctx.strokeStyle = hexToRgba(glow, 0.52 + arc * 0.24);
    ctx.lineWidth = special === "perfect" ? 8 : 6;
    ctx.beginPath();
    ctx.moveTo(attack.x0 + 20, attack.y0 + 8);
    ctx.bezierCurveTo(448, 206 - arc * 42, 760, 502 + arc * 26, x, y);
    ctx.stroke();
    ctx.strokeStyle = hexToRgba(core, 0.78);
    ctx.lineWidth = special === "perfect" ? 4 : 3;
    ctx.beginPath();
    ctx.ellipse(attack.x1 - 8, attack.y1 + 2, 64 + arc * 48, 22 + arc * 18, -0.35, 0, Math.PI * 1.85);
    ctx.stroke();
    for (let i = 0; i < 14; i += 1) {
      const trailProgress = Math.max(0, progress - i * 0.018);
      ctx.globalAlpha = Math.max(0, 0.7 - i * 0.045);
      ctx.fillStyle = i % 2 ? core : glow;
      ctx.fillRect(
        lerp(attack.x0 + 34, attack.x1, trailProgress) - 4,
        lerp(attack.y0 - 18, attack.y1, trailProgress) + Math.sin(i) * 12 - 4,
        8,
        8,
      );
    }
    ctx.globalAlpha = 1;
  }

  function drawEnemyAttack(attack, x, y, progress) {
    const vfx = resolveEnemyAttackVfx(attack.attackKind, attack.bossPhase || 1);
    const ready = vfx
      && isImageReady(vfx.impact.image)
      && (!vfx.projectile || isImageReady(vfx.projectile.image));
    if (!ready) {
      drawEnemyAttackFallback(attack, x, y, progress);
      return;
    }

    const elapsed = attack.duration - attack.life;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    if (vfx.projectile) drawEnemyProjectileSprite(attack, vfx.projectile, elapsed);
    drawEnemyImpactSprite(attack, vfx.impact, elapsed);
    ctx.restore();
  }

  function drawEnemyProjectileSprite(attack, projectile, elapsed) {
    const localElapsed = elapsed - projectile.startMs;
    if (localElapsed < 0 || localElapsed > projectile.durationMs) return;
    const progress = clamp(localElapsed / projectile.durationMs, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const x = lerp(attack.x0, attack.x1, eased);
    const y = lerp(attack.y0 - 8, attack.y1 - 4, eased) - Math.sin(progress * Math.PI) * 34;
    const size = 148 * (projectile.scale || 1);
    ctx.save();
    ctx.shadowColor = "#b98cff";
    ctx.shadowBlur = 24 * (projectile.intensity || 1);
    drawSpriteAnimationFrame(projectile, localElapsed, x - size / 2, y - size / 2, size, size);
    ctx.restore();
  }

  function drawEnemyImpactSprite(attack, impact, elapsed) {
    const localElapsed = elapsed - impact.startMs;
    if (localElapsed < 0 || localElapsed > impact.durationMs) return;
    const size = 182 * (impact.scale || 1);
    ctx.save();
    ctx.shadowColor = "#c7a7ff";
    ctx.shadowBlur = 28 * (impact.intensity || 1);
    drawSpriteAnimationFrame(
      impact,
      localElapsed,
      attack.x1 - size / 2,
      attack.y1 - size / 2,
      size,
      size,
    );
    ctx.restore();
  }

  function drawEnemyAttackFallback(attack, x, y, progress) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const kind = attack.attackKind || "slime";
    const config = enemyAttackAnimations[kind] || {};
    const impactStart = typeof config.hitRatio === "number"
      ? Math.max(0.68, config.hitRatio - 0.02)
      : 0.78;
    const palette = {
      vine: "#9de06c",
      mushroom: "#b690ff",
      beetle: "#c6b38a",
      mist: "#d2ceff",
      thorn: "#b174ff",
      wisp: "#c7a7ff",
      sentinel: "#d7c28f",
      king: "#ffb95f",
      slime: "#82f28f",
    };
    const color = palette[kind] || palette.slime;
    const garbageAttack = ["vine", "mushroom", "beetle", "mist", "thorn", "sentinel", "king"].includes(kind);
    ctx.strokeStyle = hexToRgba(color, garbageAttack ? 0.42 : 0.32);
    ctx.lineWidth = kind === "king" ? 9 : garbageAttack ? 7 : 5;
    ctx.beginPath();
    ctx.moveTo(attack.x0, attack.y0);
    ctx.quadraticCurveTo((attack.x0 + attack.x1) / 2, attack.y0 - 58, x, y);
    ctx.stroke();
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    if (kind === "vine") {
      ctx.strokeStyle = hexToRgba(color, 0.75);
      ctx.lineWidth = 4;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.moveTo(x - 26 + i * 18, y + 18);
        ctx.bezierCurveTo(x - 42 + i * 22, y - 14, x + 16 - i * 8, y - 20, x + 5, y + 22);
        ctx.stroke();
      }
    } else if (kind === "thorn") {
      ctx.strokeStyle = hexToRgba(color, 0.82);
      ctx.lineWidth = 5;
      for (let i = 0; i < 4; i += 1) {
        const sweep = 22 + i * 10;
        ctx.beginPath();
        ctx.moveTo(x - 52 + i * 10, y + 30 - i * 6);
        ctx.quadraticCurveTo(x + 2, y - sweep, x + 58 - i * 7, y + 12 + i * 3);
        ctx.stroke();
      }
      ctx.fillStyle = hexToRgba("#f2d6ff", 0.78);
      for (let i = 0; i < 9; i += 1) {
        const angle = -0.8 + i * 0.2 + progress * 2.4;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(angle) * 42, y + Math.sin(angle) * 24);
        ctx.lineTo(x + Math.cos(angle + 0.12) * 56, y + Math.sin(angle + 0.12) * 30);
        ctx.lineTo(x + Math.cos(angle - 0.12) * 52, y + Math.sin(angle - 0.12) * 20);
        ctx.closePath();
        ctx.fill();
      }
    } else if (kind === "mushroom") {
      ctx.fillStyle = hexToRgba(color, 0.72);
      for (let i = 0; i < 10; i += 1) {
        const angle = progress * 8 + i * 1.9;
        ctx.beginPath();
        ctx.arc(x + Math.cos(angle) * (14 + i * 2), y + Math.sin(angle) * 16, 3 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (kind === "wisp") {
      for (let i = 0; i < 3; i += 1) {
        const drift = Math.sin(progress * Math.PI * 2 + i * 1.7) * 14;
        ctx.strokeStyle = hexToRgba(i % 2 ? "#e2d8ff" : color, 0.58);
        ctx.lineWidth = 4 - i * 0.5;
        ctx.beginPath();
        ctx.moveTo(x - 58 - i * 8, y + drift);
        ctx.bezierCurveTo(x - 30, y - 26 + drift, x + 18, y + 22 - drift, x + 46 + i * 8, y - drift * 0.25);
        ctx.stroke();
        ctx.fillStyle = hexToRgba(i % 2 ? "#e2d8ff" : "#78dcff", 0.88);
        ctx.beginPath();
        ctx.arc(x + 46 + i * 8, y - drift * 0.25, 7 - i, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = hexToRgba(color, 0.34);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 28 + progress * 12, 0, Math.PI * 1.7);
      ctx.stroke();
    } else if (kind === "mist") {
      ctx.strokeStyle = hexToRgba(color, 0.64);
      ctx.lineWidth = 5;
      for (let i = 0; i < 2; i += 1) {
        ctx.beginPath();
        ctx.ellipse(x, y + i * 8, 30 + progress * 10, 12, progress * 5 + i, 0, Math.PI * 1.8);
        ctx.stroke();
      }
    } else if (kind === "sentinel") {
      ctx.fillStyle = "#8f8469";
      ctx.strokeStyle = hexToRgba(color, 0.72);
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(x, y + 12, 56 + progress * 12, 16 + progress * 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 34 + progress * 8, Math.PI * 0.08, Math.PI * 0.92);
      ctx.stroke();
      for (let i = 0; i < 8; i += 1) {
        const angle = (Math.PI * 2 * i) / 8 + progress;
        const rx = x + Math.cos(angle) * (26 + i);
        const ry = y + 16 + Math.sin(angle) * 12;
        ctx.save();
        ctx.translate(rx, ry);
        ctx.rotate(angle);
        roundedRect(-5, -5, 10 + (i % 3) * 4, 10, 2, true, false);
        ctx.restore();
      }
    } else if (kind === "beetle" || kind === "king") {
      ctx.fillStyle = kind === "king" ? "#d8bf65" : "#9aa6ae";
      ctx.shadowBlur = 18;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(progress * 10);
      const size = kind === "king" ? 42 : 34;
      roundedRect(-size / 2, -size / 2, size, size, 4, true, false);
      ctx.strokeStyle = "rgba(20, 24, 30, 0.7)";
      ctx.lineWidth = 4;
      roundedRect(-size / 2, -size / 2, size, size, 4, false, true);
      ctx.restore();
    } else {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(x, y, 18, 12, progress * 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#d7ffd7";
      ctx.beginPath();
      ctx.arc(x - 4, y - 2, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (progress > impactStart) {
      drawImpactBurst(
        attack.x1,
        attack.y1,
        garbageAttack ? color : "#ff7782",
        progress,
        kind,
        impactStart,
      );
    }
    ctx.restore();
  }

  function drawImpactBurst(x, y, color, progress, kind = "clear", impactStart = 0.78) {
    const strength = Math.min(1, (progress - impactStart) / Math.max(0.05, 1 - impactStart));
    const strong = ["perfect", "spin", "b2b", "combo", "thorn", "wisp", "sentinel", "king"].includes(kind);
    ctx.save();
    ctx.globalAlpha = 1 - strength;
    ctx.strokeStyle = color;
    ctx.lineWidth = strong ? 5 : 3;
    ctx.beginPath();
    ctx.arc(x, y, 14 + strength * (strong ? 58 : 34), 0, Math.PI * 2);
    ctx.stroke();
    const count = strong ? 12 : 7;
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * 16, y + Math.sin(angle) * 16);
      ctx.lineTo(
        x + Math.cos(angle) * (strong ? 72 : 48),
        y + Math.sin(angle) * (strong ? 58 : 38),
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  return {
    drawAttackEffects,
  };
}
