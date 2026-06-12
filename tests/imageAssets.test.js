import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { SPRITE_SHEET_CATALOG } from "../src/debug/spriteSheetCatalog.js";

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
  { path: "assets/images/clean/hero_line_clear_slash_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/hero_attack_combo_01_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/hero_attack_combo_02_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/hero_attack_combo_03_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/hero_tetris_attack_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/hero_tspin_attack_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/hero_b2b_attack_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/hero_ultimate_attack_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/effects/hero_sword_wave_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/effects/hero_impact_burst_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/effects/noa_level_up_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/noa_menu_idle_cube_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/noa_menu_idle_meditate_16.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/hero_hit_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_egypt_rift_scarab_attack_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_egypt_mummy_attack_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_egypt_priest_attack_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_egypt_anubis_guard_attack_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_egypt_sphinx_attack_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/images/clean/enemy_egypt_pharaoh_king_attack_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/effects/enemy_rift_projectile_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/effects/enemy_impact_physical_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/effects/enemy_impact_arcane_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/effects/enemy_impact_stone_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/effects/enemy_pharaoh_projectile_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/effects/enemy_pharaoh_impact_16_spritesheet_alpha.png", columns: 4, rows: 4 },
  { path: "assets/effects/enemy_death_16_spritesheet_alpha.png", columns: 4, rows: 4 },
];

const upgradedBackgrounds = [
  "assets/backgrounds/egypt_star_tomb_rift_battle_bg.png",
  "assets/backgrounds/egypt_star_tomb_exterior_rift_bg.png",
  "assets/backgrounds/egypt_pyramid_observatory_rift_bg.png",
  "assets/backgrounds/maya_eclipse_temple_rift_bg.png",
  "assets/backgrounds/atlantis_sunken_crystal_temple_rift_bg.png",
];

const mainMenuAssets = [
  {
    path: "assets/images/menu/main-menu-home-kingdom-bg.png",
    width: 2560,
    height: 1440,
    colorType: 2,
  },
  {
    path: "assets/images/menu/main-menu-rift-kingdom-bg.png",
    width: 2560,
    height: 1440,
    colorType: 2,
  },
  {
    path: "assets/images/menu/main-menu-rune-arc-back.png",
    width: 1024,
    height: 1536,
    colorType: 6,
  },
  {
    path: "assets/images/menu/main-menu-primary-frame.png",
    width: 1536,
    height: 384,
    colorType: 6,
  },
  {
    path: "assets/images/menu/main-menu-secondary-frame.png",
    width: 1536,
    height: 256,
    colorType: 6,
  },
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
  "Enemy01_alpha.png",
  "Enemy02_alpha.png",
  "noa_battle_idle.png",
  "noa_feedback_bow.png",
  "hero_melee_combat_16_spritesheet_alpha.png",
  "hero_ranged_combat_16_spritesheet_alpha.png",
  "hero_combo_01_16_spritesheet_alpha.png",
  "hero_combo_02_16_spritesheet_alpha.png",
  "hero_combo_03_16_spritesheet_alpha.png",
  "hero_ultimate_16_spritesheet_alpha.png",
  "hero_attack_slash_16_spritesheet_alpha.png",
  "hero_attack_double_slash_16_spritesheet_alpha.png",
  "hero_attack_triple_slash_16_spritesheet_alpha.png",
  "hero_attack_tetris_16_spritesheet_alpha.png",
  "hero_attack_tspin_16_spritesheet_alpha.png",
  "hero_attack_combo_16_spritesheet_alpha.png",
  "hero_attack_b2b_16_spritesheet_alpha.png",
];

const heroPresentationAssets = [
  { path: "assets/images/clean/ET_Character_fullbody_alpha.png", width: 1024, height: 1536 },
  { path: "assets/images/clean/noa_feedback_thanks_alpha.png", width: 1024, height: 1536 },
];

const retiredNoaStaticAssets = [
  "assets/images/clean/ET_Character_alpha.png",
  "assets/images/clean/noa_menu_showcase.png",
];

const mainMenuDialogueAsset = {
  path: "assets/images/menu/main-menu-dialogue-frame.png",
  width: 1942,
  height: 809,
  colorType: 6,
};

const equipmentAssets = [
  {
    path: "assets/images/equipment/equipment-roulette-wheel.png",
    width: 1254,
    height: 1254,
  },
  {
    path: "assets/images/equipment/noa-cheat-hand.png",
    width: 1705,
    height: 923,
  },
];

