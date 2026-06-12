import { clamp } from "./drawUtils.js";

export function createMainMenuSceneRenderer({
  ctx,
  width,
  height,
  state,
  mainMenuBackground,
  mainMenuRuneArcBack,
  fallbackBackground,
  isImageReady,
  mainMenuLayout,
  prefersReducedMotion = () => false,
  now = () => performance.now(),
} = {}) {
  function drawMainMenuScene(menuMotion = null) {
    const time = now();
    const reducedMotion = prefersReducedMotion();
    const pointerX = clamp((state.pointer.x / width) * 2 - 1, -1, 1);
    const pointerY = clamp((state.pointer.y / height) * 2 - 1, -1, 1);
    const parallaxX = reducedMotion ? 0 : pointerX * 5;
    const parallaxY = reducedMotion ? 0 : pointerY * 3;
    const background = isImageReady(mainMenuBackground)
      ? mainMenuBackground
      : fallbackBackground;

    ctx.save();
    if (isImageReady(background)) {
      ctx.drawImage(
        background,
        -8 - parallaxX,
        -5 - parallaxY,
        width + 16,
        height + 10,
      );
    }

    const leftVeil = ctx.createLinearGradient(0, 0, 540, 0);
    leftVeil.addColorStop(0, "rgba(2, 4, 13, 0.62)");
    leftVeil.addColorStop(0.55, "rgba(3, 6, 18, 0.28)");
    leftVeil.addColorStop(1, "rgba(4, 7, 18, 0)");
    ctx.fillStyle = leftVeil;
    ctx.fillRect(0, 0, 570, height);

    drawFateThread(time, menuMotion);
    drawRuneArc(time, reducedMotion, menuMotion);
    drawPlatformGlow(time, reducedMotion);
    drawForegroundMist(time, reducedMotion);
    ctx.restore();
  }

  function drawRuneArc(time, reducedMotion, menuMotion) {
    if (!isImageReady(mainMenuRuneArcBack)) return;
    const arc = mainMenuLayout.runeArc;
    const pulse = reducedMotion ? 0.5 : 0.5 + Math.sin(time * 0.0019) * 0.5;
    ctx.save();
    ctx.globalAlpha *= menuMotion?.rightPanelAlpha ?? 1;
    ctx.translate(menuMotion?.rightPanelOffsetX || 0, 0);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha *= 0.05 + pulse * 0.04;
    ctx.filter = `blur(${5 + pulse * 2}px)`;
    ctx.drawImage(
      mainMenuRuneArcBack,
      arc.x - 4,
      arc.y - 3,
      arc.w + 8,
      arc.h + 6,
    );
    ctx.restore();
    ctx.save();
    ctx.globalAlpha *= menuMotion?.rightPanelAlpha ?? 1;
    ctx.translate(menuMotion?.rightPanelOffsetX || 0, 0);
    ctx.globalAlpha *= 0.58;
    ctx.drawImage(mainMenuRuneArcBack, arc.x, arc.y, arc.w, arc.h);
    ctx.restore();
  }

  function drawFateThread(time, menuMotion) {
    const reveal = clamp(menuMotion?.reveal ?? 1, 0, 1);
    const pulse = 0.5 + Math.sin(time * 0.0014) * 0.5;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = reveal * (0.06 + pulse * 0.04);
    ctx.strokeStyle = "rgba(184, 142, 255, 0.65)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 12]);
    ctx.lineDashOffset = -time * 0.012;
    ctx.beginPath();
    ctx.moveTo(width * 0.56, 58);
    ctx.bezierCurveTo(width * 0.5, 218, 510, 300, mainMenuLayout.hero.x + 16, 454);
    ctx.stroke();
    ctx.restore();
  }

  function drawPlatformGlow(time, reducedMotion) {
    const hero = mainMenuLayout.hero;
    const pulse = reducedMotion ? 0.5 : 0.5 + Math.sin(time * 0.0022) * 0.5;
    const glow = ctx.createRadialGradient(hero.x, hero.y + 18, 8, hero.x, hero.y + 18, 156);
    glow.addColorStop(0, `rgba(128, 102, 255, ${0.18 + pulse * 0.06})`);
    glow.addColorStop(0.48, "rgba(103, 220, 255, 0.07)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(hero.x - 170, hero.y - 34, 340, 116);
  }

  function drawForegroundMist(time, reducedMotion) {
    const drift = reducedMotion ? 0 : Math.sin(time * 0.00045) * 24;
    const mist = ctx.createLinearGradient(0, height - 126, 0, height);
    mist.addColorStop(0, "rgba(13, 12, 38, 0)");
    mist.addColorStop(1, "rgba(8, 7, 24, 0.42)");
    ctx.save();
    ctx.translate(drift, 0);
    ctx.fillStyle = mist;
    ctx.fillRect(-40, height - 140, width + 80, 140);
    ctx.restore();
  }

  return {
    drawMainMenuScene,
  };
}
