import { animateNumber } from "./drawUtils.js";

export function createEffectStateUpdater({
  state,
  processPendingHits,
  now = () => performance.now(),
}) {
  function tickEffects(dt) {
    processPendingHits();
    state.shake = Math.max(0, state.shake - dt * 0.04);
    state.enemyHit = Math.max(0, state.enemyHit - dt);
    state.enemyHitIntensity = Math.max(0, state.enemyHitIntensity - dt * 0.0032);
    state.enemyHpDisplay = animateNumber(state.enemyHpDisplay, state.enemyHp, dt, 125);
    state.enemyHpTrail = animateNumber(state.enemyHpTrail, state.enemyHp, dt, 520);
    state.playerHit = Math.max(0, state.playerHit - dt);
    state.b2bBrokenFlash = Math.max(0, state.b2bBrokenFlash - dt);
    state.lineFlash = state.lineFlash
      .map((flash) => ({ ...flash, life: flash.life - dt }))
      .filter((flash) => flash.life > 0);
    state.floaters = state.floaters
      .map((floater) => ({ ...floater, y: floater.y - dt * 0.035, life: floater.life - dt }))
      .filter((floater) => floater.life > 0);
    state.operationReadouts = state.operationReadouts
      .map((readout) => ({ ...readout, life: readout.life - dt }))
      .filter((readout) => readout.life > 0);
    state.combatPopups = state.combatPopups
      .map((popup) => ({ ...popup, life: popup.life - dt }))
      .filter((popup) => popup.life > 0);
    if (state.bossPhaseBanner) {
      state.bossPhaseBanner.life -= dt;
      if (state.bossPhaseBanner.life <= 0) state.bossPhaseBanner = null;
    }
    if (state.bossWindup) {
      state.bossWindup.life -= dt;
      if (state.bossWindup.life <= 0) state.bossWindup = null;
    }
    if (
      state.enemyDeathVfx
      && now() - state.enemyDeathVfx.startedAt >= state.enemyDeathVfx.duration
    ) {
      state.enemyDeathVfx = null;
    }
    state.attacks = state.attacks
      .map((attack) => ({ ...attack, life: attack.life - dt }))
      .filter((attack) => attack.life > 0);
    if (
      state.perfectClearFx
      && now() - state.perfectClearFx.startedAt >= state.perfectClearFx.duration
    ) {
      state.perfectClearFx = null;
    }
    state.bursts = state.bursts
      .map((burst) => ({
        ...burst,
        radius: burst.radius + dt * 0.42 * burst.intensity,
        life: burst.life - dt,
      }))
      .filter((burst) => burst.life > 0);
    state.particles = state.particles
      .map((particle) => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + (particle.gravity ?? 0.08),
        rotation: (particle.rotation || 0) + (particle.spin || 0),
        life: particle.life - dt,
      }))
      .filter((particle) => particle.life > 0);
  }

  return {
    tickEffects,
  };
}
