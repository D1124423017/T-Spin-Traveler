import {
  isImageReady,
  specialUpgradeCardFrames,
  upgradeCardFrames,
  upgradeTypeIcons,
} from "../data/assets.js";
import { RARITY } from "../data/upgrades.js";
import { getUpgradeTags } from "../combat/buildStats.js";
import { getSpecialBondPreview } from "../combat/specialUpgrades.js";
import {
  clamp,
  hexToRgba,
  pointInRect,
} from "../render/drawUtils.js";
import {
  getUpgradeCardContentLayout,
  getUpgradeDetailToggleRect,
} from "./upgradeCards.js";

export function createUpgradeCardRenderer({
  ctx,
  state,
  t,
  fmt,
  fitLabel,
  roundedRect,
  drawLimitedWrapText,
  upgradeShortText,
  upgradeName,
  getTraitChangeHintsForUpgrade,
  primitives,
} = {}) {
  const {
    drawUpgradeTagPills,
  } = primitives;

function drawUpgradeChoiceCard({
  upgrade,
  card,
  rarity,
  hovered = false,
  selected = false,
  active = false,
  specialFrame = null,
  layoutVariant = "default",
  motion = {},
  pickNumber = 1,
} = {}) {
  ctx.save();
  ctx.globalAlpha *= motion.alpha ?? 1;
  ctx.translate(card.x + card.w / 2, card.y + card.h / 2 + (motion.y || 0));
  const scale = motion.scale || 1;
  ctx.scale(scale, scale);
  const localCard = { x: -card.w / 2, y: -card.h / 2, w: card.w, h: card.h };
  const layout = getUpgradeCardContentLayout(localCard, layoutVariant);
  const accent = getUpgradeCardAccentVisual(upgrade, rarity);
  const textTheme = getUpgradeCardTextTheme(upgrade, layoutVariant, accent);
  drawUpgradeCardMotionAura(localCard, accent, motion);
  drawUpgradeCardFrame(localCard.x, localCard.y, localCard.w, localCard.h, accent, active, specialFrame);
  drawUpgradeCardReadabilityPanels(layout, accent, hovered || selected, textTheme);
  drawUpgradeTagPills(getUpgradeTags(upgrade), layout.tags.x, layout.tags.y, layout.tags.w, layout.tags.maxTags || 2, 0.92, textTheme);
  drawUpgradeDivider(layout.divider.x, layout.divider.y, layout.divider.w, textTheme.dividerColor, hovered ? 0.6 : selected ? 0.52 : 0.32);
  drawReadableUpgradeText(() => {
    drawLimitedWrapText(upgradeShortText(upgrade), layout.desc.x, layout.desc.y, layout.desc.w, layout.desc.lineH, textTheme.descColor, layout.desc.size, layout.desc.maxLines || 2, "900");
  }, textTheme.shadowBlur, textTheme.shadowColor, textTheme.shadowOffsetY);
  drawUpgradePickHint(localCard.x + 16, localCard.y + localCard.h - 28, pickNumber, accent);
  if (selected) drawUpgradeSelectionHighlight(localCard, accent);
  drawUpgradeConfirmBurst(localCard, accent, motion.confirmPulse || 0);
  ctx.restore();
}

function drawUpgradeMotionTitle(text, titleLayout, now, revealGlow = 0) {
  const pulse = 0.5 + Math.sin(now * 0.006) * 0.5;
  ctx.save();
  ctx.shadowColor = "#7ef7ff";
  ctx.shadowBlur = 8 + revealGlow * 12 + pulse * 5;
  fitLabel(text, titleLayout.x, titleLayout.y, titleLayout.w, titleLayout.size, "#f5f1e6", 24, "900", true);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.18 + pulse * 0.16;
  fitLabel(text, titleLayout.x + 2, titleLayout.y, titleLayout.w, titleLayout.size, "#fff0a6", 24, "900", true);
  ctx.globalAlpha = 0.14 + revealGlow * 0.12;
  ctx.fillStyle = "#7ef7ff";
  roundedRect(titleLayout.x, titleLayout.y + 11, Math.min(titleLayout.w, 228), 2, 1, true, false);
  ctx.restore();
}

function drawUpgradeMotionHint(text, helpLayout, now, revealGlow = 0) {
  const pulse = 0.5 + Math.sin(now * 0.005 + 1.3) * 0.5;
  ctx.save();
  ctx.shadowColor = "#8f70ff";
  ctx.shadowBlur = 6 + pulse * 5 + revealGlow * 8;
  ctx.globalAlpha = 0.68 + pulse * 0.16;
  fitLabel(text, helpLayout.x, helpLayout.y, helpLayout.w, helpLayout.size, "rgba(184, 202, 255, 0.9)", 10, "800");
  ctx.globalAlpha = 0.16 + pulse * 0.12;
  fitLabel(text, helpLayout.x + 1, helpLayout.y, helpLayout.w, helpLayout.size, "#fff0a6", 10, "800");
  ctx.restore();
}

function drawUpgradeCardFrame(x, y, w, h, rarity, hovered = false, frameOverride = null) {
  ctx.save();
  const fallbackFrame = upgradeCardFrames[rarity.tier] || upgradeCardFrames.common;
  const frame = isImageReady(frameOverride) ? frameOverride : fallbackFrame;
  if (isImageReady(frame)) {
    ctx.shadowColor = rarity.glow;
    ctx.shadowBlur = hovered ? 18 : 10;
    ctx.drawImage(frame, x, y, w, h);
    ctx.shadowBlur = 0;
    if (hovered) {
      ctx.shadowColor = rarity.glow;
      ctx.shadowBlur = 18;
      ctx.strokeStyle = hexToRgba(rarity.border, 0.72);
      ctx.lineWidth = 2.2;
      roundedRect(x - 5, y - 5, w + 10, h + 10, 13, false, true);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = hexToRgba(rarity.border, 0.42);
      ctx.lineWidth = 1.2;
      roundedRect(x + 9, y + 9, w - 18, h - 18, 10, false, true);
    }
    ctx.restore();
    return;
  }
  const glow = hovered ? 0.72 : 0.42;
  ctx.shadowColor = rarity.glow;
  ctx.shadowBlur = hovered ? 28 : 16;
  const cardG = ctx.createLinearGradient(x, y, x, y + h);
  cardG.addColorStop(0, rarity.fillTop);
  cardG.addColorStop(0.46, "rgba(12, 14, 24, 0.82)");
  cardG.addColorStop(1, rarity.fillBottom);
  ctx.fillStyle = cardG;
  roundedRect(x, y, w, h, 12, true, false);
  ctx.shadowBlur = 0;

  const inner = ctx.createLinearGradient(x, y, x + w, y + h);
  inner.addColorStop(0, hexToRgba(rarity.color, hovered ? 0.18 : 0.1));
  inner.addColorStop(0.5, "rgba(255, 255, 255, 0)");
  inner.addColorStop(1, hexToRgba(rarity.color, hovered ? 0.12 : 0.06));
  ctx.fillStyle = inner;
  roundedRect(x + 5, y + 5, w - 10, h - 10, 10, true, false);

  const aura = ctx.createRadialGradient(x + w / 2, y + 78, 8, x + w / 2, y + 78, 84);
  aura.addColorStop(0, hexToRgba(rarity.color, hovered ? 0.28 : 0.18));
  aura.addColorStop(0.46, hexToRgba(rarity.color, hovered ? 0.12 : 0.07));
  aura.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = aura;
  roundedRect(x + 8, y + 42, w - 16, 86, 10, true, false);

  ctx.strokeStyle = hexToRgba(rarity.color, hovered ? 0.24 : 0.14);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 78, 48, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 78, 34, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = hovered ? rarity.border : hexToRgba(rarity.border, glow);
  ctx.lineWidth = hovered ? rarity.lineWidth + 0.6 : rarity.lineWidth;
  roundedRect(x, y, w, h, 12, false, true);

  ctx.fillStyle = hexToRgba(rarity.color, hovered ? 0.24 : 0.14);
  roundedRect(x + 10, y + h - 8, w - 20, 3, 2, true, false);
  drawUpgradeCornerMarks(x, y, w, h, rarity.color, hovered ? 0.58 : 0.34);
  ctx.restore();
}

function drawUpgradeSelectionHighlight(card, rarity) {
  const pulse = 0.5 + Math.sin(performance.now() / 220) * 0.5;
  ctx.save();
  ctx.shadowColor = rarity.glow;
  ctx.shadowBlur = 18 + pulse * 8;
  ctx.strokeStyle = hexToRgba(rarity.border, 0.7 + pulse * 0.18);
  ctx.lineWidth = 2.6;
  roundedRect(card.x - 7, card.y - 7, card.w + 14, card.h + 14, 15, false, true);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = hexToRgba("#fff0a6", 0.28 + pulse * 0.18);
  ctx.lineWidth = 1.1;
  roundedRect(card.x + 7, card.y + 7, card.w - 14, card.h - 14, 10, false, true);
  ctx.restore();
}

function drawUpgradeCardMotionAura(card, rarity, motion = {}) {
  const glow = clamp(motion.glow || 0, 0, 1);
  if (glow <= 0.02) return;
  const pulse = 0.65 + Math.sin(performance.now() * 0.007) * 0.35;
  ctx.save();
  const baseAlpha = ctx.globalAlpha;
  ctx.globalAlpha = baseAlpha * (0.16 + glow * 0.22);
  ctx.shadowColor = rarity.glow;
  ctx.shadowBlur = 22 + glow * 18;
  ctx.strokeStyle = hexToRgba(rarity.border, 0.22 + glow * 0.24);
  ctx.lineWidth = 1.2 + glow * 1.2;
  roundedRect(card.x - 10 - pulse * 2, card.y - 10 - pulse * 2, card.w + 20 + pulse * 4, card.h + 20 + pulse * 4, 17, false, true);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = baseAlpha * (0.08 + glow * 0.12);
  const sweep = ctx.createLinearGradient(card.x, card.y, card.x + card.w, card.y + card.h);
  sweep.addColorStop(0, "rgba(255,255,255,0)");
  sweep.addColorStop(0.48, rarity.color);
  sweep.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sweep;
  roundedRect(card.x + 8, card.y + 8, card.w - 16, card.h - 16, 12, true, false);
  ctx.restore();
}

function drawUpgradeCardReadabilityPanels(layout, rarity, hovered = false, theme = null) {
  if (!layout?.panels) return;
  const panels = [
    { rect: layout.panels.title, fill: hovered ? 0.7 : 0.64, stroke: hovered ? 0.24 : 0.16, radius: 8 },
    { rect: layout.panels.tags, fill: hovered ? 0.62 : 0.56, stroke: hovered ? 0.2 : 0.12, radius: 7 },
    { rect: layout.panels.desc, fill: hovered ? 0.76 : 0.7, stroke: hovered ? 0.22 : 0.13, radius: 9 },
    { rect: layout.panels.trait, fill: hovered ? 0.68 : 0.62, stroke: hovered ? 0.24 : 0.16, radius: 9 },
  ];
  ctx.save();
  for (const panel of panels) {
    if (!panel.rect) continue;
    const { x, y, w, h } = panel.rect;
    if (theme?.lightCard) {
      const fill = ctx.createLinearGradient(x, y, x, y + h);
      fill.addColorStop(0, `rgba(255, 251, 226, ${Math.min(0.78, panel.fill + 0.04)})`);
      fill.addColorStop(1, `rgba(216, 200, 144, ${Math.min(0.72, panel.fill)})`);
      ctx.fillStyle = fill;
    } else {
      const fill = ctx.createLinearGradient(x, y, x, y + h);
      fill.addColorStop(0, `rgba(2, 5, 12, ${panel.fill})`);
      fill.addColorStop(1, `rgba(8, 12, 22, ${Math.min(0.82, panel.fill + 0.06)})`);
      ctx.fillStyle = fill;
    }
    roundedRect(x, y, w, h, panel.radius, true, false);
    ctx.strokeStyle = theme?.lightCard ? "rgba(108, 91, 39, 0.34)" : hexToRgba(rarity.border, panel.stroke);
    ctx.lineWidth = 1;
    roundedRect(x, y, w, h, panel.radius, false, true);
  }
  ctx.restore();
}

function getUpgradeCardAccentVisual(upgrade, rarity) {
  const tags = getUpgradeTags(upgrade);
  if (tags.includes("Devil")) {
    return {
      ...rarity,
      color: "#ff5b86",
      border: "#ff4f7a",
      glow: "rgba(255, 54, 96, 0.62)",
      badgeFill: "rgba(255, 54, 96, 0.22)",
      badgeText: "#ffd6df",
      lineWidth: Math.max(2.8, rarity.lineWidth || 2),
    };
  }
  if (tags.includes("Angel")) {
    return {
      ...rarity,
      color: "#dff7ff",
      border: "#f4e6b4",
      glow: "rgba(210, 247, 255, 0.56)",
      badgeFill: "rgba(244, 230, 180, 0.26)",
      badgeText: "#3b3218",
      lineWidth: Math.max(2.6, rarity.lineWidth || 2),
    };
  }
  return rarity;
}

function drawReadableUpgradeText(draw, blur = 6, shadowColor = "rgba(0, 0, 0, 0.92)", shadowOffsetY = 1) {
  ctx.save();
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetY = shadowOffsetY;
  draw();
  ctx.restore();
}

function drawUpgradeCornerMarks(x, y, w, h, color, alpha) {
  ctx.save();
  ctx.strokeStyle = hexToRgba(color, alpha);
  ctx.lineWidth = 1.4;
  const size = 16;
  const pad = 8;
  [
    [x + pad, y + pad, 1, 1],
    [x + w - pad, y + pad, -1, 1],
    [x + pad, y + h - pad, 1, -1],
    [x + w - pad, y + h - pad, -1, -1],
  ].forEach(([cx, cy, sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy + sy * size);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + sx * size, cy);
    ctx.stroke();
  });
  ctx.restore();
}

