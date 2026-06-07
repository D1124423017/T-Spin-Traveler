import {
  OVERLAY_READABILITY,
  hexToRgba,
} from "../render/drawUtils.js";
import {
  getCurrentBuildCloseRect,
  getCurrentBuildPanelRect,
} from "./upgradeCards.js";
import {
  getTraitDetailTitle as getTraitDetailTitleForPanel,
} from "./traitPanel.js";

export function createCurrentBuildPanelRenderer({
  ctx,
  t,
  fmt,
  label,
  fitLabel,
  wrapText,
  roundedRect,
  drawDimOverlay,
  drawCard,
  drawMenuButton,
  getAcquiredRelicGroups,
  getCurrentBuildFamilyStats,
  getTraitEntries,
  getTraitEffectText,
  getCurrentBuildDirectionText,
  getTraitFullCount,
  upgradeName,
  rarityLabel,
  getRarityVisual,
  primitives,
} = {}) {
  const {
    drawUpgradePill,
    drawUpgradeTagPills,
  } = primitives;

function drawCurrentBuildPanel() {
  const panel = getCurrentBuildPanelRect();
  const closeRect = getCurrentBuildCloseRect();
  const groups = getAcquiredRelicGroups();
  const stats = getCurrentBuildFamilyStats(groups);
  ctx.save();
  drawDimOverlay(OVERLAY_READABILITY.scrim.nested);
  drawCard(panel.x, panel.y, panel.w, panel.h);
  label(t("currentBuildTitle"), panel.x + 42, panel.y + 58, 32, "#f5f1e6");
  drawMenuButton(closeRect.x, closeRect.y, closeRect.w, closeRect.h, t("currentBuildClose"), "Esc");
  drawCurrentBuildSummary(stats, panel.x + 44, panel.y + 82, 460, 44);
  wrapText(getCurrentBuildDirectionText(stats), panel.x + 526, panel.y + 104, 314, 18, "rgba(238,244,252,0.62)", 12);
  label(t("currentBuildStats").toUpperCase(), panel.x + 44, panel.y + 140, 13, "#fff0a6");
  drawCurrentBuildStats(stats, panel.x + 44, panel.y + 156, panel.w - 88);
  label(t("currentBuildTraits").toUpperCase(), panel.x + 44, panel.y + 198, 13, "#fff0a6");
  drawCurrentBuildTraitDetails(getTraitEntries(groups), panel.x + 44, panel.y + 214, panel.w - 88, 58);
  label(t("currentBuildList").toUpperCase(), panel.x + 44, panel.y + 298, 13, "#8fe8dc");
  if (!groups.length) {
    drawCurrentBuildEmpty(panel.x + 44, panel.y + 322, panel.w - 88, 104);
  } else {
    drawAcquiredRelicCards(groups, panel.x + 44, panel.y + 322, panel.w - 88, panel.y + panel.h - 44);
  }
  ctx.restore();
}

function drawCurrentBuildEmpty(x, y, w, h) {
  ctx.save();
  ctx.fillStyle = OVERLAY_READABILITY.surface.fill;
  roundedRect(x, y, w, h, 10, true, false);
  ctx.strokeStyle = "rgba(126, 231, 255, 0.2)";
  roundedRect(x, y, w, h, 10, false, true);
  wrapText(t("currentBuildEmpty"), x + 22, y + 48, w - 44, 22, "rgba(238,244,252,0.74)", 16);
  ctx.restore();
}

function drawCurrentBuildSummary(stats, x, y, w, h) {
  const strongest = stats[0];
  ctx.save();
  ctx.fillStyle = OVERLAY_READABILITY.surface.fill;
  roundedRect(x, y, w, h, 9, true, false);
  ctx.strokeStyle = strongest ? hexToRgba(strongest.color, 0.34) : "rgba(126, 231, 255, 0.18)";
  roundedRect(x, y, w, h, 9, false, true);
  label(t("currentBuildStrongest").toUpperCase(), x + 16, y + 19, 11, "rgba(238,244,252,0.5)");
  const text = strongest ? `${strongest.label} x${strongest.count}` : t("currentBuildNoDirection");
  fitLabel(text, x + 16, y + 36, w - 32, 16, strongest ? strongest.color : "#8fe8dc", 11, "900", true);
  ctx.restore();
}

function drawCurrentBuildStats(stats, x, y, w) {
  if (!stats.length) {
    drawUpgradePill(x, y, 170, 24, t("currentBuildNoDirection"), "#8fe8dc", 0.1);
    return;
  }
  let xx = x;
  for (const stat of stats.slice(0, 5)) {
    const text = `${stat.label} x${stat.count}`;
    const pillW = Math.min(150, Math.max(88, ctx.measureText(text).width + 28));
    if (xx + pillW > x + w) break;
    drawUpgradePill(xx, y, pillW, 24, text.toUpperCase(), stat.color, 0.14);
    xx += pillW + 10;
  }
}

function drawCurrentBuildTraitDetails(traits, x, y, w, h) {
  const shown = traits.filter((trait) => trait.count > 0).slice(0, 4);
  if (!shown.length) {
    drawUpgradePill(x, y, 180, 24, t("traitEffectNone"), "#8fe8dc", 0.1);
    return;
  }
  const gap = 10;
  const cardW = (w - gap * 3) / 4;
  shown.forEach((trait, index) => {
    const xx = x + index * (cardW + gap);
    const active = trait.stage > 0;
    ctx.save();
    ctx.fillStyle = active ? hexToRgba(trait.color, 0.22) : OVERLAY_READABILITY.surface.fillSoft;
    roundedRect(xx, y, cardW, h, 8, true, false);
    ctx.strokeStyle = active ? hexToRgba(trait.color, 0.42) : "rgba(238,244,252,0.12)";
    roundedRect(xx, y, cardW, h, 8, false, true);
    fitLabel(getTraitDetailTitleForPanel(trait, { format: fmt, getFullCount: getTraitFullCount }), xx + 12, y + 18, cardW - 24, 12, active ? trait.color : "rgba(238,244,252,0.62)", 8, "900", true);
    fitLabel(getTraitEffectText(trait), xx + 12, y + 39, cardW - 24, 12, "rgba(238,244,252,0.62)", 8, "700");
    ctx.restore();
  });
}

function drawAcquiredRelicCards(groups, x, y, w, bottomY) {
  const columns = 3;
  const gap = 12;
  const cardW = (w - gap * (columns - 1)) / columns;
  const cardH = 66;
  const rowGap = 10;
  const maxRows = Math.max(1, Math.floor((bottomY - y - 24) / (cardH + rowGap)));
  const maxVisible = maxRows * columns;
  const visible = groups.slice(0, maxVisible);
  visible.forEach((group, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const cardX = x + col * (cardW + gap);
    const cardY = y + row * (cardH + rowGap);
    drawAcquiredRelicCard(group, cardX, cardY, cardW, cardH);
  });
  if (groups.length > visible.length) {
    label(`+${groups.length - visible.length}`, x, bottomY - 2, 14, "rgba(238,244,252,0.58)");
  }
}

function drawAcquiredRelicCard(group, x, y, w, h) {
  drawAcquiredRelicListRow(group, x, y, w, h);
}

function drawAcquiredRelicListRow(group, x, y, w, h) {
  const rarity = getRarityVisual(group.rarity);
  ctx.save();
  const cardG = ctx.createLinearGradient(x, y, x + w, y + h);
  cardG.addColorStop(0, hexToRgba(rarity.color, 0.16));
  cardG.addColorStop(1, OVERLAY_READABILITY.surface.fill);
  ctx.fillStyle = cardG;
  roundedRect(x, y, w, h, 7, true, false);
  ctx.strokeStyle = hexToRgba(rarity.border, 0.32);
  ctx.lineWidth = 1.1;
  roundedRect(x, y, w, h, 7, false, true);
  ctx.fillStyle = hexToRgba(rarity.color, 0.42);
  roundedRect(x + 5, y + 6, 4, h - 12, 3, true, false);
  const countText = group.count > 1 ? ` x${group.count}` : "";
  fitLabel(`${rarityLabel(group.rarity).toUpperCase()}${countText}`, x + 16, y + 17, Math.max(50, w - 28), 9, hexToRgba(rarity.color, 0.9), 7, "900", true);
  fitLabel(upgradeName(group.upgrade), x + 16, y + 34, w - 30, h >= 60 ? 13 : 12, rarity.titleColor, 8, "800", true);
  if (h >= 58) {
    drawUpgradeTagPills(group.tags, x + 16, y + 42, w - 32, 2, 0.56);
  } else if (group.tags?.length) {
    fitLabel(buildTagLabel(group.tags[0]).toUpperCase(), x + 16, y + h - 7, w - 32, 8, "rgba(238,244,252,0.56)", 6, "800", true);
  }
  ctx.restore();
}

  return {
    drawCurrentBuildPanel,
  };
}
