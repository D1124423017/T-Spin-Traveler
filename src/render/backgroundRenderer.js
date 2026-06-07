import {
  BACKGROUND_STAGES,
  BOSS_BACKGROUND_STAGE,
  isImageReady,
} from "../data/assets.js";
import { getBackgroundStageForWave } from "./backgroundStages.js";

export function drawBattleBackground({
  ctx,
  width,
  height,
  wave,
  normalEnemyCount,
  normalEnemyCyclesBeforeBoss,
  drawImageCover,
  roundedRect,
} = {}) {
  const stage = getBackgroundStageForWave(wave || 1, {
    normalEnemyCount,
    normalEnemyCyclesBeforeBoss,
    backgroundStages: BACKGROUND_STAGES,
    bossStage: BOSS_BACKGROUND_STAGE,
  });
  const image = getStageBackgroundImage(stage);
  if (image) {
    const usingFallback = image !== stage.image;
    drawImageCover(image, 0, 0, width, height);
    drawBackgroundTreatment(ctx, width, height, stage, usingFallback);
    return;
  }

  drawProceduralBackground({ ctx, width, height, roundedRect });
}

function getStageBackgroundImage(stage) {
  if (isImageReady(stage.image)) return stage.image;
  if (isImageReady(stage.fallback)) return stage.fallback;
  return null;
}

function drawBackgroundTreatment(ctx, width, height, stage, usingFallback) {
  ctx.save();
  if (stage.tint) {
    ctx.fillStyle = stage.tint;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.fillStyle = `rgba(4, 7, 12, ${usingFallback ? 0.72 : stage.dim})`;
  ctx.fillRect(0, 0, width, height);
  if (stage.centerDim && !usingFallback) {
    drawCenterBackgroundShade(ctx, width, height, stage.centerDim);
  }
  drawVignette(ctx, width, height, stage.vignette);
  ctx.restore();
}

function drawCenterBackgroundShade(ctx, width, height, alpha) {
  const g = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, 460);
  g.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
  g.addColorStop(0.52, `rgba(0, 0, 0, ${alpha * 0.38})`);
  g.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
}

function drawProceduralBackground({ ctx, width, height, roundedRect }) {
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, "#101326");
  g.addColorStop(0.46, "#12172a");
  g.addColorStop(1, "#07090f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  drawStarMapBackdrop(ctx);
  drawAncientObelisk(ctx, 96, 112, 260, 0.42);
  drawAncientObelisk(ctx, 1098, 96, 310, 0.52);
  drawAncientColumn(ctx, roundedRect, 288, 170, 236, 0.34);
  drawAncientColumn(ctx, roundedRect, 915, 154, 258, 0.4);

  ctx.fillStyle = "#0a0d15";
  ctx.beginPath();
  ctx.moveTo(0, 613);
  ctx.bezierCurveTo(240, 570, 420, 642, 660, 590);
  ctx.bezierCurveTo(900, 540, 1090, 602, 1280, 566);
  ctx.lineTo(1280, 720);
  ctx.lineTo(0, 720);
  ctx.closePath();
  ctx.fill();

  drawAncientRiftRunes(ctx, roundedRect);
  drawVignette(ctx, width, height);
}

function drawStarMapBackdrop(ctx) {
  ctx.save();
  ctx.strokeStyle = "rgba(120, 150, 255, 0.14)";
  ctx.fillStyle = "rgba(185, 210, 255, 0.28)";
  ctx.lineWidth = 1;
  const points = [
    [182, 126], [302, 86], [456, 154], [620, 106], [768, 164],
    [928, 112], [1098, 152], [1190, 92],
  ];
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  for (const [x, y] of points) {
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawAncientObelisk(ctx, x, y, h, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const w = h * 0.22;
  ctx.fillStyle = "#171323";
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w, y + h * 0.16);
  ctx.lineTo(x + w * 0.78, y + h);
  ctx.lineTo(x + w * 0.22, y + h);
  ctx.lineTo(x, y + h * 0.16);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(155, 132, 255, 0.26)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = "rgba(104, 218, 255, 0.24)";
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y + h * 0.2);
  ctx.lineTo(x + w * 0.5, y + h * 0.82);
  ctx.stroke();
  ctx.restore();
}

function drawAncientColumn(ctx, roundedRect, x, y, h, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const w = h * 0.18;
  ctx.fillStyle = "#141826";
  roundedRect(x, y, w, h, 10, true, false);
  ctx.strokeStyle = "rgba(184, 160, 112, 0.22)";
  ctx.lineWidth = 2;
  roundedRect(x, y, w, h, 10, false, true);
  ctx.fillStyle = "rgba(115, 96, 210, 0.16)";
  ctx.fillRect(x + w * 0.22, y + h * 0.18, w * 0.56, h * 0.64);
  ctx.restore();
}

function drawAncientRiftRunes(ctx, roundedRect) {
  ctx.save();
  ctx.translate(176, 520);
  ctx.fillStyle = "#28302f";
  roundedRect(-38, -86, 76, 110, 14, true, false);
  ctx.strokeStyle = "rgba(145, 160, 190, 0.28)";
  ctx.lineWidth = 3;
  ctx.strokeRect(-20, -64, 40, 58);
  ctx.fillStyle = "rgba(131, 146, 255, 0.52)";
  ctx.fillRect(-14, -42, 28, 4);
  ctx.fillRect(-3, -56, 6, 38);
  ctx.restore();
}

function drawVignette(ctx, width, height, strength = 0.78) {
  const g = ctx.createRadialGradient(width / 2, height / 2, 180, width / 2, height / 2, 720);
  g.addColorStop(0, "rgba(0, 0, 0, 0)");
  g.addColorStop(0.58, `rgba(0, 0, 0, ${strength * 0.2})`);
  g.addColorStop(1, `rgba(0, 0, 0, ${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
}