const equipmentIconPaths = [
  "wanderer-observer-hood",
  "torn-traveler-cloak",
  "shard-crystal-dagger",
  "star-pattern-headwrap",
  "resonance-cloak",
  "pulse-crystal-blade",
  "rift-observer-crown",
  "phase-long-cloak",
  "orbital-longsword",
  "royal-crystal-crown",
  "royal-nightfall-cloak",
  "rift-sovereignty-blade",
  "rift-king-mask",
  "fate-deception-cloak",
  "cheaters-amethyst-sword",
].map((id) => `assets/images/equipment/icons/${id}.png`);

const heroAttackVfxSheets = [
  "assets/images/clean/hero_line_clear_slash_16_spritesheet_alpha.png",
  "assets/images/clean/hero_attack_combo_01_16_spritesheet_alpha.png",
  "assets/images/clean/hero_attack_combo_02_16_spritesheet_alpha.png",
  "assets/images/clean/hero_attack_combo_03_16_spritesheet_alpha.png",
  "assets/images/clean/hero_tetris_attack_16_spritesheet_alpha.png",
  "assets/images/clean/hero_tspin_attack_16_spritesheet_alpha.png",
  "assets/images/clean/hero_b2b_attack_16_spritesheet_alpha.png",
  "assets/images/clean/hero_ultimate_attack_16_spritesheet_alpha.png",
  "assets/effects/hero_sword_wave_16_spritesheet_alpha.png",
  "assets/effects/hero_impact_burst_16_spritesheet_alpha.png",
];

const formalHeroCatalogIds = [
  "hero-line-clear-slash-sheet-16",
  "hero-combo-1-sheet-16",
  "hero-combo-2-sheet-16",
  "hero-combo-3-sheet-16",
  "hero-tetris-sheet-16",
  "hero-tspin-sheet-16",
  "hero-b2b-sheet-16",
  "hero-ultimate-sheet-16",
  "hero-hit-sheet-16",
];

const formalPlayerVfxCatalogIds = [
  "hero-sword-wave-sheet-16",
  "hero-impact-burst-sheet-16",
];

const formalEnemyCatalogIds = [
  "enemy-egypt-rift-scarab-attack-sheet-16",
  "enemy-egypt-mummy-attack-sheet-16",
  "enemy-egypt-priest-attack-sheet-16",
  "enemy-egypt-anubis-guard-attack-sheet-16",
  "enemy-egypt-sphinx-attack-sheet-16",
  "enemy-egypt-pharaoh-king-attack-sheet-16",
];

