export const ASSET_VERSION = "2026-06-12-noa-fullbody-portrait";

export function assetPath(path) {
  const isFilePreview = typeof location !== "undefined" && location.protocol === "file:";
  const overrides = typeof window !== "undefined" ? window.TST_ASSET_OVERRIDES || {} : {};
  const resolvedPath = overrides[path] || path;
  const externalPath = /^(data:|blob:|https?:|file:)/.test(resolvedPath);
  return isFilePreview || externalPath ? resolvedPath : `${resolvedPath}?v=${ASSET_VERSION}`;
}

export const ASSET_REGISTRY = {
  images: [],
  byImage: new WeakMap(),
  warned: new Set(),
  fonts: [
    { id: "display-font-woff2", type: "font", path: "assets/fonts/TSpinTravelerDisplay.woff2", status: "css-managed" },
    { id: "display-font-ttf", type: "font", path: "assets/fonts/TSpinTravelerDisplay.ttf", status: "css-managed" },
  ],
  audio: [
    { id: "web-audio-synth", type: "audio", path: "", status: "generated" },
  ],
};

export function warnAssetOnce(record, message) {
  if (ASSET_REGISTRY.warned.has(record.id)) return;
  ASSET_REGISTRY.warned.add(record.id);
  console.warn(`[T-Spin Traveler] ${message}`, record.url);
}

export function registerImageAsset(id, path) {
  const image = new Image();
  const record = {
    id,
    type: "image",
    path,
    url: assetPath(path),
    status: "loading",
    error: "",
    image,
  };
  ASSET_REGISTRY.images.push(record);
  ASSET_REGISTRY.byImage.set(image, record);
  image.decoding = "async";
  image.addEventListener("load", () => {
    record.status = image.naturalWidth > 0 ? "loaded" : "error";
    if (record.status === "error") {
      record.error = "Image loaded with empty dimensions.";
      warnAssetOnce(record, record.error);
    }
  });
  image.addEventListener("error", () => {
    record.status = "error";
    record.error = `Failed to load image: ${record.path}`;
    warnAssetOnce(record, record.error);
  });
  image.src = record.url;
  return image;
}

export function registerAudioAsset(id, path, options = {}) {
  const audioElement = new Audio();
  const record = {
    id,
    type: "audio",
    path,
    url: assetPath(path),
    status: "loading",
    error: "",
    element: audioElement,
  };
  ASSET_REGISTRY.audio.push(record);
  audioElement.preload = "auto";
  audioElement.loop = Boolean(options.loop);
  const markLoaded = () => {
    if (record.status !== "error") record.status = "loaded";
  };
  audioElement.addEventListener("loadeddata", markLoaded, { once: true });
  audioElement.addEventListener("canplay", markLoaded, { once: true });
  audioElement.addEventListener("canplaythrough", () => {
    record.status = "loaded";
  }, { once: true });
  audioElement.addEventListener("error", () => {
    record.status = "error";
    record.error = `Failed to load audio: ${record.path}`;
    warnAssetOnce(record, record.error);
  });
  audioElement.src = record.url;
  audioElement.load();
  return audioElement;
}

