import {
  EQUIPMENT_RARITY_ORDER,
  EQUIPMENT_WHEEL_LEVELS,
  EQUIPMENT_WHEEL_SEGMENT_COUNT,
  buildEquipmentWheelSegments,
  getEquipmentDrawCost,
  getEquipmentById,
  getEquipmentRarityStyle,
  getEquipmentWheelLevel,
  getEquipmentWheelUpgradeCost,
} from "../data/equipment.js";
import { EQUIPMENT_ROULETTE_LAYOUT } from "./equipmentLayout.js";
import { getEquipmentMotionState } from "./equipmentMotion.js";
import {
  EQUIPMENT_RARITY_RUNES,
  hexAlpha,
} from "./equipmentUiPrimitives.js";
import { createEquipmentRewardRevealRenderer } from "./equipmentRewardReveal.js";
import { getEquipmentWheelPresentation } from "./equipmentWheelPresentation.js";

const TAU = Math.PI * 2;

export function createEquipmentRouletteScreenRenderer({
  ctx,
  state,
  t,
  fmt,
  canvasFont,
  label,
  fitLabel,
  wrapText,
  drawImageContain,
  drawCard,
  drawMenuButton,
  equipmentIcons = {},
  equipmentWheelArt,
  noaCheatHandArt,
  riftEnergyIcon,
  isImageReady,
  layout = EQUIPMENT_ROULETTE_LAYOUT,
  now = () => performance.now(),
} = {}) {
  const rewardRevealRenderer = createEquipmentRewardRevealRenderer({
    ctx,
    t,
    fitLabel,
    label,
    drawImageContain,
    equipmentIcons,
    isImageReady,
  });

  function draw() {
    const currentTime = now();
    const equipment = state.metaProgress?.equipment || {};
    const wheel = getEquipmentWheelLevel(equipment.wheelLevel);
    const motion = getEquipmentMotionState(state.equipmentUi?.motion, currentTime);

    drawHeader(wheel);
    drawWheel(wheel, motion, currentTime);
    drawStatus(wheel);
    drawControls(equipment, motion);
    drawRecentResult(equipment);
    drawOdds(wheel);
    drawMessage();
    drawCheatHand(motion);
    rewardRevealRenderer.draw(state.equipmentUi?.motion, motion, currentTime);
  }

  function drawHeader(wheel) {
    label(t("equipmentRouletteTitle"), layout.title.x, layout.title.y + 35, 36, "#f7f0ff");
    label(
      fmt("equipmentWheelLevelLabel", {
        level: wheel.level,
        name: t(wheel.nameKey),
      }),
      layout.title.x,
      layout.title.y + 57,
      13,
      "#cbb5ff",
    );
    const back = layout.backButton;
    drawMenuButton(back.x, back.y, back.w, back.h, t("equipmentReturnToInventory"), "");
  }

  function drawWheel(wheel, motion, currentTime) {
    const { cx, cy, radius } = layout.wheel;
    const presentation = getEquipmentWheelPresentation(wheel.level);
    const visualPower = wheel.visualPower;
    const pulse = 0.5 + Math.sin(currentTime * 0.0024) * 0.5;
    const glowRadius = radius * (0.88 + visualPower * 0.14);
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.12, cx, cy, glowRadius);
    glow.addColorStop(0, `rgba(160, 92, 255, ${0.14 + visualPower * 0.16})`);
    glow.addColorStop(0.52, `rgba(86, 126, 255, ${0.06 + visualPower * 0.08})`);
    glow.addColorStop(1, "rgba(13, 5, 35, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(cx - radius - 36, cy - radius - 36, radius * 2 + 72, radius * 2 + 72);

    drawWheelEnergyRings(wheel, presentation, currentTime, pulse);
    drawWheelSegments(wheel, motion.rotation);

    if (isImageReady(equipmentWheelArt)) {
      ctx.save();
      ctx.shadowColor = `rgba(156, 96, 255, ${0.36 + visualPower * 0.3})`;
      ctx.shadowBlur = 16 + visualPower * 18;
      ctx.drawImage(
        equipmentWheelArt,
        layout.wheelImage.x,
        layout.wheelImage.y,
        layout.wheelImage.w,
        layout.wheelImage.h,
      );
      ctx.restore();
    }

    drawWheelCore(wheel, presentation, currentTime, pulse);
    drawWheelInterference(presentation, motion, currentTime);
    drawPointerFlash(motion, presentation, pulse);
  }

  function drawWheelSegments(wheel, rotation) {
    const { cx, cy, radius } = layout.wheel;
    const segments = buildEquipmentWheelSegments(wheel.level);
    const step = TAU / EQUIPMENT_WHEEL_SEGMENT_COUNT;
    const outerRadius = radius * 0.79;
    const innerRadius = radius * 0.34;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    for (const segment of segments) {
      const start = -Math.PI / 2 + segment.index * step + 0.006;
      const end = start + step - 0.012;
      const style = getEquipmentRarityStyle(segment.rarity);
      ctx.beginPath();
      ctx.arc(0, 0, outerRadius, start, end);
      ctx.arc(0, 0, innerRadius, end, start, true);
      ctx.closePath();
      ctx.fillStyle = hexAlpha(style.color, 0.18 + wheel.visualPower * 0.12);
      ctx.fill();
      ctx.strokeStyle = hexAlpha(style.color, 0.28 + wheel.visualPower * 0.2);
      ctx.lineWidth = 1.2;
      ctx.stroke();

      const angle = start + step * 0.5;
      const runeRadius = radius * 0.61;
      ctx.save();
      ctx.translate(Math.cos(angle) * runeRadius, Math.sin(angle) * runeRadius);
      ctx.rotate(angle + Math.PI / 2);
      ctx.font = canvasFont(
        "900",
        17,
        EQUIPMENT_RARITY_RUNES[segment.rarity],
        true,
      );
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = style.color;
      ctx.shadowBlur = 8 + wheel.visualPower * 8;
      ctx.fillStyle = hexAlpha(style.titleColor, 0.82);
      ctx.fillText(EQUIPMENT_RARITY_RUNES[segment.rarity], 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  function drawWheelEnergyRings(wheel, presentation, currentTime, pulse) {
    const { cx, cy, radius } = layout.wheel;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalCompositeOperation = "lighter";
    for (let index = 0; index < presentation.ringCount; index += 1) {
      const phase = currentTime
        * (0.00014 + index * 0.00003)
        * (index % 2 ? -1 : 1);
      ctx.rotate(phase);
      ctx.strokeStyle = index % 2
        ? `rgba(113, 224, 255, ${0.07 + wheel.visualPower * 0.05})`
        : `rgba(180, 115, 255, ${0.09 + wheel.visualPower * 0.07})`;
      ctx.lineWidth = 1 + index * 0.2;
      ctx.setLineDash([4 + index * 2, 12 - Math.min(6, index)]);
      ctx.beginPath();
      ctx.arc(0, 0, radius * (0.82 + index * 0.045), 0, TAU);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    for (let index = 0; index < presentation.particleCount; index += 1) {
      const angle = currentTime * 0.0003 * (index % 2 ? 1 : -1) + index * 2.17;
      const orbit = radius * (0.86 + (index % 3) * 0.055);
      ctx.globalAlpha = 0.16 + pulse * 0.18;
      ctx.fillStyle = index % 3 ? "#b987ff" : "#7feeff";
      ctx.fillRect(
        Math.cos(angle) * orbit - 1.5,
        Math.sin(angle) * orbit - 1.5,
        3,
        3,
      );
    }
    ctx.restore();
  }

  function drawWheelCore(wheel, presentation, currentTime, pulse) {
    const { cx, cy, radius } = layout.wheel;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalCompositeOperation = "lighter";
    for (let layer = 0; layer < presentation.coreLayers; layer += 1) {
      const direction = layer % 2 ? -1 : 1;
      ctx.save();
      ctx.rotate(currentTime * 0.00024 * direction + layer * 0.42);
      ctx.strokeStyle = layer % 2
        ? `rgba(116, 230, 255, ${0.12 + presentation.glowStrength * 0.12})`
        : `rgba(203, 153, 255, ${0.14 + presentation.glowStrength * 0.14})`;
      ctx.lineWidth = 1.2 + layer * 0.34;
      ctx.setLineDash([5 + layer * 2, 9]);
      ctx.beginPath();
      ctx.arc(0, 0, radius * (0.12 + layer * 0.026), 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(222, 196, 255, ${0.18 + pulse * presentation.shimmerStrength * 0.3})`;
    ctx.shadowColor = "#b86fff";
    ctx.shadowBlur = 10 + presentation.glowStrength * 18;
    ctx.beginPath();
    ctx.arc(0, 0, 4 + wheel.level * 1.5, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawWheelInterference(presentation, motion, currentTime) {
    if (presentation.interferenceStrength <= 0) return;
    const { cx, cy, radius } = layout.wheel;
    const strength = presentation.interferenceStrength
      * (motion.active ? 1 : 0.46)
      * (0.65 + Math.sin(currentTime * 0.014) * 0.35);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = `rgba(195, 113, 255, ${0.14 + strength * 1.4})`;
    ctx.lineWidth = 1 + strength * 8;
    for (let index = 0; index < 2 + presentation.level; index += 1) {
      const start = currentTime * 0.0005 + index * 1.31;
      ctx.beginPath();
      ctx.arc(0, 0, radius * (0.72 + index * 0.035), start, start + 0.28 + strength);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPointerFlash(motion, presentation, pulse) {
    const { cx, cy, radius } = layout.wheel;
    const scale = presentation.pointerScale;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowColor = "#d8b6ff";
    ctx.shadowBlur = motion.active ? 24 : 12;
    ctx.fillStyle = `rgba(238, 219, 255, ${motion.active ? 0.34 + pulse * 0.24 : 0.18})`;
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius + 16);
    ctx.lineTo(cx - 15 * scale, cy - radius + 16 + 36 * scale);
    ctx.lineTo(cx + 15 * scale, cy - radius + 16 + 36 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawStatus(wheel) {
    const rect = layout.status;
    drawCard(rect.x, rect.y, rect.w, rect.h);
    label(t("equipmentCurrentWheel"), rect.x + 18, rect.y + 27, 12, "#a9dff8");
    fitLabel(
      t(wheel.nameKey),
      rect.x + 18,
      rect.y + 61,
      280,
      24,
      "#f5f1e6",
      15,
      "900",
      true,
    );
    drawImageContain(riftEnergyIcon, rect.x + 388, rect.y + 17, 68, 68);
    label(t("riftEnergy"), rect.x + 462, rect.y + 36, 11, "#d3c1ff");
    fitLabel(
      String(state.metaProgress?.riftEnergy || 0),
      rect.x + 462,
      rect.y + 68,
      72,
      22,
      "#fff0a6",
      14,
      "900",
      true,
    );
  }

  function drawControls(equipment, motion) {
    const drawRect = layout.drawButton;
    const upgradeRect = layout.upgradeButton;
    const maxed = equipment.wheelLevel >= EQUIPMENT_WHEEL_LEVELS.length;
    const drawCost = getEquipmentDrawCost(equipment);
    const upgradeCost = getEquipmentWheelUpgradeCost(equipment.wheelLevel);
    const canUpgrade = !maxed
      && (state.metaProgress?.riftEnergy || 0) >= upgradeCost;
    const canDraw = (state.metaProgress?.riftEnergy || 0) >= drawCost;
    drawMenuButton(
      drawRect.x,
      drawRect.y,
      drawRect.w,
      drawRect.h,
      motion.active ? t("equipmentWheelSpinning") : t("equipmentDraw"),
      "",
      canDraw ? "primary" : "muted",
    );
    drawMenuButton(
      upgradeRect.x,
      upgradeRect.y,
      upgradeRect.w,
      upgradeRect.h,
      maxed ? t("equipmentWheelMaxed") : t("equipmentUpgradeWheel"),
      "",
      canUpgrade ? "secondary" : "muted",
    );
    fitLabel(
      fmt("equipmentDrawCost", { cost: drawCost }),
      drawRect.x + 14,
      drawRect.y + drawRect.h + 15,
      drawRect.w - 28,
      11,
      canDraw ? "rgba(255, 240, 166, 0.74)" : "rgba(225, 232, 255, 0.46)",
      9,
      "800",
    );
    if (!maxed) {
      fitLabel(
        fmt("equipmentUpgradeCost", { cost: upgradeCost }),
        upgradeRect.x + 14,
        upgradeRect.y + upgradeRect.h + 15,
        upgradeRect.w - 28,
        11,
        canUpgrade ? "rgba(158, 223, 248, 0.74)" : "rgba(225, 232, 255, 0.46)",
        9,
        "800",
      );
    }
  }

  function drawRecentResult(equipment) {
    const rect = layout.recent;
    drawCard(rect.x, rect.y, rect.w, rect.h);
    const item = getEquipmentById(equipment.recentDrop);
    label(t("equipmentRecentResult"), rect.x + 18, rect.y + 27, 11, "#9edff8");
    if (!item) {
      label(
        t("equipmentNoRecentResult"),
        rect.x + 18,
        rect.y + 66,
        15,
        "rgba(235,240,252,0.5)",
      );
      return;
    }
    const style = getEquipmentRarityStyle(item.rarity);
    drawEquipmentIcon(item, rect.x + 16, rect.y + 38, 70, 70);
    fitLabel(
      t(item.nameKey),
      rect.x + 98,
      rect.y + 62,
      rect.w - 118,
      20,
      style.titleColor,
      12,
      "900",
      true,
    );
    wrapText(
      t(item.effectKey),
      rect.x + 98,
      rect.y + 88,
      rect.w - 118,
      18,
      "rgba(240,244,255,0.72)",
      12,
    );
  }

  function drawOdds(wheel) {
    const rect = layout.odds;
    drawCard(rect.x, rect.y, rect.w, rect.h);
    label(t("equipmentOddsTitle"), rect.x + 18, rect.y + 27, 11, "#9edff8");
    const columnWidth = (rect.w - 36) / EQUIPMENT_RARITY_ORDER.length;
    EQUIPMENT_RARITY_ORDER.forEach((rarity, index) => {
      const style = getEquipmentRarityStyle(rarity);
      const x = rect.x + 18 + index * columnWidth;
      label(EQUIPMENT_RARITY_RUNES[rarity], x, rect.y + 61, 20, style.color);
      fitLabel(
        t(`equipmentRarity.${rarity}`),
        x + 26,
        rect.y + 58,
        columnWidth - 30,
        11,
        style.titleColor,
        8,
        "900",
        true,
      );
      label(`${wheel.weights[rarity]}%`, x + 26, rect.y + 84, 13, "#f4f0ff");
    });
    fitLabel(
      t("equipmentDrawPricingHint"),
      rect.x + 18,
      rect.y + rect.h - 10,
      rect.w - 36,
      10,
      "rgba(229,220,255,0.64)",
      8,
      "800",
    );
  }

  function drawMessage() {
    const message = state.equipmentUi?.message;
    if (message?.key && now() <= message.until) {
      fitLabel(
        fmt(message.key, message.vars || {}),
        layout.message.x,
        layout.message.y,
        layout.message.w,
        13,
        "#f0dcff",
        10,
        "900",
        true,
      );
    }
    fitLabel(
      t("equipmentRouletteControlsHint"),
      layout.controlsHint.x,
      layout.controlsHint.y,
      layout.controlsHint.w,
      11,
      "rgba(225,232,255,0.68)",
      9,
      "800",
    );
  }

  function drawCheatHand(motion) {
    if (motion.cheatProgress <= 0 || !isImageReady(noaCheatHandArt)) return;
    const progress = motion.cheatProgress;
    const x = -350 + progress * 280;
    const y = 176;
    ctx.save();
    ctx.globalAlpha = Math.min(1, progress * 1.15);
    ctx.shadowColor = "rgba(166, 102, 255, 0.66)";
    ctx.shadowBlur = 24;
    ctx.drawImage(noaCheatHandArt, x, y, 470, 254);
    ctx.restore();
    label(t("equipmentNoaCheat"), 78, 586, 13, "#e5d4ff");
  }

  function drawEquipmentIcon(item, x, y, w, h) {
    const icon = equipmentIcons[item.iconAssetKey];
    if (isImageReady(icon)) {
      ctx.save();
      ctx.shadowColor = getEquipmentRarityStyle(item.rarity).color;
      ctx.shadowBlur = 10;
      drawImageContain(icon, x, y, w, h);
      ctx.restore();
      return;
    }
    label(
      EQUIPMENT_RARITY_RUNES[item.rarity],
      x + w * 0.34,
      y + h * 0.68,
      Math.max(18, w * 0.48),
      getEquipmentRarityStyle(item.rarity).color,
    );
  }

  return {
    draw,
  };
}
