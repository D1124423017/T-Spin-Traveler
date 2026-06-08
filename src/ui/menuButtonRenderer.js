import { drawMenuButtonPanel } from "./panelDrawing.js";

export function createMenuButtonRenderer({
  ctx,
  state,
  canvasFont,
  fitLabel,
  roundedRect,
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
