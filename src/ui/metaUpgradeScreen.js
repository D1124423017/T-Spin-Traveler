import {
  META_UPGRADE_DEFS,
  getMetaUpgradeCost,
} from "../core/metaProgress.js";
import {
  canUnlockAscensionChallenge,
  getAscensionMaxLevel,
  getAscensionStageName,
  getNextAscensionChallenge,
} from "../core/ascensionChallenge.js";
import {
  OVERLAY_READABILITY,
  pointInRect,
} from "../render/drawUtils.js";
import { formatMetaUpgradeEffect } from "./formatters.js";

export function getMetaUpgradeRowRects() {
  const x = 220;
  const y = 228;
  const w = 838;
  const h = 92;
  const gap = 18;
  return {
    hp: { x, y, w, h, buyX: x + w - 142, buyY: y + 25, buyW: 112, buyH: 42 },
    attack: { x, y: y + h + gap, w, h, buyX: x + w - 142, buyY: y + h + gap + 25, buyW: 112, buyH: 42 },
    guard: { x, y: y + (h + gap) * 2, w, h, buyX: x + w - 142, buyY: y + (h + gap) * 2 + 25, buyW: 112, buyH: 42 },
  };
}

export function getMetaUpgradeBackButtonRect() {
  return { x: 812, y: 574, w: 240, h: 44 };
}

export function getMetaAscensionEntryRect() {
  return { x: 220, y: 550, w: 560, h: 72 };
}

export function createMetaUpgradeRowModels(progress = {}) {
  const rows = getMetaUpgradeRowRects();
  const maxLevel = getAscensionMaxLevel(progress);
  const riftEnergy = progress.riftEnergy || 0;
  const upgrades = progress.metaUpgrades || {};
  return Object.values(META_UPGRADE_DEFS).map((def) => {
    const level = upgrades[def.levelKey] || 0;
    const cost = getMetaUpgradeCost(def.id, level, progress);
    const maxed = level >= maxLevel;
    return {
      def,
      rect: rows[def.id],
      level,
      maxLevel,
      cost,
      maxed,
      canBuy: cost !== null && riftEnergy >= cost,
    };
  });
}

export function createMetaAscensionEntryModel(progress = {}) {
  const challenge = getNextAscensionChallenge(progress);
  const unlocked = canUnlockAscensionChallenge(progress);
  const completed = !challenge && (progress.ascensionTier || 0) > 0;
  return {
    challenge,
    unlocked,
    completed,
    statusKey: completed
      ? "metaAscensionComplete"
      : unlocked
        ? "metaAscensionReady"
        : "metaAscensionLocked",
  };
}

export function getMetaUpgradeMessageText(message, {
  format = (key) => key,
  now = 0,
} = {}) {
  if (!message?.key || now > message.until) return "";
  return format(message.key, message.vars || {});
}

export function drawMetaUpgradeScreen({
  ctx,
  progress,
  pointer,
  message,
  now,
  t,
  fmt,
  canvasFont,
  label,
  fitLabel,
  wrapText,
  roundedRect,
  drawImageContain,
  drawMainMenuScene,
  drawDimOverlay,
  drawCard,
  drawCornerGlyph,
  drawMenuButton,
  metaUpgradeIcons,
  riftEnergyIcon,
}) {
  const stageName = getAscensionStageName(progress);
  ctx.save();
  drawMainMenuScene();
  drawDimOverlay(OVERLAY_READABILITY.scrim.standard);
  drawCard(166, 68, 948, 586);
  drawCornerGlyph(640, 88, "#fff0a6");
  const upgradeTitle = t("metaUpgradeTitle").toUpperCase();
  label(upgradeTitle, 224, 136, 42, "#f5f1e6");
  ctx.font = canvasFont("900", 42, upgradeTitle, true);
  const stageX = Math.min(690, 224 + ctx.measureText(upgradeTitle).width + 34);
  ctx.strokeStyle = "rgba(255, 240, 166, 0.28)";
  ctx.beginPath();
  ctx.moveTo(stageX - 16, 113);
  ctx.lineTo(stageX - 16, 137);
  ctx.stroke();
  label(fmt("metaUpgradeStage", { stage: stageName }).toUpperCase(), stageX, 132, 14, "#fff0a6");
  wrapText(t("metaUpgradeHelp"), 224, 172, 710, 22, "rgba(238,244,252,0.68)", 15);
  drawRiftEnergyDisplay({
    ctx,
    amount: progress.riftEnergy,
    x: 822,
    y: 96,
    t,
    label,
    fitLabel,
    drawImageContain,
    riftEnergyIcon,
  });

  for (const row of createMetaUpgradeRowModels(progress)) {
    drawMetaUpgradeRow({
      ctx,
      pointer,
      row,
      t,
      fmt,
      label,
      fitLabel,
      roundedRect,
      drawImageContain,
      metaUpgradeIcons,
    });
  }
  const messageText = getMetaUpgradeMessageText(message, { format: fmt, now });
  if (messageText) fitLabel(messageText, 224, 211, 540, 14, "#fff0a6", 11, "900", true);
  drawMetaAscensionEntry({
    ctx,
    progress,
    pointer,
    t,
    fmt,
    label,
    fitLabel,
  });
  const back = getMetaUpgradeBackButtonRect();
  drawMenuButton(back.x, back.y, back.w, back.h, t("backToMenu"), "Esc");
  ctx.restore();
}