function drawRarityBadge(x, y, w, h, text, rarity) {
  ctx.save();
  ctx.fillStyle = rarity.badgeFill;
  roundedRect(x, y, w, h, 8, true, false);
  ctx.strokeStyle = hexToRgba(rarity.border, 0.52);
  ctx.lineWidth = 1.4;
  roundedRect(x, y, w, h, 8, false, true);
  fitLabel(text, x + 9, y + h / 2 + 4, w - 18, 10, rarity.badgeText, 8, "900", true);
  ctx.restore();
}

function drawUpgradePickHint(x, y, number, rarity) {
  ctx.save();
  ctx.fillStyle = "rgba(4, 7, 12, 0.34)";
  roundedRect(x, y, 22, 20, 6, true, false);
  ctx.strokeStyle = hexToRgba(rarity.border, 0.28);
  ctx.lineWidth = 1;
  roundedRect(x, y, 22, 20, 6, false, true);
  fitLabel(String(number), x + 7, y + 14, 10, 11, hexToRgba(rarity.badgeText, 0.72), 9, "800", true);
  ctx.restore();
}

function drawUpgradeDivider(x, y, w, color, alpha = 0.5) {
  ctx.save();
  ctx.strokeStyle = hexToRgba(color, alpha);
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w * 0.4, y);
  ctx.moveTo(x + w * 0.6, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  ctx.fillStyle = hexToRgba(color, alpha + 0.08);
  ctx.save();
  ctx.translate(x + w / 2, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-3, -3, 6, 6);
  ctx.restore();
  ctx.restore();
}

