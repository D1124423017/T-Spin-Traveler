import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

function readPngSize(relativePath) {
  const buffer = fs.readFileSync(path.join(projectRoot, relativePath));
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

const runtimeAnimationSheets = [
  { path: "assets/images/clean/hero_melee_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/hero_ranged_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/hero_combo_01_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/hero_combo_02_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/hero_combo_03_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/hero_perfect_clear_ultimate_alpha.png", columns: 8, rows: 2 },
  { path: "assets/images/clean/noa_menu_idle_cube_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/noa_menu_idle_meditate_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_attack_slime_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_attack_vine_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_attack_mushroom_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_attack_beetle_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_attack_mist_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_attack_thorn_prowler_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_attack_wisp_moth_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_attack_ruin_sentinel_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_attack_king_16.png", columns: 4, rows: 4 },
];

const upgradedBackgrounds = [
  "assets/magic-forest-bg-v2.png",
  "assets/backgrounds/stage_forest_ruins_day.png",
  "assets/backgrounds/stage_forest_gate_night.png",
  "assets/backgrounds/stage_arcane_ruins_mid.png",
  "assets/backgrounds/stage_corrupted_forest_late.png",
  "assets/backgrounds/stage_rift_boss.png",
];

const legacyAnimationNames = [
  "Knife_alpha.png",
  "Gun_alpha.png",
  "hero_melee_20_spritesheet_alpha.png",
  "hero_combo_01_spritesheet_alpha.png",
  "hero_combo_02_spritesheet_alpha.png",
  "hero_combo_03_spritesheet_alpha.png",
  "noa_menu_idle_cube.png",
  "noa_menu_idle_meditate.png",
  "enemy_attack_slime_redesign.png",
  "enemy_attack_vine_redesign.png",
  "enemy_attack_mushroom_redesign.png",
  "enemy_attack_beetle_redesign.png",
  "enemy_attack_mist_redesign.png",
  "enemy_attack_thorn_prowler.png",
  "enemy_attack_wisp_moth.png",
  "enemy_attack_ruin_sentinel.png",
  "enemy_attack_king_redesign.png",
];

describe("image assets", () => {
  it("registers only existing image files", () => {
    const source = fs.readFileSync(path.join(projectRoot, "src/data/assets.js"), "utf8");
    const registeredImagePaths = [...source.matchAll(/registerImageAsset\([^,]+,\s*"([^"]+\.png)"/g)]
      .map((match) => match[1]);
    const missing = registeredImagePaths.filter((assetPath) => !fs.existsSync(path.join(projectRoot, assetPath)));

    expect(missing).toEqual([]);
  });

  it("keeps runtime animation sheets at 16 frames", () => {
    for (const sheet of runtimeAnimationSheets) {
      const fullPath = path.join(projectRoot, sheet.path);
      const size = readPngSize(sheet.path);

      expect(fs.existsSync(fullPath), `${sheet.path} should exist`).toBe(true);
      expect(sheet.columns * sheet.rows, `${sheet.path} should be configured as 16 frames`).toBe(16);
      expect(size.width % sheet.columns, `${sheet.path} width should divide cleanly by columns`).toBe(0);
      expect(size.height % sheet.rows, `${sheet.path} height should divide cleanly by rows`).toBe(0);
    }
  });

  it("does not keep legacy non-16 animation sheets in the clean asset folder", () => {
    const cleanDir = path.join(projectRoot, "assets/images/clean");
    const existing = new Set(fs.readdirSync(cleanDir));
    const leftovers = legacyAnimationNames.filter((name) => existing.has(name));

    expect(leftovers).toEqual([]);
  });

  it("keeps generated backgrounds at 1920 x 1080", () => {
    for (const background of upgradedBackgrounds) {
      expect(readPngSize(background)).toEqual({ width: 1920, height: 1080 });
    }
  });
});
