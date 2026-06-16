const GRID_COLUMNS = 4;
const GRID_ROWS = 4;
const FRAME_COUNT = GRID_COLUMNS * GRID_ROWS;
const DEFAULT_FRAME_MS = 190;

export function getEquipmentHeroFrameIndex(
  elapsed,
  {
    frameMs = DEFAULT_FRAME_MS,
    frameCount = FRAME_COUNT,
    reducedMotion = false,
  } = {},
) {
  if (reducedMotion) return 0;
  const safeFrameMs = Math.max(1, Number(frameMs) || DEFAULT_FRAME_MS);
  const safeFrameCount = Math.max(1, Math.floor(Number(frameCount) || FRAME_COUNT));
  return Math.floor(Math.max(0, Number(elapsed) || 0) / safeFrameMs) % safeFrameCount;
}

export function getEquipmentHeroFrameSource(image, frameIndex) {
  const frameWidth = Math.max(1, (image?.naturalWidth || 2048) / GRID_COLUMNS);
  const frameHeight = Math.max(1, (image?.naturalHeight || 3072) / GRID_ROWS);
  const safeIndex = Math.max(0, Math.floor(Number(frameIndex) || 0)) % FRAME_COUNT;
  return {
    x: (safeIndex % GRID_COLUMNS) * frameWidth,
    y: Math.floor(safeIndex / GRID_COLUMNS) * frameHeight,
    w: frameWidth,
    h: frameHeight,
  };
}

export function createEquipmentHeroPreviewRenderer({
  ctx,
  idleSheet,
  fallbackArt,
  isImageReady,
  drawImageContain,
  now = () => performance.now(),
  reducedMotion = () => globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true,
  frameMs = DEFAULT_FRAME_MS,
} = {}) {
  function draw({ stageRect, imageRect } = {}) {
    const time = Math.max(0, Number(now()) || 0);
    const motionReduced = Boolean(reducedMotion());
    drawRiftAura(stageRect, time, motionReduced);
    drawRiftPlatform(stageRect, time, motionReduced);

    ctx.save();
    ctx.shadowColor = "rgba(155, 105, 255, 0.58)";
    ctx.shadowBlur = motionReduced ? 18 : 22 + Math.sin(time / 520) * 4;
    if (isImageReady(idleSheet)) {
      const frameIndex = getEquipmentHeroFrameIndex(time, {
        frameMs,
        reducedMotion: motionReduced,
      });
      const source = getEquipmentHeroFrameSource(idleSheet, frameIndex);
      ctx.drawImage(
        idleSheet,
        source.x,
        source.y,
        source.w,
        source.h,
        imageRect.x,
        imageRect.y,
        imageRect.w,
        imageRect.h,
      );
    } else {
      drawImageContain(
        fallbackArt,
        imageRect.x,
        imageRect.y,
        imageRect.w,
        imageRect.h,
      );
    }
    ctx.restore();
  }

  function drawRiftAura(rect, time, motionReduced) {
    const pulse = motionReduced ? 0.5 : 0.5 + Math.sin(time / 720) * 0.12;
    const centerX = rect.x + rect.w * 0.5;
    const centerY = rect.y + rect.h * 0.48;
    const aura = ctx.createRadialGradient(
      centerX,
      centerY,
      18,
      centerX,
      centerY,
      rect.w * 0.48,
    );
    aura.addColorStop(0, `rgba(139, 91, 255, ${0.17 + pulse * 0.1})`);
    aura.addColorStop(0.52, "rgba(70, 151, 255, 0.08)");
    aura.addColorStop(1, "rgba(4, 7, 17, 0)");
    ctx.save();
    ctx.fillStyle = aura;
    ctx.fillRect(rect.x + 8, rect.y + 26, rect.w - 16, rect.h - 40);
    ctx.restore();
  }

  function drawRiftPlatform(rect, time, motionReduced) {
    const pulse = motionReduced ? 0.62 : 0.62 + Math.sin(time / 600) * 0.08;
    const centerX = rect.x + rect.w * 0.5;
    const centerY = rect.y + rect.h - 19;
    ctx.save();
    ctx.fillStyle = `rgba(72, 52, 154, ${0.12 + pulse * 0.08})`;
    ctx.strokeStyle = `rgba(152, 114, 255, ${0.34 + pulse * 0.22})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, rect.w * 0.36, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = `rgba(102, 196, 255, ${0.18 + pulse * 0.14})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, rect.w * 0.25, 9, 0, 0, Math.PI * 2);
    ctx.stroke();
    for (let index = 0; index < 8; index += 1) {
      const angle = (Math.PI * 2 * index) / 8;
      const innerX = centerX + Math.cos(angle) * rect.w * 0.28;
      const innerY = centerY + Math.sin(angle) * 10;
      const outerX = centerX + Math.cos(angle) * rect.w * 0.34;
      const outerY = centerY + Math.sin(angle) * 14;
      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(outerX, outerY);
      ctx.stroke();
    }
    ctx.restore();
  }

  return {
    draw,
  };
}
