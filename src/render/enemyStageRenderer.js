import { hexToRgba } from "./drawUtils.js";

export function createEnemyStageRenderer({
  ctx,
  state,
  uiLayout,
  characterBaselines,
  enemyBattlePortraits,
  rosterArt,
  slimeArt,
  enemyDeathAnimation,
  enemyAttackAnimations,
  getEnemyDeathTransitionState,
  debugHudEnabled,
  getDebugArtTuning,
  getBaselineAnchorY,
  alignDrawBoxToBaseline,
  drawHpBar,
  drawStageGlow,
  drawPresentationSigil,
  drawCharacterShadow,
  scaleAroundBaseline,
  drawEnemyOverlay,
  drawEnemySilhouette,
  drawSlimeFallback,
  drawRosterSprite,
  drawImageContain,
  drawSpriteAnimationFrame,
  isImageReady,
  enemyPanelRenderer,
  t,
  now = () => performance.now(),
} = {}) {
  function drawEnemy() {
    const hit = state.enemyHit > 0;
    const hitIntensity = state.enemyHitIntensity || (hit ? 0.8 : 0);
    const enemy = state.enemyType;
    const panel = uiLayout.enemyPanel;
    const stage = uiLayout.enemyStage;
    const pad = uiLayout.panelPadding;
    const left = panel.x + pad;
    const innerW = panel.w - pad * 2;
    drawHpBar(
      left,
      panel.y + 84,
      innerW,
      20,
      Math.round(state.enemyHpDisplay),
      state.enemyMaxHp,
      hit ? "#fff2ad" : "#75e298",
      t("hp"),
      {
        textValue: state.enemyHp,
        trailValue: state.enemyHpTrail,
        trailColor: "rgba(255, 119, 130, 0.38)",
      },
    );
    if (enemy.id === "king") enemyPanelRenderer.drawBossPhaseBar(left, panel.y + 112);
    const intentY = panel.y + (enemy.id === "king" ? 130 : 118);
    const intent = enemyPanelRenderer.getEnemyIntent(enemy);
    enemyPanelRenderer.drawEnemyIntent(left, intentY, intent, innerW);
    enemyPanelRenderer.drawEnemyBehaviorChips(left, intentY + 96, enemy, innerW);
    ctx.save();
    const pose = characterBaselines.enemy;
    const artTuning = getDebugArtTuning({ enabled: debugHudEnabled });
    const enemyScale = pose.scale * artTuning.enemyScale;
    const centerX = stage.x + stage.w / 2 + pose.centerOffsetX;
    const anchorY = getBaselineAnchorY(pose.groundY, pose.localY, enemyScale);
    drawStageGlow(centerX, pose.groundY, pose.glowRadius, enemy.color);
    drawPresentationSigil(centerX, pose.groundY + pose.sigilYOffset, pose.sigilRadius, enemy.color);
    ctx.translate(centerX, anchorY);
    ctx.scale(enemyScale, enemyScale);
    drawCharacterShadow(0, pose.localY, pose.shadowW, enemy.color);

    ctx.save();
    if (hit) {
      const tremor = Math.sin(now() * 0.085) * 4.2 * hitIntensity;
      const recoil = Math.cos(now() * 0.052) * 2.4 * hitIntensity;
      ctx.translate(tremor, recoil);
    }
    const pulse = 1 + Math.sin(now() * 0.006) * 0.018;
    scaleAroundBaseline(pulse, pulse, pose.localY);
    if (hit) scaleAroundBaseline(1.08, 0.92, pose.localY);
    if (drawEnemyDeathTransitionFrame(enemy)) {
      // Keep the defeated enemy visible while the next enemy fades in.
    } else if (drawEnemyAttackAnimationFrame(enemy, hit)) {
      // Enemy attack animations use the standardized frame sheets.
    } else if (drawEnemyConceptArt(enemy, hit)) {
      // Project-local concept sheets are the primary idle enemy source.
    } else if (isImageReady(rosterArt)) {
      ctx.save();
      ctx.shadowColor = hexToRgba(enemy.color, 0.55);
      ctx.shadowBlur = hit ? 34 : 22;
      if (hit) {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.88;
      }
      const tall = ["vine", "king", "mist", "wisp", "sentinel"].includes(enemy.id);
      const draw = alignDrawBoxToBaseline(
        {
          x: tall ? -132 : -126,
          y: tall ? -158 : -132,
          w: tall ? 264 : 252,
          h: tall ? 260 : 222,
        },
        characterBaselines.enemy.localY,
      );
      drawRosterSprite(enemy.id, draw.x, draw.y, draw.w, draw.h);
      ctx.restore();
    } else if (enemy.id !== "slime") {
      drawEnemySilhouette(enemy, hit);
    } else if (isImageReady(slimeArt)) {
      ctx.save();
      ctx.shadowColor = hexToRgba(enemy.color, 0.55);
      ctx.shadowBlur = hit ? 34 : 22;
      ctx.filter = enemy.filter;
      if (hit) {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.88;
      }
      const draw = alignDrawBoxToBaseline(
        { x: -122, y: -126, w: 244, h: 206 },
        characterBaselines.enemy.localY,
      );
      drawImageContain(slimeArt, draw.x, draw.y, draw.w, draw.h);
      ctx.restore();
      drawEnemyOverlay(enemy);
    } else {
      drawSlimeFallback(hit);
    }
    if (hit) drawEnemyHitFlash(enemy, hitIntensity);
    ctx.restore();
    ctx.restore();
  }

  function drawEnemyHitFlash(enemy, intensity = 1) {
    const alpha = Math.max(0, Math.min(1, state.enemyHit / 300));
    const strength = Math.min(1, alpha * (0.32 + intensity * 0.18));
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 22 + intensity * 16;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.18 * strength})`;
    ctx.beginPath();
    ctx.ellipse(0, -8, 118 + intensity * 16, 138 + intensity * 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hexToRgba(enemy.color || "#d7c2ff", 0.42 * strength);
    ctx.lineWidth = 3 + intensity;
    ctx.beginPath();
    ctx.ellipse(0, 14, 136 + intensity * 24, 54 + intensity * 12, -0.18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawEnemyConceptArt(enemy, hit) {
    const battlePortrait = enemyBattlePortraits[enemy.battleArt || enemy.id];
    if (!isImageReady(battlePortrait)) return false;
    const draw = alignDrawBoxToBaseline(
      enemy.artDraw || { x: -130, y: -150, w: 260, h: 240 },
      characterBaselines.enemy.localY,
    );
    ctx.save();
    ctx.shadowColor = hexToRgba(enemy.color, hit ? 0.82 : 0.56);
    ctx.shadowBlur = hit ? 36 : 22;
    ctx.filter = enemy.filter;
    if (hit) {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.88;
    }
    drawImageContain(battlePortrait, draw.x, draw.y, draw.w, draw.h);
    ctx.restore();
    return true;
  }

  function drawEnemyDeathTransitionFrame(enemy) {
    const transition = state.enemyDeathVfx;
    if (!transition) return false;
    const elapsed = now() - transition.startedAt;
    if (elapsed >= transition.duration) {
      state.enemyDeathVfx = null;
      return false;
    }

    const phase = getEnemyDeathTransitionState(elapsed, transition.revealNext);
    if (phase.oldAlpha > 0) {
      ctx.save();
      ctx.globalAlpha *= phase.oldAlpha;
      ctx.translate(0, -phase.oldLift);
      scaleAroundBaseline(
        phase.oldScale,
        phase.oldScale,
        characterBaselines.enemy.localY,
      );
      drawEnemyConceptArt(transition.enemy, false);
      ctx.restore();
    }

    if (isImageReady(enemyDeathAnimation.image) && phase.effectAlpha > 0) {
      const draw = enemyDeathAnimation.draw;
      ctx.save();
      ctx.globalAlpha *= phase.effectAlpha * 0.76;
      ctx.globalCompositeOperation = "screen";
      ctx.shadowColor = "#8f7cff";
      ctx.shadowBlur = 22;
      drawSpriteAnimationFrame(
        enemyDeathAnimation,
        phase.elapsed,
        draw.x,
        draw.y,
        draw.w,
        draw.h,
      );
      ctx.restore();
    }

    if (phase.nextAlpha > 0) {
      ctx.save();
      ctx.globalAlpha *= phase.nextAlpha;
      ctx.translate(0, phase.nextLift);
      drawEnemyConceptArt(enemy, false);
      ctx.restore();
    }
    return true;
  }

  function drawEnemyAttackAnimationFrame(enemy, hit) {
    if (!state.enemyAnimation || state.enemyAnimation.kind !== enemy.id) return false;
    const config = state.enemyAnimation.config || enemyAttackAnimations[enemy.id];
    if (!config) return false;
    const elapsed = now() - state.enemyAnimation.startedAt;
    if (elapsed >= state.enemyAnimation.duration) {
      state.enemyAnimation = null;
      return false;
    }
    const artTuning = getDebugArtTuning({ enabled: debugHudEnabled });
    const draw = alignDrawBoxToBaseline(
      config.draw || enemy.artDraw || { x: -140, y: -150, w: 280, h: 240 },
      characterBaselines.enemy.localY,
      {
        scale: artTuning.enemyAttackScale * (config.renderScale || 1),
        bottomOffset: config.bottomOffset || 0,
      },
    );
    ctx.save();
    ctx.shadowColor = hexToRgba(enemy.color, hit ? 0.86 : 0.62);
    ctx.shadowBlur = (hit ? 38 : 26) * (config.intensity || 1);
    ctx.filter = config.noKeying ? "none" : enemy.filter;
    if (hit) {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.9;
    }
    if (config.image) {
      if (!isImageReady(config.image)) {
        ctx.restore();
        return false;
      }
      drawSpriteAnimationFrame(config, elapsed, draw.x, draw.y, draw.w, draw.h);
      ctx.restore();
      return true;
    }
    ctx.restore();
    return false;
  }

  return {
    drawEnemy,
  };
}
