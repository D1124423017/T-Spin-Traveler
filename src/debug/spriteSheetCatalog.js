const GRID_4_BY_4 = Object.freeze({
  columns: 4,
  rows: 4,
  frames: Object.freeze(Array.from({ length: 16 }, (_, index) => index)),
});

const FIXED_90_GRID = Object.freeze({
  ...GRID_4_BY_4,
  timing: Object.freeze(GRID_4_BY_4.frames.map(() => 90)),
});

const FIXED_80_GRID = Object.freeze({
  ...GRID_4_BY_4,
  timing: Object.freeze(GRID_4_BY_4.frames.map(() => 80)),
});

const FIXED_60_GRID = Object.freeze({
  ...GRID_4_BY_4,
  timing: Object.freeze(GRID_4_BY_4.frames.map(() => 60)),
});

const HERO_HIT_GRID = Object.freeze({
  ...FIXED_60_GRID,
});

const ENEMY_DEATH_GRID = Object.freeze({
  ...GRID_4_BY_4,
  timing: Object.freeze([
    54, 56, 58, 60,
    62, 66, 70, 74,
    78, 82, 80, 76,
    72, 68, 64, 60,
  ]),
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
  sheet("menu-idle-rift-wayfinder-sheet-16", "spriteTestGroupMenu", "assets/images/clean/noa_menu_idle_rift_wayfinder_16.png", 110),
  sheet("menu-idle-star-map-listener-sheet-16", "spriteTestGroupMenu", "assets/images/clean/noa_menu_idle_star_map_listener_16.png", 125),
  sheet("hero-line-clear-slash-sheet-16", "spriteTestGroupHero", "assets/images/clean/noa_attack_line_clear_slash_16.png", 58),
  sheet("hero-combo-1-sheet-16", "spriteTestGroupHero", "assets/images/clean/noa_attack_combo1_16.png", 52),
  sheet("hero-combo-2-sheet-16", "spriteTestGroupHero", "assets/images/clean/noa_attack_combo2_16.png", 54),
  sheet("hero-combo-3-sheet-16", "spriteTestGroupHero", "assets/images/clean/noa_attack_combo3_16.png", 56),
  sheet("hero-tetris-sheet-16", "spriteTestGroupHero", "assets/images/clean/noa_attack_tetris_16.png", 64),
  sheet("hero-tspin-sheet-16", "spriteTestGroupHero", "assets/images/clean/noa_attack_tspin_16.png", 58),
  sheet("hero-b2b-sheet-16", "spriteTestGroupHero", "assets/images/clean/noa_attack_b2b_16.png", 60),
  sheet("hero-ultimate-sheet-16", "spriteTestGroupHero", "assets/images/clean/noa_attack_ultimate_16.png", 85),
  sheet("hero-hit-sheet-16", "spriteTestGroupHero", "assets/images/clean/hero_hit_16_spritesheet_alpha.png", 60, HERO_HIT_GRID),
  sheet("hero-sword-wave-sheet-16", "spriteTestGroupEffect", "assets/effects/hero_sword_wave_16_spritesheet_alpha.png", 42),
  sheet("hero-impact-burst-sheet-16", "spriteTestGroupEffect", "assets/effects/hero_impact_burst_16_spritesheet_alpha.png", 36),
  sheet("enemy-rift-projectile-sheet-16", "spriteTestGroupEffect", "assets/effects/enemy_rift_projectile_16_spritesheet_alpha.png", 60, FIXED_60_GRID),
  sheet("enemy-impact-physical-sheet-16", "spriteTestGroupEffect", "assets/effects/enemy_impact_physical_16_spritesheet_alpha.png", 60, FIXED_60_GRID),
  sheet("enemy-impact-arcane-sheet-16", "spriteTestGroupEffect", "assets/effects/enemy_impact_arcane_16_spritesheet_alpha.png", 60, FIXED_60_GRID),
  sheet("enemy-impact-stone-sheet-16", "spriteTestGroupEffect", "assets/effects/enemy_impact_stone_16_spritesheet_alpha.png", 60, FIXED_60_GRID),
  sheet("enemy-pharaoh-projectile-sheet-16", "spriteTestGroupEffect", "assets/effects/enemy_pharaoh_projectile_16_spritesheet_alpha.png", 60, FIXED_60_GRID),
  sheet("enemy-pharaoh-impact-sheet-16", "spriteTestGroupEffect", "assets/effects/enemy_pharaoh_impact_16_spritesheet_alpha.png", 60, FIXED_60_GRID),
  sheet("enemy-death-sheet-16", "spriteTestGroupEffect", "assets/effects/enemy_death_16_spritesheet_alpha.png", 68, ENEMY_DEATH_GRID),
  sheet("noa-level-up-sheet-16", "spriteTestGroupEffect", "assets/effects/noa_level_up_16.png", 52),
  sheet("enemy-egypt-rift-scarab-attack-sheet-16", "spriteTestGroupEnemy", "assets/images/clean/enemy_egypt_rift_scarab_attack_16_spritesheet_alpha.png", 80, FIXED_80_GRID),
  sheet("enemy-egypt-mummy-attack-sheet-16", "spriteTestGroupEnemy", "assets/images/clean/enemy_egypt_mummy_attack_16_spritesheet_alpha.png", 90, FIXED_90_GRID),
  sheet("enemy-egypt-priest-attack-sheet-16", "spriteTestGroupEnemy", "assets/images/clean/enemy_egypt_priest_attack_16_spritesheet_alpha.png", 90, FIXED_90_GRID),
  sheet("enemy-egypt-anubis-guard-attack-sheet-16", "spriteTestGroupEnemy", "assets/images/clean/enemy_egypt_anubis_guard_attack_16_spritesheet_alpha.png", 90, FIXED_90_GRID),
  sheet("enemy-egypt-sphinx-attack-sheet-16", "spriteTestGroupEnemy", "assets/images/clean/enemy_egypt_sphinx_attack_16_spritesheet_alpha.png", 90, FIXED_90_GRID),
  sheet("enemy-egypt-pharaoh-king-attack-sheet-16", "spriteTestGroupEnemy", "assets/images/clean/enemy_egypt_pharaoh_king_attack_16_spritesheet_alpha.png", 90, FIXED_90_GRID),
]);
