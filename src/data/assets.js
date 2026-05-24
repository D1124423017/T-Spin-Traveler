export const ASSET_VERSION = "2026-05-24-music-unlock-fix";

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

export const forestBg = registerImageAsset("forest-background", "assets/magic-forest-bg-v2.png");
export const stageForestRuinsDayBg = registerImageAsset("stage-forest-ruins-day", "assets/backgrounds/stage_forest_ruins_day.png");
export const stageForestGateNightBg = registerImageAsset("stage-forest-gate-night", "assets/backgrounds/stage_forest_gate_night.png");
export const stageArcaneRuinsMidBg = registerImageAsset("stage-arcane-ruins-mid", "assets/backgrounds/stage_arcane_ruins_mid.png");
export const stageCorruptedForestLateBg = registerImageAsset("stage-corrupted-forest-late", "assets/backgrounds/stage_corrupted_forest_late.png");
export const stageRiftBossBg = registerImageAsset("stage-rift-boss", "assets/backgrounds/stage_rift_boss.png");
export const noaArt = registerImageAsset("noa-portrait", "assets/noa.png");
export const slimeArt = registerImageAsset("forest-slime", "assets/forest-slime.png");
export const rosterArt = registerImageAsset("character-roster", "assets/character-roster-v4-alpha.png");
export const heroIdleArt = registerImageAsset("hero-idle-concept", "assets/images/clean/ET_Character_alpha.png");
export const noaMenuShowcaseArt = registerImageAsset("noa-menu-showcase", "assets/images/clean/noa_menu_showcase.png");
export const noaBattleIdleArt = registerImageAsset("noa-battle-idle", "assets/images/clean/noa_battle_idle.png");
export const noaFeedbackBowArt = registerImageAsset("noa-feedback-bow", "assets/images/clean/noa_feedback_bow.png");
export const menuIdleCubeSheet = registerImageAsset("menu-idle-cube-sheet-16", "assets/images/clean/noa_menu_idle_cube_16.png");
export const menuIdleMeditateSheet = registerImageAsset("menu-idle-meditate-sheet-16", "assets/images/clean/noa_menu_idle_meditate_16.png");
export const heroMeleeSheet = registerImageAsset("hero-melee-sheet", "assets/images/clean/Knife_alpha.png");
export const heroMeleeSheetV2 = registerImageAsset("hero-melee-sheet-16", "assets/images/clean/hero_melee_16_spritesheet_alpha.png");
export const heroRangedSheet = registerImageAsset("hero-ranged-sheet", "assets/images/clean/Gun_alpha.png");
export const heroRangedSheetV2 = registerImageAsset("hero-ranged-sheet-16", "assets/images/clean/hero_ranged_16_spritesheet_alpha.png");
export const heroCombo1Sheet = registerImageAsset("hero-combo-1-sheet-16", "assets/images/clean/hero_combo_01_16_spritesheet_alpha.png");
export const heroCombo2Sheet = registerImageAsset("hero-combo-2-sheet-16", "assets/images/clean/hero_combo_02_16_spritesheet_alpha.png");
export const heroCombo3Sheet = registerImageAsset("hero-combo-3-sheet-16", "assets/images/clean/hero_combo_03_16_spritesheet_alpha.png");
export const heroUltimateSheet = registerImageAsset("hero-ultimate-sheet", "assets/images/clean/hero_perfect_clear_ultimate_alpha.png");
export const enemyConceptSheetA = registerImageAsset("enemy-concept-sheet-a", "assets/images/clean/Enemy01_alpha.png");
export const enemyConceptSheetB = registerImageAsset("enemy-concept-sheet-b", "assets/images/clean/Enemy02_alpha.png");

export const upgradeCardFrames = {
  common: registerImageAsset("upgrade-card-frame-common", "assets/ui/relic_cards/upgrade_card_common.png"),
  rare: registerImageAsset("upgrade-card-frame-rare", "assets/ui/relic_cards/upgrade_card_rare.png"),
  relic: registerImageAsset("upgrade-card-frame-relic", "assets/ui/relic_cards/upgrade_card_relic.png"),
  legendary: registerImageAsset("upgrade-card-frame-legendary", "assets/ui/relic_cards/upgrade_card_legendary.png"),
};

