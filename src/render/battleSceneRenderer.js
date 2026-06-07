import { hexToRgba } from "./drawUtils.js";

export function createBattleSceneRenderer({
  ctx,
  state,
  uiLayout,
  t,
  canvasFont,
  fitLabel,
  roundedRect,
  drawCornerGlyph,
  drawTopQuestBar,
  enemyName,
} = {}) {
function drawPanels() {
  drawTitle();
  const player = uiLayout.playerPanel;
  const enemy = uiLayout.enemyPanel;
  const board = uiLayout.boardFrame;
  drawBoardFocusAura(board);
  drawHudPanel(player.x, player.y, player.w, player.h, t("ally").toUpperCase(), "NOA");
  drawHudPanel(enemy.x, enemy.y, enemy.w, enemy.h, t("enemy").toUpperCase(), enemyName(state.enemyType));
  drawBoardFrame(board.x, board.y, board.w, board.h);
  drawTopQuestBar();
}

function drawTitle() {
  ctx.save();
  ctx.font = canvasFont("900", 28, t("startTitle"), true);
  ctx.shadowColor = "rgba(175, 112, 255, 0.38)";
  ctx.shadowBlur = 14;
  const g = ctx.createLinearGradient(48, 20, 318, 48);
  g.addColorStop(0, "#f9f5e6");
  g.addColorStop(0.45, "#ffe0a3");
  g.addColorStop(1, "#c7a7ff");
  ctx.fillStyle = g;
  ctx.fillText(t("startTitle"), 48, 40);
  ctx.font = canvasFont("700", 13, t("navigationCore"));
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(230, 244, 255, 0.5)";
  ctx.fillText(t("navigationCore"), 50, 58);
  ctx.restore();
}

function drawBoardFocusAura(board) {
  ctx.save();
  const cx = board.x + board.w / 2;
  const cy = board.y + board.h / 2;
  const halo = ctx.createRadialGradient(cx, cy, 160, cx, cy, 390);
  halo.addColorStop(0, "rgba(105, 96, 255, 0.16)");
  halo.addColorStop(0.48, "rgba(99, 217, 255, 0.055)");
  halo.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = halo;
  ctx.fillRect(board.x - 180, board.y - 60, board.w + 360, board.h + 120);
  const sideGlow = ctx.createLinearGradient(board.x - 20, board.y, board.x + board.w + 20, board.y);
  sideGlow.addColorStop(0, "rgba(126, 231, 255, 0)");
  sideGlow.addColorStop(0.48, "rgba(159, 128, 255, 0.16)");
  sideGlow.addColorStop(1, "rgba(126, 231, 255, 0)");
  ctx.fillStyle = sideGlow;
  roundedRect(board.x - 16, board.y - 18, board.w + 32, board.h + 36, 16, true, false);
  ctx.restore();
}

function drawHudPanel(x, y, w, h, tag, name) {
  const isAlly = name === "NOA";
  const accent = isAlly ? "#7ee7ff" : "#ffb95f";
  ctx.save();
  const bg = ctx.createLinearGradient(x, y, x, y + h);
  bg.addColorStop(0, "rgba(4, 8, 15, 0.72)");
  bg.addColorStop(0.58, "rgba(5, 8, 13, 0.46)");
  bg.addColorStop(1, "rgba(11, 7, 18, 0.58)");
  ctx.fillStyle = bg;
  ctx.shadowColor = hexToRgba(accent, 0.1);
  ctx.shadowBlur = 18;
  roundedRect(x, y, w, h, 18, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = hexToRgba(accent, 0.32);
  ctx.lineWidth = 1.4;
  roundedRect(x, y, w, h, 18, false, true);
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  roundedRect(x + 7, y + 7, w - 14, h - 14, 13, false, true);

  ctx.fillStyle = "rgba(3, 6, 12, 0.62)";
  roundedRect(x + 18, y + 18, w - 36, 54, 12, true, false);
  ctx.strokeStyle = hexToRgba(accent, 0.26);
  roundedRect(x + 18, y + 18, w - 36, 54, 12, false, true);
  ctx.font = canvasFont("800", 12, tag, true);
  ctx.fillStyle = hexToRgba(accent, 0.76);
  ctx.fillText(tag, x + 34, y + 39);
  ctx.shadowColor = hexToRgba(accent, 0.26);
  ctx.shadowBlur = 10;
  fitLabel(name, x + 34, y + 63, w - 90, 24, "#f3f2ea", 16, "900");
  ctx.shadowBlur = 0;
  drawCornerGlyph(x + w - 42, y + 35, accent);
  ctx.restore();
}

function drawBoardFrame(x, y, w, h) {
  ctx.save();
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, "rgba(12, 18, 31, 0.96)");
  g.addColorStop(0.52, "rgba(3, 6, 12, 0.98)");
  g.addColorStop(1, "rgba(20, 12, 34, 0.94)");
  ctx.fillStyle = g;
  ctx.shadowColor = "rgba(126, 101, 255, 0.52)";
  ctx.shadowBlur = 32;
  roundedRect(x, y, w, h, 14, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(239, 229, 202, 0.78)";
  ctx.lineWidth = 2.8;
  roundedRect(x, y, w, h, 14, false, true);
  ctx.strokeStyle = "rgba(138, 108, 255, 0.48)";
  ctx.lineWidth = 7;
  roundedRect(x + 5, y + 5, w - 10, h - 10, 10, false, true);
  ctx.strokeStyle = "rgba(126, 231, 255, 0.24)";
  ctx.lineWidth = 1;
  roundedRect(x + 12, y + 12, w - 24, h - 24, 3, false, true);
  const gemX = x + w / 2;
  const gemY = y - 2;
  ctx.fillStyle = "rgba(12, 18, 31, 0.88)";
  roundedRect(gemX - 34, gemY - 10, 68, 18, 9, true, false);
  drawCornerGlyph(gemX, gemY - 1, "#b99cff");
  ctx.restore();
}

  return {
    drawPanels,
  };
}
