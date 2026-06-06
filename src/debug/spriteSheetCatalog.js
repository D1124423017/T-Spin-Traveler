const GRID_4_BY_4 = Object.freeze({
  columns: 4,
  rows: 4,
  frames: Object.freeze(Array.from({ length: 16 }, (_, index) => index)),
});

function fixedFrameRects(cellWidth, cellHeight, viewport) {
  return Object.freeze(GRID_4_BY_4.frames.map((frame) => Object.freeze({
    x: (frame % GRID_4_BY_4.columns) * cellWidth + viewport.x,
    y: Math.floor(frame / GRID_4_BY_4.columns) * cellHeight + viewport.y,
    w: viewport.w,
    h: viewport.h,
  })));
}

const HERO_ATTACK_GRID = Object.freeze({
  ...GRID_4_BY_4,
  frameRects: fixedFrameRects(512, 768, { x: 0, y: 192, w: 512, h: 576 }),
});

const HERO_ULTIMATE_GRID = Object.freeze({
  ...GRID_4_BY_4,
  frameRects: fixedFrameRects(512, 768, { x: 72, y: 448, w: 368, h: 320 }),
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
  sheet("hero-line-clear-slash-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_line_clear_slash_16_spritesheet_alpha.png", 58, HERO_ATTACK_GRID),
  sheet("hero-combo-1-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_attack_combo_01_16_spritesheet_alpha.png", 52, HERO_ATTACK_GRID),
  sheet("hero-combo-2-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_attack_combo_02_16_spritesheet_alpha.png", 54, HERO_ATTACK_GRID),
  sheet("hero-combo-3-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_attack_combo_03_16_spritesheet_alpha.png", 56, HERO_ATTACK_GRID),
  sheet("hero-tetris-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_tetris_attack_16_spritesheet_alpha.png", 64, HERO_ATTACK_GRID),
  sheet("hero-tspin-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_tspin_attack_16_spritesheet_alpha.png", 58, HERO_ATTACK_GRID),
  sheet("hero-b2b-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_b2b_attack_16_spritesheet_alpha.png", 60, HERO_ATTACK_GRID),
  sheet("hero-ultimate-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_ultimate_attack_16_spritesheet_alpha.png", 85, HERO_ULTIMATE_GRID),
  sheet("hero-sword-wave-sheet-16", "spriteTestGroupEffect", "assets/effects/hero_sword_wave_16_spritesheet_alpha.png", 42),
  sheet("hero-impact-burst-sheet-16", "spriteTestGroupEffect", "assets/effects/hero_impact_burst_16_spritesheet_alpha.png", 36),
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
