import { describe, expect, it } from "vitest";

class MockMedia {
  addEventListener() {}
  load() {}
}

globalThis.Image = MockMedia;
globalThis.Audio = MockMedia;

const { resolvePlayerAttackVfx } = await import("../src/render/playerAttackVfx.js");

const EXPECTED_SCALES = Object.freeze({
  slash: { projectile: 1.25, impact: 1.3 },
  doubleSlash: { projectile: 1.38, impact: 1.5 },
  tripleSlash: { projectile: 1.5, impact: 1.7 },
  combo1: { projectile: 1.38, impact: 1.5 },
  combo2: { projectile: 1.6, impact: 1.8 },
  combo3: { projectile: 1.78, impact: 2.05 },
  tetris: { projectile: 1.9, impact: 2.4 },
  tspin: { projectile: 1.8, impact: 2.25 },
  b2b: { projectile: 2, impact: 2.55 },
  ultimate: { projectile: 2.25, impact: 2.9 },
});

describe("player attack VFX scale", () => {
  it("uses graduated projectile and impact scale without changing timing", () => {
    for (const [style, expected] of Object.entries(EXPECTED_SCALES)) {
      const vfx = resolvePlayerAttackVfx(style);

      expect(vfx.projectile.scale).toBe(expected.projectile);
      expect(vfx.impact.scale).toBe(expected.impact);
      expect(vfx.projectile.startMs).toBeLessThan(vfx.hitDelayMs);
      expect(vfx.impact.startMs).toBe(vfx.hitDelayMs - 42);
    }
  });

  it("keeps special attacks larger than ordinary slash", () => {
    const slash = resolvePlayerAttackVfx("slash");

    for (const style of ["tetris", "tspin", "b2b", "ultimate"]) {
      const special = resolvePlayerAttackVfx(style);
      expect(special.projectile.scale).toBeGreaterThan(slash.projectile.scale);
      expect(special.impact.scale).toBeGreaterThan(slash.impact.scale);
    }
  });

  it("keeps combo tiers visually progressive", () => {
    const tiers = ["combo1", "combo2", "combo3"].map((style) => resolvePlayerAttackVfx(style));

    expect(tiers.map((vfx) => vfx.projectile.scale)).toEqual([1.38, 1.6, 1.78]);
    expect(tiers.map((vfx) => vfx.impact.scale)).toEqual([1.5, 1.8, 2.05]);
  });
});
