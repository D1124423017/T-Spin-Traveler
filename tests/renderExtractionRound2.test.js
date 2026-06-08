import { describe, expect, it, vi } from "vitest";
import {
  getAttackRenderPosition,
  isHeroMeleeAttackStyle,
} from "../src/render/attackEffectRenderer.js";
import { getPerfectClearVisualState } from "../src/render/combatCinematicRenderer.js";
import { createEffectStateUpdater } from "../src/render/effectStateUpdater.js";

describe("second render extraction", () => {
  it("preserves attack path progress and melee style classification", () => {
    expect(getAttackRenderPosition({
      life: 50,
      duration: 100,
      x0: 0,
      y0: 0,
      x1: 100,
      y1: 100,
    })).toEqual({
      progress: 0.5,
      x: 87.5,
      y: 45.5,
    });

    expect(isHeroMeleeAttackStyle("slash")).toBe(true);
    expect(isHeroMeleeAttackStyle("combo3")).toBe(true);
    expect(isHeroMeleeAttackStyle("ranged")).toBe(false);
    expect(isHeroMeleeAttackStyle(null)).toBe(false);
  });

  it("calculates perfect clear timing without owning effect state", () => {
    const fx = {
      startedAt: 100,
      duration: 1000,
    };
    const visual = getPerfectClearVisualState(fx, 600);

    expect(visual.elapsed).toBe(500);
    expect(visual.progress).toBe(0.5);
    expect(visual.alpha).toBe(1);
    expect(visual.burst).toBeCloseTo(Math.sin(Math.PI * 0.64));
    expect(getPerfectClearVisualState(null, 600)).toBeNull();
  });

  it("updates presentation effects while routing pending hits through a callback", () => {
    const processPendingHits = vi.fn();
    const state = {
      shake: 5,
      enemyHit: 80,
      enemyHitIntensity: 1,
      enemyHpDisplay: 100,
      enemyHp: 50,
      enemyHpTrail: 100,
      playerHit: 40,
      b2bBrokenFlash: 30,
      lineFlash: [{ life: 30 }],
      floaters: [{ x: 4, y: 10, life: 30 }],
      operationReadouts: [{ life: 30 }],
      combatPopups: [{ life: 30 }],
      bossPhaseBanner: { life: 30 },
      bossWindup: { life: 30 },
      enemyDeathVfx: {
        startedAt: 0,
        duration: 500,
      },
      attacks: [{ life: 30 }],
      perfectClearFx: {
        startedAt: 0,
        duration: 500,
      },
      bursts: [{
        radius: 10,
        intensity: 2,
        life: 30,
      }],
      particles: [{
        x: 1,
        y: 2,
        vx: 3,
        vy: 4,
        gravity: 0.5,
        spin: 0.25,
        rotation: 0,
        life: 30,
      }],
    };
    const { tickEffects } = createEffectStateUpdater({
      state,
      processPendingHits,
      now: () => 1000,
    });

    tickEffects(50);

    expect(processPendingHits).toHaveBeenCalledOnce();
    expect(state.shake).toBe(3);
    expect(state.lineFlash).toEqual([]);
    expect(state.floaters).toEqual([]);
    expect(state.operationReadouts).toEqual([]);
    expect(state.combatPopups).toEqual([]);
    expect(state.bossPhaseBanner).toBeNull();
    expect(state.bossWindup).toBeNull();
    expect(state.enemyDeathVfx).toBeNull();
    expect(state.attacks).toEqual([]);
    expect(state.perfectClearFx).toBeNull();
    expect(state.bursts).toEqual([]);
    expect(state.particles).toEqual([]);
  });
});
