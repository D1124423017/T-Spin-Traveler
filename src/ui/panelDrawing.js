import {
  OVERLAY_READABILITY,
  pointInRect,
} from "../render/drawUtils.js";

export function getMenuButtonVisualState({ pointer = {}, rect = {}, variant = "secondary" } = {}) {
  const hovered = pointInRect(pointer.x, pointer.y, rect.x, rect.y, rect.w, rect.h);
  return {
    hovered,
    primary: variant === "primary",
  };
}

export function drawMenuButtonPanel(ctx, {
  x,
  y,
  w,
  h,
  text,
  hint,
  variant = "secondary",
  pointer = {},
  now = getNow(),
}, {
  canvasFont,
  fitLabel,
  roundedRect,
}) {
  const { hovered, primary } = getMenuButtonVisualState({
    pointer,
    rect: { x, y, w, h },
    variant,
  });
  ctx.save();
  if (primary) {
    const fill = ctx.createLinearGradient(x, y, x + w, y + h);
    fill.addColorStop(0, hovered ? "rgba(255, 236, 180, 0.42)" : "rgba(255, 224, 162, 0.28)");
    fill.addColorStop(0.48, hovered ? "rgba(184, 141, 255, 0.34)" : "rgba(184, 141, 255, 0.22)");
    fill.addColorStop(1, hovered ? "rgba(119, 237, 255, 0.24)" : "rgba(119, 237, 255, 0.16)");
    ctx.fillStyle = fill;
    ctx.shadowColor = "rgba(255, 224, 162, 0.38)";
    ctx.shadowBlur = hovered ? 24 : 16;
  } else {
    ctx.fillStyle = hovered ? "rgba(109, 232, 255, 0.24)" : OVERLAY_READABILITY.surface.fill;
  }
  roundedRect(x, y, w, h, 8, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = primary
    ? (hovered ? "rgba(255, 244, 168, 0.84)" : "rgba(255, 224, 162, 0.52)")
    : (hovered ? "rgba(255, 244, 168, 0.5)" : "rgba(145, 232, 222, 0.26)");
  ctx.lineWidth = primary ? 2.5 : 2;
  roundedRect(x, y, w, h, 8, false, true);
  if (primary) {
    ctx.fillStyle = hovered ? "rgba(255, 240, 166, 0.78)" : "rgba(255, 240, 166, 0.58)";
    roundedRect(x + 14, y + 14, 5, h - 28, 4, true, false);
    const shimmer = ((now * 0.00022) % 1) * (w + 130) - 110;
    const sheen = ctx.createLinearGradient(x + shimmer, y, x + shimmer + 90, y + h);
    sheen.addColorStop(0, "rgba(255,255,255,0)");
    sheen.addColorStop(0.5, "rgba(255,255,255,0.18)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    roundedRect(x + 4, y + 4, w - 8, h - 8, 7, true, false);
  }
  ctx.font = canvasFont("800", primary ? 21 : 17, text, true);
  ctx.fillStyle = primary ? "#fff7d2" : "#f3f2ea";
  ctx.textBaseline = "middle";
  fitLabel(text, x + 22, y + h / 2 + 1, w - (hint ? 126 : 44), primary ? 21 : 17, primary ? "#fff7d2" : "#f3f2ea", primary ? 16 : 14, "800", true);
  if (hint) {
    ctx.font = canvasFont("800", 12, hint);
    ctx.fillStyle = "rgba(238,244,252,0.56)";
    ctx.textAlign = "right";
    ctx.fillText(hint, x + w - 18, y + h / 2 + 1);
    ctx.textAlign = "left";
  }
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}

function getNow() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}