function getSpecialUpgradeCardFrame(upgrade) {
  return upgrade?.id ? specialUpgradeCardFrames[upgrade.id] : null;
}

function getUpgradeTraitPreview(upgrade) {
  const specialHint = getSpecialBondPreview(upgrade, state.acquiredRelics);
  if (specialHint) {
    const activated = specialHint.after > specialHint.before;
    return {
      accent: specialHint.family.color,
      glyph: activated ? "✦" : "•",
      text: activated
        ? fmt("bondHintUpgrade", { bond: t(specialHint.family.labelKey), before: specialHint.before, after: specialHint.after })
        : fmt("bondHintOwned", { bond: t(specialHint.family.labelKey), count: specialHint.after }),
      emphasis: activated,
    };
  }
  const hint = getTraitChangeHintsForUpgrade(upgrade)[0];
  if (!hint) return null;
  const isUpgrade = hint.type === "upgrade";
  const isActivate = hint.type === "activate";
  const isOvercap = hint.type === "overcap";
  const accent = isOvercap ? "#fff0a6" : isUpgrade ? "#fff0a6" : isActivate ? "#9df7da" : hint.color;
  return {
    accent,
    glyph: isOvercap ? "+" : isUpgrade ? "↑" : isActivate ? "✦" : "+",
    text: isOvercap
      ? `${t("traitOvercap")}: ${hint.label} ${fmt("traitOvercapCount", { count: hint.overcap })}`
      : hint.type === "progress"
      ? fmt(hint.stage > 0 ? "traitProgressUpgrade" : "traitProgressActivate", { tag: hint.label, remain: hint.remaining })
      : `${t(isActivate ? "traitActivated" : "traitUpgrade")}: ${hint.label} ${hint.count}/${hint.next}`,
    emphasis: isActivate || isUpgrade || isOvercap,
  };
}

