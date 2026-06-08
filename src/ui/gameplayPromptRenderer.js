export function createGameplayPromptRenderer({
  ctx,
  state,
  width,
  height,
  uiLayout,
  tutorialSteps,
  battleCountdownMs,
  firstWaveHintMs,
  firstWaveHintFadeMs,
  overlayScrim,
  t,
  clamp,
  canvasFont,
  label,
  fitLabel,
  roundedRect,
  isBattleCountdownActive,
  getCountdownCue,
}) {
  function drawTutorialPrompt() {
    if (!state.tutorial || state.mode !== "playing") return;
    const step = tutorialSteps[state.tutorial.step];
    if (!step && !state.tutorial.done) return;
    const x = 54;
    const y = 636;
    ctx.save();
    ctx.fillStyle = "rgba(3, 5, 10, 0.68)";
    roundedRect(x, y, 360, 54, 10, true, false);
    ctx.strokeStyle = state.tutorial.done
      ? "rgba(255, 240, 166, 0.54)"
      : "rgba(145, 232, 222, 0.34)";
    ctx.lineWidth = 2;
    roundedRect(x, y, 360, 54, 10, false, true);
    label(t("tutorialActive").toUpperCase(), x + 16, y + 20, 12, "#8fe8dc");
    label(
      state.tutorial.done ? t("tutorialDone") : t(step.promptKey),
      x + 16,
      y + 41,
      15,
      "#f5f1e6",
    );
    if (!state.tutorial.done) {
      const progress = `${state.tutorial.step + 1}/${tutorialSteps.length}`;
      label(progress, x + 314, y + 31, 18, "#fff0a6");
    }
    ctx.restore();
  }

  function drawDimOverlay(alpha = overlayScrim) {
    const baseAlpha = clamp(alpha, 0, 0.94);
    ctx.save();
    ctx.fillStyle = `rgba(2, 4, 8, ${baseAlpha})`;
    ctx.fillRect(0, 0, width, height);
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      80,
      width / 2,
      height / 2,
      620,
    );
    gradient.addColorStop(0, `rgba(48, 34, 70, ${Math.min(0.16, baseAlpha * 0.16)})`);
    gradient.addColorStop(0.62, `rgba(0, 0, 0, ${Math.min(0.34, baseAlpha * 0.36)})`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${Math.min(0.68, baseAlpha * 0.74)})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  function drawBattleCountdown() {
    if (!isBattleCountdownActive()) return;
    const cue = getCountdownCue();
    const shown = cue === "START" ? t("countdownStart") : cue;
    const progress = 1 - state.countdownMs / battleCountdownMs;
    const board = uiLayout.boardFrame;
    const layout = uiLayout.countdown;
    const cx = board.x + board.w / 2;
    const cy = board.y + board.h / 2 + layout.yOffset;
    const numeric = cue !== "START";
    const pulse = Math.sin(progress * Math.PI * 8) * 0.035;
    const scale = numeric ? 1 + pulse : 1 + Math.sin(progress * Math.PI) * 0.08;
    const cardX = cx - layout.cardW / 2;
    const cardY = cy - layout.cardH / 2;
    ctx.save();
    ctx.fillStyle = "rgba(1, 4, 10, 0.38)";
    roundedRect(board.x + 8, board.y + 10, board.w - 16, board.h - 20, 14, true, false);
    ctx.fillStyle = "rgba(1, 4, 10, 0.46)";
    roundedRect(cardX, cardY, layout.cardW, layout.cardH, 16, true, false);
    ctx.strokeStyle = cue === "START"
      ? "rgba(255, 240, 166, 0.62)"
      : "rgba(183, 146, 255, 0.48)";
    ctx.lineWidth = 2;
    roundedRect(cardX, cardY, layout.cardW, layout.cardH, 16, false, true);
    if (cue === "START") {
      const glow = ctx.createRadialGradient(cx, cy, 8, cx, cy, 138);
      glow.addColorStop(0, "rgba(255, 240, 166, 0.18)");
      glow.addColorStop(0.46, "rgba(255, 185, 95, 0.08)");
      glow.addColorStop(1, "rgba(255, 185, 95, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(cardX - 38, cardY - 38, layout.cardW + 76, layout.cardH + 76);
    }
    ctx.translate(cx, cy - 2);
    ctx.scale(scale, scale);
    ctx.textAlign = "center";
    ctx.shadowColor = cue === "START" ? "#fff0a6" : "#c7a7ff";
    ctx.shadowBlur = cue === "START" ? 38 : 24;
    ctx.font = canvasFont("900", numeric ? 76 : 42, shown, true);
    const gradient = ctx.createLinearGradient(-120, -60, 120, 50);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.5, cue === "START" ? "#fff0a6" : "#e2ccff");
    gradient.addColorStop(1, cue === "START" ? "#ffb95f" : "#b88cff");
    ctx.fillStyle = gradient;
    ctx.fillText(shown, 0, numeric ? 22 : 14);
    ctx.restore();

    ctx.save();
    const barW = layout.cardW - 24;
    const barX = cx - barW / 2;
    const barY = cardY + layout.cardH + layout.barGap;
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    roundedRect(barX, barY, barW, 8, 5, true, false);
    const fill = ctx.createLinearGradient(barX, barY, barX + barW, barY);
    fill.addColorStop(0, "#7ef7ff");
    fill.addColorStop(0.58, "#c7a7ff");
    fill.addColorStop(1, "#fff0a6");
    ctx.fillStyle = fill;
    roundedRect(barX, barY, barW * progress, 8, 5, true, false);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    roundedRect(barX, barY, barW, 8, 5, false, true);
    ctx.restore();
  }

  function drawFirstWaveCombatHint() {
    if (state.mode !== "playing" || isBattleCountdownActive() || state.firstWaveHintMs <= 0) return;
    const progress = 1 - state.firstWaveHintMs / firstWaveHintMs;
    const fadeIn = clamp(progress / (firstWaveHintFadeMs / firstWaveHintMs), 0, 1);
    const fadeOut = clamp(state.firstWaveHintMs / firstWaveHintFadeMs, 0, 1);
    const alpha = Math.min(fadeIn, fadeOut);
    if (alpha <= 0) return;

    const board = uiLayout.boardFrame;
    const w = 462;
    const h = 40;
    const x = board.x + board.w / 2 - w / 2;
    const y = 14;
    const text = t("firstWaveCombatHint");

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = "rgba(126, 231, 255, 0.24)";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "rgba(3, 5, 10, 0.68)";
    roundedRect(x, y, w, h, 11, true, false);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(183, 146, 255, 0.34)";
    ctx.lineWidth = 1.4;
    roundedRect(x, y, w, h, 11, false, true);
    ctx.fillStyle = "rgba(126, 231, 255, 0.12)";
    roundedRect(x + 10, y + 10, 20, 20, 6, true, false);
    ctx.strokeStyle = "rgba(126, 231, 255, 0.34)";
    roundedRect(x + 10, y + 10, 20, 20, 6, false, true);
    ctx.fillStyle = "#8fe8dc";
    ctx.textAlign = "center";
    ctx.font = canvasFont("900", 13, "!", true);
    ctx.fillText("!", x + 20, y + 25);
    ctx.textAlign = "left";
    fitLabel(text, x + 42, y + 25, w - 58, 15, "#f5f1e6", 12, "800");
    ctx.restore();
  }

  return {
    drawBattleCountdown,
    drawDimOverlay,
    drawFirstWaveCombatHint,
    drawTutorialPrompt,
  };
}
