export const CANVAS_STATE_RECOVERY_DEPTH = 24;

export function resetCanvasTransform(ctx) {
  if (typeof ctx.setTransform === "function") {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  } else if (typeof ctx.resetTransform === "function") {
    ctx.resetTransform();
  }
}

export function resetCanvasEffects(ctx) {
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
  ctx.lineWidth = 1;
}

export function recoverCanvasState(ctx, depth = CANVAS_STATE_RECOVERY_DEPTH) {
  for (let i = 0; i < depth; i += 1) ctx.restore();
}

export function resetCanvasFrame(ctx, width, height) {
  recoverCanvasState(ctx);
  resetCanvasTransform(ctx);
  resetCanvasEffects(ctx);
  ctx.clearRect(0, 0, width, height);
}
