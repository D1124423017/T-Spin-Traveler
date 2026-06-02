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

function readPngInfo(relativePath) {
  const buffer = fs.readFileSync(path.join(projectRoot, relativePath));
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    colorType: buffer.readUInt8(25),
  };
}

const runtimeAnimationSheets = [
  { path: "assets/images/clean/hero_melee_combat_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/hero_ranged_combat_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/hero_combo_01_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/hero_combo_02_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/hero_combo_03_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/hero_ultimate_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/effects/noa_level_up_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/noa_menu_idle_cube_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/noa_menu_idle_meditate_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_attack_egypt_scarab_scout_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_attack_sand_tomb_mummy_priest_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_attack_anubis_rift_guard_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_attack_maya_stone_beast_scout_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_attack_maya_eclipse_priest_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_attack_maya_feathered_serpent_guard_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_attack_atlantis_crystal_jellyfish_scout_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_attack_atlantis_tidal_shell_guard_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_attack_atlantis_rift_jellyfish_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_attack_atlantis_crystal_temple_sentinel_16.png", columns: 4, rows: 4 },
];

const upgradedBackgrounds = [
  "assets/backgrounds/egypt_star_tomb_rift_battle_bg.png",
  "assets/backgrounds/egypt_star_tomb_exterior_rift_bg.png",
  "assets/backgrounds/egypt_pyramid_observatory_rift_bg.png",
  "assets/backgrounds/maya_eclipse_temple_rift_bg.png",
  "assets/backgrounds/atlantis_sunken_crystal_temple_rift_bg.png",
];

const legacyAnimationNames = [
  "hero_melee_16_spritesheet_alpha.png",
  "hero_ranged_16_spritesheet_alpha.png",
  "hero_perfect_clear_ultimate_alpha.png",
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
  "enemy_attack_slime_16.png",
  "enemy_attack_blue_slime_16.png",
  "enemy_attack_vine_16.png",
  "enemy_attack_mushroom_16.png",
  "enemy_attack_beetle_16.png",
  "enemy_attack_mist_16.png",
  "enemy_attack_thorn_prowler_16.png",
  "enemy_attack_wisp_moth_16.png",
  "enemy_attack_ruin_sentinel_16.png",
  "enemy_attack_king_16.png",
];

const heroCombatSheets = [
  "assets/images/clean/hero_melee_combat_16_spritesheet_alpha.png",
  "assets/images/clean/hero_ranged_combat_16_spritesheet_alpha.png",
  "assets/images/clean/hero_ultimate_16_spritesheet_alpha.png",
];

const metaUpgradeIcons = [
  "assets/ui/icons/rift_energy_icon.png",
  "assets/ui/meta_upgrades/meta_upgrade_hp.png",
  "assets/ui/meta_upgrades/meta_upgrade_attack.png",
  "assets/ui/meta_upgrades/meta_upgrade_guard.png",
];

const upgradeTypeIcons = [
  "assets/ui/upgrade_cards/icons/upgrade_icon_attack.png",
  "assets/ui/upgrade_cards/icons/upgrade_icon_defense.png",
  "assets/ui/upgrade_cards/icons/upgrade_icon_survival.png",
  "assets/ui/upgrade_cards/icons/upgrade_icon_guard.png",
  "assets/ui/upgrade_cards/icons/upgrade_icon_combo.png",
  "assets/ui/upgrade_cards/icons/upgrade_icon_spin.png",
  "assets/ui/upgrade_cards/icons/upgrade_icon_garbage.png",
  "assets/ui/upgrade_cards/icons/upgrade_icon_rift.png",
];

const upgradeCardFrames = [
  "assets/ui/upgrade_cards/frames/formal_common_frame.png",
  "assets/ui/upgrade_cards/frames/formal_rare_frame.png",
  "assets/ui/upgrade_cards/frames/formal_epic_frame.png",
  "assets/ui/upgrade_cards/frames/formal_relic_frame.png",
  "assets/ui/upgrade_cards/special/formal_angel_card.png",
  "assets/ui/upgrade_cards/special/formal_devil_card.png",
];

