const GRID_4_BY_4 = Object.freeze({
  columns: 4,
  rows: 4,
  frames: Object.freeze(Array.from({ length: 16 }, (_, index) => index)),
});

function sheet(id, groupKey, path, frameMs, grid = GRID_4_BY_4) {
  return Object.freeze({
    id,
    groupKey,
    path,
    frameMs,
    ...grid,
  });
}

export const SPRITE_SHEET_CATALOG = Object.freeze([
  sheet("menu-idle-cube-sheet-16", "spriteTestGroupMenu", "assets/images/clean/noa_menu_idle_cube_16.png", 122),
  sheet("menu-idle-meditate-sheet-16", "spriteTestGroupMenu", "assets/images/clean/noa_menu_idle_meditate_16.png", 142),
  sheet("hero-melee-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_melee_combat_16_spritesheet_alpha.png", 62),
  sheet("hero-ranged-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_ranged_combat_16_spritesheet_alpha.png", 56),
  sheet("hero-combo-1-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_combo_01_16_spritesheet_alpha.png", 60),
  sheet("hero-combo-2-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_combo_02_16_spritesheet_alpha.png", 60),
  sheet("hero-combo-3-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_combo_03_16_spritesheet_alpha.png", 60),
  sheet("hero-ultimate-sheet", "spriteTestGroupHero", "assets/images/clean/hero_ultimate_16_spritesheet_alpha.png", 85),
  sheet("hero-slash-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_attack_slash_16_spritesheet_alpha.png", 58),
  sheet("hero-double-slash-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_attack_double_slash_16_spritesheet_alpha.png", 56),
  sheet("hero-triple-slash-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_attack_triple_slash_16_spritesheet_alpha.png", 54),
  sheet("hero-tetris-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_attack_tetris_16_spritesheet_alpha.png", 64),
  sheet("hero-tspin-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_attack_tspin_16_spritesheet_alpha.png", 58),
  sheet("hero-combo-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_attack_combo_16_spritesheet_alpha.png", 54),
  sheet("hero-b2b-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_attack_b2b_16_spritesheet_alpha.png", 60),
  sheet("noa-level-up-sheet-16", "spriteTestGroupEffect", "assets/effects/noa_level_up_16.png", 52),
  sheet("enemy-attack-egypt-scarab-scout-16", "spriteTestGroupEnemy", "assets/images/clean/enemy_attack_egypt_scarab_scout_16.png", 60),
  sheet("enemy-attack-sand-tomb-mummy-priest-16", "spriteTestGroupEnemy", "assets/images/clean/enemy_attack_sand_tomb_mummy_priest_16.png", 60),
  sheet("enemy-attack-anubis-rift-guard-16", "spriteTestGroupEnemy", "assets/images/clean/enemy_attack_anubis_rift_guard_16.png", 60),
  sheet("enemy-attack-maya-stone-beast-scout-16", "spriteTestGroupEnemy", "assets/images/clean/enemy_attack_maya_stone_beast_scout_16.png", 60),
  sheet("enemy-attack-maya-eclipse-priest-16", "spriteTestGroupEnemy", "assets/images/clean/enemy_attack_maya_eclipse_priest_16.png", 60),
  sheet("enemy-attack-maya-feathered-serpent-guard-16", "spriteTestGroupEnemy", "assets/images/clean/enemy_attack_maya_feathered_serpent_guard_16.png", 62),
  sheet("enemy-attack-atlantis-crystal-jellyfish-scout-16", "spriteTestGroupEnemy", "assets/images/clean/enemy_attack_atlantis_crystal_jellyfish_scout_16.png", 60),
  sheet("enemy-attack-atlantis-tidal-shell-guard-16", "spriteTestGroupEnemy", "assets/images/clean/enemy_attack_atlantis_tidal_shell_guard_16.png", 60),
  sheet("enemy-attack-atlantis-rift-jellyfish-16", "spriteTestGroupEnemy", "assets/images/clean/enemy_attack_atlantis_rift_jellyfish_16.png", 60),
  sheet("enemy-attack-atlantis-crystal-temple-sentinel-16", "spriteTestGroupEnemy", "assets/images/clean/enemy_attack_atlantis_crystal_temple_sentinel_16.png", 62),
]);