const formalEnemyVfxCatalogIds = [
  "enemy-rift-projectile-sheet-16",
  "enemy-impact-physical-sheet-16",
  "enemy-impact-arcane-sheet-16",
  "enemy-impact-stone-sheet-16",
  "enemy-pharaoh-projectile-sheet-16",
  "enemy-pharaoh-impact-sheet-16",
  "enemy-death-sheet-16",
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
  { path: "assets/enemies/battle/enemy_egypt_rift_scarab_scout_battle.png", width: 1193, height: 895 },
  { path: "assets/enemies/battle/enemy_egypt_sand_tomb_mummy_battle.png", width: 605, height: 1208 },
  { path: "assets/enemies/battle/enemy_egyptian_priest_battle.png", width: 875, height: 1249 },
  { path: "assets/enemies/battle/enemy_egypt_anubis_guard_battle.png", width: 913, height: 1301 },
  { path: "assets/enemies/battle/enemy_egypt_sphinx_stone_guardian_battle.png", width: 1148, height: 1053 },
  { path: "assets/enemies/battle/enemy_egypt_pharaoh_king_battle.png", width: 997, height: 1193 },
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

  it("uses 512 x 768 cells for formal player attack and VFX sheets", () => {
    for (const sheet of heroAttackVfxSheets) {
      expect(readPngInfo(sheet)).toEqual({ width: 2048, height: 3072, colorType: 6 });
    }
  });

  it("keeps the Pharaoh body and two effect sheets at production alpha dimensions", () => {
    expect(readPngInfo("assets/images/clean/enemy_egypt_pharaoh_king_attack_16_spritesheet_alpha.png"))
      .toEqual({ width: 1536, height: 2048, colorType: 6 });
    for (const sheet of [
      "assets/effects/enemy_pharaoh_projectile_16_spritesheet_alpha.png",
      "assets/effects/enemy_pharaoh_impact_16_spritesheet_alpha.png",
    ]) {
      expect(readPngInfo(sheet)).toEqual({ width: 2048, height: 2048, colorType: 6 });
    }
  });

  it("keeps only formal player attack sheets in the sprite-test hero catalog", () => {
    const ids = SPRITE_SHEET_CATALOG
      .filter((sheet) => sheet.groupKey === "spriteTestGroupHero")
      .map((sheet) => sheet.id);

    expect(ids).toEqual(formalHeroCatalogIds);
  });

  it("keeps only formal player VFX sheets under hero effect ids", () => {
    const ids = SPRITE_SHEET_CATALOG
      .filter((sheet) => sheet.groupKey === "spriteTestGroupEffect" && sheet.id.startsWith("hero-"))
      .map((sheet) => sheet.id);

    expect(ids).toEqual(formalPlayerVfxCatalogIds);
  });

  it("keeps only active Egypt attack sheets in the sprite-test enemy catalog", () => {
    const ids = SPRITE_SHEET_CATALOG
      .filter((sheet) => sheet.groupKey === "spriteTestGroupEnemy")
      .map((sheet) => sheet.id);

    expect(ids).toEqual(formalEnemyCatalogIds);
  });

  it("registers the shared enemy projectile, impact, and death sheets in sprite-test", () => {
    const ids = SPRITE_SHEET_CATALOG
      .filter((sheet) => sheet.groupKey === "spriteTestGroupEffect" && sheet.id.startsWith("enemy-"))
      .map((sheet) => sheet.id);

    expect(ids).toEqual(formalEnemyVfxCatalogIds);
  });

  it("does not keep legacy animation sheets in the clean asset folder", () => {
    const cleanDir = path.join(projectRoot, "assets/images/clean");
    const existing = new Set(fs.readdirSync(cleanDir));
    const leftovers = legacyAnimationNames.filter((name) => existing.has(name));

    expect(leftovers).toEqual([]);
  });

  it("does not register superseded player attack sheet paths", () => {
    const assetsSource = fs.readFileSync(path.join(projectRoot, "src/data/assets.js"), "utf8");
    const legacyHeroSheets = [
      "hero_melee_16_spritesheet_alpha.png",
      "hero_ranged_16_spritesheet_alpha.png",
      "hero_perfect_clear_ultimate_alpha.png",
      ...legacyAnimationNames.filter((name) => name.startsWith("hero_")),
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

  it("keeps the formal main menu background and alpha button frames at production sizes", () => {
    const assetsSource = fs.readFileSync(path.join(projectRoot, "src/data/assets.js"), "utf8");
    for (const asset of mainMenuAssets) {
      expect(assetsSource).toContain(asset.path);
      expect(readPngInfo(asset.path)).toEqual({
        width: asset.width,
        height: asset.height,
        colorType: asset.colorType,
      });
    }
  });

  it("uses the home kingdom key art with the previous menu background as fallback", () => {
    const gameSource = fs.readFileSync(path.join(projectRoot, "game.js"), "utf8");

    expect(gameSource).toContain("mainMenuBackground: mainMenuHomeKingdomBg");
    expect(gameSource).toContain("fallbackBackground: mainMenuRiftKingdomBg");
  });

  it("keeps the superseded portal shrine file without loading it at runtime", () => {
    const legacyShrine = "assets/images/menu/main-menu-portal-shrine.png";
    const assetsSource = fs.readFileSync(path.join(projectRoot, "src/data/assets.js"), "utf8");

    expect(fs.existsSync(path.join(projectRoot, legacyShrine))).toBe(true);
    expect(assetsSource).not.toContain(`registerImageAsset("main-menu-portal-shrine"`);
  });

  it("keeps generated Rift Energy and meta upgrade icons as 1024px alpha PNGs", () => {
    for (const icon of metaUpgradeIcons) {
      expect(readPngInfo(icon)).toEqual({ width: 1024, height: 1024, colorType: 6 });
    }
  });

  it("keeps canonical NOA presentation art as alpha PNGs", () => {
    const assetsSource = fs.readFileSync(path.join(projectRoot, "src/data/assets.js"), "utf8");
    for (const asset of heroPresentationAssets) {
      expect(assetsSource).toContain(asset.path);
      expect(readPngInfo(asset.path)).toEqual({ width: asset.width, height: asset.height, colorType: 6 });
    }
  });

  it("uses the canonical full-body NOA art for menu and equipment presentation", () => {
    const assetsSource = fs.readFileSync(path.join(projectRoot, "src/data/assets.js"), "utf8");
    const gameSource = fs.readFileSync(path.join(projectRoot, "game.js"), "utf8");

    expect(assetsSource).toContain(
      'registerImageAsset("hero-idle-canonical", "assets/images/clean/ET_Character_fullbody_alpha.png")',
    );
    expect(gameSource).toContain("noaPreviewArt: heroIdleArt");
    expect(gameSource).toContain(
      "getMenuHeroIdlePlayback(now).active && drawMenuHeroIdleSprite(now)",
    );
    expect(gameSource).toContain("if (isImageReady(heroIdleArt))");
    expect(gameSource).not.toContain("noaMenuShowcaseArt");
  });

  it("removes retired static NOA art without touching combat spritesheets", () => {
    const assetsSource = fs.readFileSync(path.join(projectRoot, "src/data/assets.js"), "utf8");
    const gameSource = fs.readFileSync(path.join(projectRoot, "game.js"), "utf8");

    for (const legacyPath of retiredNoaStaticAssets) {
      expect(fs.existsSync(path.join(projectRoot, legacyPath))).toBe(false);
      expect(assetsSource).not.toContain(legacyPath);
      expect(gameSource).not.toContain(legacyPath);
    }
    for (const sheet of heroAttackVfxSheets) {
      expect(fs.existsSync(path.join(projectRoot, sheet))).toBe(true);
    }
  });

  it("keeps the formal main menu dialogue frame as an alpha PNG", () => {
    const assetsSource = fs.readFileSync(path.join(projectRoot, "src/data/assets.js"), "utf8");

    expect(assetsSource).toContain(mainMenuDialogueAsset.path);
    expect(readPngInfo(mainMenuDialogueAsset.path)).toEqual({
      width: mainMenuDialogueAsset.width,
      height: mainMenuDialogueAsset.height,
      colorType: mainMenuDialogueAsset.colorType,
    });
  });

  it("keeps the large equipment wheel and NOA cheat presentation as formal alpha assets", () => {
    const assetsSource = fs.readFileSync(path.join(projectRoot, "src/data/assets.js"), "utf8");
    for (const asset of equipmentAssets) {
      expect(assetsSource).toContain(asset.path);
      expect(readPngInfo(asset.path)).toEqual({
        width: asset.width,
        height: asset.height,
        colorType: 6,
      });
    }
  });

  it("keeps one distinct formal alpha icon for every equipment item", () => {
    const assetsSource = fs.readFileSync(path.join(projectRoot, "src/data/assets.js"), "utf8");
    const hashes = new Set();
    for (const iconPath of equipmentIconPaths) {
      expect(assetsSource).toContain(iconPath);
      expect(readPngInfo(iconPath)).toEqual({
        width: 1254,
        height: 1254,
        colorType: 6,
      });
      hashes.add(fs.readFileSync(path.join(projectRoot, iconPath)).toString("base64"));
    }
    expect(hashes.size).toBe(equipmentIconPaths.length);
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

  it("keeps active Egypt enemy attack sheets at the requested 384 x 512 frame grid", () => {
    const sheets = [
      "assets/images/clean/enemy_egypt_rift_scarab_attack_16_spritesheet_alpha.png",
      "assets/images/clean/enemy_egypt_mummy_attack_16_spritesheet_alpha.png",
      "assets/images/clean/enemy_egypt_priest_attack_16_spritesheet_alpha.png",
      "assets/images/clean/enemy_egypt_anubis_guard_attack_16_spritesheet_alpha.png",
      "assets/images/clean/enemy_egypt_sphinx_attack_16_spritesheet_alpha.png",
    ];

    for (const sheet of sheets) {
      expect(readPngInfo(sheet)).toEqual({ width: 1536, height: 2048, colorType: 6 });
    }
  });

  it("keeps hero hit at 512 x 768 per frame and enemy VFX at 512 x 512 per frame", () => {
    expect(readPngInfo("assets/images/clean/hero_hit_16_spritesheet_alpha.png"))
      .toEqual({ width: 2048, height: 3072, colorType: 6 });

    for (const sheet of [
      "assets/effects/enemy_rift_projectile_16_spritesheet_alpha.png",
      "assets/effects/enemy_impact_physical_16_spritesheet_alpha.png",
      "assets/effects/enemy_impact_arcane_16_spritesheet_alpha.png",
      "assets/effects/enemy_impact_stone_16_spritesheet_alpha.png",
      "assets/effects/enemy_death_16_spritesheet_alpha.png",
    ]) {
      expect(readPngInfo(sheet)).toEqual({ width: 2048, height: 2048, colorType: 6 });
    }
  });
});
