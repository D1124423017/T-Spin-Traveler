import { drawMenuButtonPanel } from "./panelDrawing.js";
import { clamp, pointInRect } from "../render/drawUtils.js";

export const MAIN_MENU_BUTTON_STYLE = Object.freeze({
  focusFontSize: 33,
  focusMinFontSize: 20,
  idleFontSize: 19,
  idleMinFontSize: 14,
  idleAlpha: 0.72,
});

export function createMenuButtonRenderer({
  ctx,
  state,
  canvasFont,
  fitLabel,
  roundedRect,
  mainMenuPrimaryFrame,
  mainMenuSecondaryFrame,
  isImageReady = () => false,
  now = () => performance.now(),
} = {}) {
  return function drawMenuButton(
    x,
    y,
    w,
    h,
    text,
    hint,
    variant = "secondary",
    options = {},
  ) {
    if (options.frameStyle === "mainMenu") {
      drawMainMenuButton({
        ctx,
        state,
        canvasFont,
        fitLabel,
        roundedRect,
        mainMenuPrimaryFrame,
        mainMenuSecondaryFrame,
        isImageReady,
        now: now(),
        x,
        y,
        w,
        h,
        text,
        hint,
        variant,
        options,
      });
      return;
    }
    drawMenuButtonPanel(ctx, {
      x,
      y,
      w,
      h,
      text,
      hint,
      variant,
      pointer: state.pointer,
      now: now(),
      motion: options.motion,
    }, {
      canvasFont,
      fitLabel,
      roundedRect,
    });
  };
}

function drawMainMenuButton({
  ctx,
  state,
  canvasFont,
  fitLabel,
  roundedRect,
  mainMenuPrimaryFrame,
  mainMenuSecondaryFrame,
  isImageReady,
  now,
  x,
  y,
  w,
  h,
  text,
  hint,
  variant,
  options,
}) {
  const pointer = state.pointer || {};
  const hitOffsetX = Number(options.hitOffsetX) || 0;
  const interactionRect = options.interactionRect || { x, y, w, h };
  const hovered = pointInRect(
    pointer.x,
    pointer.y,
    interactionRect.x + hitOffsetX,
    interactionRect.y,
    interactionRect.w,
    interactionRect.h,
  );
  const selected = Boolean(options.selected);
  const pressed = selected && hovered && Boolean(pointer.down);
  const disabled = Boolean(options.disabled);
  const active = !disabled && selected;
  const primary = variant === "primary";
  const frame = primary ? mainMenuPrimaryFrame : mainMenuSecondaryFrame;
  const motionAlpha = clamp(options.motion?.alpha ?? 1, 0, 1);
  const motionOffsetX = Number(options.motion?.offsetX) || 0;
  const focusProgress = clamp(options.focusProgress ?? (selected ? 1 : 0), 0, 1);
  const idleAlpha = MAIN_MENU_BUTTON_STYLE.idleAlpha;
  const lift = pressed ? 1 : active ? -2 * focusProgress : 0;
  const scale = pressed ? 0.96 : 1;
  const rotation = Number(options.rotation) || 0;
  const glow = active
    ? 0.42 + focusProgress * 0.58
    : clamp(options.motion?.glow ?? 0, 0, 1) * 0.05;

  ctx.save();
  ctx.globalAlpha *= motionAlpha
    * (idleAlpha + focusProgress * (1 - idleAlpha))
    * (disabled ? 0.42 : 1);
  ctx.translate(x + w / 2 + motionOffsetX, y + h / 2 + lift);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  ctx.translate(-(x + w / 2), -(y + h / 2));

  if (isImageReady(frame) && glow > 0) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha *= glow * (primary ? 0.68 : 0.48);
    ctx.filter = `blur(${primary ? 6 : 4}px)`;
    ctx.drawImage(frame, x - 12, y - 10, w + 24, h + 20);
    ctx.restore();
  }

  if (isImageReady(frame)) {
    ctx.globalAlpha *= active ? 1 : 0.92;
    ctx.drawImage(frame, x - 8, y - 6, w + 16, h + 12);
  } else {
    drawMenuButtonPanel(ctx, {
      x,
      y,
      w,
      h,
      text: "",
      hint: "",
      variant,
      pointer,
      now,
      motion: options.motion,
    }, {
      canvasFont,
      fitLabel,
      roundedRect,
    });
  }

  if (isImageReady(frame) && active) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = primary ? 0.36 : 0.24;
    ctx.drawImage(frame, x - 8, y - 6, w + 16, h + 12);
    ctx.restore();
  }

  const textSize = primary
    ? MAIN_MENU_BUTTON_STYLE.focusFontSize
    : MAIN_MENU_BUTTON_STYLE.idleFontSize;
  const minTextSize = primary
    ? MAIN_MENU_BUTTON_STYLE.focusMinFontSize
    : MAIN_MENU_BUTTON_STYLE.idleMinFontSize;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.shadowColor = active ? "rgba(202, 164, 255, 0.92)" : "rgba(0,0,0,0.72)";
  ctx.shadowBlur = active ? 11 + focusProgress * 4 : 5;
  fitLabel(
    text,
    x + w / 2,
    y + h / 2 + 1,
    w - (primary ? 120 : 98),
    textSize,
    primary ? "#fff8e8" : "#f4efff",
    minTextSize,
    "900",
    true,
  );
  ctx.shadowBlur = 0;

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.restore();
}
