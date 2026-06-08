export function getTopBufferLayout(hiddenRows, tileSize, cols = 0) {
  const h = hiddenRows * tileSize;
  return { x: 0, y: -h, w: cols * tileSize, h, rowH: tileSize };
}

export function getGhostPiece(active, mode, collides) {
  if (!active || mode !== "playing") return null;
  const ghost = {
    ...active,
    shape: active.shape,
  };
  while (!collides(ghost, ghost.x, ghost.y + 1, ghost.shape)) ghost.y += 1;
  return ghost;
}

export function createBattleBoardRenderer({
  ctx,
  state,
  boardX,
  boardY,
  cols,
  rows,
  hiddenRows,
  tileSize,
  colors,
  ultimateWall,
  ultimateDurationMs,
  uiLayout,
  roundedRect,
  canvasFont,
  label,
  t,
  collides,
  getUltimateWellRange,
  getVisiblePieceCells,
  getUltimateTimerRatio,
  getUltimateCountdownSeconds,
  shouldShowUltimateCountdownWarning,
}) {
  function drawBoard() {
    ctx.save();
    ctx.translate(boardX, boardY);
    const frame = ctx.createLinearGradient(-18, -18, cols * tileSize + 18, rows * tileSize + 18);
    frame.addColorStop(0, "rgba(123, 238, 225, 0.22)");
    frame.addColorStop(0.5, "rgba(24, 28, 42, 0.96)");
    frame.addColorStop(1, "rgba(169, 126, 255, 0.18)");
    ctx.fillStyle = frame;
    roundedRect(-18, -18, cols * tileSize + 36, rows * tileSize + 36, 9, true, false);
    ctx.fillStyle = "rgba(4, 7, 12, 0.9)";
    roundedRect(-9, -9, cols * tileSize + 18, rows * tileSize + 18, 5, true, false);
    ctx.strokeStyle = "rgba(223, 243, 255, 0.3)";
    ctx.lineWidth = 1.5;
    roundedRect(-9, -9, cols * tileSize + 18, rows * tileSize + 18, 5, false, true);

    ctx.fillStyle = "rgba(229,235,244,0.045)";
    for (let x = 0; x <= cols; x += 1) ctx.fillRect(x * tileSize, 0, 1, rows * tileSize);
    for (let y = 0; y <= rows; y += 1) ctx.fillRect(0, y * tileSize, cols * tileSize, 1);
    drawUltimateWellMask();

    drawHiddenBoardCells();
    for (let y = hiddenRows; y < rows + hiddenRows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const type = state.board[y][x];
        if (type === ultimateWall) continue;
        if (type) drawBlock(x * tileSize, (y - hiddenRows) * tileSize, colors[type]);
      }
    }

    const ghost = getGhostPiece(state.active, state.mode, collides);
    if (ghost) drawPiece(ghost, true);
    if (state.active) drawPiece(state.active, false);

    for (const flash of state.lineFlash) {
      const y = (flash.y - hiddenRows) * tileSize;
      if (y < 0) continue;
      ctx.fillStyle = `rgba(245, 236, 190, ${Math.min(0.32, flash.life / 620)})`;
      const well = getUltimateWellRange();
      const flashX = state.ultimateActive ? well.start * tileSize : 0;
      const flashW = state.ultimateActive ? well.width * tileSize : cols * tileSize;
      ctx.fillRect(flashX, y, flashW, tileSize);
    }
    ctx.restore();
    drawUltimateTimerUi();
    drawIncomingGarbageMeter();
  }

  function drawHiddenBoardCells() {
    const layout = getTopBufferLayout(hiddenRows, tileSize, cols);
    ctx.save();
    ctx.globalAlpha = 0.62;
    for (let y = 0; y < hiddenRows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const type = state.board[y]?.[x];
        if (!type || type === ultimateWall) continue;
        drawBlock(x * tileSize, layout.y + y * tileSize, colors[type]);
      }
    }
    ctx.restore();
  }

  function drawUltimateWellMask() {
    if (!state.ultimateActive) return;
    const well = getUltimateWellRange();
    const wellX = well.start * tileSize;
    const wellW = well.width * tileSize;
    const leftW = wellX;
    const rightX = wellX + wellW;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, cols * tileSize, rows * tileSize);
    ctx.clip();
    ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
    ctx.fillRect(0, 0, leftW, rows * tileSize);
    ctx.fillRect(rightX, 0, cols * tileSize - rightX, rows * tileSize);
    const pulse = 0.55 + Math.sin(performance.now() * 0.008) * 0.18;
    ctx.strokeStyle = `rgba(255, 190, 95, ${pulse})`;
    ctx.lineWidth = 3;
    roundedRect(wellX - 4, -5, wellW + 8, rows * tileSize + 10, 4, false, true);
    ctx.strokeStyle = "rgba(223, 243, 255, 0.64)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(wellX, 0);
    ctx.lineTo(wellX, rows * tileSize);
    ctx.moveTo(wellX + wellW, 0);
    ctx.lineTo(wellX + wellW, rows * tileSize);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 190, 95, 0.12)";
    ctx.fillRect(wellX, 0, wellW, rows * tileSize);
    ctx.restore();
  }

  function drawUltimateTimerUi() {
    if (!state.ultimateActive) return;
    ctx.save();
    ctx.translate(boardX, boardY);
    drawUltimateCountdownBar();
    ctx.restore();
    drawUltimateCountdownWarning();
  }

  function drawUltimateCountdownBar() {
    if (!state.ultimateActive) return;
    const meter = uiLayout.ultimateMeter;
    const remaining = Math.max(0, state.ultimateTimer);
    const ratio = getUltimateTimerRatio(
      state.ultimateActive,
      remaining,
      state.ultimateTimerMax || ultimateDurationMs,
    );
    const secondsText = `${getUltimateCountdownSeconds(remaining)}s`;
    const danger = remaining <= 5000;
    const barX = meter.x + 90;
    const barY = meter.y + 8;
    const barW = meter.w - 140;
    const barH = 9;
    const pulse = danger ? 0.7 + Math.sin(performance.now() * 0.018) * 0.3 : 1;

    ctx.save();
    ctx.fillStyle = "rgba(4, 7, 12, 0.72)";
    roundedRect(meter.x, meter.y, meter.w, meter.h, 8, true, false);
    ctx.strokeStyle = danger ? `rgba(255, 119, 130, ${0.45 * pulse})` : "rgba(255, 190, 95, 0.34)";
    ctx.lineWidth = 1.5;
    roundedRect(meter.x, meter.y, meter.w, meter.h, 8, false, true);

    ctx.font = canvasFont("900", 12, "4-WIDE", true);
    ctx.textAlign = "left";
    ctx.fillStyle = danger ? "#ff9aa2" : "#ffbe5f";
    ctx.shadowColor = danger ? "#ff7782" : "#ffbe5f";
    ctx.shadowBlur = danger ? 12 : 8;
    ctx.fillText("4-WIDE", meter.x + 12, meter.y + 17);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    roundedRect(barX, barY, barW, barH, 8, true, false);
    const fillW = Math.max(0, barW * ratio);
    if (fillW > 0) {
      const gradient = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      gradient.addColorStop(0, danger ? "#ff7782" : "#d7c2ff");
      gradient.addColorStop(0.58, danger ? "#ffbe5f" : "#ffbe5f");
      gradient.addColorStop(1, "#8fe8dc");
      ctx.fillStyle = gradient;
      roundedRect(barX, barY, Math.max(4, fillW), barH, 8, true, false);
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.fillRect(barX + 2, barY + 2, Math.max(0, fillW - 4), 1);
    }

    ctx.font = canvasFont("900", 13, secondsText, true);
    ctx.textAlign = "right";
    ctx.fillStyle = danger ? "#ffb7bd" : "#f5f1e6";
    ctx.fillText(secondsText, meter.x + meter.w - 12, meter.y + 18);
    ctx.restore();
  }

  function drawUltimateCountdownWarning() {
    if (!shouldShowUltimateCountdownWarning(state.ultimateActive, state.ultimateTimer)) return;
    const seconds = getUltimateCountdownSeconds(state.ultimateTimer);
    const now = performance.now();
    const urgent = seconds <= 1;
    const pulse = 0.5 + Math.sin(now * (urgent ? 0.026 : 0.018)) * 0.5;
    const cx = boardX + (cols * tileSize) / 2;
    const cy = boardY + tileSize * 3.25;
    const badgeW = urgent ? 112 : 96;
    const badgeH = urgent ? 82 : 70;
    const alpha = 0.78 + pulse * 0.18;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);
    ctx.shadowColor = urgent ? "rgba(255, 119, 130, 0.75)" : "rgba(255, 190, 95, 0.62)";
    ctx.shadowBlur = urgent ? 26 : 20;
    const gradient = ctx.createLinearGradient(0, -badgeH / 2, 0, badgeH / 2);
    gradient.addColorStop(0, urgent ? "rgba(70, 10, 26, 0.78)" : "rgba(30, 20, 52, 0.72)");
    gradient.addColorStop(0.55, "rgba(8, 12, 24, 0.82)");
    gradient.addColorStop(1, "rgba(4, 8, 14, 0.72)");
    ctx.fillStyle = gradient;
    roundedRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 16, true, false);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = urgent
      ? `rgba(255, 119, 130, ${0.52 + pulse * 0.28})`
      : `rgba(255, 190, 95, ${0.48 + pulse * 0.22})`;
    ctx.lineWidth = urgent ? 2.6 : 2;
    roundedRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 16, false, true);
    ctx.strokeStyle = `rgba(126, 247, 255, ${0.16 + pulse * 0.18})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-badgeW / 2 + 18, -badgeH / 2 + 12);
    ctx.lineTo(badgeW / 2 - 18, -badgeH / 2 + 12);
    ctx.moveTo(-badgeW / 2 + 18, badgeH / 2 - 12);
    ctx.lineTo(badgeW / 2 - 18, badgeH / 2 - 12);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = canvasFont("900", urgent ? 50 : 44, String(seconds), true);
    ctx.fillStyle = urgent ? "#ffdde0" : "#fff0a6";
    ctx.shadowColor = urgent ? "#ff7782" : "#ffbe5f";
    ctx.shadowBlur = urgent ? 18 : 14;
    ctx.fillText(String(seconds), 0, 3);
    ctx.restore();
  }

  function drawIncomingGarbageMeter() {
    const x = boardX - 30;
    const y = boardY;
    const maxRows = 10;
    ctx.save();
    label(
      `${t("incomingShort").toUpperCase()} ${state.pendingGarbage}`,
      x - 10,
      y - 12,
      12,
      state.pendingGarbage > 0 ? "#ffb7bd" : "rgba(238,244,252,0.38)",
    );
    ctx.fillStyle = "rgba(5, 8, 12, 0.55)";
    roundedRect(x, y, 16, rows * tileSize, 6, true, false);
    ctx.strokeStyle = "rgba(238,244,252,0.16)";
    roundedRect(x, y, 16, rows * tileSize, 6, false, true);
    const visible = Math.min(maxRows, state.pendingGarbage);
    for (let i = 0; i < visible; i += 1) {
      const by = y + rows * tileSize - 8 - i * 18;
      ctx.fillStyle = i < 3 ? "#c9d4da" : "#ff7782";
      roundedRect(x + 3, by, 10, 13, 3, true, false);
    }
    if (state.pendingGarbage > maxRows) {
      label(`+${state.pendingGarbage - maxRows}`, x - 3, y + rows * tileSize - 194, 12, "#ff7782");
    }
    ctx.restore();
  }

  function drawPiece(piece, ghost) {
    const constrainToUltimateWell = Boolean(state.ultimateActive);
    const well = getUltimateWellRange();
    const cells = getVisiblePieceCells(piece, {
      cols,
      rows,
      hidden: hiddenRows,
      minCol: constrainToUltimateWell ? well.start : 0,
      maxCol: constrainToUltimateWell ? well.end : cols,
    });
    for (const cell of cells) {
      drawBlock(
        cell.x * tileSize,
        cell.y * tileSize,
        ghost ? "rgba(228,235,245,0.16)" : colors[piece.type],
        ghost,
      );
    }
  }

  function drawBlock(x, y, color, ghost = false, size = tileSize) {
    ctx.save();
    ctx.fillStyle = color;
    roundedRect(x + 2, y + 2, size - 4, size - 4, 4, true, false);
    ctx.strokeStyle = ghost ? "rgba(232,240,255,0.32)" : "rgba(7,10,16,0.62)";
    ctx.lineWidth = 2;
    roundedRect(x + 2, y + 2, size - 4, size - 4, 4, false, true);
    if (!ghost) {
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(x + 6, y + 5, size - 12, 2);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(x + 5, y + size - 8, size - 10, 3);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 8, y + size - 7);
      ctx.lineTo(x + size - 7, y + 8);
      ctx.stroke();
      if (color === colors.G) {
        ctx.strokeStyle = "rgba(229,235,240,0.22)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 9, y + 10);
        ctx.lineTo(x + 14, y + 17);
        ctx.lineTo(x + 11, y + 24);
        ctx.moveTo(x + size - 10, y + 9);
        ctx.lineTo(x + size - 17, y + 16);
        ctx.lineTo(x + size - 12, y + 25);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  return {
    drawBlock,
    drawBoard,
  };
}
