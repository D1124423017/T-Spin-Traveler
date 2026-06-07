import {
  buildTagLabel as buildTagLabelForStats,
  getBuildTagMeta,
  getUpgradeTags,
} from "../combat/buildStats.js";
import { hexToRgba } from "../render/drawUtils.js";

export function createUpgradeUiPrimitives({
  ctx,
  t,
  canvasFont,
  fitLabel,
  roundedRect,
} = {}) {
  const buildTagLabel = (tag) => buildTagLabelForStats(tag, t);

function drawUpgradeTagPills(tags, x, y, maxWidth, maxTags = 2, alpha = 1, theme = null) {
  const visibleTags = getUpgradeTags({ tags }).slice(0, maxTags);
  let xx = x;
  const fontSize = theme?.tagFontSize || 9;
  const pillH = theme?.tagPillHeight || 18;
  const maxPillW = theme?.tagMaxPillWidth || 66;
  const pillGap = theme?.tagPillGap || 5;
  ctx.save();
  ctx.font = canvasFont("900", fontSize, "TAG", true);
  for (const tag of visibleTags) {
    const meta = getBuildTagMeta(tag);
    const text = buildTagLabel(tag).toUpperCase();
    const pillW = Math.min(maxPillW, Math.max(38, ctx.measureText(text).width + 18));
    if (xx + pillW > x + maxWidth) break;
    ctx.save();
    ctx.globalAlpha = alpha;
    drawUpgradePill(xx, y, pillW, pillH, text, meta.color, theme?.lightCard ? theme.tagFillAlpha : 0.16, theme);
    ctx.restore();
    xx += pillW + pillGap;
  }
  ctx.restore();
}

function drawUpgradePill(x, y, w, h, text, color, fillAlpha = 0.14, theme = null) {
  ctx.save();
  if (theme?.lightCard) {
    const fill = ctx.createLinearGradient(x, y, x, y + h);
    fill.addColorStop(0, "rgba(255, 252, 229, 0.82)");
    fill.addColorStop(1, hexToRgba(color, 0.34));
    ctx.fillStyle = fill;
  } else {
    ctx.fillStyle = hexToRgba(color, fillAlpha);
  }
  roundedRect(x, y, w, h, 7, true, false);
  ctx.strokeStyle = theme?.lightCard ? "rgba(76, 66, 32, 0.58)" : hexToRgba(color, 0.34);
  ctx.lineWidth = 1.2;
  roundedRect(x, y, w, h, 7, false, true);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  fitLabel(text, x + 8, y + h / 2 + 0.5, w - 16, theme?.tagTextSize || Math.min(10, h - 8), theme?.lightCard ? theme.tagTextColor : color, 8, "900", true);
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}

  return {
    drawUpgradePill,
    drawUpgradeTagPills,
  };
}