function drawRiftEnergyDisplay({
  ctx,
  amount,
  x,
  y,
  t,
  label,
  fitLabel,
  drawImageContain,
  riftEnergyIcon,
}) {
  ctx.save();
  ctx.shadowColor = "rgba(184, 141, 255, 0.48)";
  ctx.shadowBlur = 18;
  drawImageContain(riftEnergyIcon, x, y, 68, 68);
  ctx.shadowBlur = 0;
  label(t("riftEnergy").toUpperCase(), x + 78, y + 22, 11, "#d7c2ff");
  fitLabel(String(amount), x + 78, y + 55, 150, 28, "#fff0a6", 18, "900", true);
  ctx.restore();
}

function drawMetaUpgradeRow({
  ctx,
  pointer,
  row,
  t,
  fmt,
  label,
  fitLabel,
  roundedRect,
  drawImageContain,
  metaUpgradeIcons,
}) {
  const {
    def,
    rect,
    level,
    maxLevel,
    cost,
    maxed,
    canBuy,
  } = row;
  if (!def || !rect) return;
  const hovered = pointInRect(pointer.x, pointer.y, rect.x, rect.y, rect.w, rect.h);
  ctx.save();
  const fill = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  fill.addColorStop(0, hovered ? "rgba(33, 45, 67, 0.78)" : "rgba(7, 12, 21, 0.68)");
  fill.addColorStop(0.55, "rgba(32, 20, 56, 0.64)");
  fill.addColorStop(1, "rgba(7, 13, 24, 0.72)");
  ctx.fillStyle = fill;
  roundedRect(rect.x, rect.y, rect.w, rect.h, 10, true, false);
  ctx.strokeStyle = hovered ? "rgba(255, 240, 166, 0.48)" : "rgba(145, 232, 222, 0.2)";
  ctx.lineWidth = 1.5;
  roundedRect(rect.x, rect.y, rect.w, rect.h, 10, false, true);
  drawImageContain(metaUpgradeIcons[def.iconKey], rect.x + 12, rect.y + 10, 72, 72);
  fitLabel(t(def.nameKey), rect.x + 104, rect.y + 31, 190, 20, "#f5f1e6", 15, "900", true);
  label(fmt("metaUpgradeLevel", { level, max: maxLevel }), rect.x + 104, rect.y + 57, 14, "#9fb4ff");
  label(
    fmt("metaUpgradeCurrent", {
      value: formatMetaUpgradeEffect(def, level, { format: fmt }),
    }),
    rect.x + 318,
    rect.y + 33,
    14,
    "rgba(238,244,252,0.72)",
  );
  if (!maxed) {
    label(
      fmt("metaUpgradeNext", {
        value: formatMetaUpgradeEffect(def, level + 1, { format: fmt }),
      }),
      rect.x + 318,
      rect.y + 59,
      14,
      "rgba(238,244,252,0.72)",
    );
    label(fmt("metaUpgradeCost", { cost }), rect.x + 610, rect.y + 57, 13, canBuy ? "#fff0a6" : "#ffb7bd");
  }
  drawMetaUpgradeBuyButton({
    ctx,
    pointer,
    rect,
    maxed,
    canBuy,
    t,
    fitLabel,
    roundedRect,
  });
  ctx.restore();
}

