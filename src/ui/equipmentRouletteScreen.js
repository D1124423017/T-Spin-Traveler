import {
  EQUIPMENT_RARITY_ORDER,
  EQUIPMENT_WHEEL_LEVELS,
  buildEquipmentWheelSegments,
  getEquipmentDrawCost,
  getEquipmentRarityStyle,
  getEquipmentWheelLevel,
  getEquipmentWheelUpgradeCost,
} from "../data/equipment.js";
import { EQUIPMENT_ROULETTE_LAYOUT } from "./equipmentLayout.js";
import { getEquipmentMotionState } from "./equipmentMotion.js";
import {
  EQUIPMENT_RARITY_RUNES,
} from "./equipmentUiPrimitives.js";
import { drawEquipmentCanvasRotor } from "../render/equipmentCanvasRotorRenderer.js";
import {
  drawEquipmentWheelBody,
  drawEquipmentWheelPointer,
} from "../render/equipmentWheelLayerRenderer.js";
import { createEquipmentRewardRevealRenderer } from "./equipmentRewardReveal.js";
import { getEquipmentWheelPresentation } from "./equipmentWheelPresentation.js";
import {
  createEquipmentWheelGeometry,
} from "./equipmentWheelGeometry.js";

export function createEquipmentRouletteScreenRenderer({
  ctx,
  state,
  t,
  fmt,
  label,
  fitLabel,
  wrapText,
  drawImageContain,
  drawCard,
  drawMenuButton,
  equipmentIcons = {},
  equipmentRarityEmblems = {},
  equipmentRewardPanelArts = {},
  equipmentWheelLayers = {},
  equipmentWheelPointerArt,
  noaCheatHandArt,
  riftEnergyIcon,
  isImageReady,
  layout = EQUIPMENT_ROULETTE_LAYOUT,
  now = () => performance.now(),
} = {}) {
  const wheelGeometry = createEquipmentWheelGeometry(layout);
  const rewardRevealRenderer = createEquipmentRewardRevealRenderer({
    ctx,
    t,
    fitLabel,
    label,
    wrapText,
    drawImageContain,
    equipmentIcons,
    equipmentRarityEmblems,
    equipmentRewardPanelArts,
    isImageReady,
    layout,
  });

  function draw() {
    const currentTime = now();
    const equipment = state.metaProgress?.equipment || {};
    const wheel = getEquipmentWheelLevel(equipment.wheelLevel);
    const motion = getEquipmentMotionState(state.equipmentUi?.motion, currentTime);
    const revealActive = Boolean(
      motion.revealActive && state.equipmentUi?.motion?.itemId,
    );

    drawHeader(wheel);
    drawWheel(wheel, motion, currentTime);
    if (!revealActive) {
      drawStatus(wheel);
      drawControls(equipment, motion);
      drawOdds(wheel);
      drawMessage();
    }
    rewardRevealRenderer.draw(state.equipmentUi?.motion, motion, currentTime);
    drawCheatHand(motion);
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
    const presentation = getEquipmentWheelPresentation(wheel.level);
    const visualPower = wheel.visualPower;
    const pulse = 0.5 + Math.sin(currentTime * 0.0024) * 0.5;
    const layers = equipmentWheelLayers[wheel.level] || equipmentWheelLayers[1];
    const segments = buildEquipmentWheelSegments(wheel.level);

    drawWheelBackgroundGlow(visualPower);
    drawWheelBackgroundParticles(presentation, currentTime, pulse);
    drawEquipmentCanvasRotor({
      ctx,
      geometry: wheelGeometry,
      segments,
      rotation: motion.rotation,
      presentation,
      visualPower,
      currentTime,
    });
    drawRotorInterferenceUnderFrame(presentation, motion, currentTime);
    drawEquipmentWheelBody({
      ctx,
      bodyArt: layers?.body,
      isImageReady,
      geometry: wheelGeometry,
      visualPower,
    });
    drawPointerAuraUnderFrame(motion, presentation, pulse);
    drawFixedWheelPointer(visualPower);
  }

  function drawWheelBackgroundGlow(visualPower) {
    const {
      center: { x: cx, y: cy },
      radius,
    } = wheelGeometry;
    const glowRadius = radius * (0.88 + visualPower * 0.14);
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.12, cx, cy, glowRadius);
    glow.addColorStop(0, `rgba(160, 92, 255, ${0.14 + visualPower * 0.16})`);
    glow.addColorStop(0.52, `rgba(86, 126, 255, ${0.06 + visualPower * 0.08})`);
    glow.addColorStop(1, "rgba(13, 5, 35, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(cx - radius - 36, cy - radius - 36, radius * 2 + 72, radius * 2 + 72);
  }

  function drawWheelBackgroundParticles(presentation, currentTime, pulse) {
    const { cx, cy, radius } = layout.wheel;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalCompositeOperation = "lighter";
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

  function drawRotorInterferenceUnderFrame(presentation, motion, currentTime) {
    if (presentation.interferenceStrength <= 0) return;
    const {
      center: { x: cx, y: cy },
      rotorOuterRadius,
    } = wheelGeometry;
    const strength = presentation.interferenceStrength
      * (motion.active ? 1 : 0.46)
      * (0.65 + Math.sin(currentTime * 0.014) * 0.35);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.arc(0, 0, rotorOuterRadius, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = `rgba(195, 113, 255, ${0.14 + strength * 1.4})`;
    ctx.lineWidth = 1 + strength * 8;
    for (let index = 0; index < 2 + presentation.level; index += 1) {
      const start = currentTime * 0.0005 + index * 1.31;
      ctx.beginPath();
      ctx.arc(
        0,
        0,
        rotorOuterRadius * (0.72 + index * 0.035),
        start,
        start + 0.28 + strength,
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPointerAuraUnderFrame(motion, presentation, pulse) {
    const { x: cx, y: pointerY } = wheelGeometry.pointerTarget;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const auraRadius = 22 * presentation.pointerScale;
    const aura = ctx.createRadialGradient(
      cx,
      pointerY,
      0,
      cx,
      pointerY,
      auraRadius,
    );
    aura.addColorStop(
      0,
      `rgba(246, 232, 255, ${motion.active ? 0.46 + pulse * 0.26 : 0.2})`,
    );
    aura.addColorStop(0.36, "rgba(190, 117, 255, 0.18)");
    aura.addColorStop(1, "rgba(126, 73, 255, 0)");
    ctx.fillStyle = aura;
    ctx.fillRect(
      cx - auraRadius,
      pointerY - auraRadius,
      auraRadius * 2,
      auraRadius * 2,
    );
    ctx.restore();
  }

  function drawFixedWheelPointer(visualPower) {
    drawEquipmentWheelPointer({
      ctx,
      pointerArt: equipmentWheelPointerArt,
      isImageReady,
      geometry: wheelGeometry,
      visualPower,
    });
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
