export function createBattleUiPrimitives({
  ctx,
  t,
  clamp,
  hexToRgba,
  roundedRect,
  canvasFont,
}) {
  function drawCharacterShadow(x, y, w, color) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = hexToRgba(color, 0.13);
    ctx.beginPath();
    ctx.ellipse(x, y, w, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawHpBar(x, y, w, h, value, max, color, caption, options = {}) {
    const ratio = max ? clamp(value / max, 0, 1) : 0;
    const textValue = options.textValue ?? value;
    const valueText = `${Math.max(0, Math.round(textValue))}/${max}`;
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    roundedRect(x, y, w, h, 7, true, false);
    if (typeof options.trailValue === "number" && options.trailValue > value) {
      const trailRatio = max ? clamp(options.trailValue / max, 0, 1) : 0;
      ctx.fillStyle = options.trailColor || "rgba(255, 119, 130, 0.3)";
      roundedRect(x, y, Math.max(0, w * trailRatio), h, 7, true, false);
    }
    const gradient = ctx.createLinearGradient(x, y, x + w, y);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, ratio < 0.35 ? "#ff7782" : "#8ff1d2");
    ctx.fillStyle = gradient;
    roundedRect(x, y, Math.max(0, w * ratio), h, 7, true, false);
    ctx.strokeStyle = "rgba(241,244,250,0.34)";
    ctx.lineWidth = 2;
    roundedRect(x, y, w, h, 7, false, true);
    ctx.textBaseline = "middle";
    ctx.font = canvasFont("800", 11, caption, true);
    ctx.fillStyle = "rgba(8, 11, 18, 0.78)";
    ctx.fillText(caption, x + 10, y + h / 2 + 1);
    ctx.font = canvasFont("800", 12, valueText, true);
    const textW = Math.max(56, Math.min(w - 58, Math.ceil(ctx.measureText(valueText).width + 18)));
    ctx.fillStyle = "rgba(2, 5, 10, 0.58)";
    roundedRect(x + w - textW - 4, y + 3, textW, h - 6, 5, true, false);
    ctx.textAlign = "right";
    ctx.fillStyle = "#f3f2ea";
    ctx.fillText(valueText, x + w - 12, y + h / 2 + 1);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.restore();
  }

  function drawStatChip(x, y, text, color) {
    ctx.save();
    const width = Math.max(112, text.length * 8 + 26);
    ctx.fillStyle = "rgba(8, 13, 20, 0.54)";
    roundedRect(x, y, width, 24, 6, true, false);
    ctx.strokeStyle = "rgba(211, 231, 255, 0.18)";
    ctx.lineWidth = 1;
    roundedRect(x, y, width, 24, 6, false, true);
    ctx.fillStyle = color;
    ctx.font = canvasFont("800", 12, text);
    ctx.fillText(text, x + 12, y + 16);
    ctx.restore();
  }

  function drawCountdownBadge(x, y, count) {
    ctx.save();
    const danger = count <= 1;
    ctx.fillStyle = danger ? "rgba(76, 14, 24, 0.72)" : "rgba(8, 13, 20, 0.58)";
    roundedRect(x, y, 160, 34, 8, true, false);
    ctx.strokeStyle = danger ? "rgba(255, 119, 130, 0.72)" : "rgba(139, 238, 184, 0.28)";
    ctx.lineWidth = 2;
    roundedRect(x, y, 160, 34, 8, false, true);
    ctx.font = canvasFont("800", 12, t("enemyStrike").toUpperCase(), true);
    ctx.fillStyle = danger ? "#ffb7bd" : "rgba(216, 238, 229, 0.72)";
    ctx.fillText(t("enemyStrike").toUpperCase(), x + 12, y + 14);
    ctx.font = canvasFont("900", 22, String(count), true);
    ctx.fillStyle = danger ? "#ff7782" : "#98f07e";
    ctx.fillText(String(count), x + 128, y + 25);
    ctx.restore();
  }

  return {
    drawCharacterShadow,
    drawCountdownBadge,
    drawHpBar,
    drawStatChip,
  };
}
