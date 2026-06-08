export function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function createCombatFeedbackRenderer({
  ctx,
  state,
  clamp,
  hexToRgba,
  canvasFont,
  label,
}) {
  function drawFloaters() {
    for (const floater of state.floaters) {
      ctx.globalAlpha = Math.min(1, floater.life / 260);
      label(floater.text, floater.x, floater.y, 28, floater.color);
      ctx.globalAlpha = 1;
    }
  }

  function drawCombatPopups() {
    if (!state.combatPopups.length) return;
    ctx.save();
    ctx.textAlign = "left";
    for (const popup of state.combatPopups) {
      drawCombatPopup(popup);
    }
    ctx.restore();
  }

  function drawCombatPopup(popup) {
    const progress = clamp(1 - popup.life / popup.maxLife, 0, 1);
    const appear = clamp(progress / 0.12, 0, 1);
    const hold = progress < 0.62 ? 1 : clamp(1 - (progress - 0.62) / 0.38, 0, 1);
    const alpha = Math.min(1, appear) * hold;
    if (alpha <= 0) return;

    const baseScale = popup.scale || 1;
    const scale = baseScale * easeOutBack(appear);
    const drift = progress > 0.45 ? (progress - 0.45) * 54 : 0;
    const wobble = Math.sin((progress + popup.seed) * Math.PI * 5) * 3 * (1 - progress);
    const x = popup.x + wobble;
    const y = popup.y - drift;
    const primary = popup.color || "#d7c2ff";
    const accent = popup.accent || "#8ff7ff";
    const perfect = popup.type === "perfect";
    const big = popup.type === "tspin" || popup.type === "perfect";
    const titleSize = perfect ? 36 : big ? 34 : popup.type === "b2b" ? 31 : 30;
    const subSize = perfect ? 17 : 22;

    ctx.save();
    ctx.globalAlpha = alpha * (perfect ? 0.88 : 0.78);
    ctx.translate(x, y);
    ctx.rotate(perfect ? 0 : -0.08);
    ctx.scale(scale, scale);
    ctx.globalCompositeOperation = "source-over";

    drawCombatPopupGlyphs(popup, progress, primary, accent);
    drawCombatPopupTrail(popup, primary, accent, progress);

    ctx.shadowColor = primary;
    ctx.shadowBlur = perfect ? 18 : big ? 15 : 10;
    ctx.lineWidth = perfect ? 4 : big ? 3 : 2.4;
    ctx.strokeStyle = hexToRgba(accent, perfect ? 0.46 : 0.34);
    ctx.font = canvasFont("900", titleSize, popup.text, true);
    ctx.strokeText(popup.text, 0, 0);

    const gradient = ctx.createLinearGradient(0, -titleSize, 220, 8);
    gradient.addColorStop(0, perfect ? "rgba(255, 248, 214, 0.94)" : "rgba(239, 246, 255, 0.9)");
    gradient.addColorStop(0.55, hexToRgba(primary, 0.9));
    gradient.addColorStop(1, hexToRgba(accent, 0.72));
    ctx.fillStyle = gradient;
    ctx.fillText(popup.text, 0, 0);

    if (popup.subText) {
      ctx.shadowBlur = 8;
      ctx.font = canvasFont("900", subSize, popup.subText, true);
      ctx.strokeStyle = "rgba(10, 8, 24, 0.72)";
      ctx.lineWidth = 2.2;
      ctx.strokeText(popup.subText, 4, subSize + 14);
      ctx.fillStyle = popup.type === "b2b"
        ? "rgba(255, 240, 166, 0.82)"
        : "rgba(235, 224, 255, 0.82)";
      ctx.fillText(popup.subText, 4, subSize + 14);
    }
    ctx.restore();
  }

  function drawCombatPopupTrail(popup, primary, accent, progress) {
    const lineCount = popup.type === "perfect" ? 5 : popup.type === "lineClear" ? 2 : 4;
    for (let i = 0; i < lineCount; i += 1) {
      const offset = i * 12;
      ctx.strokeStyle = hexToRgba(
        i % 2 ? accent : primary,
        (popup.type === "perfect" ? 0.28 : 0.18) * (1 - progress),
      );
      ctx.lineWidth = popup.type === "perfect" ? 1.9 : 1.35;
      ctx.beginPath();
      ctx.moveTo(-72 - offset, 10 + i * 8);
      ctx.quadraticCurveTo(-30 - offset * 0.4, -8 - i * 4, 142 + offset * 0.2, -28 + i * 10);
      ctx.stroke();
    }
  }

  function drawCombatPopupGlyphs(popup, progress, primary, accent) {
    const sparkCount = popup.type === "perfect" ? 16 : popup.type === "lineClear" ? 6 : 10;
    const orbit = popup.type === "perfect" ? 86 : 58;
    if (popup.type === "tspin" || popup.type === "spin") {
      drawSpinPopupSigil(progress, primary, accent);
    }
    for (let i = 0; i < sparkCount; i += 1) {
      const angle = popup.seed + i * 2.399 + progress * 1.6;
      const radius = orbit + Math.sin(progress * Math.PI + i) * 12;
      const sx = Math.cos(angle) * radius + 64;
      const sy = Math.sin(angle) * radius * 0.44 - 18;
      const size = (popup.type === "perfect" ? 4.2 : 3.2) * (0.35 + (1 - progress) * 0.65);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle);
      ctx.fillStyle = hexToRgba(i % 3 === 0 ? accent : primary, popup.type === "perfect" ? 0.72 : 0.48);
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = popup.type === "perfect" ? 8 : 5;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  function drawSpinPopupSigil(progress, primary, accent) {
    const rotation = progress * Math.PI * 2.4;
    ctx.save();
    ctx.translate(88, -30);
    ctx.rotate(rotation);
    ctx.strokeStyle = hexToRgba(accent, 0.24 * (1 - progress * 0.35));
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, 32, -0.85, Math.PI * 1.45);
    ctx.stroke();
    for (let i = 0; i < 4; i += 1) {
      const angle = i * Math.PI * 0.5;
      ctx.fillStyle = hexToRgba(i % 2 ? accent : primary, 0.56);
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 5;
      ctx.fillRect(Math.cos(angle) * 32 - 4, Math.sin(angle) * 32 - 4, 8, 8);
    }
    ctx.restore();
  }

  return {
    drawCombatPopups,
    drawFloaters,
  };
}
