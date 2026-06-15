import { describe, expect, it } from "vitest";

class MockMedia {
  addEventListener() {}
  load() {}
}

globalThis.Image = MockMedia;
globalThis.Audio = MockMedia;

const { getImageAssetRecord } = await import("../src/data/assets.js");
const {
  getComboAttackStyle,
  getHeroAttackStyle,
} = await import("../src/combat/combatRules.js");
const {
  PLAYER_ATTACK_HERO_ANIMATIONS,
  resolvePlayerAttackVfx,
} = await import("../src/render/playerAttackVfx.js");

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

const EXPECTED_RUNTIME_SHEETS = Object.freeze({
  slash: "assets/images/clean/noa_attack_line_clear_slash_16.png",
  doubleSlash: "assets/images/clean/noa_attack_line_clear_slash_16.png",
  tripleSlash: "assets/images/clean/noa_attack_line_clear_slash_16.png",
  combo1: "assets/images/clean/noa_attack_combo1_16.png",
  combo2: "assets/images/clean/noa_attack_combo2_16.png",
  combo3: "assets/images/clean/noa_attack_combo3_16.png",
  combo: "assets/images/clean/noa_attack_combo2_16.png",
  tetris: "assets/images/clean/noa_attack_tetris_16.png",
  tspin: "assets/images/clean/noa_attack_tspin_16.png",
  b2b: "assets/images/clean/noa_attack_b2b_16.png",
  ultimate: "assets/images/clean/noa_attack_ultimate_16.png",
});

const EXPECTED_TIMING = Object.freeze({
  slash: [1024, 538, 70, 496],
  doubleSlash: [962, 633, 64, 591],
  tripleSlash: [922, 659, 58, 617],
  combo1: [906, 405, 48, 363],
  combo2: [908, 479, 44, 437],
  combo3: [954, 557, 40, 515],
  tetris: [1124, 819, 54, 777],
  tspin: [1036, 603, 50, 561],
  b2b: [1074, 697, 48, 655],
  ultimate: [1360, 748, 92, 706],
});

describe("player attack VFX scale", () => {
  it("keeps existing clear events mapped to the new runtime attacks", () => {
    const scenarios = [
      { lines: 1, expectedPath: EXPECTED_RUNTIME_SHEETS.slash },
      { lines: 1, combo: 2, expectedPath: EXPECTED_RUNTIME_SHEETS.combo1 },
      { lines: 1, combo: 3, expectedPath: EXPECTED_RUNTIME_SHEETS.combo2 },
      { lines: 1, combo: 4, expectedPath: EXPECTED_RUNTIME_SHEETS.combo3 },
      { lines: 4, expectedPath: EXPECTED_RUNTIME_SHEETS.tetris },
      { lines: 1, spinType: "full", expectedPath: EXPECTED_RUNTIME_SHEETS.tspin },
      { lines: 4, b2bBonus: 1, expectedPath: EXPECTED_RUNTIME_SHEETS.b2b },
      { lines: 4, perfectClear: true, expectedPath: EXPECTED_RUNTIME_SHEETS.ultimate },
    ];

    for (const scenario of scenarios) {
      const comboStyle = getComboAttackStyle(scenario.combo || 0);
      const attackStyle = getHeroAttackStyle(
        scenario.lines,
        scenario.spinType || null,
        Boolean(scenario.perfectClear),
        scenario.b2bBonus || 0,
        comboStyle,
      );
      const vfx = resolvePlayerAttackVfx(attackStyle, comboStyle);

      expect(getImageAssetRecord(vfx.heroConfig.image)?.path).toBe(scenario.expectedPath);
    }
  });

  it("maps every existing attack event to the new NOA runtime sheet", () => {
    for (const [kind, expectedPath] of Object.entries(EXPECTED_RUNTIME_SHEETS)) {
      const config = PLAYER_ATTACK_HERO_ANIMATIONS[kind];

      expect(getImageAssetRecord(config.image)?.path).toBe(expectedPath);
      expect(config.columns).toBe(4);
      expect(config.rows).toBe(4);
      expect(config.frames).toEqual(Array.from({ length: 16 }, (_, index) => index));
    }
  });

  it("uses one body-anchored scale and foot baseline for every attack", () => {
    const runtimeKinds = [
      "slash",
      "doubleSlash",
      "tripleSlash",
      "combo1",
      "combo2",
      "combo3",
      "combo",
      "tetris",
      "tspin",
      "b2b",
      "ultimate",
    ];

    for (const kind of runtimeKinds) {
      const config = PLAYER_ATTACK_HERO_ANIMATIONS[kind];

      expect(config.draw).toEqual({ x: -320, y: -600, w: 640, h: 720 });
      expect(config.bottomOffset).toBe(85);
      expect(config.frameRects).toHaveLength(16);
      expect(config.frameRects[0]).toEqual({ x: 0, y: 192, w: 512, h: 576 });
      expect(config.frameRects[15]).toEqual({ x: 1536, y: 2496, w: 512, h: 576 });
      expect(config.draw.w / config.frameRects[0].w).toBe(1.25);
      expect(config.draw.h / config.frameRects[0].h).toBe(1.25);
    }
  });

  it("preserves hero, hit, projectile, and impact timing", () => {
    for (const [style, expected] of Object.entries(EXPECTED_TIMING)) {
      const vfx = resolvePlayerAttackVfx(style);
      expect([
        vfx.heroDurationMs,
        vfx.hitDelayMs,
        vfx.projectile.startMs,
        vfx.impact.startMs,
      ]).toEqual(expected);
    }
  });

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
