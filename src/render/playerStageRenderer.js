import { getAnimationFrameInfo } from "./animationTiming.js";
import { clamp } from "./drawUtils.js";

export function createPlayerStageRenderer({
  ctx,
  state,
  uiLayout,
  characterBaselines,
  heroAnimations,
  heroLevelUpEffect,
  playerHitAnimation,
  heroHitDurationMs,
  debugHudEnabled,
  getDebugArtTuning,
  getBaselineAnchorY,
  alignDrawBoxToBaseline,
  drawHpBar,
  drawGuardMeter,
  drawStageGlow,
  drawPresentationSigil,
  drawCharacterShadow,
  drawNoaAttackPose,
  drawHeroIdleBase,
  drawHeroIdleEnergy,
  drawFallbackHeroAttackAnimation,
  drawPlayerRelicProgress,
  drawSpriteAnimationFrame,
  isImageReady,
  t,
  now = () => performance.now(),
} = {}) {
  function drawPlayer() {
    const hit = state.playerHit > 0;
    const playerAttack = state.attacks.find((attack) => attack.type === "player");
    const panel = uiLayout.playerPanel;
    const stage = uiLayout.playerStage;
    const pad = uiLayout.panelPadding;
    const left = panel.x + pad;
    const innerW = panel.w - pad * 2;
    drawHpBar(
      left,
      panel.y + 84,
      innerW,
      20,
      state.playerHp,
      state.playerMaxHp,
      hit ? "#ff7782" : "#76d4ff",
      t("hp"),
    );
    drawGuardMeter(left, panel.y + 122, innerW);
    ctx.save();
    const pose = characterBaselines.player;
    const artTuning = getDebugArtTuning({ enabled: debugHudEnabled });
    const playerScale = pose.scale * artTuning.playerScale;
    const centerX = stage.x + stage.w / 2 + pose.centerOffsetX;
    const anchorY = getBaselineAnchorY(pose.groundY, pose.localY, playerScale);
    drawStageGlow(centerX, pose.groundY, pose.glowRadius, "#6de8ff");
    drawPresentationSigil(centerX, pose.groundY + pose.sigilYOffset, pose.sigilRadius, "#6de8ff");
    ctx.translate(centerX, anchorY);
    ctx.scale(playerScale, playerScale);
    drawCharacterShadow(0, pose.localY, pose.shadowW, "#6de8ff");

    ctx.save();
    const bob = hit ? 0 : Math.sin(now() * 0.0025) * 1.2;
    ctx.translate(0, bob);
    drawHeroSprite(hit);
    if (playerAttack) drawNoaAttackPose(playerAttack);
    ctx.restore();
    ctx.restore();
    drawPlayerRelicProgress();
  }

  function drawHeroSprite(hit) {
    ctx.save();
    ctx.shadowColor = "rgba(98, 221, 255, 0.45)";
    ctx.shadowBlur = 24;

    if (drawPlayerHitAnimationFrame()) {
      ctx.restore();
      return;
    }

    if (hit) {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.82;
    }

    if (drawHeroAnimationFrame()) {
      ctx.restore();
      return;
    }

    drawHeroIdleBase();
    drawHeroIdleEnergy();
    drawHeroLevelUpEffect();
    ctx.restore();
  }

  function drawPlayerHitAnimationFrame() {
    if (state.playerHit <= 0 || !isImageReady(playerHitAnimation.image)) return false;
    const elapsed = clamp(heroHitDurationMs - state.playerHit, 0, heroHitDurationMs);
    const artTuning = getDebugArtTuning({ enabled: debugHudEnabled });
    const draw = alignDrawBoxToBaseline(
      playerHitAnimation.draw,
      characterBaselines.player.localY,
      {
        scale: characterBaselines.player.animationScale * artTuning.heroAttackScale,
        bottomOffset: playerHitAnimation.bottomOffset,
      },
    );
    drawSpriteAnimationFrame(
      playerHitAnimation,
      elapsed,
      draw.x,
      draw.y,
      draw.w,
      draw.h,
    );
    return true;
  }

  function drawHeroAnimationFrame() {
    if (!state.heroAnimation) return false;
    const config = heroAnimations[state.heroAnimation.kind];
    if (!config) return false;

    const elapsed = now() - state.heroAnimation.startedAt;
    if (elapsed >= state.heroAnimation.duration) {
      state.heroAnimation = null;
      return false;
    }
    const frameIndex = getAnimationFrameInfo(config, elapsed).frameIndex;
    if (isImageReady(config.image)) {
      const artTuning = getDebugArtTuning({ enabled: debugHudEnabled });
      const draw = alignDrawBoxToBaseline(
        config.draw || { x: -132, y: -222, w: 264, h: 410 },
        characterBaselines.player.localY,
        {
          scale: characterBaselines.player.animationScale * artTuning.heroAttackScale,
          bottomOffset: config.bottomOffset ?? characterBaselines.player.animationBottomOffset,
        },
      );
      drawSpriteAnimationFrame(config, elapsed, draw.x, draw.y, draw.w, draw.h);
    } else {
      drawFallbackHeroAttackAnimation(
        state.heroAnimation.kind,
        elapsed / state.heroAnimation.duration,
        frameIndex,
      );
    }
    return true;
  }

  function drawHeroLevelUpEffect() {
    if (!state.heroLevelUpFx) return false;
    const elapsed = now() - state.heroLevelUpFx.startedAt;
    if (elapsed >= state.heroLevelUpFx.duration) {
      state.heroLevelUpFx = null;
      return false;
    }
    if (!isImageReady(heroLevelUpEffect.image)) return true;
    const draw = heroLevelUpEffect.draw;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    drawSpriteAnimationFrame(
      heroLevelUpEffect,
      elapsed,
      draw.x,
      draw.y,
      draw.w,
      draw.h,
    );
    ctx.restore();
    return true;
  }

  return {
    drawPlayer,
  };
}
