import {
  createMenuMotionModel,
  drawMenuAmbientMotion,
  drawMenuTitleWake,
  getMenuButtonMotion,
} from "./menuMotion.js";

export function getMenuActionText(key, {
  language,
  translate,
}) {
  if (language !== "en") return translate(key);
  if (key === "startGame") return "START";
  if (key === "mainStageStart") return "MAIN STAGE";
  if (key === "settings") return "SETTINGS";
  if (key === "moveGuide") return "MOVE GUIDE";
  return translate(key).toUpperCase();
}

export function createMenuScreenRenderer({
  ctx,
  state,
  width,
  height,
  uiLayout,
  forestBg,
  isImageReady,
  t,
  canvasFont,
  label,
  wrapText,
  drawCard,
  drawCornerGlyph,
  drawMenuButton,
  getMainMenuButtonRects,
  drawMenuHeroShowcase,
  drawMenuHeroDialogueBubble,
  now = () => performance.now(),
}) {
  function menuActionText(key) {
    return getMenuActionText(key, {
      language: state.language,
      translate: t,
    });
  }

  function drawStartMenuOverlay() {
    const currentTime = now();
    const menuMotion = createMenuMotionModel({
      now: currentTime,
      startedAt: state.menuRevealStartedAt || state.assetLoadingStartedAt,
    });
    const menu = uiLayout.menu;
    const pad = menu.padding || 36;
    const buttonX = menu.x + pad;
    const buttonW = menu.w - pad * 2;
    const buttons = getMainMenuButtonRects();
    drawMainMenuScene(menuMotion);
    drawMenuHeroShowcase();
    ctx.save();
    ctx.textAlign = "left";
    ctx.shadowColor = "rgba(190, 140, 255, 0.86)";
    ctx.shadowBlur = 34;
    ctx.font = canvasFont("900", 70, t("startTitle"), true);
    const titleGradient = ctx.createLinearGradient(72, 48, 540, 166);
    titleGradient.addColorStop(0, "#fff8dc");
    titleGradient.addColorStop(0.52, "#ffe0a3");
    titleGradient.addColorStop(1, "#d7c2ff");
    const titleParts = t("startTitle").split(" ");
    const titleA = titleParts[0] || t("startTitle");
    const titleB = titleParts.slice(1).join(" ") || "";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(22, 14, 42, 0.72)";
    ctx.strokeText(titleA, 72, 92);
    ctx.strokeText(titleB, 72, 152);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = "rgba(227, 206, 255, 0.54)";
    ctx.strokeText(titleA, 72, 92);
    ctx.strokeText(titleB, 72, 152);
    ctx.fillStyle = titleGradient;
    ctx.fillText(titleA, 72, 92);
    ctx.fillText(titleB, 72, 152);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.34;
    ctx.fillStyle = "rgba(255, 250, 220, 0.55)";
    ctx.fillText(titleA, 74, 89);
    ctx.fillText(titleB, 74, 149);
    ctx.restore();
    ctx.shadowBlur = 0;
    const underline = ctx.createLinearGradient(92, 178, 422, 178);
    underline.addColorStop(0, "rgba(255, 240, 166, 0)");
    underline.addColorStop(0.35, "rgba(255, 240, 166, 0.48)");
    underline.addColorStop(1, "rgba(126, 238, 255, 0)");
    ctx.strokeStyle = underline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(92, 178);
    ctx.lineTo(422, 178);
    ctx.stroke();
    drawMenuTitleWake(ctx, menuMotion, { x: 92, y: 178, w: 330 });
    ctx.shadowColor = "rgba(126, 238, 255, 0.34)";
    ctx.shadowBlur = 10;
    label(t("startTagline").toUpperCase(), 106, 210, 17, "#e0d2ff");
    ctx.shadowBlur = 0;
    wrapText(t("startWorldHint"), 106, 248, 372, 25, "rgba(245,248,255,0.78)", 15);
    drawMenuHeroDialogueBubble();

    drawCard(menu.x, menu.y, menu.w, menu.h);
    drawCornerGlyph(menu.x + menu.w / 2, menu.y - 2, "#9fb4ff");
    label(t("menuActions").toUpperCase(), buttonX, menu.y + 58, 15, "#fff0a6");
    wrapText(t("startPanelHint"), buttonX, menu.y + 88, buttonW, 19, "rgba(238,244,252,0.58)", 12);
    drawMenuButton(
      buttons.start.x,
      buttons.start.y,
      buttons.start.w,
      buttons.start.h,
      menuActionText("startGame"),
      "Enter",
      "primary",
      { motion: getMenuButtonMotion(menuMotion, 0) },
    );
    drawMenuButton(
      buttons.mainStage.x,
      buttons.mainStage.y,
      buttons.mainStage.w,
      buttons.mainStage.h,
      menuActionText("mainStageStart"),
      t("mainStageEgyptShort"),
      "secondary",
      { motion: getMenuButtonMotion(menuMotion, 1) },
    );
    drawMenuButton(
      buttons.metaUpgrade.x,
      buttons.metaUpgrade.y,
      buttons.metaUpgrade.w,
      buttons.metaUpgrade.h,
      menuActionText("upgradeMenu"),
      "",
      "secondary",
      { motion: getMenuButtonMotion(menuMotion, 2) },
    );
    drawMenuButton(
      buttons.guide.x,
      buttons.guide.y,
      buttons.guide.w,
      buttons.guide.h,
      menuActionText("moveGuide"),
      "Spin",
      "secondary",
      { motion: getMenuButtonMotion(menuMotion, 3) },
    );
    drawMenuButton(
      buttons.settings.x,
      buttons.settings.y,
      buttons.settings.w,
      buttons.settings.h,
      menuActionText("settings"),
      "",
      "secondary",
      { motion: getMenuButtonMotion(menuMotion, 4) },
    );
    label(t("startHint"), buttonX, menu.y + menu.h - 42, 13, "#9fb4ff");
    ctx.restore();
  }

  function drawMainMenuScene(menuMotion = null) {
    ctx.save();
    if (isImageReady(forestBg)) ctx.drawImage(forestBg, 0, 0, width, height);
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(3, 6, 14, 0.74)");
    gradient.addColorStop(0.46, "rgba(4, 7, 14, 0.48)");
    gradient.addColorStop(1, "rgba(1, 2, 6, 0.92)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    drawMenuAmbientRift(menuMotion);
    ctx.strokeStyle = "rgba(255, 240, 166, 0.18)";
    ctx.beginPath();
    ctx.moveTo(86, 642);
    ctx.bezierCurveTo(262, 602, 462, 674, 700, 614);
    ctx.stroke();
    ctx.restore();
  }

  function drawMenuAmbientRift(menuMotion = null) {
    const nowMs = now();
    const time = nowMs * 0.001;
    const motion = menuMotion || createMenuMotionModel({ now: nowMs, startedAt: nowMs - 1800 });
    const cx = 632;
    const cy = 318;
    const rift = ctx.createRadialGradient(cx, cy, 12, cx, cy, 270);
    rift.addColorStop(0, "rgba(185, 140, 255, 0.065)");
    rift.addColorStop(0.36, "rgba(105, 216, 255, 0.024)");
    rift.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rift;
    ctx.fillRect(300, 70, 560, 510);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 24; i += 1) {
      const drift = (time * 0.055 + i * 0.137) % 1;
      const x = cx - 208 + (i * 47) % 406 + Math.sin(time * 0.9 + i) * 8;
      const y = cy - 128 + drift * 260;
      ctx.globalAlpha = 0.03 + (1 - Math.abs(drift - 0.5) * 2) * 0.06;
      ctx.fillStyle = i % 3 ? "#8fe8dc" : "#d7c2ff";
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = "rgba(190, 146, 255, 0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy - 88);
    ctx.lineTo(cx, cy - 108);
    ctx.lineTo(cx + 18, cy - 88);
    ctx.lineTo(cx, cy - 68);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    drawMenuAmbientMotion(ctx, motion, { cx, cy });
  }

  return {
    drawMainMenuScene,
    drawStartMenuOverlay,
  };
}
