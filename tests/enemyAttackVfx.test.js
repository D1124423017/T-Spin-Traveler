import { describe, expect, it } from "vitest";
import { getAnimationDuration } from "../src/render/animationTiming.js";

class MockMedia {
  addEventListener() {}
  load() {}
}

globalThis.Image = MockMedia;
globalThis.Audio = MockMedia;

const {
  BOSS_EFFECT_DURATION_MS,
  BOSS_EFFECT_FRAME_MS,
  ENEMY_ATTACK_DURATION_MS,
  ENEMY_ATTACK_FRAME_MS,
  ENEMY_ATTACK_BODY_ANIMATIONS,
  ENEMY_EFFECT_DURATION_MS,
  ENEMY_EFFECT_FRAME_MS,
  ENEMY_HIT_DELAY_MS,
  SCARAB_ATTACK_DURATION_MS,
  SCARAB_ATTACK_FRAME_MS,
  resolveEnemyAttackVfx,
} = await import("../src/render/enemyAttackVfx.js");

const NORMAL_ENEMY_IDS = ["blue_slime", "slime", "mushroom", "beetle", "vine"];
const ALL_ATTACK_ENEMY_IDS = [...NORMAL_ENEMY_IDS, "king"];
const BODY_TIMING_BY_ID = Object.freeze({
  blue_slime: { frameMs: 80, durationMs: 1280 },
  slime: { frameMs: 90, durationMs: 1440 },
  mushroom: { frameMs: 90, durationMs: 1440 },
  beetle: { frameMs: 90, durationMs: 1440 },
  vine: { frameMs: 90, durationMs: 1440 },
  king: { frameMs: 90, durationMs: 1440 },
});

describe("enemy attack VFX", () => {
  it("keeps the existing 360ms enemy hit timing authoritative", () => {
    expect(ENEMY_HIT_DELAY_MS).toBe(360);
    for (const enemyId of ALL_ATTACK_ENEMY_IDS) {
      expect(resolveEnemyAttackVfx(enemyId).hitDelayMs).toBe(360);
    }
  });

  it("uses 80ms Scarab frames and 90ms frames for the other attack bodies", () => {
    expect(SCARAB_ATTACK_FRAME_MS).toBe(80);
    expect(SCARAB_ATTACK_DURATION_MS).toBe(1280);
    expect(ENEMY_ATTACK_FRAME_MS).toBe(90);
    expect(ENEMY_ATTACK_DURATION_MS).toBe(1440);
    expect(Object.keys(ENEMY_ATTACK_BODY_ANIMATIONS)).toEqual(ALL_ATTACK_ENEMY_IDS);
    for (const enemyId of ALL_ATTACK_ENEMY_IDS) {
      const config = ENEMY_ATTACK_BODY_ANIMATIONS[enemyId];
      const expected = BODY_TIMING_BY_ID[enemyId];
      expect(config.frames).toHaveLength(16);
      expect(config.columns).toBe(4);
      expect(config.rows).toBe(4);
      expect(config.noKeying).toBe(true);
      expect(config.frameMs).toBe(expected.frameMs);
      expect(config.timing).toEqual(Array(16).fill(expected.frameMs));
      expect(config.hitFrame).toBe(4);
      expect(config.hitTimeMs).toBe(ENEMY_HIT_DELAY_MS);
      expect(getAnimationDuration(config)).toBe(expected.durationMs);
    }
  });

  it("keeps Priest projectile travel at 360ms while its frames use 60ms", () => {
    const priestProjectile = resolveEnemyAttackVfx("mushroom").projectile;
    expect(priestProjectile).not.toBeNull();
    expect(priestProjectile.startMs).toBe(0);
    expect(priestProjectile.durationMs).toBe(ENEMY_HIT_DELAY_MS);
    expect(priestProjectile.frameMs).toBe(ENEMY_EFFECT_FRAME_MS);
    expect(priestProjectile.timing).toEqual(Array(16).fill(60));
    expect(getAnimationDuration(priestProjectile)).toBe(ENEMY_EFFECT_DURATION_MS);
    for (const enemyId of NORMAL_ENEMY_IDS.filter((id) => id !== "mushroom")) {
      expect(resolveEnemyAttackVfx(enemyId).projectile).toBeNull();
    }
  });

  it("uses physical, arcane, and stone impacts for normal enemies", () => {
    const scarab = resolveEnemyAttackVfx("blue_slime");
    const mummy = resolveEnemyAttackVfx("slime");
    const priest = resolveEnemyAttackVfx("mushroom");
    const anubis = resolveEnemyAttackVfx("beetle");
    const sphinx = resolveEnemyAttackVfx("vine");

    expect(scarab.impact.id).toContain("physical");
    expect(mummy.impact.id).toContain("physical");
    expect(priest.impact.id).toContain("arcane");
    expect(anubis.impact.id).toContain("physical");
    expect(sphinx.impact.id).toContain("stone");
    for (const attack of [scarab, mummy, priest, anubis, sphinx]) {
      expect(attack.impact).toMatchObject({
        startMs: ENEMY_HIT_DELAY_MS,
        durationMs: ENEMY_EFFECT_DURATION_MS,
        frameMs: ENEMY_EFFECT_FRAME_MS,
      });
      expect(attack.impact.timing).toEqual(Array(16).fill(60));
      expect(getAnimationDuration(attack.impact)).toBe(ENEMY_EFFECT_DURATION_MS);
    }
    expect(scarab.totalDurationMs).toBe(ENEMY_HIT_DELAY_MS + ENEMY_EFFECT_DURATION_MS);
    for (const attack of [mummy, priest, anubis, sphinx]) {
      expect(attack.totalDurationMs).toBe(ENEMY_ATTACK_DURATION_MS);
    }
  });

  it("uses one shared three-layer Pharaoh attack with phase-only presentation tuning", () => {
    const phases = [1, 2, 3, 4].map((phase) => resolveEnemyAttackVfx("king", phase));
    const first = phases[0];

    expect(BOSS_EFFECT_FRAME_MS).toBe(60);
    expect(BOSS_EFFECT_DURATION_MS).toBe(960);
    expect(first.bodyConfig.frameMs).toBe(90);
    expect(first.bodyDurationMs).toBe(1440);
    expect(first.bodyConfig.hitFrame * first.bodyConfig.frameMs).toBe(ENEMY_HIT_DELAY_MS);
    expect(first.projectile).toMatchObject({
      startMs: 0,
      durationMs: ENEMY_HIT_DELAY_MS,
      frameMs: BOSS_EFFECT_FRAME_MS,
    });
    expect(first.impact).toMatchObject({
      startMs: ENEMY_HIT_DELAY_MS,
      durationMs: BOSS_EFFECT_DURATION_MS,
      frameMs: BOSS_EFFECT_FRAME_MS,
    });
    expect(first.projectile.timing).toEqual(Array(16).fill(60));
    expect(first.impact.timing).toEqual(Array(16).fill(60));
    expect(first.totalDurationMs).toBe(ENEMY_ATTACK_DURATION_MS);

    for (const attack of phases.slice(1)) {
      expect(attack.bodyConfig.image).toBe(first.bodyConfig.image);
      expect(attack.projectile.image).toBe(first.projectile.image);
      expect(attack.impact.image).toBe(first.impact.image);
    }
    expect(phases.map((attack) => attack.bodyConfig.renderScale)).toEqual([1, 1.04, 1.08, 1.12]);
    expect(phases.map((attack) => attack.intensity)).toEqual([1.18, 1.34, 1.52, 1.72]);
    expect(phases.map((attack) => attack.shake)).toEqual([10, 12, 14, 16]);
  });
});
