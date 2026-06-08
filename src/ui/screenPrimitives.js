export function createScreenPrimitives({
  ctx,
  roundedRect,
  overlayReadability,
}) {
  function drawCard(x, y, w, h) {
    ctx.save();
    const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
    gradient.addColorStop(0, overlayReadability.panel.top);
    gradient.addColorStop(0.52, overlayReadability.panel.middle);
    gradient.addColorStop(1, overlayReadability.panel.bottom);
    ctx.fillStyle = gradient;
    ctx.shadowColor = "rgba(126, 231, 255, 0.06)";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "rgba(214, 159, 86, 0.22)";
    ctx.lineWidth = 1.5;
    roundedRect(x, y, w, h, 8, true, true);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(139, 102, 255, 0.1)";
    ctx.lineWidth = 1.5;
    roundedRect(x + 5, y + 5, w - 10, h - 10, 5, false, true);
    ctx.strokeStyle = "rgba(255, 210, 128, 0.2)";
    ctx.lineWidth = 1.5;
    for (const [sx, sy, dx, dy] of [
      [x + 18, y + 18, 24, 0],
      [x + 18, y + 18, 0, 24],
      [x + w - 18, y + 18, -24, 0],
      [x + w - 18, y + 18, 0, 24],
      [x + 18, y + h - 18, 24, 0],
      [x + 18, y + h - 18, 0, -24],
      [x + w - 18, y + h - 18, -24, 0],
      [x + w - 18, y + h - 18, 0, -24],
    ]) {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + dx, sy + dy);
      ctx.stroke();
    }
    const scan = ctx.createLinearGradient(x, y, x + w, y);
    scan.addColorStop(0, "rgba(255,255,255,0)");
    scan.addColorStop(0.5, "rgba(255,255,255,0.035)");
    scan.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = scan;
    ctx.fillRect(x + 10, y + 10, w - 20, 1);
    ctx.fillStyle = overlayReadability.panel.scanline;
    for (let yy = y + 22; yy < y + h - 16; yy += 26) {
      ctx.fillRect(x + 12, yy, w - 24, 1);
    }
    ctx.restore();
  }

  function drawCornerGlyph(x, y, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(11, 0);
    ctx.lineTo(0, 12);
    ctx.lineTo(-11, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  return {
    drawCard,
    drawCornerGlyph,
  };
}