export const legendaryUpgradeEmblems = {
  singularity_spin_core: registerImageAsset("upgrade-emblem-singularity-spin-core", "assets/ui/relic_cards/upgrade_emblem_singularity_spin_core.png"),
  combo_constellation: registerImageAsset("upgrade-emblem-combo-constellation", "assets/ui/relic_cards/upgrade_emblem_combo_constellation.png"),
  aegis_star_mirror: registerImageAsset("upgrade-emblem-aegis-star-mirror", "assets/ui/relic_cards/upgrade_emblem_aegis_star_mirror.png"),
  garbage_alchemy_core: registerImageAsset("upgrade-emblem-garbage-alchemy-core", "assets/ui/relic_cards/upgrade_emblem_garbage_alchemy_core.png"),
  perfect_rift_crown: registerImageAsset("upgrade-emblem-perfect-rift-crown", "assets/ui/relic_cards/upgrade_emblem_perfect_rift_crown.png"),
};

export const enemyAttackSheets = {
  slime: registerImageAsset("enemy-attack-slime", "assets/images/clean/enemy_attack_slime_redesign.png"),
  slime16: registerImageAsset("enemy-attack-slime-16", "assets/images/clean/enemy_attack_slime_16.png"),
  vine: registerImageAsset("enemy-attack-vine", "assets/images/clean/enemy_attack_vine_redesign.png"),
  vine16: registerImageAsset("enemy-attack-vine-16", "assets/images/clean/enemy_attack_vine_16.png"),
  mushroom: registerImageAsset("enemy-attack-mushroom", "assets/images/clean/enemy_attack_mushroom_redesign.png"),
  mushroom16: registerImageAsset("enemy-attack-mushroom-16", "assets/images/clean/enemy_attack_mushroom_16.png"),
  beetle: registerImageAsset("enemy-attack-beetle", "assets/images/clean/enemy_attack_beetle_redesign.png"),
  beetle16: registerImageAsset("enemy-attack-beetle-16", "assets/images/clean/enemy_attack_beetle_16.png"),
  mist: registerImageAsset("enemy-attack-mist", "assets/images/clean/enemy_attack_mist_redesign.png"),
  mist16: registerImageAsset("enemy-attack-mist-16", "assets/images/clean/enemy_attack_mist_16.png"),
  thorn: registerImageAsset("enemy-attack-thorn-prowler", "assets/images/clean/enemy_attack_thorn_prowler.png"),
  thorn16: registerImageAsset("enemy-attack-thorn-prowler-16", "assets/images/clean/enemy_attack_thorn_prowler_16.png"),
  wisp: registerImageAsset("enemy-attack-wisp-moth", "assets/images/clean/enemy_attack_wisp_moth.png"),
  wisp16: registerImageAsset("enemy-attack-wisp-moth-16", "assets/images/clean/enemy_attack_wisp_moth_16.png"),
  sentinel: registerImageAsset("enemy-attack-ruin-sentinel", "assets/images/clean/enemy_attack_ruin_sentinel.png"),
  sentinel16: registerImageAsset("enemy-attack-ruin-sentinel-16", "assets/images/clean/enemy_attack_ruin_sentinel_16.png"),
  king: registerImageAsset("enemy-attack-king", "assets/images/clean/enemy_attack_king_redesign.png"),
  king16: registerImageAsset("enemy-attack-king-16", "assets/images/clean/enemy_attack_king_16.png"),
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
    id: "forest-ruins-day",
    startWave: 1,
    image: stageForestRuinsDayBg,
    fallback: forestBg,
    dim: 0.22,
    vignette: 0.48,
    tint: "rgba(52, 124, 148, 0.05)",
  },
  {
    id: "forest-gate-night",
    startWave: 5,
    image: stageForestGateNightBg,
    fallback: forestBg,
    dim: 0.25,
    vignette: 0.54,
    tint: "rgba(38, 96, 145, 0.09)",
  },
  {
    id: "arcane-ruins-mid",
    startWave: 10,
    image: stageArcaneRuinsMidBg,
    fallback: forestBg,
    dim: 0.34,
    vignette: 0.6,
    centerDim: 0.12,
    tint: "rgba(72, 86, 188, 0.08)",
  },
  {
    id: "corrupted-forest-late",
    startWave: 15,
    image: stageCorruptedForestLateBg,
    fallback: forestBg,
    dim: 0.46,
    vignette: 0.68,
    tint: "rgba(100, 52, 184, 0.14)",
  },
];

export const BOSS_BACKGROUND_STAGE = {
  id: "rift-boss",
  bossOnly: true,
  image: stageRiftBossBg,
  fallback: forestBg,
  dim: 0.5,
  vignette: 0.74,
  centerDim: 0.24,
  tint: "rgba(88, 54, 190, 0.16)",
};