const legendaryUpgradeEmblems = [
  "assets/ui/upgrade_cards/emblems/upgrade_emblem_singularity_spin_core.png",
  "assets/ui/upgrade_cards/emblems/upgrade_emblem_combo_constellation.png",
  "assets/ui/upgrade_cards/emblems/upgrade_emblem_aegis_star_mirror.png",
  "assets/ui/upgrade_cards/emblems/upgrade_emblem_garbage_alchemy_core.png",
  "assets/ui/upgrade_cards/emblems/upgrade_emblem_perfect_rift_crown.png",
];

const enemyBattlePortraits = [
  { path: "assets/enemies/battle/enemy_scarab_scout_battle.png", width: 1437, height: 1095 },
  { path: "assets/enemies/battle/enemy_sand_tomb_mummy_priest_battle.png", width: 1414, height: 1112 },
  { path: "assets/enemies/battle/enemy_anubis_rift_guard_battle.png", width: 1402, height: 1122 },
  { path: "assets/enemies/battle/enemy_maya_stone_beast_scout_battle.png", width: 1366, height: 1151 },
  { path: "assets/enemies/battle/enemy_maya_eclipse_priest_battle.png", width: 1149, height: 1368 },
  { path: "assets/enemies/battle/enemy_maya_feathered_serpent_guard_battle.png", width: 1106, height: 1422 },
  { path: "assets/enemies/battle/enemy_atlantis_crystal_jellyfish_scout_battle.png", width: 1160, height: 1355 },
  { path: "assets/enemies/battle/enemy_atlantis_tidal_shell_guard_battle.png", width: 1139, height: 1381 },
  { path: "assets/enemies/battle/enemy_atlantis_crystal_temple_sentinel_battle.png", width: 1151, height: 1366 },
];

