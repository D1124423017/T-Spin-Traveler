export const ASSET_VERSION = "2026-06-01-formal-upgrade-cards";

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
export const stageEgyptStarTombRiftBg = registerImageAsset("stage-egypt-star-tomb-rift", "assets/backgrounds/egypt_star_tomb_rift_battle_bg.png");
export const stageEgyptStarTombExteriorRiftBg = registerImageAsset("stage-egypt-star-tomb-exterior-rift", "assets/backgrounds/egypt_star_tomb_exterior_rift_bg.png");
export const stageEgyptPyramidObservatoryRiftBg = registerImageAsset("stage-egypt-pyramid-observatory-rift", "assets/backgrounds/egypt_pyramid_observatory_rift_bg.png");
export const stageMayaEclipseTempleRiftBg = registerImageAsset("stage-maya-eclipse-temple-rift", "assets/backgrounds/maya_eclipse_temple_rift_bg.png");
export const stageAtlantisSunkenCrystalTempleRiftBg = registerImageAsset("stage-atlantis-sunken-crystal-temple-rift", "assets/backgrounds/atlantis_sunken_crystal_temple_rift_bg.png");
export const slimeArt = registerImageAsset("fallback-enemy-battle-portrait", "assets/enemies/battle/enemy_scarab_scout_battle.png");
export const rosterArt = registerImageAsset("character-roster", "assets/character-roster-v4-alpha.png");
export const heroIdleArt = registerImageAsset("hero-idle-concept", "assets/images/clean/ET_Character_alpha.png");
export const noaMenuShowcaseArt = registerImageAsset("noa-menu-showcase", "assets/images/clean/noa_menu_showcase.png");
export const noaBattleIdleArt = registerImageAsset("noa-battle-idle", "assets/images/clean/noa_battle_idle.png");
export const noaFeedbackBowArt = registerImageAsset("noa-feedback-bow", "assets/images/clean/noa_feedback_bow.png");
export const menuIdleCubeSheet = registerImageAsset("menu-idle-cube-sheet-16", "assets/images/clean/noa_menu_idle_cube_16.png");
export const menuIdleMeditateSheet = registerImageAsset("menu-idle-meditate-sheet-16", "assets/images/clean/noa_menu_idle_meditate_16.png");
export const heroMeleeSheetV2 = registerImageAsset("hero-melee-sheet-16", "assets/images/clean/hero_melee_combat_16_spritesheet_alpha.png");
export const heroRangedSheetV2 = registerImageAsset("hero-ranged-sheet-16", "assets/images/clean/hero_ranged_combat_16_spritesheet_alpha.png");
export const heroCombo1Sheet = registerImageAsset("hero-combo-1-sheet-16", "assets/images/clean/hero_combo_01_16_spritesheet_alpha.png");
export const heroCombo2Sheet = registerImageAsset("hero-combo-2-sheet-16", "assets/images/clean/hero_combo_02_16_spritesheet_alpha.png");
export const heroCombo3Sheet = registerImageAsset("hero-combo-3-sheet-16", "assets/images/clean/hero_combo_03_16_spritesheet_alpha.png");
export const heroUltimateSheet = registerImageAsset("hero-ultimate-sheet", "assets/images/clean/hero_ultimate_16_spritesheet_alpha.png");
export const noaLevelUpSheet = registerImageAsset("noa-level-up-sheet-16", "assets/effects/noa_level_up_16.png");
export const enemyConceptSheetA = registerImageAsset("enemy-concept-sheet-a", "assets/images/clean/Enemy01_alpha.png");
export const enemyConceptSheetB = registerImageAsset("enemy-concept-sheet-b", "assets/images/clean/Enemy02_alpha.png");

export const enemyBattlePortraits = {
  egyptScarabScout: registerImageAsset("enemy-battle-egypt-scarab-scout-left", "assets/enemies/battle/enemy_scarab_scout_battle.png"),
  sandTombMummyPriest: registerImageAsset("enemy-battle-sand-tomb-mummy-priest-left", "assets/enemies/battle/enemy_sand_tomb_mummy_priest_battle.png"),
  anubisRiftGuard: registerImageAsset("enemy-battle-anubis-rift-guard-left", "assets/enemies/battle/enemy_anubis_rift_guard_battle.png"),
  mayaStoneBeastScout: registerImageAsset("enemy-battle-maya-stone-beast-scout-left", "assets/enemies/battle/enemy_maya_stone_beast_scout_battle.png"),
  mayaEclipsePriest: registerImageAsset("enemy-battle-maya-eclipse-priest-left", "assets/enemies/battle/enemy_maya_eclipse_priest_battle.png"),
  mayaFeatheredSerpentGuard: registerImageAsset("enemy-battle-maya-feathered-serpent-guard-left", "assets/enemies/battle/enemy_maya_feathered_serpent_guard_battle.png"),
  atlantisCrystalJellyfishScout: registerImageAsset("enemy-battle-atlantis-crystal-jellyfish-scout-left", "assets/enemies/battle/enemy_atlantis_crystal_jellyfish_scout_battle.png"),
  atlantisTidalShellGuard: registerImageAsset("enemy-battle-atlantis-tidal-shell-guard-left", "assets/enemies/battle/enemy_atlantis_tidal_shell_guard_battle.png"),
  atlantisCrystalTempleSentinel: registerImageAsset("enemy-battle-atlantis-crystal-temple-sentinel-left", "assets/enemies/battle/enemy_atlantis_crystal_temple_sentinel_battle.png"),
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
  egyptScarabScout16: registerImageAsset("enemy-attack-egypt-scarab-scout-16", "assets/images/clean/enemy_attack_egypt_scarab_scout_16.png"),
  sandTombMummyPriest16: registerImageAsset("enemy-attack-sand-tomb-mummy-priest-16", "assets/images/clean/enemy_attack_sand_tomb_mummy_priest_16.png"),
  anubisRiftGuard16: registerImageAsset("enemy-attack-anubis-rift-guard-16", "assets/images/clean/enemy_attack_anubis_rift_guard_16.png"),
  mayaStoneBeastScout16: registerImageAsset("enemy-attack-maya-stone-beast-scout-16", "assets/images/clean/enemy_attack_maya_stone_beast_scout_16.png"),
  mayaEclipsePriest16: registerImageAsset("enemy-attack-maya-eclipse-priest-16", "assets/images/clean/enemy_attack_maya_eclipse_priest_16.png"),
  mayaFeatheredSerpentGuard16: registerImageAsset("enemy-attack-maya-feathered-serpent-guard-16", "assets/images/clean/enemy_attack_maya_feathered_serpent_guard_16.png"),
  atlantisCrystalJellyfishScout16: registerImageAsset("enemy-attack-atlantis-crystal-jellyfish-scout-16", "assets/images/clean/enemy_attack_atlantis_crystal_jellyfish_scout_16.png"),
  atlantisTidalShellGuard16: registerImageAsset("enemy-attack-atlantis-tidal-shell-guard-16", "assets/images/clean/enemy_attack_atlantis_tidal_shell_guard_16.png"),
  atlantisRiftJellyfish16: registerImageAsset("enemy-attack-atlantis-rift-jellyfish-16", "assets/images/clean/enemy_attack_atlantis_rift_jellyfish_16.png"),
  atlantisCrystalTempleSentinel16: registerImageAsset("enemy-attack-atlantis-crystal-temple-sentinel-16", "assets/images/clean/enemy_attack_atlantis_crystal_temple_sentinel_16.png"),
};

