import {
  isImageReady,
  upgradeTypeIcons,
} from "../data/assets.js";
import {
  clamp,
  hexToRgba,
  pointInRect,
} from "../render/drawUtils.js";
import { getRunRiftEnergyHudLayout } from "./hudLayout.js";
import {
  getTraitProgressStatusText as getTraitProgressStatusTextForPanel,
} from "./traitPanel.js";

const TRAIT_HUD_ICON_ASSET_BY_TAG = Object.freeze({
  B2B: "attack",
  "Boss Killer": "attack",
  Burst: "attack",
  Combo: "combo",
  Defense: "defense",
  Garbage: "garbage",
  Perfect: "rift",
  Spin: "spin",
  Survival: "survival",
  Utility: "rift",
});

export function createBattleHudRenderer({
  ctx,
  state,
  uiLayout,
  upgradeGrowthPerTier,
  riftEnergyIcon,
  t,
  fmt,
  canvasFont,
  label,
  fitLabel,
  roundedRect,
  drawAscensionChallengeHud,
  getTraitEntries,
  getTraitFullCount,
  drawCornerGlyph,
  getEffectiveMaxGuard,
  getCurrentRunRiftEnergyEarned,
  drawImageContain,
} = {}) {
function drawTopQuestBar() {
  if (state.runMode === "ascension" && state.ascensionRun) {
    drawAscensionChallengeHud();
    return;
  }
  ctx.save();
  ctx.fillStyle = "rgba(4, 7, 14, 0.8)";
  roundedRect(404, 10, 472, 38, 10, true, false);
  ctx.strokeStyle = "rgba(255, 210, 128, 0.28)";
  ctx.lineWidth = 1.5;
  roundedRect(404, 10, 472, 38, 10, false, true);
  ctx.font = canvasFont("800", 15, t("topQuest").toUpperCase(), true);
  ctx.fillStyle = "#d7c2ff";
  ctx.fillText(t("topQuest").toUpperCase(), 450, 30);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(238,244,252,0.58)";
  ctx.font = canvasFont("800", 15, `${t("waveLabel")} ${state.wave}`);
  ctx.fillText(`${t("waveLabel")} ${state.wave}`, 850, 30);
  ctx.fillStyle = "#ffb95f";
  ctx.beginPath();
  ctx.arc(427, 29, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTraitList() {
  if (state.mode !== "playing" && state.mode !== "paused") return;
  const traits = getTraitEntries().filter((trait) => trait.count > 0).slice(0, 6);
  if (!traits.length) return;
  const x = 20;
  const y = 292;
  const w = 132;
  const rowH = 24;
  const h = 27 + traits.length * rowH + 8;
  ctx.save();
  ctx.fillStyle = "rgba(4, 7, 14, 0.38)";
  roundedRect(x, y, w, h, 9, true, false);
  ctx.strokeStyle = "rgba(126, 231, 255, 0.16)";
  ctx.lineWidth = 1;
  roundedRect(x, y, w, h, 9, false, true);
  label(t("traitListTitle").toUpperCase(), x + 10, y + 19, 10, "rgba(143, 232, 220, 0.74)");
  for (let i = 0; i < traits.length; i += 1) {
    const trait = traits[i];
    const yy = y + 27 + i * rowH;
    drawTraitListRow(trait, x + 8, yy, w - 16, rowH - 4);
  }
  ctx.restore();
}

function drawTraitListRow(trait, x, y, w, h) {
  const active = trait.stage > 0;
  const color = trait.isFull ? "#fff0a6" : trait.stage >= 2 ? "#d7c2ff" : trait.color;
  ctx.save();
  ctx.fillStyle = active ? hexToRgba(color, 0.14) : "rgba(8, 13, 20, 0.34)";
  roundedRect(x, y, w, h, 6, true, false);
  ctx.strokeStyle = active ? hexToRgba(color, 0.5 + trait.stage * 0.09) : "rgba(238,244,252,0.09)";
  ctx.lineWidth = active ? 1.2 : 1;
  roundedRect(x, y, w, h, 6, false, true);
  ctx.fillStyle = hexToRgba(color, active ? 0.24 : 0.08);
  roundedRect(x + 4, y + 3, 16, h - 6, 5, true, false);
  drawTraitHudIcon(trait, x + 2, y + 1, 20, color, active);
  ctx.textAlign = "right";
  fitLabel(getTraitProgressStatusTextForPanel(trait, { format: fmt, getFullCount: getTraitFullCount }), x + w - 6, y + 14, 78, 10, active ? color : "rgba(238,244,252,0.44)", 7, "900", true);
  if (active) {
    ctx.fillStyle = color;
    ctx.globalAlpha = trait.isFull ? 0.9 : 0.64;
    ctx.fillRect(x + w - 26, y + h - 4, Math.min(20, 6 + trait.stage * 5), 2);
  }
  ctx.restore();
}

function drawTraitHudIcon(trait, x, y, size, color, active) {
  const iconKey = TRAIT_HUD_ICON_ASSET_BY_TAG[trait.tag] || "rift";
  const iconImage = upgradeTypeIcons[iconKey];
  if (isImageReady(iconImage) && typeof drawImageContain === "function") {
    ctx.save();
    ctx.globalAlpha *= active ? 0.96 : 0.58;
    ctx.shadowColor = hexToRgba(color, active ? 0.42 : 0.18);
    ctx.shadowBlur = active ? 8 : 3;
    drawImageContain(iconImage, x, y, size, size);
    ctx.restore();
    return;
  }

  ctx.textAlign = "center";
  ctx.font = canvasFont("900", 10, trait.def.icon, true);
  ctx.fillStyle = active ? color : "rgba(238,244,252,0.44)";
  ctx.fillText(trait.def.icon, x + size / 2, y + size - 7);
}

function getRelicProgressInfo() {
  const tierStep = state.upgradeTier > 0
    ? upgradeGrowthPerTier * state.upgradeTier
    : state.nextUpgradeAt;
  const previousTarget = Math.max(0, state.nextUpgradeAt - tierStep);
  const target = Math.max(1, state.nextUpgradeAt - previousTarget);
  const current = clamp(state.upgradeMeter - previousTarget, 0, target);
  const ready = state.upgradeReady || state.upgradeMeter >= state.nextUpgradeAt;
  return {
    current,
    target,
    ready,
    ratio: ready ? 1 : clamp(current / target, 0, 1),
  };
}

function getRelicProgressText(progress) {
  return progress.ready
    ? t("relicDraftReady")
    : `${t("relicProgress")} ${Math.floor(progress.current)} / ${progress.target}`;
}

function drawRelicProgressBar(x, y, w, h, progress, showText = true) {
  const glow = progress.ready || progress.ratio >= 0.75;
  const text = getRelicProgressText(progress);
  ctx.save();
  ctx.fillStyle = "rgba(4, 9, 18, 0.72)";
  roundedRect(x, y, w, h, h / 2, true, false);
  const fill = ctx.createLinearGradient(x, y, x + w, y);
  fill.addColorStop(0, "#7ef7ff");
  fill.addColorStop(0.55, "#b690ff");
  fill.addColorStop(1, glow ? "#fff0a6" : "#d7c2ff");
  ctx.fillStyle = fill;
  if (glow) {
    ctx.shadowColor = progress.ready ? "#fff0a6" : "#b690ff";
    ctx.shadowBlur = progress.ready ? 16 : 9;
  }
  roundedRect(x, y, Math.max(h, w * progress.ratio), h, h / 2, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = glow ? "rgba(255, 240, 166, 0.54)" : "rgba(126, 231, 255, 0.28)";
  roundedRect(x, y, w, h, h / 2, false, true);
  if (showText) {
    ctx.textAlign = "left";
    fitLabel(text, x, y + 14, w, 11, glow ? "#fff0a6" : "rgba(238,244,252,0.7)", 9, "800");
  }
  ctx.restore();
}

function drawPlayerRelicProgress() {
  const progress = getRelicProgressInfo();
  const x = 56;
  const y = 622;
  const w = 292;
  const h = 46;
  const glow = progress.ready || progress.ratio >= 0.75;
  ctx.save();
  const bg = ctx.createLinearGradient(x, y, x + w, y + h);
  bg.addColorStop(0, "rgba(4, 9, 18, 0.62)");
  bg.addColorStop(0.55, "rgba(18, 16, 38, 0.58)");
  bg.addColorStop(1, "rgba(6, 13, 23, 0.62)");
  ctx.fillStyle = bg;
  ctx.shadowColor = glow ? "rgba(255, 240, 166, 0.22)" : "rgba(109, 232, 255, 0.12)";
  ctx.shadowBlur = glow ? 18 : 10;
  roundedRect(x, y, w, h, 10, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = glow ? "rgba(255, 240, 166, 0.44)" : "rgba(126, 231, 255, 0.22)";
  ctx.lineWidth = 1.3;
  roundedRect(x, y, w, h, 10, false, true);
  ctx.fillStyle = glow ? "rgba(255, 240, 166, 0.2)" : "rgba(126, 231, 255, 0.12)";
  roundedRect(x + 12, y + 10, 24, 24, 7, true, false);
  drawCornerGlyph(x + 24, y + 22, glow ? "#fff0a6" : "#8fe8dc");
  fitLabel(getRelicProgressText(progress), x + 46, y + 25, w - 60, 12, glow ? "#fff0a6" : "rgba(238,244,252,0.74)", 10, "900", true);
  drawRelicProgressBar(x + 14, y + 33, w - 28, 7, progress, false);
  ctx.restore();
}

function drawGuardMeter(x, y, w = 190) {
  const maxGuard = getEffectiveMaxGuard();
  const ratio = maxGuard ? state.guard / maxGuard : 0;
  ctx.save();
  ctx.fillStyle = "rgba(7, 10, 16, 0.5)";
  roundedRect(x, y, w, 20, 6, true, false);
  ctx.fillStyle = "rgba(157, 247, 218, 0.22)";
  roundedRect(x, y, w * ratio, 20, 6, true, false);
  ctx.strokeStyle = "rgba(157, 247, 218, 0.3)";
  roundedRect(x, y, w, 20, 6, false, true);
  label(`${t("guardLabel")} ${state.guard}/${maxGuard}`, x + 10, y + 14, 11, state.guard > 0 ? "#9df7da" : "rgba(238,244,252,0.46)");
  ctx.restore();
}

function drawRunRiftEnergyHud() {
  if (state.runMode === "ascension") return;
  const amount = getCurrentRunRiftEnergyEarned();
  const hud = getRunRiftEnergyHudLayout(uiLayout.pauseButton);
  const pulse = amount > 0 ? 0.5 + Math.sin(performance.now() * 0.007) * 0.5 : 0;
  ctx.save();
  ctx.shadowColor = `rgba(184, 141, 255, ${0.24 + pulse * 0.12})`;
  ctx.shadowBlur = 14 + pulse * 4;
  drawImageContain(
    riftEnergyIcon,
    hud.icon.x,
    hud.icon.y,
    hud.icon.w,
    hud.icon.h,
  );
  ctx.shadowBlur = 0;
  ctx.shadowColor = "rgba(89, 58, 180, 0.52)";
  ctx.shadowBlur = amount > 0 ? 8 : 4;
  fitLabel(
    String(amount),
    hud.number.x,
    hud.number.y,
    hud.number.w,
    hud.number.size,
    amount > 0 ? "#fff0a6" : "rgba(238,244,252,0.72)",
    hud.number.minSize,
    "900",
    true,
  );
  ctx.restore();
}

function drawPauseButton() {
  const b = uiLayout.pauseButton;
  const hovered = pointInRect(state.pointer.x, state.pointer.y, b.x, b.y, b.w, b.h);
  ctx.save();
  ctx.fillStyle = hovered ? "rgba(112, 226, 218, 0.24)" : "rgba(8, 13, 20, 0.58)";
  roundedRect(b.x, b.y, b.w, b.h, 10, true, false);
  ctx.strokeStyle = "rgba(145, 232, 222, 0.32)";
  ctx.lineWidth = 2;
  roundedRect(b.x, b.y, b.w, b.h, 10, false, true);
  ctx.strokeStyle = "#d8f8f4";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(b.x + 18, b.y + 10);
  ctx.lineTo(b.x + 18, b.y + 28);
  ctx.moveTo(b.x + 32, b.y + 10);
  ctx.lineTo(b.x + 32, b.y + 28);
  ctx.stroke();
  ctx.restore();
}

  return {
    drawGuardMeter,
    drawPauseButton,
    drawPlayerRelicProgress,
    drawRunRiftEnergyHud,
    drawTopQuestBar,
    drawTraitList,
  };
}