describe("image assets", () => {
  it("registers only existing image files", () => {
    const source = fs.readFileSync(path.join(projectRoot, "src/data/assets.js"), "utf8");
    const registeredImagePaths = [...source.matchAll(/registerImageAsset\([^,]+,\s*"([^"]+\.png)"/g)]
      .map((match) => match[1]);
    const missing = registeredImagePaths.filter((assetPath) => !fs.existsSync(path.join(projectRoot, assetPath)));

    expect(missing).toEqual([]);
  });

  it("does not register raw or candidate image paths", () => {
    const source = fs.readFileSync(path.join(projectRoot, "src/data/assets.js"), "utf8");
    const registeredImagePaths = [...source.matchAll(/registerImageAsset\([^,]+,\s*"([^"]+\.png)"/g)]
      .map((match) => match[1]);
    const temporaryPaths = registeredImagePaths.filter((assetPath) => (
      assetPath.includes("/tmp/")
      || assetPath.includes("tmp/")
      || assetPath.includes("_candidate")
      || assetPath.includes("_raw")
    ));

    expect(temporaryPaths).toEqual([]);
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

  it("uses the normalized hero combat frame grid", () => {
    for (const sheet of heroCombatSheets) {
      expect(readPngSize(sheet)).toEqual({ width: 3584, height: 2048 });
    }
  });

  it("does not keep legacy animation sheets in the clean asset folder", () => {
    const cleanDir = path.join(projectRoot, "assets/images/clean");
    const existing = new Set(fs.readdirSync(cleanDir));
    const leftovers = legacyAnimationNames.filter((name) => existing.has(name));

    expect(leftovers).toEqual([]);
  });

  it("does not register legacy hero combat sheet paths", () => {
    const assetsSource = fs.readFileSync(path.join(projectRoot, "src/data/assets.js"), "utf8");
    const legacyHeroSheets = [
      "hero_melee_16_spritesheet_alpha.png",
      "hero_ranged_16_spritesheet_alpha.png",
      "hero_perfect_clear_ultimate_alpha.png",
    ];

    for (const sheetName of legacyHeroSheets) {
      expect(assetsSource).not.toContain(sheetName);
    }
  });

  it("keeps generated backgrounds at 1920 x 1080", () => {
    for (const background of upgradedBackgrounds) {
      expect(readPngSize(background)).toEqual({ width: 1920, height: 1080 });
    }
  });

  it("keeps generated Rift Energy and meta upgrade icons as 512px alpha PNGs", () => {
    for (const icon of metaUpgradeIcons) {
      expect(readPngInfo(icon)).toEqual({ width: 512, height: 512, colorType: 6 });
    }
  });

  it("keeps upgrade type icons as 512px alpha PNGs", () => {
    for (const icon of upgradeTypeIcons) {
      expect(readPngInfo(icon)).toEqual({ width: 512, height: 512, colorType: 6 });
    }
  });

  it("keeps legendary upgrade emblems as 512px alpha PNGs", () => {
    for (const emblem of legendaryUpgradeEmblems) {
      expect(readPngInfo(emblem)).toEqual({ width: 512, height: 512, colorType: 6 });
    }
  });

  it("keeps upgrade card frames at the in-game card ratio with alpha", () => {
    for (const frame of upgradeCardFrames) {
      expect(readPngInfo(frame)).toEqual({ width: 1024, height: 1536, colorType: 6 });
    }
  });

  it("keeps the NOA level up effect at the requested 384 x 512 frame grid", () => {
    expect(readPngInfo("assets/effects/noa_level_up_16.png")).toEqual({ width: 1536, height: 2048, colorType: 6 });
  });

  it("keeps enemy battle portraits as registered alpha PNGs", () => {
    const assetsSource = fs.readFileSync(path.join(projectRoot, "src/data/assets.js"), "utf8");
    for (const portrait of enemyBattlePortraits) {
      expect(assetsSource).toContain(portrait.path);
      expect(readPngInfo(portrait.path)).toEqual({ width: portrait.width, height: portrait.height, colorType: 6 });
    }
  });

  it("uses clean left-facing battle portrait assets for concept-sheet enemies", () => {
    const assetsSource = fs.readFileSync(path.join(projectRoot, "src/data/assets.js"), "utf8");
    const legacyPortraits = [
      "slime_battle_clean_left.png",
      "blue_slime_battle_left.png",
      "vine_battle_clean_left.png",
      "mushroom_battle_clean_left.png",
      "beetle_battle_clean_left.png",
      "mist_battle_clean_left.png",
      "thorn_battle_clean_left.png",
      "wisp_battle_clean_left.png",
      "sentinel_battle_clean_left.png",
      "king_battle_clean_left.png",
      "slime_battle_left.png",
      "vine_battle_left.png",
      "mushroom_battle_left.png",
      "beetle_battle_left.png",
      "mist_battle_left.png",
      "thorn_battle_left.png",
      "wisp_battle_left.png",
      "sentinel_battle_left.png",
      "king_battle_left.png",
    ];

    for (const portrait of legacyPortraits) {
      expect(assetsSource).not.toContain(`assets/enemies/battle/${portrait}`);
    }
  });

  it("keeps ancient civilization enemy attack sheets at the requested 384 x 512 frame grid", () => {
    const sheets = [
      "assets/images/clean/enemy_attack_egypt_scarab_scout_16.png",
      "assets/images/clean/enemy_attack_sand_tomb_mummy_priest_16.png",
      "assets/images/clean/enemy_attack_anubis_rift_guard_16.png",
      "assets/images/clean/enemy_attack_maya_stone_beast_scout_16.png",
      "assets/images/clean/enemy_attack_maya_eclipse_priest_16.png",
      "assets/images/clean/enemy_attack_maya_feathered_serpent_guard_16.png",
      "assets/images/clean/enemy_attack_atlantis_crystal_jellyfish_scout_16.png",
      "assets/images/clean/enemy_attack_atlantis_tidal_shell_guard_16.png",
      "assets/images/clean/enemy_attack_atlantis_rift_jellyfish_16.png",
      "assets/images/clean/enemy_attack_atlantis_crystal_temple_sentinel_16.png",
    ];

    for (const sheet of sheets) {
      expect(readPngInfo(sheet)).toEqual({ width: 1536, height: 2048, colorType: 6 });
    }
  });
});