function drawMetaAscensionEntry({
  ctx,
  progress,
  pointer,
  t,
  fmt,
  label,
  fitLabel,
}) {
  const rect = getMetaAscensionEntryRect();
  const model = createMetaAscensionEntryModel(progress);
  const hovered = pointInRect(pointer.x, pointer.y, rect.x, rect.y, rect.w, rect.h);
  const interactiveHover = hovered && model.unlocked;
  const requirementText = model.completed
    ? t("metaAscensionNoChallenge")
    : model.unlocked
      ? fmt("ascensionChallengeGoal", {
        seconds: model.challenge.durationSeconds,
        lines: model.challenge.targetLines,
      })
      : t("metaAscensionUnlockRequirement");
  const accent = model.unlocked
    ? "#fff0a6"
    : model.completed
      ? "#9df7da"
      : "rgba(215, 194, 255, 0.58)";
  ctx.save();
  ctx.fillStyle = interactiveHover ? "rgba(48, 31, 76, 0.58)" : "rgba(11, 15, 27, 0.34)";
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = interactiveHover ? "rgba(255, 240, 166, 0.5)" : "rgba(145, 232, 222, 0.16)";
  ctx.beginPath();
  ctx.moveTo(rect.x, rect.y);
  ctx.lineTo(rect.x + rect.w, rect.y);
  ctx.moveTo(rect.x, rect.y + rect.h);
  ctx.lineTo(rect.x + rect.w, rect.y + rect.h);
  ctx.stroke();
  label("◇", rect.x + 16, rect.y + 43, 26, accent);
  fitLabel(t("metaAscensionTitle"), rect.x + 52, rect.y + 23, 340, 16, "#f5f1e6", 13, "900", true);
  fitLabel(requirementText, rect.x + 52, rect.y + 44, 380, 12, "rgba(238,244,252,0.64)", 10, "800", true);
  fitLabel(t("metaAscensionCapRule"), rect.x + 52, rect.y + 62, 390, 11, "#9fb4ff", 9, "800", true);
  fitLabel(t(model.statusKey).toUpperCase(), rect.x + rect.w - 108, rect.y + 41, 88, 13, accent, 10, "900", true);
  ctx.restore();
}

function drawMetaUpgradeBuyButton({
  ctx,
  pointer,
  rect,
  maxed,
  canBuy,
  t,
  fitLabel,
  roundedRect,
}) {
  const hovered = pointInRect(pointer.x, pointer.y, rect.buyX, rect.buyY, rect.buyW, rect.buyH);
  ctx.save();
  ctx.fillStyle = maxed
    ? "rgba(255, 240, 166, 0.12)"
    : canBuy
      ? hovered ? "rgba(184, 141, 255, 0.36)" : "rgba(184, 141, 255, 0.22)"
      : "rgba(44, 48, 58, 0.5)";
  roundedRect(rect.buyX, rect.buyY, rect.buyW, rect.buyH, 8, true, false);
  ctx.strokeStyle = maxed
    ? "rgba(255, 240, 166, 0.36)"
    : canBuy
      ? "rgba(255, 240, 166, 0.55)"
      : "rgba(238,244,252,0.16)";
  ctx.lineWidth = 1.5;
  roundedRect(rect.buyX, rect.buyY, rect.buyW, rect.buyH, 8, false, true);
  fitLabel(
    maxed ? t("metaUpgradeMaxed") : t("metaUpgradeBuy"),
    rect.buyX + 14,
    rect.buyY + 26,
    rect.buyW - 28,
    16,
    canBuy || maxed ? "#f8f3cf" : "rgba(238,244,252,0.42)",
    12,
    "900",
    true,
  );
  ctx.restore();
}
