import { getPiecePreviewLayout } from "./piecePreview.js";

export function createSidePieceLayout({
  boardX,
  boardY,
  cols,
  tile,
}) {
  const nextSlotH = 58;
  const nextSlotGap = 4;
  return {
    hold: {
      x: boardX - 116,
      y: boardY + 4,
      w: 106,
      h: 112,
      previewW: 86,
      previewH: 74,
      cellSize: 18,
    },
    next: {
      x: boardX + cols * tile + 12,
      y: boardY + 4,
      count: 5,
      w: 96,
      slotH: nextSlotH,
      slotGap: nextSlotGap,
      slotStep: nextSlotH + nextSlotGap,
      previewW: 80,
      previewH: nextSlotH,
      cellSize: 15,
    },
  };
}

export function createSidePieceRenderer({
  ctx,
  state,
  pieces,
  colors,
  layout,
  t,
  label,
  roundedRect,
  drawBlock,
}) {
  function drawSidePieces() {
    drawHoldPanel();
    drawNextQueuePanel();
  }

  function drawHoldPanel() {
    const hold = layout.hold;
    ctx.save();
    const locked = !state.canHold && Boolean(state.hold);
    ctx.fillStyle = "rgba(3, 5, 10, 0.62)";
    roundedRect(hold.x, hold.y, hold.w, hold.h, 14, true, false);
    ctx.strokeStyle = state.canHold ? "rgba(255, 224, 162, 0.38)" : "rgba(223, 243, 255, 0.12)";
    ctx.lineWidth = 1.3;
    roundedRect(hold.x, hold.y, hold.w, hold.h, 14, false, true);
    label(
      t("hold").toUpperCase(),
      hold.x + 11,
      hold.y + 22,
      13,
      state.canHold ? "#ffe0a3" : "rgba(245,241,230,0.42)",
    );
    drawMiniPiece(
      state.hold,
      hold.x + 10,
      hold.y + 30,
      hold.cellSize,
      hold.previewW,
      hold.previewH,
      { disabled: locked },
    );
    if (locked) drawHoldLockedIndicator(hold.x + hold.w - 18, hold.y + 17);
    ctx.restore();
  }

  function drawNextQueuePanel() {
    const next = layout.next;
    ctx.save();
    const queuePreview = state.queue.slice(0, next.count);
    const h = 30 + next.count * next.slotH + (next.count - 1) * next.slotGap + 42;
    ctx.fillStyle = "rgba(3, 5, 10, 0.62)";
    roundedRect(next.x, next.y, next.w, h, 14, true, false);
    ctx.strokeStyle = "rgba(255, 224, 162, 0.38)";
    ctx.lineWidth = 1.3;
    roundedRect(next.x, next.y, next.w, h, 14, false, true);
    label(t("next").toUpperCase(), next.x + 11, next.y + 22, 13, "#ffe0a3");
    for (let i = 0; i < next.count; i += 1) {
      const slotY = next.y + 30 + i * next.slotStep;
      drawMiniPiece(
        queuePreview[i],
        next.x + 8,
        slotY,
        next.cellSize,
        next.previewW,
        next.previewH,
      );
    }
    if (state.queueHex > 0) {
      ctx.fillStyle = "rgba(119, 232, 255, 0.11)";
      roundedRect(next.x + 8, next.y + h - 31, next.w - 16, 20, 8, true, false);
      label(`${t("hex").toUpperCase()} ${state.queueHex}`, next.x + 13, next.y + h - 17, 10, "#77e8ff");
    }
    ctx.restore();
  }

  function drawHoldLockedIndicator(cx, cy) {
    ctx.save();
    ctx.globalAlpha = 0.82;
    ctx.strokeStyle = "rgba(215, 194, 255, 0.72)";
    ctx.lineWidth = 1.6;
    roundedRect(cx - 7, cy - 1, 14, 10, 3, false, true);
    ctx.beginPath();
    ctx.arc(cx, cy - 2, 5, Math.PI, 0);
    ctx.stroke();
    ctx.restore();
  }

  function drawMiniPiece(type, x, y, size = 14, boxW = 92, boxH = 58, options = {}) {
    const shape = pieces[type];
    if (!shape) return;
    const preview = getPiecePreviewLayout(shape, x, y, size, boxW, boxH);
    ctx.save();
    if (options.disabled) {
      ctx.globalAlpha *= 0.48;
      ctx.filter = "grayscale(1) saturate(0.35) brightness(0.82)";
    }
    for (let r = 0; r < shape.length; r += 1) {
      for (let c = 0; c < shape[r].length; c += 1) {
        if (!shape[r][c]) continue;
        drawBlock(
          preview.offX + (c - preview.minColumn) * size,
          preview.offY + (r - preview.minRow) * size,
          colors[type],
          false,
          size,
        );
      }
    }
    ctx.restore();
  }

  return {
    drawSidePieces,
  };
}