function getUpgradeCardTextTheme(upgrade, layoutVariant = "default", rarity = getRarityVisual(upgrade?.rarity)) {
  const specialHint = layoutVariant === "special" ? getSpecialBondPreview(upgrade, state.acquiredRelics) : null;
  if (specialHint?.family?.key === "angel") {
    return {
      lightCard: true,
      titleColor: "#2b2412",
      dividerColor: "#8b7430",
      shadowBlur: 2,
      shadowColor: "rgba(255, 252, 229, 0.92)",
      shadowOffsetY: 0,
      tagFillAlpha: 0.72,
      tagStrokeAlpha: 0.58,
      tagTextColor: "#302914",
      tagFontSize: 11,
      tagTextSize: 10,
      tagPillHeight: 22,
      tagMaxPillWidth: 82,
      tagPillGap: 6,
      chipFillAlpha: 0.72,
      chipStrokeAlpha: 0.66,
      chipTextColor: "#302914",
      chipGlyphColor: "#4f4521",
      chipGlyphFillAlpha: 0.16,
      descColor: "#251a08",
    };
  }
  return {
    lightCard: false,
    titleColor: rarity.titleColor,
    descColor: "#fff4cf",
    dividerColor: rarity.color,
    shadowBlur: 7,
    shadowColor: "rgba(0, 0, 0, 0.92)",
    shadowOffsetY: 1,
    tagFontSize: 11,
    tagTextSize: 10,
    tagPillHeight: 22,
    tagMaxPillWidth: 82,
    tagPillGap: 6,
  };
}

