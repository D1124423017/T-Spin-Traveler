import {
  createMenuFocusMotionController,
  createMenuMotionModel,
  drawMenuTitleWake,
  getMenuButtonMotion,
} from "./menuMotion.js";
import { getMainMenuVisualButtonRect } from "./mainMenuLayout.js";
import {
  getMainMenuActions,
  getSelectedMainMenuAction,
  normalizeMainMenuSelectedIndex,
} from "./mainMenuModel.js";

export function getMenuActionText(key, {
  language,
  translate,
}) {
  if (language !== "en") return translate(key);
  if (key === "startGame") return "START";
  if (key === "mainMenuStory") return "MAIN STAGE";
  if (key === "settings") return "SETTINGS";
  if (key === "moveGuide") return "MOVE GUIDE";
  return translate(key).toUpperCase();
}

export function createMenuScreenRenderer({
  ctx,
  state,
  mainMenuLayout,
  t,
  canvasFont,
  label,
  wrapText,
  drawMenuButton,
  drawMainMenuScene,
  drawMenuHeroShowcase,
  drawMenuHeroDialogueBubble,
  isReactMainMenuActive = () => false,
  onMenuMotionUpdate = () => {},
  prefersReducedMotion = () => false,
  now = () => performance.now(),
}) {
  const focusMotion = createMenuFocusMotionController({
    count: getMainMenuActions().length,
  });

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
      reducedMotion: prefersReducedMotion(),
    });
    const actions = getMainMenuActions();
    const selectedIndex = normalizeMainMenuSelectedIndex(
      state.mainMenuSelectedIndex,
      actions.length,
    );
    const selectedAction = getSelectedMainMenuAction(selectedIndex);
    const focusStates = focusMotion.update({
      selected: selectedIndex,
      now: currentTime,
      reducedMotion: menuMotion.reducedMotion,
    });
    const buttonMotions = actions.map((action, index) => ({
      action,
      motion: getMenuButtonMotion(menuMotion, index),
      focus: focusStates[index],
    }));
    state.mainMenuSelectedIndex = selectedIndex;
    onMenuMotionUpdate({
      groupOffsetX: menuMotion.rightPanelOffsetX,
    });

    drawMainMenuScene(menuMotion);
    drawMenuHeroShowcase();
    const reactMainMenuActive = Boolean(isReactMainMenuActive());
    if (!reactMainMenuActive) {
      drawTitle(menuMotion);

      ctx.save();
      ctx.globalAlpha *= menuMotion.rightPanelAlpha;
      ctx.translate(menuMotion.rightPanelOffsetX, 0);
      buttonMotions.forEach(({ action, motion, focus }, index) => {
        const rect = getMainMenuVisualButtonRect(
          mainMenuLayout,
          action.id,
          focus.scaleProgress,
        );
        const floatOffsetY = menuMotion.reducedMotion
          ? 0
          : Math.sin(currentTime * 0.0016 + index * 1.13) * 1.6;
        const floatOffsetX = menuMotion.reducedMotion
          ? 0
          : Math.cos(currentTime * 0.00135 + index * 0.91) * 1.8;
        drawMenuButton(
          rect.x + floatOffsetX,
          rect.y + floatOffsetY,
          rect.w,
          rect.h,
          menuActionText(action.labelKey),
          "",
          index === selectedIndex ? "primary" : "secondary",
          {
            disabled: action.enabled === false,
            frameStyle: "mainMenu",
            focusProgress: focus.focusProgress,
            hitOffsetX: menuMotion.rightPanelOffsetX,
            interactionRect: mainMenuLayout.interactionRects[action.id],
            motion,
            rotation: rect.rotation,
            selected: index === selectedIndex,
          },
        );
      });

      drawSelectedActionDescription(selectedAction);
      drawFooter();
      ctx.restore();
    }
    drawMenuHeroDialogueBubble();
  }

  function drawTitle(menuMotion) {
    const title = mainMenuLayout.title;
    const titleParts = t("startTitle").split(" ");
    const titleA = titleParts[0] || t("startTitle");
    const titleB = titleParts.slice(1).join(" ") || "";
    const titleX = title.x + 12;
    const firstBaseline = title.y + 58;
    const secondBaseline = title.y + 114;

    ctx.save();
    ctx.globalAlpha = menuMotion.titleAlpha;
    ctx.textAlign = "left";
    ctx.shadowColor = "rgba(190, 140, 255, 0.86)";
    ctx.shadowBlur = 30;
    ctx.font = canvasFont("900", 64, t("startTitle"), true);
    const titleGradient = ctx.createLinearGradient(
      title.x,
      title.y,
      title.x + title.w,
      title.y + title.h,
    );
    titleGradient.addColorStop(0, "#fff8dc");
    titleGradient.addColorStop(0.52, "#e9d4ff");
    titleGradient.addColorStop(1, "#91ddff");
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(15, 10, 38, 0.82)";
    ctx.strokeText(titleA, titleX, firstBaseline);
    ctx.strokeText(titleB, titleX, secondBaseline);
    ctx.fillStyle = titleGradient;
    ctx.fillText(titleA, titleX, firstBaseline);
    ctx.fillText(titleB, titleX, secondBaseline);
    ctx.shadowBlur = 0;

    const underlineY = title.y + 133;
    const underline = ctx.createLinearGradient(titleX, underlineY, titleX + 338, underlineY);
    underline.addColorStop(0, "rgba(255, 240, 166, 0)");
    underline.addColorStop(0.28, "rgba(255, 240, 166, 0.7)");
    underline.addColorStop(1, "rgba(126, 238, 255, 0)");
    ctx.strokeStyle = underline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(titleX, underlineY);
    ctx.lineTo(titleX + 338, underlineY);
    ctx.stroke();
    drawMenuTitleWake(ctx, menuMotion, { x: titleX, y: underlineY, w: 338 });
    ctx.restore();
  }

  function drawSelectedActionDescription(action) {
    const rect = mainMenuLayout.selectedDescription;
    ctx.save();
    ctx.shadowColor = "rgba(4, 3, 16, 0.95)";
    ctx.shadowBlur = 8;
    label(
      menuActionText(action.labelKey),
      rect.x + 20,
      rect.y + 20,
      mainMenuLayout.textSizes.descriptionTitle,
      "#f0ddff",
    );
    wrapText(
      t(action.descriptionKey),
      rect.x + 20,
      rect.y + 43,
      rect.w - 40,
      17,
      "rgba(242,245,255,0.86)",
      mainMenuLayout.textSizes.description,
    );
    ctx.restore();
  }

  function drawFooter() {
    const footer = mainMenuLayout.footer;
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = canvasFont("800", mainMenuLayout.textSizes.footer, t("menuControlHint"));
    ctx.fillStyle = "rgba(211, 222, 255, 0.76)";
    ctx.shadowColor = "rgba(135, 101, 255, 0.5)";
    ctx.shadowBlur = 8;
    ctx.fillText(
      t("menuControlHint"),
      footer.x + footer.w / 2,
      footer.y + 19,
      footer.w,
    );
    ctx.restore();
  }

  return {
    drawMainMenuScene,
    drawStartMenuOverlay,
  };
}