export const musicLoopAssets = {
  menuA: registerAudioAsset("music-loop-menu-a", "assets/audio/music_menu_loop.wav", { loop: true }),
  menuB: registerAudioAsset("music-loop-menu-b", "assets/audio/music_menu_loop_b.wav", { loop: true }),
  menuC: registerAudioAsset("music-loop-menu-c", "assets/audio/music_menu_loop_c.wav", { loop: true }),
  menuD: registerAudioAsset("music-loop-menu-d", "assets/audio/music_menu_loop_d.wav", { loop: true }),
  forestA: registerAudioAsset("music-loop-forest-a", "assets/audio/music_forest_loop.wav", { loop: true }),
  forestB: registerAudioAsset("music-loop-forest-b", "assets/audio/music_forest_loop_b.wav", { loop: true }),
  forestC: registerAudioAsset("music-loop-forest-c", "assets/audio/music_forest_loop_c.wav", { loop: true }),
  forestD: registerAudioAsset("music-loop-forest-d", "assets/audio/music_forest_loop_d.wav", { loop: true }),
  ruinsA: registerAudioAsset("music-loop-ruins-a", "assets/audio/music_ruins_loop.wav", { loop: true }),
  ruinsB: registerAudioAsset("music-loop-ruins-b", "assets/audio/music_ruins_loop_b.wav", { loop: true }),
  ruinsC: registerAudioAsset("music-loop-ruins-c", "assets/audio/music_ruins_loop_c.wav", { loop: true }),
  ruinsD: registerAudioAsset("music-loop-ruins-d", "assets/audio/music_ruins_loop_d.wav", { loop: true }),
  riftA: registerAudioAsset("music-loop-rift-a", "assets/audio/music_rift_loop.wav", { loop: true }),
  riftB: registerAudioAsset("music-loop-rift-b", "assets/audio/music_rift_loop_b.wav", { loop: true }),
  riftC: registerAudioAsset("music-loop-rift-c", "assets/audio/music_rift_loop_c.wav", { loop: true }),
  riftD: registerAudioAsset("music-loop-rift-d", "assets/audio/music_rift_loop_d.wav", { loop: true }),
  bossA: registerAudioAsset("music-loop-boss-a", "assets/audio/music_boss_loop.wav", { loop: true }),
  bossB: registerAudioAsset("music-loop-boss-b", "assets/audio/music_boss_loop_b.wav", { loop: true }),
  bossC: registerAudioAsset("music-loop-boss-c", "assets/audio/music_boss_loop_c.wav", { loop: true }),
  bossD: registerAudioAsset("music-loop-boss-d", "assets/audio/music_boss_loop_d.wav", { loop: true }),
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
    startWave: 5,
    image: stageEgyptPyramidObservatoryRiftBg,
    fallback: forestBg,
    dim: 0.3,
    vignette: 0.56,
    centerDim: 0.1,
    tint: "rgba(120, 80, 34, 0.06)",
  },
  {
    id: "maya-eclipse-temple-rift",
    startWave: 10,
    image: stageMayaEclipseTempleRiftBg,
    fallback: forestBg,
    dim: 0.34,
    vignette: 0.6,
    centerDim: 0.12,
    tint: "rgba(48, 112, 78, 0.07)",
  },
  {
    id: "atlantis-sunken-crystal-temple-rift",
    startWave: 15,
    image: stageAtlantisSunkenCrystalTempleRiftBg,
    fallback: forestBg,
    dim: 0.38,
    vignette: 0.64,
    centerDim: 0.12,
    tint: "rgba(42, 104, 170, 0.1)",
  },
];

export const BOSS_BACKGROUND_STAGE = {
  id: "atlantis-sunken-crystal-temple-rift-boss",
  bossOnly: true,
  image: stageAtlantisSunkenCrystalTempleRiftBg,
  fallback: forestBg,
  dim: 0.5,
  vignette: 0.74,
  centerDim: 0.24,
  tint: "rgba(88, 54, 190, 0.16)",
};
