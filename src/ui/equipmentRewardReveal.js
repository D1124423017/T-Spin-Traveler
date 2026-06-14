import {
  getEquipmentById,
  getEquipmentRarityStyle,
} from "../data/equipment.js";
import {
  EQUIPMENT_RARITY_RUNES,
  hexAlpha,
} from "./equipmentUiPrimitives.js";
import { getEquipmentRewardRevealLayout } from "./equipmentWheelGeometry.js";

const TAU = Math.PI * 2;

export function createEquipmentRewardRevealRenderer({
  ctx,
  t,
  fitLabel,
  label,
  wrapText,
  drawImageContain,
  equipmentIcons = {},
  equipmentRarityEmblems = {},
  equipmentRewardPanelArts = {},
  isImageReady,
  layout,
} = {}) {
  function draw(motion, motionState, currentTime) {
    if (!motionState?.revealActive || !motion?.itemId) return;
    const item = getEquipmentById(motion.itemId);
    if (!item) return;

    const style = getEquipmentRarityStyle(item.rarity);
    const intensity = getRarityIntensity(item.rarity);
    const revealLayout = getEquipmentRewardRevealLayout(
      layout,
      motion.wheelLevel,
    );
    const progress = motionState.revealProgress;
    const reducedMotion = motion.reducedMotion === true;
    const enter = reducedMotion ? 1 : easeOutBack(Math.min(1, progress / 0.2));
    const exit = progress > 0.78 ? Math.max(0, 1 - ((progress - 0.78) / 0.22)) : 1;
    const alpha = enter * exit;
    const scale = reducedMotion ? 1 : 0.72 + enter * 0.28;
    const pulse = reducedMotion ? 0.5 : 0.5 + Math.sin(currentTime * 0.01) * 0.5;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(
      revealLayout.center.x,
      revealLayout.center.y,
    );
    ctx.scale(scale, scale);
    ctx.translate(
      -revealLayout.center.x,
      -revealLayout.center.y,
    );

    drawRiftBurst(
      revealLayout,
      style,
      intensity,
      pulse,
      currentTime,
      reducedMotion,
    );
    drawResultPanel(revealLayout, motion.wheelLevel, style, intensity);
    drawItem(revealLayout, item, style, intensity, pulse);
    if (!reducedMotion) {
      drawCrystalParticles(
        revealLayout,
        style,
        intensity,
        currentTime,
      );
    }
    ctx.restore();
  }

  function drawRiftBurst(
    revealLayout,
    style,
    intensity,
    pulse,
    currentTime,
    reducedMotion,
  ) {
    const cx = revealLayout.icon.centerX;
    const cy = revealLayout.icon.centerY;
    const radius = revealLayout.icon.w * (0.78 + intensity * 0.08) + pulse * 6;
    const glow = ctx.createRadialGradient(cx, cy, 12, cx, cy, radius);
    glow.addColorStop(0, hexAlpha(style.color, 0.52 + intensity * 0.14));
    glow.addColorStop(0.42, "rgba(128, 74, 255, 0.22)");
    glow.addColorStop(1, "rgba(16, 6, 38, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TAU);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(reducedMotion ? 0 : currentTime * 0.00035);
    ctx.strokeStyle = hexAlpha(style.color, 0.34 + intensity * 0.16);
    ctx.lineWidth = 1.5 + intensity;
    ctx.setLineDash([7, 10 - intensity * 2]);
    for (let index = 0; index < 1 + intensity; index += 1) {
      ctx.beginPath();
      ctx.arc(0, 0, 74 + index * 24, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawResultPanel(revealLayout, wheelLevel, style, intensity) {
    const safeLevel = Math.max(1, Math.min(5, Math.floor(Number(wheelLevel) || 1)));
    const panelArt = equipmentRewardPanelArts[safeLevel]
      || equipmentRewardPanelArts[1];
    if (!isImageReady(panelArt)) return;
    const { x, y, w, h } = revealLayout.rect;
    ctx.save();
    ctx.shadowColor = hexAlpha(style.color, 0.72);
    ctx.shadowBlur = 22 + intensity * 8;
    ctx.drawImage(panelArt, x, y, w, h);
    ctx.restore();
  }

  function drawItem(revealLayout, item, style, intensity, pulse) {
    const {
      icon: iconLayout,
      title,
      name,
      meta,
      effect,
      hint,
      emblem,
    } = revealLayout;
    const iconArt = equipmentIcons[item.iconAssetKey];
    const rarityEmblem = equipmentRarityEmblems[item.rarity];

    fitLabel(
      t("equipmentRewardRevealTitle"),
      title.x,
      title.y,
      title.w,
      17,
      style.titleColor,
      12,
      "900",
      true,
    );
    if (isImageReady(rarityEmblem)) {
      ctx.save();
      ctx.shadowColor = style.color;
      ctx.shadowBlur = 12 + intensity * 5;
      ctx.globalAlpha = 0.94;
      ctx.drawImage(
        rarityEmblem,
        emblem.x,
        emblem.y,
        emblem.size,
        emblem.size,
      );
      ctx.restore();
    }

    ctx.save();
    ctx.shadowColor = style.color;
    ctx.shadowBlur = 18 + intensity * 8 + pulse * 6;
    if (isImageReady(iconArt)) {
      drawImageContain(
        iconArt,
        iconLayout.x,
        iconLayout.y,
        iconLayout.w,
        iconLayout.h,
      );
    } else {
      label(
        EQUIPMENT_RARITY_RUNES[item.rarity],
        iconLayout.centerX - 22,
        iconLayout.centerY + 22,
        58,
        style.color,
      );
    }
    ctx.restore();

    fitLabel(
      t(item.nameKey),
      name.x,
      name.y,
      name.w,
      25,
      "#fff8ef",
      16,
      "900",
      true,
    );
    fitLabel(
      `${t(`equipmentRarity.${item.rarity}`)}  •  ${t(`equipmentSlot.${item.slot}`)}`,
      meta.x,
      meta.y,
      meta.w,
      14,
      style.titleColor,
      11,
      "900",
      true,
    );
    wrapText(
      t(item.effectKey),
      effect.x,
      effect.y,
      effect.w,
      18,
      "rgba(239, 242, 255, 0.84)",
      12,
    );
    if (item && intensity >= 3) {
      fitLabel(
        t("equipmentRewardFateInterference"),
        hint.x,
        hint.y,
        hint.w,
        12,
        hexAlpha(style.titleColor, 0.78),
        10,
        "800",
        true,
      );
    }
  }

  function drawCrystalParticles(revealLayout, style, intensity, currentTime) {
    const count = 6 + intensity * 5;
    const cx = revealLayout.icon.centerX;
    const cy = revealLayout.icon.centerY;
    for (let index = 0; index < count; index += 1) {
      const angle = index * 2.399 + currentTime * 0.00018 * (index % 2 ? 1 : -1);
      const orbit = revealLayout.icon.w * 0.58 + (index % 4) * 9;
      const size = 2 + (index % 3) + intensity * 0.35;
      ctx.fillStyle = index % 3
        ? hexAlpha(style.color, 0.46)
        : "rgba(126, 235, 255, 0.58)";
      const px = cx + Math.cos(angle) * orbit;
      const py = cy + Math.sin(angle) * orbit;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle + Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.72, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.72, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  return { draw };
}

function getRarityIntensity(rarity) {
  return {
    common: 1,
    rare: 2,
    relic: 3,
    legendary: 4,
  }[rarity] || 1;
}

function easeOutBack(value) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * ((value - 1) ** 3) + c1 * ((value - 1) ** 2);
}
