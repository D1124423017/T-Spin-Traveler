export function getBaselineAnchorY(groundY, localBaselineY, scale = 1) {
  return groundY - localBaselineY * scale;
}

export function scaleDrawBoxFromBottom(draw, scale = 1) {
  if (scale === 1) return { ...draw };
  const centerX = draw.x + draw.w / 2;
  const bottomY = draw.y + draw.h;
  const w = draw.w * scale;
  const h = draw.h * scale;
  return {
    x: centerX - w / 2,
    y: bottomY - h,
    w,
    h,
  };
}

export function alignDrawBoxToBaseline(draw, localBaselineY, options = {}) {
  const scaled = scaleDrawBoxFromBottom(draw, options.scale || 1);
  return {
    ...scaled,
    y: localBaselineY + (options.bottomOffset || 0) - scaled.h,
  };
}

export function createCharacterStageHelpers({
  ctx,
  hexToRgba,
}) {
  function scaleAroundBaseline(scaleX, scaleY, localBaselineY) {
    ctx.translate(0, localBaselineY);
    ctx.scale(scaleX, scaleY);
    ctx.translate(0, -localBaselineY);
  }

  function drawStageGlow(x, y, r, color) {
    ctx.save();
    const g = ctx.createRadialGradient(x, y, 18, x, y, r);
    g.addColorStop(0, hexToRgba(color, 0.22));
    g.addColorStop(0.55, hexToRgba(color, 0.08));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.05, r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPresentationSigil(x, y, r, color) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.translate(x, y);
    ctx.strokeStyle = hexToRgba(color, 0.18);
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.24, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = hexToRgba("#fff0a6", 0.16);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.72, r * 0.14, 0, Math.PI * 0.08, Math.PI * 1.92);
    ctx.stroke();
    for (let i = 0; i < 6; i += 1) {
      const a = (Math.PI * 2 * i) / 6 + performance.now() * 0.0004;
      ctx.fillStyle = i % 2 ? hexToRgba(color, 0.34) : "rgba(255, 240, 166, 0.26)";
      ctx.fillRect(Math.cos(a) * r * 0.82 - 2, Math.sin(a) * r * 0.18 - 2, 4, 4);
    }
    ctx.restore();
  }

  return {
    drawPresentationSigil,
    drawStageGlow,
    scaleAroundBaseline,
  };
}