export function isImageReady(image) {
  return Boolean(image && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
}

export function getImageAssetRecord(image) {
  return image ? ASSET_REGISTRY.byImage.get(image) : null;
}

export function getAssetSummary() {
  const counts = ASSET_REGISTRY.images.reduce((result, record) => {
    result[record.status] = (result[record.status] || 0) + 1;
    return result;
  }, {});
  return {
    counts,
    images: ASSET_REGISTRY.images.map(({ id, path, url, status, error }) => ({ id, path, url, status, error })),
    fonts: ASSET_REGISTRY.fonts,
    audio: ASSET_REGISTRY.audio.map(({ id, type, path, url, status, error }) => ({ id, type, path, url, status, error })),
  };
}

if (typeof window !== "undefined") {
  window.TST_ASSETS = {
    images: ASSET_REGISTRY.images,
    fonts: ASSET_REGISTRY.fonts,
    audio: ASSET_REGISTRY.audio,
    getSummary: getAssetSummary,
  };
}

export const forestBg = registerImageAsset("default-ancient-rift-background", "assets/backgrounds/egypt_star_tomb_exterior_rift_bg.png");
export const mainMenuHomeKingdomBg = registerImageAsset("main-menu-home-kingdom-background", "assets/images/menu/main-menu-home-kingdom-bg.png");
export const mainMenuRiftKingdomBg = registerImageAsset("main-menu-rift-kingdom-background", "assets/images/menu/main-menu-rift-kingdom-bg.png");
export const mainMenuRuneArcBack = registerImageAsset("main-menu-rune-arc-back", "assets/images/menu/main-menu-rune-arc-back.png");
export const mainMenuPrimaryFrame = registerImageAsset("main-menu-primary-frame", "assets/images/menu/main-menu-primary-frame.png");
export const mainMenuSecondaryFrame = registerImageAsset("main-menu-secondary-frame", "assets/images/menu/main-menu-secondary-frame.png");
export const mainMenuDialogueFrame = registerImageAsset("main-menu-dialogue-frame", "assets/images/menu/main-menu-dialogue-frame.png");
export const equipmentRouletteWheelArt = registerImageAsset("equipment-roulette-wheel", "assets/images/equipment/equipment-roulette-wheel.png");
export const noaCheatHandArt = registerImageAsset("equipment-noa-cheat-hand", "assets/images/equipment/noa-cheat-hand.png");
export const equipmentIcons = {
  "wanderer-observer-hood": registerImageAsset("equipment-icon-wanderer-observer-hood", "assets/images/equipment/icons/wanderer-observer-hood.png"),
  "torn-traveler-cloak": registerImageAsset("equipment-icon-torn-traveler-cloak", "assets/images/equipment/icons/torn-traveler-cloak.png"),
  "shard-crystal-dagger": registerImageAsset("equipment-icon-shard-crystal-dagger", "assets/images/equipment/icons/shard-crystal-dagger.png"),
  "star-pattern-headwrap": registerImageAsset("equipment-icon-star-pattern-headwrap", "assets/images/equipment/icons/star-pattern-headwrap.png"),
  "resonance-cloak": registerImageAsset("equipment-icon-resonance-cloak", "assets/images/equipment/icons/resonance-cloak.png"),
  "pulse-crystal-blade": registerImageAsset("equipment-icon-pulse-crystal-blade", "assets/images/equipment/icons/pulse-crystal-blade.png"),
  "rift-observer-crown": registerImageAsset("equipment-icon-rift-observer-crown", "assets/images/equipment/icons/rift-observer-crown.png"),
  "phase-long-cloak": registerImageAsset("equipment-icon-phase-long-cloak", "assets/images/equipment/icons/phase-long-cloak.png"),
  "orbital-longsword": registerImageAsset("equipment-icon-orbital-longsword", "assets/images/equipment/icons/orbital-longsword.png"),
  "royal-crystal-crown": registerImageAsset("equipment-icon-royal-crystal-crown", "assets/images/equipment/icons/royal-crystal-crown.png"),
  "royal-nightfall-cloak": registerImageAsset("equipment-icon-royal-nightfall-cloak", "assets/images/equipment/icons/royal-nightfall-cloak.png"),
  "rift-sovereignty-blade": registerImageAsset("equipment-icon-rift-sovereignty-blade", "assets/images/equipment/icons/rift-sovereignty-blade.png"),
  "rift-king-mask": registerImageAsset("equipment-icon-rift-king-mask", "assets/images/equipment/icons/rift-king-mask.png"),
  "fate-deception-cloak": registerImageAsset("equipment-icon-fate-deception-cloak", "assets/images/equipment/icons/fate-deception-cloak.png"),
  "cheaters-amethyst-sword": registerImageAsset("equipment-icon-cheaters-amethyst-sword", "assets/images/equipment/icons/cheaters-amethyst-sword.png"),
};
export const stageEgyptStarTombRiftBg = registerImageAsset("stage-egypt-star-tomb-rift", "assets/backgrounds/egypt_star_tomb_rift_battle_bg.png");
export const stageEgyptStarTombExteriorRiftBg = registerImageAsset("stage-egypt-star-tomb-exterior-rift", "assets/backgrounds/egypt_star_tomb_exterior_rift_bg.png");
export const stageEgyptPyramidObservatoryRiftBg = registerImageAsset("stage-egypt-pyramid-observatory-rift", "assets/backgrounds/egypt_pyramid_observatory_rift_bg.png");
export const stageMayaEclipseTempleRiftBg = registerImageAsset("stage-maya-eclipse-temple-rift", "assets/backgrounds/maya_eclipse_temple_rift_bg.png");
export const stageAtlantisSunkenCrystalTempleRiftBg = registerImageAsset("stage-atlantis-sunken-crystal-temple-rift", "assets/backgrounds/atlantis_sunken_crystal_temple_rift_bg.png");
export const slimeArt = registerImageAsset("fallback-enemy-battle-portrait", "assets/enemies/battle/enemy_egypt_rift_scarab_scout_battle.png");
export const rosterArt = registerImageAsset("character-roster", "assets/character-roster-v4-alpha.png");
export const heroIdleArt = registerImageAsset("hero-idle-canonical", "assets/images/clean/ET_Character_fullbody_alpha.png");
export const noaBattleIdleArt = heroIdleArt;
export const noaFeedbackBowArt = registerImageAsset("noa-feedback-thanks-canonical", "assets/images/clean/noa_feedback_thanks_alpha.png");
export const menuIdleCubeSheet = registerImageAsset("menu-idle-cube-sheet-16", "assets/images/clean/noa_menu_idle_cube_16.png");
export const menuIdleMeditateSheet = registerImageAsset("menu-idle-meditate-sheet-16", "assets/images/clean/noa_menu_idle_meditate_16.png");
export const heroLineClearSlashSheet = registerImageAsset("hero-line-clear-slash-sheet-16", "assets/images/clean/hero_line_clear_slash_16_spritesheet_alpha.png");
export const heroCombo1Sheet = registerImageAsset("hero-combo-1-sheet-16", "assets/images/clean/hero_attack_combo_01_16_spritesheet_alpha.png");
export const heroCombo2Sheet = registerImageAsset("hero-combo-2-sheet-16", "assets/images/clean/hero_attack_combo_02_16_spritesheet_alpha.png");
export const heroCombo3Sheet = registerImageAsset("hero-combo-3-sheet-16", "assets/images/clean/hero_attack_combo_03_16_spritesheet_alpha.png");
export const heroUltimateSheet = registerImageAsset("hero-ultimate-sheet-16", "assets/images/clean/hero_ultimate_attack_16_spritesheet_alpha.png");
export const heroTetrisSheet = registerImageAsset("hero-tetris-sheet-16", "assets/images/clean/hero_tetris_attack_16_spritesheet_alpha.png");
export const heroTSpinSheet = registerImageAsset("hero-tspin-sheet-16", "assets/images/clean/hero_tspin_attack_16_spritesheet_alpha.png");
export const heroB2BSheet = registerImageAsset("hero-b2b-sheet-16", "assets/images/clean/hero_b2b_attack_16_spritesheet_alpha.png");
export const heroSwordWaveSheet = registerImageAsset("hero-sword-wave-sheet-16", "assets/effects/hero_sword_wave_16_spritesheet_alpha.png");
export const heroImpactBurstSheet = registerImageAsset("hero-impact-burst-sheet-16", "assets/effects/hero_impact_burst_16_spritesheet_alpha.png");
export const heroHitSheet = registerImageAsset("hero-hit-sheet-16", "assets/images/clean/hero_hit_16_spritesheet_alpha.png");
export const enemyRiftProjectileSheet = registerImageAsset("enemy-rift-projectile-sheet-16", "assets/effects/enemy_rift_projectile_16_spritesheet_alpha.png");
export const enemyImpactPhysicalSheet = registerImageAsset("enemy-impact-physical-sheet-16", "assets/effects/enemy_impact_physical_16_spritesheet_alpha.png");
export const enemyImpactArcaneSheet = registerImageAsset("enemy-impact-arcane-sheet-16", "assets/effects/enemy_impact_arcane_16_spritesheet_alpha.png");
export const enemyImpactStoneSheet = registerImageAsset("enemy-impact-stone-sheet-16", "assets/effects/enemy_impact_stone_16_spritesheet_alpha.png");
export const enemyDeathSheet = registerImageAsset("enemy-death-sheet-16", "assets/effects/enemy_death_16_spritesheet_alpha.png");
export const enemyPharaohProjectileSheet = registerImageAsset("enemy-pharaoh-projectile-sheet-16", "assets/effects/enemy_pharaoh_projectile_16_spritesheet_alpha.png");
export const enemyPharaohImpactSheet = registerImageAsset("enemy-pharaoh-impact-sheet-16", "assets/effects/enemy_pharaoh_impact_16_spritesheet_alpha.png");
export const noaLevelUpSheet = registerImageAsset("noa-level-up-sheet-16", "assets/effects/noa_level_up_16.png");
export const enemyBattlePortraits = {
  egyptRiftScarabScout: registerImageAsset("enemy-battle-egypt-rift-scarab-scout-left", "assets/enemies/battle/enemy_egypt_rift_scarab_scout_battle.png"),
  sandTombMummy: registerImageAsset("enemy-battle-egypt-sand-tomb-mummy-left", "assets/enemies/battle/enemy_egypt_sand_tomb_mummy_battle.png"),
  egyptianPriest: registerImageAsset("enemy-battle-egyptian-priest-left", "assets/enemies/battle/enemy_egyptian_priest_battle.png"),
  anubisGuard: registerImageAsset("enemy-battle-egypt-anubis-guard-left", "assets/enemies/battle/enemy_egypt_anubis_guard_battle.png"),
  sphinxStoneGuardian: registerImageAsset("enemy-battle-egypt-sphinx-stone-guardian-left", "assets/enemies/battle/enemy_egypt_sphinx_stone_guardian_battle.png"),
  pharaohKing: registerImageAsset("enemy-battle-egypt-pharaoh-king-left", "assets/enemies/battle/enemy_egypt_pharaoh_king_battle.png"),
};

export const upgradeCardFrames = {
  common: registerImageAsset("upgrade-card-frame-common-formal", "assets/ui/upgrade_cards/frames/formal_common_frame.png"),
  rare: registerImageAsset("upgrade-card-frame-rare-formal", "assets/ui/upgrade_cards/frames/formal_rare_frame.png"),
  relic: registerImageAsset("upgrade-card-frame-epic-formal", "assets/ui/upgrade_cards/frames/formal_epic_frame.png"),
  legendary: registerImageAsset("upgrade-card-frame-relic-formal", "assets/ui/upgrade_cards/frames/formal_relic_frame.png"),
};

export const upgradeTypeIcons = {
  attack: registerImageAsset("upgrade-type-icon-attack", "assets/ui/upgrade_cards/icons/upgrade_icon_attack.png"),
  defense: registerImageAsset("upgrade-type-icon-defense", "assets/ui/upgrade_cards/icons/upgrade_icon_defense.png"),
  survival: registerImageAsset("upgrade-type-icon-survival", "assets/ui/upgrade_cards/icons/upgrade_icon_survival.png"),
  guard: registerImageAsset("upgrade-type-icon-guard", "assets/ui/upgrade_cards/icons/upgrade_icon_guard.png"),
  combo: registerImageAsset("upgrade-type-icon-combo", "assets/ui/upgrade_cards/icons/upgrade_icon_combo.png"),
  spin: registerImageAsset("upgrade-type-icon-spin", "assets/ui/upgrade_cards/icons/upgrade_icon_spin.png"),
  garbage: registerImageAsset("upgrade-type-icon-garbage", "assets/ui/upgrade_cards/icons/upgrade_icon_garbage.png"),
  rift: registerImageAsset("upgrade-type-icon-rift", "assets/ui/upgrade_cards/icons/upgrade_icon_rift.png"),
};

export const legendaryUpgradeEmblems = {
  singularity_spin_core: registerImageAsset("upgrade-emblem-singularity-spin-core", "assets/ui/upgrade_cards/emblems/upgrade_emblem_singularity_spin_core.png"),
  combo_constellation: registerImageAsset("upgrade-emblem-combo-constellation", "assets/ui/upgrade_cards/emblems/upgrade_emblem_combo_constellation.png"),
  aegis_star_mirror: registerImageAsset("upgrade-emblem-aegis-star-mirror", "assets/ui/upgrade_cards/emblems/upgrade_emblem_aegis_star_mirror.png"),
  garbage_alchemy_core: registerImageAsset("upgrade-emblem-garbage-alchemy-core", "assets/ui/upgrade_cards/emblems/upgrade_emblem_garbage_alchemy_core.png"),
  perfect_rift_crown: registerImageAsset("upgrade-emblem-perfect-rift-crown", "assets/ui/upgrade_cards/emblems/upgrade_emblem_perfect_rift_crown.png"),
};

const specialAngelCardFrame = registerImageAsset("special-upgrade-frame-angel-formal", "assets/ui/upgrade_cards/special/formal_angel_card.png");
const specialDevilCardFrame = registerImageAsset("special-upgrade-frame-devil-formal", "assets/ui/upgrade_cards/special/formal_devil_card.png");

export const specialUpgradeCardFrames = {
  angel_halo_sanctuary: specialAngelCardFrame,
  angel_cleansing_prism: specialAngelCardFrame,
  angel_perfect_benediction: specialAngelCardFrame,
  devil_blood_moon_pact: specialDevilCardFrame,
  devil_abyss_chain: specialDevilCardFrame,
  devil_fallen_crown: specialDevilCardFrame,
};

export const riftEnergyIcon = registerImageAsset("rift-energy-icon", "assets/ui/icons/rift_energy_icon.png");

export const metaUpgradeIcons = {
  hp: registerImageAsset("meta-upgrade-hp-icon", "assets/ui/meta_upgrades/meta_upgrade_hp.png"),
  attack: registerImageAsset("meta-upgrade-attack-icon", "assets/ui/meta_upgrades/meta_upgrade_attack.png"),
  guard: registerImageAsset("meta-upgrade-guard-icon", "assets/ui/meta_upgrades/meta_upgrade_guard.png"),
};

export const enemyAttackSheets = {
  riftScarab16: registerImageAsset("enemy-egypt-rift-scarab-attack-sheet-16", "assets/images/clean/enemy_egypt_rift_scarab_attack_16_spritesheet_alpha.png"),
  mummy16: registerImageAsset("enemy-egypt-mummy-attack-sheet-16", "assets/images/clean/enemy_egypt_mummy_attack_16_spritesheet_alpha.png"),
  priest16: registerImageAsset("enemy-egypt-priest-attack-sheet-16", "assets/images/clean/enemy_egypt_priest_attack_16_spritesheet_alpha.png"),
  anubisGuard16: registerImageAsset("enemy-egypt-anubis-guard-attack-sheet-16", "assets/images/clean/enemy_egypt_anubis_guard_attack_16_spritesheet_alpha.png"),
  sphinx16: registerImageAsset("enemy-egypt-sphinx-attack-sheet-16", "assets/images/clean/enemy_egypt_sphinx_attack_16_spritesheet_alpha.png"),
  pharaohKing16: registerImageAsset("enemy-egypt-pharaoh-king-attack-sheet-16", "assets/images/clean/enemy_egypt_pharaoh_king_attack_16_spritesheet_alpha.png"),
};

export const musicLoopAssets = {
  bgmMenu01: registerAudioAsset("bgm-menu-01", "assets/audio/bgm/bgm_menu_01.wav"),
  bgmMenu02: registerAudioAsset("bgm-menu-02", "assets/audio/bgm/bgm_menu_02.wav"),
  bgmMenu03: registerAudioAsset("bgm-menu-03", "assets/audio/bgm/bgm_menu_03.wav"),
  bgmMenu04: registerAudioAsset("bgm-menu-04", "assets/audio/bgm/bgm_menu_04.wav"),
  bgmMenu05: registerAudioAsset("bgm-menu-05", "assets/audio/bgm/bgm_menu_05.wav"),
  bgmMenu06: registerAudioAsset("bgm-menu-06", "assets/audio/bgm/bgm_menu_06.wav"),
  menuAncientRift: registerAudioAsset("bgm-menu-ancient-rift-loop", "assets/audio/bgm/bgm_menu_ancient_rift_loop.wav", { loop: true }),
  battleForestRuins: registerAudioAsset("bgm-battle-forest-ruins-loop", "assets/audio/bgm/bgm_battle_forest_ruins_loop.wav", { loop: true }),
  battleDeepRuins: registerAudioAsset("bgm-battle-deep-ruins-loop", "assets/audio/bgm/bgm_battle_deep_ruins_loop.wav", { loop: true }),
  battleRiftPressure: registerAudioAsset("bgm-battle-rift-pressure-loop", "assets/audio/bgm/bgm_battle_rift_pressure_loop.wav", { loop: true }),
  bossAncientRiftColossus: registerAudioAsset("bgm-boss-ancient-rift-colossus-loop", "assets/audio/bgm/bgm_boss_ancient_rift_colossus_loop.wav", { loop: true }),
  upgradeRelicCards: registerAudioAsset("bgm-upgrade-relic-cards-loop", "assets/audio/bgm/bgm_upgrade_relic_cards_loop.wav", { loop: true }),
};

export const jingleAudioAssets = {
  jingleRiftEnergySettlement: registerAudioAsset("jingle-rift-energy-settlement", "assets/audio/jingles/jingle_rift_energy_settlement.wav"),
  jingleVictoryRelicCleansed: registerAudioAsset("jingle-victory-relic-cleansed", "assets/audio/jingles/jingle_victory_relic_cleansed.wav"),
  jingleDefeatRiftCollapse: registerAudioAsset("jingle-defeat-rift-collapse", "assets/audio/jingles/jingle_defeat_rift_collapse.wav"),
};

export const sfxAudioAssets = {
  sfxBlockMove01: registerAudioAsset("sfx-block-move-01", "assets/audio/sfx/sfx_block_move_01.wav"),
  sfxBlockMove02: registerAudioAsset("sfx-block-move-02", "assets/audio/sfx/sfx_block_move_02.wav"),
  sfxBlockMove03: registerAudioAsset("sfx-block-move-03", "assets/audio/sfx/sfx_block_move_03.wav"),
  sfxBlockRotate01: registerAudioAsset("sfx-block-rotate-01", "assets/audio/sfx/sfx_block_rotate_01.wav"),
  sfxBlockRotate02: registerAudioAsset("sfx-block-rotate-02", "assets/audio/sfx/sfx_block_rotate_02.wav"),
  sfxTPieceRotateSpecial01: registerAudioAsset("sfx-t-piece-rotate-special-01", "assets/audio/sfx/sfx_t_piece_rotate_special_01.wav"),
  sfxSoftDrop01: registerAudioAsset("sfx-soft-drop-01", "assets/audio/sfx/sfx_soft_drop_01.wav"),
  sfxHardDrop01: registerAudioAsset("sfx-hard-drop-01", "assets/audio/sfx/sfx_hard_drop_01.wav"),
  sfxBlockLock01: registerAudioAsset("sfx-block-lock-01", "assets/audio/sfx/sfx_block_lock_01.wav"),
  sfxHold01: registerAudioAsset("sfx-hold-01", "assets/audio/sfx/sfx_hold_01.wav"),
  sfxHoldUnavailable01: registerAudioAsset("sfx-hold-unavailable-01", "assets/audio/sfx/sfx_hold_unavailable_01.wav"),
  sfxInvalidMove01: registerAudioAsset("sfx-invalid-move-01", "assets/audio/sfx/sfx_invalid_move_01.wav"),
  sfxInvalidRotate01: registerAudioAsset("sfx-invalid-rotate-01", "assets/audio/sfx/sfx_invalid_rotate_01.wav"),
  sfxLineClear1: registerAudioAsset("sfx-line-clear-1", "assets/audio/sfx/sfx_line_clear_1.wav"),
  sfxLineClear2: registerAudioAsset("sfx-line-clear-2", "assets/audio/sfx/sfx_line_clear_2.wav"),
  sfxLineClear3: registerAudioAsset("sfx-line-clear-3", "assets/audio/sfx/sfx_line_clear_3.wav"),
  sfxLineClear4Tetris: registerAudioAsset("sfx-line-clear-4-tetris", "assets/audio/sfx/sfx_line_clear_4_tetris.wav"),
  sfxCombo1: registerAudioAsset("sfx-combo-1", "assets/audio/sfx/sfx_combo_1.wav"),
  sfxCombo2: registerAudioAsset("sfx-combo-2", "assets/audio/sfx/sfx_combo_2.wav"),
  sfxCombo3Plus: registerAudioAsset("sfx-combo-3-plus", "assets/audio/sfx/sfx_combo_3_plus.wav"),
  sfxBackToBack: registerAudioAsset("sfx-back-to-back", "assets/audio/sfx/sfx_back_to_back.wav"),
  sfxTspinSuccess: registerAudioAsset("sfx-tspin-success", "assets/audio/sfx/sfx_tspin_success.wav"),
  sfxSpinSuccess: registerAudioAsset("sfx-spin-success", "assets/audio/sfx/sfx_spin_success.wav"),
  sfxPerfectClear: registerAudioAsset("sfx-perfect-clear", "assets/audio/sfx/sfx_perfect_clear.wav"),
  sfxSpinReady01: registerAudioAsset("sfx-spin-ready-01", "assets/audio/sfx/sfx_spin_ready_01.wav"),
  sfxSpinReady02: registerAudioAsset("sfx-spin-ready-02", "assets/audio/sfx/sfx_spin_ready_02.wav"),
  sfxPlayerAttackLight01: registerAudioAsset("sfx-player-attack-light-01", "assets/audio/sfx/sfx_player_attack_light_01.wav"),
  sfxPlayerAttackHeavy01: registerAudioAsset("sfx-player-attack-heavy-01", "assets/audio/sfx/sfx_player_attack_heavy_01.wav"),
  sfxPlayerAttackArcane01: registerAudioAsset("sfx-player-attack-arcane-01", "assets/audio/sfx/sfx_player_attack_arcane_01.wav"),
  sfxEnemyHurtLight01: registerAudioAsset("sfx-enemy-hurt-light-01", "assets/audio/sfx/sfx_enemy_hurt_light_01.wav"),
  sfxEnemyHurtHeavy01: registerAudioAsset("sfx-enemy-hurt-heavy-01", "assets/audio/sfx/sfx_enemy_hurt_heavy_01.wav"),
  sfxEnemyAttackWarn01: registerAudioAsset("sfx-enemy-attack-warn-01", "assets/audio/sfx/sfx_enemy_attack_warn_01.wav"),
  sfxEnemyAttackHit01: registerAudioAsset("sfx-enemy-attack-hit-01", "assets/audio/sfx/sfx_enemy_attack_hit_01.wav"),
  sfxPlayerHurt01: registerAudioAsset("sfx-player-hurt-01", "assets/audio/sfx/sfx_player_hurt_01.wav"),
  sfxShieldBlock01: registerAudioAsset("sfx-shield-block-01", "assets/audio/sfx/sfx_shield_block_01.wav"),
  sfxShieldBreak01: registerAudioAsset("sfx-shield-break-01", "assets/audio/sfx/sfx_shield_break_01.wav"),
  sfxUpgradeReveal01: registerAudioAsset("sfx-upgrade-reveal-01", "assets/audio/sfx/sfx_upgrade_reveal_01.wav"),
  sfxUpgradeHover01: registerAudioAsset("sfx-upgrade-hover-01", "assets/audio/sfx/sfx_upgrade_hover_01.wav"),
  sfxUpgradeConfirm01: registerAudioAsset("sfx-upgrade-confirm-01", "assets/audio/sfx/sfx_upgrade_confirm_01.wav"),
  sfxMetaUpgradePurchaseSuccess01: registerAudioAsset("sfx-meta-upgrade-purchase-success-01", "assets/audio/sfx/sfx_meta_upgrade_purchase_success_01.wav"),
  sfxMetaUpgradePurchaseFail01: registerAudioAsset("sfx-meta-upgrade-purchase-fail-01", "assets/audio/sfx/sfx_meta_upgrade_purchase_fail_01.wav"),
  sfxRiftEnergyTick01: registerAudioAsset("sfx-rift-energy-tick-01", "assets/audio/sfx/sfx_rift_energy_tick_01.wav"),
  sfxRiftEnergyComplete01: registerAudioAsset("sfx-rift-energy-complete-01", "assets/audio/sfx/sfx_rift_energy_complete_01.wav"),
  sfxWaveStart01: registerAudioAsset("sfx-wave-start-01", "assets/audio/sfx/sfx_wave_start_01.wav"),
  sfxWaveVictory01: registerAudioAsset("sfx-wave-victory-01", "assets/audio/sfx/sfx_wave_victory_01.wav"),
  sfxBossEnter01: registerAudioAsset("sfx-boss-enter-01", "assets/audio/sfx/sfx_boss_enter_01.wav"),
  sfxBossDefeated01: registerAudioAsset("sfx-boss-defeated-01", "assets/audio/sfx/sfx_boss_defeated_01.wav"),
  sfxGameStart01: registerAudioAsset("sfx-game-start-01", "assets/audio/sfx/sfx_game_start_01.wav"),
  sfxGameOver01: registerAudioAsset("sfx-game-over-01", "assets/audio/sfx/sfx_game_over_01.wav"),
  sfxUiHover01: registerAudioAsset("sfx-ui-hover-01", "assets/audio/sfx/sfx_ui_hover_01.wav"),
  sfxUiConfirm01: registerAudioAsset("sfx-ui-confirm-01", "assets/audio/sfx/sfx_ui_confirm_01.wav"),
  sfxUiCancel01: registerAudioAsset("sfx-ui-cancel-01", "assets/audio/sfx/sfx_ui_cancel_01.wav"),
  sfxLoadingComplete01: registerAudioAsset("sfx-loading-complete-01", "assets/audio/sfx/sfx_loading_complete_01.wav"),
};

export const oneShotAudioAssets = {
  ...jingleAudioAssets,
  ...sfxAudioAssets,
};

export const BACKGROUND_STAGES = [
  {
    id: "egypt-star-tomb-exterior-rift",
    startWave: 1,
    image: stageEgyptStarTombExteriorRiftBg,
    fallback: forestBg,
    dim: 0.22,
    vignette: 0.48,
    tint: "rgba(52, 124, 148, 0.05)",
  },
  {
    id: "egypt-pyramid-observatory-rift",
    startWave: 2,
    image: stageEgyptPyramidObservatoryRiftBg,
    fallback: forestBg,
    dim: 0.3,
    vignette: 0.56,
    centerDim: 0.1,
    tint: "rgba(120, 80, 34, 0.06)",
  },
  {
    id: "egypt-star-tomb-rift",
    startWave: 3,
    image: stageEgyptStarTombRiftBg,
    fallback: forestBg,
    dim: 0.36,
    vignette: 0.62,
    centerDim: 0.12,
    tint: "rgba(120, 76, 36, 0.08)",
  },
];

export const BOSS_BACKGROUND_STAGE = {
  id: "egypt-star-tomb-rift-boss",
  bossOnly: true,
  image: stageEgyptStarTombRiftBg,
  fallback: forestBg,
  dim: 0.46,
  vignette: 0.7,
  centerDim: 0.24,
  tint: "rgba(142, 94, 36, 0.14)",
};
