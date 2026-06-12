import {
  getEquipmentById,
  getEquipmentRarityStyle,
} from "../data/equipment.js";
import {
  EQUIPMENT_RARITY_RUNES,
  hexAlpha,
} from "./equipmentUiPrimitives.js";

const TAU = Math.PI * 2;
const REVEAL_RECT = Object.freeze({ x: 118, y: 222, w: 448, h: 286 });

export function createEquipmentRewardRevealRenderer({
  ctx,
  t,
  fitLabel,
  label,
  drawImageContain,
  equipmentIcons = {},
  isImageReady,
} = {}) {
  function draw(motion, motionState, currentTime) {
    if (!motionState?.revealActive || !motion?.itemId) return;
    const item = getEquipmentById(motion.itemId);
    if (!item) return;

    const style = getEquipmentRarityStyle(item.rarity);
    const intensity = getRarityIntensity(item.rarity);
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
      REVEAL_RECT.x + REVEAL_RECT.w / 2,
      REVEAL_RECT.y + REVEAL_RECT.h / 2,
    );
    ctx.scale(scale, scale);
    ctx.translate(
      -(REVEAL_RECT.x + REVEAL_RECT.w / 2),
      -(REVEAL_RECT.y + REVEAL_RECT.h / 2),
    );

    drawRiftBurst(style, intensity, pulse, currentTime, reducedMotion);
    drawResultPanel(style, intensity);
    drawItem(item, style, intensity, pulse);
    if (!reducedMotion) drawCrystalParticles(style, intensity, currentTime);
    ctx.restore();
  }

  function drawRiftBurst(style, intensity, pulse, currentTime, reducedMotion) {
    const cx = REVEAL_RECT.x + REVEAL_RECT.w / 2;
    const cy = REVEAL_RECT.y + REVEAL_RECT.h / 2;
    const radius = 128 + intensity * 15 + pulse * 8;
    const glow = ctx.createRadialGradient(cx, cy, 12, cx, cy, radius);
    glow.addColorStop(0, hexAlpha(style.color, 0.52 + intensity * 0.14));
    glow.addColorStop(0.42, "rgba(128, 74, 255, 0.22)");
    glow.addColorStop(1, "rgba(16, 6, 38, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

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

  function drawResultPanel(style, intensity) {
    const { x, y, w, h } = REVEAL_RECT;
    const inset = 18;
    const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
    gradient.addColorStop(0, "rgba(11, 12, 29, 0.96)");
    gradient.addColorStop(0.48, hexAlpha(style.color, 0.18 + intensity * 0.04));
    gradient.addColorStop(1, "rgba(6, 8, 21, 0.97)");

    ctx.beginPath();
    ctx.moveTo(x + 34, y);
    ctx.lineTo(x + w - 34, y);
    ctx.lineTo(x + w, y + 28);
    ctx.lineTo(x + w, y + h - 28);
    ctx.lineTo(x + w - 34, y + h);
    ctx.lineTo(x + 34, y + h);
    ctx.lineTo(x, y + h - 28);
    ctx.lineTo(x, y + 28);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.shadowColor = hexAlpha(style.color, 0.72);
    ctx.shadowBlur = 22 + intensity * 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = hexAlpha(style.titleColor, 0.62 + intensity * 0.08);
    ctx.lineWidth = 1.5 + intensity * 0.55;
    ctx.stroke();

    ctx.strokeStyle = "rgba(196, 152, 255, 0.28)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + inset, y + inset, w - inset * 2, h - inset * 2);
  }

  function drawItem(item, style, intensity, pulse) {
    const { x, y, w } = REVEAL_RECT;
    const iconX = x + 34;
    const iconY = y + 72;
    const iconSize = 134;
    const icon = equipmentIcons[item.iconAssetKey];

    label(t("equipmentRewardRevealTitle"), x + 34, y + 40, 15, style.titleColor);
    label(EQUIPMENT_RARITY_RUNES[item.rarity], x + w - 48, y + 42, 25, style.color);

    ctx.save();
    ctx.shadowColor = style.color;
    ctx.shadowBlur = 18 + intensity * 8 + pulse * 6;
    if (isImageReady(icon)) {
      drawImageContain(icon, iconX, iconY, iconSize, iconSize);
    } else {
      label(
        EQUIPMENT_RARITY_RUNES[item.rarity],
        iconX + 42,
        iconY + 92,
        58,
        style.color,
      );
    }
    ctx.restore();

    fitLabel(
      t(item.nameKey),
      x + 188,
      y + 104,
      w - 220,
      23,
      "#fff8ef",
      15,
      "900",
      true,
    );
    fitLabel(
      `${t(`equipmentRarity.${item.rarity}`)}  •  ${t(`equipmentSlot.${item.slot}`)}`,
      x + 188,
      y + 137,
      w - 220,
      13,
      style.titleColor,
      10,
      "900",
      true,
    );
    fitLabel(
      t(item.effectKey),
      x + 188,
      y + 174,
      w - 220,
      13,
      "rgba(239, 242, 255, 0.84)",
      10,
      "800",
    );
    if (item && intensity >= 3) {
      fitLabel(
        t("equipmentRewardFateInterference"),
        x + 188,
        y + 211,
        w - 220,
        11,
        hexAlpha(style.titleColor, 0.78),
        9,
        "800",
        true,
      );
    }
  }

  function drawCrystalParticles(style, intensity, currentTime) {
    const count = 6 + intensity * 5;
    const cx = REVEAL_RECT.x + REVEAL_RECT.w / 2;
    const cy = REVEAL_RECT.y + REVEAL_RECT.h / 2;
    for (let index = 0; index < count; index += 1) {
      const angle = index * 2.399 + currentTime * 0.00018 * (index % 2 ? 1 : -1);
      const orbit = 138 + (index % 4) * 14;
      const size = 2 + (index % 3) + intensity * 0.35;
      ctx.fillStyle = index % 3
        ? hexAlpha(style.color, 0.46)
        : "rgba(126, 235, 255, 0.58)";
      ctx.fillRect(
        cx + Math.cos(angle) * orbit - size / 2,
        cy + Math.sin(angle) * orbit - size / 2,
        size,
        size,
      );
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