function drawUpgradeTraitPreviewChip(preview, x, y, w, h, { compact = true, emphasis = preview?.emphasis, theme = null } = {}) {
  if (!preview) return;
  const accent = preview.accent;
  const glyphSize = compact ? 15 : 18;
  const glyphX = x + (compact ? 9 : 12);
  const glyphY = y + Math.max(8, h / 2 - glyphSize / 2 + 1);
  ctx.save();
  if (emphasis) {
    ctx.shadowColor = hexToRgba(accent, 0.36);
    ctx.shadowBlur = theme?.lightCard ? 4 : compact ? 10 : 13;
  }
  if (theme?.lightCard) {
    const fill = ctx.createLinearGradient(x, y, x + w, y + h);
    fill.addColorStop(0, "rgba(255, 250, 221, 0.78)");
    fill.addColorStop(1, "rgba(202, 185, 121, 0.6)");
    ctx.fillStyle = fill;
  } else {
    ctx.fillStyle = hexToRgba(accent, emphasis ? 0.24 : 0.15);
  }
  roundedRect(x, y, w, h, compact ? 8 : 10, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = theme?.lightCard ? "rgba(80, 68, 30, 0.62)" : hexToRgba(accent, emphasis ? 0.58 : 0.34);
  ctx.lineWidth = emphasis ? 1.3 : 1;
  roundedRect(x, y, w, h, compact ? 8 : 10, false, true);
  ctx.fillStyle = theme?.lightCard ? "rgba(66, 58, 27, 0.12)" : hexToRgba(accent, emphasis ? 0.34 : 0.22);
  roundedRect(glyphX, glyphY, glyphSize, glyphSize, compact ? 5 : 6, true, false);
  fitLabel(preview.glyph, glyphX + 3, glyphY + glyphSize - 4, glyphSize - 6, compact ? 11 : 13, theme?.lightCard ? theme.chipGlyphColor : accent, 8, "900", true);
  fitLabel(
    preview.text,
    glyphX + glyphSize + 8,
    y + h / 2 + 5,
    w - glyphSize - 26,
    compact ? 11 : 12,
    theme?.lightCard ? theme.chipTextColor : emphasis ? "#f5f1e6" : hexToRgba(accent, 0.84),
    compact ? 8 : 9,
    "900",
    true,
  );
  ctx.restore();
}

function drawUpgradeTraitHint(upgrade, card, layoutVariant = "default", theme = null) {
  const preview = getUpgradeTraitPreview(upgrade);
  if (!preview) return;
  const layout = getUpgradeCardContentLayout(card, layoutVariant).trait;
  const { x, y, w, h } = layout;
  drawUpgradeTraitPreviewChip(preview, x, y, w, h, { compact: true, theme });
}

const UPGRADE_DETAIL_ICON_TAG_PRIORITY = Object.freeze([
  "Perfect",
  "Combo",
  "Spin",
  "Defense",
  "Survival",
  "Garbage",
  "B2B",
  "Boss Killer",
  "Burst",
  "Utility",
  "Devil",
  "Angel",
]);

const UPGRADE_DETAIL_ICON_BY_TAG = Object.freeze({
  Perfect: "rift",
  Combo: "combo",
  Spin: "spin",
  Defense: "defense",
  Survival: "survival",
  Garbage: "garbage",
  B2B: "attack",
  "Boss Killer": "attack",
  Burst: "attack",
  Utility: "rift",
  Devil: "attack",
  Angel: "rift",
});

function getUpgradeDetailIconAsset(upgrade) {
  const tags = getUpgradeTags(upgrade);
  const tag = UPGRADE_DETAIL_ICON_TAG_PRIORITY.find((entry) => tags.includes(entry));
  return upgradeTypeIcons[UPGRADE_DETAIL_ICON_BY_TAG[tag]] || upgradeTypeIcons.rift;
}

function drawUpgradeDetailTypeIcon(upgrade, x, y, size, rarity) {
  const icon = getUpgradeDetailIconAsset(upgrade);
  if (!isImageReady(icon)) return 0;
  ctx.save();
  ctx.shadowColor = rarity.glow;
  ctx.shadowBlur = 9;
  ctx.fillStyle = hexToRgba(rarity.color, 0.18);
  roundedRect(x - 3, y - 3, size + 6, size + 6, 9, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = hexToRgba(rarity.border, 0.28);
  ctx.lineWidth = 1;
  roundedRect(x - 3, y - 3, size + 6, size + 6, 9, false, true);
  ctx.globalAlpha = 0.96;
  ctx.drawImage(icon, x, y, size, size);
  ctx.restore();
  return size + 10;
}

function drawUpgradeSelectedDetail(upgrade, rect, rarity, motion = {}, {
  expanded = false,
  toggleRect = getUpgradeDetailToggleRect(),
} = {}) {
  const preview = getUpgradeTraitPreview(upgrade);
  const { x, y, w, h } = rect;
  const toggleHovered = pointInRect(state.pointer.x, state.pointer.y, toggleRect.x, toggleRect.y, toggleRect.w, toggleRect.h);
  ctx.save();
  ctx.globalAlpha *= motion.alpha ?? 1;
  ctx.translate(0, motion.y || 0);
  ctx.shadowColor = rarity.glow;
  ctx.shadowBlur = 12 + Math.max(0, motion.glow || 0) * 18;
  const fill = ctx.createLinearGradient(x, y, x + w, y + h);
  fill.addColorStop(0, "rgba(3, 8, 18, 0.82)");
  fill.addColorStop(0.52, hexToRgba(rarity.color, 0.2));
  fill.addColorStop(1, "rgba(7, 5, 18, 0.82)");
  ctx.fillStyle = fill;
  roundedRect(x, y, w, h, 12, true, false);
  ctx.shadowBlur = 0;
  drawUpgradeDetailShimmer(rect, rarity, motion.shimmer || 0);
  ctx.strokeStyle = hexToRgba(rarity.border, 0.42);
  ctx.lineWidth = 1.3;
  roundedRect(x, y, w, h, 12, false, true);
  ctx.fillStyle = hexToRgba(rarity.color, 0.28);
  roundedRect(x + 13, y + 12, 3, h - 24, 2, true, false);
  const iconSize = 54;
  const iconX = x + 24;
  const iconY = y + 17;
  const textX = x + 94;
  fitLabel(t("selectedUpgrade"), textX, y + 21, 194, 11, "rgba(143,232,220,0.78)", 8, "900", true);
  drawUpgradeDetailTypeIcon(upgrade, iconX, iconY, iconSize, rarity);
  drawReadableUpgradeText(() => {
    fitLabel(upgradeName(upgrade), textX, y + 47, 194, 19, rarity.titleColor, 12, "900", true);
  }, 5);
  if (preview) drawUpgradeTraitPreviewChip(preview, textX, y + 57, 188, 22, { compact: true, emphasis: false });
  const descX = x + 308;
  const descW = Math.max(160, toggleRect.x - descX - 18);
  const detailText = expanded ? upgradeText(upgrade) : upgradeShortText(upgrade);
  drawReadableUpgradeText(() => {
    drawLimitedWrapText(detailText, descX, y + 27, descW, 16, "#fff4cf", expanded ? 13 : 14, expanded ? 3 : 2, "900");
  }, 4);
  drawUpgradeDetailToggleButton(toggleRect, rarity, expanded, toggleHovered);
  ctx.restore();
}

function drawUpgradeDetailToggleButton(rect, rarity, expanded, hovered = false) {
  const pulse = 0.5 + Math.sin(performance.now() * 0.006 + 0.4) * 0.5;
  ctx.save();
  ctx.shadowColor = rarity.glow;
  ctx.shadowBlur = hovered ? 16 : 7 + pulse * 4;
  ctx.fillStyle = hovered ? hexToRgba(rarity.color, 0.28) : "rgba(8, 13, 24, 0.76)";
  roundedRect(rect.x, rect.y, rect.w, rect.h, 10, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = hovered ? hexToRgba("#fff0a6", 0.72) : hexToRgba(rarity.border, 0.46 + pulse * 0.14);
  ctx.lineWidth = hovered ? 1.8 : 1.2;
  roundedRect(rect.x, rect.y, rect.w, rect.h, 10, false, true);
  fitLabel(t(expanded ? "upgradeDetailClose" : "upgradeDetailOpen"), rect.x + 17, rect.y + 22, rect.w - 34, 14, hovered ? "#fff0a6" : "rgba(246,250,255,0.86)", 10, "900", true);
  ctx.restore();
}

function drawUpgradeDetailShimmer(rect, rarity, shimmer) {
  const progress = clamp(shimmer, 0, 1);
  if (progress <= 0 || progress >= 1) return;
  const { x, y, w, h } = rect;
  const stripeX = x + w * (progress * 1.25 - 0.18);
  const alpha = 0.12 * (1 - Math.abs(progress - 0.52) * 1.6);
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  const beam = ctx.createLinearGradient(stripeX - 42, y, stripeX + 42, y + h);
  beam.addColorStop(0, "rgba(255,255,255,0)");
  beam.addColorStop(0.5, rarity.color);
  beam.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = beam;
  roundedRect(x + 6, y + 6, w - 12, h - 12, 10, true, false);
  ctx.restore();
}

function drawUpgradeConfirmBurst(card, rarity, pulse = 0) {
  if (pulse <= 0.01) return;
  ctx.save();
  ctx.shadowColor = rarity.glow;
  ctx.shadowBlur = 16 + pulse * 12;
  ctx.strokeStyle = hexToRgba(rarity.border, 0.58 + pulse * 0.26);
  ctx.lineWidth = 2.4 + pulse * 1.4;
  roundedRect(card.x - 8, card.y - 8, card.w + 16, card.h + 16, 15, false, true);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = hexToRgba(rarity.color, 0.32 + pulse * 0.2);
  ctx.lineWidth = 1.2;
  roundedRect(card.x + 8, card.y + 8, card.w - 16, card.h - 16, 10, false, true);
  ctx.restore();
}

function getRarityVisual(rarity) {
  const key = rarity === "boss" || rarity === "special" ? "legendary" : rarity;
  return RARITY[key] || RARITY.common;
}

  return {
    drawUpgradeChoiceCard,
    drawUpgradeMotionHint,
    drawUpgradeMotionTitle,
    drawUpgradeSelectedDetail,
    getRarityVisual,
    getUpgradeCardAccentVisual,
    getSpecialUpgradeCardFrame,
  };
}
