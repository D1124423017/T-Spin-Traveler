import {
  ASSET_REGISTRY,
  BACKGROUND_STAGES,
  BOSS_BACKGROUND_STAGE,
  enemyBattlePortraits,
  forestBg,
  getImageAssetRecord,
  heroIdleArt,
  isImageReady,
  metaUpgradeIcons,
  menuIdleCubeSheet,
  menuIdleMeditateSheet,
  musicLoopAssets,
  noaBattleIdleArt,
  noaFeedbackBowArt,
  noaLevelUpSheet,
  noaMenuShowcaseArt,
  oneShotAudioAssets,
  riftEnergyIcon,
  rosterArt,
  slimeArt,
  specialUpgradeCardFrames,
  upgradeCardFrames,
  upgradeTypeIcons,
} from "./src/data/assets.js";
import {
  BGM_PLAYLISTS,
  SPIN_READY_COOLDOWN_MS,
  pickNextBgmAssetKey,
} from "./src/audio/audioEvents.js";
import { createFileSfxPlayer } from "./src/audio/audioManager.js";
import { ENEMIES, MINI_BOSS_ENEMY_IDS } from "./src/data/enemies.js";
import { translations } from "./src/data/i18n.js";
import {
  RARITY,
  UPGRADES,
} from "./src/data/upgrades.js";
import {
  buildTagLabel as buildTagLabelForStats,
  getAcquiredRelicGroups as getAcquiredRelicGroupsForStats,
  getBuildTagMeta,
  getCurrentBuildFamilyStats as getCurrentBuildFamilyStatsForGroups,
  getTraitBonus as getTraitBonusForGroups,
  getTraitChangeHintsForUpgrade as getTraitChangeHintsForUpgradeForGroups,
  getTraitCount as getTraitCountForGroups,
  getTraitEffectText as getTraitEffectTextForEntry,
  getTraitEntries as getTraitEntriesForGroups,
  getTraitNextThreshold as getTraitNextThresholdForGroups,
  getTraitProgress as getTraitProgressForGroups,
  getUpgradeById,
  getUpgradeTags,
} from "./src/combat/buildStats.js";
import {
  I_KICKS,
  JLSTZ_KICKS,
  PIECES,
  cloneMatrix,
  createSevenBag,
  get180Kicks,
  rotateMatrix,
} from "./src/tetris/pieces.js";
import {
  clearFullLines,
  canSpawnPiece,
  getFourWideWellRange,
  collides as collidesOnBoard,
  getVisiblePieceCells,
  isBoardEmpty as isBoardEmptyCore,
  isSpawnBlocked as isSpawnBlockedCore,
  makeBoard as makeEmptyBoard,
} from "./src/tetris/board.js";
import {
  detectSpin as detectSpinCore,
  isPieceImmobile as isPieceImmobileCore,
} from "./src/tetris/spinDetection.js";
import {
  ATTACK_ROW_DAMAGE,
  DEFAULT_DAMAGE_SOURCE_KEYS as DAMAGE_SOURCE_KEYS,
  LINE_DAMAGE,
  PERFECT_CLEAR_BASE_DAMAGE,
  SPIN_DAMAGE_BY_LINES,
  addDamagePart,
  calculateDamage as calculateBaseDamage,
  getComboAttackRows,
  getEffectiveClearLines,
  makeDamageSourceMap,
  getComboMilestoneDamage as getComboMilestoneDamageBase,
} from "./src/combat/damage.js";
import {
  getDefeatCheckPriority,
  getDefeatSafetyResult,
  getComboAttackStyle,
  getHeroAttackStyle,
  getOverlayRenderPath,
  getPlayingFlowSafetyResult,
  getRotationDamageBonus,
  shouldSettleRunRiftEnergy,
  shouldTriggerDefeat,
} from "./src/combat/combatRules.js";
import {
  applyUpgradeEffect,
  getB2BTraitBonus,
  getBossKillerTraitBonus,
  getBurstTraitBonus,
  getComboTraitBonus,
  getDefenseTraitBonus,
  getGarbageTraitBonus,
  getPerfectClearTraitBonus,
  getSpinTraitBonus,
  getSurvivalTraitBonus,
  getTraitFullCount as getTraitFullCountFromDefs,
  getTraitStage as getTraitStageFromDefs,
  getUtilityTraitBonus,
  isTraitHighValueClear,
} from "./src/combat/upgradeEffects.js";
import {
  SPECIAL_UPGRADE_FAMILIES,
  getSpecialBondCounts,
  getSpecialBondPreview,
  getSpecialBondTier,
  isSpecialUpgradeId,
} from "./src/combat/specialUpgrades.js";
import {
  isBossEnemy,
  isBossLikeEnemy,
} from "./src/combat/enemyTypes.js";
import {
  META_UPGRADE_DEFS,
  buyMetaUpgrade,
  calculateRiftEnergyEarned,
  getMetaBonuses,
  getMetaUpgradeCost,
  grantRiftEnergy,
  loadMetaProgress,
  saveMetaProgress,
} from "./src/core/metaProgress.js";
import {
  advanceAscensionChallengeRun,
  applyAscensionChallengeResult,
  canUnlockAscensionChallenge,
  createAscensionChallengeRun,
  failAscensionChallengeRun,
  getAscensionMaxLevel,
  getAscensionStageName,
  getNextAscensionChallenge,
  recordAscensionChallengeLines,
  startAscensionChallengeRun,
} from "./src/core/ascensionChallenge.js";
import {
  getAssetLoadingSummary,
  isAssetLoadingComplete,
} from "./src/core/assetReadiness.js";
import {
  animateNumber,
  clamp,
  drawRoundedRect,
  getSpriteFrameRect,
  hexToRgba,
  insetSpriteFrameRect,
  lerp,
  OVERLAY_READABILITY,
  pointInRect,
  smoothstep,
} from "./src/render/drawUtils.js";
import {
  resetCanvasFrame,
  resetCanvasTransform,
} from "./src/render/renderStyles.js";
import {
  getAnimationDuration,
  getAnimationFrameInfo,
} from "./src/render/animationTiming.js";
import {
  PLAYER_ATTACK_HERO_ANIMATIONS,
  resolvePlayerAttackVfx,
} from "./src/render/playerAttackVfx.js";
import {
  ENEMY_ATTACK_BODY_ANIMATIONS,
  ENEMY_HIT_DELAY_MS,
  resolveEnemyAttackVfx,
} from "./src/render/enemyAttackVfx.js";
import {
  ENEMY_DEATH_ANIMATION,
  ENEMY_DEATH_DURATION_MS,
  ENEMY_DEATH_TRANSITION,
  getEnemyDeathTransitionState,
} from "./src/render/enemyDeathVfx.js";
import {
  HERO_HIT_DURATION_MS,
  PLAYER_HIT_ANIMATION,
} from "./src/render/playerHitVfx.js";
import {
  createHudLayout,
  getAscensionResultButtonRects,
  getControlsResetButtonRect as getControlsResetButtonRectForLayout,
  getHandlingResetButtonRect as getHandlingResetButtonRectForLayout,
  getMainMenuButtonRects as getMainMenuButtonRectsForLayout,
  getMetaAscensionEntryRect,
  getMetaUpgradeBackButtonRect,
  getMetaUpgradeRowRects,
  getResultButtonRects,
  getSettingsBackButtonRect as getSettingsBackButtonRectForLayout,
  getSettingsContentOrigin as getSettingsContentOriginForLayout,
  getSettingsFeedbackCardRect as getSettingsFeedbackCardRectForLayout,
  getSettingsFeedbackButtonRect,
  getUltimateCountdownSeconds,
  getUltimateTimerRatio,
  shouldShowUltimateCountdownWarning,
} from "./src/ui/hudLayout.js";
import { getPiecePreviewLayout } from "./src/ui/piecePreview.js";
import { buildDamageEquation } from "./src/ui/combatReadout.js";
import {
  formatControlKey,
  formatDamageSources as formatDamageSourcesForUi,
  formatMetaUpgradeEffect as formatMetaUpgradeEffectForUi,
} from "./src/ui/formatters.js";
import {
  createLoadingOverlayModel,
  drawLoadingOverlay,
} from "./src/ui/loadingOverlay.js";
import {
  createMenuMotionModel,
  drawMenuAmbientMotion,
  drawMenuTitleWake,
  getMenuButtonMotion,
} from "./src/ui/menuMotion.js";
import {
  cleanupDomOverlay,
  initDomOverlayRoot,
  setDomOverlayMode,
} from "./src/dom/domOverlayRoot.js";
import {
  initFeedbackLayer,
  setFeedbackMode,
  showB2BFeedback,
  showComboFeedback,
  showDamageNumber,
  showPerfectClearFeedback,
  showTSpinFeedback,
} from "./src/dom/gameplayFeedbackLayer.js";
import { showToast } from "./src/dom/toastLayer.js";
import { showBondCallout } from "./src/dom/bondCalloutLayer.js";
import { drawMenuButtonPanel } from "./src/ui/panelDrawing.js";
import {
  drawSettingsScreenOverlay,
  getControlDisplayValue,
} from "./src/ui/settingsScreen.js";
import {
  getElasticRiftSliderValueFromPointer,
} from "./src/ui/elasticRiftSlider.js";
import { createCanvasFont, createTextLayout } from "./src/ui/textLayout.js";
import {
  getTraitDetailTitle as getTraitDetailTitleForPanel,
  getTraitHudLabel as getTraitHudLabelForPanel,
  getTraitProgressStatusText as getTraitProgressStatusTextForPanel,
} from "./src/ui/traitPanel.js";
import {
  getCurrentBuildButtonRect,
  getCurrentBuildCloseRect,
  getCurrentBuildPanelRect,
  getUpgradeDetailToggleRect,
  getUpgradeDraftLayout,
  getUpgradeCardContentLayout,
  getUpgradeCardRect,
  getUpgradeOverlayPanelRect,
  getNextUpgradeSelectionIndex,
} from "./src/ui/upgradeCards.js";
import {
  getUpgradeCardMotion,
  getUpgradeDetailMotion,
  getUpgradeOverlayMotion,
} from "./src/ui/upgradeMotion.js";
import {
  DEBUG_HUD_BUILD,
  createDebugHudState,
  getDebugArtTuning,
  isDebugHudEnabled,
  updateDebugArtTuningDom,
  updateDebugDomHud,
} from "./src/debug/debugHud.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const DISPLAY_FONT_STACK = "'TSpin Traveler Display', 'Noto Sans TC', system-ui, sans-serif";
const UI_FONT_STACK = "'Trebuchet MS', 'Noto Sans TC', system-ui, sans-serif";
const canvasFont = createCanvasFont({
  displayFontStack: DISPLAY_FONT_STACK,
  uiFontStack: UI_FONT_STACK,
});
const {
  label,
  fitLabel,
  wrapText,
  drawLimitedWrapText,
} = createTextLayout(ctx, { canvasFont, uiFontStack: UI_FONT_STACK });
const roundedRect = (...args) => drawRoundedRect(ctx, ...args);

const HERO_ANIMATIONS = PLAYER_ATTACK_HERO_ANIMATIONS;

const HERO_LEVEL_UP_EFFECT = {
  id: "levelUp",
  image: noaLevelUpSheet,
  columns: 4,
  rows: 4,
  frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  frameMs: 52,
  label: "NOA Level Up Rift",
  draw: { x: -188, y: -314, w: 376, h: 502 },
  noKeying: true,
};

const spriteFrameCache = new Map();

const audio = {
  ctx: null,
  master: null,
  musicGain: null,
  sfxGain: null,
  currentSfxBus: null,
  musicTimer: null,
  musicStepTimer: null,
  step: 0,
  energy: 0,
  targetEnergy: 0,
  muted: false,
  masterVolume: 1,
  musicVolume: 0.92,
  sfxVolume: 0.78,
  outputBoost: 3.2,
  sfxCooldowns: new Map(),
  activeSfx: [],
  maxSfxVoices: 18,
  lastLowHpPulseAt: 0,
  lastEnemyWarningAt: 0,
  lastEnemyWarningKey: "",
  musicStage: "menu",
  musicLayers: { menu: 1, early: 0, mid: 0, late: 0, boss: 0, upgrade: 0, danger: 0 },
  lastBossStingerWave: 0,
  lastDangerMusicPulseAt: 0,
  lastSpinReadyAt: 0,
  musicLoopSources: new Map(),
  currentMusicLoopKey: "",
  selectedMusicLoopKey: "",
  musicPlaylistStage: "",
  musicFallbackWarned: new Set(),
  musicPlayBlockedWarned: new Set(),
  lastLoopSyncAt: 0,
};

const fileSfxPlayer = createFileSfxPlayer({
  assets: oneShotAudioAssets,
  getContext: () => audio.ctx,
  getDestination: () => audio.sfxGain,
  getRecord: getAudioAssetRecordForElement,
});

const AUDIO_SETTINGS_REVISION = 5;
const DEFAULT_AUDIO_SETTINGS = {
  muted: false,
  masterVolume: 1,
  musicVolume: 0.92,
  sfxVolume: 0.78,
};
const MUSIC_BPM = 105;
const MUSIC_STEP_MS = 60000 / (MUSIC_BPM * 4);
const MUSIC_ROOT = 146.83; // D minor, stable fantasy battle color.
const MUSIC_STAGE_KEYS = ["menu", "early", "mid", "late", "boss", "upgrade"];
const MUSIC_LAYER_KEYS = [...MUSIC_STAGE_KEYS, "danger"];
const MUSIC_LAYER_SMOOTHING = 0.1;
const MUSIC_DANGER_SMOOTHING = 0.08;
const MUSIC_LOOP_FADE_SMOOTHING = 0.18;
const MUSIC_PLAYLISTS = BGM_PLAYLISTS;
const MUSIC_STAGES = {
  menu: {
    energy: 0.22,
    drone: 0.62,
    bass: 0.12,
    drums: 0.04,
    hand: 0,
    click: 0.12,
    shaker: 0,
    bell: 1.16,
    pluck: 0.42,
    noise: 0.02,
    rootOffset: 0,
    motif: "menu",
  },
  early: {
    energy: 0.42,
    drone: 0.74,
    bass: 0.38,
    drums: 0.24,
    hand: 0.12,
    click: 0.26,
    shaker: 0.04,
    bell: 1,
    pluck: 0.82,
    noise: 0.04,
    rootOffset: 0,
    motif: "early",
  },
  mid: {
    energy: 0.58,
    drone: 1.04,
    bass: 0.66,
    drums: 0.48,
    hand: 0.42,
    click: 0.5,
    shaker: 0.16,
    bell: 0.84,
    pluck: 0.72,
    noise: 0.12,
    rootOffset: -2,
    motif: "mid",
  },
  late: {
    energy: 0.72,
    drone: 1.26,
    bass: 0.86,
    drums: 0.66,
    hand: 0.54,
    click: 0.42,
    shaker: 0.28,
    bell: 0.64,
    pluck: 0.54,
    noise: 0.24,
    rootOffset: -5,
    motif: "late",
  },
  boss: {
    energy: 0.86,
    drone: 1.42,
    bass: 1.04,
    drums: 0.9,
    hand: 0.66,
    click: 0.34,
    shaker: 0.34,
    bell: 0.58,
    pluck: 0.48,
    noise: 0.32,
    rootOffset: -7,
    motif: "boss",
  },
  upgrade: {
    energy: 0.32,
    drone: 0.8,
    bass: 0.18,
    drums: 0.08,
    hand: 0.04,
    click: 0.1,
    shaker: 0.02,
    bell: 1.2,
    pluck: 0.42,
    noise: 0.06,
    rootOffset: 0,
    motif: "menu",
  },
};

const W = canvas.width;
const H = canvas.height;
const COLS = 10;
const ROWS = 20;
const HIDDEN = 5;
const TILE = 29;
const BOARD_X = 476;
const BOARD_Y = 72;
const HOLD_PANEL_X = BOARD_X - 116;
const HOLD_PANEL_Y = BOARD_Y + 42;
const HOLD_PANEL_W = 106;
const HOLD_PANEL_H = 112;
const HOLD_PREVIEW_BOX_W = 86;
const HOLD_PREVIEW_BOX_H = 66;
const HOLD_PREVIEW_CELL_SIZE = 16;
const NEXT_PANEL_X = BOARD_X + COLS * TILE + 22;
const NEXT_PANEL_Y = BOARD_Y + 42;
const NEXT_PREVIEW_COUNT = 5;
const NEXT_PANEL_W = 98;
const NEXT_SLOT_H = 56;
const NEXT_SLOT_GAP = 8;
const NEXT_SLOT_STEP = NEXT_SLOT_H + NEXT_SLOT_GAP;
const NEXT_PREVIEW_BOX_W = 80;
const NEXT_PREVIEW_BOX_H = 50;
const NEXT_PREVIEW_CELL_SIZE = 12.8;
const DROP_MS = 760;
const SOFT_DROP_MS = 12;
const LOCK_DELAY_MS = 500;
const DAS_MS = 128;
const ARR_MS = 28;
const ASSET_LOADING_MIN_MS = 450;
const ASSET_LOADING_MAX_MS = 2600;
const PLAYER_MAX_HP = 100;
const ENEMY_DEFEAT_HEAL = 15;
const PERFECT_CROWN_BOSS_HP_RATIO = 0.5;
const LEGENDARY_DRAFT_CHANCE = 0.12;
const LEGENDARY_BOSS_DRAFT_CHANCE = 0.35;
const ENEMY_ATTACK_DURATION_MS = 950;
const ENEMY_ATTACK_FRAME_MS = ENEMY_ATTACK_DURATION_MS / 8;
const SAVE_KEY = "tspin-traveler-save-v1";
const ULTIMATE_REQUIRED_LINES = 40;
const ULTIMATE_DURATION_MS = 15000;
const ULTIMATE_COMBO_EXTEND_MS = 300;
const ULTIMATE_COMBO_EXTEND_MAX_MS = 850;
const ULTIMATE_TIMER_CAP_MS = 30000;
const ULTIMATE_WELL_START = 3;
const ULTIMATE_WELL_WIDTH = 4;
const ULTIMATE_WALL = "U";
const BATTLE_COUNTDOWN_MS = 3000;
const BATTLE_COUNTDOWN_START_WINDOW_MS = 420;
const FIRST_WAVE_HINT_MS = 4200;
const FIRST_WAVE_HINT_FADE_MS = 520;
const CONTROL_HINT_FULL_MS = 26000;
const PERFECT_HIT_STOP_MS = 150;
const BOSS_PHASE_BANNER_MS = 1550;
const BOSS_WINDUP_MS = 1350;
const HEAVY_ATTACK_WARNING_DAMAGE = 20;
const GITHUB_FEEDBACK_URL = "https://github.com/D1124423017/T-Spin-Traveler/issues";
const DEBUG_HUD_ENABLED = isDebugHudEnabled();

const BALANCE = {
  enemyWaveHp: 10,
  miniBossMultiplier: 1.18,
  bossMultiplier: 1.2,
  enemyDamageEveryWaves: 4,
  enemyDamageStep: 2,
  miniBossDamageBonus: 2,
  waveHeal: ENEMY_DEFEAT_HEAL,
  firstUpgradeAt: 8,
  upgradeGrowthPerTier: 4,
  comboMilestoneEvery: 5,
  comboMilestoneDamage: 50,
  gravityStepWaves: 4,
  gravityStepMs: 50,
  minGravityMs: 160,
  garbageDelayStepWaves: 10,
  guardMax: 24,
  guardPerLine: 2,
  guardSpinBonus: 3,
  perfectClear4WideExtendMs: 3000,
  ...(window.TST_BALANCE || {}),
};

const SFX_MIX = {
  move: 0.3,
  softDrop: 0.2,
  rotate: 0.4,
  rotateT: 0.56,
  drop: 0.7,
  lock: 0.38,
  hold: 0.5,
  clear: 0.64,
  doubleClear: 0.74,
  tripleClear: 0.82,
  bigClear: 0.94,
  combo: 0.92,
  b2b: 0.98,
  tspin: 1.06,
  perfect: 1.12,
  hitLight: 0.58,
  hitHeavy: 0.86,
  hitArcane: 0.96,
  weakness: 0.88,
  cancel: 0.72,
  shield: 0.78,
  enemyWarn: 0.58,
  enemyWarnStrong: 0.82,
  enemy: 0.82,
  lowHp: 0.52,
  wave: 0.78,
  upgrade: 0.78,
  upgradeReady: 0.62,
  start: 0.72,
  defeat: 0.82,
  ...(window.TST_SFX_MIX || {}),
};

const SFX_COOLDOWNS = {
  move: 34,
  softDrop: 105,
  rotate: 58,
  rotateT: 82,
  spinReady: SPIN_READY_COOLDOWN_MS,
  drop: 120,
  lock: 90,
  hold: 95,
  holdUnavailable: 180,
  invalidMove: 160,
  invalidRotate: 180,
  clear: 60,
  doubleClear: 70,
  tripleClear: 82,
  bigClear: 115,
  combo: 150,
  b2b: 180,
  tspin: 220,
  perfect: 420,
  hitLight: 72,
  hitHeavy: 130,
  hitArcane: 190,
  weakness: 160,
  cancel: 140,
  shield: 190,
  enemyWarn: 850,
  enemyWarnStrong: 950,
  enemy: 300,
  lowHp: 2500,
  wave: 360,
  upgrade: 220,
  upgradeReveal: 320,
  upgradeConfirm: 220,
  upgradeReady: 240,
  metaUpgradeSuccess: 360,
  metaUpgradeFail: 260,
  riftEnergyComplete: 1200,
  loadingComplete: 900,
  victory: 1200,
  bossEnter: 900,
  bossDefeated: 1000,
  countdown: 180,
  countdownStart: 360,
  start: 360,
  defeat: 900,
};

const SFX_DURATIONS = {
  move: 60,
  softDrop: 48,
  rotate: 90,
  rotateT: 140,
  spinReady: 300,
  drop: 150,
  lock: 110,
  hold: 150,
  holdUnavailable: 180,
  invalidMove: 130,
  invalidRotate: 150,
  clear: 170,
  doubleClear: 210,
  tripleClear: 250,
  bigClear: 330,
  combo: 360,
  b2b: 380,
  tspin: 520,
  perfect: 920,
  hitLight: 110,
  hitHeavy: 240,
  hitArcane: 420,
  weakness: 240,
  cancel: 210,
  shield: 220,
  enemyWarn: 230,
  enemyWarnStrong: 330,
  enemy: 360,
  lowHp: 420,
  wave: 520,
  upgrade: 420,
  upgradeReveal: 820,
  upgradeConfirm: 640,
  upgradeReady: 260,
  metaUpgradeSuccess: 860,
  metaUpgradeFail: 280,
  riftEnergyComplete: 10000,
  loadingComplete: 500,
  victory: 5600,
  bossEnter: 900,
  bossDefeated: 1050,
  countdown: 160,
  countdownStart: 360,
  start: 360,
  defeat: 760,
};

const SFX_PRIORITY = {
  move: 1,
  softDrop: 1,
  rotate: 1,
  rotateT: 2,
  spinReady: 2,
  lock: 2,
  holdUnavailable: 2,
  invalidMove: 1,
  invalidRotate: 1,
  clear: 3,
  doubleClear: 3,
  tripleClear: 3,
  bigClear: 4,
  combo: 4,
  b2b: 4,
  tspin: 5,
  perfect: 6,
  hitHeavy: 4,
  hitArcane: 5,
  enemyWarnStrong: 5,
  enemy: 5,
  lowHp: 3,
  upgradeReveal: 4,
  upgradeConfirm: 4,
  metaUpgradeSuccess: 4,
  riftEnergyComplete: 5,
  victory: 6,
  bossEnter: 5,
  bossDefeated: 5,
  defeat: 6,
};

const SFX_SYNTH_FALLBACK_ALIASES = {
  spinReady: "rotateT",
  holdUnavailable: "cancel",
  invalidMove: "lock",
  invalidRotate: "rotate",
  upgradeReveal: "upgrade",
  upgradeConfirm: "upgrade",
  metaUpgradeSuccess: "upgrade",
  metaUpgradeFail: "hold",
  riftEnergyComplete: "perfect",
  loadingComplete: "upgradeReady",
  victory: "wave",
  waveVictory: "wave",
  bossEnter: "enemyWarnStrong",
  bossDefeated: "wave",
  uiConfirm: "hold",
  uiCancel: "cancel",
  uiHover: "hold",
  gameOver: "defeat",
  playerAttackLight: "hitLight",
  playerAttackHeavy: "hitHeavy",
  playerAttackArcane: "hitArcane",
};

const LOW_HP_WARNING_RATIO = 0.3;
const LOW_HP_WARNING_COOLDOWN_MS = 3000;
const ENEMY_WARNING_COOLDOWN_MS = 1200;

const TUTORIAL_STEPS = [
  { id: "line", promptKey: "tutorialPrompt.line", detailKey: "tutorialStep.line" },
  { id: "hold", promptKey: "tutorialPrompt.hold", detailKey: "tutorialStep.hold" },
  { id: "combo", promptKey: "tutorialPrompt.combo", detailKey: "tutorialStep.combo" },
  { id: "spin", promptKey: "tutorialPrompt.spin", detailKey: "tutorialStep.spin" },
  { id: "cancel", promptKey: "tutorialPrompt.cancel", detailKey: "tutorialStep.cancel" },
];

const DEFAULT_TUNING = {
  das: DAS_MS,
  arr: ARR_MS,
  softDrop: SOFT_DROP_MS,
  lockDelay: LOCK_DELAY_MS,
  gravity: DROP_MS,
};

const TUNING_SLIDERS = {
  das: { min: 60, max: 240, unit: "ms" },
  arr: { min: 0, max: 80, unit: "ms" },
  softDrop: { min: 1, max: 32, unit: "ms" },
  lockDelay: { min: 200, max: 900, unit: "ms" },
};

const COLORS = {
  I: "#5fd7f4",
  O: "#f0ce5a",
  T: "#9b72ff",
  S: "#62d58b",
  Z: "#ef6673",
  J: "#5a86f7",
  L: "#f0a34a",
  G: "#4e5a62",
};

const RUN_MODES = {
  endless: {
    label: "Endless",
    targetWaves: Infinity,
    descriptionKey: "endlessDescription",
  },
  storyEgypt: {
    label: "Egypt",
    targetWaves: 11,
    descriptionKey: "mainStageEgyptDescription",
  },
  ascension: {
    label: "Ascension",
    targetWaves: Infinity,
    descriptionKey: "ascensionChallengeGoal",
  },
};

const NORMAL_ENEMY_CYCLES_BEFORE_BOSS = 2;

const DEFAULT_CONTROLS = {
  left: ["arrowleft"],
  right: ["arrowright"],
  softDrop: ["arrowdown"],
  hardDrop: [" "],
  rotateCW: ["arrowup", "x"],
  rotateCCW: ["z"],
  rotate180: ["a"],
  hold: ["shift", "c"],
  pause: ["p", "escape"],
  mute: ["m"],
};

const UI_LAYOUT = createHudLayout({
  boardX: BOARD_X,
  boardY: BOARD_Y,
  cols: COLS,
  rows: ROWS,
  tile: TILE,
});

const GSAP_FEEDBACK_POSITIONS = Object.freeze({
  combo: { x: BOARD_X - 92, y: BOARD_Y + 196 },
  b2b: { x: BOARD_X - 92, y: BOARD_Y + 250 },
  tspin: { x: BOARD_X - 92, y: BOARD_Y + 304 },
  perfect: { x: BOARD_X + (COLS * TILE) / 2, y: BOARD_Y + ROWS * TILE * 0.42 },
  damage: { x: UI_LAYOUT.enemyStage.x + 34, y: UI_LAYOUT.enemyStage.y + 126 },
});

const MENU_HERO_DIALOGUE_KEYS = {
  hover: ["menuHeroHover1", "menuHeroHover2", "menuHeroHover3"],
  click: ["menuHeroClick1", "menuHeroClick2", "menuHeroClick3"],
};

const MENU_HERO_DIALOGUE_MS = {
  hover: 2600,
  click: 3400,
};

const MENU_HERO_IDLE_TRIGGER_COOLDOWN_MS = 5000;

const STAGE_BASELINE_OFFSETS = {
  player: { centerX: -6, groundY: 384 },
  enemy: { centerX: 12, groundY: 352 },
};

const CHARACTER_BASELINES = {
  player: {
    groundY: UI_LAYOUT.playerStage.y + STAGE_BASELINE_OFFSETS.player.groundY,
    centerOffsetX: STAGE_BASELINE_OFFSETS.player.centerX,
    localY: 120,
    scale: 0.88,
    glowRadius: 150,
    sigilRadius: 116,
    sigilYOffset: -2,
    shadowW: 112,
    animationScale: 1,
    animationBottomOffset: 18,
  },
  enemy: {
    groundY: UI_LAYOUT.enemyStage.y + STAGE_BASELINE_OFFSETS.enemy.groundY,
    centerOffsetX: STAGE_BASELINE_OFFSETS.enemy.centerX,
    localY: 104,
    scale: 1,
    glowRadius: 176,
    sigilRadius: 144,
    sigilYOffset: -2,
    shadowW: 134,
  },
  menu: {
    localY: 116,
    shadowW: 118,
  },
};

const SPRITE_FRAME_CROP_INSET = 3;

const SETTINGS_TABS = ["controls", "handling", "audio", "language", "feedback"];

const MENU_IDLE_SEQUENCE = [
  { id: "idleA", duration: 2200 },
  { id: "idleB", duration: 2700 },
  { id: "idleA", duration: 1900 },
  { id: "idleC", duration: 2500 },
  { id: "idleA", duration: 2100 },
  { id: "idleD", duration: 2800 },
];

const MENU_IDLE_TRANSITION_MS = 420;
const MENU_SPECIAL_IDLE_INTERVAL_MS = 10000;
const MENU_SPECIAL_IDLE_FADE_MS = 180;

const MENU_HERO_SPECIAL_ANIMATIONS = {
  cube: {
    id: "menu-idle-cube",
    image: menuIdleCubeSheet,
    columns: 4,
    rows: 4,
    frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    frameMs: 122,
    draw: { x: -158, y: -252, w: 316, h: 438 },
    noKeying: true,
  },
  meditate: {
    id: "menu-idle-meditate",
    image: menuIdleMeditateSheet,
    columns: 4,
    rows: 4,
    frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    frameMs: 142,
    draw: { x: -166, y: -252, w: 332, h: 438 },
    noKeying: true,
  },
};

const CONTROL_ACTIONS = [
  { id: "left", labelKey: "control.left" },
  { id: "right", labelKey: "control.right" },
  { id: "softDrop", labelKey: "control.softDrop" },
  { id: "hardDrop", labelKey: "control.hardDrop" },
  { id: "rotateCW", labelKey: "control.rotateCW" },
  { id: "rotateCCW", labelKey: "control.rotateCCW" },
  { id: "rotate180", labelKey: "control.rotate180" },
  { id: "hold", labelKey: "control.hold" },
  { id: "pause", labelKey: "control.pause" },
  { id: "mute", labelKey: "control.mute" },
];

const getMainMenuButtonRects = () => getMainMenuButtonRectsForLayout(UI_LAYOUT.menu);
const getSettingsContentOrigin = () => getSettingsContentOriginForLayout(UI_LAYOUT.settings);
const getSettingsBackButtonRect = () => getSettingsBackButtonRectForLayout(UI_LAYOUT.settings);
const getSettingsFeedbackCardRect = () => getSettingsFeedbackCardRectForLayout(getSettingsContentOrigin());
const getControlsResetButtonRect = () => getControlsResetButtonRectForLayout(
  getSettingsContentOrigin(),
  UI_LAYOUT.controlsGrid,
  CONTROL_ACTIONS.length,
);
const getHandlingResetButtonRect = () => getHandlingResetButtonRectForLayout(getSettingsContentOrigin());

function normalizeControlKeys(value) {
  const source = Array.isArray(value) ? value : (typeof value === "string" ? [value] : []);
  const keys = [];
  for (const key of source) {
    if (typeof key !== "string") continue;
    const normalized = normalizeControlKey(key);
    if (!normalized || keys.includes(normalized)) continue;
    keys.push(normalized);
  }
  return keys;
}

function normalizeControlsMap(source = {}) {
  const controls = {};
  for (const { id } of CONTROL_ACTIONS) {
    const hasSavedValue = Object.prototype.hasOwnProperty.call(source, id);
    const fallback = DEFAULT_CONTROLS[id] || [];
    const keys = normalizeControlKeys(hasSavedValue ? source[id] : fallback);
    controls[id] = keys.length || hasSavedValue ? keys : normalizeControlKeys(fallback);
  }
  return controls;
}

function serializeControls(controls) {
  const normalized = normalizeControlsMap(controls || {});
  return Object.fromEntries(Object.entries(normalized).map(([id, keys]) => [id, keys.slice()]));
}

function getControlKeys(action) {
  const controls = state && state.controls ? state.controls : DEFAULT_CONTROLS;
  const hasValue = Object.prototype.hasOwnProperty.call(controls, action);
  return normalizeControlKeys(hasValue ? controls[action] : DEFAULT_CONTROLS[action]);
}

function allControlKeys() {
  return CONTROL_ACTIONS.flatMap(({ id }) => getControlKeys(id));
}



const TEXT = translations;

const ROSTER_CELLS = {
  noa: [0, 0],
  slime: [1, 0],
  vine: [2, 0],
  mushroom: [3, 0],
  beetle: [0, 1],
  mist: [1, 1],
  thorn: [2, 0],
  wisp: [1, 1],
  stalker: [2, 1],
  sentinel: [3, 1],
  king: [3, 1],
};

const CHALLENGES = [
  {
    id: "tspin-mini",
    title: "T-Spin Mini",
    descKey: "challenge.tspinMini",
    target: 1,
  },
  {
    id: "cancel3",
    title: "Cancel 3",
    descKey: "challenge.cancel3",
    target: 3,
  },
  {
    id: "b2b2",
    title: "B2B x2",
    descKey: "challenge.b2b2",
    target: 2,
  },
];

const CHALLENGE_REWARDS = {
  "tspin-mini": "Spin Circuit",
  cancel3: "Gravity Filter",
  b2b2: "Back-to-Back Blade",
};





const ENEMY_ATTACK_ANIMATIONS = ENEMY_ATTACK_BODY_ANIMATIONS;

const state = {
  mode: "start",
  board: makeBoard(),
  bag: [],
  queue: [],
  active: null,
  hold: null,
  canHold: true,
  playerMaxHp: PLAYER_MAX_HP,
  playerHp: PLAYER_MAX_HP,
  guard: 0,
  maxGuard: BALANCE.guardMax,
  runMode: "endless",
  enemyHp: 120,
  enemyMaxHp: 120,
  enemyHpDisplay: 120,
  enemyHpTrail: 120,
  enemyAttackDamage: 8,
  enemyCountdown: 7,
  enemyType: ENEMIES[0],
  wave: 1,
  defeated: 0,
  dropTimer: 0,
  lockTimer: null,
  lastTime: 0,
  lineFlash: [],
  floaters: [],
  particles: [],
  bursts: [],
  attacks: [],
  pendingHits: [],
  perfectClearFx: null,
  operationReadouts: [],
  combatPopups: [],
  lastDamageBreakdown: null,
  shake: 0,
  enemyHit: 0,
  enemyHitIntensity: 0,
  playerHit: 0,
  heroAnimation: null,
  heroLevelUpFx: null,
  enemyAnimation: null,
  enemyDeathVfx: null,
  placed: 0,
  combo: 0,
  pendingGarbage: 0,
  garbageGrace: 0,
  queueHex: 0,
  mistGarbage: 0,
  lastGarbageHole: null,
  garbageHoleRun: 0,
  miniBoss: false,
  lastClearedBoss: false,
  b2bActive: false,
  b2bChain: 0,
  b2bBrokenFlash: 0,
  lastPerfectClear: false,
  perfectClears: 0,
  ultimateCharge: 0,
  ultimateActive: false,
  ultimateTimer: 0,
  ultimateTimerMax: ULTIMATE_DURATION_MS,
  ultimateSavedBoard: null,
  upgradeMeter: 0,
  nextUpgradeAt: 8,
  upgradeTier: 0,
  upgradeReady: false,
  stats: makeStats(),
  save: loadSave(),
  metaProgress: loadMetaProgress(),
  runStats: makeRunStats(),
  runFinalized: false,
  defeatRenderTraceWarned: false,
  playingStallWarned: false,
  debug: createDebugHudState(),
  challenge: null,
  ascensionRun: null,
  tutorial: null,
  upgradeChoices: [],
  upgradeSelectedIndex: 0,
  upgradeDraftReason: null,
  acquiredRelics: [],
  currentBuildOpen: false,
  upgradePickConfirm: null,
  upgradeMotion: null,
  upgradeDetailOpen: false,
  spinSingularityStacks: 0,
  spinStarterWave: 0,
  spinStarterUses: 0,
  comboConstellationWave: 0,
  comboConstellationFirstUsed: false,
  comboConstellationSecondUsed: false,
  comboSafetyNetWave: 0,
  emergencyRiftShieldWave: 0,
  perfectEchoCharges: 0,
  riftOverdriveCharge: 0,
  lastStarProtocolWave: 0,
  lastStarProtocolReady: false,
  angelWard: 0,
  angelBlessingCharges: 0,
  angelMercyWave: 0,
  devilSinMarks: 0,
  upgrades: {
    tspinBonus: 0,
    garbageCancel: 0,
    comboDelay: 0,
    b2bBonus: 0,
    waveHeal: 0,
    spinBonus: 0,
    allSpinBonus: 0,
    comboDamage: 0,
    defense: 0,
    garbageGrace: 0,
    bossDamage: 0,
    maxHpBonus: 0,
    lineDamage: 0,
    clearHeal: 0,
    spinHeal: 0,
    damageMultiplier: 0,
    guardGain: 0,
    comboGuardGain: 0,
    b2bShield: 0,
    spinGuardStrike: 0,
    comboEchoDamage: 0,
    guardReflect: 0,
    garbageCounterDamage: 0,
    burstCharge: 0,
    perfectBossDelay: 0,
    singularitySpinCore: 0,
    comboConstellation: 0,
    aegisStarMirror: 0,
    garbageAlchemyCore: 0,
    perfectRiftCrown: 0,
    spinStarter: 0,
    b2bCompass: 0,
    comboSafetyNet: 0,
    emergencyRiftShield: 0,
    garbageTransmuter: 0,
    perfectEcho: 0,
    riftOverdrive: 0,
    lastStarProtocol: 0,
    angelHaloSanctuary: 0,
    angelCleansingPrism: 0,
    angelPerfectBenediction: 0,
    devilBloodMoonPact: 0,
    devilAbyssChain: 0,
    devilFallenCrown: 0,
  },
  message: "",
  messageKey: "",
  messageVars: {},
  metaUpgradeMessage: { key: "", vars: {}, until: 0 },
  settingsOpen: false,
  settingsTab: "controls",
  pauseView: "menu",
  menuRevealStartedAt: 0,
  bindingAction: null,
  menuSpecialIdleStartedAt: performance.now(),
  menuHeroInteraction: {
    hovered: false,
    hoverStartedAt: 0,
    actionKind: "",
    actionStartedAt: 0,
    actionUntil: 0,
    lineKey: "",
    lineKind: "",
    lineStartedAt: 0,
    lineUntil: 0,
    lineIndex: 0,
    idleKind: "cube",
    idleStartedAt: 0,
    idleUntil: 0,
    idleCooldownUntil: 0,
    idleTriggerCount: 0,
  },
  language: "zh",
  controls: normalizeControlsMap(DEFAULT_CONTROLS),
  tuning: { ...DEFAULT_TUNING },
  pointer: {
    x: 0,
    y: 0,
    down: false,
    dragging: null,
    elasticSlider: { key: "", overflow: 0, releaseKey: "", releaseOverflow: 0, releaseStartedAt: 0 },
  },
  countdownMs: 0,
  countdownCue: "",
  firstWaveHintMs: 0,
  controlHintsFullUntil: 0,
  bossPhaseBanner: null,
  bossWindup: null,
  lastBossPhase: 1,
  hitStopMs: 0,
  assetLoadingStartedAt: performance.now(),
  assetLoadingDone: false,
  lastMoveWasRotate: false,
  lastRotationKind: null,
  lastKickIndex: null,
  input: {
    left: false,
    right: false,
    softDrop: false,
    horizontalDir: 0,
    das: 0,
    arr: 0,
    softDropTimer: 0,
  },
};

function makeBoard() {
  return makeEmptyBoard({ cols: COLS, rows: ROWS, hidden: HIDDEN });
}

function isUltimateWellColumn(x) {
  const well = getUltimateWellRange();
  return x >= well.start && x < well.end;
}

function getUltimateWellRange() {
  return getFourWideWellRange({ x: ULTIMATE_WELL_START, width: ULTIMATE_WELL_WIDTH, cols: COLS });
}

function makeUltimateRow(fill = null) {
  return Array.from({ length: COLS }, (_, x) => (isUltimateWellColumn(x) ? fill : ULTIMATE_WALL));
}

function makeUltimateBoard() {
  return Array.from({ length: ROWS + HIDDEN }, () => makeUltimateRow(null));
}

function applyUltimateWalls() {
  if (!state.ultimateActive) return;
  for (const row of state.board) {
    for (let x = 0; x < COLS; x += 1) {
      if (!isUltimateWellColumn(x)) row[x] = ULTIMATE_WALL;
    }
  }
}

function rowHasPlayableCells(row) {
  return Array.isArray(row) && row.some((cell) => cell && cell !== ULTIMATE_WALL);
}

function getBoardCollisionOptions() {
  return { cols: COLS, rows: ROWS, hidden: HIDDEN };
}

function isPieceSpawnBlocked(piece) {
  return piece ? isSpawnBlockedCore(state.board, piece, getBoardCollisionOptions()) : false;
}

function getDefeatSpawnProbe(spawnPiece = null) {
  if (spawnPiece) return spawnPiece;
  const nextType = state.active?.type && PIECES[state.active.type]
    ? state.active.type
    : state.queue[0] && PIECES[state.queue[0]]
      ? state.queue[0]
      : "T";
  return newPiece(nextType);
}

function isSpawnBlockedForDefeat(spawnPiece = null) {
  return isPieceSpawnBlocked(getDefeatSpawnProbe(spawnPiece));
}

function isActivePieceOverlappingBoard() {
  return state.active
    ? collidesOnBoard(state.board, state.active, state.active.x, state.active.y, state.active.shape, getBoardCollisionOptions())
    : false;
}

function isPieceAboveTopBuffer(piece) {
  if (!piece || !Array.isArray(piece.shape)) return false;
  for (let r = 0; r < piece.shape.length; r += 1) {
    for (let c = 0; c < piece.shape[r].length; c += 1) {
      if (piece.shape[r][c] && piece.y + r < 0) return true;
    }
  }
  return false;
}

function isPieceGroundedAboveTopBuffer(piece) {
  if (!isPieceAboveTopBuffer(piece)) return false;
  return collidesOnBoard(state.board, piece, piece.x, piece.y + 1, piece.shape, getBoardCollisionOptions());
}

function warnPlayingStallOnce(reason, source, extra = {}) {
  if (state.playingStallWarned) return;
  state.playingStallWarned = true;
  console.warn("[T-Spin Traveler] Playing flow safety recovery", {
    reason,
    source,
    mode: state.mode,
    runFinalized: state.runFinalized,
    playerHp: state.playerHp,
    active: getActivePieceDebugInfo(),
    lockTimer: state.lockTimer,
    countdownMs: state.countdownMs,
    hitStopMs: state.hitStopMs,
    pendingHits: state.pendingHits.length,
    hiddenRows: getHiddenRowsDebugInfo(),
    ...extra,
  });
}

function resolvePlayingFlowSafety(source = "playingFlowSafety") {
  if (state.mode !== "playing" || state.runFinalized) return false;
  const activeOverlapsBoard = isActivePieceOverlappingBoard();
  const activeAboveVisible = state.active ? isPieceAboveTopBuffer(state.active) : false;
  const activeGroundedAboveVisible = state.active ? isPieceGroundedAboveTopBuffer(state.active) : false;
  const result = getPlayingFlowSafetyResult({
    mode: state.mode,
    runFinalized: state.runFinalized,
    hasActivePiece: Boolean(state.active),
    activeOverlapsBoard,
    activeAboveVisible,
    activeGroundedAboveVisible,
  });
  if (result.action === "none") return false;
  warnPlayingStallOnce(result.reason, source, { activeOverlapsBoard, activeAboveVisible, activeGroundedAboveVisible });
  if (result.action === "defeat") {
    triggerDefeat(result.messageKey, `${source}.${result.reason}`);
    return state.mode === "defeat" || state.mode === "ascensionResult";
  }
  if (result.action === "spawn") {
    state.active = null;
    state.lockTimer = null;
    spawnPiece();
    return state.mode === "defeat";
  }
  return false;
}

function checkDefeatState(source = "checkDefeatState", { spawnPiece = null, spawnBlocked = null } = {}) {
  if (state.mode !== "playing" || state.runFinalized) return false;
  const priority = getDefeatCheckPriority({
    mode: state.mode,
    runFinalized: state.runFinalized,
    playerHp: state.playerHp,
    spawnBlocked,
  });
  if (priority.result.playerHp !== state.playerHp) state.playerHp = priority.result.playerHp;
  if (priority.result.defeated) {
    triggerDefeat(priority.result.messageKey, `${source}.${priority.result.reason}`);
    return state.mode === "defeat" || state.mode === "ascensionResult";
  }

  if (priority.shouldRunPlayingFlowSafety && resolvePlayingFlowSafety(source)) return true;

  const result = getDefeatSafetyResult({
    mode: state.mode,
    runFinalized: state.runFinalized,
    playerHp: state.playerHp,
    spawnBlocked: spawnBlocked ?? isSpawnBlockedForDefeat(spawnPiece),
  });
  if (result.playerHp !== state.playerHp) state.playerHp = result.playerHp;
  if (!result.defeated) return false;
  triggerDefeat(result.messageKey, `${source}.${result.reason}`);
  return state.mode === "defeat" || state.mode === "ascensionResult";
}

function getActivePieceDebugInfo() {
  if (!state.active) return null;
  return {
    type: state.active.type,
    x: state.active.x,
    y: state.active.y,
  };
}

function getHiddenRowsDebugInfo() {
  const hiddenRows = state.board.slice(0, HIDDEN);
  return {
    occupied: hiddenRows.some(rowHasPlayableCells),
    rows: hiddenRows.map(rowHasPlayableCells),
  };
}

function setGameMode(mode) {
  state.mode = mode;
  setDomOverlayMode(mode);
  setFeedbackMode(mode);
}

function prefersReducedMotion() {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function warnDefeatSource(source, messageKey) {
  console.warn("[T-Spin Traveler] Game Over", {
    source,
    messageKey,
    mode: state.mode,
    playerHp: state.playerHp,
    active: getActivePieceDebugInfo(),
    hiddenRows: getHiddenRowsDebugInfo(),
  });
}

function makeStats() {
  return {
    peakWave: 1,
    maxCombo: 0,
    b2bCount: 0,
    perfectClears: 0,
    spins: 0,
    allSpins: 0,
    damage: 0,
    bestHit: 0,
    damageSources: Object.fromEntries(DAMAGE_SOURCE_KEYS.map((key) => [key, 0])),
    rating: "GOOD",
  };
}

function makeRunStats() {
  return {
    waveReached: 1,
    normalEnemyKills: 0,
    bossKills: 0,
    perfectClearCount: 0,
    spinCount: 0,
    maxCombo: 0,
    riftEnergyEarned: 0,
    riftEnergySettled: false,
  };
}

function loadSave() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    return raw
      ? JSON.parse(raw)
      : {
          bestWave: 0,
          bestCombo: 0,
          bestB2B: 0,
          bestDamage: 0,
          bestHit: 0,
          perfectClears: 0,
          tutorialCompleted: false,
          settings: {
            masterVolume: audio.masterVolume,
            musicVolume: audio.musicVolume,
            sfxVolume: audio.sfxVolume,
            muted: audio.muted,
            language: "zh",
            controls: serializeControls(DEFAULT_CONTROLS),
            tuning: { ...DEFAULT_TUNING },
          },
        };
  } catch {
    return { bestWave: 0, bestCombo: 0, bestB2B: 0, bestDamage: 0, bestHit: 0, perfectClears: 0, tutorialCompleted: false, settings: {} };
  }
}

function saveGame() {
  try {
    state.save.settings = {
      masterVolume: audio.masterVolume,
      musicVolume: audio.musicVolume,
      sfxVolume: audio.sfxVolume,
      muted: audio.muted,
      audioRevision: AUDIO_SETTINGS_REVISION,
      language: state.language,
      controls: serializeControls(state.controls),
      tuning: { ...state.tuning },
    };
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state.save));
  } catch {
    // Local saves are optional; gameplay should continue if storage is blocked.
  }
}

function applySavedSettings() {
  const settings = state.save.settings || {};
  const resetLegacySilentAudio = shouldResetLegacySilentAudio(settings);
  audio.masterVolume = resetLegacySilentAudio
    ? DEFAULT_AUDIO_SETTINGS.masterVolume
    : readSavedVolume(settings.masterVolume, DEFAULT_AUDIO_SETTINGS.masterVolume);
  audio.musicVolume = resetLegacySilentAudio
    ? DEFAULT_AUDIO_SETTINGS.musicVolume
    : readSavedVolume(settings.musicVolume, DEFAULT_AUDIO_SETTINGS.musicVolume);
  audio.sfxVolume = readSavedVolume(settings.sfxVolume, DEFAULT_AUDIO_SETTINGS.sfxVolume);
  audio.muted = resetLegacySilentAudio
    ? DEFAULT_AUDIO_SETTINGS.muted
    : typeof settings.muted === "boolean" ? settings.muted : DEFAULT_AUDIO_SETTINGS.muted;
  if (settings.language === "en" || settings.language === "zh") state.language = settings.language;
  state.controls = normalizeControlsMap(settings.controls || DEFAULT_CONTROLS);
  state.tuning = { ...DEFAULT_TUNING, ...(settings.tuning || {}) };
  if ((settings.audioRevision || 0) < 4) state.tuning.softDrop = DEFAULT_TUNING.softDrop;
  if (typeof settings.pause === "string") state.controls.pause = normalizeControlKeys(settings.pause);
  applyAudioSettings();
  syncControlHints();
}

function readSavedVolume(value, fallback) {
  return Number.isFinite(value) ? clamp(value, 0, 1) : fallback;
}

function shouldResetLegacySilentAudio(settings) {
  const revision = Number.isFinite(settings.audioRevision) ? settings.audioRevision : 0;
  if (revision >= AUDIO_SETTINGS_REVISION) return false;
  return settings.muted === true || settings.masterVolume === 0 || settings.musicVolume === 0;
}

function refillQueue() {
  while (state.queue.length < 7) {
    if (state.bag.length === 0) {
      state.bag = createSevenBag(Math.random);
    }
    state.queue.push(state.bag.pop());
  }
}

function newPiece(type) {
  const shape = cloneMatrix(PIECES[type]);
  const well = getUltimateWellRange();
  const spawnLeft = state.ultimateActive ? well.start : 0;
  const spawnWidth = state.ultimateActive ? well.width : COLS;
  return {
    type,
    shape,
    x: spawnLeft + Math.floor((spawnWidth - shape[0].length) / 2),
    y: type === "I" ? -1 : 0,
    rotation: 0,
  };
}

function spawnPiece() {
  if (state.mode === "defeat" || state.mode === "victory") return;
  refillQueue();
  state.active = newPiece(state.queue.shift());
  state.canHold = true;
  state.lockTimer = null;
  state.lastMoveWasRotate = false;
  state.lastRotationKind = null;
  state.lastKickIndex = null;
  if (!canSpawnPiece(state.board, state.active, getBoardCollisionOptions())) {
    checkDefeatState("spawnPiece.spawnBlocked", { spawnPiece: state.active, spawnBlocked: true });
  }
}

function triggerDefeat(messageKey, source = "triggerDefeat") {
  state.debug.triggerDefeatCalled = true;
  state.debug.lastDefeatSource = source;
  state.debug.lastDefeatMessageKey = messageKey;
  if (!shouldTriggerDefeat(state)) return;
  warnDefeatSource(source, messageKey);
  if (isAscensionRunInProgress()) {
    const failureReason = messageKey === "messagePlayerDefeat" ? "defeat" : "topOut";
    state.ascensionRun = failAscensionChallengeRun(state.ascensionRun, failureReason);
    completeAscensionChallenge(false);
    return;
  }
  setGameMode("defeat");
  setMessage(messageKey);
  state.active = null;
  state.lockTimer = null;
  state.countdownMs = 0;
  state.hitStopMs = 0;
  state.pendingHits = [];
  resetInputRepeat();
  finishRun("defeat");
  playSfx("defeat");
}

function resetGame(runMode = state.runMode || "endless", challengeId = null) {
  unlockAudio();
  cleanupDomOverlay();
  setGameMode("playing");
  if (runMode === "ascension") {
    showToast({
      type: "run-start",
      text: t("ascensionChallengeStarted"),
      tone: "rift",
      durationMs: 1500,
    });
  }
  state.pauseView = "menu";
  state.settingsOpen = false;
  state.bindingAction = null;
  state.runMode = RUN_MODES[runMode] ? runMode : "endless";
  state.board = makeBoard();
  state.bag = [];
  state.queue = [];
  state.hold = null;
  state.canHold = true;
  state.playerMaxHp = PLAYER_MAX_HP;
  state.playerHp = state.playerMaxHp;
  state.guard = 0;
  state.maxGuard = BALANCE.guardMax;
  state.wave = 1;
  state.defeated = 0;
  configureEnemyForWave();
  state.dropTimer = 0;
  state.lockTimer = null;
  state.lineFlash = [];
  state.floaters = [];
  state.particles = [];
  state.bursts = [];
  state.attacks = [];
  state.pendingHits = [];
  state.perfectClearFx = null;
  state.operationReadouts = [];
  state.combatPopups = [];
  state.lastDamageBreakdown = null;
  state.shake = 0;
  state.enemyHit = 0;
  state.enemyHitIntensity = 0;
  state.playerHit = 0;
  state.heroAnimation = null;
  state.heroLevelUpFx = null;
  state.enemyAnimation = null;
  state.enemyDeathVfx = null;
  state.placed = 0;
  state.combo = 0;
  state.pendingGarbage = 0;
  state.garbageGrace = 0;
  state.queueHex = 0;
  state.mistGarbage = 0;
  state.lastGarbageHole = null;
  state.garbageHoleRun = 0;
  state.miniBoss = false;
  state.lastClearedBoss = false;
  state.b2bActive = false;
  state.b2bChain = 0;
  state.b2bBrokenFlash = 0;
  state.lastPerfectClear = false;
  state.perfectClears = 0;
  state.ultimateCharge = 0;
  state.ultimateActive = false;
  state.ultimateTimer = 0;
  state.ultimateTimerMax = ULTIMATE_DURATION_MS;
  state.ultimateSavedBoard = null;
  state.upgradeMeter = 0;
  state.nextUpgradeAt = BALANCE.firstUpgradeAt;
  state.upgradeTier = 0;
  state.upgradeReady = false;
  state.stats = makeStats();
  state.runStats = makeRunStats();
  state.runFinalized = false;
  state.defeatRenderTraceWarned = false;
  state.playingStallWarned = false;
  state.debug = createDebugHudState();
  state.debug.lastUpdateAt = performance.now();
  state.debug.lastDrawAt = performance.now();
  state.challenge = challengeId ? makeChallengeState(challengeId) : null;
  state.ascensionRun = null;
  state.tutorial = null;
  state.upgradeChoices = [];
  state.upgradeSelectedIndex = 0;
  state.upgradeDraftReason = null;
  state.acquiredRelics = [];
  state.currentBuildOpen = false;
  state.upgradePickConfirm = null;
  state.upgradeMotion = null;
  state.upgradeDetailOpen = false;
  state.spinSingularityStacks = 0;
  state.spinStarterWave = 0;
  state.spinStarterUses = 0;
  state.comboConstellationWave = 0;
  state.comboConstellationFirstUsed = false;
  state.comboConstellationSecondUsed = false;
  state.comboSafetyNetWave = 0;
  state.emergencyRiftShieldWave = 0;
  state.perfectEchoCharges = 0;
  state.riftOverdriveCharge = 0;
  state.lastStarProtocolWave = 0;
  state.lastStarProtocolReady = false;
  state.angelWard = 0;
  state.angelBlessingCharges = 0;
  state.angelMercyWave = 0;
  state.devilSinMarks = 0;
  state.upgrades = {
    tspinBonus: 0,
    garbageCancel: 0,
    comboDelay: 0,
    b2bBonus: 0,
    waveHeal: 0,
    spinBonus: 0,
    allSpinBonus: 0,
    comboDamage: 0,
    defense: 0,
    garbageGrace: 0,
    bossDamage: 0,
    maxHpBonus: 0,
    lineDamage: 0,
    clearHeal: 0,
    spinHeal: 0,
    damageMultiplier: 0,
    guardGain: 0,
    comboGuardGain: 0,
    b2bShield: 0,
    spinGuardStrike: 0,
    comboEchoDamage: 0,
    guardReflect: 0,
    garbageCounterDamage: 0,
    burstCharge: 0,
    perfectBossDelay: 0,
    singularitySpinCore: 0,
    comboConstellation: 0,
    aegisStarMirror: 0,
    garbageAlchemyCore: 0,
    perfectRiftCrown: 0,
    spinStarter: 0,
    b2bCompass: 0,
    comboSafetyNet: 0,
    emergencyRiftShield: 0,
    garbageTransmuter: 0,
    perfectEcho: 0,
    riftOverdrive: 0,
    lastStarProtocol: 0,
    angelHaloSanctuary: 0,
    angelCleansingPrism: 0,
    angelPerfectBenediction: 0,
    devilBloodMoonPact: 0,
    devilAbyssChain: 0,
    devilFallenCrown: 0,
  };
  state.message = "";
  state.messageKey = "";
  state.messageVars = {};
  state.metaUpgradeMessage = { key: "", vars: {}, until: 0 };
  state.lastMoveWasRotate = false;
  state.lastRotationKind = null;
  state.lastKickIndex = null;
  state.input.left = false;
  state.input.right = false;
  state.input.softDrop = false;
  state.input.softDropTimer = 0;
  state.firstWaveHintMs = 0;
  state.controlHintsFullUntil = performance.now() + BATTLE_COUNTDOWN_MS + CONTROL_HINT_FULL_MS;
  state.bossPhaseBanner = null;
  state.bossWindup = null;
  state.lastBossPhase = 1;
  state.hitStopMs = 0;
  audio.lastBossStingerWave = 0;
  resetInputRepeat();
  applyMetaProgressToNewRun();
  if (state.runMode === "ascension") {
    state.ascensionRun = createAscensionChallengeRun(
      getNextAscensionChallenge(state.metaProgress),
    );
  }
  refillQueue();
  spawnPiece();
  playSfx("start");
  startBattleCountdown();
}

function applyMetaProgressToNewRun() {
  state.metaProgress = loadMetaProgress();
  const bonuses = getMetaBonuses(state.metaProgress);
  state.playerMaxHp = PLAYER_MAX_HP + bonuses.hpBonus;
  state.playerHp = state.playerMaxHp;
  state.guard = Math.min(getEffectiveMaxGuard(), bonuses.guardBonus);
}

function startBattleCountdown() {
  state.countdownMs = BATTLE_COUNTDOWN_MS;
  state.countdownCue = "3";
  playSfx("countdown");
}

function makeChallengeState(id) {
  const config = CHALLENGES.find((challenge) => challenge.id === id);
  return config ? { id, progress: 0, complete: false } : null;
}

function startChallenge(id) {
  resetGame("endless", id);
  state.floaters.push({
    x: BOARD_X - 38,
    y: BOARD_Y + 38,
    text: t("challengeStart").toUpperCase(),
    color: "#fff0a6",
    life: 1300,
  });
}

function startTutorial() {
  resetGame("endless");
  state.tutorial = {
    active: true,
    step: 0,
    done: false,
    startedAt: performance.now(),
  };
  state.floaters.push({
    x: BOARD_X - 42,
    y: BOARD_Y + 40,
    text: t("tutorialTitle").toUpperCase(),
    color: "#fff0a6",
    life: 1400,
  });
}

function advanceTutorialStep(stepId) {
  if (!state.tutorial || !state.tutorial.active || state.tutorial.done) return;
  const current = TUTORIAL_STEPS[state.tutorial.step];
  if (!current || current.id !== stepId) return;
  state.tutorial.step += 1;
  const complete = state.tutorial.step >= TUTORIAL_STEPS.length;
  if (complete) {
    state.tutorial.done = true;
    state.tutorial.active = false;
    state.floaters.push({
      x: BOARD_X + 34,
      y: BOARD_Y + 86,
      text: t("tutorialDone").toUpperCase(),
      color: "#fff0a6",
      life: 1600,
    });
    playSfx("upgrade");
    state.save.tutorialCompleted = true;
    saveGame();
    return;
  }
  const next = TUTORIAL_STEPS[state.tutorial.step];
  if (next.id === "cancel") {
    state.pendingGarbage = Math.max(state.pendingGarbage, 3);
    state.garbageGrace = Math.max(state.garbageGrace, 3);
  }
  state.floaters.push({
    x: BOARD_X + 16,
    y: BOARD_Y + 72,
    text: t(next.promptKey),
    color: "#9df7da",
    life: 1300,
  });
}

function collides(piece, x, y, shape) {
  return collidesOnBoard(state.board, piece, x, y, shape, getBoardCollisionOptions());
}

function move(dx, dy) {
  if (state.mode !== "playing" || !state.active) return false;
  const piece = state.active;
  if (!collides(piece, piece.x + dx, piece.y + dy, piece.shape)) {
    piece.x += dx;
    piece.y += dy;
    if (dx !== 0 || dy !== 0) {
      state.lastMoveWasRotate = false;
      state.lastRotationKind = null;
      state.lastKickIndex = null;
    }
    if (dy === 0 && touchingGround()) resetLockDelay();
    return true;
  }
  return false;
}

function resetLockDelay() {
  state.lockTimer = performance.now();
}

function rotate(dir) {
  if (state.mode !== "playing" || !state.active) return;
  const piece = state.active;
  if (piece.type === "O") return;
  const next = rotateMatrix(piece.shape, dir);
  const from = piece.rotation;
  const to = (piece.rotation + dir + 4) % 4;
  const table = piece.type === "I" ? I_KICKS : JLSTZ_KICKS;
  const kicks = table[`${from}>${to}`] || [[0, 0]];
  for (const [kickIndex, [dx, dy]] of kicks.entries()) {
    if (!collides(piece, piece.x + dx, piece.y - dy, next)) {
      piece.shape = next;
      piece.x += dx;
      piece.y -= dy;
      piece.rotation = to;
      state.lastMoveWasRotate = true;
      state.lastRotationKind = dir > 0 ? "cw" : "ccw";
      state.lastKickIndex = kickIndex;
      if (touchingGround()) resetLockDelay();
      playSfx(piece.type === "T" ? "rotateT" : "rotate");
      triggerSpinReadyCue(piece, kickIndex);
      return;
    }
  }
  playSfx("invalidRotate");
}

function rotate180() {
  if (state.mode !== "playing" || !state.active) return;
  const piece = state.active;
  if (piece.type === "O") return;
  const next = rotateMatrix(rotateMatrix(piece.shape, 1), 1);
  const to = (piece.rotation + 2) % 4;
  const kicks = get180Kicks(piece.type);
  for (const [kickIndex, [dx, dy]] of kicks.entries()) {
    if (!collides(piece, piece.x + dx, piece.y + dy, next)) {
      piece.shape = next;
      piece.x += dx;
      piece.y += dy;
      piece.rotation = to;
      state.lastMoveWasRotate = true;
      state.lastRotationKind = "180";
      state.lastKickIndex = kickIndex;
      if (touchingGround()) resetLockDelay();
      playSfx(piece.type === "T" ? "rotateT" : "rotate");
      triggerSpinReadyCue(piece, kickIndex);
      return;
    }
  }
  playSfx("invalidRotate");
}

function triggerSpinReadyCue(piece, kickIndex = 0) {
  if (!piece || piece.type !== "T") return;
  if (kickIndex <= 0 && !touchingGround()) return;
  const now = performance.now();
  if (now - audio.lastSpinReadyAt < SPIN_READY_COOLDOWN_MS) return;
  audio.lastSpinReadyAt = now;
  playSfx("spinReady");
}

function touchingGround() {
  const piece = state.active;
  return piece && collides(piece, piece.x, piece.y + 1, piece.shape);
}

function hardDrop() {
  if (state.mode !== "playing" || !state.active) return;
  const wasRotate = state.lastMoveWasRotate;
  const rotationKind = state.lastRotationKind;
  const kickIndex = state.lastKickIndex;
  while (move(0, 1)) {}
  state.lastMoveWasRotate = wasRotate;
  state.lastRotationKind = rotationKind;
  state.lastKickIndex = kickIndex;
  playSfx("drop");
  lockPiece(true);
}

function holdPiece() {
  if (state.mode !== "playing" || !state.active) return;
  if (!state.canHold) {
    playSfx("holdUnavailable");
    return;
  }
  const current = state.active.type;
  if (!state.hold) {
    state.hold = current;
    spawnPiece();
    if (state.mode === "defeat") return;
  } else {
    const next = state.hold;
    state.hold = current;
    state.active = newPiece(next);
    if (isPieceSpawnBlocked(state.active)) {
      triggerDefeat("messageHoldBlocked", "holdPiece.spawnBlocked");
      return;
    }
  }
  state.canHold = false;
  state.lastMoveWasRotate = false;
  state.lastRotationKind = null;
  state.lastKickIndex = null;
  resetInputRepeat();
  state.dropTimer = 0;
  playSfx("hold");
  advanceTutorialStep("hold");
}

function resetInputRepeat() {
  state.input.horizontalDir = 0;
  state.input.das = 0;
  state.input.arr = 0;
}

function lockPiece(fromHardDrop = false) {
  const piece = state.active;
  if (!piece) return;
  const spinType = detectSpin(piece);
  const lockedAboveTopBuffer = isPieceAboveTopBuffer(piece);
  for (let r = 0; r < piece.shape.length; r += 1) {
    for (let c = 0; c < piece.shape[r].length; c += 1) {
      if (!piece.shape[r][c]) continue;
      const y = piece.y + r;
      const x = piece.x + c;
      if (y >= 0 && y < state.board.length && x >= 0 && x < COLS) state.board[y][x] = piece.type;
    }
  }
  if (lockedAboveTopBuffer) {
    triggerDefeat("messageLockAbove", "lockPiece.lockedAboveTopBuffer");
    return;
  }

  if (!fromHardDrop) playSfx("lock");
  const cleared = clearLines();
  recordRunClearStats(cleared, spinType);
  state.placed += 1;
  state.queueHex = Math.max(0, state.queueHex - 1);
  state.lastMoveWasRotate = false;
  state.lastRotationKind = null;
  state.lastKickIndex = null;
  state.active = null;
  applyBattle(cleared, piece.type, spinType);
  if (state.mode !== "playing") return;
  if (state.mode === "playing") spawnPiece();
}

function detectSpin(piece) {
  return detectSpinCore({
    board: state.board,
    piece,
    lastMoveWasRotate: state.lastMoveWasRotate,
    lastRotationKind: state.lastRotationKind,
    lastKickIndex: state.lastKickIndex,
    cols: COLS,
    rows: ROWS,
    hidden: HIDDEN,
  });
}

function isImmobileSpin(piece) {
  return isPieceImmobileCore({ board: state.board, piece, cols: COLS, rows: ROWS, hidden: HIDDEN });
}

function clearLines() {
  state.lastPerfectClear = false;
  const result = clearFullLines(state.board, {
    cols: COLS,
    rows: ROWS,
    hidden: HIDDEN,
    ignoredCell: ULTIMATE_WALL,
    emptyRowFactory: () => (state.ultimateActive ? makeUltimateRow(null) : Array(COLS).fill(null)),
  });
  if (result.cleared === 0) {
    state.combo = 0;
    return 0;
  }
  state.combo += 1;
  state.lineFlash = result.lines.map((y) => ({ y, life: 190 }));
  spawnLineParticles(result.lines);
  spawnClearBurst(result.cleared, state.combo);
  state.board = result.board;
  applyUltimateWalls();
  state.lastPerfectClear = isBoardEmpty();
  if (state.lastPerfectClear) state.perfectClears += 1;
  return result.cleared;
}

function recordRunClearStats(lines, spinType) {
  if (!state.runStats) state.runStats = makeRunStats();
  state.runStats.waveReached = Math.max(state.runStats.waveReached || 1, state.wave || 1);
  state.runStats.maxCombo = Math.max(state.runStats.maxCombo || 0, state.combo || 0);
  if (state.lastPerfectClear) state.runStats.perfectClearCount += 1;
  if (lines > 0 && spinType) state.runStats.spinCount += 1;
}

function isBoardEmpty() {
  return isBoardEmptyCore(state.board, { ignoredCell: ULTIMATE_WALL });
}

function spawnLineParticles(lines) {
  for (const line of lines) {
    const py = BOARD_Y + (line - HIDDEN) * TILE + TILE / 2;
    if (py < BOARD_Y) continue;
    const well = getUltimateWellRange();
    const colStart = state.ultimateActive ? well.start : 0;
    const colEnd = state.ultimateActive ? well.end : COLS;
    for (let x = colStart; x < colEnd; x += 1) {
      state.particles.push({
        x: BOARD_X + x * TILE + TILE / 2,
        y: py,
        vx: (Math.random() - 0.5) * 2.8,
        vy: -1.1 - Math.random() * 2.2,
        size: 1.6 + Math.random() * 2.4,
        color: Math.random() > 0.45 ? "#c8d2ff" : "#78e0cc",
        life: 320 + Math.random() * 180,
      });
    }
  }
}

function spawnClearBurst(lines, combo) {
  const intensity = Math.min(1.35, 0.42 + lines * 0.16 + combo * 0.035);
  const well = getUltimateWellRange();
  const centerX = state.ultimateActive
    ? BOARD_X + (well.start + well.width / 2) * TILE
    : BOARD_X + (COLS * TILE) / 2;
  state.bursts.push({
    x: centerX,
    y: BOARD_Y + ROWS * TILE - 122,
    radius: 22,
    color: lines >= 4 ? "#fff0a6" : combo >= 3 ? "#7ef7ff" : "#b9c2ff",
    life: 220 + lines * 42,
    duration: 220 + lines * 42,
    intensity,
  });
  const extra = Math.floor(4 * intensity);
  for (let i = 0; i < extra; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const speed = 1.6 + Math.random() * 3.2 * intensity;
    state.particles.push({
      x: centerX + (Math.random() - 0.5) * (state.ultimateActive ? 84 : 150),
      y: BOARD_Y + ROWS * TILE - 112 + (Math.random() - 0.5) * 48,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed - 1.4,
      size: 1.8 + Math.random() * 3,
      color: lines >= 4 ? "#fff0a6" : Math.random() > 0.5 ? "#7ef7ff" : "#c7a7ff",
      life: 340 + Math.random() * 190,
    });
  }
}

function damageEnemyFromUpgrade(amount, floaterKey, color, x = 920, y = 430) {
  const damage = Math.max(0, Math.floor(amount));
  if (damage <= 0 || state.enemyHp <= 0) return 0;
  const beforeEnemyHp = state.enemyHp;
  state.enemyHpDisplay = Math.max(state.enemyHpDisplay || beforeEnemyHp, beforeEnemyHp);
  state.enemyHpTrail = Math.max(state.enemyHpTrail || beforeEnemyHp, beforeEnemyHp);
  state.enemyHp = Math.max(0, state.enemyHp - damage);
  state.stats.damage += damage;
  state.enemyHit = Math.max(state.enemyHit, 220);
  state.enemyHitIntensity = Math.max(state.enemyHitIntensity, 1.08);
  showDamageNumber({
    amount: damage,
    position: GSAP_FEEDBACK_POSITIONS.damage,
  });
  state.floaters.push({
    x,
    y,
    text: fmt(floaterKey, { damage }),
    color,
    life: 1000,
  });
  state.bursts.push({ x: 994, y: 346, radius: 16, color, life: 420, duration: 420, intensity: 1.25 });
  if (state.enemyHp <= 0) startNextWave();
  return damage;
}

function grantGuardFromUpgrade(amount, floaterKey, color = "#9df7da", x = 86, y = 270) {
  const guard = Math.max(0, Math.floor(amount));
  if (guard <= 0) return 0;
  const before = state.guard;
  state.guard = Math.min(getEffectiveMaxGuard(), state.guard + guard);
  const gained = state.guard - before;
  if (gained <= 0) return 0;
  if (floaterKey) {
    state.floaters.push({
      x,
      y,
      text: fmt(floaterKey, { guard: gained }),
      color,
      life: 1050,
    });
  }
  return gained;
}

function getEffectiveMaxGuard() {
  return state.maxGuard + getTraitBonus("Defense", [4, 8, 14]) + getDefenseTraitBonus(getTraitSnapshot()).maxGuard;
}

function triggerEmergencyRiftShield(projectedHp = state.playerHp) {
  if (state.upgrades.emergencyRiftShield <= 0 || state.emergencyRiftShieldWave === state.wave) return 0;
  if (state.playerMaxHp <= 0 || projectedHp / state.playerMaxHp > 0.3) return 0;
  state.emergencyRiftShieldWave = state.wave;
  const gained = grantGuardFromUpgrade(14 * state.upgrades.emergencyRiftShield, "floaterEmergencyShield", "#9df7da", 86, 248);
  if (gained > 0) playSfx("shield");
  return gained;
}

function triggerLastStarProtocol(projectedHp = state.playerHp) {
  if (state.upgrades.lastStarProtocol <= 0 || state.lastStarProtocolWave === state.wave) return 0;
  if (state.playerMaxHp <= 0 || projectedHp / state.playerMaxHp > 0.3) return 0;
  state.lastStarProtocolWave = state.wave;
  state.lastStarProtocolReady = true;
  const gained = grantGuardFromUpgrade(8, "floaterLastStarGuard", "#ff8f98", 86, 282);
  state.floaters.push({
    x: BOARD_X + COLS * TILE + 36,
    y: BOARD_Y + 216,
    text: t("floaterLastStarReady"),
    color: "#ff8f98",
    life: 1250,
  });
  playSfx("upgradeReady");
  return gained;
}

function getHeroAnimationDuration(kind, comboAttackStyle = "") {
  return resolvePlayerAttackVfx(kind, comboAttackStyle).totalDurationMs;
}

function getHeroHitDelay(kind, comboAttackStyle = "") {
  return resolvePlayerAttackVfx(kind, comboAttackStyle).hitDelayMs;
}

function getEnemyAnimationDuration(kind) {
  const vfx = resolveEnemyAttackVfx(kind);
  return vfx?.bodyDurationMs || ENEMY_ATTACK_DURATION_MS;
}

function getEnemyHitDelay() {
  return ENEMY_HIT_DELAY_MS;
}

function schedulePendingHit(hit) {
  state.pendingHits.push({
    ...hit,
    id: `${hit.type}-${performance.now()}-${Math.random()}`,
    hitAt: performance.now() + hit.delay,
    triggered: false,
  });
}

function processPendingHits() {
  if (state.mode !== "playing") return;
  const now = performance.now();
  for (const hit of state.pendingHits) {
    if (hit.triggered || now < hit.hitAt) continue;
    hit.triggered = true;
    if (hit.type === "player") applyPlayerHit(hit);
    else if (hit.type === "enemy") applyEnemyHit(hit);
  }
  state.pendingHits = state.pendingHits.filter((hit) => !hit.triggered);
}

function recordDamageBreakdown(breakdown) {
  if (!breakdown) return;
  state.lastDamageBreakdown = breakdown;
  state.stats.bestHit = Math.max(state.stats.bestHit, breakdown.total || 0);
  for (const key of DAMAGE_SOURCE_KEYS) {
    state.stats.damageSources[key] += Math.max(0, breakdown.sources[key] || 0);
  }
}

function applyPlayerHit(hit) {
  if (state.mode === "defeat" || state.mode === "victory") return;
  const { damage, context } = hit;
  playSfx(hit.sfx);
  reinforceHitAudioLayer(hit);
  if (hit.weaknessHit) playSfx("weakness");
  if (hit.b2bHit) playSfx("b2b");
  if (hit.comboBurst) playSfx("combo");

  if (hit.heal > 0 || context.perfect) {
    const beforeHeal = state.playerHp;
    state.playerHp = context.perfect ? state.playerMaxHp : Math.min(state.playerMaxHp, state.playerHp + hit.heal);
    const healed = state.playerHp - beforeHeal;
    if (healed > 0 || context.perfect) {
      state.floaters.push({
        x: 86,
        y: 246,
        text: context.perfect ? t("floaterFullHp") : fmt("floaterWaveHeal", { amount: healed }),
        color: "#76d4ff",
        life: 900,
      });
    }
  }

  state.stats.damage += damage;
  state.stats.maxCombo = Math.max(state.stats.maxCombo, context.combo);
  if (context.spinType) state.stats.spins += 1;
  if (context.spinType === "all-mini") state.stats.allSpins += 1;
  recordDamageBreakdown(hit.breakdown);

  const beforeEnemyHp = state.enemyHp;
  state.enemyHpDisplay = Math.max(state.enemyHpDisplay || beforeEnemyHp, beforeEnemyHp);
  state.enemyHpTrail = Math.max(state.enemyHpTrail || beforeEnemyHp, beforeEnemyHp);
  state.enemyHp = Math.max(0, state.enemyHp - damage);
  checkBossPhaseTransition(beforeEnemyHp, state.enemyHp);
  const impact = getHitFeedbackIntensity(hit);
  state.enemyHit = Math.max(state.enemyHit, 230 + impact * 110);
  state.enemyHitIntensity = Math.max(state.enemyHitIntensity, impact);
  showDamageNumber({
    amount: damage,
    position: GSAP_FEEDBACK_POSITIONS.damage,
  });
  if (context.perfect) state.hitStopMs = Math.max(state.hitStopMs, PERFECT_HIT_STOP_MS);
  state.shake = Math.max(state.shake, hit.shake);
  state.floaters.push(...hit.floaters);
  if (hit.burst) state.bursts.push(hit.burst);

  if (state.enemyHp <= 0) {
    startNextWave();
    return;
  }
  finishPlayerTurnAfterHit(context);
}

function reinforceHitAudioLayer(hit) {
  if (!audio.ctx || audio.muted) return;
  const strongHit = hit.context?.perfect || hit.damage >= 80 || hit.weaknessHit || hit.b2bHit || hit.context?.spinType;
  const comboHeat = Math.max(0, hit.context?.combo || 0);
  if (hit.context?.perfect) {
    playSfx("hitArcane");
    return;
  }
  if (strongHit) {
    duckMusic(0.68, 0.24);
    playSfx("hitHeavy");
  } else {
    playSfx("hitLight");
  }
  if (comboHeat >= 3) {
    const t = audio.ctx.currentTime;
    const pitch = Math.min(1.8, 1 + comboHeat * 0.045);
    tone(520 * pitch, 0.045, "triangle", 0.055, audio.sfxGain, t + 0.015);
  }
}

function getHitFeedbackIntensity(hit) {
  const damageTier = Math.min(1.8, Math.max(0.35, hit.damage / 72));
  const specialTier =
    hit.context?.perfect ? 2.4 :
    hit.context?.spinType ? 1.65 :
    hit.b2bHit ? 1.35 :
    hit.comboBurst ? 1.22 :
    hit.context?.lines >= 4 ? 1.18 :
    0.82;
  return Math.min(2.6, Math.max(damageTier, specialTier));
}

function finishPlayerTurnAfterHit(context) {
  if (state.mode !== "playing") return;
  state.enemyCountdown -= 1;
  if (state.enemyCountdown === 1) triggerEnemyWarningCue();
  if (state.enemyCountdown <= 0) resolveEnemyAttack();
  if (context.lines === 0 && state.pendingGarbage > 0 && state.mode === "playing") {
    applyIncomingGarbage();
  }
}

function triggerEnemyWarningCue() {
  if (state.mode !== "playing" || isBattleCountdownActive()) return;
  const now = performance.now();
  const key = `${state.wave}:${state.defeated}:${state.enemyType?.id}:${state.placed}`;
  if (audio.lastEnemyWarningKey === key) return;
  if (now - audio.lastEnemyWarningAt < ENEMY_WARNING_COOLDOWN_MS) return;
  audio.lastEnemyWarningKey = key;
  audio.lastEnemyWarningAt = now;
  if (state.enemyType?.id === "king") startBossWindup(getBossPhase());
  triggerHeavyAttackWarning();
  if (!audio.ctx || audio.muted || audio.sfxVolume <= 0 || audio.masterVolume <= 0) return;
  playSfx(state.enemyType?.id === "king" || state.miniBoss ? "enemyWarnStrong" : "enemyWarn");
}

function triggerHeavyAttackWarning() {
  if (state.enemyCountdown > 1 || state.enemyAttackDamage < HEAVY_ATTACK_WARNING_DAMAGE) return;
  state.floaters.push({
    x: BOARD_X + COLS * TILE + 214,
    y: BOARD_Y + 278,
    text: t("heavyAttackIncoming"),
    color: "#ff8ca0",
    life: 1250,
  });
  state.bursts.push({
    x: BOARD_X + COLS * TILE + 232,
    y: BOARD_Y + 326,
    radius: 18,
    color: "#ff6f9f",
    life: 420,
    duration: 420,
    intensity: 1.1,
  });
}

function updateAudioCues(now = performance.now()) {
  if (!audio.ctx || audio.muted || audio.sfxVolume <= 0 || audio.masterVolume <= 0) return;
  if (state.mode !== "playing" || isBattleCountdownActive()) return;
  const hpRatio = state.playerMaxHp > 0 ? state.playerHp / state.playerMaxHp : 1;
  if (state.playerHp > 0 && hpRatio <= LOW_HP_WARNING_RATIO && now - audio.lastLowHpPulseAt >= LOW_HP_WARNING_COOLDOWN_MS) {
    audio.lastLowHpPulseAt = now;
    playSfx("lowHp");
  }
}

function applyEnemyHit(hit) {
  if (state.mode !== "playing") return;
  const { enemy, damageTaken } = hit;
  let garbageAdded = hit.garbageAdded;
  let blocked = Math.min(state.guard, damageTaken);
  let finalDamage = Math.max(0, damageTaken - blocked);
  const projectedHp = state.playerHp - finalDamage;
  if (state.playerMaxHp > 0 && projectedHp / state.playerMaxHp <= 0.3) {
    const gained = triggerEmergencyRiftShield(projectedHp) + triggerLastStarProtocol(projectedHp);
    if (gained > 0) {
      blocked = Math.min(state.guard, damageTaken);
      finalDamage = Math.max(0, damageTaken - blocked);
    }
  }
  const angelProtection = applyAngelHitProtection(finalDamage, garbageAdded);
  finalDamage = angelProtection.finalDamage;
  garbageAdded = angelProtection.garbageAdded;
  state.guard -= blocked;
  state.playerHp = Math.max(0, state.playerHp - finalDamage);
  state.pendingGarbage += garbageAdded;
  if (garbageAdded > 0) state.garbageGrace = getGarbageDelayForWave();
  applyEnemyBoardEffect(enemy);
  state.playerHit = HERO_HIT_DURATION_MS;
  state.shake = Math.max(state.shake, 9 + garbageAdded * 2);
  if (blocked > 0) playSfx(state.guard <= 0 && finalDamage > 0 ? "shieldBreak" : "shield");
  if (finalDamage > 0 || garbageAdded > 0) playSfx("enemy");
  state.floaters.push({
    x: 244,
    y: 216,
    text: blocked > 0 ? `${t("guardBlocked")} ${blocked} / -${finalDamage}` : `-${finalDamage}`,
    color: blocked > 0 ? "#9df7da" : "#ff7782",
    life: 900,
  });
  if (garbageAdded > 0) {
    state.floaters.push({
      x: 512,
      y: 642,
      text: fmt("floaterIncoming", { count: garbageAdded }),
      color: "#c9d4da",
      life: 1100,
    });
  }
  if (checkDefeatState("applyEnemyHit.playerHpDefeated")) return;
  let enemyDefeatedByReflect = false;
  if (blocked > 0 && state.upgrades.guardReflect > 0 && state.enemyHp > 0) {
    const reflectDamage = Math.floor(blocked * state.upgrades.guardReflect);
    if (reflectDamage > 0) {
      const beforeEnemyHp = state.enemyHp;
      state.enemyHpDisplay = Math.max(state.enemyHpDisplay || beforeEnemyHp, beforeEnemyHp);
      state.enemyHpTrail = Math.max(state.enemyHpTrail || beforeEnemyHp, beforeEnemyHp);
      state.enemyHp = Math.max(0, state.enemyHp - reflectDamage);
      state.stats.damage += reflectDamage;
      state.enemyHit = Math.max(state.enemyHit, 220);
      state.enemyHitIntensity = Math.max(state.enemyHitIntensity, 1.05);
      showDamageNumber({
        amount: reflectDamage,
        position: GSAP_FEEDBACK_POSITIONS.damage,
      });
      state.floaters.push({
        x: 920,
        y: 430,
        text: fmt("floaterGuardReflect", { damage: reflectDamage }),
        color: "#9df7da",
        life: 1000,
      });
      state.bursts.push({ x: 994, y: 346, radius: 16, color: "#9df7da", life: 420, duration: 420, intensity: 1.25 });
      if (state.enemyHp <= 0) {
        enemyDefeatedByReflect = true;
        startNextWave();
      }
    }
  }
  if (!enemyDefeatedByReflect && blocked > 0 && getTraitStage("Defense") >= 3 && state.enemyHp > 0 && state.mode === "playing") {
    const traitReflectDamage = Math.floor(blocked * 0.5) + getDefenseTraitBonus(getTraitSnapshot()).reflectDamage;
    if (traitReflectDamage > 0) {
      damageEnemyFromUpgrade(traitReflectDamage, "floaterGuardReflect", "#9df7da", 920, 444);
      enemyDefeatedByReflect = state.mode !== "playing" || state.enemyHp <= 0;
    }
  }
  if (!enemyDefeatedByReflect && blocked > 0 && finalDamage === 0 && state.upgrades.aegisStarMirror > 0 && state.enemyHp > 0 && state.mode === "playing") {
    const starDamage = Math.max(18, blocked + 12);
    damageEnemyFromUpgrade(starDamage, "floaterAegisStar", "#ff8f98", 920, 462);
    playSfx("tspin");
  }
}

function applyBattle(lines, pieceType, spinType) {
  if (recordAscensionClear(lines)) return;
  const result = calculateDamage(
    { lines, pieceType, spinType },
    createBattleSnapshot(),
  );
  if (applyDamageResult(result)) playDamageFeedback(result);
}

function createBattleSnapshot() {
  return {
    combo: state.combo,
    b2bActive: state.b2bActive,
    b2bChain: state.b2bChain,
    lastPerfectClear: state.lastPerfectClear,
    enemy: state.enemyType,
    miniBoss: state.miniBoss,
    upgrades: state.upgrades,
    traits: getTraitSnapshot(),
    rotationKind: state.lastRotationKind,
    pendingGarbage: state.pendingGarbage,
  };
}

function getTraitSnapshot() {
  return getTraitEntries().map(({ tag, count, stage, fullCount, isFull, overcap }) => ({ tag, count, stage, fullCount, isFull, overcap }));
}

function getSpecialBondCountsForRun() {
  return getSpecialBondCounts(state.acquiredRelics);
}

function getAngelBondTier() {
  return getSpecialBondTier("angel", getSpecialBondCountsForRun());
}

function getDevilBondTier() {
  return getSpecialBondTier("devil", getSpecialBondCountsForRun());
}

function showSpecialBondUpgradeCallout(preview) {
  if (!preview?.activates) return;
  showBondCallout({
    family: preview.family.key,
    text: fmt("bondHintUpgrade", {
      bond: t(preview.family.labelKey),
      before: preview.before,
      after: preview.after,
    }),
    detail: t("bondCalloutActivated"),
    durationMs: 1450,
  });
}

function showSpecialBondEffectCallout(family, text) {
  if (!text) return;
  showBondCallout({
    family,
    text,
    detail: t("bondCalloutEffect"),
    durationMs: 1250,
  });
}

function isPlayerLowHp() {
  return state.playerMaxHp > 0 && state.playerHp / state.playerMaxHp <= 0.4;
}

function getAngelWardCap() {
  return 3 + getAngelBondTier();
}

function getAngelWardBlockValue() {
  return 4 + getAngelBondTier();
}

function grantAngelWard(stacks) {
  if (stacks <= 0) return 0;
  const before = state.angelWard || 0;
  state.angelWard = Math.min(getAngelWardCap(), before + stacks);
  return state.angelWard - before;
}

function cleansePendingGarbage(amount) {
  if (amount <= 0 || state.pendingGarbage <= 0) return 0;
  const cleansed = Math.min(state.pendingGarbage, amount);
  state.pendingGarbage -= cleansed;
  if (state.pendingGarbage === 0) state.garbageGrace = 0;
  return cleansed;
}

function applyAngelClearRewards({ lines, spinType, highValueClear }) {
  if (lines <= 0) return;
  const angelTier = getAngelBondTier();
  if (angelTier <= 0) return;

  if (highValueClear) {
    const wardGain = (angelTier >= 1 ? 1 : 0) + (state.upgrades.angelHaloSanctuary > 0 ? 1 : 0);
    const gainedWard = grantAngelWard(wardGain);
    if (gainedWard > 0) {
      const text = fmt("floaterAngelWard", { count: state.angelWard });
      state.floaters.push({
        x: 86,
        y: 306,
        text,
        color: "#dff7ff",
        life: 1050,
      });
      showSpecialBondEffectCallout("angel", text);
    }
  }

  const cleansePower = highValueClear
    ? (state.upgrades.angelCleansingPrism > 0 ? 1 : 0) + (angelTier >= 2 ? 1 : 0)
    : 0;
  const cleansed = cleansePendingGarbage(cleansePower);
  if (cleansed > 0) {
    const guardGain = grantGuardFromUpgrade(cleansed * (2 + angelTier), null);
    const text = fmt("floaterAngelCleanse", { count: cleansed, guard: guardGain });
    state.floaters.push({
      x: BOARD_X + COLS * TILE + 34,
      y: BOARD_Y + 188,
      text,
      color: "#dff7ff",
      life: 1150,
    });
    showSpecialBondEffectCallout("angel", text);
    playSfx("cancel");
  }

  if (state.upgrades.angelPerfectBenediction > 0 && (spinType || state.lastPerfectClear)) {
    const before = state.angelBlessingCharges || 0;
    const maxCharges = angelTier >= 3 ? 3 : 2;
    const chargeGain = state.lastPerfectClear ? 2 : 1;
    state.angelBlessingCharges = Math.min(maxCharges, before + chargeGain);
    if (state.angelBlessingCharges > before) {
      const text = fmt("floaterAngelBenediction", { count: state.angelBlessingCharges });
      state.floaters.push({
        x: 86,
        y: 328,
        text,
        color: "#fff7d2",
        life: 1050,
      });
      showSpecialBondEffectCallout("angel", text);
    }
  }
}

function applyAngelHitProtection(finalDamage, incomingGarbage) {
  let reducedDamage = finalDamage;
  let reducedGarbage = incomingGarbage;
  let protectedAmount = 0;
  let cleansedGarbage = 0;
  const angelTier = getAngelBondTier();
  if (angelTier <= 0) return { finalDamage: reducedDamage, garbageAdded: reducedGarbage };

  if (state.angelBlessingCharges > 0 && (reducedDamage > 0 || reducedGarbage > 0)) {
    state.angelBlessingCharges -= 1;
    const blessingBlock = Math.min(reducedDamage, 5 + angelTier * 2);
    protectedAmount += blessingBlock;
    reducedDamage -= blessingBlock;
    if (reducedGarbage > 0) {
      const cleanse = Math.min(reducedGarbage, 1 + (angelTier >= 3 ? 1 : 0));
      reducedGarbage -= cleanse;
      cleansedGarbage += cleanse;
    }
  }

  const wardBlockValue = getAngelWardBlockValue();
  while (reducedDamage > 0 && state.angelWard > 0) {
    state.angelWard -= 1;
    const blocked = Math.min(reducedDamage, wardBlockValue);
    protectedAmount += blocked;
    reducedDamage -= blocked;
  }

  if (angelTier >= 3 && reducedDamage > 0 && state.angelMercyWave !== state.wave) {
    state.angelMercyWave = state.wave;
    const mercyBlock = Math.min(reducedDamage, 12);
    protectedAmount += mercyBlock;
    reducedDamage -= mercyBlock;
  }

  if (protectedAmount > 0 || cleansedGarbage > 0) {
    const text = fmt("floaterAngelProtect", { block: protectedAmount, garbage: cleansedGarbage });
    state.floaters.push({
      x: 244,
      y: 248,
      text,
      color: "#dff7ff",
      life: 1050,
    });
    showSpecialBondEffectCallout("angel", text);
    playSfx("shield");
  }

  return { finalDamage: reducedDamage, garbageAdded: reducedGarbage };
}

function getDevilSinThreshold() {
  const devilTier = getDevilBondTier();
  return Math.max(4, 6 - (devilTier >= 2 ? 1 : 0) - (devilTier >= 3 ? 1 : 0));
}

function payDevilHp(amount) {
  if (amount <= 0 || state.playerHp <= 1) return 0;
  const paid = Math.min(amount, state.playerHp - 1);
  state.playerHp -= paid;
  return paid;
}

function gainDevilSinMarks(amount) {
  if (amount <= 0) return { gained: 0, burstDamage: 0, threshold: getDevilSinThreshold() };
  const threshold = getDevilSinThreshold();
  const devilTier = getDevilBondTier();
  state.devilSinMarks = Math.max(0, (state.devilSinMarks || 0) + amount);
  if (state.devilSinMarks < threshold) return { gained: amount, burstDamage: 0, threshold };
  state.devilSinMarks -= threshold;
  const lowHpBonus = state.upgrades.devilFallenCrown > 0 && isPlayerLowHp() ? 16 : 0;
  return {
    gained: amount,
    burstDamage: 30 + devilTier * 8 + lowHpBonus,
    threshold,
  };
}

function applyDevilClearRewards({ lines, spinType, highValueClear, isDifficultClear, parts, sources }) {
  if (lines <= 0) return 0;
  const devilTier = getDevilBondTier();
  if (devilTier <= 0) return 0;

  let extraDamage = 0;
  let marks = 0;
  if ((spinType || lines >= 4) && devilTier >= 1) marks += 1;

  if (state.upgrades.devilBloodMoonPact > 0 && highValueClear) {
    const paid = payDevilHp(3);
    if (paid > 0) {
      const pactDamage = 8 + paid * 3 + (devilTier >= 3 && isPlayerLowHp() ? 6 : 0);
      extraDamage += pactDamage;
      marks += 2;
      addDamagePart(parts, sources, "damageDevilPact", pactDamage, "upgrade");
      const text = fmt("floaterDevilPact", { hp: paid, damage: pactDamage });
      state.floaters.push({
        x: BOARD_X + COLS * TILE + 36,
        y: BOARD_Y + 316,
        text,
        color: "#ff8fca",
        life: 1100,
      });
      showSpecialBondEffectCallout("devil", text);
    }
  }

  if (state.upgrades.devilAbyssChain > 0) {
    if (state.combo >= 3) marks += 1;
    if (state.combo >= 6) marks += 1;
    if (isDifficultClear && state.b2bActive) marks += 1;
  }
  if (devilTier >= 2 && state.combo >= 4) marks += 1;
  if (state.upgrades.devilFallenCrown > 0 && isPlayerLowHp() && (highValueClear || state.combo >= 3)) marks += 1;

  const sinResult = gainDevilSinMarks(marks);
  if (sinResult.gained > 0 && sinResult.burstDamage <= 0) {
    const text = fmt("floaterDevilSin", { count: state.devilSinMarks, max: sinResult.threshold });
    state.floaters.push({
      x: BOARD_X + COLS * TILE + 36,
      y: BOARD_Y + 292,
      text,
      color: "#ff8fca",
      life: 950,
    });
    showSpecialBondEffectCallout("devil", text);
  }
  if (sinResult.burstDamage > 0) {
    extraDamage += sinResult.burstDamage;
    addDamagePart(parts, sources, "damageDevilSinBurst", sinResult.burstDamage, "upgrade");
    const text = fmt("floaterDevilSinBurst", { damage: sinResult.burstDamage });
    state.floaters.push({
      x: BOARD_X + COLS * TILE + 36,
      y: BOARD_Y + 292,
      text,
      color: "#ff6f9f",
      life: 1250,
    });
    showSpecialBondEffectCallout("devil", text);
    state.bursts.push({ x: BOARD_X + COLS * TILE + 210, y: BOARD_Y + 278, radius: 20, color: "#ff4d9a", life: 500, duration: 500, intensity: 1.55 });
    playSfx("tspin");
  }
  return extraDamage;
}

function calculateDamage(context, snapshot) {
  const { lines, pieceType, spinType } = context;
  const traits = snapshot.traits || getTraitSnapshot();
  const enemy = snapshot.enemy || state.enemyType;
  const bossLikeEnemy = isBossLikeEnemy(enemy, { miniBoss: snapshot.miniBoss ?? state.miniBoss });
  const basePreview = calculateBaseDamage(context, {
    combo: snapshot.combo,
    b2bActive: snapshot.b2bActive,
    perfect: snapshot.lastPerfectClear,
    enemy: snapshot.enemy,
    upgrades: snapshot.upgrades,
    balance: BALANCE,
  });
  const isTSpin = spinType === "full";
  const isTSpinMini = spinType === "mini";
  const isAllSpinMini = spinType === "all-mini";
  const isDifficultClear = lines === 4 || (spinType && lines > 0);
  const rotationBonus = getRotationDamageBonus(lines, pieceType, spinType, state.lastRotationKind);
  const weaknessBonus = getWeaknessBonus(lines, spinType);
  const comboAttackRows = getComboAttackRows(state.combo);
  const comboMilestoneBonus = getComboMilestoneDamage(state.combo);
  const b2bAttackRows = isDifficultClear && state.b2bActive ? 1 : 0;
  const highValueClear = isTraitHighValueClear({ lines, spinType, b2bActive: state.b2bActive, perfect: state.lastPerfectClear });
  const effectiveLines = getEffectiveClearLines(lines, spinType);
  const b2bBonus = b2bAttackRows * ATTACK_ROW_DAMAGE + (b2bAttackRows > 0 ? state.upgrades.b2bBonus : 0);
  const comboBonus = comboAttackRows * ATTACK_ROW_DAMAGE;
  const parts = [];
  const sources = makeDamageSourceMap();
  let damage = spinType && lines > 0 ? (SPIN_DAMAGE_BY_LINES[lines] || 0) : (LINE_DAMAGE[lines] || 0);
  addDamagePart(parts, sources, "damageBase", damage, spinType ? "spin" : "base");
  if (lines > 0) addDamagePart(parts, sources, "damageLineBonus", state.upgrades.lineDamage, "upgrade");
  damage += lines > 0 ? state.upgrades.lineDamage : 0;
  if (lines > 0 && pieceType === "T" && !spinType) {
    damage += 10;
    addDamagePart(parts, sources, "damageTBonus", 10, "spin");
  }
  if (lines > 0 && (isTSpin || isTSpinMini)) {
    damage += state.upgrades.tspinBonus;
    addDamagePart(parts, sources, "damageTBonus", state.upgrades.tspinBonus, "upgrade");
  }
  if (lines > 0 && spinType) {
    damage += state.upgrades.spinBonus;
    addDamagePart(parts, sources, "damageSpinBonus", state.upgrades.spinBonus, "upgrade");
    const spinTrait = getSpinTraitBonus(traits);
    const traitSpinDamage = getTraitBonus("Spin", [6, 12, 20]) + spinTrait.damage;
    if (traitSpinDamage > 0) {
      damage += traitSpinDamage;
      addDamagePart(parts, sources, "damageSpinBonus", traitSpinDamage, "upgrade");
    }
    if (state.upgrades.spinStarter > 0) {
      if (state.spinStarterWave !== state.wave) {
        state.spinStarterWave = state.wave;
        state.spinStarterUses = 0;
      }
      if (state.spinStarterUses < 2) {
        state.spinStarterUses += 1;
        const starterDamage = 12 * state.upgrades.spinStarter;
        const starterGuard = grantGuardFromUpgrade(4 * state.upgrades.spinStarter, null);
        damage += starterDamage;
        addDamagePart(parts, sources, "damageSpinStarter", starterDamage, "upgrade");
        state.floaters.push({
          x: BOARD_X + COLS * TILE + 34,
          y: BOARD_Y + 176,
          text: fmt("floaterSpinStarter", { damage: starterDamage, guard: starterGuard }),
          color: "#d7c2ff",
          life: 1050,
        });
      }
    }
    const guardSpent = state.upgrades.spinGuardStrike > 0 ? Math.min(state.guard, 24) : 0;
    const guardStrikeDamage = Math.floor(guardSpent * state.upgrades.spinGuardStrike);
    if (guardStrikeDamage > 0) {
      state.guard -= guardSpent;
      damage += guardStrikeDamage;
      addDamagePart(parts, sources, "damageGuardStrike", guardStrikeDamage, "upgrade");
      state.floaters.push({
        x: 86,
        y: 270,
        text: fmt("floaterSpinGuardStrike", { damage: guardStrikeDamage }),
        color: "#d7c2ff",
        life: 1050,
      });
    }
    if (state.upgrades.singularitySpinCore > 0) {
      state.spinSingularityStacks = Math.min(3, (state.spinSingularityStacks || 0) + 1);
      if (state.spinSingularityStacks >= 3) {
        const singularityDamage = 80;
        state.spinSingularityStacks = 0;
        damage += singularityDamage;
        addDamagePart(parts, sources, "damageSingularity", singularityDamage, "upgrade");
        state.floaters.push({
          x: 88,
          y: 304,
          text: fmt("floaterSingularityBurst", { damage: singularityDamage }),
          color: "#ff8f98",
          life: 1200,
        });
        state.bursts.push({ x: BOARD_X + COLS * TILE + 210, y: BOARD_Y + 278, radius: 18, color: "#ff6f7c", life: 460, duration: 460, intensity: 1.4 });
      } else {
        state.floaters.push({
          x: 88,
          y: 304,
          text: fmt("floaterSingularityCharge", { count: state.spinSingularityStacks }),
          color: "#d7c2ff",
          life: 850,
        });
      }
    }
  }
  if (lines > 0 && isAllSpinMini) {
    damage += state.upgrades.allSpinBonus;
    addDamagePart(parts, sources, "damageAllSpinBonus", state.upgrades.allSpinBonus, "upgrade");
  }
  if (lines > 0) {
    damage += comboBonus;
    addDamagePart(parts, sources, "damageCombo", comboBonus, "combo");
    damage += comboMilestoneBonus;
    addDamagePart(parts, sources, "damageComboBurst", comboMilestoneBonus, "combo");
  }
  const comboUpgradeBonus = lines > 0 && state.combo >= 2 ? state.combo * state.upgrades.comboDamage : 0;
  damage += comboUpgradeBonus;
  addDamagePart(parts, sources, "damageCombo", comboUpgradeBonus, "upgrade");
  const comboTrait = getComboTraitBonus(traits);
  const comboTraitBonus = lines > 0 && state.combo >= 2 ? state.combo * (getTraitBonus("Combo", [2, 4, 7]) + comboTrait.damagePerCombo) : 0;
  damage += comboTraitBonus;
  addDamagePart(parts, sources, "damageCombo", comboTraitBonus, "upgrade");
  const comboEchoBonus = lines > 0 && state.combo >= 4 && state.upgrades.comboEchoDamage > 0
    ? Math.min(45, state.combo * state.upgrades.comboEchoDamage)
    : 0;
  damage += comboEchoBonus;
  addDamagePart(parts, sources, "damageComboEcho", comboEchoBonus, "upgrade");
  const b2bCompassBonus = lines > 0 && isDifficultClear && state.upgrades.b2bCompass > 0
    ? Math.min(32, Math.max(1, state.b2bChain + 1) * state.upgrades.b2bCompass)
    : 0;
  if (b2bCompassBonus > 0) {
    damage += b2bCompassBonus;
    addDamagePart(parts, sources, "damageB2BCompass", b2bCompassBonus, "upgrade");
    state.floaters.push({
      x: BOARD_X + COLS * TILE + 36,
      y: BOARD_Y + 206,
      text: fmt("floaterB2BCompass", { damage: b2bCompassBonus }),
      color: "#fff0a6",
      life: 1000,
    });
  }
  const b2bTrait = getB2BTraitBonus(traits);
  const b2bTraitBonus = b2bAttackRows > 0 ? getTraitBonus("B2B", [6, 12, 20]) + b2bTrait.damage : 0;
  damage += b2bTraitBonus;
  addDamagePart(parts, sources, "damageB2B", b2bTraitBonus, "b2b");
  if (b2bAttackRows > 0 && b2bTrait.guard > 0) {
    const gained = grantGuardFromUpgrade(b2bTrait.guard, null);
    if (gained > 0) {
      state.floaters.push({
        x: 86,
        y: 288,
        text: fmt("floaterGuard", { amount: gained }),
        color: "#ffdf8a",
        life: 900,
      });
    }
  }
  const burstTrait = getBurstTraitBonus(traits);
  const burstTraitBonus = highValueClear ? getTraitBonus("Burst", [8, 16, 28]) + burstTrait.damage : 0;
  damage += burstTraitBonus;
  addDamagePart(parts, sources, "damageLineBonus", burstTraitBonus, "upgrade");
  const bossKillerTrait = getBossKillerTraitBonus(traits);
  const bossTraitBonus = bossLikeEnemy && highValueClear ? getTraitBonus("Boss Killer", [18, 40]) + bossKillerTrait.damage : 0;
  const bossBonus = lines > 0 && isBossEnemy(enemy) && (spinType || state.b2bActive) ? state.upgrades.bossDamage : 0;
  damage += bossBonus;
  addDamagePart(parts, sources, "damageBoss", bossBonus, "upgrade");
  damage += bossTraitBonus;
  addDamagePart(parts, sources, "damageBoss", bossTraitBonus, "upgrade");
  if (state.lastPerfectClear) {
    damage += PERFECT_CLEAR_BASE_DAMAGE;
    addDamagePart(parts, sources, "damagePerfect", PERFECT_CLEAR_BASE_DAMAGE, "perfect");
  }
  damage += b2bBonus;
  addDamagePart(parts, sources, "damageB2B", b2bBonus, "b2b");
  if (lines > 0 && !state.lastPerfectClear && state.perfectEchoCharges > 0) {
    state.perfectEchoCharges -= 1;
    const echoDamage = 45;
    damage += echoDamage;
    addDamagePart(parts, sources, "damagePerfectEcho", echoDamage, "upgrade");
    state.floaters.push({
      x: BOARD_X + COLS * TILE + 34,
      y: BOARD_Y + 236,
      text: fmt("floaterPerfectEcho", { damage: echoDamage }),
      color: "#fff0a6",
      life: 1100,
    });
  }
  if (lines > 0 && state.lastStarProtocolReady) {
    state.lastStarProtocolReady = false;
    const lastStarDamage = Math.max(12, Math.floor(damage * 0.35));
    damage += lastStarDamage;
    addDamagePart(parts, sources, "damageLastStar", lastStarDamage, "upgrade");
    state.floaters.push({
      x: BOARD_X + COLS * TILE + 36,
      y: BOARD_Y + 262,
      text: fmt("floaterLastStar", { damage: lastStarDamage }),
      color: "#ff8f98",
      life: 1150,
    });
  }
  if (lines > 0 && state.enemyType.id === "king" && state.upgrades.riftOverdrive > 0 && (lines >= 4 || spinType || state.lastPerfectClear)) {
    state.riftOverdriveCharge = Math.min(3, state.riftOverdriveCharge + 1);
    if (state.riftOverdriveCharge >= 3) {
      state.riftOverdriveCharge = 0;
      const overdriveDamage = 110;
      damage += overdriveDamage;
      addDamagePart(parts, sources, "damageRiftOverdrive", overdriveDamage, "upgrade");
      state.floaters.push({
        x: BOARD_X + COLS * TILE + 36,
        y: BOARD_Y + 292,
        text: fmt("floaterRiftOverdrive", { damage: overdriveDamage }),
        color: "#ff8f98",
        life: 1250,
      });
      state.bursts.push({ x: BOARD_X + COLS * TILE + 210, y: BOARD_Y + 278, radius: 20, color: "#ff6f7c", life: 520, duration: 520, intensity: 1.5 });
    } else {
      state.floaters.push({
        x: BOARD_X + COLS * TILE + 36,
        y: BOARD_Y + 292,
        text: fmt("floaterRiftOverdriveCharge", { count: state.riftOverdriveCharge }),
        color: "#ff8f98",
        life: 950,
      });
    }
  }
  const devilDamage = applyDevilClearRewards({ lines, spinType, highValueClear, isDifficultClear, parts, sources });
  damage += devilDamage;

  const multipliers = [];
  if (lines === 1 && state.enemyType.armorSingle && !state.lastPerfectClear) {
    damage = Math.floor(damage * state.enemyType.armorSingle);
    multipliers.push({ key: "floaterArmored", value: `x${state.enemyType.armorSingle}` });
  }
  if (damage > 0 && rotationBonus.multiplier > 1) {
    const before = damage;
    damage = Math.floor(damage * rotationBonus.multiplier);
    multipliers.push({ label: rotationBonus.label, value: `x${rotationBonus.multiplier.toFixed(2)}` });
    sources.spin += damage - before;
  }
  if (damage > 0 && weaknessBonus.multiplier > 1) {
    const before = damage;
    damage = Math.floor(damage * weaknessBonus.multiplier);
    multipliers.push({ key: "damageWeakness", value: "x1.35" });
    sources.weakness += damage - before;
  }
  if (damage > 0 && state.upgrades.damageMultiplier > 0) {
    const before = damage;
    const multiplier = 1 + state.upgrades.damageMultiplier;
    damage = Math.floor(damage * multiplier);
    multipliers.push({ key: "damageMultiplier", value: `x${multiplier.toFixed(2)}` });
    sources.upgrade += damage - before;
  }
  const metaAttackMultiplier = getMetaBonuses(state.metaProgress).attackMultiplier;
  if (damage > 0 && metaAttackMultiplier > 1) {
    const before = damage;
    damage = Math.floor(damage * metaAttackMultiplier);
    multipliers.push({ key: "damageMetaAttack", value: `x${metaAttackMultiplier.toFixed(2)}` });
    sources.upgrade += damage - before;
  }
  if (state.lastPerfectClear) {
    const before = damage;
    const perfectTrait = getPerfectClearTraitBonus(traits);
    if (bossLikeEnemy) {
      damage = Math.max(damage, Math.ceil(state.enemyMaxHp * perfectTrait.bossMaxHpRatio));
      const perfectBossDeltaRaw = Math.max(0, damage - before);
      let perfectCrownDelta = 0;
      if (state.upgrades.perfectRiftCrown > 0) {
        const crownBefore = damage;
        damage = Math.max(damage, Math.ceil(state.enemyMaxHp * PERFECT_CROWN_BOSS_HP_RATIO));
        perfectCrownDelta = Math.max(0, damage - crownBefore);
      }
      const bossKillerRatioBefore = damage;
      const bossKillerRatioDamage = bossKillerTrait.maxHpRatio > 0 ? Math.ceil(state.enemyMaxHp * bossKillerTrait.maxHpRatio) : 0;
      damage += bossKillerRatioDamage;
      const bossKillerRatioDelta = Math.max(0, damage - bossKillerRatioBefore);
      damage = Math.min(damage, state.enemyHp);
      const cappedDelta = Math.max(0, damage - before);
      let remainingDelta = cappedDelta;
      const perfectBossDelta = Math.min(perfectBossDeltaRaw, remainingDelta);
      remainingDelta -= perfectBossDelta;
      perfectCrownDelta = Math.min(perfectCrownDelta, remainingDelta);
      remainingDelta -= perfectCrownDelta;
      const bossKillerRatioPart = Math.min(bossKillerRatioDelta, remainingDelta);
      if (perfectBossDelta > 0) addDamagePart(parts, sources, "damagePerfectBoss", perfectBossDelta, "perfect");
      if (perfectCrownDelta > 0) {
        addDamagePart(parts, sources, "damagePerfectCrown", perfectCrownDelta, "upgrade");
        state.floaters.push({
          x: BOARD_X + COLS * TILE + 36,
          y: BOARD_Y + 228,
          text: fmt("floaterPerfectCrown", { damage: perfectCrownDelta }),
          color: "#ff8f98",
          life: 1300,
        });
      }
      if (bossKillerRatioPart > 0) addDamagePart(parts, sources, "damageBoss", bossKillerRatioPart, "upgrade");
    } else if (perfectTrait.executesNormalEnemy) {
      damage = Math.max(damage, state.enemyHp);
      if (damage > before) {
        addDamagePart(parts, sources, "damageExecute", damage - before, "perfect");
      }
    }
    if (perfectTrait.guard > 0) {
      const gained = grantGuardFromUpgrade(perfectTrait.guard, null);
      if (gained > 0) {
        state.floaters.push({
          x: 86,
          y: 262,
          text: fmt("floaterPerfectGuard", { guard: gained }),
          color: "#fff0a6",
          life: 1100,
        });
      }
    }
    startPerfectClearFx(damage);
    if (state.upgrades.perfectEcho > 0) {
      state.perfectEchoCharges = Math.min(2, state.perfectEchoCharges + state.upgrades.perfectEcho);
      state.floaters.push({
        x: BOARD_X + COLS * TILE + 34,
        y: BOARD_Y + 254,
        text: t("floaterPerfectEchoReady"),
        color: "#fff0a6",
        life: 1150,
      });
    }
    extendUltimateOnPerfectClear();
  } else if (bossLikeEnemy && highValueClear && bossKillerTrait.maxHpRatio > 0) {
    const bossKillerRatioDamage = Math.ceil(state.enemyMaxHp * bossKillerTrait.maxHpRatio);
    damage += bossKillerRatioDamage;
    addDamagePart(parts, sources, "damageBoss", bossKillerRatioDamage, "upgrade");
  }
  extendUltimateOnCombo(lines);

  const canceled = cancelIncomingGarbage(lines);
  applyAngelClearRewards({ lines, spinType, highValueClear });
  const garbageCounterBonus = canceled > 0 && state.upgrades.garbageCounterDamage > 0
    ? canceled * state.upgrades.garbageCounterDamage
    : 0;
  if (garbageCounterBonus > 0) {
    damage += garbageCounterBonus;
    addDamagePart(parts, sources, "damageGarbageCounter", garbageCounterBonus, "upgrade");
  }
  const garbageTransmuterDamage = canceled > 0 && state.upgrades.garbageTransmuter > 0
    ? canceled * 12 * state.upgrades.garbageTransmuter + (canceled >= 3 ? 24 : 0)
    : 0;
  const garbageTrait = getGarbageTraitBonus(traits);
  const garbageTraitPerRow = getTraitBonus("Garbage", [5, 10, 16]) + garbageTrait.counterDamagePerRow;
  const garbageTraitDamage = canceled > 0 ? canceled * garbageTraitPerRow : 0;
  if (garbageTraitDamage > 0) {
    damage += garbageTraitDamage;
    addDamagePart(parts, sources, "damageGarbageCounter", garbageTraitDamage, "upgrade");
  }
  if (canceled >= 3 && garbageTraitPerRow >= 10) {
    const traitGuard = garbageTraitPerRow >= 16 ? 6 : 3;
    const gained = grantGuardFromUpgrade(traitGuard, null);
    if (gained > 0) {
      state.floaters.push({
        x: 86,
        y: 232,
        text: fmt("floaterGarbageAlchemyGuard", { guard: gained }),
        color: "#79e2a7",
        life: 1000,
      });
    }
  }
  if (garbageTransmuterDamage > 0) {
    damage += garbageTransmuterDamage;
    addDamagePart(parts, sources, "damageGarbageTransmuter", garbageTransmuterDamage, "upgrade");
    state.floaters.push({
      x: BOARD_X + COLS * TILE + 34,
      y: BOARD_Y + 172,
      text: fmt("floaterGarbageTransmuter", { damage: garbageTransmuterDamage }),
      color: "#79e2a7",
      life: 1050,
    });
  }
  const garbageAlchemyDamage = canceled > 0 && state.upgrades.garbageAlchemyCore > 0
    ? canceled * 18 + (canceled >= 3 ? 12 : 0)
    : 0;
  if (garbageAlchemyDamage > 0) {
    damage += garbageAlchemyDamage;
    addDamagePart(parts, sources, "damageGarbageAlchemy", garbageAlchemyDamage, "upgrade");
    state.floaters.push({
      x: BOARD_X + COLS * TILE + 34,
      y: BOARD_Y + 184,
      text: fmt("floaterGarbageAlchemy", { damage: garbageAlchemyDamage }),
      color: "#ff8f98",
      life: 1150,
    });
    if (canceled >= 3) {
      const guardGain = Math.min(8, canceled * 2);
      state.guard = Math.min(getEffectiveMaxGuard(), state.guard + guardGain);
      state.floaters.push({
        x: 86,
        y: 248,
        text: fmt("floaterGarbageAlchemyGuard", { guard: guardGain }),
        color: "#9df7da",
        life: 1050,
      });
    }
  }
  if (state.lastPerfectClear && state.enemyType.id === "king" && state.upgrades.perfectBossDelay > 0 && damage < state.enemyHp) {
    state.enemyCountdown += state.upgrades.perfectBossDelay;
    state.floaters.push({
      x: BOARD_X + COLS * TILE + 34,
      y: BOARD_Y + 194,
      text: fmt("floaterPerfectBossDelay", { turns: state.upgrades.perfectBossDelay }),
      color: "#fff0a6",
      life: 1200,
    });
  }
  if (state.lastPerfectClear) {
    const perfectTraitDelay = getPerfectClearTraitBonus(traits).delay;
    if (perfectTraitDelay > 0 && damage < state.enemyHp) {
      state.enemyCountdown += perfectTraitDelay;
      state.floaters.push({
        x: BOARD_X + COLS * TILE + 34,
        y: BOARD_Y + 218,
        text: fmt("floaterPerfectBossDelay", { turns: perfectTraitDelay }),
        color: "#fff0a6",
        life: 1100,
      });
    }
  }
  const comboDelay = lines > 0 && state.combo >= 3
    ? Math.min(5, 1 + Math.floor((state.combo - 1) / 2) + state.upgrades.comboDelay)
    : 0;
  if (comboDelay > 0) {
    state.enemyCountdown += comboDelay;
    state.floaters.push({
      x: BOARD_X + COLS * TILE + 36,
      y: BOARD_Y + 120,
      text: fmt("floaterComboDelay", { combo: state.combo, delay: comboDelay }),
      color: "#7ef7ff",
      life: 1150,
    });
  }
  const comboTraitDelay = lines > 0 && state.combo >= 4
    ? Math.min(comboTrait.traitDelayCap, getTraitBonus("Combo", [0, 1, 1]) + comboTrait.delay)
    : 0;
  if (comboTraitDelay > 0) {
    state.enemyCountdown += comboTraitDelay;
    state.floaters.push({
      x: BOARD_X + COLS * TILE + 36,
      y: BOARD_Y + 144,
      text: fmt("floaterComboDelay", { combo: state.combo, delay: comboTraitDelay }),
      color: "#7ef7ff",
      life: 1050,
    });
  }
  if (lines > 0 && state.upgrades.comboSafetyNet > 0 && state.combo >= 4 && state.comboSafetyNetWave !== state.wave) {
    state.comboSafetyNetWave = state.wave;
    const guardGain = grantGuardFromUpgrade(7 * state.upgrades.comboSafetyNet, null);
    state.enemyCountdown += 1;
    state.floaters.push({
      x: BOARD_X + COLS * TILE + 36,
      y: BOARD_Y + 174,
      text: fmt("floaterComboSafety", { guard: guardGain, turns: 1 }),
      color: "#7ef7ff",
      life: 1200,
    });
    playSfx("shield");
  }
  if (lines > 0 && state.upgrades.comboConstellation > 0 && state.combo >= 4) {
    if (state.comboConstellationWave !== state.wave) {
      state.comboConstellationWave = state.wave;
      state.comboConstellationFirstUsed = false;
      state.comboConstellationSecondUsed = false;
    }
    let constellationDelay = 0;
    if (!state.comboConstellationFirstUsed) {
      state.comboConstellationFirstUsed = true;
      constellationDelay += 1;
    }
    if (state.combo >= 8 && !state.comboConstellationSecondUsed) {
      state.comboConstellationSecondUsed = true;
      constellationDelay += 1;
    }
    if (constellationDelay > 0) {
      state.enemyCountdown += constellationDelay;
      state.floaters.push({
        x: BOARD_X + COLS * TILE + 36,
        y: BOARD_Y + 148,
        text: fmt("floaterComboConstellation", { turns: constellationDelay }),
        color: "#7ef7ff",
        life: 1200,
      });
      playSfx("combo");
    }
  }
  if (canceled > 0) {
    state.floaters.push({
      x: BOARD_X + COLS * TILE + 34,
      y: BOARD_Y + 156,
      text: fmt("floaterCancelGarbage", { count: canceled }),
      color: "#9df7da",
      life: 1050,
    });
    playSfx("cancel");
  }
  gainGuardFromClear(lines, spinType);

  addUpgradeProgress(effectiveLines);
  addUltimateCharge(lines, spinType);
  updateBackToBack(lines, isDifficultClear);
  updateChallengeProgress(lines, spinType, canceled);
  recordTutorialBattleEvents(lines, spinType, canceled);

  const breakdown = {
    title: getOperationTitle(lines, pieceType, spinType, state.lastPerfectClear),
    total: damage,
    parts,
    multipliers,
    sources,
    combo: state.combo,
    b2b: b2bAttackRows > 0,
    weakness: weaknessBonus.multiplier > 1,
    effectiveLines,
  };

  let heal = [0, 2, 4, 6, 10][lines] || 0;
  if (isTSpin) heal += lines >= 2 ? 10 : 6;
  if (isTSpinMini) heal += 4;
  if (isAllSpinMini) heal += 3;
  if (lines > 0) heal += state.upgrades.clearHeal;
  if (spinType) heal += state.upgrades.spinHeal;
  if (state.lastPerfectClear) heal = state.playerMaxHp;

  const hitContext = {
    lines,
    combo: state.combo,
    spinType,
    perfect: state.lastPerfectClear,
  };
  const comboAttackStyle = getComboAttackStyle(state.combo);
  const attackStyle = getHeroAttackStyle(lines, spinType, state.lastPerfectClear, b2bBonus, comboAttackStyle);
  const attackDuration = getHeroAnimationDuration(attackStyle, comboAttackStyle);
  const special = state.lastPerfectClear ? "perfect" : comboAttackStyle ? "combo" : spinType ? "spin" : b2bBonus > 0 ? "b2b" : lines >= 4 ? "tetris" : "clear";
  if (damage <= 0) {
    return {
      lines,
      pieceType,
      spinType,
      damage,
      heal,
      context: hitContext,
      breakdown,
      effectiveLines,
      b2bHit: b2bAttackRows > 0,
      comboBurst: comboMilestoneBonus > 0 || state.combo >= 3,
      rotationBonus,
      weaknessBonus,
      comboAttackStyle,
      attackStyle,
      attackDuration,
      special,
      basePreview,
    };
  }

  const floaters = [
    { x: 930, y: 246, text: `-${damage}`, color: pieceType === "T" && lines > 0 ? "#c7a7ff" : "#f8f3cf", life: 900 },
  ];
  if (rotationBonus.label) floaters.push({ x: 930, y: 398, text: rotationBonus.label, color: rotationBonus.color, life: 980 });
  if (weaknessBonus.label) floaters.push({ x: 904, y: 438, text: weaknessBonus.label, color: "#ffdf8a", life: 1100 });
  if (state.lastPerfectClear) {
    floaters.push({ x: 930, y: 476, text: t("floaterFullRecovery"), color: "#8ff7ff", life: 1250 });
  }

  return {
    lines,
    pieceType,
    spinType,
    damage,
    heal,
    context: hitContext,
    breakdown,
    effectiveLines,
    b2bHit: b2bAttackRows > 0,
    comboBurst: comboMilestoneBonus > 0 || state.combo >= 3,
    rotationBonus,
    weaknessBonus,
    comboAttackStyle,
    attackStyle,
    attackDuration,
    special,
    floaters,
    isTSpin,
    basePreview,
  };
}

function applyDamageResult(result) {
  if (result.damage > 0) state.lastDamageBreakdown = result.breakdown;
  pushOperationReadout(result.lines, result.pieceType, result.spinType, {
    combo: result.context.combo,
    b2b: result.b2bHit,
    effectiveLines: result.effectiveLines,
    perfect: result.context.perfect,
    damage: result.damage,
    breakdown: result.breakdown,
  });
  showBattleClearFeedback(result);
  if (result.damage <= 0) {
    finishPlayerTurnAfterHit(result.context);
    return false;
  }
  return true;
}

function showBattleClearFeedback(result) {
  if (!result || result.lines <= 0) return;
  const comboCount = result.context?.combo || 0;
  if (comboCount >= 2) {
    showComboFeedback({
      combo: comboCount,
      label: fmt("floaterCombo", { combo: comboCount }),
      subtitle: result.damage > 0 ? `${result.damage} ${t("dmgShort")}` : "",
      position: GSAP_FEEDBACK_POSITIONS.combo,
    });
  }

  const isDifficultClear = result.lines === 4 || Boolean(result.spinType);
  if (isDifficultClear && state.b2bActive) {
    showB2BFeedback({
      chain: state.b2bChain,
      label: state.b2bChain > 1 ? fmt("b2bChain", { count: state.b2bChain }) : t("b2bReady"),
      subtitle: result.damage > 0 ? `${result.damage} ${t("dmgShort")}` : "",
      position: GSAP_FEEDBACK_POSITIONS.b2b,
    });
  }

  const isTSpin = result.pieceType === "T" && (result.spinType === "full" || result.spinType === "mini");
  if (isTSpin) {
    showTSpinFeedback({
      spinType: result.spinType,
      label: result.spinType === "mini" ? t("hitTSpinMini") : t("hitTSpin"),
      subtitle: result.damage > 0 ? `${result.damage} ${t("dmgShort")}` : "",
      position: GSAP_FEEDBACK_POSITIONS.tspin,
    });
  }

  if (result.context?.perfect) {
    showPerfectClearFeedback({
      label: t("perfectClearTitle"),
      subtitle: result.damage > 0 ? `${result.damage} ${t("dmgShort")}` : "",
      position: GSAP_FEEDBACK_POSITIONS.perfect,
    });
  }
}

function playDamageFeedback(result) {
  const vfx = resolvePlayerAttackVfx(result.attackStyle, result.comboAttackStyle);
  startHeroAttackAnimation(result.attackStyle, result.comboAttackStyle);
  playSfx(getPlayerAttackSfx(result));
  state.attacks.push({
    type: "player",
    x0: 244,
    y0: 358,
    x1: 994,
    y1: 346,
    life: vfx.totalDurationMs,
    duration: vfx.totalDurationMs,
    damage: result.damage,
    spin: result.isTSpin,
    heroStyle: result.attackStyle,
    comboStyle: result.comboAttackStyle,
    vfxStyle: vfx.style,
    special: result.special,
    lines: result.lines,
  });
  schedulePendingHit({
    type: "player",
    delay: getHeroHitDelay(result.attackStyle, result.comboAttackStyle),
    damage: result.damage,
    heal: result.heal,
    context: result.context,
    breakdown: result.breakdown,
    floaters: result.floaters,
    weaknessHit: result.weaknessBonus.multiplier > 1,
    b2bHit: result.b2bHit,
    comboBurst: result.comboBurst,
    sfx: state.lastPerfectClear ? "perfect" : result.spinType ? "tspin" : result.lines >= 4 ? "bigClear" : result.lines === 3 ? "tripleClear" : result.lines === 2 ? "doubleClear" : "clear",
    shake: state.lastPerfectClear ? 12 : Math.max(4 + result.lines * 1.8 + Math.min(4, state.combo * 0.7), result.spinType || result.lines >= 4 ? 8 : 0),
    burst: result.spinType || result.lines >= 4 || state.lastPerfectClear ? {
      x: 994,
      y: 346,
      radius: 18,
      color: state.lastPerfectClear ? "#fff0a6" : result.spinType ? "#d7c2ff" : "#9df7da",
      life: state.lastPerfectClear ? 620 : 440,
      duration: state.lastPerfectClear ? 620 : 440,
      intensity: state.lastPerfectClear ? 2.2 : 1.65,
    } : null,
  });
}

function getPlayerAttackSfx(result) {
  if (result.context?.perfect || result.spinType || result.attackStyle === "ultimate") return "playerAttackArcane";
  if (result.lines >= 3 || result.b2bHit || result.comboBurst) return "playerAttackHeavy";
  return "playerAttackLight";
}

function getComboMilestoneDamage(combo) {
  return getComboMilestoneDamageBase(combo, BALANCE.comboMilestoneEvery, BALANCE.comboMilestoneDamage);
}

function gainGuardFromClear(lines, spinType) {
  if (lines <= 0) return;
  const traits = getTraitSnapshot();
  const comboGuard = state.combo >= 3 ? state.upgrades.comboGuardGain : 0;
  const traitDefenseGuard = getTraitBonus("Defense", [1, 2, 3]) + getDefenseTraitBonus(traits).clearGuard;
  const traitSpinGuard = spinType ? getTraitBonus("Spin", [1, 2, 4]) + getSpinTraitBonus(traits).guard : 0;
  const gain = lines * BALANCE.guardPerLine + (spinType ? BALANCE.guardSpinBonus : 0) + state.upgrades.guardGain + comboGuard + traitDefenseGuard + traitSpinGuard;
  const before = state.guard;
  state.guard = Math.min(getEffectiveMaxGuard(), state.guard + gain);
  const gained = state.guard - before;
  if (gained > 0 && (lines >= 3 || spinType)) {
    state.floaters.push({
      x: 86,
      y: 270,
      text: fmt("floaterGuard", { amount: gained }),
      color: "#9df7da",
      life: 850,
    });
  }
}

function getGravityMsForWave() {
  const steps = Math.floor((state.wave - 1) / BALANCE.gravityStepWaves);
  const bossPressure = state.enemyType.id === "king" ? getBossPhase() * 12 : 0;
  return Math.max(BALANCE.minGravityMs, state.tuning.gravity - steps * BALANCE.gravityStepMs - bossPressure);
}

function getGarbageDelayForWave() {
  return Math.max(0, 1 + state.upgrades.garbageGrace + getGarbageTraitBonus(getTraitSnapshot()).graceDelay - Math.floor((state.wave - 1) / BALANCE.garbageDelayStepWaves));
}

function addUltimateCharge(lines, spinType = null) {
  if (lines <= 0 || state.ultimateActive) return;
  const highValue = isTraitHighValueClear({ lines, spinType, b2bActive: state.b2bActive, perfect: state.lastPerfectClear });
  const bonus = (state.upgrades.burstCharge > 0 && highValue ? state.upgrades.burstCharge : 0)
    + (highValue ? getTraitBonus("Utility", [1, 2, 3]) + getUtilityTraitBonus(getTraitSnapshot()).ultimateCharge : 0);
  state.ultimateCharge = Math.min(ULTIMATE_REQUIRED_LINES, state.ultimateCharge + lines + bonus);
  if (state.ultimateCharge >= ULTIMATE_REQUIRED_LINES) activateUltimateMode();
}

function activateUltimateMode() {
  if (state.ultimateActive) return;
  state.ultimateActive = true;
  state.ultimateTimer = ULTIMATE_DURATION_MS;
  state.ultimateTimerMax = ULTIMATE_DURATION_MS;
  state.ultimateSavedBoard = cloneMatrix(state.board);
  state.board = makeUltimateBoard();
  state.lineFlash = [];
  state.lockTimer = null;
  state.dropTimer = 0;
  state.input.softDropTimer = 0;
  resetInputRepeat();
  state.floaters.push({
    x: BOARD_X + (COLS * TILE) / 2,
    y: BOARD_Y + 96,
    text: fmt("ultimateBurstTimed", { seconds: 15 }).toUpperCase(),
    color: "#ffbe5f",
    life: 1500,
  });
  state.bursts.push({
    x: BOARD_X + (COLS * TILE) / 2,
    y: BOARD_Y + ROWS * TILE * 0.42,
    radius: 26,
    color: "#ffbe5f",
    life: 720,
    duration: 720,
    intensity: 1.9,
  });
  state.shake = Math.max(state.shake, 9);
  playSfx("perfect");
}

function endUltimateMode() {
  if (!state.ultimateActive) return;
  state.ultimateActive = false;
  state.ultimateCharge = 0;
  state.ultimateTimer = 0;
  state.ultimateTimerMax = ULTIMATE_DURATION_MS;
  state.board = state.ultimateSavedBoard ? cloneMatrix(state.ultimateSavedBoard) : makeBoard();
  state.ultimateSavedBoard = null;
  state.active = null;
  state.lineFlash = [];
  state.lockTimer = null;
  state.dropTimer = 0;
  state.input.softDropTimer = 0;
  resetInputRepeat();
  state.floaters.push({
    x: BOARD_X + (COLS * TILE) / 2,
    y: BOARD_Y + 96,
    text: t("ultimateEnd").toUpperCase(),
    color: "#d7c2ff",
    life: 1100,
  });
  if (state.mode === "playing") spawnPiece();
}

function startPerfectClearFx(damage) {
  const now = performance.now();
  duckMusic(0.46, 1.05);
  state.perfectClearFx = {
    startedAt: now,
    duration: 1350,
    damage,
    seed: Math.random() * 1000,
  };
  state.shake = Math.max(state.shake, 15);
  state.bursts.push({
    x: BOARD_X + (COLS * TILE) / 2,
    y: BOARD_Y + ROWS * TILE * 0.42,
    radius: 28,
    color: "#fff0a6",
    life: 880,
    duration: 880,
    intensity: 2.6,
  });
}

function extendUltimateOnPerfectClear() {
  if (!state.ultimateActive) return;
  const extendMs = BALANCE.perfectClear4WideExtendMs || 3000;
  state.ultimateTimer = Math.min(ULTIMATE_TIMER_CAP_MS, state.ultimateTimer + extendMs);
  state.ultimateTimerMax = Math.max(state.ultimateTimerMax || ULTIMATE_DURATION_MS, state.ultimateTimer);
  state.floaters.push({
    x: BOARD_X + (COLS * TILE) / 2,
    y: BOARD_Y + 78,
    text: fmt("ultimateExtend", { seconds: Math.round(extendMs / 1000) }).toUpperCase(),
    color: "#ffbe5f",
    life: 1250,
  });
  state.bursts.push({
    x: BOARD_X + (COLS * TILE) / 2,
    y: BOARD_Y + ROWS * TILE * 0.36,
    radius: 20,
    color: "#ffbe5f",
    life: 560,
    duration: 560,
    intensity: 1.75,
  });
}

function extendUltimateOnCombo(lines) {
  if (!state.ultimateActive || lines <= 0 || state.combo < 2) return;
  const extendMs = Math.min(
    ULTIMATE_COMBO_EXTEND_MAX_MS,
    ULTIMATE_COMBO_EXTEND_MS + Math.max(0, state.combo - 2) * 150
  );
  const before = state.ultimateTimer;
  state.ultimateTimer = Math.min(ULTIMATE_TIMER_CAP_MS, state.ultimateTimer + extendMs);
  const actualExtend = state.ultimateTimer - before;
  if (actualExtend <= 0) return;
  state.ultimateTimerMax = Math.max(state.ultimateTimerMax || ULTIMATE_DURATION_MS, state.ultimateTimer);
  state.floaters.push({
    x: BOARD_X + (COLS * TILE) / 2,
    y: BOARD_Y + ROWS * TILE + 38,
    text: fmt("ultimateComboExtend", { seconds: (actualExtend / 1000).toFixed(1) }).toUpperCase(),
    color: "#7ef7ff",
    life: 900,
  });
}

function duckMusic(depth = 0.5, seconds = 0.8) {
  if (!audio.ctx || !audio.musicGain || audio.muted) return;
  const now = audio.ctx.currentTime;
  const base = audio.musicVolume;
  const ducked = Math.max(0.08, base * depth);
  audio.musicGain.gain.cancelScheduledValues(now);
  audio.musicGain.gain.setValueAtTime(audio.musicGain.gain.value, now);
  audio.musicGain.gain.linearRampToValueAtTime(ducked, now + 0.06);
  audio.musicGain.gain.linearRampToValueAtTime(base, now + seconds);
}

function startHeroAttackAnimation(kind, comboAttackStyle = "") {
  const vfx = resolvePlayerAttackVfx(kind, comboAttackStyle);
  const config = vfx.heroConfig || HERO_ANIMATIONS.slash;
  state.heroAnimation = {
    kind: vfx.heroKind,
    startedAt: performance.now(),
    duration: getAnimationDuration(config),
  };
}

function startHeroLevelUpEffect() {
  state.heroLevelUpFx = {
    startedAt: performance.now(),
    duration: getAnimationDuration(HERO_LEVEL_UP_EFFECT),
  };
}

function startEnemyAttackAnimation(kind, resolvedConfig = null) {
  const config = resolvedConfig || ENEMY_ATTACK_ANIMATIONS[kind];
  if (!config) return;
  state.enemyAnimation = {
    kind,
    config,
    startedAt: performance.now(),
    duration: getAnimationDuration(config),
  };
}

function getWeaknessBonus(lines, spinType) {
  if (lines <= 0) return { multiplier: 1, label: "" };
  const weakness = state.enemyType.weakness;
  const hit =
    (weakness === "combo" && state.combo >= 3) ||
    (weakness === "spin" && Boolean(spinType)) ||
    (weakness === "allspin" && spinType === "all-mini") ||
    (weakness === "perfect" && state.lastPerfectClear) ||
    (weakness === "b2b" && state.b2bActive);
  return hit ? { multiplier: 1.35, label: t("weaknessHit") } : { multiplier: 1, label: "" };
}

function pushOperationReadout(lines, pieceType, spinType, meta = {}) {
  if (lines <= 0) return;
  const title = getOperationTitle(lines, pieceType, spinType, meta.perfect);
  const color =
    meta.perfect ? "#fff0a6" :
    spinType ? "#d7c2ff" :
    lines >= 4 ? "#9df7da" :
    lines >= 2 ? "#f5f1e6" :
    "#b9c2ff";
  state.operationReadouts.unshift({
    title,
    combo: meta.combo || 0,
    b2b: Boolean(meta.b2b),
    effectiveLines: meta.effectiveLines || lines,
    damage: meta.damage || 0,
    equation: meta.breakdown ? buildDamageEquation(meta.breakdown, { translate: t, compact: true }) : "",
    color,
    life: 1650,
    duration: 1650,
  });
  state.operationReadouts = state.operationReadouts.slice(0, 4);
  pushCombatPopup(lines, pieceType, spinType, {
    ...meta,
    title,
    color,
  });
}

function pushCombatPopup(lines, pieceType, spinType, meta = {}) {
  const combo = meta.combo || 0;
  const hasCombo = combo >= 2;
  const b2b = Boolean(meta.b2b);
  const perfect = Boolean(meta.perfect);
  const type =
    perfect ? "perfect" :
    spinType === "full" ? "tspin" :
    spinType ? "spin" :
    b2b ? "b2b" :
    hasCombo ? "combo" :
    lines >= 4 ? "tetris" :
    "lineClear";
  const popupBase = {
    ...getCombatPopupAnchor(type),
    life: 980,
    maxLife: 980,
    seed: Math.random() * 1000,
  };
  const damageText = meta.damage ? `${meta.damage} ${t("dmgShort")}` : "";
  const title = getHitBreakdownTitle(lines, pieceType, spinType, { combo, b2b, perfect });

  if (perfect) {
    addCombatPopup({
      ...popupBase,
      text: title,
      subText: damageText,
      ...getCombatPopupAnchor("perfect"),
      color: "#fff0a6",
      accent: "#8ff7ff",
      scale: 1.18,
      type: "perfect",
      life: 1240,
      maxLife: 1240,
    });
    return;
  }

  addCombatPopup({
    ...popupBase,
    text: title,
    subText: damageText,
    color: getHitPopupColor(type, lines, combo),
    accent: getHitPopupAccent(type),
    scale: getHitPopupScale(type, combo),
    type,
    life: getHitPopupLife(type),
    maxLife: getHitPopupLife(type),
  });
}

function addCombatPopup(popup) {
  state.combatPopups.unshift(popup);
  state.combatPopups = state.combatPopups.slice(0, 5);
}

function getHitBreakdownTitle(lines, pieceType, spinType, meta = {}) {
  if (meta.perfect) return t("hitPerfect");
  const parts = [];
  if (spinType) {
    if (spinType === "full") parts.push(t("hitTSpin"));
    else if (spinType === "mini") parts.push(t("hitTSpinMini"));
    else parts.push(`${pieceType}-SPIN`);
  } else {
    parts.push(getLineHitLabel(lines));
  }
  if (meta.combo >= 2) parts.push(t("hitCombo"));
  if (meta.b2b) parts.push(t("hitB2B"));
  return parts.filter(Boolean).slice(0, 3).join(" + ");
}

function getLineHitLabel(lines) {
  return {
    1: t("hitSingle"),
    2: t("hitDouble"),
    3: t("hitTriple"),
    4: t("hitTetris"),
  }[lines] || `${lines} ${t("linesShort")}`;
}

function getHitPopupColor(type, lines, combo) {
  return {
    perfect: "#fff0a6",
    tspin: "#ffb7ff",
    spin: "#d7c2ff",
    b2b: "#fff0a6",
    combo: combo >= 4 ? "#7ef7ff" : "#d7c2ff",
    tetris: "#9df7da",
    lineClear: lines >= 2 ? "#f5f1e6" : "#b9c2ff",
  }[type] || "#f5f1e6";
}

function getHitPopupAccent(type) {
  return {
    perfect: "#8ff7ff",
    tspin: "#8ff7ff",
    spin: "#8ff7ff",
    b2b: "#d7c2ff",
    combo: "#ffb7ff",
    tetris: "#fff0a6",
    lineClear: "#8ff7ff",
  }[type] || "#8ff7ff";
}

function getCombatPopupAnchor(type) {
  const x = BOARD_X - 104;
  const baseY = BOARD_Y + 404;
  return {
    x,
    y: baseY + ({
      perfect: -120,
      tspin: -56,
      spin: -48,
      b2b: -34,
      combo: -18,
      tetris: -8,
      lineClear: 0,
    }[type] || 0),
  };
}

function getHitPopupScale(type, combo = 0) {
  if (type === "perfect") return 1.18;
  if (type === "tspin") return 1.06;
  if (type === "spin") return 1;
  if (type === "b2b") return 1;
  if (type === "combo") return 0.98 + Math.min(0.2, combo * 0.026);
  if (type === "tetris") return 1.02;
  return 0.92;
}

function getHitPopupLife(type) {
  return {
    perfect: 1240,
    tspin: 1120,
    spin: 1020,
    b2b: 1040,
    combo: 980,
    tetris: 920,
    lineClear: 820,
  }[type] || 900;
}

function getLineClearPopupText(lines) {
  return {
    1: t("hitSingle"),
    2: t("hitDouble"),
    3: t("hitTriple"),
    4: t("hitTetris"),
  }[lines] || fmt("line.generic", { lines });
}

function getOperationTitle(lines, pieceType, spinType, perfect) {
  if (perfect) return t("perfectClearTitle");
  const lineName = {
    1: t("line.single"),
    2: t("line.double"),
    3: t("line.triple"),
    4: t("line.tetris"),
  }[lines] || fmt("line.generic", { lines });
  if (spinType === "full") return `T-SPIN ${lineName}`;
  if (spinType === "mini") return `T-SPIN MINI ${lineName}`;
  if (spinType === "all-mini") return `${pieceType}-SPIN ${lineName}`;
  return lineName;
}

function cancelIncomingGarbage(lines) {
  if (lines <= 0 || state.pendingGarbage <= 0) return 0;
  const cancelPower = lines + (lines >= 4 ? 1 : 0) + state.upgrades.garbageCancel;
  const canceled = Math.min(state.pendingGarbage, cancelPower);
  state.pendingGarbage -= canceled;
  if (state.pendingGarbage === 0) state.garbageGrace = 0;
  return canceled;
}

function applyIncomingGarbage() {
  if (state.garbageGrace > 0) {
    state.garbageGrace -= 1;
    return;
  }
  const count = Math.min(2, state.pendingGarbage);
  state.pendingGarbage -= count;
  addGarbageLines(count);
  if (state.mode === "defeat") return;
  if (count > 0) {
    state.floaters.push({
      x: BOARD_X + COLS * TILE + 34,
      y: BOARD_Y + 190,
      text: fmt("floaterGarbageRise", { count }),
      color: "#c9d4da",
      life: 1000,
    });
  }
}

function updateBackToBack(lines, isDifficultClear) {
  if (lines <= 0) return;
  if (isDifficultClear) {
    if (state.b2bActive) state.b2bChain += 1;
    else {
      state.b2bActive = true;
      state.b2bChain = 1;
    }
    state.stats.b2bCount += 1;
    return;
  }
  if (state.b2bActive && state.upgrades.b2bShield > 0) {
    state.upgrades.b2bShield -= 1;
    state.b2bBrokenFlash = 0;
    state.floaters.push({
      x: HOLD_PANEL_X + 14,
      y: HOLD_PANEL_Y + 190,
      text: t("floaterB2BGuard"),
      color: "#fff0a6",
      life: 900,
    });
    playSfx("cancel");
    return;
  }
  if (state.b2bActive || state.b2bChain > 0) state.b2bBrokenFlash = 1200;
  state.b2bActive = false;
  state.b2bChain = 0;
}

function updateChallengeProgress(lines, spinType, canceled) {
  if (!state.challenge || state.challenge.complete) return;
  const config = CHALLENGES.find((challenge) => challenge.id === state.challenge.id);
  if (!config) return;
  if (state.challenge.id === "tspin-mini" && spinType === "mini" && lines > 0) {
    state.challenge.progress = 1;
  } else if (state.challenge.id === "cancel3" && canceled > 0) {
    state.challenge.progress = Math.min(config.target, state.challenge.progress + canceled);
  } else if (state.challenge.id === "b2b2" && state.b2bChain > state.challenge.progress) {
    state.challenge.progress = Math.min(config.target, state.b2bChain);
  }
  if (state.challenge.progress >= config.target) completeChallenge(config);
}

function recordTutorialBattleEvents(lines, spinType, canceled) {
  if (lines > 0) advanceTutorialStep("line");
  if (lines > 0 && state.combo >= 2) advanceTutorialStep("combo");
  if (lines > 0 && spinType) advanceTutorialStep("spin");
  if (canceled > 0) advanceTutorialStep("cancel");
}

function completeChallenge(config) {
  state.challenge.complete = true;
  const rewardName = CHALLENGE_REWARDS[config.id];
  const reward = UPGRADES.find((upgrade) => upgrade.name === rewardName);
  if (reward) {
    applyUpgrade(reward);
    recordAcquiredRelic(reward);
  }
  state.playerHp = Math.min(state.playerMaxHp, state.playerHp + 18);
  state.floaters.push({
    x: BOARD_X - 68,
    y: BOARD_Y + 88,
    text: fmt("floaterChallengeClear", { title: config.title }),
    color: "#fff0a6",
    life: 1600,
  });
  if (reward) {
    state.floaters.push({
      x: BOARD_X - 68,
      y: BOARD_Y + 128,
      text: fmt("floaterReward", { name: upgradeName(reward) }),
      color: "#9df7da",
      life: 1600,
    });
  }
  playSfx("perfect");
}

function resolveEnemyAttack() {
  const enemy = state.enemyType;
  const bossPhase = enemy.id === "king" ? getBossPhase() : 1;
  const enemyVfx = resolveEnemyAttackVfx(enemy.id, bossPhase);
  const garbageAdded = getEnemyAttackGarbage(enemy);
  const damageTaken = Math.max(1, state.enemyAttackDamage - state.upgrades.defense);
  state.enemyCountdown = getEnemyCountdownForWave();
  if (enemy.id === "king" && getBossPhase() >= 3) state.enemyCountdown = Math.max(4, state.enemyCountdown - 1);
  if (enemy.id === "king" && getBossPhase() >= 4) state.enemyCountdown = Math.max(3, state.enemyCountdown - 1);
  if (enemy.id === "king") startBossWindup(bossPhase, enemyVfx?.shake);
  if (enemy.attackSprite === false && !enemyVfx) state.enemyAnimation = null;
  else startEnemyAttackAnimation(enemy.id, enemyVfx?.bodyConfig);
  const enemyAttackDuration = enemyVfx?.totalDurationMs
    || (enemy.attackSprite === false ? 860 : getEnemyAnimationDuration(enemy.id));
  state.attacks.push({
    type: "enemy",
    attackKind: enemy.id,
    bossPhase,
    x0: 994,
    y0: 344,
    x1: 266,
    y1: 330,
    life: enemyAttackDuration,
    duration: enemyAttackDuration,
  });
  schedulePendingHit({
    type: "enemy",
    delay: getEnemyHitDelay(),
    enemy,
    damageTaken,
    garbageAdded,
  });
}

function getEnemyAttackGarbage(enemy) {
  let garbageAdded = enemy.garbage;
  if (enemy.id === "mushroom" && Math.random() < 0.28) garbageAdded += 1;
  if (enemy.id === "king" && state.wave % 3 === 0) garbageAdded += 1;
  if (enemy.id === "king" && getBossPhase() >= 2) garbageAdded += 1;
  if (enemy.id === "king" && getBossPhase() >= 3) garbageAdded += 1;
  if (enemy.id === "king" && getBossPhase() >= 4) garbageAdded += 1;
  return garbageAdded;
}

function getEnemyAttackGarbagePreview(enemy) {
  let garbage = enemy.garbage;
  if (enemy.id === "mushroom") garbage += 1;
  if (enemy.id === "king" && state.wave % 3 === 0) garbage += 1;
  if (enemy.id === "king" && getBossPhase() >= 2) garbage += 1;
  if (enemy.id === "king" && getBossPhase() >= 3) garbage += 1;
  if (enemy.id === "king" && getBossPhase() >= 4) garbage += 1;
  return garbage;
}

function applyEnemyBoardEffect(enemy) {
  if (enemy.id === "vine") {
    state.floaters.push({
      x: BOARD_X + COLS * TILE + 34,
      y: BOARD_Y + 132,
      text: t("floaterRootPressure"),
      color: "#9de06c",
      life: 900,
    });
    return;
  }
  if (enemy.id === "mushroom") {
    scrambleNextQueue();
    return;
  }
  if (enemy.id === "mist") {
    state.mistGarbage = Math.max(state.mistGarbage, 4);
    state.floaters.push({ x: 512, y: 606, text: t("floaterMistHolesDrift"), color: "#d2ceff", life: 1100 });
    return;
  }
  if (enemy.id === "king") {
    const phase = getBossPhase();
    if (phase >= 2) {
      state.pendingGarbage += 1;
      state.garbageGrace = Math.max(state.garbageGrace, getGarbageDelayForWave());
      state.floaters.push({
        x: BOARD_X + COLS * TILE + 34,
        y: BOARD_Y + 132,
        text: t("floaterBossPressure"),
        color: "#ffb95f",
        life: 950,
      });
    }
    if (phase >= 3) {
      scrambleNextQueue(4);
      state.mistGarbage = Math.max(state.mistGarbage, 3);
    }
  }
}

function scrambleNextQueue(turns = 3) {
  const windowSize = Math.min(5, state.queue.length);
  const front = state.queue.slice(0, windowSize);
  for (let i = front.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [front[i], front[j]] = [front[j], front[i]];
  }
  state.queue.splice(0, windowSize, ...front);
  state.queueHex = Math.max(state.queueHex, turns);
  state.floaters.push({ x: NEXT_PANEL_X - 4, y: NEXT_PANEL_Y + 42, text: t("floaterQueueHex"), color: "#77e8ff", life: 1050 });
}

function getBossPhaseByHp(hp, maxHp) {
  const hpRatio = maxHp ? hp / maxHp : 1;
  if (hpRatio <= 0.2) return 4;
  if (hpRatio <= 0.4) return 3;
  if (hpRatio <= 0.7) return 2;
  return 1;
}

function getBossPhase() {
  if (state.enemyType.id !== "king") return 1;
  return getBossPhaseByHp(state.enemyHp, state.enemyMaxHp);
}

function startBossWindup(phase = getBossPhase(), shake = 8 + phase * 2) {
  if (state.enemyType?.id !== "king") return;
  state.bossWindup = {
    phase,
    life: BOSS_WINDUP_MS,
    duration: BOSS_WINDUP_MS,
    startedAt: performance.now(),
  };
  state.shake = Math.max(state.shake, shake);
}

function triggerBossPhaseSignal(phase) {
  state.lastBossPhase = phase;
  state.bossPhaseBanner = {
    phase,
    life: BOSS_PHASE_BANNER_MS,
    duration: BOSS_PHASE_BANNER_MS,
  };
  state.floaters.push({
    x: BOARD_X + COLS * TILE + 36,
    y: BOARD_Y + 96,
    text: fmt("bossPhaseShift", { phase }),
    color: "#fff0a6",
    life: BOSS_PHASE_BANNER_MS,
  });
  startBossWindup(phase);
  playSfx("enemyWarnStrong");
}

function checkBossPhaseTransition(beforeHp, afterHp) {
  if (state.enemyType.id !== "king" || afterHp <= 0) return;
  const beforePhase = getBossPhaseByHp(beforeHp, state.enemyMaxHp);
  const afterPhase = getBossPhaseByHp(afterHp, state.enemyMaxHp);
  if (afterPhase > beforePhase && afterPhase > state.lastBossPhase) triggerBossPhaseSignal(afterPhase);
}

function spawnEnemyDeathParticles(enemy) {
  const pose = CHARACTER_BASELINES.enemy;
  const centerX = UI_LAYOUT.enemyStage.x + UI_LAYOUT.enemyStage.w / 2 + pose.centerOffsetX;
  const centerY = pose.groundY - 150 * pose.scale;
  const colors = ["#a972ff", "#68dcff", "#5f7cff", "#fff0a6", enemy.color || "#c7a7ff"];

  for (let index = 0; index < ENEMY_DEATH_TRANSITION.particleCount; index += 1) {
    const angle = (Math.PI * 2 * index) / ENEMY_DEATH_TRANSITION.particleCount
      + (Math.random() - 0.5) * 0.34;
    const speed = 1.8 + Math.random() * 3.8;
    state.particles.push({
      kind: "enemy-death",
      x: centerX + (Math.random() - 0.5) * 70,
      y: centerY + (Math.random() - 0.5) * 90,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.2,
      gravity: 0.018,
      size: 2.4 + Math.random() * 4.8,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.18,
      color: colors[index % colors.length],
      life: 760 + Math.random() * 300,
    });
  }
}

function startEnemyDeathTransition(enemy, revealNext) {
  if (!enemy) return;
  state.enemyDeathVfx = {
    enemy,
    revealNext,
    startedAt: performance.now(),
    duration: ENEMY_DEATH_DURATION_MS,
  };
  state.enemyAnimation = null;
  spawnEnemyDeathParticles(enemy);
}

function startNextWave() {
  const clearedBoss = state.enemyType.id === "king";
  const clearedMiniBoss = state.miniBoss;
  const nextDefeated = state.defeated + 1;
  const revealNext = nextDefeated < RUN_MODES[state.runMode].targetWaves;
  startEnemyDeathTransition(state.enemyType, revealNext);
  recordRunEnemyDefeat(clearedBoss);
  state.defeated += 1;
  if (state.defeated >= RUN_MODES[state.runMode].targetWaves) {
    setGameMode("victory");
    setMessage("messageVictory");
    state.shake = 10;
    finishRun("victory");
    playSfx("victory");
    return;
  }
  state.wave += 1;
  configureEnemyForWave();
  state.enemyHit = 0;
  state.enemyAnimation = null;
  state.shake = 14;
  state.lastClearedBoss = clearedBoss;
  state.comboConstellationWave = state.wave;
  state.comboConstellationFirstUsed = false;
  state.comboConstellationSecondUsed = false;
  state.upgradeChoices = [];
  state.upgradeSelectedIndex = 0;
  setGameMode("playing");
  const beforeHeal = state.playerHp;
  const waveHeal = BALANCE.waveHeal + state.upgrades.waveHeal + getTraitBonus("Survival", [4, 8, 14]) + getSurvivalTraitBonus(getTraitSnapshot()).waveHeal;
  state.playerHp = Math.min(state.playerMaxHp, state.playerHp + waveHeal);
  const healed = state.playerHp - beforeHeal;
  state.floaters.push({
    x: 910,
    y: 262,
    text: clearedBoss ? fmt("floaterRelicWave", { wave: state.wave }) : clearedMiniBoss ? t("floaterMiniBossClear") : fmt("floaterWave", { wave: state.wave }),
    color: clearedBoss ? "#fff0a6" : clearedMiniBoss ? "#d7c2ff" : "#98f07e",
    life: 1300,
  });
  state.floaters.push({
    x: 88,
    y: 226,
    text: fmt("floaterWaveHeal", { amount: healed }),
    color: "#76d4ff",
    life: 1100,
  });
  state.attacks.push({
    type: "wave",
    x0: 994,
    y0: 380,
    x1: 994,
    y1: 380,
    life: 820,
    duration: 820,
  });
  triggerUpgradeIfReady(clearedBoss, clearedMiniBoss);
  playSfx(clearedBoss ? "bossDefeated" : "waveVictory");
}

function recordRunEnemyDefeat(clearedBoss) {
  if (!state.runStats) state.runStats = makeRunStats();
  state.runStats.waveReached = Math.max(state.runStats.waveReached || 1, state.wave || 1);
  if (clearedBoss) state.runStats.bossKills += 1;
  else state.runStats.normalEnemyKills += 1;
}

function createUpgradeChoices(forceRelic = false, forceRare = false) {
  const availableUpgrades = UPGRADES.filter((upgrade) => isUpgradeAvailableForDraft(upgrade));
  const legendaryPool = availableUpgrades.filter((upgrade) => upgrade.rarity === "legendary");
  const pool = availableUpgrades.filter((upgrade) => upgrade.rarity !== "legendary");
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  for (let i = legendaryPool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [legendaryPool[i], legendaryPool[j]] = [legendaryPool[j], legendaryPool[i]];
  }
  const choices = [];
  const legendaryChance = forceRelic
    ? LEGENDARY_BOSS_DRAFT_CHANCE
    : state.upgradeTier >= 4 ? LEGENDARY_DRAFT_CHANCE : 0;
  if (legendaryPool.length && Math.random() < legendaryChance) {
    choices.push(legendaryPool[0]);
  }
  if (forceRelic && !choices.some((upgrade) => upgrade.rarity === "relic" || upgrade.rarity === "legendary")) {
    const relic = pool.find((upgrade) => upgrade.rarity === "relic");
    if (relic) choices.push(relic);
  } else if (forceRare && !choices.length) {
    const rare = pool.find((upgrade) => upgrade.rarity === "rare");
    if (rare) choices.push(rare);
  }
  for (const upgrade of pool) {
    if (!choices.includes(upgrade)) choices.push(upgrade);
    if (choices.length >= 3) break;
  }
  return choices;
}

function isUpgradeAvailableForDraft(upgrade) {
  if (!upgrade?.id || !isSpecialUpgradeId(upgrade.id)) return true;
  return !state.acquiredRelics.some((entry) => entry?.id === upgrade.id);
}

function addUpgradeProgress(effectiveLines) {
  if (isAscensionRunInProgress()) return;
  if (effectiveLines <= 0) return;
  const wasReady = state.upgradeReady;
  state.upgradeMeter += effectiveLines;
  state.upgradeReady = state.upgradeMeter >= state.nextUpgradeAt;
  if (state.upgradeReady && !wasReady) {
    state.floaters.push({
      x: HOLD_PANEL_X + 8,
      y: HOLD_PANEL_Y + 214,
      text: t("floaterUpgradeReady"),
      color: "#fff0a6",
      life: 1200,
    });
    playSfx("upgradeReady");
    triggerUpgradeIfReady(false, false, "progress");
  }
}

function triggerUpgradeIfReady(forceRelic = false, forceRare = false, reason = "wave") {
  if (state.runMode === "ascension") return false;
  if (state.mode !== "playing") return false;
  const ready = state.upgradeMeter >= state.nextUpgradeAt;
  if (!ready && !forceRelic && !forceRare) return false;
  if (!ready) state.upgradeMeter = state.nextUpgradeAt;
  state.upgradeTier += 1;
  state.nextUpgradeAt += BALANCE.upgradeGrowthPerTier * state.upgradeTier;
  state.upgradeReady = false;
  state.upgradeChoices = createUpgradeChoices(forceRelic, forceRare);
  state.upgradeSelectedIndex = 0;
  state.upgradeDraftReason = reason;
  state.upgradeMotion = {
    openedAt: performance.now(),
    selectedAt: performance.now(),
    selectedIndex: 0,
  };
  state.upgradeDetailOpen = false;
  setGameMode("upgrade");
  state.floaters.push({
    x: 454,
    y: 178,
    text: fmt("floaterUpgrade", { tier: state.upgradeTier }),
    color: forceRelic ? "#fff0a6" : forceRare ? "#d7c2ff" : "#9df7da",
    life: 1300,
  });
  playSfx("upgradeReveal");
  return true;
}

function applyUpgrade(upgrade) {
  applyUpgradeEffect(upgrade, {
    state,
    basePlayerMaxHp: PLAYER_MAX_HP,
    getEffectiveMaxGuard,
  });
}

function moveUpgradeSelection(direction) {
  const previous = state.upgradeSelectedIndex;
  state.upgradeSelectedIndex = getNextUpgradeSelectionIndex(previous, direction, state.upgradeChoices.length);
  if (state.upgradeSelectedIndex !== previous) {
    markUpgradeSelectionChanged(state.upgradeSelectedIndex);
    playSfx("upgradeReady");
  }
}

function markUpgradeSelectionChanged(index) {
  state.upgradeSelectedIndex = index;
  state.upgradeMotion = {
    ...(state.upgradeMotion || {}),
    selectedAt: performance.now(),
    selectedIndex: index,
  };
}

function previewUpgradeChoice(index, { openDetail = true } = {}) {
  const upgrade = state.upgradeChoices[index];
  if (!upgrade) return false;
  const wasSelected = state.upgradeSelectedIndex === index;
  markUpgradeSelectionChanged(index);
  state.upgradeDetailOpen = wasSelected ? !state.upgradeDetailOpen : Boolean(openDetail);
  playSfx("upgradeReady");
  return true;
}

function toggleUpgradeDetail() {
  state.upgradeDetailOpen = !state.upgradeDetailOpen;
  markUpgradeSelectionChanged(state.upgradeSelectedIndex);
  playSfx("hold");
}

function chooseUpgrade(index) {
  if (state.upgradePickConfirm) return;
  const upgrade = state.upgradeChoices[index];
  if (!upgrade) return;
  state.upgradeSelectedIndex = index;
  state.upgradeMotion = {
    ...(state.upgradeMotion || {}),
    selectedAt: performance.now(),
    selectedIndex: index,
    confirmedAt: performance.now(),
  };
  const bondPreview = getSpecialBondPreview(upgrade, state.acquiredRelics);
  applyUpgrade(upgrade);
  recordAcquiredRelic(upgrade);
  showSpecialBondUpgradeCallout(bondPreview);
  state.floaters.push({
    x: 454,
    y: 178,
    text: upgradeName(upgrade),
    color: "#fff0a6",
    life: 1200,
  });
  state.upgradePickConfirm = {
    index,
    id: upgrade.id,
    name: upgradeName(upgrade),
    rarity: upgrade.rarity,
    elapsed: 0,
    duration: 400,
  };
  state.currentBuildOpen = false;
  playSfx("upgradeConfirm");
}

function finishUpgradeSelection() {
  state.upgradeChoices = [];
  state.upgradeSelectedIndex = 0;
  state.currentBuildOpen = false;
  state.upgradePickConfirm = null;
  state.upgradeMotion = null;
  state.upgradeDetailOpen = false;
  setGameMode("playing");
  state.upgradeReady = state.upgradeMeter >= state.nextUpgradeAt;
  state.upgradeDraftReason = null;
  if (state.upgradeReady && triggerUpgradeIfReady(false, false, "progress")) return;
  startHeroLevelUpEffect();
  if (!state.active) spawnPiece();
}

function updateUpgradeConfirm(dt) {
  if (state.mode !== "upgrade" || !state.upgradePickConfirm) return;
  state.upgradePickConfirm.elapsed += dt;
  if (state.upgradePickConfirm.elapsed >= state.upgradePickConfirm.duration) finishUpgradeSelection();
}

function recordAcquiredRelic(upgrade) {
  if (!Array.isArray(state.acquiredRelics)) state.acquiredRelics = [];
  state.acquiredRelics.push({
    id: upgrade.id,
    name: upgrade.name,
    rarity: upgrade.rarity,
    tags: getUpgradeTags(upgrade),
    stackRule: upgrade.stackRule || "stackable",
    textKey: upgrade.textKey || "",
    shortTextKey: upgrade.shortTextKey || "",
    wave: state.wave,
  });
}

function settleRunRiftEnergy() {
  if (!state.runStats) state.runStats = makeRunStats();
  if (!shouldSettleRunRiftEnergy(state.runStats)) return state.runStats.riftEnergyEarned || 0;
  const settlementStats = getRunRiftEnergyStatsSnapshot();
  Object.assign(state.runStats, settlementStats);
  const earned = calculateRiftEnergyEarned(settlementStats);
  state.metaProgress = grantRiftEnergy(state.metaProgress, earned);
  saveMetaProgress(state.metaProgress);
  state.runStats.riftEnergyEarned = earned;
  state.runStats.riftEnergySettled = true;
  return earned;
}

function getRunRiftEnergyStatsSnapshot() {
  const stats = state.runStats || makeRunStats();
  return {
    waveReached: Math.max(stats.waveReached || 1, state.stats?.peakWave || 1, state.wave || 1),
    normalEnemyKills: stats.normalEnemyKills || 0,
    bossKills: stats.bossKills || 0,
    perfectClearCount: Math.max(stats.perfectClearCount || 0, state.stats?.perfectClears || 0),
    spinCount: Math.max(stats.spinCount || 0, state.stats?.spins || 0),
    maxCombo: Math.max(stats.maxCombo || 0, state.stats?.maxCombo || 0),
  };
}

function hasRunRiftEnergyActivity(stats) {
  return (stats.normalEnemyKills || 0) > 0
    || (stats.bossKills || 0) > 0
    || (stats.perfectClearCount || 0) > 0
    || (stats.spinCount || 0) > 0
    || (stats.maxCombo || 0) >= 5
    || (stats.waveReached || 1) > 1;
}

function getCurrentRunRiftEnergyEarned() {
  if (!state.runStats) return 0;
  if (state.runStats.riftEnergySettled) return state.runStats.riftEnergyEarned || 0;
  const stats = getRunRiftEnergyStatsSnapshot();
  return hasRunRiftEnergyActivity(stats) ? calculateRiftEnergyEarned(stats) : 0;
}

function finishRun(outcome) {
  state.debug.finishRunCalled = true;
  if (state.runFinalized) return;
  state.runFinalized = true;
  state.stats.peakWave = Math.max(state.stats.peakWave, state.wave);
  state.stats.perfectClears = state.perfectClears;
  state.stats.rating = getRunRating(outcome);
  state.save.bestWave = Math.max(state.save.bestWave || 0, state.stats.peakWave);
  state.save.bestCombo = Math.max(state.save.bestCombo || 0, state.stats.maxCombo);
  state.save.bestB2B = Math.max(state.save.bestB2B || 0, state.stats.b2bCount);
  state.save.bestDamage = Math.max(state.save.bestDamage || 0, state.stats.damage);
  state.save.bestHit = Math.max(state.save.bestHit || 0, state.stats.bestHit);
  state.save.perfectClears = Math.max(state.save.perfectClears || 0, state.stats.perfectClears);
  const earned = settleRunRiftEnergy();
  if (earned > 0 && typeof window !== "undefined") {
    window.setTimeout(() => playSfx("riftEnergyComplete"), outcome === "victory" ? 760 : 920);
  }
  saveGame();
}

function getRunRating(outcome) {
  if (outcome === "victory") return state.perfectClears > 0 ? "PERFECT" : "ARCANE";
  if (state.stats.maxCombo >= 5 || state.stats.b2bCount >= 3) return "BRUTAL";
  if (state.stats.spins >= 3) return "CLEAN";
  return "GOOD";
}

function getEnemyCountdownForWave() {
  return Math.max(4, state.enemyType.countdown - Math.floor((state.wave - 1) / 10));
}

function findEnemyById(id) {
  return ENEMIES.find((enemy) => enemy.id === id) || ENEMIES[0];
}

function getStandardEnemyPool() {
  return ENEMIES.filter((enemy) => enemy.id !== "king");
}

function getEnemyForWave(wave) {
  const pool = getStandardEnemyPool();
  const normalCycleLength = Math.max(1, pool.length * NORMAL_ENEMY_CYCLES_BEFORE_BOSS);
  const cycleLength = normalCycleLength + 1;
  const slot = (wave - 1) % cycleLength;
  if (slot >= normalCycleLength) return findEnemyById("king");
  return pool[slot % pool.length] || ENEMIES[0];
}

function configureEnemyForWave() {
  const enemy = getEnemyForWave(state.wave);
  const cycleLength = Math.max(1, getStandardEnemyPool().length * NORMAL_ENEMY_CYCLES_BEFORE_BOSS + 1);
  const tier = Math.floor((state.wave - 1) / cycleLength);
  state.miniBoss = MINI_BOSS_ENEMY_IDS.includes(enemy.id);
  state.enemyType = enemy;
  const bossMultiplier = enemy.id === "king" ? BALANCE.bossMultiplier : state.miniBoss ? BALANCE.miniBossMultiplier : 1;
  state.enemyMaxHp = Math.floor((enemy.hp + tier * enemy.hpScale + Math.floor((state.wave - 1) * BALANCE.enemyWaveHp)) * bossMultiplier);
  state.enemyHp = state.enemyMaxHp;
  state.enemyHpDisplay = state.enemyHp;
  state.enemyHpTrail = state.enemyHp;
  state.enemyHitIntensity = 0;
  state.lastBossPhase = enemy.id === "king" ? 1 : 0;
  if (enemy.id !== "king") state.riftOverdriveCharge = 0;
  state.bossPhaseBanner = null;
  state.bossWindup = null;
  state.enemyAttackDamage = enemy.damage + Math.floor((state.wave - 1) / BALANCE.enemyDamageEveryWaves) * BALANCE.enemyDamageStep + (state.miniBoss ? BALANCE.miniBossDamageBonus : 0);
  state.enemyCountdown = getEnemyCountdownForWave();
}

function addGarbageLines(count) {
  for (let i = 0; i < count; i += 1) {
    state.board.shift();
    const well = getUltimateWellRange();
    const holeMin = state.ultimateActive ? well.start : 0;
    const holeMax = state.ultimateActive ? well.end - 1 : COLS - 1;
    const hole = chooseGarbageHole(holeMin, holeMax);
    state.lastGarbageHole = hole;
    const row = Array.from({ length: COLS }, (_, x) => {
      if (state.ultimateActive && !isUltimateWellColumn(x)) return ULTIMATE_WALL;
      return x === hole ? null : "G";
    });
    state.board.push(row);
    spawnGarbageParticles(hole);
  }
  applyUltimateWalls();
  checkDefeatState("addGarbageLines.spawnBlocked");
}

function chooseGarbageHole(holeMin, holeMax) {
  const previous = Number.isInteger(state.lastGarbageHole) && state.lastGarbageHole >= holeMin && state.lastGarbageHole <= holeMax
    ? state.lastGarbageHole
    : null;

  if (state.mistGarbage > 0 && previous !== null) {
    state.mistGarbage -= 1;
    state.garbageHoleRun = 0;
    const roll = Math.random();
    if (roll < 0.66) {
      const direction = Math.random() < 0.5 ? -1 : 1;
      const drifted = clamp(previous + direction, holeMin, holeMax);
      return drifted === previous ? randomGarbageHole(holeMin, holeMax, previous) : drifted;
    }
    if (roll < 0.82) return previous;
    return randomGarbageHole(holeMin, holeMax, previous);
  }

  if (previous === null) {
    state.garbageHoleRun = randomCleanGarbageRun();
    return randomGarbageHole(holeMin, holeMax);
  }

  if (state.garbageHoleRun > 0) {
    state.garbageHoleRun -= 1;
    return previous;
  }

  const next = Math.random() < 0.78
    ? nearbyGarbageHole(previous, holeMin, holeMax)
    : randomGarbageHole(holeMin, holeMax, previous);
  state.garbageHoleRun = randomCleanGarbageRun();
  return next;
}

function randomCleanGarbageRun() {
  const roll = Math.random();
  if (roll < 0.14) return 0;
  if (roll < 0.56) return 1;
  if (roll < 0.86) return 2;
  return 3;
}

function nearbyGarbageHole(previous, holeMin, holeMax) {
  const direction = Math.random() < 0.5 ? -1 : 1;
  const shifted = clamp(previous + direction, holeMin, holeMax);
  return shifted === previous ? randomGarbageHole(holeMin, holeMax, previous) : shifted;
}

function randomGarbageHole(holeMin, holeMax, avoid = null) {
  const width = holeMax - holeMin + 1;
  if (width <= 1) return holeMin;
  let hole = holeMin + Math.floor(Math.random() * width);
  if (avoid === null || hole !== avoid) return hole;
  hole = holeMin + ((hole - holeMin + 1 + Math.floor(Math.random() * (width - 1))) % width);
  return hole;
}

function spawnGarbageParticles(hole) {
  const y = BOARD_Y + ROWS * TILE - TILE / 2;
  for (let x = 0; x < COLS; x += 1) {
    if (state.ultimateActive && !isUltimateWellColumn(x)) continue;
    if (x === hole) continue;
    state.particles.push({
      x: BOARD_X + x * TILE + TILE / 2,
      y,
      vx: (Math.random() - 0.5) * 2.2,
      vy: -2.4 - Math.random() * 2,
      size: 2 + Math.random() * 3,
      color: "#aeb7bc",
      life: 480 + Math.random() * 180,
    });
  }
}

function update(time) {
  const elapsedMs = Math.max(0, time - (state.lastTime || time));
  const dt = Math.min(34, elapsedMs);
  state.lastTime = time;
  state.debug.lastUpdateAt = time;

  try {
    updateAssetLoading(time);
    if (state.mode === "paused" && state.ascensionRun?.status === "active") {
      updateAscensionChallengeTimer(elapsedMs);
    }
    if (state.mode === "playing") {
      purgeLegacyVineBlocks();
      if (!checkDefeatState("update.safety")) {
        if (isBattleCountdownActive()) {
          updateBattleCountdown(dt);
        } else {
          if (!updateAscensionChallengeTimer(elapsedMs)) {
            if (state.firstWaveHintMs > 0) state.firstWaveHintMs = Math.max(0, state.firstWaveHintMs - dt);
            if (state.hitStopMs > 0) {
              state.hitStopMs = Math.max(0, state.hitStopMs - dt);
            } else {
              if (state.ultimateActive) {
                state.ultimateTimer = Math.max(0, state.ultimateTimer - dt);
                if (state.ultimateTimer <= 0) endUltimateMode();
              }
              updateHorizontalInput(dt);
              if (state.input.softDrop) updateSoftDrop(dt);
              state.dropTimer += dt;
              if (state.dropTimer >= getGravityMsForWave()) {
                state.dropTimer = 0;
                if (!move(0, 1) && state.lockTimer === null) {
                  state.lockTimer = time;
                }
              }
              if (touchingGround()) {
                if (state.lockTimer === null) state.lockTimer = time;
                if (time - state.lockTimer >= state.tuning.lockDelay) lockPiece();
              } else {
                state.lockTimer = null;
              }
            }
          }
        }
        updateAudioCues(time);
      }
    }
    if (state.mode === "upgrade") updateUpgradeConfirm(dt);

    tickEffects(dt);
    updateScreenNoteMode();
    if (DEBUG_HUD_ENABLED) {
      updateDebugDomHud({
        enabled: DEBUG_HUD_ENABLED,
        debugState: state.debug,
        readers: getDebugHudReaders(time),
        now: time,
      });
      updateDebugArtTuningDom({
        enabled: DEBUG_HUD_ENABLED,
        tuning: getDebugArtTuning({ enabled: DEBUG_HUD_ENABLED }),
      });
    }
    draw();
  } catch (error) {
    state.debug.drawError = String(error?.message || error);
    console.error("T-Spin Traveler update failed:", error);
  }
  requestAnimationFrame(update);
}

function updateAssetLoading(now = performance.now()) {
  if (state.assetLoadingDone) return;
  const summary = getAssetLoadingSummary(window.TST_ASSETS);
  const elapsed = now - state.assetLoadingStartedAt;
  if (isAssetLoadingComplete(summary, elapsed, {
    minMs: ASSET_LOADING_MIN_MS,
    maxMs: ASSET_LOADING_MAX_MS,
  })) {
    state.assetLoadingDone = true;
    state.menuRevealStartedAt = now;
    playSfx("loadingComplete");
  }
}

function isBattleCountdownActive() {
  return state.mode === "playing" && state.countdownMs > 0;
}

function updateBattleCountdown(dt) {
  const before = getCountdownCue();
  state.countdownMs = Math.max(0, state.countdownMs - dt);
  const after = getCountdownCue();
  if (after && after !== before) {
    state.countdownCue = after;
    playSfx(after === "START" ? "countdownStart" : "countdown");
  }
  if (state.countdownMs <= 0) {
    state.countdownCue = "";
    state.dropTimer = 0;
    state.firstWaveHintMs = FIRST_WAVE_HINT_MS;
    resetInputRepeat();
    if (state.ascensionRun?.status === "waiting") {
      state.ascensionRun = startAscensionChallengeRun(state.ascensionRun);
    }
  }
}

function getCountdownCue() {
  if (state.countdownMs <= 0) return "";
  if (state.countdownMs <= BATTLE_COUNTDOWN_START_WINDOW_MS) return "START";
  return String(Math.max(1, Math.ceil((state.countdownMs - BATTLE_COUNTDOWN_START_WINDOW_MS) / ((BATTLE_COUNTDOWN_MS - BATTLE_COUNTDOWN_START_WINDOW_MS) / 3))));
}

function purgeLegacyVineBlocks() {
  let removed = false;
  for (let y = 0; y < state.board.length; y += 1) {
    for (let x = 0; x < state.board[y].length; x += 1) {
      if (state.board[y][x] === "V") {
        state.board[y][x] = null;
        removed = true;
      }
    }
  }
  if (removed) {
    state.floaters.push({
      x: BOARD_X + COLS * TILE + 34,
      y: BOARD_Y + 132,
      text: t("floaterVineBlocksRemoved"),
      color: "#9df7da",
      life: 700,
    });
  }
}

function updateHorizontalInput(dt) {
  const dir = state.input.horizontalDir;
  if (dir === 0) {
    state.input.das = 0;
    state.input.arr = 0;
    return;
  }

  state.input.das += dt;
  if (state.input.das < state.tuning.das) return;

  if (state.tuning.arr === 0) {
    while (move(dir, 0)) {}
    state.input.das = 0;
    return;
  }

  state.input.arr += dt;
  while (state.input.arr >= state.tuning.arr) {
    state.input.arr -= state.tuning.arr;
    if (!move(dir, 0)) {
      state.input.arr = 0;
      break;
    }
  }
}

function updateSoftDrop(dt) {
  state.input.softDropTimer += dt;
  while (state.input.softDropTimer >= state.tuning.softDrop) {
    state.input.softDropTimer -= state.tuning.softDrop;
    if (!move(0, 1)) {
      state.input.softDropTimer = 0;
      break;
    }
    playSfx("softDrop");
  }
}

function pressHorizontal(dir) {
  if (dir < 0) state.input.left = true;
  else state.input.right = true;

  if (state.input.horizontalDir !== dir) {
    state.input.horizontalDir = dir;
    state.input.das = 0;
    state.input.arr = 0;
    if (move(dir, 0)) playSfx("move");
    else playSfx("invalidMove");
  }
}

function releaseHorizontal(dir) {
  if (dir < 0) state.input.left = false;
  else state.input.right = false;

  const fallback = state.input.right ? 1 : state.input.left ? -1 : 0;
  if (state.input.horizontalDir !== fallback) {
    state.input.horizontalDir = fallback;
    state.input.das = 0;
    state.input.arr = 0;
    if (fallback !== 0) move(fallback, 0);
  }
}

function unlockAudio() {
  if (audio.ctx) {
    if (audio.ctx.state === "suspended") {
      audio.ctx.resume().then(updateMusicPlayback).catch(() => {});
    }
    startMusic();
    fileSfxPlayer.preloadAll();
    return;
  }
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  audio.ctx = new AudioContext();
  audio.master = audio.ctx.createGain();
  audio.musicGain = audio.ctx.createGain();
  audio.sfxGain = audio.ctx.createGain();
  applyAudioSettings();
  audio.musicGain.connect(audio.master);
  audio.sfxGain.connect(audio.master);
  audio.master.connect(audio.ctx.destination);
  startMusic();
  fileSfxPlayer.preloadAll();
  if (audio.ctx.state === "suspended") {
    audio.ctx.resume().then(updateMusicPlayback).catch(() => {});
  }
}

function applyAudioSettings() {
  if (!audio.master || !audio.musicGain || !audio.sfxGain) return;
  audio.master.gain.value = audio.muted ? 0 : audio.masterVolume * audio.outputBoost;
  audio.musicGain.gain.value = audio.musicVolume;
  audio.sfxGain.gain.value = audio.sfxVolume;
}

function startMusic() {
  if (!audio.ctx) return;
  if (!audio.musicTimer) {
    audio.step = 0;
    updateMusicPlayback();
    audio.musicTimer = window.setInterval(updateMusicPlayback, 250);
  }
  if (!audio.musicStepTimer) {
    audio.musicStepTimer = window.setInterval(playMusicStep, MUSIC_STEP_MS);
  }
}

function setupMusicLoopSources() {
  if (!audio.ctx || !audio.musicGain) return;
  for (const [key, element] of Object.entries(musicLoopAssets)) {
    if (!element || audio.musicLoopSources.has(key)) continue;
    try {
      const source = audio.ctx.createMediaElementSource(element);
      source.connect(audio.musicGain);
      element.loop = false;
      element.volume = 0;
      element.addEventListener("ended", () => handleMusicLoopEnded(key));
      audio.musicLoopSources.set(key, source);
    } catch (error) {
      console.warn(`[TST assets] Music loop source failed: ${key}`, error);
    }
  }
}

function getMusicPlaylistForStage(stage) {
  return MUSIC_PLAYLISTS[stage] || MUSIC_PLAYLISTS.late || [];
}

function getAudioAssetRecordForElement(element) {
  return ASSET_REGISTRY.audio.find((record) => record.element === element) || null;
}

function isMusicLoopAvailable(key) {
  const element = musicLoopAssets[key];
  if (!element) return false;
  const record = getAudioAssetRecordForElement(element);
  return !record || record.status !== "error";
}

function getAvailableMusicLoopKeys(stage) {
  return getMusicPlaylistForStage(stage).filter(isMusicLoopAvailable);
}

function pickNextMusicLoopKey(stage, previousKey = "") {
  const available = getAvailableMusicLoopKeys(stage);
  return pickNextBgmAssetKey(available, previousKey);
}

function warnMissingMusicPlaylistOnce(stage) {
  if (audio.musicFallbackWarned.has(stage)) return;
  audio.musicFallbackWarned.add(stage);
  console.warn(`[T-Spin Traveler] No available music loops for stage: ${stage}`);
}

function selectMusicLoopForStage(stage) {
  const available = getAvailableMusicLoopKeys(stage);
  if (!available.length) {
    audio.selectedMusicLoopKey = "";
    audio.currentMusicLoopKey = "";
    audio.musicPlaylistStage = stage;
    warnMissingMusicPlaylistOnce(stage);
    return "";
  }

  const currentInvalid = !available.includes(audio.selectedMusicLoopKey);
  if (currentInvalid) {
    const nextKey = pickNextMusicLoopKey(stage, audio.selectedMusicLoopKey || audio.currentMusicLoopKey);
    audio.selectedMusicLoopKey = nextKey;
  }
  audio.musicPlaylistStage = stage;
  return audio.selectedMusicLoopKey;
}

function handleMusicLoopEnded(key) {
  if (key !== audio.selectedMusicLoopKey) return;
  const endedElement = musicLoopAssets[key];
  if (endedElement) {
    endedElement.pause();
    endedElement.volume = 0;
  }
  const stage = audio.musicPlaylistStage || getCurrentMusicStage();
  audio.selectedMusicLoopKey = pickNextMusicLoopKey(stage, key);
  audio.currentMusicLoopKey = "";
  updateMusicPlayback();
}

function updateMusicPlayback() {
  if (!audio.ctx) return;
  const stage = getCurrentMusicStage();
  const danger = isDangerMusicActive();
  updateMusicLayers(stage, danger);
  maybeTriggerBossStinger(stage, audio.ctx.currentTime + 0.03);
  setupMusicLoopSources();

  const enabled = !audio.muted && audio.musicVolume > 0 && audio.masterVolume > 0;
  const targetKey = enabled ? selectMusicLoopForStage(stage) : "";
  for (const [key, element] of Object.entries(musicLoopAssets)) {
    if (!element) continue;
    if (!enabled) {
      element.volume = 0;
      if (!element.paused) element.pause();
      continue;
    }
    const isTarget = key === targetKey && isMusicLoopAvailable(key);
    const targetVolume = isTarget ? (stage === "boss" ? 0.84 : stage === "upgrade" ? 0.68 : 0.76) : 0;
    element.volume += (targetVolume - element.volume) * MUSIC_LOOP_FADE_SMOOTHING;
    if (targetVolume > 0.01 && element.paused) {
      playMusicLoopElement(key, element);
    }
    if (element.volume < 0.01 && targetVolume <= 0.01 && !element.paused) element.pause();
  }
  audio.currentMusicLoopKey = enabled ? targetKey : "";
  const now = performance.now();
  if (danger && enabled && now - audio.lastDangerMusicPulseAt > 2400) {
    audio.lastDangerMusicPulseAt = now;
    const t = audio.ctx.currentTime + 0.02;
    tone(92, 0.2, "sine", 0.08, audio.musicGain, t);
    filteredNoise(0.16, 0.035, "lowpass", 280, 0.8, audio.musicGain, t + 0.03);
  }
}

function playMusicLoopElement(key, element) {
  if (element.ended || (Number.isFinite(element.duration) && element.currentTime >= element.duration - 0.05)) {
    element.currentTime = 0;
  }
  const playPromise = element.play();
  if (!playPromise || typeof playPromise.then !== "function") return;
  playPromise
    .then(() => {
      audio.musicPlayBlockedWarned.delete(key);
    })
    .catch((error) => {
      if (!audio.musicPlayBlockedWarned.has(key)) {
        audio.musicPlayBlockedWarned.add(key);
        console.warn(`[T-Spin Traveler] Music loop playback blocked: ${key}`, error);
      }
    });
}

function hasAudibleMusicLoop() {
  if (!audio.currentMusicLoopKey || audio.muted || audio.masterVolume <= 0 || audio.musicVolume <= 0) return false;
  const element = musicLoopAssets[audio.currentMusicLoopKey];
  return Boolean(element && !element.paused && element.readyState > 0 && element.volume > 0.02);
}

function playMusicStep() {
  if (!audio.ctx || audio.muted) return;
  if (hasAudibleMusicLoop()) {
    audio.step += 1;
    return;
  }
  if (audio.musicVolume <= 0) {
    audio.step += 1;
    return;
  }
  const t = audio.ctx.currentTime + 0.025;
  const step = audio.step;
  const beat = step % 16;
  const phrase = step % 128;
  const bar = Math.floor(phrase / 16);
  const section =
    phrase < 32 ? "intro" :
    phrase < 64 ? "build" :
    phrase < 96 ? "climax" :
    "return";
  const stage = getCurrentMusicStage();
  const danger = isDangerMusicActive();
  updateMusicLayers(stage, danger);
  maybeTriggerBossStinger(stage, t);

  const profile = getMusicProfile();
  const motifStage = getDominantMusicStage();
  const bossLevel = audio.musicLayers.boss || 0;
  const dangerLevel = audio.musicLayers.danger || 0;
  const chain = state.combo >= 3 || state.b2bActive;
  const playing = state.mode === "playing";
  const dampedMode = state.mode === "paused" || state.pauseView === "settings" || state.settingsOpen;
  const activity = playing ? 1 : state.mode === "start" ? 0.84 : dampedMode ? 0.68 : 0.74;
  const sectionEnergy = section === "intro" ? 0.32 : section === "build" ? 0.56 : section === "climax" ? 0.82 : 0.48;
  audio.targetEnergy = clamp(profile.energy + (playing ? sectionEnergy * 0.16 : 0.02) + (chain ? 0.07 : 0) + dangerLevel * 0.08, 0, 1);
  audio.energy += (Math.min(1, audio.targetEnergy) - audio.energy) * 0.14;

  const energy = audio.energy;
  const root = MUSIC_ROOT * Math.pow(2, profile.rootOffset / 12);
  const stepSec = MUSIC_STEP_MS / 1000;
  const chord = getMusicChordPattern(motifStage)[bar % 8];
  const bassPattern = [0, 0, -12, 0, -5, -5, -12, -5, -2, -2, -12, -2, -7, -7, -12, -7];
  const motif = getMusicMotif(motifStage, section);
  const melodyDegree = motif[beat];
  const bassDegree = chord + bassPattern[beat];
  const bassNote = (root / 2) * Math.pow(2, bassDegree / 12);
  const drone = (root / 4) * Math.pow(2, chord / 12);
  const bellDegree = [12, 15, 19, 22, 24, 22, 19, 15, 17, 15, 12, 10, 12, 15, 19, 22][beat];

  const droneVol = (0.052 + energy * 0.034) * profile.drone * activity;
  const bassVol = (0.09 + energy * 0.058) * profile.bass * activity;
  const drumVol = (0.12 + energy * 0.085) * profile.drums * activity;
  const handVol = (0.052 + energy * 0.052) * profile.hand * activity;
  const clickVol = (0.034 + energy * 0.034) * profile.click * activity;
  const shakerVol = (0.02 + energy * 0.02) * profile.shaker * activity;
  const bellVol = (0.048 + energy * 0.038) * profile.bell * activity;
  const pluckVol = (section === "climax" ? 0.095 + energy * 0.056 : 0.07 + energy * 0.046) * profile.pluck * activity;
  const noiseVol = (0.025 + energy * 0.03) * profile.noise * activity;

  if (beat === 0 && droneVol > 0.004) tone(drone, stepSec * 12, "sine", droneVol, audio.musicGain, t);
  if (beat % 4 === 0 && bassVol > 0.004) tone(bassNote, stepSec * 3.6, "sine", bassVol, audio.musicGain, t);
  if ((beat % 8 === 0 || (profile.drums > 0.7 && beat % 4 === 0) || (section === "climax" && beat % 4 === 0)) && drumVol > 0.004) {
    deepDrum(82 + bossLevel * 20 + profile.rootOffset * -1.4, drumVol, t);
  }
  if (section !== "intro" && [3, 6, 10, 13].includes(beat) && handVol > 0.004) handDrum(handVol, t);
  if ((section === "build" || section === "climax" || profile.click > 0.45) && [2, 5, 7, 11, 14].includes(beat) && clickVol > 0.004) {
    woodClick(clickVol, t);
  }
  if ((section === "climax" || profile.shaker > 0.25) && beat % 2 === 1 && shakerVol > 0.003) shaker(shakerVol, t);
  if (section === "return" && [6, 14].includes(beat) && handVol > 0.004) handDrum(handVol * 0.78, t);
  if (profile.noise > 0.08 && [1, 9].includes(beat) && noiseVol > 0.003) {
    filteredNoise(0.12, noiseVol, "bandpass", motifStage === "late" ? 560 : 760, 1.5, audio.musicGain, t + 0.01);
  }

  if (melodyDegree !== null && (playing || beat % 4 === 0)) {
    const note = root * Math.pow(2, (melodyDegree + chord * 0.16) / 12);
    if (pluckVol > 0.004) pluck(note, pluckVol, t);
    if (section === "climax" && beat % 4 === 0 && pluckVol > 0.004) pluck(note * 2, pluckVol * 0.32, t + 0.02);
  }
  if ([4, 12].includes(beat) || (section === "climax" && [3, 7, 11, 15].includes(beat))) {
    const bell = root * Math.pow(2, (bellDegree + chord * 0.12) / 12);
    if (bellVol > 0.004) mysticBell(bell, bellVol, t + 0.012);
  }
  if (chain && beat % 4 === 2 && bellVol > 0.004) mysticBell(root * Math.pow(2, (24 + chord * 0.1) / 12), bellVol * 0.78, t + 0.03);
  if (bossLevel > 0.08 && beat % 8 === 0) {
    deepDrum(58, (0.11 + energy * 0.07) * bossLevel * activity, t + 0.035);
    filteredNoise(0.11, (0.035 + energy * 0.024) * bossLevel * activity, "lowpass", 420, 1.2, audio.musicGain, t + 0.02);
  }
  if (bossLevel > 0.2 && [6, 14].includes(beat)) {
    sweep(96, 220, 0.18, "sawtooth", 0.035 * bossLevel * activity, t, audio.musicGain);
  }
  if (dangerLevel > 0.05) {
    if (beat % 8 === 4) deepDrum(96, (0.07 + energy * 0.04) * dangerLevel * activity, t);
    if (beat === 12) filteredNoise(0.18, 0.032 * dangerLevel * activity, "lowpass", 280, 0.9, audio.musicGain, t);
    if (beat === 0) tone(root / 2 * Math.pow(2, -1 / 12), stepSec * 8, "sine", 0.035 * dangerLevel * activity, audio.musicGain, t + 0.018);
  }
  audio.step += 1;
}

function getMusicStageByWave(wave) {
  if (wave > 0 && wave % 10 === 0) return "boss";
  if (wave >= 15) return "late";
  if (wave >= 10) return "mid";
  return "early";
}

function getCurrentMusicStage() {
  if (state.mode === "start" || state.mode === "guide" || state.mode === "metaUpgrade" || state.mode === "victory" || state.mode === "defeat") return "menu";
  if (state.mode === "upgrade") return "upgrade";
  return getMusicStageByWave(state.wave || 1);
}

function isDangerMusicActive() {
  if (state.mode !== "playing" || state.playerHp <= 0 || isBattleCountdownActive()) return false;
  const hpRatio = state.playerMaxHp > 0 ? state.playerHp / state.playerMaxHp : 1;
  return hpRatio < LOW_HP_WARNING_RATIO || state.pendingGarbage >= 4;
}

function updateMusicLayers(stage, danger) {
  audio.musicStage = stage;
  for (const key of MUSIC_STAGE_KEYS) {
    const target = key === stage ? 1 : 0;
    audio.musicLayers[key] += (target - audio.musicLayers[key]) * MUSIC_LAYER_SMOOTHING;
  }
  audio.musicLayers.danger += ((danger ? 1 : 0) - audio.musicLayers.danger) * MUSIC_DANGER_SMOOTHING;
  for (const key of MUSIC_LAYER_KEYS) {
    audio.musicLayers[key] = clamp(audio.musicLayers[key], 0, 1);
  }
}

function getMusicProfile() {
  const profile = { energy: 0, drone: 0, bass: 0, drums: 0, hand: 0, click: 0, shaker: 0, bell: 0, pluck: 0, noise: 0, rootOffset: 0 };
  let total = 0;
  for (const key of MUSIC_STAGE_KEYS) {
    const level = audio.musicLayers[key] || 0;
    if (level <= 0.001) continue;
    const stage = MUSIC_STAGES[key];
    total += level;
    for (const prop of Object.keys(profile)) profile[prop] += stage[prop] * level;
  }
  if (total <= 0.001) return { ...MUSIC_STAGES.menu };
  for (const prop of Object.keys(profile)) profile[prop] /= total;
  return profile;
}

function getDominantMusicStage() {
  let best = "menu";
  let bestLevel = -1;
  for (const key of MUSIC_STAGE_KEYS) {
    const level = audio.musicLayers[key] || 0;
    if (level > bestLevel) {
      best = key;
      bestLevel = level;
    }
  }
  return best;
}

function getMusicChordPattern(stage) {
  return {
    menu: [0, -5, 3, -2, 0, -7, -5, 0],
    early: [0, -5, -2, -7, 3, -5, 5, 0],
    mid: [0, -7, -5, -2, -9, -5, 3, -7],
    late: [0, -1, -7, -6, -10, -5, -8, -1],
    boss: [0, -12, -7, -10, -1, -12, -5, -7],
    upgrade: [0, 3, -5, -2, 0, 7, 3, -5],
  }[stage] || [0, -5, -2, -7, 3, -5, 5, 0];
}

function getMusicMotif(stage, section) {
  const motifs = {
    menu: {
      intro: [0, null, null, 3, null, 7, null, null, 10, null, null, 7, null, 3, null, null],
      build: [0, null, 3, null, 7, null, 10, null, 12, null, 10, null, 7, null, 3, null],
      climax: [7, null, 10, null, 12, null, 15, null, 12, null, 10, null, 7, null, 3, null],
      return: [0, null, null, 3, null, 5, null, null, 7, null, 5, null, 3, null, null, null],
    },
    early: {
      intro: [0, null, 3, null, 5, 7, null, 10, 12, null, 10, 7, 5, null, 3, null],
      build: [12, null, 10, 7, 5, null, 7, 10, 12, 15, null, 12, 10, 7, 5, null],
      climax: [7, 10, 12, null, 15, 12, 10, 7, 5, 7, 10, null, 12, 10, 7, null],
      return: [0, null, 3, 5, null, 7, 10, null, 12, null, 10, 7, 5, null, 3, null],
    },
    mid: {
      intro: [0, null, 5, 7, null, 10, 12, null, 15, null, 12, 10, 7, null, 5, null],
      build: [12, 10, 7, null, 10, 12, 15, null, 17, 15, 12, null, 10, 7, 5, null],
      climax: [7, 10, 12, 15, null, 17, 15, 12, 10, 12, 15, null, 17, 15, 12, null],
      return: [0, null, 5, null, 7, 10, null, 12, 10, null, 7, 5, null, 3, null, null],
    },
    late: {
      intro: [0, null, 1, null, 7, null, 6, null, 10, null, 8, null, 7, null, 1, null],
      build: [12, null, 13, 10, null, 7, 8, null, 13, null, 12, 8, null, 7, 1, null],
      climax: [7, 8, 12, 13, null, 15, 13, 12, 8, 7, 8, null, 13, 12, 8, null],
      return: [0, null, 1, 7, null, 6, null, 1, 0, null, -1, null, 1, null, null, null],
    },
    boss: {
      intro: [0, null, -12, null, -7, null, -10, null, 0, null, -1, null, -7, null, -12, null],
      build: [0, -7, null, -12, 5, null, -1, -7, 0, null, -10, null, -5, -7, null, -12],
      climax: [0, -1, 0, 5, null, 7, 5, 0, -1, 0, 5, null, 7, 5, 0, null],
      return: [0, null, -7, null, -12, null, -10, null, -7, null, -5, null, -7, null, null, null],
    },
    upgrade: {
      intro: [0, null, 7, null, 12, null, 10, null, 7, null, 3, null, 5, null, null, null],
      build: [0, null, 7, 12, null, 15, null, 12, 10, null, 7, null, 5, null, 3, null],
      climax: [7, null, 12, null, 19, null, 15, null, 12, null, 10, null, 7, null, 5, null],
      return: [0, null, 5, null, 7, null, 3, null, 0, null, null, null, 3, null, null, null],
    },
  };
  return (motifs[stage] || motifs.early)[section] || motifs.early.intro;
}

function maybeTriggerBossStinger(stage, startTime) {
  if (stage !== "boss" || state.mode !== "playing" || isBattleCountdownActive()) return;
  if (!state.wave || audio.lastBossStingerWave === state.wave) return;
  audio.lastBossStingerWave = state.wave;
  playSfx("bossEnter");
  playBossStinger(startTime);
}

function playBossStinger(startTime = audio.ctx.currentTime) {
  if (!audio.ctx || audio.muted || audio.musicVolume <= 0) return;
  duckMusic(0.74, 0.72);
  deepDrum(52, 0.25, startTime);
  deepDrum(74, 0.18, startTime + 0.22);
  sweep(70, 520, 0.72, "sawtooth", 0.07, startTime + 0.05, audio.musicGain);
  sweep(620, 120, 0.64, "triangle", 0.055, startTime + 0.12, audio.musicGain);
  filteredNoise(0.5, 0.075, "bandpass", 620, 1.5, audio.musicGain, startTime + 0.06);
  arpeggio([73.42, 110, 146.83, 220], 0.078, "triangle", 0.078, audio.musicGain, startTime + 0.24);
}

function deepDrum(freq, volume, startTime = audio.ctx.currentTime) {
  sweep(freq, Math.max(38, freq * 0.42), 0.26, "sine", volume, startTime, audio.musicGain);
  filteredNoise(0.055, volume * 0.36, "lowpass", 260, 0.9, audio.musicGain, startTime + 0.006);
}

function handDrum(volume, startTime = audio.ctx.currentTime) {
  tone(164, 0.055, "sine", volume * 0.5, audio.musicGain, startTime);
  filteredNoise(0.07, volume, "bandpass", 620, 2.4, audio.musicGain, startTime + 0.004);
}

function woodClick(volume, startTime = audio.ctx.currentTime) {
  tone(880, 0.026, "triangle", volume * 0.6, audio.musicGain, startTime);
  filteredNoise(0.032, volume, "bandpass", 1450, 4.5, audio.musicGain, startTime);
}

function shaker(volume, startTime = audio.ctx.currentTime) {
  filteredNoise(0.045, volume, "highpass", 3200, 0.7, audio.musicGain, startTime);
}

function pluck(freq, volume, startTime = audio.ctx.currentTime) {
  tone(freq, 0.16, "triangle", volume, audio.musicGain, startTime);
  tone(freq * 2.01, 0.07, "sine", volume * 0.25, audio.musicGain, startTime + 0.008);
}

function mysticBell(freq, volume, startTime = audio.ctx.currentTime) {
  tone(freq, 0.34, "triangle", volume, audio.musicGain, startTime);
  tone(freq * 1.5, 0.22, "sine", volume * 0.45, audio.musicGain, startTime + 0.012);
}

function playSfx(name) {
  if (!audio.ctx || audio.muted) return;
  if (!shouldPlaySfx(name)) return;
  const t = audio.ctx.currentTime;
  if (fileSfxPlayer.play(name, { when: t })) return;
  const synthName = SFX_SYNTH_FALLBACK_ALIASES[name] || name;
  const out = beginSfxBus(synthName);
  audio.currentSfxBus = out;
  if (synthName === "start") {
    arpeggio([220, 293.66, 369.99, 440, 587.33], 0.04, "triangle", 0.16);
  } else if (synthName === "countdown") {
    tone(392, 0.075, "triangle", 0.13, out, t);
    tone(784, 0.055, "sine", 0.08, out, t + 0.012);
    filteredNoise(0.045, 0.035, "bandpass", 1800, 5, out, t);
  } else if (synthName === "countdownStart") {
    arpeggio([392, 587.33, 783.99, 1174.66], 0.035, "triangle", 0.18);
    sweep(240, 980, 0.18, "sawtooth", 0.1, t, out);
  } else if (synthName === "move") {
    tone(360, 0.024, "triangle", 0.04, out, t);
  } else if (synthName === "softDrop") {
    tone(260, 0.018, "triangle", 0.025, out, t);
    filteredNoise(0.012, 0.012, "highpass", 2100, 0.7, out, t + 0.004);
  } else if (synthName === "rotate") {
    tone(520, 0.034, "square", 0.06, out, t);
    tone(780, 0.024, "triangle", 0.032, out, t + 0.012);
  } else if (synthName === "rotateT") {
    arpeggio([392, 493.88, 739.99], 0.028, "triangle", 0.1, out, t);
  } else if (synthName === "drop") {
    sweep(190, 54, 0.1, "sawtooth", 0.18, t, out);
    noise(0.04, 0.11, out, t);
  } else if (synthName === "lock") {
    tone(128, 0.055, "sine", 0.08, out, t);
    filteredNoise(0.035, 0.035, "lowpass", 460, 0.9, out, t + 0.006);
  } else if (synthName === "hold") {
    arpeggio([330, 247, 392], 0.032, "sine", 0.09, out, t);
  } else if (synthName === "clear") {
    arpeggio([520, 659.25, 783.99], 0.03, "triangle", 0.095, out, t);
    filteredNoise(0.022, 0.026, "highpass", 1800, 2.4, out, t + 0.016);
  } else if (synthName === "doubleClear") {
    arpeggio([493.88, 659.25, 783.99, 987.77], 0.03, "triangle", 0.105, out, t);
    filteredNoise(0.028, 0.032, "highpass", 1950, 2.8, out, t + 0.02);
  } else if (synthName === "tripleClear") {
    arpeggio([493.88, 659.25, 783.99, 987.77, 1174.66], 0.03, "triangle", 0.115, out, t);
    sweep(760, 1180, 0.1, "triangle", 0.05, t + 0.035, out);
    filteredNoise(0.035, 0.04, "highpass", 2100, 2.4, out, t + 0.025);
  } else if (synthName === "bigClear") {
    arpeggio([392, 493.88, 659.25, 880, 1174.66], 0.036, "triangle", 0.15, out, t);
    sweep(920, 1320, 0.15, "square", 0.085, t + 0.03, out);
    noise(0.06, 0.08, out, t + 0.04);
  } else if (synthName === "b2b") {
    arpeggio([554.37, 739.99, 987.77, 1479.98], 0.033, "square", 0.135, out, t);
    tone(196, 0.16, "sawtooth", 0.08, out, t);
  } else if (synthName === "combo") {
    arpeggio([659.25, 783.99, 987.77, 1174.66], 0.028, "square", 0.105, out, t);
    sweep(620, 1440, 0.11, "triangle", 0.055, t + 0.026, out);
    filteredNoise(0.04, 0.055, "highpass", 2400, 1.2, out, t + 0.058);
  } else if (synthName === "cancel") {
    arpeggio([392, 523.25, 659.25, 783.99], 0.034, "sine", 0.105, out, t);
    sweep(720, 260, 0.11, "triangle", 0.064, t + 0.02, out);
  } else if (synthName === "perfect") {
    arpeggio([392, 523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98], 0.034, "triangle", 0.175, out, t);
    tone(130.81, 0.34, "sine", 0.12, out, t);
    sweep(420, 1680, 0.24, "sawtooth", 0.078, t + 0.045, out);
    filteredNoise(0.12, 0.085, "highpass", 1200, 0.8, out, t + 0.075);
  } else if (synthName === "hitLight") {
    tone(680, 0.038, "triangle", 0.078, out, t);
    filteredNoise(0.026, 0.042, "bandpass", 1100, 3.2, out, t + 0.008);
  } else if (synthName === "hitHeavy") {
    tone(110, 0.12, "sawtooth", 0.13, out, t);
    sweep(420, 1180, 0.13, "triangle", 0.105, t + 0.014, out);
    filteredNoise(0.064, 0.084, "bandpass", 740, 2.8, out, t + 0.02);
  } else if (synthName === "hitArcane") {
    arpeggio([392, 523.25, 783.99, 1046.5], 0.034, "triangle", 0.13, out, t);
    tone(98, 0.32, "sine", 0.13, out, t);
    filteredNoise(0.14, 0.105, "bandpass", 1400, 4, out, t + 0.04);
  } else if (synthName === "upgrade") {
    arpeggio([293.66, 369.99, 440, 587.33, 739.99], 0.052, "triangle", 0.13, out, t);
  } else if (synthName === "upgradeReady") {
    arpeggio([369.99, 440, 587.33], 0.042, "triangle", 0.095, out, t);
  } else if (synthName === "tspin") {
    arpeggio([493.88, 659.25, 987.77, 1318.51], 0.034, "square", 0.16, out, t);
    tone(164.81, 0.22, "sine", 0.09, out, t);
    sweep(220, 1260, 0.22, "sawtooth", 0.105, t + 0.032, out);
    sweep(1260, 360, 0.18, "triangle", 0.052, t + 0.095, out);
    filteredNoise(0.11, 0.075, "bandpass", 1500, 4.2, out, t + 0.072);
  } else if (synthName === "enemy") {
    sweep(220, 70, 0.24, "sawtooth", 0.18, t, out);
    noise(0.09, 0.12, out, t + 0.02);
  } else if (synthName === "weakness") {
    arpeggio([783.99, 987.77, 1174.66], 0.03, "triangle", 0.12, out, t);
    sweep(520, 1480, 0.13, "square", 0.08, t + 0.02);
  } else if (synthName === "shield") {
    tone(740, 0.06, "sine", 0.095, out, t);
    tone(1110, 0.045, "triangle", 0.052, out, t + 0.018);
    sweep(980, 520, 0.14, "triangle", 0.055, t + 0.02, out);
    filteredNoise(0.055, 0.035, "highpass", 2600, 1.4, out, t + 0.012);
  } else if (synthName === "enemyWarn") {
    tone(330, 0.07, "triangle", 0.09, out, t);
    tone(440, 0.055, "sine", 0.052, out, t + 0.09);
    filteredNoise(0.035, 0.026, "bandpass", 1200, 3.8, out, t + 0.012);
  } else if (synthName === "enemyWarnStrong") {
    tone(98, 0.16, "sine", 0.1, out, t);
    sweep(520, 180, 0.2, "sawtooth", 0.082, t + 0.012, out);
    tone(660, 0.065, "triangle", 0.07, out, t + 0.08);
    filteredNoise(0.075, 0.055, "bandpass", 760, 2.5, out, t + 0.035);
  } else if (synthName === "lowHp") {
    tone(92, 0.22, "sine", 0.1, out, t);
    tone(184, 0.075, "triangle", 0.042, out, t + 0.04);
    filteredNoise(0.08, 0.035, "lowpass", 360, 0.9, out, t + 0.01);
  } else if (synthName === "wave") {
    arpeggio([196, 246.94, 293.66, 392, 493.88, 587.33], 0.058, "triangle", 0.135, out, t);
    tone(98, 0.36, "sawtooth", 0.1, out, t);
  } else if (synthName === "defeat") {
    arpeggio([220, 174.61, 146.83, 110, 73.42], 0.11, "sine", 0.145, out, t);
    noise(0.18, 0.08, out, t + 0.08);
  }
  audio.currentSfxBus = null;
}

function shouldPlaySfx(name) {
  if (audio.sfxVolume <= 0 || audio.masterVolume <= 0) return false;
  const now = performance.now();
  audio.activeSfx = audio.activeSfx.filter((voice) => voice.until > now);
  const cooldown = SFX_COOLDOWNS[name] || 0;
  const lastPlayed = audio.sfxCooldowns.get(name) || 0;
  if (cooldown > 0 && now - lastPlayed < cooldown) return false;
  const priority = SFX_PRIORITY[name] || 2;
  if (audio.activeSfx.length >= audio.maxSfxVoices && priority < 4) return false;
  audio.sfxCooldowns.set(name, now);
  audio.activeSfx.push({ name, until: now + (SFX_DURATIONS[name] || 180), priority });
  return true;
}

function beginSfxBus(name) {
  const gain = audio.ctx.createGain();
  gain.gain.value = SFX_MIX[name] ?? 1;
  gain.connect(audio.sfxGain);
  return gain;
}

function getSfxDestination() {
  return audio.currentSfxBus || audio.sfxGain;
}

function tone(freq, duration, type, volume, destination, startTime = audio.ctx.currentTime) {
  const osc = audio.ctx.createOscillator();
  const gain = audio.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

function sweep(from, to, duration, type, volume, startTime = audio.ctx.currentTime, destination = getSfxDestination()) {
  const osc = audio.ctx.createOscillator();
  const gain = audio.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, startTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), startTime + duration);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

function arpeggio(notes, gap, type, volume = 0.18, destination = getSfxDestination(), startTime = audio.ctx.currentTime) {
  notes.forEach((note, i) => {
    tone(note, gap * 1.8, type, volume, destination, startTime + i * gap);
  });
}

function noise(duration, volume, destination = getSfxDestination(), startTime = audio.ctx.currentTime) {
  const sampleRate = audio.ctx.sampleRate;
  const buffer = audio.ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const source = audio.ctx.createBufferSource();
  const gain = audio.ctx.createGain();
  source.buffer = buffer;
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  source.connect(gain);
  gain.connect(destination);
  source.start(startTime);
}

function filteredNoise(duration, volume, filterType, frequency, q = 1, destination = getSfxDestination(), startTime = audio.ctx.currentTime) {
  const sampleRate = audio.ctx.sampleRate;
  const buffer = audio.ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    const decay = 1 - i / data.length;
    data[i] = (Math.random() * 2 - 1) * decay * decay;
  }
  const source = audio.ctx.createBufferSource();
  const filter = audio.ctx.createBiquadFilter();
  const gain = audio.ctx.createGain();
  source.buffer = buffer;
  filter.type = filterType;
  filter.frequency.setValueAtTime(frequency, startTime);
  filter.Q.setValueAtTime(q, startTime);
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start(startTime);
}

function toggleMute() {
  unlockAudio();
  audio.muted = !audio.muted;
  applyAudioSettings();
  saveGame();
}

function syncControlHints() {
  document.documentElement.lang = state.language === "zh" ? "zh-Hant" : "en";
  document.title = t("startTitle");
  const shell = document.querySelector(".shell");
  if (shell) shell.setAttribute("aria-label", t("ariaPrototype"));
  const note = document.querySelector(".screen-note");
  if (!note) return;
  const hints = UI_LAYOUT.compactHints.map((key) => t(key));
  const makeHint = (text, className, id = "") => {
    const span = document.createElement("span");
    if (id) span.id = id;
    span.className = className;
    span.textContent = text;
    return span;
  };
  note.replaceChildren(
    ...hints.map((hint, index) => {
      const hintType = index >= hints.length - 2 ? "utility-hint" : "play-hint";
      return makeHint(hint, hintType, `hint-${index}`);
    }),
  );
  updateScreenNoteMode();
}

function updateScreenNoteMode() {
  const note = document.querySelector(".screen-note");
  if (!note) return;
  const showPlayHints = state.mode === "playing";
  const showReferenceHints = state.mode === "paused" || state.settingsOpen || state.mode === "guide";
  const showHints = showPlayHints || showReferenceHints;
  const faded = showPlayHints
    && !isBattleCountdownActive()
    && !state.tutorial
    && performance.now() > (state.controlHintsFullUntil || 0);
  note.classList.toggle("menu", !showHints);
  note.classList.toggle("compact", showHints);
  note.classList.toggle("countdown", showPlayHints && isBattleCountdownActive());
  note.classList.toggle("faded", faded);
}

function previewSfx() {
  if (!audio.ctx || audio.muted) return;
  const t = audio.ctx.currentTime;
  tone(660, 0.05, "triangle", 0.24, audio.sfxGain, t);
}

function tickEffects(dt) {
  processPendingHits();
  state.shake = Math.max(0, state.shake - dt * 0.04);
  state.enemyHit = Math.max(0, state.enemyHit - dt);
  state.enemyHitIntensity = Math.max(0, state.enemyHitIntensity - dt * 0.0032);
  state.enemyHpDisplay = animateNumber(state.enemyHpDisplay, state.enemyHp, dt, 125);
  state.enemyHpTrail = animateNumber(state.enemyHpTrail, state.enemyHp, dt, 520);
  state.playerHit = Math.max(0, state.playerHit - dt);
  state.b2bBrokenFlash = Math.max(0, state.b2bBrokenFlash - dt);
  state.lineFlash = state.lineFlash
    .map((flash) => ({ ...flash, life: flash.life - dt }))
    .filter((flash) => flash.life > 0);
  state.floaters = state.floaters
    .map((f) => ({ ...f, y: f.y - dt * 0.035, life: f.life - dt }))
    .filter((f) => f.life > 0);
  state.operationReadouts = state.operationReadouts
    .map((readout) => ({ ...readout, life: readout.life - dt }))
    .filter((readout) => readout.life > 0);
  state.combatPopups = state.combatPopups
    .map((popup) => ({ ...popup, life: popup.life - dt }))
    .filter((popup) => popup.life > 0);
  if (state.bossPhaseBanner) {
    state.bossPhaseBanner.life -= dt;
    if (state.bossPhaseBanner.life <= 0) state.bossPhaseBanner = null;
  }
  if (state.bossWindup) {
    state.bossWindup.life -= dt;
    if (state.bossWindup.life <= 0) state.bossWindup = null;
  }
  if (
    state.enemyDeathVfx
    && performance.now() - state.enemyDeathVfx.startedAt >= state.enemyDeathVfx.duration
  ) {
    state.enemyDeathVfx = null;
  }
  state.attacks = state.attacks
    .map((a) => ({ ...a, life: a.life - dt }))
    .filter((a) => a.life > 0);
  if (state.perfectClearFx && performance.now() - state.perfectClearFx.startedAt >= state.perfectClearFx.duration) {
    state.perfectClearFx = null;
  }
  state.bursts = state.bursts
    .map((b) => ({ ...b, radius: b.radius + dt * 0.42 * b.intensity, life: b.life - dt }))
    .filter((b) => b.life > 0);
  state.particles = state.particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + (p.gravity ?? 0.08),
      rotation: (p.rotation || 0) + (p.spin || 0),
      life: p.life - dt,
    }))
    .filter((p) => p.life > 0);
}

function draw() {
  state.debug.lastDrawAt = performance.now();
  resetCanvasFrame(ctx, W, H);
  ctx.save();
  try {
    const jitter = state.shake ? Math.sin(performance.now() * 0.06) * state.shake : 0;
    ctx.translate(jitter, 0);
    drawBackground();
    drawPanels();
    drawPlayer();
    drawTraitList();
    drawEnemy();
    drawBoard();
    drawSidePieces();
    drawAttackEffects();
    drawBursts();
    drawParticles();
    drawFloaters();
    drawCombatPopups();
    drawBossPhaseWarning();
    drawBattleCountdown();
    drawFirstWaveCombatHint();
    drawTutorialPrompt();
    drawPerfectClearFx();
    drawOverlay();
    if (!["start", "guide", "upgrade", "metaUpgrade", "victory", "defeat"].includes(state.mode)) drawSettings();
  } finally {
    ctx.restore();
    resetCanvasTransform(ctx);
  }
}

function activeHasCellAboveHiddenRows() {
  if (!state.active) return false;
  for (let r = 0; r < state.active.shape.length; r += 1) {
    for (let c = 0; c < state.active.shape[r].length; c += 1) {
      if (state.active.shape[r][c] && state.active.y + r < HIDDEN) return true;
    }
  }
  return false;
}

function activeHasCellAboveTopBuffer() {
  return isPieceAboveTopBuffer(state.active);
}

function canActiveMoveDownForDebug() {
  if (!state.active) return false;
  return !collides(state.active, state.active.x, state.active.y + 1, state.active.shape);
}

function getActiveDebugKey() {
  if (!state.active) return "";
  return `${state.active.type}:${state.active.x}:${state.active.y}:${state.active.shape.map((row) => row.join("")).join("/")}`;
}

function getActiveCellMinYForDebug() {
  if (!state.active) return "";
  let minY = Infinity;
  for (let r = 0; r < state.active.shape.length; r += 1) {
    for (let c = 0; c < state.active.shape[r].length; c += 1) {
      if (state.active.shape[r][c]) minY = Math.min(minY, state.active.y + r);
    }
  }
  return Number.isFinite(minY) ? minY : "";
}

function getDebugHudReaders(now = performance.now()) {
  const active = state.active;
  return {
    mode: () => state.mode,
    runFinalized: () => state.runFinalized,
    playerHp: () => state.playerHp,
    active: () => Boolean(active),
    activeType: () => active?.type || "",
    activeX: () => active?.x ?? "",
    activeY: () => active?.y ?? "",
    activeMinCellY: getActiveCellMinYForDebug,
    activeAboveHidden: activeHasCellAboveHiddenRows,
    activeAboveTopBuffer: activeHasCellAboveTopBuffer,
    activeCanMoveDown: canActiveMoveDownForDebug,
    activeOverlapsBoard: isActivePieceOverlappingBoard,
    lockTimer: () => state.lockTimer === null ? "null" : Math.round(now - state.lockTimer),
    dropTimer: () => Math.round(state.dropTimer || 0),
    countdownMs: () => Math.round(state.countdownMs || 0),
    hitStopMs: () => Math.round(state.hitStopMs || 0),
    pendingHitsLength: () => state.pendingHits.length,
    upgradeChoiceOpen: () => state.mode === "upgrade" || state.upgradeChoices.length > 0,
    pauseOpen: () => state.mode === "paused",
    hiddenRow0: () => getHiddenRowsDebugInfo().rows[0] || false,
    hiddenRow1: () => getHiddenRowsDebugInfo().rows[1] || false,
    spawnFootprintBlocked: isSpawnBlockedForDefeat,
    assetLoading: () => getAssetLoadingSummary().loading,
    assetLoaded: () => getAssetLoadingSummary().loaded,
    assetError: () => getAssetLoadingSummary().error,
    assetTotal: () => getAssetLoadingSummary().total,
    assetAge: () => `${Math.round(now - state.assetLoadingStartedAt)}ms`,
    servedTopBuffer: () => HIDDEN === 5,
    activeDebugKey: getActiveDebugKey,
    activeBlockedDown: () => state.mode === "playing" && Boolean(state.active) && !canActiveMoveDownForDebug(),
  };
}

function drawBackground() {
  const stage = getBackgroundForWave(state.wave || 1);
  const image = getStageBackgroundImage(stage);
  if (image) {
    const usingFallback = image !== stage.image;
    drawImageCoverRaw(image, 0, 0, W, H);
    drawBackgroundTreatment(stage, usingFallback);
    return;
  }

  drawProceduralBackground();
}

function getBackgroundForWave(wave) {
  const enemyCycleLength = Math.max(1, getStandardEnemyPool().length * NORMAL_ENEMY_CYCLES_BEFORE_BOSS + 1);
  if (wave > 0 && (wave - 1) % enemyCycleLength === enemyCycleLength - 1) return BOSS_BACKGROUND_STAGE;
  if (!BACKGROUND_STAGES.length) return BOSS_BACKGROUND_STAGE;
  return BACKGROUND_STAGES[Math.max(0, wave - 1) % BACKGROUND_STAGES.length];
}

function getStageBackgroundImage(stage) {
  if (isImageReady(stage.image)) return stage.image;
  if (isImageReady(stage.fallback)) return stage.fallback;
  return null;
}

function drawBackgroundTreatment(stage, usingFallback) {
  ctx.save();
  if (stage.tint) {
    ctx.fillStyle = stage.tint;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.fillStyle = `rgba(4, 7, 12, ${usingFallback ? 0.72 : stage.dim})`;
  ctx.fillRect(0, 0, W, H);
  if (stage.centerDim && !usingFallback) drawCenterBackgroundShade(stage.centerDim);
  drawVignette(stage.vignette);
  ctx.restore();
}

function drawCenterBackgroundShade(alpha) {
  const g = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, 460);
  g.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
  g.addColorStop(0.52, `rgba(0, 0, 0, ${alpha * 0.38})`);
  g.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawProceduralBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#101326");
  g.addColorStop(0.46, "#12172a");
  g.addColorStop(1, "#07090f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  drawStarMapBackdrop();
  drawAncientObelisk(96, 112, 260, 0.42);
  drawAncientObelisk(1098, 96, 310, 0.52);
  drawAncientColumn(288, 170, 236, 0.34);
  drawAncientColumn(915, 154, 258, 0.4);

  ctx.fillStyle = "#0a0d15";
  ctx.beginPath();
  ctx.moveTo(0, 613);
  ctx.bezierCurveTo(240, 570, 420, 642, 660, 590);
  ctx.bezierCurveTo(900, 540, 1090, 602, 1280, 566);
  ctx.lineTo(1280, 720);
  ctx.lineTo(0, 720);
  ctx.closePath();
  ctx.fill();

  drawAncientRiftRunes();
  drawVignette();
}

function drawStarMapBackdrop() {
  ctx.save();
  ctx.strokeStyle = "rgba(120, 150, 255, 0.14)";
  ctx.fillStyle = "rgba(185, 210, 255, 0.28)";
  ctx.lineWidth = 1;
  const points = [
    [182, 126], [302, 86], [456, 154], [620, 106], [768, 164],
    [928, 112], [1098, 152], [1190, 92],
  ];
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  for (const [x, y] of points) {
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawAncientObelisk(x, y, h, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const w = h * 0.22;
  ctx.fillStyle = "#171323";
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w, y + h * 0.16);
  ctx.lineTo(x + w * 0.78, y + h);
  ctx.lineTo(x + w * 0.22, y + h);
  ctx.lineTo(x, y + h * 0.16);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(155, 132, 255, 0.26)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = "rgba(104, 218, 255, 0.24)";
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y + h * 0.2);
  ctx.lineTo(x + w * 0.5, y + h * 0.82);
  ctx.stroke();
  ctx.restore();
}

function drawAncientColumn(x, y, h, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const w = h * 0.18;
  ctx.fillStyle = "#141826";
  roundedRect(x, y, w, h, 10, true, false);
  ctx.strokeStyle = "rgba(184, 160, 112, 0.22)";
  ctx.lineWidth = 2;
  roundedRect(x, y, w, h, 10, false, true);
  ctx.fillStyle = "rgba(115, 96, 210, 0.16)";
  ctx.fillRect(x + w * 0.22, y + h * 0.18, w * 0.56, h * 0.64);
  ctx.restore();
}

function drawAncientRiftRunes() {
  ctx.save();
  ctx.translate(176, 520);
  ctx.fillStyle = "#28302f";
  roundedRect(-38, -86, 76, 110, 14, true, false);
  ctx.strokeStyle = "rgba(145, 160, 190, 0.28)";
  ctx.lineWidth = 3;
  ctx.strokeRect(-20, -64, 40, 58);
  ctx.fillStyle = "rgba(131, 146, 255, 0.52)";
  ctx.fillRect(-14, -42, 28, 4);
  ctx.fillRect(-3, -56, 6, 38);
  ctx.restore();
}

function drawVignette(strength = 0.78) {
  const g = ctx.createRadialGradient(W / 2, H / 2, 180, W / 2, H / 2, 720);
  g.addColorStop(0, "rgba(0, 0, 0, 0)");
  g.addColorStop(0.58, `rgba(0, 0, 0, ${strength * 0.2})`);
  g.addColorStop(1, `rgba(0, 0, 0, ${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawPanels() {
  drawTitle();
  const player = UI_LAYOUT.playerPanel;
  const enemy = UI_LAYOUT.enemyPanel;
  const board = UI_LAYOUT.boardFrame;
  drawBoardFocusAura(board);
  drawHudPanel(player.x, player.y, player.w, player.h, t("ally").toUpperCase(), "NOA");
  drawHudPanel(enemy.x, enemy.y, enemy.w, enemy.h, t("enemy").toUpperCase(), enemyName(state.enemyType));
  drawBoardFrame(board.x, board.y, board.w, board.h);
  drawTopQuestBar();
}

function drawTitle() {
  ctx.save();
  ctx.font = canvasFont("900", 28, t("startTitle"), true);
  ctx.shadowColor = "rgba(175, 112, 255, 0.38)";
  ctx.shadowBlur = 14;
  const g = ctx.createLinearGradient(48, 20, 318, 48);
  g.addColorStop(0, "#f9f5e6");
  g.addColorStop(0.45, "#ffe0a3");
  g.addColorStop(1, "#c7a7ff");
  ctx.fillStyle = g;
  ctx.fillText(t("startTitle"), 48, 40);
  ctx.font = canvasFont("700", 13, t("navigationCore"));
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(230, 244, 255, 0.5)";
  ctx.fillText(t("navigationCore"), 50, 58);
  ctx.restore();
}

function drawBoardFocusAura(board) {
  ctx.save();
  const cx = board.x + board.w / 2;
  const cy = board.y + board.h / 2;
  const halo = ctx.createRadialGradient(cx, cy, 160, cx, cy, 390);
  halo.addColorStop(0, "rgba(105, 96, 255, 0.16)");
  halo.addColorStop(0.48, "rgba(99, 217, 255, 0.055)");
  halo.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = halo;
  ctx.fillRect(board.x - 180, board.y - 60, board.w + 360, board.h + 120);
  const sideGlow = ctx.createLinearGradient(board.x - 20, board.y, board.x + board.w + 20, board.y);
  sideGlow.addColorStop(0, "rgba(126, 231, 255, 0)");
  sideGlow.addColorStop(0.48, "rgba(159, 128, 255, 0.16)");
  sideGlow.addColorStop(1, "rgba(126, 231, 255, 0)");
  ctx.fillStyle = sideGlow;
  roundedRect(board.x - 16, board.y - 18, board.w + 32, board.h + 36, 16, true, false);
  ctx.restore();
}

function drawCard(x, y, w, h) {
  ctx.save();
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, OVERLAY_READABILITY.panel.top);
  g.addColorStop(0.52, OVERLAY_READABILITY.panel.middle);
  g.addColorStop(1, OVERLAY_READABILITY.panel.bottom);
  ctx.fillStyle = g;
  ctx.shadowColor = "rgba(126, 231, 255, 0.06)";
  ctx.shadowBlur = 10;
  ctx.strokeStyle = "rgba(214, 159, 86, 0.22)";
  ctx.lineWidth = 1.5;
  roundedRect(x, y, w, h, 8, true, true);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(139, 102, 255, 0.1)";
  ctx.lineWidth = 1.5;
  roundedRect(x + 5, y + 5, w - 10, h - 10, 5, false, true);
  ctx.strokeStyle = "rgba(255, 210, 128, 0.2)";
  ctx.lineWidth = 1.5;
  for (const [sx, sy, dx, dy] of [
    [x + 18, y + 18, 24, 0],
    [x + 18, y + 18, 0, 24],
    [x + w - 18, y + 18, -24, 0],
    [x + w - 18, y + 18, 0, 24],
    [x + 18, y + h - 18, 24, 0],
    [x + 18, y + h - 18, 0, -24],
    [x + w - 18, y + h - 18, -24, 0],
    [x + w - 18, y + h - 18, 0, -24],
  ]) {
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + dx, sy + dy);
    ctx.stroke();
  }
  const scan = ctx.createLinearGradient(x, y, x + w, y);
  scan.addColorStop(0, "rgba(255,255,255,0)");
  scan.addColorStop(0.5, "rgba(255,255,255,0.035)");
  scan.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = scan;
  ctx.fillRect(x + 10, y + 10, w - 20, 1);
  ctx.fillStyle = OVERLAY_READABILITY.panel.scanline;
  for (let yy = y + 22; yy < y + h - 16; yy += 26) ctx.fillRect(x + 12, yy, w - 24, 1);
  ctx.restore();
}

function drawHudPanel(x, y, w, h, tag, name) {
  const isAlly = name === "NOA";
  const accent = isAlly ? "#7ee7ff" : "#ffb95f";
  ctx.save();
  const bg = ctx.createLinearGradient(x, y, x, y + h);
  bg.addColorStop(0, "rgba(4, 8, 15, 0.72)");
  bg.addColorStop(0.58, "rgba(5, 8, 13, 0.46)");
  bg.addColorStop(1, "rgba(11, 7, 18, 0.58)");
  ctx.fillStyle = bg;
  ctx.shadowColor = hexToRgba(accent, 0.1);
  ctx.shadowBlur = 18;
  roundedRect(x, y, w, h, 18, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = hexToRgba(accent, 0.32);
  ctx.lineWidth = 1.4;
  roundedRect(x, y, w, h, 18, false, true);
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  roundedRect(x + 7, y + 7, w - 14, h - 14, 13, false, true);

  ctx.fillStyle = "rgba(3, 6, 12, 0.62)";
  roundedRect(x + 18, y + 18, w - 36, 54, 12, true, false);
  ctx.strokeStyle = hexToRgba(accent, 0.26);
  roundedRect(x + 18, y + 18, w - 36, 54, 12, false, true);
  ctx.font = canvasFont("800", 12, tag, true);
  ctx.fillStyle = hexToRgba(accent, 0.76);
  ctx.fillText(tag, x + 34, y + 39);
  ctx.shadowColor = hexToRgba(accent, 0.26);
  ctx.shadowBlur = 10;
  fitLabel(name, x + 34, y + 63, w - 90, 24, "#f3f2ea", 16, "900");
  ctx.shadowBlur = 0;
  drawCornerGlyph(x + w - 42, y + 35, accent);
  ctx.restore();
}

function drawBoardFrame(x, y, w, h) {
  ctx.save();
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, "rgba(12, 18, 31, 0.96)");
  g.addColorStop(0.52, "rgba(3, 6, 12, 0.98)");
  g.addColorStop(1, "rgba(20, 12, 34, 0.94)");
  ctx.fillStyle = g;
  ctx.shadowColor = "rgba(126, 101, 255, 0.52)";
  ctx.shadowBlur = 32;
  roundedRect(x, y, w, h, 14, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(239, 229, 202, 0.78)";
  ctx.lineWidth = 2.8;
  roundedRect(x, y, w, h, 14, false, true);
  ctx.strokeStyle = "rgba(138, 108, 255, 0.48)";
  ctx.lineWidth = 7;
  roundedRect(x + 5, y + 5, w - 10, h - 10, 10, false, true);
  ctx.strokeStyle = "rgba(126, 231, 255, 0.24)";
  ctx.lineWidth = 1;
  roundedRect(x + 12, y + 12, w - 24, h - 24, 3, false, true);
  const gemX = x + w / 2;
  const gemY = y - 2;
  ctx.fillStyle = "rgba(12, 18, 31, 0.88)";
  roundedRect(gemX - 34, gemY - 10, 68, 18, 9, true, false);
  drawCornerGlyph(gemX, gemY - 1, "#b99cff");
  ctx.restore();
}

function drawTopQuestBar() {
  if (state.runMode === "ascension" && state.ascensionRun) {
    drawAscensionChallengeHud();
    return;
  }
  ctx.save();
  ctx.fillStyle = "rgba(4, 7, 14, 0.8)";
  roundedRect(404, 10, 472, 38, 10, true, false);
  ctx.strokeStyle = "rgba(255, 210, 128, 0.28)";
  ctx.lineWidth = 1.5;
  roundedRect(404, 10, 472, 38, 10, false, true);
  ctx.font = canvasFont("800", 15, t("topQuest").toUpperCase(), true);
  ctx.fillStyle = "#d7c2ff";
  ctx.fillText(t("topQuest").toUpperCase(), 450, 30);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(238,244,252,0.58)";
  ctx.font = canvasFont("800", 15, `${t("waveLabel")} ${state.wave}`);
  ctx.fillText(`${t("waveLabel")} ${state.wave}`, 850, 30);
  ctx.fillStyle = "#ffb95f";
  ctx.beginPath();
  ctx.arc(427, 29, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTraitList() {
  if (state.mode !== "playing" && state.mode !== "paused") return;
  const traits = getTraitEntries().filter((trait) => trait.count > 0).slice(0, 6);
  if (!traits.length) return;
  const x = 20;
  const y = 292;
  const w = 132;
  const rowH = 24;
  const h = 27 + traits.length * rowH + 8;
  ctx.save();
  ctx.fillStyle = "rgba(4, 7, 14, 0.38)";
  roundedRect(x, y, w, h, 9, true, false);
  ctx.strokeStyle = "rgba(126, 231, 255, 0.16)";
  ctx.lineWidth = 1;
  roundedRect(x, y, w, h, 9, false, true);
  label(t("traitListTitle").toUpperCase(), x + 10, y + 19, 10, "rgba(143, 232, 220, 0.74)");
  for (let i = 0; i < traits.length; i += 1) {
    const trait = traits[i];
    const yy = y + 27 + i * rowH;
    drawTraitListRow(trait, x + 8, yy, w - 16, rowH - 4);
  }
  ctx.restore();
}

function drawTraitListRow(trait, x, y, w, h) {
  const active = trait.stage > 0;
  const color = trait.isFull ? "#fff0a6" : trait.stage >= 2 ? "#d7c2ff" : trait.color;
  ctx.save();
  ctx.fillStyle = active ? hexToRgba(color, 0.14) : "rgba(8, 13, 20, 0.34)";
  roundedRect(x, y, w, h, 6, true, false);
  ctx.strokeStyle = active ? hexToRgba(color, 0.5 + trait.stage * 0.09) : "rgba(238,244,252,0.09)";
  ctx.lineWidth = active ? 1.2 : 1;
  roundedRect(x, y, w, h, 6, false, true);
  ctx.fillStyle = hexToRgba(color, active ? 0.24 : 0.08);
  roundedRect(x + 4, y + 3, 16, h - 6, 5, true, false);
  ctx.textAlign = "center";
  ctx.font = canvasFont("900", 10, trait.def.icon, true);
  ctx.fillStyle = active ? color : "rgba(238,244,252,0.44)";
  ctx.fillText(trait.def.icon, x + 12, y + 14);
  ctx.textAlign = "left";
  fitLabel(getTraitHudLabelForPanel(trait, { translate: t }), x + 26, y + 14, 48, 10, active ? "#f5f1e6" : "rgba(238,244,252,0.48)", 8, "800", true);
  ctx.textAlign = "right";
  fitLabel(getTraitProgressStatusTextForPanel(trait, { format: fmt, getFullCount: getTraitFullCount }), x + w - 56, y + 14, 52, 10, active ? color : "rgba(238,244,252,0.44)", 7, "900", true);
  if (active) {
    ctx.fillStyle = color;
    ctx.globalAlpha = trait.isFull ? 0.9 : 0.64;
    ctx.fillRect(x + w - 26, y + h - 4, Math.min(20, 6 + trait.stage * 5), 2);
  }
  ctx.restore();
}

function getRelicProgressInfo() {
  const tierStep = state.upgradeTier > 0
    ? BALANCE.upgradeGrowthPerTier * state.upgradeTier
    : state.nextUpgradeAt;
  const previousTarget = Math.max(0, state.nextUpgradeAt - tierStep);
  const target = Math.max(1, state.nextUpgradeAt - previousTarget);
  const current = clamp(state.upgradeMeter - previousTarget, 0, target);
  const ready = state.upgradeReady || state.upgradeMeter >= state.nextUpgradeAt;
  return {
    current,
    target,
    ready,
    ratio: ready ? 1 : clamp(current / target, 0, 1),
  };
}

function getRelicProgressText(progress) {
  return progress.ready
    ? t("relicDraftReady")
    : `${t("relicProgress")} ${Math.floor(progress.current)} / ${progress.target}`;
}

function drawRelicProgressBar(x, y, w, h, progress, showText = true) {
  const glow = progress.ready || progress.ratio >= 0.75;
  const text = getRelicProgressText(progress);
  ctx.save();
  ctx.fillStyle = "rgba(4, 9, 18, 0.72)";
  roundedRect(x, y, w, h, h / 2, true, false);
  const fill = ctx.createLinearGradient(x, y, x + w, y);
  fill.addColorStop(0, "#7ef7ff");
  fill.addColorStop(0.55, "#b690ff");
  fill.addColorStop(1, glow ? "#fff0a6" : "#d7c2ff");
  ctx.fillStyle = fill;
  if (glow) {
    ctx.shadowColor = progress.ready ? "#fff0a6" : "#b690ff";
    ctx.shadowBlur = progress.ready ? 16 : 9;
  }
  roundedRect(x, y, Math.max(h, w * progress.ratio), h, h / 2, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = glow ? "rgba(255, 240, 166, 0.54)" : "rgba(126, 231, 255, 0.28)";
  roundedRect(x, y, w, h, h / 2, false, true);
  if (showText) {
    ctx.textAlign = "left";
    fitLabel(text, x, y + 14, w, 11, glow ? "#fff0a6" : "rgba(238,244,252,0.7)", 9, "800");
  }
  ctx.restore();
}

function drawCornerGlyph(x, y, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(11, 0);
  ctx.lineTo(0, 12);
  ctx.lineTo(-11, 0);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function getBaselineAnchorY(groundY, localBaselineY, scale = 1) {
  return groundY - localBaselineY * scale;
}

function scaleAroundBaseline(scaleX, scaleY, localBaselineY) {
  ctx.translate(0, localBaselineY);
  ctx.scale(scaleX, scaleY);
  ctx.translate(0, -localBaselineY);
}

function scaleDrawBoxFromBottom(draw, scale = 1) {
  if (scale === 1) return { ...draw };
  const centerX = draw.x + draw.w / 2;
  const bottomY = draw.y + draw.h;
  const w = draw.w * scale;
  const h = draw.h * scale;
  return {
    x: centerX - w / 2,
    y: bottomY - h,
    w,
    h,
  };
}

function alignDrawBoxToBaseline(draw, localBaselineY, options = {}) {
  const scaled = scaleDrawBoxFromBottom(draw, options.scale || 1);
  return {
    ...scaled,
    y: localBaselineY + (options.bottomOffset || 0) - scaled.h,
  };
}

function drawPlayer() {
  const hit = state.playerHit > 0;
  const playerAttack = state.attacks.find((attack) => attack.type === "player");
  const panel = UI_LAYOUT.playerPanel;
  const stage = UI_LAYOUT.playerStage;
  const pad = UI_LAYOUT.panelPadding;
  const left = panel.x + pad;
  const innerW = panel.w - pad * 2;
  drawHpBar(left, panel.y + 84, innerW, 20, state.playerHp, state.playerMaxHp, hit ? "#ff7782" : "#76d4ff", t("hp"));
  drawGuardMeter(left, panel.y + 122, innerW);
  ctx.save();
  const pose = CHARACTER_BASELINES.player;
  const artTuning = getDebugArtTuning({ enabled: DEBUG_HUD_ENABLED });
  const playerScale = pose.scale * artTuning.playerScale;
  const centerX = stage.x + stage.w / 2 + pose.centerOffsetX;
  const anchorY = getBaselineAnchorY(pose.groundY, pose.localY, playerScale);
  drawStageGlow(centerX, pose.groundY, pose.glowRadius, "#6de8ff");
  drawPresentationSigil(centerX, pose.groundY + pose.sigilYOffset, pose.sigilRadius, "#6de8ff");
  ctx.translate(centerX, anchorY);
  ctx.scale(playerScale, playerScale);
  drawCharacterShadow(0, pose.localY, pose.shadowW, "#6de8ff");

  ctx.save();
  const bob = hit ? 0 : Math.sin(performance.now() * 0.0025) * 1.2;
  ctx.translate(0, bob);
  drawHeroSprite(hit);
  if (playerAttack) drawNoaAttackPose(playerAttack);
  ctx.restore();
  ctx.restore();
  drawPlayerRelicProgress();
}

function drawPlayerRelicProgress() {
  const progress = getRelicProgressInfo();
  const x = 56;
  const y = 622;
  const w = 292;
  const h = 46;
  const glow = progress.ready || progress.ratio >= 0.75;
  ctx.save();
  const bg = ctx.createLinearGradient(x, y, x + w, y + h);
  bg.addColorStop(0, "rgba(4, 9, 18, 0.62)");
  bg.addColorStop(0.55, "rgba(18, 16, 38, 0.58)");
  bg.addColorStop(1, "rgba(6, 13, 23, 0.62)");
  ctx.fillStyle = bg;
  ctx.shadowColor = glow ? "rgba(255, 240, 166, 0.22)" : "rgba(109, 232, 255, 0.12)";
  ctx.shadowBlur = glow ? 18 : 10;
  roundedRect(x, y, w, h, 10, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = glow ? "rgba(255, 240, 166, 0.44)" : "rgba(126, 231, 255, 0.22)";
  ctx.lineWidth = 1.3;
  roundedRect(x, y, w, h, 10, false, true);
  ctx.fillStyle = glow ? "rgba(255, 240, 166, 0.2)" : "rgba(126, 231, 255, 0.12)";
  roundedRect(x + 12, y + 10, 24, 24, 7, true, false);
  drawCornerGlyph(x + 24, y + 22, glow ? "#fff0a6" : "#8fe8dc");
  fitLabel(getRelicProgressText(progress), x + 46, y + 25, w - 60, 12, glow ? "#fff0a6" : "rgba(238,244,252,0.74)", 10, "900", true);
  drawRelicProgressBar(x + 14, y + 33, w - 28, 7, progress, false);
  ctx.restore();
}

function drawBuildChip(x, y, w) {
  const items = getBuildSummary();
  ctx.save();
  ctx.fillStyle = "rgba(7, 10, 16, 0.44)";
  roundedRect(x, y, w, 26, 8, true, false);
  ctx.strokeStyle = "rgba(183, 146, 255, 0.2)";
  roundedRect(x, y, w, 26, 8, false, true);
  label(t("buildCompact"), x + 12, y + 17, 11, "#c7a7ff");
  fitLabel(items[0], x + 76, y + 17, w - 90, 12, "rgba(238,244,252,0.68)", 9, "800");
  ctx.restore();
}

function drawStageGlow(x, y, r, color) {
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 18, x, y, r);
  g.addColorStop(0, hexToRgba(color, 0.22));
  g.addColorStop(0.55, hexToRgba(color, 0.08));
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 1.05, r * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPresentationSigil(x, y, r, color) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.translate(x, y);
  ctx.strokeStyle = hexToRgba(color, 0.18);
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.24, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = hexToRgba("#fff0a6", 0.16);
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.72, r * 0.14, 0, Math.PI * 0.08, Math.PI * 1.92);
  ctx.stroke();
  for (let i = 0; i < 6; i += 1) {
    const a = (Math.PI * 2 * i) / 6 + performance.now() * 0.0004;
    ctx.fillStyle = i % 2 ? hexToRgba(color, 0.34) : "rgba(255, 240, 166, 0.26)";
    ctx.fillRect(Math.cos(a) * r * 0.82 - 2, Math.sin(a) * r * 0.18 - 2, 4, 4);
  }
  ctx.restore();
}

function drawGuardMeter(x, y, w = 190) {
  const maxGuard = getEffectiveMaxGuard();
  const ratio = maxGuard ? state.guard / maxGuard : 0;
  ctx.save();
  ctx.fillStyle = "rgba(7, 10, 16, 0.5)";
  roundedRect(x, y, w, 20, 6, true, false);
  ctx.fillStyle = "rgba(157, 247, 218, 0.22)";
  roundedRect(x, y, w * ratio, 20, 6, true, false);
  ctx.strokeStyle = "rgba(157, 247, 218, 0.3)";
  roundedRect(x, y, w, 20, 6, false, true);
  label(`${t("guardLabel")} ${state.guard}/${maxGuard}`, x + 10, y + 14, 11, state.guard > 0 ? "#9df7da" : "rgba(238,244,252,0.46)");
  ctx.restore();
}

function drawHeroSprite(hit) {
  ctx.save();
  ctx.shadowColor = "rgba(98, 221, 255, 0.45)";
  ctx.shadowBlur = 24;

  if (drawPlayerHitAnimationFrame()) {
    ctx.restore();
    return;
  }

  if (hit) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.82;
  }

  if (drawHeroAnimationFrame()) {
    ctx.restore();
    return;
  }

  drawHeroIdleBase();
  drawHeroIdleEnergy();
  drawHeroLevelUpEffect();
  ctx.restore();
}

function drawPlayerHitAnimationFrame() {
  if (state.playerHit <= 0 || !isImageReady(PLAYER_HIT_ANIMATION.image)) return false;
  const elapsed = clamp(HERO_HIT_DURATION_MS - state.playerHit, 0, HERO_HIT_DURATION_MS);
  const artTuning = getDebugArtTuning({ enabled: DEBUG_HUD_ENABLED });
  const draw = alignDrawBoxToBaseline(
    PLAYER_HIT_ANIMATION.draw,
    CHARACTER_BASELINES.player.localY,
    {
      scale: CHARACTER_BASELINES.player.animationScale * artTuning.heroAttackScale,
      bottomOffset: PLAYER_HIT_ANIMATION.bottomOffset,
    },
  );
  drawSpriteAnimationFrame(PLAYER_HIT_ANIMATION, elapsed, draw.x, draw.y, draw.w, draw.h);
  return true;
}

function drawHeroIdleBase(context = "battle") {
  if (context === "menu") {
    if (drawMenuHeroIdleSprite(performance.now())) return;
    if (isImageReady(noaMenuShowcaseArt)) {
      drawImageContain(noaMenuShowcaseArt, -170, -328, 340, 510);
      return;
    }
  }
  if (context !== "menu" && isImageReady(noaBattleIdleArt)) {
    drawImageContain(noaBattleIdleArt, -150, -280, 300, 450);
    return;
  } else if (isImageReady(rosterArt)) {
    drawRosterSprite("noa", -118, -214, 236, 402);
  } else if (isImageReady(heroIdleArt)) {
    drawImageContain(heroIdleArt, -150, -280, 300, 450);
  } else if (isImageReady(HERO_ANIMATIONS.slash.image)) {
    drawSpriteSheetFrame(HERO_ANIMATIONS.slash, 0, -132, -222, 264, 410);
  } else {
    drawNoaFallback(false);
  }
}

function drawHeroAnimationFrame() {
  if (!state.heroAnimation) return false;
  const config = HERO_ANIMATIONS[state.heroAnimation.kind];
  if (!config) return false;

  const elapsed = performance.now() - state.heroAnimation.startedAt;
  if (elapsed >= state.heroAnimation.duration) {
    state.heroAnimation = null;
    return false;
  }
  const frameIndex = getAnimationFrameInfo(config, elapsed).frameIndex;
  if (isImageReady(config.image)) {
    const artTuning = getDebugArtTuning({ enabled: DEBUG_HUD_ENABLED });
    const draw = alignDrawBoxToBaseline(config.draw || { x: -132, y: -222, w: 264, h: 410 }, CHARACTER_BASELINES.player.localY, {
      scale: CHARACTER_BASELINES.player.animationScale * artTuning.heroAttackScale,
      bottomOffset: config.bottomOffset ?? CHARACTER_BASELINES.player.animationBottomOffset,
    });
    drawSpriteAnimationFrame(config, elapsed, draw.x, draw.y, draw.w, draw.h);
  } else {
    drawFallbackHeroAttackAnimation(state.heroAnimation.kind, elapsed / state.heroAnimation.duration, frameIndex);
  }
  return true;
}

function drawHeroLevelUpEffect() {
  if (!state.heroLevelUpFx) return false;
  const elapsed = performance.now() - state.heroLevelUpFx.startedAt;
  if (elapsed >= state.heroLevelUpFx.duration) {
    state.heroLevelUpFx = null;
    return false;
  }
  if (!isImageReady(HERO_LEVEL_UP_EFFECT.image)) return true;
  const draw = HERO_LEVEL_UP_EFFECT.draw;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  drawSpriteAnimationFrame(HERO_LEVEL_UP_EFFECT, elapsed, draw.x, draw.y, draw.w, draw.h);
  ctx.restore();
  return true;
}

function drawFallbackHeroAttackAnimation(kind, progress, frameIndex) {
  const meleeLike = isHeroMeleeAttackStyle(kind);
  const strike = Math.sin(progress * Math.PI);
  ctx.save();
  ctx.translate(meleeLike ? strike * 8 : -strike * 3, 0);
  ctx.rotate(meleeLike ? -0.035 + strike * 0.075 : -0.018);
  drawHeroIdleBase();
  ctx.restore();

  if (meleeLike) drawFallbackMeleePose(progress, frameIndex);
  else drawFallbackRangedPose(progress, frameIndex);
}

function drawHeroIdleEnergy() {
  const now = performance.now() * 0.001;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = "#a66cff";
  ctx.shadowBlur = 14;
  ctx.globalAlpha = 0.56 + Math.sin(now * 3.2) * 0.12;
  ctx.strokeStyle = "rgba(180, 124, 255, 0.42)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 34, 42 + Math.sin(now * 2.2) * 4, 0.15, Math.PI * 1.18);
  ctx.stroke();
  for (let i = 0; i < 6; i += 1) {
    const a = now * 1.7 + i * 1.05;
    const x = -58 + Math.cos(a) * (10 + i * 4);
    const y = 92 + Math.sin(a * 1.3) * 22;
    ctx.fillStyle = i % 2 ? "#c9a7ff" : "#8c55ff";
    ctx.globalAlpha = 0.28 + ((Math.sin(now * 2 + i) + 1) / 2) * 0.38;
    ctx.fillRect(x, y, 4, 4);
  }
  ctx.restore();
}

function drawFallbackMeleePose(progress, frameIndex) {
  const strike = Math.sin(progress * Math.PI);
  const charge = frameIndex <= 1 ? 0.35 + frameIndex * 0.3 : strike;
  const bladeStart = {
    x: -46 + strike * 20,
    y: 70 - charge * 18,
  };
  const bladeEnd = {
    x: 58 + strike * 78,
    y: 10 - strike * 74,
  };
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = "#b98cff";
  ctx.shadowBlur = 24 + strike * 22;
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(246, 239, 255, 0.94)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(bladeStart.x, bladeStart.y);
  ctx.lineTo(bladeEnd.x, bladeEnd.y);
  ctx.stroke();
  ctx.strokeStyle = "rgba(169, 104, 255, 0.88)";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(bladeStart.x, bladeStart.y);
  ctx.lineTo(bladeEnd.x, bladeEnd.y);
  ctx.stroke();
  if (frameIndex >= 3) {
    ctx.strokeStyle = "rgba(189, 135, 255, 0.62)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(18, 42, 76 + strike * 42, -0.86, 0.72 + progress * 1.2);
    ctx.stroke();
  }
  for (let i = 0; i < 12; i += 1) {
    const a = progress * 5 + i * 0.62;
    ctx.fillStyle = i % 2 ? "#d6b7ff" : "#8f57ff";
    ctx.globalAlpha = Math.max(0.18, 0.82 - i * 0.045);
    ctx.fillRect(bladeEnd.x - 10 + Math.cos(a) * (16 + i * 4), bladeEnd.y + Math.sin(a) * (10 + i * 2), 5, 5);
  }
  ctx.restore();
}

function drawFallbackRangedPose(progress, frameIndex) {
  const charge = Math.min(1, progress * 2.3);
  const recoil = frameIndex >= 4 ? Math.sin((progress - 0.5) * Math.PI * 2) * 8 : 0;
  const gunX = 36 - recoil;
  const gunY = 44;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = "#a66cff";
  ctx.shadowBlur = 20 + charge * 20;
  ctx.fillStyle = "rgba(21, 24, 34, 0.92)";
  roundedRect(gunX - 18, gunY - 10, 72, 24, 7, true, false);
  ctx.strokeStyle = "rgba(235, 222, 255, 0.82)";
  ctx.lineWidth = 2;
  roundedRect(gunX - 18, gunY - 10, 72, 24, 7, false, true);
  ctx.fillStyle = "#9d68ff";
  roundedRect(gunX + 10, gunY - 6, 18, 12, 4, true, false);
  if (frameIndex >= 2) {
    ctx.fillStyle = "rgba(181, 124, 255, 0.78)";
    ctx.beginPath();
    ctx.arc(gunX + 62, gunY + 1, 8 + charge * 8, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 8; i += 1) {
      const a = i * 0.78 + progress * 6;
      ctx.fillRect(gunX + 62 + Math.cos(a) * 20, gunY + 1 + Math.sin(a) * 14, 4, 4);
    }
  }
  if (frameIndex >= 4) {
    ctx.strokeStyle = "rgba(198, 160, 255, 0.82)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(gunX + 64, gunY + 1);
    ctx.lineTo(gunX + 154 + progress * 80, gunY - 8);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSpriteAnimationFrame(config, elapsed, x, y, w, h) {
  const { frameIndex, local } = getAnimationFrameInfo(config, elapsed);
  const currentFrame = config.frames[frameIndex];
  const previousFrame = config.frames[Math.max(0, frameIndex - 1)];
  const nextFrame = config.frames[Math.min(config.frames.length - 1, frameIndex + 1)];
  const motion = String(config.id || "").startsWith("enemy") ? 7 : 10;
  const blendFrames = config.blendFrames === true;
  if (blendFrames && previousFrame !== currentFrame && local < 0.42) {
    const ghostAlpha = (1 - local / 0.42) * 0.18;
    drawSpriteSheetFrame(config, previousFrame, x - motion * ghostAlpha, y, w, h, ghostAlpha);
  }
  drawSpriteSheetFrame(config, currentFrame, x, y, w, h);
  const blend = smoothstep(0.5, 1, local);
  if (blendFrames && blend > 0 && nextFrame !== currentFrame) {
    drawSpriteSheetFrame(config, nextFrame, x + motion * 0.04 * blend, y, w, h, blend * 0.48);
  }
}

function drawSpriteSheetFrame(config, frame, x, y, w, h, alpha = 1) {
  const img = config.image;
  const cropInset = config.cropInset ?? SPRITE_FRAME_CROP_INSET;
  const rect = insetSpriteFrameRect(getSpriteFrameRect(config, frame), img, cropInset);
  const keyed = getKeyedSpriteFrame(config, frame, rect);
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (keyed) {
    drawCanvasContain(keyed, x, y, w, h);
  } else {
    drawImageCropContain(img, rect.x, rect.y, rect.w, rect.h, x, y, w, h);
  }
  ctx.restore();
}

function getKeyedSpriteFrame(config, frame, rect) {
  if (config.noKeying) return null;
  const img = config.image;
  const key = `${config.id}:${frame}:${img.naturalWidth}x${img.naturalHeight}`;
  if (spriteFrameCache.has(key)) return spriteFrameCache.get(key);
  const canvasFrame = makeKeyedCropCanvas(img, rect.x, rect.y, rect.w, rect.h);
  spriteFrameCache.set(key, canvasFrame);
  return canvasFrame;
}

function drawKeyedImageCropContain(img, sx, sy, sw, sh, x, y, w, h, id, alpha = 1) {
  const key = `${id}:${img.naturalWidth}x${img.naturalHeight}`;
  if (!spriteFrameCache.has(key)) {
    spriteFrameCache.set(key, makeKeyedCropCanvas(img, sx, sy, sw, sh));
  }
  const keyed = spriteFrameCache.get(key);
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (keyed) drawCanvasContain(keyed, x, y, w, h);
  else drawImageCropContain(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

function makeKeyedCropCanvas(img, sx, sy, sw, sh) {
  try {
    const output = document.createElement("canvas");
    output.width = Math.max(1, Math.round(sw));
    output.height = Math.max(1, Math.round(sh));
    const outputCtx = output.getContext("2d", { willReadFrequently: true });
    outputCtx.drawImage(img, sx, sy, sw, sh, 0, 0, output.width, output.height);
    const imageData = outputCtx.getImageData(0, 0, output.width, output.height);
    removeConnectedPaperBackground(imageData, output.width, output.height);
    keepPrimaryForeground(imageData, output.width, output.height);
    outputCtx.putImageData(imageData, 0, 0);
    return output;
  } catch (_error) {
    return null;
  }
}

function removeConnectedPaperBackground(imageData, width, height) {
  const data = imageData.data;
  const key = sampleCornerColor(data, width, height);
  const visited = new Uint8Array(width * height);
  const stack = [];
  const tryVisit = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const pos = y * width + x;
    if (visited[pos]) return;
    visited[pos] = 1;
    if (isPaperPixel(data, pos * 4, key)) stack.push(pos);
  };
  for (let x = 0; x < width; x += 1) {
    tryVisit(x, 0);
    tryVisit(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    tryVisit(0, y);
    tryVisit(width - 1, y);
  }
  while (stack.length) {
    const pos = stack.pop();
    const offset = pos * 4;
    data[offset + 3] = 0;
    const x = pos % width;
    const y = Math.floor(pos / width);
    tryVisit(x + 1, y);
    tryVisit(x - 1, y);
    tryVisit(x, y + 1);
    tryVisit(x, y - 1);
  }
  softenPaperHalo(imageData, width, height);
}

function sampleCornerColor(data, width, height) {
  const points = [
    0,
    width - 1,
    (height - 1) * width,
    (height - 1) * width + width - 1,
  ];
  const color = { r: 0, g: 0, b: 0 };
  for (const point of points) {
    const offset = point * 4;
    color.r += data[offset];
    color.g += data[offset + 1];
    color.b += data[offset + 2];
  }
  color.r /= points.length;
  color.g /= points.length;
  color.b /= points.length;
  return color;
}

function isPaperPixel(data, offset, key) {
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  const distance = Math.abs(r - key.r) + Math.abs(g - key.g) + Math.abs(b - key.b);
  const chromaKey =
    (key.r > 210 && key.b > 210 && key.g < 80) ||
    (key.g > 210 && key.r < 80 && key.b < 80);
  if (chromaKey) return distance < 130;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const luma = r * 0.299 + g * 0.587 + b * 0.114;
  const lowSaturation = max - min < 74;
  const warmPaper = r > 150 && g > 132 && b > 108 && r >= b - 6;
  const paleBackground = luma > 176 && lowSaturation;
  const cornerMatch = distance < 124 && warmPaper;
  return paleBackground || cornerMatch;
}

function softenPaperHalo(imageData, width, height) {
  const data = imageData.data;
  const alpha = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i += 1) alpha[i] = data[i * 4 + 3];
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const pos = y * width + x;
      const offset = pos * 4;
      if (alpha[pos] === 0) continue;
      const nearTransparent =
        alpha[pos - 1] === 0 ||
        alpha[pos + 1] === 0 ||
        alpha[pos - width] === 0 ||
        alpha[pos + width] === 0;
      if (!nearTransparent) continue;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const luma = r * 0.299 + g * 0.587 + b * 0.114;
      if (luma > 168 && max - min < 82) data[offset + 3] = Math.min(data[offset + 3], 82);
    }
  }
}

function keepPrimaryForeground(imageData, width, height) {
  const data = imageData.data;
  const total = width * height;
  const labels = new Int32Array(total);
  const components = [{ area: 0 }];
  const stack = [];
  let currentLabel = 0;

  for (let start = 0; start < total; start += 1) {
    if (labels[start] || data[start * 4 + 3] <= 18) continue;
    currentLabel += 1;
    const component = {
      area: 0,
      minX: width,
      minY: height,
      maxX: 0,
      maxY: 0,
      saturation: 0,
      luma: 0,
    };
    stack.push(start);
    labels[start] = currentLabel;
    while (stack.length) {
      const pos = stack.pop();
      const offset = pos * 4;
      const x = pos % width;
      const y = Math.floor(pos / width);
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      component.area += 1;
      component.minX = Math.min(component.minX, x);
      component.minY = Math.min(component.minY, y);
      component.maxX = Math.max(component.maxX, x);
      component.maxY = Math.max(component.maxY, y);
      component.saturation += Math.max(r, g, b) - Math.min(r, g, b);
      component.luma += r * 0.299 + g * 0.587 + b * 0.114;
      const neighbors = [pos - 1, pos + 1, pos - width, pos + width];
      for (const next of neighbors) {
        if (next < 0 || next >= total || labels[next]) continue;
        if ((pos % width === 0 && next === pos - 1) || (pos % width === width - 1 && next === pos + 1)) continue;
        if (data[next * 4 + 3] <= 18) continue;
        labels[next] = currentLabel;
        stack.push(next);
      }
    }
    component.saturation /= component.area;
    component.luma /= component.area;
    components[currentLabel] = component;
  }

  if (currentLabel <= 1) return;
  let mainIndex = 1;
  for (let i = 2; i < components.length; i += 1) {
    if (components[i].area > components[mainIndex].area) mainIndex = i;
  }
  const main = components[mainIndex];
  const keep = new Uint8Array(components.length);
  keep[mainIndex] = 1;
  for (let i = 1; i < components.length; i += 1) {
    if (i === mainIndex) continue;
    const c = components[i];
    const nearMain =
      c.maxX >= main.minX - 34 &&
      c.minX <= main.maxX + 34 &&
      c.maxY >= main.minY - 34 &&
      c.minY <= main.maxY + 34;
    const overlapsMainVertically = c.minY < main.maxY - 8;
    const meaningfulLargePart = c.area >= Math.max(260, main.area * 0.025) && (overlapsMainVertically || c.saturation > 24);
    const energeticParticle = c.area >= 8 && c.saturation > 44 && c.luma > 68;
    const bodyFragment = nearMain && c.area >= 20 && overlapsMainVertically;
    if (meaningfulLargePart || energeticParticle || bodyFragment) keep[i] = 1;
  }

  for (let pos = 0; pos < total; pos += 1) {
    const labelIndex = labels[pos];
    if (labelIndex && !keep[labelIndex]) data[pos * 4 + 3] = 0;
  }
}

function drawCanvasContain(source, x, y, w, h) {
  const scale = Math.min(w / source.width, h / source.height);
  const dw = source.width * scale;
  const dh = source.height * scale;
  ctx.drawImage(source, x + (w - dw) / 2, y + h - dh, dw, dh);
}

function drawNoaAttackPose(attack) {
  const t = 1 - attack.life / attack.duration;
  const k = Math.sin(Math.min(1, t) * Math.PI);
  const special = attack.special || "clear";
  const color =
    special === "perfect" ? "#8ff7ff" :
    special === "combo" ? "#ffbe5f" :
    special === "spin" ? "#caa2ff" :
    special === "b2b" || special === "tetris" ? "#ffbe5f" :
    "#9fb4ff";
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.2 + k * 0.8;
  ctx.shadowColor = color;
  ctx.shadowBlur = 28 + k * 18;
  ctx.strokeStyle = color;
  ctx.lineWidth = special === "clear" ? 4 : 7;
  ctx.beginPath();
  ctx.arc(-6, 16, 54 + k * 22, -0.6, 1.1 + k * 0.7);
  ctx.stroke();
  ctx.strokeStyle = "#f6f0ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(28, 42);
  ctx.lineTo(88 + k * 24, 22 - k * 22);
  ctx.stroke();
  ctx.fillStyle = color;
  for (let i = 0; i < 7; i += 1) {
    const a = -0.2 + i * 0.2 + t * 2;
    ctx.fillRect(52 + Math.cos(a) * (28 + i * 4), 26 + Math.sin(a) * 34, 4, 4);
  }
  if (special !== "clear") {
    ctx.strokeStyle = hexToRgba(color, 0.72);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(56, 36, 60 + k * 26, 18 + k * 8, -0.28, 0, Math.PI * 1.7);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBuildPanel(x = 54, y = 510, w = 198) {
  const items = getBuildSummary();
  ctx.save();
  ctx.fillStyle = "rgba(5, 8, 12, 0.34)";
  roundedRect(x, y, w, 70, 8, true, false);
  ctx.strokeStyle = "rgba(126, 231, 255, 0.14)";
  ctx.lineWidth = 1.5;
  roundedRect(x, y, w, 70, 8, false, true);
  label(t("buildCompact").toUpperCase(), x + 16, y + 21, 12, "#7ee7ff");
  label(t("buildDetailPause"), x + 76, y + 21, 10, "rgba(238,244,252,0.38)");
  for (let i = 0; i < Math.min(2, items.length); i += 1) {
    const yy = y + 42 + i * 16;
    ctx.fillStyle = i === 0 && items[i] === t("noUpgrades") ? "rgba(238,244,252,0.08)" : "rgba(157,247,218,0.08)";
    roundedRect(x + 14, yy - 11, w - 34, 13, 5, true, false);
    label(items[i], x + 20, yy, 11, i === 0 && items[i] === t("noUpgrades") ? "rgba(238,244,252,0.42)" : "#f3f2ea");
  }
  if (items.length > 2) label(`+${items.length - 2}`, x + w - 28, y + 58, 10, "#fff0a6");
  ctx.restore();
}

function getBuildSummary() {
  const items = [];
  if (state.upgrades.maxHpBonus > 0) items.push(fmt("build.maxHp", { value: state.upgrades.maxHpBonus }));
  if (state.upgrades.damageMultiplier > 0) items.push(fmt("build.damage", { value: (1 + state.upgrades.damageMultiplier).toFixed(2) }));
  if (state.upgrades.lineDamage > 0) items.push(fmt("build.lineDmg", { value: state.upgrades.lineDamage }));
  if (state.upgrades.tspinBonus > 0) items.push(fmt("build.tCore", { value: state.upgrades.tspinBonus }));
  if (state.upgrades.garbageCancel > 0) items.push(fmt("build.garbageCancel", { value: state.upgrades.garbageCancel }));
  if (state.upgrades.comboDelay > 0) items.push(fmt("build.comboDelay", { value: state.upgrades.comboDelay }));
  if (state.upgrades.b2bBonus > 0) items.push(fmt("build.b2bBlade", { value: state.upgrades.b2bBonus }));
  if (state.upgrades.waveHeal > 0) items.push(fmt("build.waveHeal", { value: state.upgrades.waveHeal }));
  if (state.upgrades.spinBonus > 0) items.push(fmt("build.spinFlow", { value: state.upgrades.spinBonus }));
  if (state.upgrades.comboDamage > 0) items.push(fmt("build.comboFlow", { value: state.upgrades.comboDamage }));
  if (state.upgrades.defense > 0) items.push(fmt("build.guard", { value: state.upgrades.defense }));
  if (state.upgrades.bossDamage > 0) items.push(fmt("build.bossbreaker", { value: state.upgrades.bossDamage }));
  if (state.upgrades.clearHeal > 0) items.push(fmt("build.clearHeal", { value: state.upgrades.clearHeal }));
  if (state.upgrades.spinHeal > 0) items.push(fmt("build.spinHeal", { value: state.upgrades.spinHeal }));
  if (state.upgrades.spinGuardStrike > 0) items.push(fmt("build.spinGuardStrike", { value: state.upgrades.spinGuardStrike }));
  if (state.upgrades.comboEchoDamage > 0) items.push(fmt("build.comboEcho", { value: state.upgrades.comboEchoDamage }));
  if (state.upgrades.guardReflect > 0) items.push(fmt("build.guardReflect", { value: state.upgrades.guardReflect.toFixed(1) }));
  if (state.upgrades.garbageCounterDamage > 0) items.push(fmt("build.garbageCounter", { value: state.upgrades.garbageCounterDamage }));
  if (state.upgrades.burstCharge > 0) items.push(fmt("build.burstCharge", { value: state.upgrades.burstCharge }));
  if (state.upgrades.perfectBossDelay > 0) items.push(fmt("build.perfectBossDelay", { value: state.upgrades.perfectBossDelay }));
  if (state.upgrades.guardGain > 0) items.push(`${t("guardLabel")} +${state.upgrades.guardGain}`);
  if (state.upgrades.comboGuardGain > 0) items.push(`Combo ${t("guardLabel")} +${state.upgrades.comboGuardGain}`);
  if (state.upgrades.b2bShield > 0) items.push(`B2B ${t("guardLabel")} ${state.upgrades.b2bShield}`);
  return items.length ? items.slice(0, 3) : [t("noUpgrades")];
}

function drawNoaFallback(hit) {
  ctx.fillStyle = "#151821";
  ctx.beginPath();
  ctx.ellipse(0, 162, 86, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2d3340";
  ctx.beginPath();
  ctx.moveTo(-64, 32);
  ctx.quadraticCurveTo(-22, 98, -42, 154);
  ctx.quadraticCurveTo(6, 174, 52, 152);
  ctx.quadraticCurveTo(36, 92, 72, 34);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(209, 220, 235, 0.25)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#d8d8d2";
  ctx.beginPath();
  ctx.ellipse(0, -34, 62, 72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#f1f0e7";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#111218";
  ctx.beginPath();
  ctx.ellipse(-22, -42, 15, 25, -0.14, 0, Math.PI * 2);
  ctx.ellipse(24, -42, 15, 25, 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#191d26";
  ctx.fillRect(-24, 100, 16, 68);
  ctx.fillRect(14, 100, 16, 68);
  ctx.fillStyle = "#1d2028";
  ctx.fillRect(-36, 158, 34, 14);
  ctx.fillRect(10, 158, 38, 14);
  ctx.fillStyle = "#78dcff";
  ctx.shadowColor = "#78dcff";
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(0, 62, 12, 0, Math.PI * 2);
  ctx.fill();
}

function drawEnemy() {
  const hit = state.enemyHit > 0;
  const hitIntensity = state.enemyHitIntensity || (hit ? 0.8 : 0);
  const enemy = state.enemyType;
  const panel = UI_LAYOUT.enemyPanel;
  const stage = UI_LAYOUT.enemyStage;
  const pad = UI_LAYOUT.panelPadding;
  const left = panel.x + pad;
  const innerW = panel.w - pad * 2;
  drawHpBar(left, panel.y + 84, innerW, 20, Math.round(state.enemyHpDisplay), state.enemyMaxHp, hit ? "#fff2ad" : "#75e298", t("hp"), {
    textValue: state.enemyHp,
    trailValue: state.enemyHpTrail,
    trailColor: "rgba(255, 119, 130, 0.38)",
  });
  if (enemy.id === "king") drawBossPhaseBar(left, panel.y + 112);
  const intentY = panel.y + (enemy.id === "king" ? 130 : 118);
  drawEnemyIntent(left, intentY, getEnemyIntent(enemy), innerW);
  drawEnemyBehaviorChips(left, intentY + 96, enemy, innerW);
  ctx.save();
  const pose = CHARACTER_BASELINES.enemy;
  const artTuning = getDebugArtTuning({ enabled: DEBUG_HUD_ENABLED });
  const enemyScale = pose.scale * artTuning.enemyScale;
  const centerX = stage.x + stage.w / 2 + pose.centerOffsetX;
  const anchorY = getBaselineAnchorY(pose.groundY, pose.localY, enemyScale);
  drawStageGlow(centerX, pose.groundY, pose.glowRadius, enemy.color);
  drawPresentationSigil(centerX, pose.groundY + pose.sigilYOffset, pose.sigilRadius, enemy.color);
  ctx.translate(centerX, anchorY);
  ctx.scale(enemyScale, enemyScale);
  drawCharacterShadow(0, pose.localY, pose.shadowW, enemy.color);

  ctx.save();
  if (hit) {
    const tremor = Math.sin(performance.now() * 0.085) * 4.2 * hitIntensity;
    const recoil = Math.cos(performance.now() * 0.052) * 2.4 * hitIntensity;
    ctx.translate(tremor, recoil);
  }
  const pulse = 1 + Math.sin(performance.now() * 0.006) * 0.018;
  scaleAroundBaseline(pulse, pulse, pose.localY);
  if (hit) scaleAroundBaseline(1.08, 0.92, pose.localY);
  if (drawEnemyDeathTransitionFrame(enemy)) {
    // Keep the defeated enemy visible while the next enemy fades in.
  } else if (drawEnemyAttackAnimationFrame(enemy, hit)) {
    // Enemy attack animations use the standardized 16-frame sheets.
  } else if (drawEnemyConceptArt(enemy, hit)) {
    // Project-local concept sheets are the primary idle enemy source.
  } else if (isImageReady(rosterArt)) {
    ctx.save();
    ctx.shadowColor = hexToRgba(enemy.color, 0.55);
    ctx.shadowBlur = hit ? 34 : 22;
    if (hit) {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.88;
    }
    const tall = ["vine", "king", "mist", "wisp", "sentinel"].includes(enemy.id);
    const draw = alignDrawBoxToBaseline(
      { x: tall ? -132 : -126, y: tall ? -158 : -132, w: tall ? 264 : 252, h: tall ? 260 : 222 },
      CHARACTER_BASELINES.enemy.localY,
    );
    drawRosterSprite(enemy.id, draw.x, draw.y, draw.w, draw.h);
    ctx.restore();
  } else if (enemy.id !== "slime") {
    drawEnemySilhouette(enemy, hit);
  } else if (isImageReady(slimeArt)) {
    ctx.save();
    ctx.shadowColor = hexToRgba(enemy.color, 0.55);
    ctx.shadowBlur = hit ? 34 : 22;
    ctx.filter = enemy.filter;
    if (hit) {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.88;
    }
    const draw = alignDrawBoxToBaseline({ x: -122, y: -126, w: 244, h: 206 }, CHARACTER_BASELINES.enemy.localY);
    drawImageContain(slimeArt, draw.x, draw.y, draw.w, draw.h);
    ctx.restore();
    drawEnemyOverlay(enemy);
  } else {
    drawSlimeFallback(hit);
  }
  if (hit) drawEnemyHitFlash(enemy, hitIntensity);
  ctx.restore();
  ctx.restore();
}

function drawEnemyBehaviorChips(x, y, enemy, w = 294) {
  const chips = [
    { label: t("boardEffectShort"), value: t(`special.${enemy.id}`), color: enemy.color },
    { label: t("weakShort"), value: enemyWeaknessToken(enemy), color: "#fff0a6" },
  ];
  ctx.save();
  const gap = 8;
  const chipW = (w - gap) / 2;
  for (let i = 0; i < chips.length; i += 1) {
    const chip = chips[i];
    const cy = y;
    const cx = x + i * (chipW + gap);
    ctx.fillStyle = "rgba(7, 10, 16, 0.5)";
    roundedRect(cx, cy, chipW, 27, 7, true, false);
    ctx.strokeStyle = hexToRgba(chip.color.startsWith("#") ? chip.color : "#8fe8dc", 0.22);
    roundedRect(cx, cy, chipW, 27, 7, false, true);
    label(String(chip.label).toUpperCase(), cx + 9, cy + 11, 8, "rgba(238,244,252,0.48)");
    fitLabel(String(chip.value), cx + 9, cy + 22, chipW - 18, 11, chip.color, 9, "800");
  }
  ctx.restore();
}

function drawEnemyHitFlash(enemy, intensity = 1) {
  const alpha = clamp(state.enemyHit / 300, 0, 1);
  const strength = Math.min(1, alpha * (0.32 + intensity * 0.18));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 22 + intensity * 16;
  ctx.fillStyle = `rgba(255, 255, 255, ${0.18 * strength})`;
  ctx.beginPath();
  ctx.ellipse(0, -8, 118 + intensity * 16, 138 + intensity * 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = hexToRgba(enemy.color || "#d7c2ff", 0.42 * strength);
  ctx.lineWidth = 3 + intensity;
  ctx.beginPath();
  ctx.ellipse(0, 14, 136 + intensity * 24, 54 + intensity * 12, -0.18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawBossPhaseBar(x, y) {
  const phase = getBossPhase();
  const ratio = state.enemyMaxHp ? clamp(1 - state.enemyHp / state.enemyMaxHp, 0, 1) : 0;
  ctx.save();
  label(`${t("bossPhaseBar").toUpperCase()} P${phase}`, x, y - 2, 10, "#fff0a6");
  ctx.fillStyle = "rgba(8, 13, 20, 0.68)";
  roundedRect(x + 104, y - 11, 126, 7, 4, true, false);
  const g = ctx.createLinearGradient(x + 104, y - 11, x + 230, y - 11);
  g.addColorStop(0, "#9df7da");
  g.addColorStop(0.5, "#fff0a6");
  g.addColorStop(1, "#ff7782");
  ctx.fillStyle = g;
  roundedRect(x + 104, y - 11, 126 * ratio, 7, 4, true, false);
  ctx.strokeStyle = "rgba(255, 240, 166, 0.24)";
  roundedRect(x + 104, y - 11, 126, 7, 4, false, true);
  for (const marker of [0.3, 0.6, 0.8]) {
    ctx.fillStyle = "rgba(255,255,255,0.42)";
    ctx.fillRect(x + 104 + 126 * marker, y - 13, 1, 11);
  }
  ctx.restore();
}

function drawEnemyConceptArt(enemy, hit) {
  const battlePortrait = enemyBattlePortraits[enemy.battleArt || enemy.id];
  if (!isImageReady(battlePortrait)) return false;
  const draw = alignDrawBoxToBaseline(enemy.artDraw || { x: -130, y: -150, w: 260, h: 240 }, CHARACTER_BASELINES.enemy.localY);
  ctx.save();
  ctx.shadowColor = hexToRgba(enemy.color, hit ? 0.82 : 0.56);
  ctx.shadowBlur = hit ? 36 : 22;
  ctx.filter = enemy.filter;
  if (hit) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.88;
  }
  drawImageContain(battlePortrait, draw.x, draw.y, draw.w, draw.h);
  ctx.restore();
  return true;
}

function drawEnemyDeathTransitionFrame(enemy) {
  const transition = state.enemyDeathVfx;
  if (!transition) return false;
  const elapsed = performance.now() - transition.startedAt;
  if (elapsed >= transition.duration) {
    state.enemyDeathVfx = null;
    return false;
  }

  const phase = getEnemyDeathTransitionState(elapsed, transition.revealNext);
  if (phase.oldAlpha > 0) {
    ctx.save();
    ctx.globalAlpha *= phase.oldAlpha;
    ctx.translate(0, -phase.oldLift);
    scaleAroundBaseline(phase.oldScale, phase.oldScale, CHARACTER_BASELINES.enemy.localY);
    drawEnemyConceptArt(transition.enemy, false);
    ctx.restore();
  }

  if (isImageReady(ENEMY_DEATH_ANIMATION.image) && phase.effectAlpha > 0) {
    const draw = ENEMY_DEATH_ANIMATION.draw;
    ctx.save();
    ctx.globalAlpha *= phase.effectAlpha * 0.76;
    ctx.globalCompositeOperation = "screen";
    ctx.shadowColor = "#8f7cff";
    ctx.shadowBlur = 22;
    drawSpriteAnimationFrame(
      ENEMY_DEATH_ANIMATION,
      phase.elapsed,
      draw.x,
      draw.y,
      draw.w,
      draw.h,
    );
    ctx.restore();
  }

  if (phase.nextAlpha > 0) {
    ctx.save();
    ctx.globalAlpha *= phase.nextAlpha;
    ctx.translate(0, phase.nextLift);
    drawEnemyConceptArt(enemy, false);
    ctx.restore();
  }
  return true;
}

function drawEnemyAttackAnimationFrame(enemy, hit) {
  if (!state.enemyAnimation || state.enemyAnimation.kind !== enemy.id) return false;
  const config = state.enemyAnimation.config || ENEMY_ATTACK_ANIMATIONS[enemy.id];
  if (!config) return false;
  const elapsed = performance.now() - state.enemyAnimation.startedAt;
  if (elapsed >= state.enemyAnimation.duration) {
    state.enemyAnimation = null;
    return false;
  }
  const artTuning = getDebugArtTuning({ enabled: DEBUG_HUD_ENABLED });
  const draw = alignDrawBoxToBaseline(config.draw || enemy.artDraw || { x: -140, y: -150, w: 280, h: 240 }, CHARACTER_BASELINES.enemy.localY, {
    scale: artTuning.enemyAttackScale * (config.renderScale || 1),
    bottomOffset: config.bottomOffset || 0,
  });
  ctx.save();
  ctx.shadowColor = hexToRgba(enemy.color, hit ? 0.86 : 0.62);
  ctx.shadowBlur = (hit ? 38 : 26) * (config.intensity || 1);
  ctx.filter = config.noKeying ? "none" : enemy.filter;
  if (hit) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.9;
  }
  if (config.image) {
    if (!isImageReady(config.image)) {
      ctx.restore();
      return false;
    }
    drawSpriteAnimationFrame(config, elapsed, draw.x, draw.y, draw.w, draw.h);
    ctx.restore();
    return true;
  }
  ctx.restore();
  return false;
}

function drawEnemySilhouette(enemy, hit) {
  ctx.save();
  ctx.shadowColor = hexToRgba(enemy.color, hit ? 0.8 : 0.55);
  ctx.shadowBlur = hit ? 34 : 22;
  if (hit) ctx.globalCompositeOperation = "lighter";
  if (enemy.id === "vine") drawVineGuardBody(enemy);
  else if (enemy.id === "mushroom") drawMushroomMageBody(enemy);
  else if (enemy.id === "beetle") drawStoneBeetleBody(enemy);
  else if (enemy.id === "mist") drawMistDeerBody(enemy);
  else if (enemy.id === "thorn") drawStoneBeetleBody(enemy);
  else if (enemy.id === "wisp") drawMistDeerBody(enemy);
  else if (enemy.id === "sentinel") drawSlimeKingBody(enemy);
  else if (enemy.id === "king") drawSlimeKingBody(enemy);
  ctx.restore();
}

function drawVineGuardBody(enemy) {
  ctx.strokeStyle = "#1d3a25";
  ctx.lineWidth = 16;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-96 + i * 48, 88);
    ctx.bezierCurveTo(-126 + i * 58, 10, -58 + i * 34, -40, -62 + i * 38, -110);
    ctx.stroke();
  }
  ctx.fillStyle = enemy.color;
  ctx.beginPath();
  ctx.ellipse(0, 18, 72, 88, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0e2018";
  ctx.beginPath();
  ctx.ellipse(-24, -12, 10, 18, -0.3, 0, Math.PI * 2);
  ctx.ellipse(24, -12, 10, 18, 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawMushroomMageBody(enemy) {
  ctx.fillStyle = "#d8f7ff";
  roundedRect(-30, -8, 60, 112, 26, true, false);
  ctx.fillStyle = enemy.color;
  ctx.beginPath();
  ctx.ellipse(0, -60, 118, 54, 0, Math.PI, 0);
  ctx.lineTo(96, -22);
  ctx.lineTo(-96, -22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#143844";
  for (const [x, y, r] of [[-44, -48, 10], [0, -66, 13], [46, -45, 9]]) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawStoneBeetleBody(enemy) {
  ctx.fillStyle = "#7f7664";
  ctx.beginPath();
  ctx.ellipse(0, 8, 112, 72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = enemy.color;
  ctx.lineWidth = 8;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(0, 12, 94 - i * 16, Math.PI * 0.12, Math.PI * 0.88);
    ctx.stroke();
  }
  ctx.fillStyle = "#1f1c18";
  ctx.beginPath();
  ctx.moveTo(-98, -8);
  ctx.lineTo(-144, -46);
  ctx.lineTo(-116, 8);
  ctx.moveTo(98, -8);
  ctx.lineTo(144, -46);
  ctx.lineTo(116, 8);
  ctx.fill();
}

function drawMistDeerBody(enemy) {
  ctx.fillStyle = "rgba(210, 206, 255, 0.48)";
  ctx.beginPath();
  ctx.ellipse(0, 24, 82, 54, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-8, -52, 36, 46, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = enemy.color;
  ctx.lineWidth = 6;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 18, -86);
    ctx.lineTo(side * 58, -140);
    ctx.moveTo(side * 38, -114);
    ctx.lineTo(side * 78, -126);
    ctx.stroke();
  }
  drawMistWisps(enemy);
}

function drawMistWisps(enemy) {
  ctx.save();
  ctx.strokeStyle = hexToRgba(enemy.color, 0.56);
  ctx.lineWidth = 4;
  for (let i = 0; i < 6; i += 1) {
    const y = -84 + i * 32 + Math.sin(performance.now() * 0.002 + i) * 8;
    ctx.beginPath();
    ctx.moveTo(-132, y);
    ctx.bezierCurveTo(-58, y - 24, 48, y + 24, 132, y - 8);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSlimeKingBody(enemy) {
  ctx.fillStyle = "#6cc76f";
  ctx.beginPath();
  ctx.ellipse(0, 24, 124, 86, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = enemy.color;
  ctx.beginPath();
  ctx.moveTo(-54, -82);
  ctx.lineTo(-28, -130);
  ctx.lineTo(-4, -86);
  ctx.lineTo(26, -132);
  ctx.lineTo(58, -82);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#173018";
  ctx.beginPath();
  ctx.ellipse(-34, 0, 16, 22, -0.25, 0, Math.PI * 2);
  ctx.ellipse(38, 0, 16, 22, 0.25, 0, Math.PI * 2);
  ctx.fill();
}

function getEnemyIntent(enemy) {
  const garbage = getEnemyAttackGarbagePreview(enemy);
  const cancelText = garbage > 0 ? t("enemyCancelable") : "-";
  const icon = {
    slime: "!",
    vine: "G",
    mushroom: "N",
    beetle: "A",
    mist: "?",
    thorn: "X",
    wisp: "*",
    sentinel: "S",
    king: "B",
  }[enemy.id] || "!";
  if (enemy.id === "mushroom") {
    return { icon, title: t("intentSporeHex"), detail: `${fmt("intentSporeHexDetail", { damage: state.enemyAttackDamage })} / ${cancelText}`, color: "#77e8ff" };
  }
  if (enemy.id === "beetle") {
    return { icon, title: t("intentArmorCrush"), detail: `${fmt("intentArmorCrushDetail", { damage: state.enemyAttackDamage, garbage })} / ${cancelText}`, color: "#c6b38a" };
  }
  if (enemy.id === "thorn") {
    return { icon, title: t("intentDashSlash"), detail: `${fmt("intentDashSlashDetail", { damage: state.enemyAttackDamage, garbage })} / ${cancelText}`, color: "#b174ff" };
  }
  if (enemy.id === "wisp") {
    return { icon, title: t("intentHomingBolt"), detail: fmt("intentHomingBoltDetail", { damage: state.enemyAttackDamage }), color: "#c7a7ff" };
  }
  if (enemy.id === "sentinel") {
    return { icon, title: t("intentGroundSlam"), detail: `${fmt("intentGroundSlamDetail", { damage: state.enemyAttackDamage, garbage })} / ${cancelText}`, color: "#d7c28f" };
  }
  if (enemy.id === "king") {
    return { icon, title: fmt("intentBossPhase", { phase: getBossPhase() }), detail: `${fmt("intentBossPhaseDetail", { damage: state.enemyAttackDamage })} / +${garbage}`, color: "#f1d36b" };
  }
  if (garbage > 0) {
    return { icon, title: t("intentGarbageSurge"), detail: `${fmt("intentGarbageSurgeDetail", { damage: state.enemyAttackDamage, garbage })} / ${cancelText}`, color: "#c9d4da" };
  }
  return { icon, title: t("intentStrike"), detail: fmt("intentStrikeDetail", { damage: state.enemyAttackDamage }), color: "#98f07e" };
}

function drawEnemyIntent(x, y, intent, w = 294) {
  const enemy = state.enemyType;
  const garbage = getEnemyAttackGarbagePreview(enemy);
  const h = 92;
  const danger = state.enemyCountdown <= 1;
  ctx.save();
  ctx.fillStyle = "rgba(7, 10, 16, 0.44)";
  roundedRect(x, y, w, h, 8, true, false);
  ctx.strokeStyle = hexToRgba(intent.color, 0.36);
  ctx.lineWidth = 1.5;
  roundedRect(x, y, w, h, 8, false, true);
  ctx.fillStyle = hexToRgba(intent.color, 0.22);
  roundedRect(x + 12, y + 14, 34, 38, 7, true, false);
  ctx.strokeStyle = hexToRgba(intent.color, 0.48);
  roundedRect(x + 12, y + 14, 34, 38, 7, false, true);
  ctx.font = canvasFont("900", 18, intent.icon || "!");
  ctx.fillStyle = intent.color;
  ctx.textAlign = "center";
  ctx.fillText(intent.icon || "!", x + 29, y + 39);
  ctx.textAlign = "left";
  label(t("enemyIntent").toUpperCase(), x + 58, y + 25, 10, "rgba(238,244,252,0.48)");
  fitLabel(intent.title, x + 58, y + 45, w - 74, 15, intent.color, 11, "900");

  const gap = 6;
  const pillW = (w - 24 - gap * 2) / 3;
  const pillY = y + 60;
  drawIntentPill(x + 12, pillY, pillW, `${t("intentAttackLabel")} ${state.enemyAttackDamage}`, "#ffb7bd", true);
  drawIntentPill(x + 12 + pillW + gap, pillY, pillW, fmt("turnsLater", { count: state.enemyCountdown }), danger ? "#ff7782" : "#98f07e", danger);
  drawIntentPill(x + 12 + (pillW + gap) * 2, pillY, pillW, `${t("intentGarbageLabel")} +${garbage}`, garbage > 0 ? "#c9d4da" : "rgba(238,244,252,0.56)");
  ctx.restore();
}

function drawIntentPill(x, y, w, text, color, emphasis = false) {
  const accent = color.startsWith("#") ? color : "#dce8ee";
  ctx.save();
  ctx.fillStyle = hexToRgba(accent, emphasis ? 0.16 : 0.09);
  roundedRect(x, y, w, 22, 6, true, false);
  ctx.strokeStyle = hexToRgba(accent, emphasis ? 0.32 : 0.16);
  roundedRect(x, y, w, 22, 6, false, true);
  ctx.textBaseline = "middle";
  fitLabel(String(text), x + 8, y + 12, w - 16, 12, color, 9, "800");
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}

function drawIntentMetricRow(x, y, w, labelText, value, color) {
  ctx.save();
  const accent = color.startsWith("#") ? color : "#dce8ee";
  ctx.fillStyle = hexToRgba(accent, 0.08);
  roundedRect(x, y, w, 18, 5, true, false);
  ctx.strokeStyle = hexToRgba(accent, 0.14);
  roundedRect(x, y, w, 18, 5, false, true);
  label(labelText, x + 8, y + 12, 10, "rgba(238,244,252,0.56)");
  ctx.textAlign = "right";
  label(String(value), x + w - 8, y + 13, 12, color);
  ctx.restore();
}

function drawEnemyIntentCompact(x, y, intent) {
  const enemy = state.enemyType;
  const garbage = getEnemyAttackGarbagePreview(enemy);
  ctx.save();
  ctx.fillStyle = "rgba(7, 10, 16, 0.44)";
  roundedRect(x, y, 154, 34, 8, true, false);
  ctx.strokeStyle = hexToRgba(intent.color, 0.28);
  roundedRect(x, y, 154, 34, 8, false, true);
  fitLabel(intent.title.toUpperCase(), x + 10, y + 13, 134, 10, intent.color, 8, "900");
  drawIntentMiniChip(x + 10, y + 17, "DMG", state.enemyAttackDamage, "#ffb7bd", 44);
  drawIntentMiniChip(x + 58, y + 17, "G", garbage, garbage > 0 ? "#c9d4da" : "rgba(238,244,252,0.36)", 34);
  drawIntentMiniChip(x + 96, y + 17, "W", enemyWeaknessToken(enemy), "#fff0a6", 48);
  ctx.restore();
}

function drawIntentMiniChip(x, y, key, value, color, w = 48) {
  ctx.save();
  ctx.fillStyle = hexToRgba(color.startsWith("#") ? color : "#dce8ee", 0.1);
  roundedRect(x, y, w, 18, 5, true, false);
  ctx.strokeStyle = hexToRgba(color.startsWith("#") ? color : "#dce8ee", 0.22);
  roundedRect(x, y, w, 18, 5, false, true);
  label(key, x + 5, y + 12, 8, "rgba(238,244,252,0.42)");
  label(String(value), x + 26, y + 12, 9, color);
  ctx.restore();
}

function drawCountdownBadgeCompact(x, y, count) {
  ctx.save();
  const danger = count <= 1;
  ctx.fillStyle = danger ? "rgba(76, 14, 24, 0.7)" : "rgba(8, 13, 20, 0.5)";
  roundedRect(x, y, 88, 34, 8, true, false);
  ctx.strokeStyle = danger ? "rgba(255, 119, 130, 0.7)" : "rgba(139, 238, 184, 0.24)";
  roundedRect(x, y, 88, 34, 8, false, true);
  label(t("enemyStrike").toUpperCase(), x + 8, y + 12, 8, danger ? "#ffb7bd" : "rgba(216, 238, 229, 0.62)");
  label(String(count), x + 56, y + 28, 22, danger ? "#ff7782" : "#98f07e");
  ctx.restore();
}

function drawEnemyOverlay(enemy) {
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  if (enemy.id === "vine") {
    ctx.strokeStyle = "#9de06c";
    ctx.lineWidth = 5;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-112 + i * 68, 62);
      ctx.bezierCurveTo(-90 + i * 54, 16, -42 + i * 28, 4, -24 + i * 24, -70);
      ctx.stroke();
    }
  } else if (enemy.id === "mushroom") {
    ctx.fillStyle = "#77e8ff";
    ctx.shadowColor = "#77e8ff";
    ctx.shadowBlur = 16;
    for (const [x, y, s] of [
      [-70, -100, 0.9],
      [0, -118, 1.15],
      [72, -98, 0.78],
    ]) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s, s);
      ctx.beginPath();
      ctx.arc(0, 0, 18, Math.PI, 0);
      ctx.lineTo(18, 8);
      ctx.lineTo(-18, 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(-4, 4, 8, 18);
      ctx.restore();
    }
  } else if (enemy.id === "beetle") {
    ctx.strokeStyle = "#d5c49b";
    ctx.lineWidth = 7;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.arc(0, -20 + i * 28, 96 - i * 10, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();
    }
  } else if (enemy.id === "mist") {
    ctx.strokeStyle = "rgba(210, 206, 255, 0.56)";
    ctx.lineWidth = 4;
    for (let i = 0; i < 6; i += 1) {
      const y = -84 + i * 36 + Math.sin(performance.now() * 0.002 + i) * 8;
      ctx.beginPath();
      ctx.moveTo(-132, y);
      ctx.bezierCurveTo(-58, y - 24, 48, y + 24, 132, y - 8);
      ctx.stroke();
    }
  } else if (enemy.id === "king") {
    ctx.fillStyle = "#f1d36b";
    ctx.shadowColor = "#f1d36b";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(-54, -138);
    ctx.lineTo(-28, -174);
    ctx.lineTo(-6, -136);
    ctx.lineTo(22, -176);
    ctx.lineTo(52, -138);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3b2d18";
    ctx.lineWidth = 4;
    ctx.stroke();
  }
  ctx.restore();
}

function drawSlimeFallback(hit) {
  ctx.fillStyle = "rgba(102, 224, 135, 0.16)";
  ctx.beginPath();
  ctx.ellipse(0, 74, 118, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  const body = ctx.createRadialGradient(-32, -22, 20, 0, 0, 112);
  body.addColorStop(0, hit ? "#e3ffd5" : "#9cf2a9");
  body.addColorStop(0.55, "#4fc47f");
  body.addColorStop(1, "rgba(27, 102, 68, 0.84)");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 0, 92, 78, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(203, 255, 210, 0.38)";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#0f251e";
  ctx.beginPath();
  ctx.ellipse(-28, -16, 11, 15, 0, 0, Math.PI * 2);
  ctx.ellipse(29, -16, 11, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#16412d";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 12, 26, 0.18, Math.PI - 0.18);
  ctx.stroke();
}

function drawCharacterShadow(x, y, w, color) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = hexToRgba(color, 0.13);
  ctx.beginPath();
  ctx.ellipse(x, y, w, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHpBar(x, y, w, h, value, max, color, caption, options = {}) {
  const ratio = max ? clamp(value / max, 0, 1) : 0;
  const textValue = options.textValue ?? value;
  const valueText = `${Math.max(0, Math.round(textValue))}/${max}`;
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  roundedRect(x, y, w, h, 7, true, false);
  if (typeof options.trailValue === "number" && options.trailValue > value) {
    const trailRatio = max ? clamp(options.trailValue / max, 0, 1) : 0;
    ctx.fillStyle = options.trailColor || "rgba(255, 119, 130, 0.3)";
    roundedRect(x, y, Math.max(0, w * trailRatio), h, 7, true, false);
  }
  const g = ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0, color);
  g.addColorStop(1, ratio < 0.35 ? "#ff7782" : "#8ff1d2");
  ctx.fillStyle = g;
  roundedRect(x, y, Math.max(0, w * ratio), h, 7, true, false);
  ctx.strokeStyle = "rgba(241,244,250,0.34)";
  ctx.lineWidth = 2;
  roundedRect(x, y, w, h, 7, false, true);
  ctx.textBaseline = "middle";
  ctx.font = canvasFont("800", 11, caption, true);
  ctx.fillStyle = "rgba(8, 11, 18, 0.78)";
  ctx.fillText(caption, x + 10, y + h / 2 + 1);
  ctx.font = canvasFont("800", 12, valueText, true);
  const textW = Math.max(56, Math.min(w - 58, Math.ceil(ctx.measureText(valueText).width + 18)));
  ctx.fillStyle = "rgba(2, 5, 10, 0.58)";
  roundedRect(x + w - textW - 4, y + 3, textW, h - 6, 5, true, false);
  ctx.textAlign = "right";
  ctx.fillStyle = "#f3f2ea";
  ctx.fillText(valueText, x + w - 12, y + h / 2 + 1);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}

function drawStatChip(x, y, text, color) {
  ctx.save();
  const width = Math.max(112, text.length * 8 + 26);
  ctx.fillStyle = "rgba(8, 13, 20, 0.54)";
  roundedRect(x, y, width, 24, 6, true, false);
  ctx.strokeStyle = "rgba(211, 231, 255, 0.18)";
  ctx.lineWidth = 1;
  roundedRect(x, y, width, 24, 6, false, true);
  ctx.fillStyle = color;
  ctx.font = canvasFont("800", 12, text);
  ctx.fillText(text, x + 12, y + 16);
  ctx.restore();
}

function drawCountdownBadge(x, y, count) {
  ctx.save();
  const danger = count <= 1;
  ctx.fillStyle = danger ? "rgba(76, 14, 24, 0.72)" : "rgba(8, 13, 20, 0.58)";
  roundedRect(x, y, 160, 34, 8, true, false);
  ctx.strokeStyle = danger ? "rgba(255, 119, 130, 0.72)" : "rgba(139, 238, 184, 0.28)";
  ctx.lineWidth = 2;
  roundedRect(x, y, 160, 34, 8, false, true);
  ctx.font = canvasFont("800", 12, t("enemyStrike").toUpperCase(), true);
  ctx.fillStyle = danger ? "#ffb7bd" : "rgba(216, 238, 229, 0.72)";
  ctx.fillText(t("enemyStrike").toUpperCase(), x + 12, y + 14);
  ctx.font = canvasFont("900", 22, String(count), true);
  ctx.fillStyle = danger ? "#ff7782" : "#98f07e";
  ctx.fillText(String(count), x + 128, y + 25);
  ctx.restore();
}

function drawBoard() {
  ctx.save();
  ctx.translate(BOARD_X, BOARD_Y);
  const frame = ctx.createLinearGradient(-18, -18, COLS * TILE + 18, ROWS * TILE + 18);
  frame.addColorStop(0, "rgba(123, 238, 225, 0.22)");
  frame.addColorStop(0.5, "rgba(24, 28, 42, 0.96)");
  frame.addColorStop(1, "rgba(169, 126, 255, 0.18)");
  ctx.fillStyle = frame;
  roundedRect(-18, -18, COLS * TILE + 36, ROWS * TILE + 36, 9, true, false);
  ctx.fillStyle = "rgba(4, 7, 12, 0.9)";
  roundedRect(-9, -9, COLS * TILE + 18, ROWS * TILE + 18, 5, true, false);
  ctx.strokeStyle = "rgba(223, 243, 255, 0.3)";
  ctx.lineWidth = 1.5;
  roundedRect(-9, -9, COLS * TILE + 18, ROWS * TILE + 18, 5, false, true);

  ctx.fillStyle = "rgba(229,235,244,0.045)";
  for (let x = 0; x <= COLS; x += 1) ctx.fillRect(x * TILE, 0, 1, ROWS * TILE);
  for (let y = 0; y <= ROWS; y += 1) ctx.fillRect(0, y * TILE, COLS * TILE, 1);
  drawUltimateWellMask();

  drawHiddenBoardCells();
  for (let y = HIDDEN; y < ROWS + HIDDEN; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const type = state.board[y][x];
      if (type === ULTIMATE_WALL) continue;
      if (type) drawBlock(x * TILE, (y - HIDDEN) * TILE, COLORS[type]);
    }
  }

  const ghost = getGhost();
  if (ghost) drawPiece(ghost, true);
  if (state.active) drawPiece(state.active, false);

  for (const flash of state.lineFlash) {
    const y = (flash.y - HIDDEN) * TILE;
    if (y < 0) continue;
    ctx.fillStyle = `rgba(245, 236, 190, ${Math.min(0.32, flash.life / 620)})`;
    const well = getUltimateWellRange();
    const flashX = state.ultimateActive ? well.start * TILE : 0;
    const flashW = state.ultimateActive ? well.width * TILE : COLS * TILE;
    ctx.fillRect(flashX, y, flashW, TILE);
  }
  ctx.restore();
  drawUltimateTimerUi();
  drawIncomingGarbageMeter();
}

function getTopBufferLayout() {
  const h = HIDDEN * TILE;
  return { x: 0, y: -h, w: COLS * TILE, h, rowH: TILE };
}

function drawHiddenBoardCells() {
  const layout = getTopBufferLayout();
  ctx.save();
  ctx.globalAlpha = 0.62;
  for (let y = 0; y < HIDDEN; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const type = state.board[y]?.[x];
      if (!type || type === ULTIMATE_WALL) continue;
      drawBlock(x * TILE, layout.y + y * TILE, COLORS[type]);
    }
  }
  ctx.restore();
}

function drawUltimateWellMask() {
  if (!state.ultimateActive) return;
  const well = getUltimateWellRange();
  const wellX = well.start * TILE;
  const wellW = well.width * TILE;
  const leftW = wellX;
  const rightX = wellX + wellW;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, COLS * TILE, ROWS * TILE);
  ctx.clip();
  ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
  ctx.fillRect(0, 0, leftW, ROWS * TILE);
  ctx.fillRect(rightX, 0, COLS * TILE - rightX, ROWS * TILE);
  const pulse = 0.55 + Math.sin(performance.now() * 0.008) * 0.18;
  ctx.strokeStyle = `rgba(255, 190, 95, ${pulse})`;
  ctx.lineWidth = 3;
  roundedRect(wellX - 4, -5, wellW + 8, ROWS * TILE + 10, 4, false, true);
  ctx.strokeStyle = "rgba(223, 243, 255, 0.64)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(wellX, 0);
  ctx.lineTo(wellX, ROWS * TILE);
  ctx.moveTo(wellX + wellW, 0);
  ctx.lineTo(wellX + wellW, ROWS * TILE);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 190, 95, 0.12)";
  ctx.fillRect(wellX, 0, wellW, ROWS * TILE);
  ctx.restore();
}

function drawUltimateTimerUi() {
  if (!state.ultimateActive) return;
  ctx.save();
  ctx.translate(BOARD_X, BOARD_Y);
  drawUltimateCountdownBar();
  ctx.restore();
  drawUltimateCountdownWarning();
}

function drawUltimateCountdownBar() {
  if (!state.ultimateActive) return;
  const meter = UI_LAYOUT.ultimateMeter;
  const remaining = Math.max(0, state.ultimateTimer);
  const ratio = getUltimateTimerRatio(state.ultimateActive, remaining, state.ultimateTimerMax || ULTIMATE_DURATION_MS);
  const secondsText = `${getUltimateCountdownSeconds(remaining)}s`;
  const danger = remaining <= 5000;
  const barX = meter.x + 90;
  const barY = meter.y + 8;
  const barW = meter.w - 140;
  const barH = 9;
  const pulse = danger ? 0.7 + Math.sin(performance.now() * 0.018) * 0.3 : 1;

  ctx.save();
  ctx.fillStyle = "rgba(4, 7, 12, 0.72)";
  roundedRect(meter.x, meter.y, meter.w, meter.h, 8, true, false);
  ctx.strokeStyle = danger ? `rgba(255, 119, 130, ${0.45 * pulse})` : "rgba(255, 190, 95, 0.34)";
  ctx.lineWidth = 1.5;
  roundedRect(meter.x, meter.y, meter.w, meter.h, 8, false, true);

  ctx.font = canvasFont("900", 12, "4-WIDE", true);
  ctx.textAlign = "left";
  ctx.fillStyle = danger ? "#ff9aa2" : "#ffbe5f";
  ctx.shadowColor = danger ? "#ff7782" : "#ffbe5f";
  ctx.shadowBlur = danger ? 12 : 8;
  ctx.fillText("4-WIDE", meter.x + 12, meter.y + 17);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  roundedRect(barX, barY, barW, barH, 8, true, false);
  const fillW = Math.max(0, barW * ratio);
  if (fillW > 0) {
    const g = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    g.addColorStop(0, danger ? "#ff7782" : "#d7c2ff");
    g.addColorStop(0.58, danger ? "#ffbe5f" : "#ffbe5f");
    g.addColorStop(1, "#8fe8dc");
    ctx.fillStyle = g;
    roundedRect(barX, barY, Math.max(4, fillW), barH, 8, true, false);
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.fillRect(barX + 2, barY + 2, Math.max(0, fillW - 4), 1);
  }

  ctx.font = canvasFont("900", 13, secondsText, true);
  ctx.textAlign = "right";
  ctx.fillStyle = danger ? "#ffb7bd" : "#f5f1e6";
  ctx.fillText(secondsText, meter.x + meter.w - 12, meter.y + 18);
  ctx.restore();
}

function drawUltimateCountdownWarning() {
  if (!shouldShowUltimateCountdownWarning(state.ultimateActive, state.ultimateTimer)) return;
  const seconds = getUltimateCountdownSeconds(state.ultimateTimer);
  const t = performance.now();
  const urgent = seconds <= 1;
  const pulse = 0.5 + Math.sin(t * (urgent ? 0.026 : 0.018)) * 0.5;
  const cx = BOARD_X + (COLS * TILE) / 2;
  const cy = BOARD_Y + TILE * 3.25;
  const badgeW = urgent ? 112 : 96;
  const badgeH = urgent ? 82 : 70;
  const alpha = 0.78 + pulse * 0.18;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.shadowColor = urgent ? "rgba(255, 119, 130, 0.75)" : "rgba(255, 190, 95, 0.62)";
  ctx.shadowBlur = urgent ? 26 : 20;
  const g = ctx.createLinearGradient(0, -badgeH / 2, 0, badgeH / 2);
  g.addColorStop(0, urgent ? "rgba(70, 10, 26, 0.78)" : "rgba(30, 20, 52, 0.72)");
  g.addColorStop(0.55, "rgba(8, 12, 24, 0.82)");
  g.addColorStop(1, "rgba(4, 8, 14, 0.72)");
  ctx.fillStyle = g;
  roundedRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 16, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = urgent ? `rgba(255, 119, 130, ${0.52 + pulse * 0.28})` : `rgba(255, 190, 95, ${0.48 + pulse * 0.22})`;
  ctx.lineWidth = urgent ? 2.6 : 2;
  roundedRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 16, false, true);
  ctx.strokeStyle = `rgba(126, 247, 255, ${0.16 + pulse * 0.18})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-badgeW / 2 + 18, -badgeH / 2 + 12);
  ctx.lineTo(badgeW / 2 - 18, -badgeH / 2 + 12);
  ctx.moveTo(-badgeW / 2 + 18, badgeH / 2 - 12);
  ctx.lineTo(badgeW / 2 - 18, badgeH / 2 - 12);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = canvasFont("900", urgent ? 50 : 44, String(seconds), true);
  ctx.fillStyle = urgent ? "#ffdde0" : "#fff0a6";
  ctx.shadowColor = urgent ? "#ff7782" : "#ffbe5f";
  ctx.shadowBlur = urgent ? 18 : 14;
  ctx.fillText(String(seconds), 0, 3);
  ctx.restore();
}

function drawIncomingGarbageMeter() {
  const x = BOARD_X - 30;
  const y = BOARD_Y;
  const maxRows = 10;
  ctx.save();
  label(`${t("incomingShort").toUpperCase()} ${state.pendingGarbage}`, x - 10, y - 12, 12, state.pendingGarbage > 0 ? "#ffb7bd" : "rgba(238,244,252,0.38)");
  ctx.fillStyle = "rgba(5, 8, 12, 0.55)";
  roundedRect(x, y, 16, ROWS * TILE, 6, true, false);
  ctx.strokeStyle = "rgba(238,244,252,0.16)";
  roundedRect(x, y, 16, ROWS * TILE, 6, false, true);
  const visible = Math.min(maxRows, state.pendingGarbage);
  for (let i = 0; i < visible; i += 1) {
    const by = y + ROWS * TILE - 8 - i * 18;
    ctx.fillStyle = i < 3 ? "#c9d4da" : "#ff7782";
    roundedRect(x + 3, by, 10, 13, 3, true, false);
  }
  if (state.pendingGarbage > maxRows) {
    label(`+${state.pendingGarbage - maxRows}`, x - 3, y + ROWS * TILE - 194, 12, "#ff7782");
  }
  ctx.restore();
}

function getGhost() {
  if (!state.active || state.mode !== "playing") return null;
  const ghost = {
    ...state.active,
    shape: state.active.shape,
  };
  while (!collides(ghost, ghost.x, ghost.y + 1, ghost.shape)) ghost.y += 1;
  return ghost;
}

function drawPiece(piece, ghost) {
  const constrainToUltimateWell = Boolean(state.ultimateActive);
  const well = getUltimateWellRange();
  if (!ghost) drawHiddenPieceCells(piece, constrainToUltimateWell ? well : null);
  const cells = getVisiblePieceCells(piece, {
    cols: COLS,
    rows: ROWS,
    hidden: HIDDEN,
    minCol: constrainToUltimateWell ? well.start : 0,
    maxCol: constrainToUltimateWell ? well.end : COLS,
  });
  for (const cell of cells) {
    drawBlock(cell.x * TILE, cell.y * TILE, ghost ? "rgba(228,235,245,0.16)" : COLORS[piece.type], ghost);
  }
}

function drawHiddenPieceCells(piece, well = null) {
  if (!piece || !Array.isArray(piece.shape)) return;
  const layout = getTopBufferLayout();
  ctx.save();
  ctx.globalAlpha = 0.78;
  for (let r = 0; r < piece.shape.length; r += 1) {
    for (let c = 0; c < piece.shape[r].length; c += 1) {
      if (!piece.shape[r][c]) continue;
      const x = piece.x + c;
      const boardY = piece.y + r;
      if (x < 0 || x >= COLS || boardY < 0 || boardY >= HIDDEN) continue;
      if (well && (x < well.start || x >= well.end)) continue;
      drawBlock(x * TILE, layout.y + boardY * TILE, COLORS[piece.type]);
    }
  }
  ctx.restore();
}

function drawBlock(x, y, color, ghost = false, size = TILE) {
  ctx.save();
  ctx.fillStyle = color;
  roundedRect(x + 2, y + 2, size - 4, size - 4, 4, true, false);
  ctx.strokeStyle = ghost ? "rgba(232,240,255,0.32)" : "rgba(7,10,16,0.62)";
  ctx.lineWidth = 2;
  roundedRect(x + 2, y + 2, size - 4, size - 4, 4, false, true);
  if (!ghost) {
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(x + 6, y + 5, size - 12, 2);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(x + 5, y + size - 8, size - 10, 3);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + size - 7);
    ctx.lineTo(x + size - 7, y + 8);
    ctx.stroke();
    if (color === COLORS.G) {
      ctx.strokeStyle = "rgba(229,235,240,0.22)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 9, y + 10);
      ctx.lineTo(x + 14, y + 17);
      ctx.lineTo(x + 11, y + 24);
      ctx.moveTo(x + size - 10, y + 9);
      ctx.lineTo(x + size - 17, y + 16);
      ctx.lineTo(x + size - 12, y + 25);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawSidePieces() {
  drawHoldPanel();
  drawNextQueuePanel();
}

function drawHoldPanel() {
  ctx.save();
  const w = HOLD_PANEL_W;
  const h = HOLD_PANEL_H;
  const locked = !state.canHold && Boolean(state.hold);
  ctx.fillStyle = "rgba(3, 5, 10, 0.62)";
  roundedRect(HOLD_PANEL_X, HOLD_PANEL_Y, w, h, 14, true, false);
  ctx.strokeStyle = state.canHold ? "rgba(255, 224, 162, 0.38)" : "rgba(223, 243, 255, 0.12)";
  ctx.lineWidth = 1.3;
  roundedRect(HOLD_PANEL_X, HOLD_PANEL_Y, w, h, 14, false, true);
  label(t("hold").toUpperCase(), HOLD_PANEL_X + 11, HOLD_PANEL_Y + 22, 13, state.canHold ? "#ffe0a3" : "rgba(245,241,230,0.42)");
  ctx.fillStyle = "rgba(126, 231, 255, 0.035)";
  roundedRect(HOLD_PANEL_X + 10, HOLD_PANEL_Y + 36, w - 20, 64, 10, true, false);
  drawMiniPiece(
    state.hold,
    HOLD_PANEL_X + 18,
    HOLD_PANEL_Y + 44,
    HOLD_PREVIEW_CELL_SIZE,
    HOLD_PREVIEW_BOX_W,
    HOLD_PREVIEW_BOX_H,
    { disabled: locked },
  );
  if (locked) drawHoldLockedOverlay(HOLD_PANEL_X + 10, HOLD_PANEL_Y + 36, w - 20, 64);
  ctx.restore();
}

function drawNextQueuePanel() {
  ctx.save();
  const w = NEXT_PANEL_W;
  const h = 34 + NEXT_PREVIEW_COUNT * NEXT_SLOT_H + (NEXT_PREVIEW_COUNT - 1) * NEXT_SLOT_GAP + 42;
  ctx.fillStyle = "rgba(3, 5, 10, 0.62)";
  roundedRect(NEXT_PANEL_X, NEXT_PANEL_Y, w, h, 14, true, false);
  ctx.strokeStyle = "rgba(255, 224, 162, 0.38)";
  ctx.lineWidth = 1.3;
  roundedRect(NEXT_PANEL_X, NEXT_PANEL_Y, w, h, 14, false, true);
  label(t("next").toUpperCase(), NEXT_PANEL_X + 11, NEXT_PANEL_Y + 22, 13, "#ffe0a3");
  for (let i = 0; i < NEXT_PREVIEW_COUNT; i += 1) {
    const slotY = NEXT_PANEL_Y + 34 + i * NEXT_SLOT_STEP;
    ctx.fillStyle = "rgba(126, 231, 255, 0.03)";
    roundedRect(NEXT_PANEL_X + 9, slotY, w - 18, NEXT_SLOT_H, 9, true, false);
    drawMiniPiece(state.queue[i], NEXT_PANEL_X + 17, slotY + 11, NEXT_PREVIEW_CELL_SIZE, NEXT_PREVIEW_BOX_W, NEXT_PREVIEW_BOX_H);
  }
  if (state.queueHex > 0) {
    ctx.fillStyle = "rgba(119, 232, 255, 0.11)";
    roundedRect(NEXT_PANEL_X + 8, NEXT_PANEL_Y + h - 31, w - 16, 20, 8, true, false);
    label(`${t("hex").toUpperCase()} ${state.queueHex}`, NEXT_PANEL_X + 13, NEXT_PANEL_Y + h - 17, 10, "#77e8ff");
  }
  ctx.restore();
}

function drawHoldLockedOverlay(x, y, w, h) {
  ctx.save();
  ctx.fillStyle = "rgba(2, 5, 10, 0.46)";
  roundedRect(x, y, w, h, 10, true, false);
  ctx.strokeStyle = "rgba(176, 199, 224, 0.22)";
  ctx.lineWidth = 1.1;
  roundedRect(x + 1, y + 1, w - 2, h - 2, 9, false, true);
  ctx.save();
  holdOverlayClipPath(x + 2, y + 2, w - 4, h - 4, 8);
  ctx.clip();
  ctx.globalAlpha = 0.36;
  ctx.strokeStyle = "rgba(223, 243, 255, 0.34)";
  ctx.lineWidth = 1;
  const inset = 6;
  const lineTop = y + inset;
  const lineBottom = y + h - inset;
  for (let sx = x - h + inset; sx < x + w - inset; sx += 12) {
    ctx.beginPath();
    ctx.moveTo(sx, lineBottom);
    ctx.lineTo(sx + h - inset * 2, lineTop);
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 0.82;
  ctx.strokeStyle = "rgba(215, 194, 255, 0.72)";
  ctx.lineWidth = 2;
  const cx = x + w - 18;
  const cy = y + 18;
  roundedRect(cx - 9, cy - 1, 18, 14, 4, false, true);
  ctx.beginPath();
  ctx.arc(cx, cy - 2, 7, Math.PI, 0);
  ctx.stroke();
  ctx.restore();
}

function holdOverlayClipPath(x, y, w, h, radius) {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawOperationReadouts() {
  if (!state.operationReadouts.length) return;
  const x = BOARD_X - 160;
  const y = BOARD_Y + 176;
  ctx.save();
  const visibleReadouts = Math.min(2, state.operationReadouts.length);
  for (let i = 0; i < visibleReadouts; i += 1) {
    const readout = state.operationReadouts[i];
    const progress = 1 - readout.life / readout.duration;
    const alpha = Math.max(0, Math.min(1, readout.life / 260));
    const yy = y + i * 44 - progress * 12;
    ctx.globalAlpha = alpha * (i === 0 ? 1 : 0.5);
    ctx.save();
    ctx.translate(i === 0 ? Math.sin(progress * Math.PI) * 5 : 0, 0);
    ctx.shadowColor = readout.color;
    ctx.shadowBlur = i === 0 ? 22 : 8;
    ctx.fillStyle = hexToRgba(readout.color, i === 0 ? 0.22 : 0.08);
    roundedRect(x, yy - 29, 146, 42, 9, true, false);
    ctx.strokeStyle = hexToRgba(readout.color, i === 0 ? 0.44 : 0.16);
    roundedRect(x, yy - 29, 146, 42, 9, false, true);
    ctx.fillStyle = readout.color;
    const titleSize = i === 0 ? (readout.title.length > 14 ? 16 : readout.title.length > 9 ? 20 : 24) : 15;
    ctx.font = canvasFont(i === 0 ? "900" : "800", titleSize, readout.title, true);
    ctx.textAlign = "left";
    ctx.fillText(readout.title, x + 10, yy - 7);
    ctx.font = canvasFont("800", 12, readout.title, true);
    ctx.fillStyle = readout.b2b ? "#fff0a6" : "rgba(238,244,252,0.64)";
    const comboText = readout.combo >= 2 ? fmt("floaterCombo", { combo: readout.combo }) : "";
    const b2bText = readout.b2b ? "B2B" : "";
    const effectiveText = `E${readout.effectiveLines}`;
    const damageText = readout.damage ? `= ${readout.damage} ${t("dmgShort")}` : "";
    ctx.fillText([comboText, b2bText, effectiveText, damageText].filter(Boolean).join("  "), x + 10, yy + 9);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawDamageFormulaPanel(x, y) {
  const breakdown = state.lastDamageBreakdown;
  ctx.save();
  ctx.fillStyle = "rgba(3, 5, 10, 0.26)";
  roundedRect(x, y, 142, 72, 10, true, false);
  ctx.strokeStyle = "rgba(145, 232, 222, 0.16)";
  roundedRect(x, y, 142, 72, 10, false, true);
  label(t("lastHit").toUpperCase(), x + 12, y + 21, 12, "#8fe8dc");
  if (!breakdown) {
    wrapText(t("damageEquationHint"), x + 12, y + 43, 116, 14, "rgba(238,244,252,0.48)", 10);
    ctx.restore();
    return;
  }
  label(`${breakdown.total} ${t("dmgShort")}`, x + 12, y + 45, 21, "#fff0a6");
  const title = breakdown.title.length > 16 ? `${breakdown.title.slice(0, 15)}...` : breakdown.title;
  label(title, x + 12, y + 61, 10, "rgba(238,244,252,0.58)");
  label(t("detailPauseHint"), x + 12, y + 69, 8, "rgba(157,247,218,0.46)");
  ctx.restore();
}

function drawCombatReadout() {
  ctx.save();
  const board = UI_LAYOUT.boardFrame;
  const x = board.x + 22;
  const y = H - 32;
  const nextBoss = state.wave % 10 === 0
    ? `P${getBossPhase()}`
    : state.miniBoss
      ? t("miniBoss")
      : `${10 - (state.wave % 10)}`;
  ctx.fillStyle = "rgba(4, 7, 14, 0.56)";
  roundedRect(x - 14, y - 14, board.w - 16, 40, 12, true, false);
  ctx.strokeStyle = "rgba(183, 146, 255, 0.18)";
  roundedRect(x - 14, y - 14, board.w - 16, 40, 12, false, true);
  drawMetricChip(x, y - 6, t("waveLabel"), state.wave, "#98f07e", 84);
  drawMetricChip(x + 94, y - 6, t("nextBossLabel"), nextBoss, state.enemyType.id === "king" ? "#fff0a6" : "#d7c2ff", 94);
  drawMetricChip(x + 198, y - 6, t("incomingShort"), state.pendingGarbage, state.pendingGarbage > 0 ? "#ffb7bd" : "#7b8791", 78);
  if (state.challenge) {
    const config = CHALLENGES.find((challenge) => challenge.id === state.challenge.id);
    if (config) label(`${config.title}: ${state.challenge.progress}/${config.target}`, x, y + 42, 11, state.challenge.complete ? "#fff0a6" : "#9df7da");
  }
  ctx.restore();
}

function drawMetricChip(x, y, labelText, value, color, w = 78) {
  ctx.save();
  ctx.fillStyle = hexToRgba(color, 0.09);
  roundedRect(x, y, w, 32, 8, true, false);
  ctx.strokeStyle = hexToRgba(color, 0.22);
  roundedRect(x, y, w, 32, 8, false, true);
  label(String(labelText).toUpperCase(), x + 8, y + 12, 9, "rgba(238,244,252,0.48)");
  label(String(value), x + 8, y + 27, 15, color);
  ctx.restore();
}

function drawB2BStatusLight(x, y) {
  const status = getB2BStatus();
  ctx.save();
  ctx.fillStyle = hexToRgba(status.color, 0.18);
  roundedRect(x, y - 13, 144, 18, 9, true, false);
  ctx.strokeStyle = hexToRgba(status.color, 0.48);
  roundedRect(x, y - 13, 144, 18, 9, false, true);
  ctx.fillStyle = status.color;
  ctx.beginPath();
  ctx.arc(x + 10, y - 4, 4.5 + (state.b2bActive ? Math.sin(performance.now() * 0.01) * 1.4 : 0), 0, Math.PI * 2);
  ctx.fill();
  label(status.text, x + 22, y + 1, 12, status.color);
  if (state.upgrades.b2bShield > 0) label(`x${state.upgrades.b2bShield}`, x + 116, y + 1, 12, "#fff0a6");
  ctx.restore();
}

function getB2BStatus() {
  if (state.b2bActive) {
    return {
      text: state.b2bChain > 1 ? fmt("b2bChain", { count: state.b2bChain }) : t("b2bReady"),
      color: "#fff0a6",
    };
  }
  if (state.b2bBrokenFlash > 0) return { text: t("b2bBroken"), color: "#ff7782" };
  return { text: `B2B ${t("off")}`, color: "#7b8791" };
}

function drawAttackEffects() {
  for (const attack of state.attacks) {
    const t = 1 - attack.life / attack.duration;
    const eased = 1 - Math.pow(1 - t, 3);
    const x = lerp(attack.x0, attack.x1, eased);
    const y = lerp(attack.y0, attack.y1, eased) + Math.sin(t * Math.PI) * -42;
    if (attack.type === "player") {
      drawPlayerAttack(attack, x, y, t);
    } else if (attack.type === "enemy") {
      drawEnemyAttack(attack, x, y, t);
    } else {
      drawWaveSpawn(attack, t);
    }
  }
}

function drawWaveSpawn(attack, t) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 1 - t;
  ctx.strokeStyle = "#98f07e";
  ctx.lineWidth = 5;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.arc(attack.x0, attack.y0, 35 + i * 28 + t * 96, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(152, 240, 126, 0.18)";
  ctx.beginPath();
  ctx.arc(attack.x0, attack.y0, 90 + t * 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPlayerAttack(attack, x, y, t) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const special = attack.special || (attack.spin ? "spin" : "clear");
  const melee = isHeroMeleeAttackStyle(attack.heroStyle);
  const glow =
    special === "perfect" ? "#8ff7ff" :
    special === "combo" ? "#ffbe5f" :
    special === "spin" ? "#caa2ff" :
    special === "b2b" || special === "tetris" ? "#ffbe5f" :
    "#9fb4ff";
  const core = special === "perfect" ? "#ffffff" : special === "combo" ? "#fff0a6" : special === "spin" ? "#f1d36b" : "#d9f0ff";
  const elapsed = attack.duration - attack.life;
  const vfx = resolvePlayerAttackVfx(attack.heroStyle, attack.comboStyle);
  const drewProjectile = drawPlayerAttackProjectile(attack, vfx, elapsed, glow, core, special);
  if (!drewProjectile) {
    if (melee) drawMeleeAttackPath(attack, x, y, t, glow, core, special);
    else drawRangedAttackPath(attack, x, y, t, glow, core, special);
    ctx.shadowColor = glow;
    ctx.shadowBlur = special === "clear" ? 18 : 32;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, special === "clear" ? 11 : 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(x, y, special === "clear" ? 4 : 6, 0, Math.PI * 2);
    ctx.fill();
    if (special === "spin" || special === "b2b" || special === "perfect" || special === "combo") {
      ctx.strokeStyle = hexToRgba(core, 0.9);
      ctx.lineWidth = special === "perfect" ? 4 : 3;
      ctx.beginPath();
      ctx.arc(x, y, 28 + Math.sin(t * Math.PI) * 12, t * 8, t * 8 + Math.PI * 1.35);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(attack.x1, attack.y1, 46 + t * 10, 16 + t * 4, -0.4, 0, Math.PI * 1.6);
      ctx.stroke();
    }
    if (special === "perfect") {
      for (let i = 0; i < 6; i += 1) {
        const a = t * 5 + (Math.PI * 2 * i) / 6;
        ctx.fillStyle = i % 2 ? "#c7a7ff" : "#8ff7ff";
        ctx.fillRect(attack.x1 + Math.cos(a) * 42, attack.y1 + Math.sin(a) * 28, 6, 6);
      }
    }
  }
  if (!drawPlayerAttackImpact(attack, vfx, elapsed, glow) && t > 0.78) {
    drawImpactBurst(attack.x1, attack.y1, glow, t, special, 0.78);
  }
  ctx.restore();
}

function drawPlayerAttackProjectile(attack, vfx, elapsed, glow, core, special) {
  const projectile = vfx.projectile;
  if (!isImageReady(projectile.image)) return false;
  const localElapsed = elapsed - projectile.startMs;
  if (localElapsed < 0 || localElapsed > projectile.durationMs) return true;
  const localT = clamp(localElapsed / projectile.durationMs, 0, 1);
  const eased = 1 - Math.pow(1 - localT, 3);
  const arc = Math.sin(localT * Math.PI);
  const x = lerp(attack.x0 + 24, attack.x1 - 18, eased);
  const y = lerp(attack.y0 - 10, attack.y1, eased) - arc * 44;
  const fade = localT > 0.88 ? clamp((1 - localT) / 0.12, 0, 1) : 1;
  const scale = projectile.scale * (1 + arc * 0.08);
  const w = 190 * scale * (special === "perfect" ? 1.2 : 1);
  const h = 116 * scale * (special === "perfect" ? 1.12 : 1);
  ctx.save();
  ctx.globalAlpha *= projectile.alpha * fade;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 22 + vfx.intensity * 10;
  ctx.translate(x, y);
  if (projectile.spin) ctx.rotate(-0.18 + localT * 0.36);
  drawSpriteAnimationFrame(projectile, localElapsed, -w * 0.5, -h * 0.5, w, h);
  ctx.globalAlpha *= 0.32 * fade;
  ctx.strokeStyle = hexToRgba(core, 0.62);
  ctx.lineWidth = 2 + vfx.intensity;
  ctx.beginPath();
  ctx.moveTo(-w * 0.48, h * 0.18);
  ctx.quadraticCurveTo(-w * 0.18, -h * 0.4, w * 0.42, -h * 0.08);
  ctx.stroke();
  ctx.restore();
  return true;
}

function drawPlayerAttackImpact(attack, vfx, elapsed, glow) {
  const impact = vfx.impact;
  if (!isImageReady(impact.image)) return false;
  const localElapsed = elapsed - impact.startMs;
  if (localElapsed < 0 || localElapsed > impact.durationMs) return true;
  const localT = clamp(localElapsed / impact.durationMs, 0, 1);
  const fade = localT > 0.86 ? clamp((1 - localT) / 0.14, 0, 1) : 1;
  const bloom = Math.sin(localT * Math.PI);
  const size = 126 * impact.scale * (1 + bloom * 0.18);
  ctx.save();
  ctx.globalAlpha *= fade;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 24 + vfx.intensity * 12;
  drawSpriteAnimationFrame(impact, localElapsed, attack.x1 - size / 2, attack.y1 - size / 2, size, size);
  ctx.restore();
  return true;
}

function drawRangedAttackPath(attack, x, y, t, glow, core, special) {
  ctx.strokeStyle = hexToRgba(glow, special === "clear" ? 0.28 : 0.42);
  ctx.lineWidth = special === "clear" ? 4 : 6;
  ctx.beginPath();
  ctx.moveTo(attack.x0, attack.y0);
  ctx.quadraticCurveTo((attack.x0 + attack.x1) / 2, attack.y0 - 54, x, y);
  ctx.stroke();
  ctx.strokeStyle = hexToRgba(core, 0.58);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(attack.x0, attack.y0 + 6);
  ctx.quadraticCurveTo((attack.x0 + attack.x1) / 2, attack.y0 - 28, x, y + 6);
  ctx.stroke();
  for (let i = 0; i < 8; i += 1) {
    const k = Math.max(0, t - i * 0.03);
    ctx.globalAlpha = Math.max(0, 0.52 - i * 0.055);
    ctx.fillStyle = i % 2 ? core : glow;
    ctx.fillRect(lerp(attack.x0, attack.x1, k) - 4, lerp(attack.y0, attack.y1, k) - 4, 7, 7);
  }
  ctx.globalAlpha = 1;
}

function drawMeleeAttackPath(attack, x, y, t, glow, core, special) {
  const arc = Math.sin(t * Math.PI);
  ctx.strokeStyle = hexToRgba(glow, 0.52 + arc * 0.24);
  ctx.lineWidth = special === "perfect" ? 8 : 6;
  ctx.beginPath();
  ctx.moveTo(attack.x0 + 20, attack.y0 + 8);
  ctx.bezierCurveTo(448, 206 - arc * 42, 760, 502 + arc * 26, x, y);
  ctx.stroke();
  ctx.strokeStyle = hexToRgba(core, 0.78);
  ctx.lineWidth = special === "perfect" ? 4 : 3;
  ctx.beginPath();
  ctx.ellipse(attack.x1 - 8, attack.y1 + 2, 64 + arc * 48, 22 + arc * 18, -0.35, 0, Math.PI * 1.85);
  ctx.stroke();
  for (let i = 0; i < 14; i += 1) {
    const k = Math.max(0, t - i * 0.018);
    ctx.globalAlpha = Math.max(0, 0.7 - i * 0.045);
    ctx.fillStyle = i % 2 ? core : glow;
    ctx.fillRect(lerp(attack.x0 + 34, attack.x1, k) - 4, lerp(attack.y0 - 18, attack.y1, k) + Math.sin(i) * 12 - 4, 8, 8);
  }
  ctx.globalAlpha = 1;
}

function drawEnemyAttack(attack, x, y, t) {
  const vfx = resolveEnemyAttackVfx(attack.attackKind, attack.bossPhase || 1);
  const ready = vfx
    && isImageReady(vfx.impact.image)
    && (!vfx.projectile || isImageReady(vfx.projectile.image));
  if (!ready) {
    drawEnemyAttackFallback(attack, x, y, t);
    return;
  }

  const elapsed = attack.duration - attack.life;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  if (vfx.projectile) drawEnemyProjectileSprite(attack, vfx.projectile, elapsed);
  drawEnemyImpactSprite(attack, vfx.impact, elapsed);
  ctx.restore();
}

function drawEnemyProjectileSprite(attack, projectile, elapsed) {
  const localElapsed = elapsed - projectile.startMs;
  if (localElapsed < 0 || localElapsed > projectile.durationMs) return;
  const progress = clamp(localElapsed / projectile.durationMs, 0, 1);
  const eased = 1 - Math.pow(1 - progress, 3);
  const x = lerp(attack.x0, attack.x1, eased);
  const y = lerp(attack.y0 - 8, attack.y1 - 4, eased) - Math.sin(progress * Math.PI) * 34;
  const size = 148 * (projectile.scale || 1);
  ctx.save();
  ctx.shadowColor = "#b98cff";
  ctx.shadowBlur = 24 * (projectile.intensity || 1);
  drawSpriteAnimationFrame(
    projectile,
    localElapsed,
    x - size / 2,
    y - size / 2,
    size,
    size,
  );
  ctx.restore();
}

function drawEnemyImpactSprite(attack, impact, elapsed) {
  const localElapsed = elapsed - impact.startMs;
  if (localElapsed < 0 || localElapsed > impact.durationMs) return;
  const size = 182 * (impact.scale || 1);
  ctx.save();
  ctx.shadowColor = "#c7a7ff";
  ctx.shadowBlur = 28 * (impact.intensity || 1);
  drawSpriteAnimationFrame(
    impact,
    localElapsed,
    attack.x1 - size / 2,
    attack.y1 - size / 2,
    size,
    size,
  );
  ctx.restore();
}

function drawEnemyAttackFallback(attack, x, y, t) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const kind = attack.attackKind || "slime";
  const config = ENEMY_ATTACK_ANIMATIONS[kind] || {};
  const impactStart = typeof config.hitRatio === "number" ? Math.max(0.68, config.hitRatio - 0.02) : 0.78;
  const palette = {
    vine: "#9de06c",
    mushroom: "#b690ff",
    beetle: "#c6b38a",
    mist: "#d2ceff",
    thorn: "#b174ff",
    wisp: "#c7a7ff",
    sentinel: "#d7c28f",
    king: "#ffb95f",
    slime: "#82f28f",
  };
  const color = palette[kind] || palette.slime;
  const garbageAttack = ["vine", "mushroom", "beetle", "mist", "thorn", "sentinel", "king"].includes(kind);
  ctx.strokeStyle = hexToRgba(color, garbageAttack ? 0.42 : 0.32);
  ctx.lineWidth = kind === "king" ? 9 : garbageAttack ? 7 : 5;
  ctx.beginPath();
  ctx.moveTo(attack.x0, attack.y0);
  ctx.quadraticCurveTo((attack.x0 + attack.x1) / 2, attack.y0 - 58, x, y);
  ctx.stroke();
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  if (kind === "vine") {
    ctx.strokeStyle = hexToRgba(color, 0.75);
    ctx.lineWidth = 4;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x - 26 + i * 18, y + 18);
      ctx.bezierCurveTo(x - 42 + i * 22, y - 14, x + 16 - i * 8, y - 20, x + 5, y + 22);
      ctx.stroke();
    }
  } else if (kind === "thorn") {
    ctx.strokeStyle = hexToRgba(color, 0.82);
    ctx.lineWidth = 5;
    for (let i = 0; i < 4; i += 1) {
      const sweep = 22 + i * 10;
      ctx.beginPath();
      ctx.moveTo(x - 52 + i * 10, y + 30 - i * 6);
      ctx.quadraticCurveTo(x + 2, y - sweep, x + 58 - i * 7, y + 12 + i * 3);
      ctx.stroke();
    }
    ctx.fillStyle = hexToRgba("#f2d6ff", 0.78);
    for (let i = 0; i < 9; i += 1) {
      const a = -0.8 + i * 0.2 + t * 2.4;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * 42, y + Math.sin(a) * 24);
      ctx.lineTo(x + Math.cos(a + 0.12) * 56, y + Math.sin(a + 0.12) * 30);
      ctx.lineTo(x + Math.cos(a - 0.12) * 52, y + Math.sin(a - 0.12) * 20);
      ctx.closePath();
      ctx.fill();
    }
  } else if (kind === "mushroom") {
    ctx.fillStyle = hexToRgba(color, 0.72);
    for (let i = 0; i < 10; i += 1) {
      const a = t * 8 + i * 1.9;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * (14 + i * 2), y + Math.sin(a) * 16, 3 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === "wisp") {
    for (let i = 0; i < 3; i += 1) {
      const drift = Math.sin(t * Math.PI * 2 + i * 1.7) * 14;
      ctx.strokeStyle = hexToRgba(i % 2 ? "#e2d8ff" : color, 0.58);
      ctx.lineWidth = 4 - i * 0.5;
      ctx.beginPath();
      ctx.moveTo(x - 58 - i * 8, y + drift);
      ctx.bezierCurveTo(x - 30, y - 26 + drift, x + 18, y + 22 - drift, x + 46 + i * 8, y - drift * 0.25);
      ctx.stroke();
      ctx.fillStyle = hexToRgba(i % 2 ? "#e2d8ff" : "#78dcff", 0.88);
      ctx.beginPath();
      ctx.arc(x + 46 + i * 8, y - drift * 0.25, 7 - i, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = hexToRgba(color, 0.34);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 28 + t * 12, 0, Math.PI * 1.7);
    ctx.stroke();
  } else if (kind === "mist") {
    ctx.strokeStyle = hexToRgba(color, 0.64);
    ctx.lineWidth = 5;
    for (let i = 0; i < 2; i += 1) {
      ctx.beginPath();
      ctx.ellipse(x, y + i * 8, 30 + t * 10, 12, t * 5 + i, 0, Math.PI * 1.8);
      ctx.stroke();
    }
  } else if (kind === "sentinel") {
    ctx.fillStyle = "#8f8469";
    ctx.strokeStyle = hexToRgba(color, 0.72);
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(x, y + 12, 56 + t * 12, 16 + t * 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 34 + t * 8, Math.PI * 0.08, Math.PI * 0.92);
    ctx.stroke();
    for (let i = 0; i < 8; i += 1) {
      const a = (Math.PI * 2 * i) / 8 + t;
      const rx = x + Math.cos(a) * (26 + i);
      const ry = y + 16 + Math.sin(a) * 12;
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(a);
      roundedRect(-5, -5, 10 + (i % 3) * 4, 10, 2, true, false);
      ctx.restore();
    }
  } else if (kind === "beetle" || kind === "king") {
    ctx.fillStyle = kind === "king" ? "#d8bf65" : "#9aa6ae";
    ctx.shadowBlur = 18;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 10);
    const size = kind === "king" ? 42 : 34;
    roundedRect(-size / 2, -size / 2, size, size, 4, true, false);
    ctx.strokeStyle = "rgba(20, 24, 30, 0.7)";
    ctx.lineWidth = 4;
    roundedRect(-size / 2, -size / 2, size, size, 4, false, true);
    ctx.restore();
  } else {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, 18, 12, t * 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d7ffd7";
    ctx.beginPath();
    ctx.arc(x - 4, y - 2, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (t > impactStart) drawImpactBurst(attack.x1, attack.y1, garbageAttack ? color : "#ff7782", t, kind, impactStart);
  ctx.restore();
}

function drawImpactBurst(x, y, color, t, kind = "clear", impactStart = 0.78) {
  const k = Math.min(1, (t - impactStart) / Math.max(0.05, 1 - impactStart));
  const strong = ["perfect", "spin", "b2b", "combo", "thorn", "wisp", "sentinel", "king"].includes(kind);
  ctx.save();
  ctx.globalAlpha = 1 - k;
  ctx.strokeStyle = color;
  ctx.lineWidth = strong ? 5 : 3;
  ctx.beginPath();
  ctx.arc(x, y, 14 + k * (strong ? 58 : 34), 0, Math.PI * 2);
  ctx.stroke();
  const count = strong ? 12 : 7;
  for (let i = 0; i < count; i += 1) {
    const a = (Math.PI * 2 * i) / count;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * 16, y + Math.sin(a) * 16);
    ctx.lineTo(x + Math.cos(a) * (strong ? 72 : 48), y + Math.sin(a) * (strong ? 58 : 38));
    ctx.stroke();
  }
  ctx.restore();
}

function drawBossPhaseWarning() {
  const banner = state.bossPhaseBanner;
  const windup = state.bossWindup;
  if (!banner && !windup) return;
  ctx.save();
  if (windup) {
    const p = 1 - clamp(windup.life / windup.duration, 0, 1);
    const pulse = Math.sin(p * Math.PI);
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = `rgba(255, 185, 95, ${0.24 + pulse * 0.46})`;
    ctx.lineWidth = 3 + windup.phase;
    ctx.beginPath();
    ctx.ellipse(994, 346, 92 + pulse * 54, 42 + pulse * 22, -0.18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(177, 116, 255, ${0.16 + pulse * 0.32})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      const a = p * Math.PI * 2 + i * Math.PI * 0.5;
      ctx.beginPath();
      ctx.arc(994 + Math.cos(a) * 56, 346 + Math.sin(a) * 24, 18 + pulse * 12, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  if (banner) {
    const alpha = clamp(banner.life / banner.duration, 0, 1);
    const reveal = Math.min(1, (banner.duration - banner.life) / 180);
    const x = W / 2 - 178;
    const y = 86;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(3, 5, 12, ${0.52 * Math.min(reveal, alpha * 2)})`;
    roundedRect(x, y, 356, 64, 14, true, false);
    ctx.strokeStyle = `rgba(255, 185, 95, ${0.38 + reveal * 0.34})`;
    ctx.lineWidth = 2;
    roundedRect(x, y, 356, 64, 14, false, true);
    ctx.textAlign = "center";
    label(fmt("bossPhaseShift", { phase: banner.phase }).toUpperCase(), W / 2, y + 27, 20, "#fff0a6");
    label(t("bossRiftWindup"), W / 2, y + 48, 12, "#ffb95f");
    ctx.textAlign = "left";
  }
  ctx.restore();
}

function drawPerfectClearFx() {
  const fx = state.perfectClearFx;
  if (!fx) return;
  const elapsed = performance.now() - fx.startedAt;
  const progress = clamp(elapsed / fx.duration, 0, 1);
  const fadeIn = clamp(progress / 0.12, 0, 1);
  const fadeOut = clamp((1 - progress) / 0.22, 0, 1);
  const alpha = Math.min(fadeIn, fadeOut);
  const burst = Math.sin(Math.min(1, progress * 1.28) * Math.PI);
  const cx = BOARD_X + (COLS * TILE) / 2;
  const cy = BOARD_Y + ROWS * TILE * 0.42;
  const now = performance.now();

  ctx.save();
  ctx.fillStyle = `rgba(2, 3, 10, ${0.66 * alpha})`;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "lighter";

  const radial = ctx.createRadialGradient(cx, cy, 40, cx, cy, 540);
  radial.addColorStop(0, `rgba(255, 255, 246, ${0.78 * alpha})`);
  radial.addColorStop(0.22, `rgba(255, 225, 132, ${0.4 * alpha})`);
  radial.addColorStop(0.5, `rgba(154, 116, 255, ${0.22 * alpha})`);
  radial.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, W, H);

  const flash = Math.max(0, 1 - Math.abs(progress - 0.38) / 0.08);
  if (flash > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.42 * flash * alpha})`;
    ctx.fillRect(0, 0, W, H);
  }

  for (let i = 0; i < 18; i += 1) {
    const a = (Math.PI * 2 * i) / 18 + progress * 2.8;
    const inner = 36 + burst * 18;
    const outer = 480 + burst * 220;
    ctx.strokeStyle = i % 3 === 0 ? `rgba(255, 239, 165, ${0.34 * alpha})` : `rgba(150, 236, 255, ${0.24 * alpha})`;
    ctx.lineWidth = i % 3 === 0 ? 5 : 3;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
    ctx.stroke();
  }

  for (let i = 0; i < 4; i += 1) {
    ctx.strokeStyle = i % 2 ? `rgba(199, 167, 255, ${0.42 * alpha})` : `rgba(255, 244, 168, ${0.36 * alpha})`;
    ctx.lineWidth = 3 + i;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 92 + i * 58 + burst * 120, 34 + i * 24 + burst * 46, -0.32 + progress * 2.1, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let i = 0; i < 42; i += 1) {
    const seed = fx.seed + i * 19.17;
    const a = seed + progress * (2.2 + (i % 5) * 0.18);
    const r = 95 + ((i * 37) % 360) + burst * 92;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r * 0.56;
    const size = 5 + (i % 4) * 2;
    ctx.fillStyle = i % 3 === 0 ? `rgba(255, 229, 132, ${0.74 * alpha})` : `rgba(178, 118, 255, ${0.72 * alpha})`;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }

  if (progress > 0.28 && progress < 0.72) {
    const k = Math.sin(((progress - 0.28) / 0.44) * Math.PI);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.86 * k * alpha})`;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(-80, cy + 150);
    ctx.lineTo(W + 80, cy - 190);
    ctx.stroke();
    ctx.strokeStyle = `rgba(199, 167, 255, ${0.62 * k * alpha})`;
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(-80, cy - 74);
    ctx.lineTo(W + 80, cy + 94);
    ctx.stroke();
  }

  if (isImageReady(HERO_ANIMATIONS.ultimate.image)) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.96 * alpha;
    ctx.shadowColor = "rgba(199, 167, 255, 0.9)";
    ctx.shadowBlur = 36 + burst * 28;
    const heroW = 704 + burst * 44;
    const heroH = 402 + burst * 26;
    drawSpriteAnimationFrame(HERO_ANIMATIONS.ultimate, elapsed, 42, 202 - burst * 12, heroW, heroH);
    ctx.restore();
  }

  ctx.globalCompositeOperation = "source-over";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(255, 240, 166, 0.9)";
  ctx.shadowBlur = 26 + burst * 24;
  ctx.font = canvasFont("900", 72, t("perfectClearTitle"), true);
  const titleY = 132 + Math.sin(progress * Math.PI) * -8;
  const titleGradient = ctx.createLinearGradient(380, titleY - 54, 900, titleY + 18);
  titleGradient.addColorStop(0, "#ffffff");
  titleGradient.addColorStop(0.5, "#fff0a6");
  titleGradient.addColorStop(1, "#8ff7ff");
  ctx.fillStyle = titleGradient;
  ctx.globalAlpha = alpha;
  ctx.fillText(t("perfectClearTitle"), W / 2, titleY);
  ctx.font = canvasFont("900", 22, t("perfectClearSubtitle").toUpperCase());
  ctx.fillStyle = "#d7c2ff";
  ctx.fillText(t("perfectClearSubtitle").toUpperCase(), W / 2, titleY + 34);
  ctx.font = canvasFont("900", 34, fmt("perfectClearDamage", { damage: fx.damage }).toUpperCase());
  ctx.fillStyle = "#fff0a6";
  ctx.fillText(fmt("perfectClearDamage", { damage: fx.damage }).toUpperCase(), W / 2, titleY + 70);
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
  ctx.restore();
}

function drawBursts() {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const burst of state.bursts) {
    const t = 1 - burst.life / burst.duration;
    const alpha = Math.max(0, 1 - t);
    ctx.globalAlpha = alpha * 0.34;
    ctx.strokeStyle = burst.color;
    ctx.lineWidth = 2 + burst.intensity * 1.2;
    ctx.beginPath();
    ctx.arc(burst.x, burst.y, burst.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = alpha * 0.08;
    ctx.fillStyle = burst.color;
    ctx.beginPath();
    ctx.arc(burst.x, burst.y, burst.radius * 0.62, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawParticles() {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const p of state.particles) {
    if (p.kind === "enemy-death") {
      ctx.save();
      ctx.globalAlpha = Math.min(0.9, p.life / 260);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation || 0);
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 1.6);
      ctx.lineTo(p.size * 0.72, 0);
      ctx.lineTo(0, p.size * 1.6);
      ctx.lineTo(-p.size * 0.72, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else {
      ctx.globalAlpha = Math.min(0.72, p.life / 260);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawMiniPiece(type, x, y, size = 14, boxW = 92, boxH = 58, options = {}) {
  ctx.save();
  ctx.fillStyle = "rgba(5,8,12,0.66)";
  roundedRect(x - 8, y - 8, boxW, boxH, 6, true, false);
  ctx.strokeStyle = "rgba(152, 228, 235, 0.16)";
  ctx.lineWidth = 1.5;
  roundedRect(x - 8, y - 8, boxW, boxH, 6, false, true);
  if (type) {
    const shape = PIECES[type];
    const preview = getPiecePreviewLayout(shape, x, y, size, boxW, boxH);
    ctx.save();
    if (options.disabled) {
      ctx.globalAlpha *= 0.48;
      ctx.filter = "grayscale(1) saturate(0.35) brightness(0.82)";
    }
    for (let r = 0; r < shape.length; r += 1) {
      for (let c = 0; c < shape[r].length; c += 1) {
        if (shape[r][c]) drawBlock(preview.offX + c * size, preview.offY + r * size, COLORS[type], false, size);
      }
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawFloaters() {
  for (const f of state.floaters) {
    ctx.globalAlpha = Math.min(1, f.life / 260);
    label(f.text, f.x, f.y, 28, f.color);
    ctx.globalAlpha = 1;
  }
}

function drawCombatPopups() {
  if (!state.combatPopups.length) return;
  ctx.save();
  ctx.textAlign = "left";
  for (const popup of state.combatPopups) {
    drawCombatPopup(popup);
  }
  ctx.restore();
}

function drawCombatPopup(popup) {
  const progress = clamp(1 - popup.life / popup.maxLife, 0, 1);
  const appear = clamp(progress / 0.12, 0, 1);
  const hold = progress < 0.62 ? 1 : clamp(1 - (progress - 0.62) / 0.38, 0, 1);
  const alpha = Math.min(1, appear) * hold;
  if (alpha <= 0) return;

  const baseScale = popup.scale || 1;
  const scale = baseScale * easeOutBack(appear);
  const drift = progress > 0.45 ? (progress - 0.45) * 54 : 0;
  const wobble = Math.sin((progress + popup.seed) * Math.PI * 5) * 3 * (1 - progress);
  const x = popup.x + wobble;
  const y = popup.y - drift;
  const primary = popup.color || "#d7c2ff";
  const accent = popup.accent || "#8ff7ff";
  const perfect = popup.type === "perfect";
  const big = popup.type === "tspin" || popup.type === "perfect";
  const titleSize = perfect ? 36 : big ? 34 : popup.type === "b2b" ? 31 : 30;
  const subSize = perfect ? 17 : 22;

  ctx.save();
  ctx.globalAlpha = alpha * (perfect ? 0.88 : 0.78);
  ctx.translate(x, y);
  ctx.rotate(perfect ? 0 : -0.08);
  ctx.scale(scale, scale);
  ctx.globalCompositeOperation = "source-over";

  drawCombatPopupGlyphs(popup, progress, primary, accent);
  drawCombatPopupTrail(popup, primary, accent, progress);

  ctx.shadowColor = primary;
  ctx.shadowBlur = perfect ? 18 : big ? 15 : 10;
  ctx.lineWidth = perfect ? 4 : big ? 3 : 2.4;
  ctx.strokeStyle = hexToRgba(accent, perfect ? 0.46 : 0.34);
  ctx.font = canvasFont("900", titleSize, popup.text, true);
  ctx.strokeText(popup.text, 0, 0);

  const gradient = ctx.createLinearGradient(0, -titleSize, 220, 8);
  gradient.addColorStop(0, perfect ? "rgba(255, 248, 214, 0.94)" : "rgba(239, 246, 255, 0.9)");
  gradient.addColorStop(0.55, hexToRgba(primary, 0.9));
  gradient.addColorStop(1, hexToRgba(accent, 0.72));
  ctx.fillStyle = gradient;
  ctx.fillText(popup.text, 0, 0);

  if (popup.subText) {
    ctx.shadowBlur = 8;
    ctx.font = canvasFont("900", subSize, popup.subText, true);
    ctx.strokeStyle = "rgba(10, 8, 24, 0.72)";
    ctx.lineWidth = 2.2;
    ctx.strokeText(popup.subText, 4, subSize + 14);
    ctx.fillStyle = popup.type === "b2b" ? "rgba(255, 240, 166, 0.82)" : "rgba(235, 224, 255, 0.82)";
    ctx.fillText(popup.subText, 4, subSize + 14);
  }
  ctx.restore();
}

function drawCombatPopupTrail(popup, primary, accent, progress) {
  const lineCount = popup.type === "perfect" ? 5 : popup.type === "lineClear" ? 2 : 4;
  for (let i = 0; i < lineCount; i += 1) {
    const offset = i * 12;
    ctx.strokeStyle = hexToRgba(i % 2 ? accent : primary, (popup.type === "perfect" ? 0.28 : 0.18) * (1 - progress));
    ctx.lineWidth = popup.type === "perfect" ? 1.9 : 1.35;
    ctx.beginPath();
    ctx.moveTo(-72 - offset, 10 + i * 8);
    ctx.quadraticCurveTo(-30 - offset * 0.4, -8 - i * 4, 142 + offset * 0.2, -28 + i * 10);
    ctx.stroke();
  }
}

function drawCombatPopupGlyphs(popup, progress, primary, accent) {
  const sparkCount = popup.type === "perfect" ? 16 : popup.type === "lineClear" ? 6 : 10;
  const orbit = popup.type === "perfect" ? 86 : 58;
  if (popup.type === "tspin" || popup.type === "spin") drawSpinPopupSigil(progress, primary, accent);
  for (let i = 0; i < sparkCount; i += 1) {
    const angle = popup.seed + i * 2.399 + progress * 1.6;
    const radius = orbit + Math.sin(progress * Math.PI + i) * 12;
    const sx = Math.cos(angle) * radius + 64;
    const sy = Math.sin(angle) * radius * 0.44 - 18;
    const size = (popup.type === "perfect" ? 4.2 : 3.2) * (0.35 + (1 - progress) * 0.65);
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle);
    ctx.fillStyle = hexToRgba(i % 3 === 0 ? accent : primary, popup.type === "perfect" ? 0.72 : 0.48);
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = popup.type === "perfect" ? 8 : 5;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(-size, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawSpinPopupSigil(progress, primary, accent) {
  const rotation = progress * Math.PI * 2.4;
  ctx.save();
  ctx.translate(88, -30);
  ctx.rotate(rotation);
  ctx.strokeStyle = hexToRgba(accent, 0.24 * (1 - progress * 0.35));
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 0, 32, -0.85, Math.PI * 1.45);
  ctx.stroke();
  for (let i = 0; i < 4; i += 1) {
    const a = i * Math.PI * 0.5;
    ctx.fillStyle = hexToRgba(i % 2 ? accent : primary, 0.56);
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 5;
    ctx.fillRect(Math.cos(a) * 32 - 4, Math.sin(a) * 32 - 4, 8, 8);
  }
  ctx.restore();
}

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function drawTutorialPrompt() {
  if (!state.tutorial || state.mode !== "playing") return;
  const step = TUTORIAL_STEPS[state.tutorial.step];
  if (!step && !state.tutorial.done) return;
  const x = 54;
  const y = 636;
  ctx.save();
  ctx.fillStyle = "rgba(3, 5, 10, 0.68)";
  roundedRect(x, y, 360, 54, 10, true, false);
  ctx.strokeStyle = state.tutorial.done ? "rgba(255, 240, 166, 0.54)" : "rgba(145, 232, 222, 0.34)";
  ctx.lineWidth = 2;
  roundedRect(x, y, 360, 54, 10, false, true);
  label(t("tutorialActive").toUpperCase(), x + 16, y + 20, 12, "#8fe8dc");
  label(state.tutorial.done ? t("tutorialDone") : t(step.promptKey), x + 16, y + 41, 15, "#f5f1e6");
  if (!state.tutorial.done) {
    const progress = `${state.tutorial.step + 1}/${TUTORIAL_STEPS.length}`;
    label(progress, x + 314, y + 31, 18, "#fff0a6");
  }
  ctx.restore();
}

function drawDimOverlay(alpha = OVERLAY_READABILITY.scrim.standard) {
  const baseAlpha = clamp(alpha, 0, 0.94);
  ctx.save();
  ctx.fillStyle = `rgba(2, 4, 8, ${baseAlpha})`;
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 620);
  g.addColorStop(0, `rgba(48, 34, 70, ${Math.min(0.16, baseAlpha * 0.16)})`);
  g.addColorStop(0.62, `rgba(0, 0, 0, ${Math.min(0.34, baseAlpha * 0.36)})`);
  g.addColorStop(1, `rgba(0, 0, 0, ${Math.min(0.68, baseAlpha * 0.74)})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawBattleCountdown() {
  if (!isBattleCountdownActive()) return;
  const cue = getCountdownCue();
  const shown = cue === "START" ? t("countdownStart") : cue;
  const progress = 1 - state.countdownMs / BATTLE_COUNTDOWN_MS;
  const board = UI_LAYOUT.boardFrame;
  const layout = UI_LAYOUT.countdown;
  const cx = board.x + board.w / 2;
  const cy = board.y + board.h / 2 + layout.yOffset;
  const numeric = cue !== "START";
  const pulse = Math.sin(progress * Math.PI * 8) * 0.035;
  const scale = numeric ? 1 + pulse : 1 + Math.sin(progress * Math.PI) * 0.08;
  const cardX = cx - layout.cardW / 2;
  const cardY = cy - layout.cardH / 2;
  ctx.save();
  ctx.fillStyle = "rgba(1, 4, 10, 0.38)";
  roundedRect(board.x + 8, board.y + 10, board.w - 16, board.h - 20, 14, true, false);
  ctx.fillStyle = "rgba(1, 4, 10, 0.46)";
  roundedRect(cardX, cardY, layout.cardW, layout.cardH, 16, true, false);
  ctx.strokeStyle = cue === "START" ? "rgba(255, 240, 166, 0.62)" : "rgba(183, 146, 255, 0.48)";
  ctx.lineWidth = 2;
  roundedRect(cardX, cardY, layout.cardW, layout.cardH, 16, false, true);
  if (cue === "START") {
    const glow = ctx.createRadialGradient(cx, cy, 8, cx, cy, 138);
    glow.addColorStop(0, "rgba(255, 240, 166, 0.18)");
    glow.addColorStop(0.46, "rgba(255, 185, 95, 0.08)");
    glow.addColorStop(1, "rgba(255, 185, 95, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(cardX - 38, cardY - 38, layout.cardW + 76, layout.cardH + 76);
  }
  ctx.translate(cx, cy - 2);
  ctx.scale(scale, scale);
  ctx.textAlign = "center";
  ctx.shadowColor = cue === "START" ? "#fff0a6" : "#c7a7ff";
  ctx.shadowBlur = cue === "START" ? 38 : 24;
  ctx.font = canvasFont("900", numeric ? 76 : 42, shown, true);
  const g = ctx.createLinearGradient(-120, -60, 120, 50);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.5, cue === "START" ? "#fff0a6" : "#e2ccff");
  g.addColorStop(1, cue === "START" ? "#ffb95f" : "#b88cff");
  ctx.fillStyle = g;
  ctx.fillText(shown, 0, numeric ? 22 : 14);
  ctx.restore();

  ctx.save();
  const barW = layout.cardW - 24;
  const barX = cx - barW / 2;
  const barY = cardY + layout.cardH + layout.barGap;
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  roundedRect(barX, barY, barW, 8, 5, true, false);
  const fill = ctx.createLinearGradient(barX, barY, barX + barW, barY);
  fill.addColorStop(0, "#7ef7ff");
  fill.addColorStop(0.58, "#c7a7ff");
  fill.addColorStop(1, "#fff0a6");
  ctx.fillStyle = fill;
  roundedRect(barX, barY, barW * progress, 8, 5, true, false);
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  roundedRect(barX, barY, barW, 8, 5, false, true);
  ctx.restore();
}

function drawFirstWaveCombatHint() {
  if (state.mode !== "playing" || isBattleCountdownActive() || state.firstWaveHintMs <= 0) return;
  const progress = 1 - state.firstWaveHintMs / FIRST_WAVE_HINT_MS;
  const fadeIn = clamp(progress / (FIRST_WAVE_HINT_FADE_MS / FIRST_WAVE_HINT_MS), 0, 1);
  const fadeOut = clamp(state.firstWaveHintMs / FIRST_WAVE_HINT_FADE_MS, 0, 1);
  const alpha = Math.min(fadeIn, fadeOut);
  if (alpha <= 0) return;

  const board = UI_LAYOUT.boardFrame;
  const w = 462;
  const h = 40;
  const x = board.x + board.w / 2 - w / 2;
  const y = 14;
  const text = t("firstWaveCombatHint");

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = "rgba(126, 231, 255, 0.24)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "rgba(3, 5, 10, 0.68)";
  roundedRect(x, y, w, h, 11, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(183, 146, 255, 0.34)";
  ctx.lineWidth = 1.4;
  roundedRect(x, y, w, h, 11, false, true);
  ctx.fillStyle = "rgba(126, 231, 255, 0.12)";
  roundedRect(x + 10, y + 10, 20, 20, 6, true, false);
  ctx.strokeStyle = "rgba(126, 231, 255, 0.34)";
  roundedRect(x + 10, y + 10, 20, 20, 6, false, true);
  ctx.fillStyle = "#8fe8dc";
  ctx.textAlign = "center";
  ctx.font = canvasFont("900", 13, "!", true);
  ctx.fillText("!", x + 20, y + 25);
  ctx.textAlign = "left";
  fitLabel(text, x + 42, y + 25, w - 58, 15, "#f5f1e6", 12, "800");
  ctx.restore();
}

function menuActionText(key) {
  if (state.language !== "en") return t(key);
  if (key === "startGame") return "START";
  if (key === "mainStageStart") return "MAIN STAGE";
  if (key === "settings") return "SETTINGS";
  if (key === "moveGuide") return "MOVE GUIDE";
  return t(key).toUpperCase();
}

function drawAssetLoadingScreen() {
  const now = performance.now();
  const model = createLoadingOverlayModel({
    summary: getAssetLoadingSummary(),
    now,
    startedAt: state.assetLoadingStartedAt,
    debugEnabled: DEBUG_HUD_ENABLED,
    debugBuild: DEBUG_HUD_BUILD,
    drawError: state.debug.drawError,
  });
  drawLoadingOverlay(ctx, model, {
    canvasFont,
    drawCornerGlyph,
    drawDimOverlay,
    roundedRect,
  });
}

function drawStartMenuOverlay() {
  const now = performance.now();
  const menuMotion = createMenuMotionModel({
    now,
    startedAt: state.menuRevealStartedAt || state.assetLoadingStartedAt,
  });
  const m = UI_LAYOUT.menu;
  const pad = m.padding || 36;
  const bx = m.x + pad;
  const bw = m.w - pad * 2;
  const buttons = getMainMenuButtonRects();
  drawMainMenuScene(menuMotion);
  drawMenuHeroShowcase();
  ctx.save();
  ctx.textAlign = "left";
  ctx.shadowColor = "rgba(190, 140, 255, 0.86)";
  ctx.shadowBlur = 34;
  ctx.font = canvasFont("900", 70, t("startTitle"), true);
  const titleGradient = ctx.createLinearGradient(72, 48, 540, 166);
  titleGradient.addColorStop(0, "#fff8dc");
  titleGradient.addColorStop(0.52, "#ffe0a3");
  titleGradient.addColorStop(1, "#d7c2ff");
  const titleParts = t("startTitle").split(" ");
  const titleA = titleParts[0] || t("startTitle");
  const titleB = titleParts.slice(1).join(" ") || "";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(22, 14, 42, 0.72)";
  ctx.strokeText(titleA, 72, 92);
  ctx.strokeText(titleB, 72, 152);
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = "rgba(227, 206, 255, 0.54)";
  ctx.strokeText(titleA, 72, 92);
  ctx.strokeText(titleB, 72, 152);
  ctx.fillStyle = titleGradient;
  ctx.fillText(titleA, 72, 92);
  ctx.fillText(titleB, 72, 152);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.34;
  ctx.fillStyle = "rgba(255, 250, 220, 0.55)";
  ctx.fillText(titleA, 74, 89);
  ctx.fillText(titleB, 74, 149);
  ctx.restore();
  ctx.shadowBlur = 0;
  const underline = ctx.createLinearGradient(92, 178, 422, 178);
  underline.addColorStop(0, "rgba(255, 240, 166, 0)");
  underline.addColorStop(0.35, "rgba(255, 240, 166, 0.48)");
  underline.addColorStop(1, "rgba(126, 238, 255, 0)");
  ctx.strokeStyle = underline;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(92, 178);
  ctx.lineTo(422, 178);
  ctx.stroke();
  drawMenuTitleWake(ctx, menuMotion, { x: 92, y: 178, w: 330 });
  ctx.shadowColor = "rgba(126, 238, 255, 0.34)";
  ctx.shadowBlur = 10;
  label(t("startTagline").toUpperCase(), 106, 210, 17, "#e0d2ff");
  ctx.shadowBlur = 0;
  wrapText(t("startWorldHint"), 106, 248, 372, 25, "rgba(245,248,255,0.78)", 15);
  drawMenuHeroDialogueBubble();

  drawCard(m.x, m.y, m.w, m.h);
  drawCornerGlyph(m.x + m.w / 2, m.y - 2, "#9fb4ff");
  label(t("menuActions").toUpperCase(), bx, m.y + 58, 15, "#fff0a6");
  wrapText(t("startPanelHint"), bx, m.y + 88, bw, 19, "rgba(238,244,252,0.58)", 12);
  drawMenuButton(buttons.start.x, buttons.start.y, buttons.start.w, buttons.start.h, menuActionText("startGame"), "Enter", "primary", { motion: getMenuButtonMotion(menuMotion, 0) });
  drawMenuButton(buttons.mainStage.x, buttons.mainStage.y, buttons.mainStage.w, buttons.mainStage.h, menuActionText("mainStageStart"), t("mainStageEgyptShort"), "secondary", { motion: getMenuButtonMotion(menuMotion, 1) });
  drawMenuButton(buttons.metaUpgrade.x, buttons.metaUpgrade.y, buttons.metaUpgrade.w, buttons.metaUpgrade.h, menuActionText("upgradeMenu"), "", "secondary", { motion: getMenuButtonMotion(menuMotion, 2) });
  drawMenuButton(buttons.guide.x, buttons.guide.y, buttons.guide.w, buttons.guide.h, menuActionText("moveGuide"), "Spin", "secondary", { motion: getMenuButtonMotion(menuMotion, 3) });
  drawMenuButton(buttons.settings.x, buttons.settings.y, buttons.settings.w, buttons.settings.h, menuActionText("settings"), "", "secondary", { motion: getMenuButtonMotion(menuMotion, 4) });
  label(t("startHint"), bx, m.y + m.h - 42, 13, "#9fb4ff");
  ctx.restore();
}

function drawMainMenuScene(menuMotion = null) {
  ctx.save();
  if (isImageReady(forestBg)) ctx.drawImage(forestBg, 0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "rgba(3, 6, 14, 0.74)");
  g.addColorStop(0.46, "rgba(4, 7, 14, 0.48)");
  g.addColorStop(1, "rgba(1, 2, 6, 0.92)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  drawMenuAmbientRift(menuMotion);
  ctx.strokeStyle = "rgba(255, 240, 166, 0.18)";
  ctx.beginPath();
  ctx.moveTo(86, 642);
  ctx.bezierCurveTo(262, 602, 462, 674, 700, 614);
  ctx.stroke();
  ctx.restore();
}

function isMenuHeroInteractive() {
  return state.mode === "start" && state.assetLoadingDone && !state.settingsOpen;
}

function getMenuHeroHitRect() {
  const hero = UI_LAYOUT.menuHero;
  return {
    x: hero.x - 150 * hero.scale,
    y: hero.y - 328 * hero.scale,
    w: 330 * hero.scale,
    h: 452 * hero.scale,
  };
}

function isPointOverMenuHero(x, y) {
  const rect = getMenuHeroHitRect();
  return isMenuHeroInteractive() && pointInRect(x, y, rect.x, rect.y, rect.w, rect.h);
}

function updateMenuHeroHoverFromPointer(x = state.pointer.x, y = state.pointer.y) {
  const interaction = state.menuHeroInteraction;
  const hovered = isPointOverMenuHero(x, y);
  const now = performance.now();
  if (hovered && !interaction.hovered) {
    interaction.hoverStartedAt = now;
    setMenuHeroDialogue("hover", now);
  }
  interaction.hovered = hovered;
  if (!hovered && interaction.lineKind === "hover" && now > interaction.lineStartedAt + 500) {
    interaction.lineUntil = Math.min(interaction.lineUntil, now + 520);
  }
  return hovered;
}

function setMenuHeroDialogue(kind, now = performance.now()) {
  const keys = MENU_HERO_DIALOGUE_KEYS[kind] || MENU_HERO_DIALOGUE_KEYS.hover;
  const interaction = state.menuHeroInteraction;
  const index = interaction.lineIndex % keys.length;
  interaction.lineIndex += 1;
  interaction.lineKey = keys[index];
  interaction.lineKind = kind;
  interaction.lineStartedAt = now;
  interaction.lineUntil = now + (MENU_HERO_DIALOGUE_MS[kind] || MENU_HERO_DIALOGUE_MS.hover);
}

function triggerMenuHeroAction(kind = "click") {
  if (!isMenuHeroInteractive()) return false;
  const now = performance.now();
  const interaction = state.menuHeroInteraction;
  const canTriggerIdle = now >= interaction.idleCooldownUntil;
  interaction.hovered = true;
  interaction.actionKind = kind;
  interaction.actionStartedAt = now;
  interaction.actionUntil = now + 1120;
  if (canTriggerIdle) {
    const idleKind = interaction.idleTriggerCount % 2 === 0 ? "cube" : "meditate";
    const config = getMenuHeroIdleConfig(idleKind);
    const duration = getAnimationDuration(config) || ((config?.frames?.length || 1) * (config?.frameMs || 120));
    interaction.idleKind = idleKind;
    interaction.idleStartedAt = now;
    interaction.idleUntil = now + duration;
    interaction.idleCooldownUntil = now + MENU_HERO_IDLE_TRIGGER_COOLDOWN_MS;
    interaction.idleTriggerCount += 1;
  }
  setMenuHeroDialogue("click", now);
  playSfx("hold");
  return true;
}

function updateMenuHeroInteractionForFrame(now = performance.now()) {
  const interaction = state.menuHeroInteraction;
  if (!isMenuHeroInteractive()) {
    interaction.hovered = false;
    return;
  }
  if (interaction.actionKind && now >= interaction.actionUntil) interaction.actionKind = "";
  if (interaction.idleUntil && now >= interaction.idleUntil) {
    interaction.idleStartedAt = 0;
    interaction.idleUntil = 0;
  }
  if (interaction.hovered && now > interaction.actionUntil && now > interaction.lineUntil + 1300) {
    setMenuHeroDialogue("hover", now);
  }
}

function getMenuHeroInteractionMotion(now = performance.now()) {
  updateMenuHeroInteractionForFrame(now);
  const interaction = state.menuHeroInteraction;
  const hoverPulse = interaction.hovered ? 0.5 + Math.sin(now * 0.008) * 0.5 : 0;
  let action = 0;
  if (interaction.actionUntil > now) {
    const duration = Math.max(1, interaction.actionUntil - interaction.actionStartedAt);
    const progress = clamp((now - interaction.actionStartedAt) / duration, 0, 1);
    action = Math.sin(progress * Math.PI);
  }
  const intensity = Math.max(hoverPulse * 0.55, action);
  return {
    x: action * 8,
    y: -action * 12 - hoverPulse * 1.6,
    rotate: action * 0.052 + hoverPulse * 0.006,
    scale: 1 + hoverPulse * 0.016 + action * 0.055,
    shadow: hoverPulse * 7 + action * 11,
    aura: intensity,
  };
}

function drawMenuHeroInteractionGlow(motion, now) {
  if (motion.aura <= 0.02) return;
  const baseline = CHARACTER_BASELINES.menu.localY;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.18 + motion.aura * 0.36;
  ctx.strokeStyle = motion.aura > 0.75 ? "#fff0a6" : "#7ef7ff";
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = 16 + motion.aura * 18;
  ctx.lineWidth = 1.6 + motion.aura * 1.4;
  ctx.beginPath();
  ctx.ellipse(0, baseline, 92 + motion.aura * 18, 20 + motion.aura * 5, 0, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 7; i += 1) {
    const angle = now * 0.002 + i * 0.92;
    const r = 76 + (i % 3) * 14 + motion.aura * 8;
    const x = Math.cos(angle) * r;
    const y = 8 + Math.sin(angle * 1.35) * 70;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 4);
    ctx.fillStyle = i % 2 ? "#d7c2ff" : "#7ef7ff";
    ctx.fillRect(-3, -3, 6, 6);
    ctx.restore();
  }
  ctx.restore();
}

function getMenuHeroIdleConfig(kind = "cube") {
  return kind === "meditate"
    ? MENU_HERO_SPECIAL_ANIMATIONS.meditate
    : MENU_HERO_SPECIAL_ANIMATIONS.cube;
}

function getMenuHeroIdlePlayback(now = performance.now()) {
  const interaction = state.menuHeroInteraction;
  const active = interaction.idleUntil > now;
  return {
    active,
    config: getMenuHeroIdleConfig(active ? interaction.idleKind : "cube"),
    elapsed: active ? now - interaction.idleStartedAt : 0,
  };
}

function drawMenuHeroIdleSprite(now = performance.now(), alpha = 1) {
  const playback = getMenuHeroIdlePlayback(now);
  const config = playback.config;
  if (!config || !isImageReady(config.image)) return false;
  const draw = alignDrawBoxToBaseline(config.draw, CHARACTER_BASELINES.menu.localY);
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (playback.active) drawSpriteAnimationFrame(config, playback.elapsed, draw.x, draw.y, draw.w, draw.h);
  else drawSpriteSheetFrame(config, config.frames[0], draw.x, draw.y, draw.w, draw.h);
  ctx.restore();
  return true;
}

function drawMenuHeroDialogueBubble() {
  const interaction = state.menuHeroInteraction;
  const now = performance.now();
  if (!interaction.lineKey || now >= interaction.lineUntil || !isMenuHeroInteractive()) return;
  const age = now - interaction.lineStartedAt;
  const remaining = interaction.lineUntil - now;
  const alpha = Math.min(clamp(age / 180, 0, 1), clamp(remaining / 320, 0, 1));
  if (alpha <= 0) return;

  const hero = UI_LAYOUT.menuHero;
  const bubbleW = state.language === "en" ? 342 : 316;
  const bubbleH = state.language === "en" ? 86 : 76;
  const x = clamp(hero.x + 116 * hero.scale, 96, UI_LAYOUT.menu.x - bubbleW - 28);
  const y = clamp(hero.y - 260 * hero.scale, 286, 456);
  const tailX = hero.x + 42 * hero.scale;
  const tailY = hero.y - 120 * hero.scale;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = "rgba(126, 231, 255, 0.28)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "rgba(5, 9, 17, 0.84)";
  ctx.beginPath();
  ctx.moveTo(x + 42, y + bubbleH - 2);
  ctx.lineTo(x + 72, y + bubbleH - 2);
  ctx.lineTo(tailX, tailY);
  ctx.closePath();
  ctx.fill();
  roundedRect(x, y, bubbleW, bubbleH, 10, true, false);
  ctx.shadowBlur = 0;
  const glow = ctx.createLinearGradient(x, y, x + bubbleW, y + bubbleH);
  glow.addColorStop(0, "rgba(126, 231, 255, 0.14)");
  glow.addColorStop(0.55, "rgba(183, 146, 255, 0.13)");
  glow.addColorStop(1, "rgba(255, 240, 166, 0.12)");
  ctx.fillStyle = glow;
  roundedRect(x + 5, y + 5, bubbleW - 10, bubbleH - 10, 8, true, false);
  ctx.strokeStyle = interaction.lineKind === "click" ? "rgba(255, 240, 166, 0.62)" : "rgba(126, 231, 255, 0.44)";
  ctx.lineWidth = 1.8;
  roundedRect(x, y, bubbleW, bubbleH, 10, false, true);
  label("NOA", x + 18, y + 24, 11, "#fff0a6");
  wrapText(t(interaction.lineKey), x + 18, y + 48, bubbleW - 34, 19, "#f5f1e6", 13);
  ctx.restore();
}

function drawMenuAmbientRift(menuMotion = null) {
  const nowMs = performance.now();
  const now = nowMs * 0.001;
  const motion = menuMotion || createMenuMotionModel({ now: nowMs, startedAt: nowMs - 1800 });
  const cx = 632;
  const cy = 318;
  const rift = ctx.createRadialGradient(cx, cy, 12, cx, cy, 270);
  rift.addColorStop(0, "rgba(185, 140, 255, 0.065)");
  rift.addColorStop(0.36, "rgba(105, 216, 255, 0.024)");
  rift.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = rift;
  ctx.fillRect(300, 70, 560, 510);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 24; i += 1) {
    const drift = (now * 0.055 + i * 0.137) % 1;
    const x = cx - 208 + (i * 47) % 406 + Math.sin(now * 0.9 + i) * 8;
    const y = cy - 128 + drift * 260;
    ctx.globalAlpha = 0.03 + (1 - Math.abs(drift - 0.5) * 2) * 0.06;
    ctx.fillStyle = i % 3 ? "#8fe8dc" : "#d7c2ff";
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = "rgba(190, 146, 255, 0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 18, cy - 88);
  ctx.lineTo(cx, cy - 108);
  ctx.lineTo(cx + 18, cy - 88);
  ctx.lineTo(cx, cy - 68);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
  drawMenuAmbientMotion(ctx, motion, { cx, cy });
}

function drawMenuHeroShowcase() {
  const now = performance.now();
  const pose = getMenuIdlePose(now);
  const motion = getMenuIdleMotion(pose, now);
  const interaction = getMenuHeroInteractionMotion(now);
  const hero = UI_LAYOUT.menuHero;
  const anchorX = hero.x;
  const anchorY = hero.y;
  drawMenuIdleParticles(anchorX, anchorY, pose, motion, now);
  ctx.save();
  ctx.translate(anchorX + motion.x + interaction.x, anchorY + motion.y + interaction.y);
  ctx.rotate(motion.rotate + interaction.rotate);
  ctx.scale(hero.scale * motion.scaleX * interaction.scale, hero.scale * motion.scaleY * interaction.scale);
  drawCharacterShadow(0, CHARACTER_BASELINES.menu.localY, CHARACTER_BASELINES.menu.shadowW + motion.shadow + interaction.shadow, "#6de8ff");
  drawMenuHeroInteractionGlow(interaction, now);
  if (motion.afterimage > 0.02) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = motion.afterimage;
    ctx.translate(-motion.x * 0.55 - 3, 2);
    ctx.scale(1.01, 1);
    drawHeroIdleBase("menu");
    ctx.restore();
  }
  drawHeroIdleBase("menu");
  drawMenuCloakSway(motion, now);
  drawMenuWeaponPulse(motion, now);
  drawMenuEyeGlow(motion, now);
  drawMenuIdleAura(motion, now);
  ctx.restore();
}

function getMenuSpecialIdle(now = performance.now()) {
  const animationKeys = Object.keys(MENU_HERO_SPECIAL_ANIMATIONS);
  if (!animationKeys.length) return null;
  const cycle = MENU_SPECIAL_IDLE_INTERVAL_MS * animationKeys.length;
  const elapsed = (now - state.menuSpecialIdleStartedAt) % cycle;
  const slot = Math.floor(elapsed / MENU_SPECIAL_IDLE_INTERVAL_MS);
  const local = elapsed - slot * MENU_SPECIAL_IDLE_INTERVAL_MS;
  const key = animationKeys[slot % animationKeys.length];
  const config = MENU_HERO_SPECIAL_ANIMATIONS[key];
  const duration = config.frames.length * config.frameMs;
  if (local > duration) return null;
  if (!isImageReady(config.image)) return null;
  const fadeIn = smoothstep(0, MENU_SPECIAL_IDLE_FADE_MS, local);
  const fadeOut = 1 - smoothstep(duration - MENU_SPECIAL_IDLE_FADE_MS, duration, local);
  return { config, elapsed: local, alpha: Math.min(fadeIn, fadeOut) };
}

function drawMenuSpecialIdleFrame(specialIdle) {
  const { config, elapsed, alpha } = specialIdle;
  const frameIndex = Math.min(config.frames.length - 1, Math.floor(elapsed / config.frameMs));
  const frame = config.frames[frameIndex];
  const draw = config.draw;
  if (alpha < 0.98) {
    ctx.save();
    ctx.globalAlpha *= 1 - alpha;
    drawHeroIdleBase("menu");
    ctx.restore();
  }
  ctx.save();
  ctx.globalAlpha *= alpha;
  const alignedDraw = alignDrawBoxToBaseline(draw, CHARACTER_BASELINES.menu.localY);
  drawSpriteSheetFrame(config, frame, alignedDraw.x, alignedDraw.y, alignedDraw.w, alignedDraw.h);
  ctx.restore();
}

function getMenuIdlePose(now = performance.now()) {
  const total = MENU_IDLE_SEQUENCE.reduce((sum, segment) => sum + segment.duration, 0);
  let cursor = now % total;
  for (const segment of MENU_IDLE_SEQUENCE) {
    if (cursor <= segment.duration) {
      const progress = clamp(cursor / segment.duration, 0, 1);
      const transition = Math.min(MENU_IDLE_TRANSITION_MS / segment.duration, 0.28);
      const easeIn = smoothstep(0, transition, progress);
      const easeOut = 1 - smoothstep(1 - transition, 1, progress);
      return {
        id: segment.id,
        duration: segment.duration,
        progress,
        intensity: segment.id === "idleA" ? 1 : Math.min(easeIn, easeOut),
      };
    }
    cursor -= segment.duration;
  }
  return { id: "idleA", duration: 2800, progress: 0, intensity: 1 };
}

function getMenuIdleMotion(pose, now) {
  const time = now * 0.001;
  const breath = Math.sin(time * 2.72);
  const slowBreath = Math.sin(time * 1.38);
  const focus = pose.intensity * Math.sin(pose.progress * Math.PI);
  const motion = {
    x: slowBreath * 1.15,
    y: breath * 4.8,
    rotate: slowBreath * 0.008,
    scaleX: 1 - breath * 0.006,
    scaleY: 1 + breath * 0.015,
    weapon: 0.58 + (Math.sin(time * 4.2) + 1) * 0.18,
    eye: 0.22,
    cloak: 0.46 + (Math.sin(time * 1.95) + 1) * 0.24,
    shadow: breath * 6,
    afterimage: 0,
    particles: 0.5,
  };

  if (pose.id === "idleB") {
    motion.x -= focus * 5.4;
    motion.y += focus * 6.4;
    motion.rotate += focus * 0.05;
    motion.scaleY -= focus * 0.016;
    motion.weapon += focus * 0.66;
    motion.eye += focus * 0.1;
    motion.cloak += focus * 0.34;
    motion.particles += focus * 0.5;
  } else if (pose.id === "idleC") {
    motion.y -= focus * 7.6;
    motion.rotate -= focus * 0.024;
    motion.scaleY += focus * 0.018;
    motion.weapon += focus * 0.28;
    motion.eye += focus * 0.82;
    motion.cloak += focus * 0.26;
    motion.particles += focus * 0.36;
  } else if (pose.id === "idleD") {
    const shift = Math.sin(pose.progress * Math.PI * 2);
    const settle = Math.sin(pose.progress * Math.PI);
    motion.x += shift * 9.8 * pose.intensity;
    motion.y += settle * 3.4;
    motion.rotate += shift * 0.044 * pose.intensity;
    motion.scaleX += Math.abs(shift) * 0.02;
    motion.scaleY -= Math.abs(shift) * 0.01;
    motion.weapon += settle * 0.32;
    motion.eye += settle * 0.24;
    motion.cloak += Math.abs(shift) * 0.58;
    motion.afterimage = Math.abs(shift) * 0.14;
    motion.particles += settle * 0.32;
  }

  return motion;
}

function drawMenuCloakSway(motion, now) {
  const time = now * 0.001;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  for (let i = 0; i < 5; i += 1) {
    const sway = Math.sin(time * 2.05 + i * 0.8) * 9.5 * motion.cloak;
    ctx.globalAlpha = 0.07 + motion.cloak * 0.055;
    ctx.strokeStyle = i % 2 ? "rgba(121, 230, 255, 0.52)" : "rgba(190, 126, 255, 0.55)";
    ctx.lineWidth = i === 4 ? 1 : 1.35;
    ctx.beginPath();
    ctx.moveTo(-78 + i * 37, 20);
    ctx.quadraticCurveTo(-92 + i * 40 + sway, 86, -72 + i * 38 - sway * 0.52, 166);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMenuWeaponPulse(motion, now) {
  const time = now * 0.001;
  const pulse = clamp(motion.weapon, 0, 1.35);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = "#b579ff";
  ctx.shadowBlur = 14 + pulse * 16;
  const coreX = -52 + Math.sin(time * 2.8) * 2.2;
  const coreY = 76 + Math.cos(time * 2.2) * 1.6;
  const aura = 22 + pulse * 11;
  const glow = ctx.createRadialGradient(coreX, coreY, 3, coreX, coreY, aura);
  glow.addColorStop(0, `rgba(244, 232, 255, ${0.34 + pulse * 0.18})`);
  glow.addColorStop(0.42, `rgba(154, 84, 255, ${0.16 + pulse * 0.12})`);
  glow.addColorStop(1, "rgba(154, 84, 255, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(coreX, coreY, aura, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.24 + pulse * 0.18;
  ctx.fillStyle = "#d7b8ff";
  ctx.fillRect(coreX - 4, coreY - 4, 8, 8);
  for (let i = 0; i < 8; i += 1) {
    const p = (time * 0.42 + i * 0.18) % 1;
    const angle = i * 1.34 + time * 0.58;
    const radius = 12 + p * 36;
    const x = coreX + Math.cos(angle) * radius * 0.8;
    const y = coreY + Math.sin(angle) * radius * 0.5 - p * 10;
    ctx.globalAlpha = (0.15 + pulse * 0.14) * (1 - p);
    ctx.fillStyle = i % 2 ? "#b889ff" : "#7ff2ff";
    ctx.fillRect(x, y, 2.4, 2.4);
  }
  ctx.restore();
}

function drawMenuEyeGlow(motion, now) {
  const time = now * 0.001;
  const alpha = clamp(0.1 + motion.eye * 0.42 + Math.sin(time * 4) * 0.025, 0.08, 0.55);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = "#d7ccff";
  ctx.shadowBlur = 14 + motion.eye * 16;
  ctx.fillStyle = `rgba(224, 238, 255, ${alpha})`;
  ctx.beginPath();
  ctx.ellipse(-30, -78, 12 + motion.eye * 2, 4.4, -0.12, 0, Math.PI * 2);
  ctx.ellipse(24, -79, 12 + motion.eye * 2, 4.4, 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMenuIdleAura(motion, now) {
  const time = now * 0.001;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = `rgba(174, 123, 255, ${0.24 + motion.particles * 0.14})`;
  ctx.shadowColor = "#9b78ff";
  ctx.shadowBlur = 20;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.ellipse(0, 132, 72 + Math.sin(time * 1.8) * 6, 20, 0, Math.PI * 0.05, Math.PI * 1.86);
  ctx.stroke();
  ctx.restore();
}

function drawMenuIdleParticles(anchorX, anchorY, pose, motion, now) {
  const time = now * 0.001;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const count = 12 + Math.floor(motion.particles * 11);
  for (let i = 0; i < count; i += 1) {
    const drift = (time * (0.24 + i * 0.014) + i * 0.173) % 1;
    const angle = i * 1.78 + time * 0.42;
    const radius = 82 + (i % 4) * 24 + pose.intensity * 14;
    const x = anchorX - 18 + Math.cos(angle) * radius * 0.78;
    const y = anchorY + 112 - drift * 252 + Math.sin(angle * 1.3) * 20;
    ctx.globalAlpha = (0.14 + motion.particles * 0.18) * (1 - Math.abs(drift - 0.5));
    ctx.fillStyle = i % 3 === 0 ? "#7ff2ff" : i % 3 === 1 ? "#b889ff" : "#fff0a6";
    ctx.fillRect(x, y, 3 + (i % 2), 3 + (i % 2));
  }
  ctx.restore();
}

function drawOverlay() {
  if (state.mode === "art") setGameMode("start");
  const overlayPath = getOverlayRenderPath(state);
  if (overlayPath === "none") return;
  if (overlayPath === "result") {
    if (state.mode === "defeat" && !state.defeatRenderTraceWarned) {
      state.defeatRenderTraceWarned = true;
      console.warn("[T-Spin Traveler] Defeat render trace", {
        mode: state.mode,
        runFinalized: state.runFinalized,
        overlayPath,
        hasResultOverlay: typeof drawResultOverlay === "function",
        active: getActivePieceDebugInfo(),
        pendingHits: state.pendingHits.length,
        countdownMs: state.countdownMs,
        hitStopMs: state.hitStopMs,
      });
    }
    drawResultOverlay();
    return;
  }
  if (overlayPath === "ascensionResult") {
    drawAscensionResultOverlay();
    return;
  }
  if (overlayPath === "metaUpgrade") {
    drawMetaUpgradeScreen();
    return;
  }
  if (overlayPath === "upgrade") {
    drawUpgradeOverlay();
    return;
  }
  if (overlayPath === "guide") {
    drawMoveGuideOverlay();
    return;
  }
  if (overlayPath === "pause") {
    drawPauseOverlay();
    return;
  }
  if (overlayPath === "assetLoading") {
    drawAssetLoadingScreen();
    return;
  }
  if (overlayPath === "start") {
    drawStartMenuOverlay();
    if (state.settingsOpen) drawSettingsOverlay("start");
    return;
  }
  ctx.save();
  drawDimOverlay(OVERLAY_READABILITY.scrim.standard);
  drawCard(318, 126, 644, 324);
  const title =
    state.mode === "start"
      ? t("startTitle")
      : state.mode === "paused"
        ? t("paused")
        : state.mode === "victory"
          ? t("victory")
          : t("defeat");
  label(title, 382, 206, 48, "#f5f1e6");
  const sub =
    state.mode === "start"
      ? t("startSubtitle")
      : getMessage();
  wrapText(sub, 384, 260, 504, 28, "rgba(238,244,252,0.76)", 19);
  if (state.mode === "start") {
    drawMenuButton(384, 318, 510, 54, t("endless"), "Enter");
    drawMenuButton(384, 386, 510, 44, t("mainStageStart"), t("mainStageEgyptShort"));
    drawMenuButton(384, 454, 244, 44, t("settings"), "Esc");
    drawMenuButton(650, 454, 244, 44, t("practice"), "spins");
    label(t("startHint"), 384, 534, 18, "#9fb4ff");
    if (!state.save.tutorialCompleted) label(t("firstRunHint"), 384, 562, 14, "#fff0a6");
  } else {
    drawMenuButton(384, 318, 248, 44, t("retry"), "Enter");
    drawMenuButton(646, 318, 248, 44, t("menu"), "Esc");
  }
  ctx.restore();
}

function drawResultOverlay() {
  state.debug.resultOverlayDrawn = true;
  const victory = state.mode === "victory";
  const accent = victory ? "#fff0a6" : "#ff8f98";
  const buttons = getResultButtonRects();
  ctx.save();
  drawDimOverlay(OVERLAY_READABILITY.scrim.result);
  drawCard(318, 62, 644, 536);
  ctx.textAlign = "left";
  label(victory ? t("victory") : t("defeat"), 382, 134, 48, "#f5f1e6");
  ctx.fillStyle = accent;
  roundedRect(384, 156, 210, 4, 8, true, false);
  wrapText(getMessage(), 384, 186, 504, 28, "rgba(238,244,252,0.76)", 19);
  drawRunSummary();
  drawMenuButton(buttons.retry.x, buttons.retry.y, buttons.retry.w, buttons.retry.h, t("retry"), "R", "primary");
  drawMenuButton(buttons.upgrade.x, buttons.upgrade.y, buttons.upgrade.w, buttons.upgrade.h, t("upgradeMenu"), "");
  drawMenuButton(buttons.menu.x, buttons.menu.y, buttons.menu.w, buttons.menu.h, t("menu"), "Esc");
  ctx.restore();
}

function drawPauseOverlay() {
  if (state.pauseView === "settings") {
    drawSettingsOverlay("pause");
    return;
  }
  const m = UI_LAYOUT.pauseMenu;
  ctx.save();
  drawDimOverlay(OVERLAY_READABILITY.scrim.pause);
  drawCard(m.x, m.y, m.w, m.h);
  label(t("pauseMenu"), m.x + 48, m.y + 76, 42, "#f5f1e6");
  wrapText(t("pauseMenuHint"), m.x + 50, m.y + 112, m.w - 100, 22, "rgba(238,244,252,0.62)", 15);
  drawMenuButton(m.x + 56, m.y + 156, m.w - 112, 48, t("resume"), controlDisplayValue("pause"), "primary");
  drawMenuButton(m.x + 56, m.y + 216, m.w - 112, 44, t("restart"), "R");
  drawMenuButton(m.x + 56, m.y + 270, m.w - 112, 44, t("settings"), "");
  drawMenuButton(m.x + 56, m.y + 324, m.w - 112, 44, t("menu"), "Esc");
  drawPauseStat(m.x + 58, m.y + 400, t("waveLabel"), state.wave);
  drawPauseStat(m.x + 252, m.y + 400, t("comboLabel"), state.combo);
  ctx.restore();
}

function drawSettingsOverlay(source = "pause") {
  drawSettingsScreenOverlay(getSettingsScreenRenderContext(), source);
}

function getSettingsScreenRenderContext() {
  return {
    audio,
    canvasFont,
    controlActions: CONTROL_ACTIONS,
    ctx,
    drawCard,
    drawDimOverlay,
    drawImageContain,
    drawMenuButton,
    fitLabel,
    formatControlKey,
    getControlKeys,
    getControlsResetButtonRect,
    getHandlingResetButtonRect,
    getSettingsBackButtonRect,
    getSettingsFeedbackButtonRect,
    getSettingsFeedbackCardRect,
    getSettingsSliderTrackWidth,
    getSettingsSliderTrackX,
    label,
    layout: UI_LAYOUT,
    noaFeedbackBowArt,
    roundedRect,
    settingsTabs: SETTINGS_TABS,
    state,
    t,
    tuningSliders: TUNING_SLIDERS,
    wrapText,
  };
}

function drawPauseStat(x, y, name, value) {
  ctx.save();
  ctx.fillStyle = OVERLAY_READABILITY.surface.fill;
  roundedRect(x, y - 22, 190, 28, 7, true, false);
  ctx.strokeStyle = "rgba(145, 232, 222, 0.16)";
  roundedRect(x, y - 22, 190, 28, 7, false, true);
  label(name, x + 14, y - 3, 14, "rgba(238,244,252,0.58)");
  label(String(value), x + 128, y - 3, 15, "#f5f1e6");
  ctx.restore();
}

function drawPauseDamageDetail(x, y, w, h) {
  const breakdown = state.lastDamageBreakdown;
  ctx.save();
  ctx.fillStyle = OVERLAY_READABILITY.surface.fill;
  roundedRect(x, y, w, h, 8, true, false);
  ctx.strokeStyle = "rgba(255, 240, 166, 0.18)";
  roundedRect(x, y, w, h, 8, false, true);
  label(t("damageFormula"), x + 14, y + 22, 15, "#fff0a6");
  if (!breakdown) {
    wrapText(t("damageEquationHint"), x + 14, y + 44, w - 28, 15, "rgba(238,244,252,0.52)", 11);
    ctx.restore();
    return;
  }
  label(`${breakdown.title} = ${breakdown.total} ${t("dmgShort")}`, x + 14, y + 43, 13, "#f5f1e6");
  wrapText(buildDamageEquation(breakdown, { translate: t }), x + 14, y + 62, w - 28, 14, "rgba(238,244,252,0.64)", 10);
  ctx.restore();
}

function drawRunSummary() {
  const rows = [
    [t("waveLabel"), state.stats.peakWave, `${t("bestLabel")} ${state.save.bestWave || 0}`],
    [t("runMaxCombo"), state.stats.maxCombo, `${t("bestLabel")} ${state.save.bestCombo || 0}`],
    [t("runB2BCount"), state.stats.b2bCount, `${t("bestLabel")} ${state.save.bestB2B || 0}`],
    [t("runPerfectClear"), state.stats.perfectClears, `${t("bestLabel")} ${state.save.perfectClears || 0}`],
    [t("runSpinCount"), `${state.stats.spins} / ${t("allSpinShort")} ${state.stats.allSpins}`, ""],
    [t("summaryDamage"), state.stats.damage, `${t("bestLabel")} ${state.save.bestDamage || 0}`],
    [t("summaryBestHit"), state.stats.bestHit, `${t("bestLabel")} ${state.save.bestHit || 0}`],
  ];
  ctx.save();
  label(fmt("rating", { rating: state.stats.rating }), 384, 244, 23, getRatingColor(state.stats.rating));
  for (let i = 0; i < rows.length; i += 1) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 384 + col * 258;
    const y = 278 + row * 32;
    ctx.fillStyle = OVERLAY_READABILITY.surface.fillSoft;
    roundedRect(x, y - 20, 244, 24, 6, true, false);
    label(rows[i][0], x + 12, y - 3, 13, "rgba(238,244,252,0.54)");
    label(String(rows[i][1]), x + 118, y - 3, 15, "#f5f1e6");
    if (rows[i][2]) label(rows[i][2], x + 168, y - 3, 11, "#9fb4ff");
  }
  drawResultRiftEnergyPanel(384, 390, 510, 60);
  label(t("summaryDamageSources"), 384, 472, 14, "#8fe8dc");
  wrapText(formatDamageSources(), 520, 472, 360, 18, "rgba(238,244,252,0.66)", 12);
  label(getNextRunGoalText(), 384, 498, 13, "#fff0a6");
  ctx.restore();
}

function drawResultRiftEnergyPanel(x, y, w, h) {
  const earned = state.runStats?.riftEnergyEarned || 0;
  const total = state.metaProgress?.riftEnergy || 0;
  ctx.save();
  const glow = earned > 0;
  const bg = ctx.createLinearGradient(x, y, x + w, y + h);
  bg.addColorStop(0, "rgba(26, 17, 48, 0.68)");
  bg.addColorStop(0.55, "rgba(8, 13, 24, 0.72)");
  bg.addColorStop(1, "rgba(20, 33, 48, 0.56)");
  ctx.fillStyle = bg;
  ctx.shadowColor = glow ? "rgba(184, 141, 255, 0.26)" : "rgba(126, 231, 255, 0.1)";
  ctx.shadowBlur = glow ? 18 : 9;
  roundedRect(x, y, w, h, 10, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = glow ? "rgba(255, 240, 166, 0.38)" : "rgba(145, 232, 222, 0.2)";
  ctx.lineWidth = 1.4;
  roundedRect(x, y, w, h, 10, false, true);
  drawImageContain(riftEnergyIcon, x + 12, y + 8, 44, 44);
  label(t("riftEnergy").toUpperCase(), x + 68, y + 21, 12, "#d7c2ff");
  fitLabel(fmt("riftEnergyEarned", { amount: earned }), x + 68, y + 43, 228, 16, "#fff0a6", 12, "900", true);
  fitLabel(fmt("riftEnergyTotal", { amount: total }), x + 314, y + 43, 174, 14, "#9fb4ff", 11, "800", true);
  ctx.restore();
}

function getNextRunGoalText() {
  const currentPeak = Math.max(0, state.stats.peakWave || state.wave || 0);
  const nextBossWave = Math.max(20, Math.ceil((currentPeak + 1) / 10) * 10);
  return fmt("nextRunHookDynamic", { wave: nextBossWave });
}

function formatDamageSources() {
  return formatDamageSourcesForUi(state.stats.damageSources || {}, { translate: t });
}

function getRatingColor(rating) {
  if (rating === "PERFECT") return "#fff0a6";
  if (rating === "ARCANE") return "#d7c2ff";
  if (rating === "BRUTAL") return "#ff8f98";
  if (rating === "CLEAN") return "#9df7da";
  return "#f5f1e6";
}

function drawMetaUpgradeScreen() {
  const progress = state.metaProgress;
  const stageName = getAscensionStageName(progress);
  ctx.save();
  drawMainMenuScene();
  drawDimOverlay(OVERLAY_READABILITY.scrim.standard);
  drawCard(166, 68, 948, 586);
  drawCornerGlyph(640, 88, "#fff0a6");
  const upgradeTitle = t("metaUpgradeTitle").toUpperCase();
  label(upgradeTitle, 224, 136, 42, "#f5f1e6");
  ctx.font = canvasFont("900", 42, upgradeTitle, true);
  const stageX = Math.min(690, 224 + ctx.measureText(upgradeTitle).width + 34);
  ctx.strokeStyle = "rgba(255, 240, 166, 0.28)";
  ctx.beginPath();
  ctx.moveTo(stageX - 16, 113);
  ctx.lineTo(stageX - 16, 137);
  ctx.stroke();
  label(fmt("metaUpgradeStage", { stage: stageName }).toUpperCase(), stageX, 132, 14, "#fff0a6");
  wrapText(t("metaUpgradeHelp"), 224, 172, 710, 22, "rgba(238,244,252,0.68)", 15);
  drawRiftEnergyDisplay(822, 96, progress.riftEnergy);

  const rows = getMetaUpgradeRowRects();
  for (const def of Object.values(META_UPGRADE_DEFS)) {
    drawMetaUpgradeRow(def, rows[def.id], progress);
  }
  const message = getMetaUpgradeMessage();
  if (message) fitLabel(message, 224, 211, 540, 14, "#fff0a6", 11, "900", true);
  drawMetaAscensionEntry();
  const back = getMetaUpgradeBackButtonRect();
  drawMenuButton(back.x, back.y, back.w, back.h, t("backToMenu"), "Esc");
  ctx.restore();
}

function drawAscensionResultOverlay() {
  const run = state.ascensionRun;
  const succeeded = run?.status === "success";
  const buttons = getAscensionResultButtonRects();
  const accent = succeeded ? "#fff0a6" : "#ff8f98";
  ctx.save();
  drawDimOverlay(OVERLAY_READABILITY.scrim.result);
  drawCard(342, 126, 596, 424);
  drawCornerGlyph(640, 150, accent);
  label(
    t(succeeded ? "ascensionChallengeSuccessTitle" : "ascensionChallengeFailedTitle"),
    400,
    214,
    38,
    "#f5f1e6",
  );
  wrapText(getMessage(), 402, 258, 476, 25, "rgba(238,244,252,0.72)", 17);
  ctx.fillStyle = "rgba(15, 10, 29, 0.68)";
  roundedRect(402, 320, 476, 86, 10, true, false);
  ctx.strokeStyle = succeeded
    ? "rgba(255, 240, 166, 0.34)"
    : "rgba(255, 143, 152, 0.34)";
  roundedRect(402, 320, 476, 86, 10, false, true);
  label(
    fmt("ascensionChallengeLinesHud", {
      current: run?.linesCleared || 0,
      target: run?.targetLines || 0,
    }),
    430,
    354,
    18,
    "#9df7da",
  );
  label(
    succeeded
      ? fmt("metaUpgradeStage", { stage: getAscensionStageName(state.metaProgress) })
      : fmt("ascensionChallengeTimeHud", {
        seconds: Math.ceil(Math.max(0, run?.remainingMs || 0) / 1000),
      }),
    430,
    386,
    18,
    accent,
  );
  drawMenuButton(
    succeeded ? buttons.single.x : buttons.primary.x,
    succeeded ? buttons.single.y : buttons.primary.y,
    succeeded ? buttons.single.w : buttons.primary.w,
    succeeded ? buttons.single.h : buttons.primary.h,
    t("ascensionReturnToUpgrades"),
    succeeded ? "Enter" : "Esc",
    "primary",
  );
  if (!succeeded) {
    drawMenuButton(
      buttons.secondary.x,
      buttons.secondary.y,
      buttons.secondary.w,
      buttons.secondary.h,
      t("ascensionRetry"),
      "Enter",
    );
  }
  ctx.restore();
}

function drawAscensionChallengeHud() {
  const run = state.ascensionRun;
  const remainingSeconds = Math.ceil(Math.max(0, run.remainingMs || 0) / 1000);
  const urgent = run.status === "active" && remainingSeconds <= 15;
  ctx.save();
  ctx.fillStyle = "rgba(14, 8, 28, 0.88)";
  roundedRect(404, 8, 472, 42, 10, true, false);
  ctx.strokeStyle = urgent ? "rgba(255, 111, 124, 0.72)" : "rgba(184, 141, 255, 0.58)";
  ctx.lineWidth = 1.7;
  roundedRect(404, 8, 472, 42, 10, false, true);
  fitLabel(
    fmt("ascensionChallengeGoal", {
      seconds: Math.round(run.durationMs / 1000),
      lines: run.targetLines,
    }),
    424,
    25,
    238,
    13,
    "#d7c2ff",
    10,
    "900",
    true,
  );
  fitLabel(
    fmt("ascensionChallengeTimeHud", { seconds: remainingSeconds }),
    672,
    25,
    92,
    14,
    urgent ? "#ff8f98" : "#fff0a6",
    11,
    "900",
    true,
  );
  fitLabel(
    fmt("ascensionChallengeLinesHud", {
      current: run.linesCleared,
      target: run.targetLines,
    }),
    770,
    25,
    86,
    14,
    "#9df7da",
    11,
    "900",
    true,
  );
  ctx.restore();
}

function startAscensionChallenge() {
  state.metaProgress = loadMetaProgress();
  if (!canUnlockAscensionChallenge(state.metaProgress)) {
    state.metaUpgradeMessage = {
      key: getNextAscensionChallenge(state.metaProgress)
        ? "metaAscensionLockedHint"
        : "metaAscensionNoChallenge",
      vars: {},
      until: performance.now() + 2200,
    };
    playSfx("metaUpgradeFail");
    return false;
  }
  resetGame("ascension");
  return true;
}

function isAscensionRunInProgress() {
  return state.runMode === "ascension"
    && ["waiting", "active"].includes(state.ascensionRun?.status);
}

function completeAscensionChallenge(succeeded) {
  const run = state.ascensionRun;
  if (!run || !["success", "failed"].includes(run.status)) return false;
  if (succeeded) {
    state.metaProgress = applyAscensionChallengeResult(
      state.metaProgress,
      run.challengeId,
      true,
    );
    saveMetaProgress(state.metaProgress);
  }
  state.runFinalized = true;
  state.active = null;
  state.lockTimer = null;
  state.countdownMs = 0;
  state.hitStopMs = 0;
  state.pendingHits = [];
  resetInputRepeat();
  setGameMode("ascensionResult");
  setMessage(
    succeeded ? "ascensionChallengeSuccessMessage" : getAscensionFailureMessageKey(run.failureReason),
  );
  playSfx(succeeded ? "upgrade" : "defeat");
  return true;
}

function getAscensionFailureMessageKey(reason) {
  if (reason === "time") return "ascensionChallengeFailedTime";
  if (reason === "topOut") return "ascensionChallengeFailedTopOut";
  return "ascensionChallengeFailedDefeat";
}

function updateAscensionChallengeTimer(dt) {
  if (state.ascensionRun?.status !== "active") return false;
  state.ascensionRun = advanceAscensionChallengeRun(state.ascensionRun, dt);
  if (state.ascensionRun.status !== "failed") return false;
  return completeAscensionChallenge(false);
}

function recordAscensionClear(lines) {
  if (state.ascensionRun?.status !== "active" || lines <= 0) return false;
  state.ascensionRun = recordAscensionChallengeLines(state.ascensionRun, lines);
  if (state.ascensionRun.status !== "success") return false;
  return completeAscensionChallenge(true);
}

function drawRiftEnergyDisplay(x, y, amount) {
  ctx.save();
  ctx.shadowColor = "rgba(184, 141, 255, 0.48)";
  ctx.shadowBlur = 18;
  drawImageContain(riftEnergyIcon, x, y, 68, 68);
  ctx.shadowBlur = 0;
  label(t("riftEnergy").toUpperCase(), x + 78, y + 22, 11, "#d7c2ff");
  fitLabel(String(amount), x + 78, y + 55, 150, 28, "#fff0a6", 18, "900", true);
  ctx.restore();
}

function drawMetaUpgradeRow(def, rect, progress) {
  if (!def || !rect) return;
  const level = progress.metaUpgrades[def.levelKey] || 0;
  const maxLevel = getAscensionMaxLevel(progress);
  const cost = getMetaUpgradeCost(def.id, level, progress);
  const maxed = level >= maxLevel;
  const canBuy = cost !== null && progress.riftEnergy >= cost;
  const hovered = pointInRect(state.pointer.x, state.pointer.y, rect.x, rect.y, rect.w, rect.h);
  ctx.save();
  const fill = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  fill.addColorStop(0, hovered ? "rgba(33, 45, 67, 0.78)" : "rgba(7, 12, 21, 0.68)");
  fill.addColorStop(0.55, "rgba(32, 20, 56, 0.64)");
  fill.addColorStop(1, "rgba(7, 13, 24, 0.72)");
  ctx.fillStyle = fill;
  roundedRect(rect.x, rect.y, rect.w, rect.h, 10, true, false);
  ctx.strokeStyle = hovered ? "rgba(255, 240, 166, 0.48)" : "rgba(145, 232, 222, 0.2)";
  ctx.lineWidth = 1.5;
  roundedRect(rect.x, rect.y, rect.w, rect.h, 10, false, true);
  drawImageContain(metaUpgradeIcons[def.iconKey], rect.x + 12, rect.y + 10, 72, 72);
  fitLabel(t(def.nameKey), rect.x + 104, rect.y + 31, 190, 20, "#f5f1e6", 15, "900", true);
  label(fmt("metaUpgradeLevel", { level, max: maxLevel }), rect.x + 104, rect.y + 57, 14, "#9fb4ff");
  label(fmt("metaUpgradeCurrent", { value: formatMetaUpgradeEffect(def, level) }), rect.x + 318, rect.y + 33, 14, "rgba(238,244,252,0.72)");
  if (!maxed) {
    label(fmt("metaUpgradeNext", { value: formatMetaUpgradeEffect(def, level + 1) }), rect.x + 318, rect.y + 59, 14, "rgba(238,244,252,0.72)");
    label(fmt("metaUpgradeCost", { cost }), rect.x + 610, rect.y + 57, 13, canBuy ? "#fff0a6" : "#ffb7bd");
  }
  drawMetaUpgradeBuyButton(rect, maxed, canBuy);
  ctx.restore();
}

function drawMetaAscensionEntry() {
  const rect = getMetaAscensionEntryRect();
  const challenge = getNextAscensionChallenge(state.metaProgress);
  const unlocked = canUnlockAscensionChallenge(state.metaProgress);
  const completed = !challenge && state.metaProgress.ascensionTier > 0;
  const hovered = pointInRect(state.pointer.x, state.pointer.y, rect.x, rect.y, rect.w, rect.h);
  const interactiveHover = hovered && unlocked;
  const statusKey = completed
    ? "metaAscensionComplete"
    : unlocked
      ? "metaAscensionReady"
      : "metaAscensionLocked";
  const requirementText = completed
    ? t("metaAscensionNoChallenge")
    : unlocked
      ? fmt("ascensionChallengeGoal", {
        seconds: challenge.durationSeconds,
        lines: challenge.targetLines,
      })
      : t("metaAscensionUnlockRequirement");
  const accent = unlocked ? "#fff0a6" : completed ? "#9df7da" : "rgba(215, 194, 255, 0.58)";
  ctx.save();
  ctx.fillStyle = interactiveHover ? "rgba(48, 31, 76, 0.58)" : "rgba(11, 15, 27, 0.34)";
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = interactiveHover ? "rgba(255, 240, 166, 0.5)" : "rgba(145, 232, 222, 0.16)";
  ctx.beginPath();
  ctx.moveTo(rect.x, rect.y);
  ctx.lineTo(rect.x + rect.w, rect.y);
  ctx.moveTo(rect.x, rect.y + rect.h);
  ctx.lineTo(rect.x + rect.w, rect.y + rect.h);
  ctx.stroke();
  label("◇", rect.x + 16, rect.y + 43, 26, accent);
  fitLabel(t("metaAscensionTitle"), rect.x + 52, rect.y + 23, 340, 16, "#f5f1e6", 13, "900", true);
  fitLabel(requirementText, rect.x + 52, rect.y + 44, 380, 12, "rgba(238,244,252,0.64)", 10, "800", true);
  fitLabel(t("metaAscensionCapRule"), rect.x + 52, rect.y + 62, 390, 11, "#9fb4ff", 9, "800", true);
  fitLabel(t(statusKey).toUpperCase(), rect.x + rect.w - 108, rect.y + 41, 88, 13, accent, 10, "900", true);
  ctx.restore();
}

function formatMetaUpgradeEffect(def, level) {
  return formatMetaUpgradeEffectForUi(def, level, { format: fmt });
}

function drawMetaUpgradeBuyButton(rect, maxed, canBuy) {
  const hovered = pointInRect(state.pointer.x, state.pointer.y, rect.buyX, rect.buyY, rect.buyW, rect.buyH);
  ctx.save();
  ctx.fillStyle = maxed
    ? "rgba(255, 240, 166, 0.12)"
    : canBuy
      ? hovered ? "rgba(184, 141, 255, 0.36)" : "rgba(184, 141, 255, 0.22)"
      : "rgba(44, 48, 58, 0.5)";
  roundedRect(rect.buyX, rect.buyY, rect.buyW, rect.buyH, 8, true, false);
  ctx.strokeStyle = maxed
    ? "rgba(255, 240, 166, 0.36)"
    : canBuy
      ? "rgba(255, 240, 166, 0.55)"
      : "rgba(238,244,252,0.16)";
  ctx.lineWidth = 1.5;
  roundedRect(rect.buyX, rect.buyY, rect.buyW, rect.buyH, 8, false, true);
  fitLabel(maxed ? t("metaUpgradeMaxed") : t("metaUpgradeBuy"), rect.buyX + 14, rect.buyY + 26, rect.buyW - 28, 16, canBuy || maxed ? "#f8f3cf" : "rgba(238,244,252,0.42)", 12, "900", true);
  ctx.restore();
}

function getMetaUpgradeMessage() {
  const message = state.metaUpgradeMessage;
  if (!message?.key || performance.now() > message.until) return "";
  return fmt(message.key, message.vars || {});
}

function handleMetaUpgradePointerDown(x, y) {
  const back = getMetaUpgradeBackButtonRect();
  if (pointInRect(x, y, back.x, back.y, back.w, back.h)) {
    setGameMode("start");
    state.metaUpgradeMessage = { key: "", vars: {}, until: 0 };
    playSfx("hold");
    return true;
  }
  const ascension = getMetaAscensionEntryRect();
  if (pointInRect(x, y, ascension.x, ascension.y, ascension.w, ascension.h)) {
    startAscensionChallenge();
    return true;
  }
  const rows = getMetaUpgradeRowRects();
  for (const def of Object.values(META_UPGRADE_DEFS)) {
    const rect = rows[def.id];
    if (pointInRect(x, y, rect.buyX, rect.buyY, rect.buyW, rect.buyH)) {
      purchaseMetaUpgrade(def.id);
      return true;
    }
  }
  return false;
}

function returnToMetaUpgradeFromAscension() {
  setGameMode("metaUpgrade");
  state.metaProgress = loadMetaProgress();
  state.metaUpgradeMessage = {
    key: state.ascensionRun?.status === "success"
      ? "ascensionChallengeSuccessMessage"
      : "",
    vars: {},
    until: performance.now() + 2600,
  };
  playSfx("uiConfirm");
}

function handleAscensionResultPointerDown(x, y) {
  const buttons = getAscensionResultButtonRects();
  const primary = state.ascensionRun?.status === "success" ? buttons.single : buttons.primary;
  if (pointInRect(x, y, primary.x, primary.y, primary.w, primary.h)) {
    returnToMetaUpgradeFromAscension();
    return true;
  }
  if (
    state.ascensionRun?.status === "failed"
    && pointInRect(
      x,
      y,
      buttons.secondary.x,
      buttons.secondary.y,
      buttons.secondary.w,
      buttons.secondary.h,
    )
  ) {
    startAscensionChallenge();
    return true;
  }
  return false;
}

function purchaseMetaUpgrade(id) {
  const before = loadMetaProgress();
  const result = buyMetaUpgrade(before, id);
  state.metaProgress = result.progress;
  const def = META_UPGRADE_DEFS[id];
  if (result.ok) {
    saveMetaProgress(state.metaProgress);
    state.metaUpgradeMessage = {
      key: "metaUpgradePurchased",
      vars: { name: def ? t(def.nameKey) : "" },
      until: performance.now() + 2200,
    };
    playSfx("metaUpgradeSuccess");
    return true;
  }
  state.metaUpgradeMessage = {
    key: result.reason === "maxed" ? "metaUpgradeMaxed" : "metaUpgradeNotEnough",
    vars: {},
    until: performance.now() + 1800,
  };
  playSfx("metaUpgradeFail");
  return false;
}

function isHeroMeleeAttackStyle(style) {
  return [
    "melee",
    "ultimate",
    "slash",
    "doubleSlash",
    "tripleSlash",
    "tetris",
    "tspin",
    "combo",
    "combo1",
    "combo2",
    "combo3",
    "b2b",
  ].includes(String(style || ""));
}

function drawSpecialBondProgressSummary(x, y) {
  const counts = getSpecialBondCountsForRun();
  drawSpecialBondChip(SPECIAL_UPGRADE_FAMILIES.angel, counts.angel, x, y);
  drawSpecialBondChip(SPECIAL_UPGRADE_FAMILIES.devil, counts.devil, x + 128, y);
}

function drawSpecialBondChip(family, count, x, y) {
  const w = 116;
  const h = 28;
  const active = count > 0;
  ctx.save();
  ctx.fillStyle = active ? hexToRgba(family.color, 0.18) : "rgba(238,244,252,0.06)";
  roundedRect(x, y, w, h, 9, true, false);
  ctx.strokeStyle = active ? hexToRgba(family.color, 0.46) : "rgba(238,244,252,0.13)";
  ctx.lineWidth = active ? 1.2 : 1;
  roundedRect(x, y, w, h, 9, false, true);
  fitLabel(`${t(family.labelKey)} ${count}/3`, x + 10, y + 18, 58, 11, active ? family.color : "rgba(238,244,252,0.54)", 8, "900", true);
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < count ? family.color : "rgba(238,244,252,0.18)";
    roundedRect(x + 73 + i * 11, y + 10, 7, 7, 3, true, false);
  }
  ctx.restore();
}

function drawUpgradeOverlay() {
  ctx.save();
  const now = performance.now();
  const reducedMotion = prefersReducedMotion();
  const motionState = state.upgradeMotion || {
    openedAt: now,
    selectedAt: now,
    selectedIndex: state.upgradeSelectedIndex,
  };
  const overlayMotion = getUpgradeOverlayMotion({
    now,
    openedAt: motionState.openedAt,
    reducedMotion,
  });
  drawDimOverlay(OVERLAY_READABILITY.scrim.upgrade);
  ctx.save();
  ctx.globalAlpha *= overlayMotion.alpha;
  ctx.translate(0, overlayMotion.y);
  const draftLayout = getUpgradeDraftLayout();
  const panel = draftLayout.panel;
  drawCard(panel.x, panel.y, panel.w, panel.h);
  drawUpgradeMotionTitle(t("relicDraft").toUpperCase(), draftLayout.title, now, overlayMotion.glow);
  drawSpecialBondProgressSummary(draftLayout.bondSummary.x, draftLayout.bondSummary.y);
  const buildButton = draftLayout.buildButton;
  drawMenuButton(buildButton.x, buildButton.y, buildButton.w, buildButton.h, t("currentBuild"), "");
  for (let i = 0; i < 3; i += 1) {
    const upgrade = state.upgradeChoices[i];
    if (!upgrade) continue;
    const rarity = getRarityVisual(upgrade.rarity);
    const card = getUpgradeCardRect(i);
    const hovered = !state.upgradePickConfirm && pointInRect(state.pointer.x, state.pointer.y, card.x, card.y, card.w, card.h);
    const selected = !state.upgradePickConfirm && state.upgradeSelectedIndex === i;
    const dimmed = state.upgradePickConfirm && state.upgradePickConfirm.index !== i;
    const specialFrame = getSpecialUpgradeCardFrame(upgrade);
    const cardMotion = getUpgradeCardMotion({
      now,
      openedAt: motionState.openedAt,
      selectedAt: motionState.selectedIndex === i ? motionState.selectedAt : motionState.openedAt,
      index: i,
      selected,
      hovered,
      dimmed,
      confirming: state.upgradePickConfirm?.index === i,
      confirmElapsed: state.upgradePickConfirm?.elapsed || 0,
      confirmDuration: state.upgradePickConfirm?.duration || 1,
      reducedMotion,
    });
    drawUpgradeChoiceCard({
      upgrade,
      card,
      rarity,
      hovered,
      selected,
      active: hovered || selected || state.upgradePickConfirm?.index === i,
      specialFrame,
      layoutVariant: specialFrame ? "special" : "default",
      motion: cardMotion,
      pickNumber: i + 1,
    });
  }
  const selectedUpgrade = state.upgradeChoices[state.upgradeSelectedIndex];
  if (selectedUpgrade) {
    drawUpgradeSelectedDetail(
      selectedUpgrade,
      draftLayout.selectedDetail,
      getUpgradeCardAccentVisual(selectedUpgrade, getRarityVisual(selectedUpgrade.rarity)),
      getUpgradeDetailMotion({
        now,
        selectedAt: motionState.selectedAt,
        reducedMotion,
      }),
      {
        expanded: state.upgradeDetailOpen,
        toggleRect: draftLayout.detailToggle,
      },
    );
  }
  drawUpgradeMotionHint(t("upgradeHelp"), draftLayout.help, now, overlayMotion.glow);
  ctx.restore();
  if (state.currentBuildOpen) drawCurrentBuildPanel();
  ctx.restore();
}

function drawUpgradeChoiceCard({
  upgrade,
  card,
  rarity,
  hovered = false,
  selected = false,
  active = false,
  specialFrame = null,
  layoutVariant = "default",
  motion = {},
  pickNumber = 1,
} = {}) {
  ctx.save();
  ctx.globalAlpha *= motion.alpha ?? 1;
  ctx.translate(card.x + card.w / 2, card.y + card.h / 2 + (motion.y || 0));
  const scale = motion.scale || 1;
  ctx.scale(scale, scale);
  const localCard = { x: -card.w / 2, y: -card.h / 2, w: card.w, h: card.h };
  const layout = getUpgradeCardContentLayout(localCard, layoutVariant);
  const accent = getUpgradeCardAccentVisual(upgrade, rarity);
  const textTheme = getUpgradeCardTextTheme(upgrade, layoutVariant, accent);
  drawUpgradeCardMotionAura(localCard, accent, motion);
  drawUpgradeCardFrame(localCard.x, localCard.y, localCard.w, localCard.h, accent, active, specialFrame);
  drawUpgradeCardReadabilityPanels(layout, accent, hovered || selected, textTheme);
  drawUpgradeTagPills(getUpgradeTags(upgrade), layout.tags.x, layout.tags.y, layout.tags.w, layout.tags.maxTags || 2, 0.92, textTheme);
  drawUpgradeDivider(layout.divider.x, layout.divider.y, layout.divider.w, textTheme.dividerColor, hovered ? 0.6 : selected ? 0.52 : 0.32);
  drawReadableUpgradeText(() => {
    drawLimitedWrapText(upgradeShortText(upgrade), layout.desc.x, layout.desc.y, layout.desc.w, layout.desc.lineH, textTheme.descColor, layout.desc.size, layout.desc.maxLines || 2, "900");
  }, textTheme.shadowBlur, textTheme.shadowColor, textTheme.shadowOffsetY);
  drawUpgradePickHint(localCard.x + 16, localCard.y + localCard.h - 28, pickNumber, accent);
  if (selected) drawUpgradeSelectionHighlight(localCard, accent);
  drawUpgradeConfirmBurst(localCard, accent, motion.confirmPulse || 0);
  ctx.restore();
}

function drawUpgradeMotionTitle(text, titleLayout, now, revealGlow = 0) {
  const pulse = 0.5 + Math.sin(now * 0.006) * 0.5;
  ctx.save();
  ctx.shadowColor = "#7ef7ff";
  ctx.shadowBlur = 8 + revealGlow * 12 + pulse * 5;
  fitLabel(text, titleLayout.x, titleLayout.y, titleLayout.w, titleLayout.size, "#f5f1e6", 24, "900", true);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.18 + pulse * 0.16;
  fitLabel(text, titleLayout.x + 2, titleLayout.y, titleLayout.w, titleLayout.size, "#fff0a6", 24, "900", true);
  ctx.globalAlpha = 0.14 + revealGlow * 0.12;
  ctx.fillStyle = "#7ef7ff";
  roundedRect(titleLayout.x, titleLayout.y + 11, Math.min(titleLayout.w, 228), 2, 1, true, false);
  ctx.restore();
}

function drawUpgradeMotionHint(text, helpLayout, now, revealGlow = 0) {
  const pulse = 0.5 + Math.sin(now * 0.005 + 1.3) * 0.5;
  ctx.save();
  ctx.shadowColor = "#8f70ff";
  ctx.shadowBlur = 6 + pulse * 5 + revealGlow * 8;
  ctx.globalAlpha = 0.68 + pulse * 0.16;
  fitLabel(text, helpLayout.x, helpLayout.y, helpLayout.w, helpLayout.size, "rgba(184, 202, 255, 0.9)", 10, "800");
  ctx.globalAlpha = 0.16 + pulse * 0.12;
  fitLabel(text, helpLayout.x + 1, helpLayout.y, helpLayout.w, helpLayout.size, "#fff0a6", 10, "800");
  ctx.restore();
}

function drawUpgradeCardFrame(x, y, w, h, rarity, hovered = false, frameOverride = null) {
  ctx.save();
  const fallbackFrame = upgradeCardFrames[rarity.tier] || upgradeCardFrames.common;
  const frame = isImageReady(frameOverride) ? frameOverride : fallbackFrame;
  if (isImageReady(frame)) {
    ctx.shadowColor = rarity.glow;
    ctx.shadowBlur = hovered ? 18 : 10;
    ctx.drawImage(frame, x, y, w, h);
    ctx.shadowBlur = 0;
    if (hovered) {
      ctx.shadowColor = rarity.glow;
      ctx.shadowBlur = 18;
      ctx.strokeStyle = hexToRgba(rarity.border, 0.72);
      ctx.lineWidth = 2.2;
      roundedRect(x - 5, y - 5, w + 10, h + 10, 13, false, true);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = hexToRgba(rarity.border, 0.42);
      ctx.lineWidth = 1.2;
      roundedRect(x + 9, y + 9, w - 18, h - 18, 10, false, true);
    }
    ctx.restore();
    return;
  }
  const glow = hovered ? 0.72 : 0.42;
  ctx.shadowColor = rarity.glow;
  ctx.shadowBlur = hovered ? 28 : 16;
  const cardG = ctx.createLinearGradient(x, y, x, y + h);
  cardG.addColorStop(0, rarity.fillTop);
  cardG.addColorStop(0.46, "rgba(12, 14, 24, 0.82)");
  cardG.addColorStop(1, rarity.fillBottom);
  ctx.fillStyle = cardG;
  roundedRect(x, y, w, h, 12, true, false);
  ctx.shadowBlur = 0;

  const inner = ctx.createLinearGradient(x, y, x + w, y + h);
  inner.addColorStop(0, hexToRgba(rarity.color, hovered ? 0.18 : 0.1));
  inner.addColorStop(0.5, "rgba(255, 255, 255, 0)");
  inner.addColorStop(1, hexToRgba(rarity.color, hovered ? 0.12 : 0.06));
  ctx.fillStyle = inner;
  roundedRect(x + 5, y + 5, w - 10, h - 10, 10, true, false);

  const aura = ctx.createRadialGradient(x + w / 2, y + 78, 8, x + w / 2, y + 78, 84);
  aura.addColorStop(0, hexToRgba(rarity.color, hovered ? 0.28 : 0.18));
  aura.addColorStop(0.46, hexToRgba(rarity.color, hovered ? 0.12 : 0.07));
  aura.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = aura;
  roundedRect(x + 8, y + 42, w - 16, 86, 10, true, false);

  ctx.strokeStyle = hexToRgba(rarity.color, hovered ? 0.24 : 0.14);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 78, 48, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 78, 34, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = hovered ? rarity.border : hexToRgba(rarity.border, glow);
  ctx.lineWidth = hovered ? rarity.lineWidth + 0.6 : rarity.lineWidth;
  roundedRect(x, y, w, h, 12, false, true);

  ctx.fillStyle = hexToRgba(rarity.color, hovered ? 0.24 : 0.14);
  roundedRect(x + 10, y + h - 8, w - 20, 3, 2, true, false);
  drawUpgradeCornerMarks(x, y, w, h, rarity.color, hovered ? 0.58 : 0.34);
  ctx.restore();
}

function drawUpgradeSelectionHighlight(card, rarity) {
  const pulse = 0.5 + Math.sin(performance.now() / 220) * 0.5;
  ctx.save();
  ctx.shadowColor = rarity.glow;
  ctx.shadowBlur = 18 + pulse * 8;
  ctx.strokeStyle = hexToRgba(rarity.border, 0.7 + pulse * 0.18);
  ctx.lineWidth = 2.6;
  roundedRect(card.x - 7, card.y - 7, card.w + 14, card.h + 14, 15, false, true);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = hexToRgba("#fff0a6", 0.28 + pulse * 0.18);
  ctx.lineWidth = 1.1;
  roundedRect(card.x + 7, card.y + 7, card.w - 14, card.h - 14, 10, false, true);
  ctx.restore();
}

function drawUpgradeCardMotionAura(card, rarity, motion = {}) {
  const glow = clamp(motion.glow || 0, 0, 1);
  if (glow <= 0.02) return;
  const pulse = 0.65 + Math.sin(performance.now() * 0.007) * 0.35;
  ctx.save();
  const baseAlpha = ctx.globalAlpha;
  ctx.globalAlpha = baseAlpha * (0.16 + glow * 0.22);
  ctx.shadowColor = rarity.glow;
  ctx.shadowBlur = 22 + glow * 18;
  ctx.strokeStyle = hexToRgba(rarity.border, 0.22 + glow * 0.24);
  ctx.lineWidth = 1.2 + glow * 1.2;
  roundedRect(card.x - 10 - pulse * 2, card.y - 10 - pulse * 2, card.w + 20 + pulse * 4, card.h + 20 + pulse * 4, 17, false, true);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = baseAlpha * (0.08 + glow * 0.12);
  const sweep = ctx.createLinearGradient(card.x, card.y, card.x + card.w, card.y + card.h);
  sweep.addColorStop(0, "rgba(255,255,255,0)");
  sweep.addColorStop(0.48, rarity.color);
  sweep.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sweep;
  roundedRect(card.x + 8, card.y + 8, card.w - 16, card.h - 16, 12, true, false);
  ctx.restore();
}

function drawUpgradeCardReadabilityPanels(layout, rarity, hovered = false, theme = null) {
  if (!layout?.panels) return;
  const panels = [
    { rect: layout.panels.title, fill: hovered ? 0.7 : 0.64, stroke: hovered ? 0.24 : 0.16, radius: 8 },
    { rect: layout.panels.tags, fill: hovered ? 0.62 : 0.56, stroke: hovered ? 0.2 : 0.12, radius: 7 },
    { rect: layout.panels.desc, fill: hovered ? 0.76 : 0.7, stroke: hovered ? 0.22 : 0.13, radius: 9 },
    { rect: layout.panels.trait, fill: hovered ? 0.68 : 0.62, stroke: hovered ? 0.24 : 0.16, radius: 9 },
  ];
  ctx.save();
  for (const panel of panels) {
    if (!panel.rect) continue;
    const { x, y, w, h } = panel.rect;
    if (theme?.lightCard) {
      const fill = ctx.createLinearGradient(x, y, x, y + h);
      fill.addColorStop(0, `rgba(255, 251, 226, ${Math.min(0.78, panel.fill + 0.04)})`);
      fill.addColorStop(1, `rgba(216, 200, 144, ${Math.min(0.72, panel.fill)})`);
      ctx.fillStyle = fill;
    } else {
      const fill = ctx.createLinearGradient(x, y, x, y + h);
      fill.addColorStop(0, `rgba(2, 5, 12, ${panel.fill})`);
      fill.addColorStop(1, `rgba(8, 12, 22, ${Math.min(0.82, panel.fill + 0.06)})`);
      ctx.fillStyle = fill;
    }
    roundedRect(x, y, w, h, panel.radius, true, false);
    ctx.strokeStyle = theme?.lightCard ? "rgba(108, 91, 39, 0.34)" : hexToRgba(rarity.border, panel.stroke);
    ctx.lineWidth = 1;
    roundedRect(x, y, w, h, panel.radius, false, true);
  }
  ctx.restore();
}

function getUpgradeCardAccentVisual(upgrade, rarity) {
  const tags = getUpgradeTags(upgrade);
  if (tags.includes("Devil")) {
    return {
      ...rarity,
      color: "#ff5b86",
      border: "#ff4f7a",
      glow: "rgba(255, 54, 96, 0.62)",
      badgeFill: "rgba(255, 54, 96, 0.22)",
      badgeText: "#ffd6df",
      lineWidth: Math.max(2.8, rarity.lineWidth || 2),
    };
  }
  if (tags.includes("Angel")) {
    return {
      ...rarity,
      color: "#dff7ff",
      border: "#f4e6b4",
      glow: "rgba(210, 247, 255, 0.56)",
      badgeFill: "rgba(244, 230, 180, 0.26)",
      badgeText: "#3b3218",
      lineWidth: Math.max(2.6, rarity.lineWidth || 2),
    };
  }
  return rarity;
}

function drawReadableUpgradeText(draw, blur = 6, shadowColor = "rgba(0, 0, 0, 0.92)", shadowOffsetY = 1) {
  ctx.save();
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetY = shadowOffsetY;
  draw();
  ctx.restore();
}

function drawUpgradeCornerMarks(x, y, w, h, color, alpha) {
  ctx.save();
  ctx.strokeStyle = hexToRgba(color, alpha);
  ctx.lineWidth = 1.4;
  const size = 16;
  const pad = 8;
  [
    [x + pad, y + pad, 1, 1],
    [x + w - pad, y + pad, -1, 1],
    [x + pad, y + h - pad, 1, -1],
    [x + w - pad, y + h - pad, -1, -1],
  ].forEach(([cx, cy, sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy + sy * size);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + sx * size, cy);
    ctx.stroke();
  });
  ctx.restore();
}

function drawRarityBadge(x, y, w, h, text, rarity) {
  ctx.save();
  ctx.fillStyle = rarity.badgeFill;
  roundedRect(x, y, w, h, 8, true, false);
  ctx.strokeStyle = hexToRgba(rarity.border, 0.52);
  ctx.lineWidth = 1.4;
  roundedRect(x, y, w, h, 8, false, true);
  fitLabel(text, x + 9, y + h / 2 + 4, w - 18, 10, rarity.badgeText, 8, "900", true);
  ctx.restore();
}

function drawUpgradePickHint(x, y, number, rarity) {
  ctx.save();
  ctx.fillStyle = "rgba(4, 7, 12, 0.34)";
  roundedRect(x, y, 22, 20, 6, true, false);
  ctx.strokeStyle = hexToRgba(rarity.border, 0.28);
  ctx.lineWidth = 1;
  roundedRect(x, y, 22, 20, 6, false, true);
  fitLabel(String(number), x + 7, y + 14, 10, 11, hexToRgba(rarity.badgeText, 0.72), 9, "800", true);
  ctx.restore();
}

function drawUpgradeDivider(x, y, w, color, alpha = 0.5) {
  ctx.save();
  ctx.strokeStyle = hexToRgba(color, alpha);
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w * 0.4, y);
  ctx.moveTo(x + w * 0.6, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  ctx.fillStyle = hexToRgba(color, alpha + 0.08);
  ctx.save();
  ctx.translate(x + w / 2, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-3, -3, 6, 6);
  ctx.restore();
  ctx.restore();
}

function getSpecialUpgradeCardFrame(upgrade) {
  return upgrade?.id ? specialUpgradeCardFrames[upgrade.id] : null;
}

function getUpgradeTraitPreview(upgrade) {
  const specialHint = getSpecialBondPreview(upgrade, state.acquiredRelics);
  if (specialHint) {
    const activated = specialHint.after > specialHint.before;
    return {
      accent: specialHint.family.color,
      glyph: activated ? "✦" : "•",
      text: activated
        ? fmt("bondHintUpgrade", { bond: t(specialHint.family.labelKey), before: specialHint.before, after: specialHint.after })
        : fmt("bondHintOwned", { bond: t(specialHint.family.labelKey), count: specialHint.after }),
      emphasis: activated,
    };
  }
  const hint = getTraitChangeHintsForUpgrade(upgrade)[0];
  if (!hint) return null;
  const isUpgrade = hint.type === "upgrade";
  const isActivate = hint.type === "activate";
  const isOvercap = hint.type === "overcap";
  const accent = isOvercap ? "#fff0a6" : isUpgrade ? "#fff0a6" : isActivate ? "#9df7da" : hint.color;
  return {
    accent,
    glyph: isOvercap ? "+" : isUpgrade ? "↑" : isActivate ? "✦" : "+",
    text: isOvercap
      ? `${t("traitOvercap")}: ${hint.label} ${fmt("traitOvercapCount", { count: hint.overcap })}`
      : hint.type === "progress"
      ? fmt(hint.stage > 0 ? "traitProgressUpgrade" : "traitProgressActivate", { tag: hint.label, remain: hint.remaining })
      : `${t(isActivate ? "traitActivated" : "traitUpgrade")}: ${hint.label} ${hint.count}/${hint.next}`,
    emphasis: isActivate || isUpgrade || isOvercap,
  };
}

function getUpgradeCardTextTheme(upgrade, layoutVariant = "default", rarity = getRarityVisual(upgrade?.rarity)) {
  const specialHint = layoutVariant === "special" ? getSpecialBondPreview(upgrade, state.acquiredRelics) : null;
  if (specialHint?.family?.key === "angel") {
    return {
      lightCard: true,
      titleColor: "#2b2412",
      dividerColor: "#8b7430",
      shadowBlur: 2,
      shadowColor: "rgba(255, 252, 229, 0.92)",
      shadowOffsetY: 0,
      tagFillAlpha: 0.72,
      tagStrokeAlpha: 0.58,
      tagTextColor: "#302914",
      tagFontSize: 11,
      tagTextSize: 10,
      tagPillHeight: 22,
      tagMaxPillWidth: 82,
      tagPillGap: 6,
      chipFillAlpha: 0.72,
      chipStrokeAlpha: 0.66,
      chipTextColor: "#302914",
      chipGlyphColor: "#4f4521",
      chipGlyphFillAlpha: 0.16,
      descColor: "#251a08",
    };
  }
  return {
    lightCard: false,
    titleColor: rarity.titleColor,
    descColor: "#fff4cf",
    dividerColor: rarity.color,
    shadowBlur: 7,
    shadowColor: "rgba(0, 0, 0, 0.92)",
    shadowOffsetY: 1,
    tagFontSize: 11,
    tagTextSize: 10,
    tagPillHeight: 22,
    tagMaxPillWidth: 82,
    tagPillGap: 6,
  };
}

function drawUpgradeTraitPreviewChip(preview, x, y, w, h, { compact = true, emphasis = preview?.emphasis, theme = null } = {}) {
  if (!preview) return;
  const accent = preview.accent;
  const glyphSize = compact ? 15 : 18;
  const glyphX = x + (compact ? 9 : 12);
  const glyphY = y + Math.max(8, h / 2 - glyphSize / 2 + 1);
  ctx.save();
  if (emphasis) {
    ctx.shadowColor = hexToRgba(accent, 0.36);
    ctx.shadowBlur = theme?.lightCard ? 4 : compact ? 10 : 13;
  }
  if (theme?.lightCard) {
    const fill = ctx.createLinearGradient(x, y, x + w, y + h);
    fill.addColorStop(0, "rgba(255, 250, 221, 0.78)");
    fill.addColorStop(1, "rgba(202, 185, 121, 0.6)");
    ctx.fillStyle = fill;
  } else {
    ctx.fillStyle = hexToRgba(accent, emphasis ? 0.24 : 0.15);
  }
  roundedRect(x, y, w, h, compact ? 8 : 10, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = theme?.lightCard ? "rgba(80, 68, 30, 0.62)" : hexToRgba(accent, emphasis ? 0.58 : 0.34);
  ctx.lineWidth = emphasis ? 1.3 : 1;
  roundedRect(x, y, w, h, compact ? 8 : 10, false, true);
  ctx.fillStyle = theme?.lightCard ? "rgba(66, 58, 27, 0.12)" : hexToRgba(accent, emphasis ? 0.34 : 0.22);
  roundedRect(glyphX, glyphY, glyphSize, glyphSize, compact ? 5 : 6, true, false);
  fitLabel(preview.glyph, glyphX + 3, glyphY + glyphSize - 4, glyphSize - 6, compact ? 11 : 13, theme?.lightCard ? theme.chipGlyphColor : accent, 8, "900", true);
  fitLabel(
    preview.text,
    glyphX + glyphSize + 8,
    y + h / 2 + 5,
    w - glyphSize - 26,
    compact ? 11 : 12,
    theme?.lightCard ? theme.chipTextColor : emphasis ? "#f5f1e6" : hexToRgba(accent, 0.84),
    compact ? 8 : 9,
    "900",
    true,
  );
  ctx.restore();
}

function drawUpgradeTraitHint(upgrade, card, layoutVariant = "default", theme = null) {
  const preview = getUpgradeTraitPreview(upgrade);
  if (!preview) return;
  const layout = getUpgradeCardContentLayout(card, layoutVariant).trait;
  const { x, y, w, h } = layout;
  drawUpgradeTraitPreviewChip(preview, x, y, w, h, { compact: true, theme });
}

const UPGRADE_DETAIL_ICON_TAG_PRIORITY = Object.freeze([
  "Perfect",
  "Combo",
  "Spin",
  "Defense",
  "Survival",
  "Garbage",
  "B2B",
  "Boss Killer",
  "Burst",
  "Utility",
  "Devil",
  "Angel",
]);

const UPGRADE_DETAIL_ICON_BY_TAG = Object.freeze({
  Perfect: "rift",
  Combo: "combo",
  Spin: "spin",
  Defense: "defense",
  Survival: "survival",
  Garbage: "garbage",
  B2B: "attack",
  "Boss Killer": "attack",
  Burst: "attack",
  Utility: "rift",
  Devil: "attack",
  Angel: "rift",
});

function getUpgradeDetailIconAsset(upgrade) {
  const tags = getUpgradeTags(upgrade);
  const tag = UPGRADE_DETAIL_ICON_TAG_PRIORITY.find((entry) => tags.includes(entry));
  return upgradeTypeIcons[UPGRADE_DETAIL_ICON_BY_TAG[tag]] || upgradeTypeIcons.rift;
}

function drawUpgradeDetailTypeIcon(upgrade, x, y, size, rarity) {
  const icon = getUpgradeDetailIconAsset(upgrade);
  if (!isImageReady(icon)) return 0;
  ctx.save();
  ctx.shadowColor = rarity.glow;
  ctx.shadowBlur = 9;
  ctx.fillStyle = hexToRgba(rarity.color, 0.18);
  roundedRect(x - 3, y - 3, size + 6, size + 6, 9, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = hexToRgba(rarity.border, 0.28);
  ctx.lineWidth = 1;
  roundedRect(x - 3, y - 3, size + 6, size + 6, 9, false, true);
  ctx.globalAlpha = 0.96;
  ctx.drawImage(icon, x, y, size, size);
  ctx.restore();
  return size + 10;
}

function drawUpgradeSelectedDetail(upgrade, rect, rarity, motion = {}, {
  expanded = false,
  toggleRect = getUpgradeDetailToggleRect(),
} = {}) {
  const preview = getUpgradeTraitPreview(upgrade);
  const { x, y, w, h } = rect;
  const toggleHovered = pointInRect(state.pointer.x, state.pointer.y, toggleRect.x, toggleRect.y, toggleRect.w, toggleRect.h);
  ctx.save();
  ctx.globalAlpha *= motion.alpha ?? 1;
  ctx.translate(0, motion.y || 0);
  ctx.shadowColor = rarity.glow;
  ctx.shadowBlur = 12 + Math.max(0, motion.glow || 0) * 18;
  const fill = ctx.createLinearGradient(x, y, x + w, y + h);
  fill.addColorStop(0, "rgba(3, 8, 18, 0.82)");
  fill.addColorStop(0.52, hexToRgba(rarity.color, 0.2));
  fill.addColorStop(1, "rgba(7, 5, 18, 0.82)");
  ctx.fillStyle = fill;
  roundedRect(x, y, w, h, 12, true, false);
  ctx.shadowBlur = 0;
  drawUpgradeDetailShimmer(rect, rarity, motion.shimmer || 0);
  ctx.strokeStyle = hexToRgba(rarity.border, 0.42);
  ctx.lineWidth = 1.3;
  roundedRect(x, y, w, h, 12, false, true);
  ctx.fillStyle = hexToRgba(rarity.color, 0.28);
  roundedRect(x + 13, y + 12, 3, h - 24, 2, true, false);
  const iconSize = 54;
  const iconX = x + 24;
  const iconY = y + 17;
  const textX = x + 94;
  fitLabel(t("selectedUpgrade"), textX, y + 21, 194, 11, "rgba(143,232,220,0.78)", 8, "900", true);
  drawUpgradeDetailTypeIcon(upgrade, iconX, iconY, iconSize, rarity);
  drawReadableUpgradeText(() => {
    fitLabel(upgradeName(upgrade), textX, y + 47, 194, 19, rarity.titleColor, 12, "900", true);
  }, 5);
  if (preview) drawUpgradeTraitPreviewChip(preview, textX, y + 57, 188, 22, { compact: true, emphasis: false });
  const descX = x + 308;
  const descW = Math.max(160, toggleRect.x - descX - 18);
  const detailText = expanded ? upgradeText(upgrade) : upgradeShortText(upgrade);
  drawReadableUpgradeText(() => {
    drawLimitedWrapText(detailText, descX, y + 27, descW, 16, "#fff4cf", expanded ? 13 : 14, expanded ? 3 : 2, "900");
  }, 4);
  drawUpgradeDetailToggleButton(toggleRect, rarity, expanded, toggleHovered);
  ctx.restore();
}

function drawUpgradeDetailToggleButton(rect, rarity, expanded, hovered = false) {
  const pulse = 0.5 + Math.sin(performance.now() * 0.006 + 0.4) * 0.5;
  ctx.save();
  ctx.shadowColor = rarity.glow;
  ctx.shadowBlur = hovered ? 16 : 7 + pulse * 4;
  ctx.fillStyle = hovered ? hexToRgba(rarity.color, 0.28) : "rgba(8, 13, 24, 0.76)";
  roundedRect(rect.x, rect.y, rect.w, rect.h, 10, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = hovered ? hexToRgba("#fff0a6", 0.72) : hexToRgba(rarity.border, 0.46 + pulse * 0.14);
  ctx.lineWidth = hovered ? 1.8 : 1.2;
  roundedRect(rect.x, rect.y, rect.w, rect.h, 10, false, true);
  fitLabel(t(expanded ? "upgradeDetailClose" : "upgradeDetailOpen"), rect.x + 17, rect.y + 22, rect.w - 34, 14, hovered ? "#fff0a6" : "rgba(246,250,255,0.86)", 10, "900", true);
  ctx.restore();
}

function drawUpgradeDetailShimmer(rect, rarity, shimmer) {
  const progress = clamp(shimmer, 0, 1);
  if (progress <= 0 || progress >= 1) return;
  const { x, y, w, h } = rect;
  const stripeX = x + w * (progress * 1.25 - 0.18);
  const alpha = 0.12 * (1 - Math.abs(progress - 0.52) * 1.6);
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  const beam = ctx.createLinearGradient(stripeX - 42, y, stripeX + 42, y + h);
  beam.addColorStop(0, "rgba(255,255,255,0)");
  beam.addColorStop(0.5, rarity.color);
  beam.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = beam;
  roundedRect(x + 6, y + 6, w - 12, h - 12, 10, true, false);
  ctx.restore();
}

function drawUpgradeConfirmBurst(card, rarity, pulse = 0) {
  if (pulse <= 0.01) return;
  ctx.save();
  ctx.shadowColor = rarity.glow;
  ctx.shadowBlur = 16 + pulse * 12;
  ctx.strokeStyle = hexToRgba(rarity.border, 0.58 + pulse * 0.26);
  ctx.lineWidth = 2.4 + pulse * 1.4;
  roundedRect(card.x - 8, card.y - 8, card.w + 16, card.h + 16, 15, false, true);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = hexToRgba(rarity.color, 0.32 + pulse * 0.2);
  ctx.lineWidth = 1.2;
  roundedRect(card.x + 8, card.y + 8, card.w - 16, card.h - 16, 10, false, true);
  ctx.restore();
}

function getRarityVisual(rarity) {
  const key = rarity === "boss" || rarity === "special" ? "legendary" : rarity;
  return RARITY[key] || RARITY.common;
}

function drawCurrentBuildPanel() {
  const panel = getCurrentBuildPanelRect();
  const closeRect = getCurrentBuildCloseRect();
  const groups = getAcquiredRelicGroups();
  const stats = getCurrentBuildFamilyStats(groups);
  ctx.save();
  drawDimOverlay(OVERLAY_READABILITY.scrim.nested);
  drawCard(panel.x, panel.y, panel.w, panel.h);
  label(t("currentBuildTitle"), panel.x + 42, panel.y + 58, 32, "#f5f1e6");
  drawMenuButton(closeRect.x, closeRect.y, closeRect.w, closeRect.h, t("currentBuildClose"), "Esc");
  drawCurrentBuildSummary(stats, panel.x + 44, panel.y + 82, 460, 44);
  wrapText(getCurrentBuildDirectionText(stats), panel.x + 526, panel.y + 104, 314, 18, "rgba(238,244,252,0.62)", 12);
  label(t("currentBuildStats").toUpperCase(), panel.x + 44, panel.y + 140, 13, "#fff0a6");
  drawCurrentBuildStats(stats, panel.x + 44, panel.y + 156, panel.w - 88);
  label(t("currentBuildTraits").toUpperCase(), panel.x + 44, panel.y + 198, 13, "#fff0a6");
  drawCurrentBuildTraitDetails(getTraitEntries(groups), panel.x + 44, panel.y + 214, panel.w - 88, 58);
  label(t("currentBuildList").toUpperCase(), panel.x + 44, panel.y + 298, 13, "#8fe8dc");
  if (!groups.length) {
    drawCurrentBuildEmpty(panel.x + 44, panel.y + 322, panel.w - 88, 104);
  } else {
    drawAcquiredRelicCards(groups, panel.x + 44, panel.y + 322, panel.w - 88, panel.y + panel.h - 44);
  }
  ctx.restore();
}

function drawCurrentBuildEmpty(x, y, w, h) {
  ctx.save();
  ctx.fillStyle = OVERLAY_READABILITY.surface.fill;
  roundedRect(x, y, w, h, 10, true, false);
  ctx.strokeStyle = "rgba(126, 231, 255, 0.2)";
  roundedRect(x, y, w, h, 10, false, true);
  wrapText(t("currentBuildEmpty"), x + 22, y + 48, w - 44, 22, "rgba(238,244,252,0.74)", 16);
  ctx.restore();
}

function drawCurrentBuildSummary(stats, x, y, w, h) {
  const strongest = stats[0];
  ctx.save();
  ctx.fillStyle = OVERLAY_READABILITY.surface.fill;
  roundedRect(x, y, w, h, 9, true, false);
  ctx.strokeStyle = strongest ? hexToRgba(strongest.color, 0.34) : "rgba(126, 231, 255, 0.18)";
  roundedRect(x, y, w, h, 9, false, true);
  label(t("currentBuildStrongest").toUpperCase(), x + 16, y + 19, 11, "rgba(238,244,252,0.5)");
  const text = strongest ? `${strongest.label} x${strongest.count}` : t("currentBuildNoDirection");
  fitLabel(text, x + 16, y + 36, w - 32, 16, strongest ? strongest.color : "#8fe8dc", 11, "900", true);
  ctx.restore();
}

function drawCurrentBuildStats(stats, x, y, w) {
  if (!stats.length) {
    drawUpgradePill(x, y, 170, 24, t("currentBuildNoDirection"), "#8fe8dc", 0.1);
    return;
  }
  let xx = x;
  for (const stat of stats.slice(0, 5)) {
    const text = `${stat.label} x${stat.count}`;
    const pillW = Math.min(150, Math.max(88, ctx.measureText(text).width + 28));
    if (xx + pillW > x + w) break;
    drawUpgradePill(xx, y, pillW, 24, text.toUpperCase(), stat.color, 0.14);
    xx += pillW + 10;
  }
}

function drawCurrentBuildTraitDetails(traits, x, y, w, h) {
  const shown = traits.filter((trait) => trait.count > 0).slice(0, 4);
  if (!shown.length) {
    drawUpgradePill(x, y, 180, 24, t("traitEffectNone"), "#8fe8dc", 0.1);
    return;
  }
  const gap = 10;
  const cardW = (w - gap * 3) / 4;
  shown.forEach((trait, index) => {
    const xx = x + index * (cardW + gap);
    const active = trait.stage > 0;
    ctx.save();
    ctx.fillStyle = active ? hexToRgba(trait.color, 0.22) : OVERLAY_READABILITY.surface.fillSoft;
    roundedRect(xx, y, cardW, h, 8, true, false);
    ctx.strokeStyle = active ? hexToRgba(trait.color, 0.42) : "rgba(238,244,252,0.12)";
    roundedRect(xx, y, cardW, h, 8, false, true);
    fitLabel(getTraitDetailTitleForPanel(trait, { format: fmt, getFullCount: getTraitFullCount }), xx + 12, y + 18, cardW - 24, 12, active ? trait.color : "rgba(238,244,252,0.62)", 8, "900", true);
    fitLabel(getTraitEffectText(trait), xx + 12, y + 39, cardW - 24, 12, "rgba(238,244,252,0.62)", 8, "700");
    ctx.restore();
  });
}

function drawAcquiredRelicCards(groups, x, y, w, bottomY) {
  const columns = 3;
  const gap = 12;
  const cardW = (w - gap * (columns - 1)) / columns;
  const cardH = 66;
  const rowGap = 10;
  const maxRows = Math.max(1, Math.floor((bottomY - y - 24) / (cardH + rowGap)));
  const maxVisible = maxRows * columns;
  const visible = groups.slice(0, maxVisible);
  visible.forEach((group, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const cardX = x + col * (cardW + gap);
    const cardY = y + row * (cardH + rowGap);
    drawAcquiredRelicCard(group, cardX, cardY, cardW, cardH);
  });
  if (groups.length > visible.length) {
    label(`+${groups.length - visible.length}`, x, bottomY - 2, 14, "rgba(238,244,252,0.58)");
  }
}

function drawAcquiredRelicCard(group, x, y, w, h) {
  drawAcquiredRelicListRow(group, x, y, w, h);
}

function drawAcquiredRelicListRow(group, x, y, w, h) {
  const rarity = getRarityVisual(group.rarity);
  ctx.save();
  const cardG = ctx.createLinearGradient(x, y, x + w, y + h);
  cardG.addColorStop(0, hexToRgba(rarity.color, 0.16));
  cardG.addColorStop(1, OVERLAY_READABILITY.surface.fill);
  ctx.fillStyle = cardG;
  roundedRect(x, y, w, h, 7, true, false);
  ctx.strokeStyle = hexToRgba(rarity.border, 0.32);
  ctx.lineWidth = 1.1;
  roundedRect(x, y, w, h, 7, false, true);
  ctx.fillStyle = hexToRgba(rarity.color, 0.42);
  roundedRect(x + 5, y + 6, 4, h - 12, 3, true, false);
  const countText = group.count > 1 ? ` x${group.count}` : "";
  fitLabel(`${rarityLabel(group.rarity).toUpperCase()}${countText}`, x + 16, y + 17, Math.max(50, w - 28), 9, hexToRgba(rarity.color, 0.9), 7, "900", true);
  fitLabel(upgradeName(group.upgrade), x + 16, y + 34, w - 30, h >= 60 ? 13 : 12, rarity.titleColor, 8, "800", true);
  if (h >= 58) {
    drawUpgradeTagPills(group.tags, x + 16, y + 42, w - 32, 2, 0.56);
  } else if (group.tags?.length) {
    fitLabel(buildTagLabel(group.tags[0]).toUpperCase(), x + 16, y + h - 7, w - 32, 8, "rgba(238,244,252,0.56)", 6, "800", true);
  }
  ctx.restore();
}

function getAcquiredRelicGroups() {
  if (!Array.isArray(state.acquiredRelics)) state.acquiredRelics = [];
  return getAcquiredRelicGroupsForStats(state.acquiredRelics);
}

function getCurrentBuildFamilyStats(groups = getAcquiredRelicGroups()) {
  return getCurrentBuildFamilyStatsForGroups(groups, { translate: t });
}

function getTraitEntries(groups = getAcquiredRelicGroups()) {
  return getTraitEntriesForGroups(groups, { translate: t });
}

function getTraitCount(tag, groups = getAcquiredRelicGroups()) {
  return getTraitCountForGroups(tag, groups);
}

function getTraitStage(tag, count = getTraitCount(tag)) {
  return getTraitStageFromDefs(tag, count);
}

function getTraitNextThreshold(tag, count = getTraitCount(tag)) {
  return getTraitNextThresholdForGroups(tag, count);
}

function getTraitFullCount(tag) {
  return getTraitFullCountFromDefs(tag);
}

function getTraitProgress(tag, count = getTraitCount(tag)) {
  return getTraitProgressForGroups(tag, count);
}

function getTraitBonus(tag, values) {
  return getTraitBonusForGroups(tag, values, getAcquiredRelicGroups());
}

function getTraitEffectText(entry) {
  return getTraitEffectTextForEntry(entry, t);
}

function getTraitChangeHintsForUpgrade(upgrade) {
  return getTraitChangeHintsForUpgradeForGroups(upgrade, getAcquiredRelicGroups(), { translate: t });
}

function getCurrentBuildDirectionText(stats) {
  if (!stats.length) return t("currentBuildNoDirection");
  const families = stats.slice(0, 2).map((stat) => stat.label).join(" / ");
  return fmt("currentBuildDirection", { families });
}

function drawUpgradeTagPills(tags, x, y, maxWidth, maxTags = 2, alpha = 1, theme = null) {
  const visibleTags = getUpgradeTags({ tags }).slice(0, maxTags);
  let xx = x;
  const fontSize = theme?.tagFontSize || 9;
  const pillH = theme?.tagPillHeight || 18;
  const maxPillW = theme?.tagMaxPillWidth || 66;
  const pillGap = theme?.tagPillGap || 5;
  ctx.save();
  ctx.font = canvasFont("900", fontSize, "TAG", true);
  for (const tag of visibleTags) {
    const meta = getBuildTagMeta(tag);
    const text = buildTagLabel(tag).toUpperCase();
    const pillW = Math.min(maxPillW, Math.max(38, ctx.measureText(text).width + 18));
    if (xx + pillW > x + maxWidth) break;
    ctx.save();
    ctx.globalAlpha = alpha;
    drawUpgradePill(xx, y, pillW, pillH, text, meta.color, theme?.lightCard ? theme.tagFillAlpha : 0.16, theme);
    ctx.restore();
    xx += pillW + pillGap;
  }
  ctx.restore();
}

function drawUpgradePill(x, y, w, h, text, color, fillAlpha = 0.14, theme = null) {
  ctx.save();
  if (theme?.lightCard) {
    const fill = ctx.createLinearGradient(x, y, x, y + h);
    fill.addColorStop(0, "rgba(255, 252, 229, 0.82)");
    fill.addColorStop(1, hexToRgba(color, 0.34));
    ctx.fillStyle = fill;
  } else {
    ctx.fillStyle = hexToRgba(color, fillAlpha);
  }
  roundedRect(x, y, w, h, 7, true, false);
  ctx.strokeStyle = theme?.lightCard ? "rgba(76, 66, 32, 0.58)" : hexToRgba(color, 0.34);
  ctx.lineWidth = 1.2;
  roundedRect(x, y, w, h, 7, false, true);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  fitLabel(text, x + 8, y + h / 2 + 0.5, w - 16, theme?.tagTextSize || Math.min(10, h - 8), theme?.lightCard ? theme.tagTextColor : color, 8, "900", true);
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}

function upgradeFamilyShortLabel(family) {
  const shortKey = family.labelKey.replace("family.", "familyShort.");
  const shortLabel = t(shortKey);
  return shortLabel === shortKey ? t(family.labelKey) : shortLabel;
}

function buildTagLabel(tag) {
  return buildTagLabelForStats(tag, t);
}

function stackRuleLabel(rule = "stackable") {
  const key = `stack.${rule}`;
  const label = t(key);
  return label === key ? rule : label;
}

function drawMoveGuideOverlay() {
  ctx.save();
  drawDimOverlay(OVERLAY_READABILITY.scrim.standard);
  drawCard(176, 70, 928, 580);
  label(t("moveGuide"), 232, 136, 44, "#f5f1e6");
  label(t("moveGuideSubtitle"), 236, 174, 16, "#9fb4ff");
  const rows = [
    ["T-Spin", t("guideTSpinText"), "#f2d36b"],
    ["T-Spin Mini", t("guideTSpinMiniText"), "#d7c2ff"],
    ["All-Spin Mini", t("guideAllSpinMiniText"), "#9df7da"],
    ["Back-to-Back", t("guideB2BText"), "#fff0a6"],
    ["Perfect Clear", t("guidePerfectClearText"), "#fff0a6"],
    ["Incoming Cancel", t("guideIncomingCancelText"), "#ffb7bd"],
  ];
  rows.forEach((row, i) => drawGuideRow(232, 206 + i * 54, row[0], row[1], row[2], 816));
  drawDamageRulesBox(232, 538, 816, 56);
  drawMenuButton(232, 606, 180, 40, t("back"), "Esc");
  ctx.restore();
}

function drawDamageRulesBox(x, y, w, h) {
  ctx.save();
  ctx.fillStyle = OVERLAY_READABILITY.surface.fill;
  roundedRect(x, y, w, h, 8, true, false);
  ctx.strokeStyle = "rgba(255, 240, 166, 0.22)";
  roundedRect(x, y, w, h, 8, false, true);
  label(t("damageFormula"), x + 14, y + 26, 16, "#fff0a6");
  wrapText(t("damageRuleLine"), x + 134, y + 20, w - 154, 14, "rgba(238,244,252,0.66)", 10);
  label(`${t("effectTierTitle")}: ${t("effectTierText")}`, x + 14, y + 48, 11, "rgba(238,244,252,0.56)");
  ctx.restore();
}

function drawGuideRow(x, y, title, text, color, width = 620) {
  ctx.save();
  ctx.fillStyle = OVERLAY_READABILITY.surface.fill;
  roundedRect(x, y, width, 48, 8, true, false);
  ctx.fillStyle = hexToRgba(color, 0.28);
  roundedRect(x, y, 5, 48, 5, true, false);
  ctx.strokeStyle = hexToRgba(color, 0.25);
  roundedRect(x, y, width, 48, 8, false, true);
  fitLabel(title, x + 18, y + 30, 176, 17, color, 13, "800", true);
  wrapText(text, x + 218, y + 20, width - 242, 16, "rgba(238,244,252,0.72)", 12);
  ctx.restore();
}

function drawMenuButton(x, y, w, h, text, hint, variant = "secondary", options = {}) {
  drawMenuButtonPanel(ctx, {
    x, y, w, h, text, hint, variant,
    pointer: state.pointer,
    now: performance.now(),
    motion: options.motion,
  }, {
    canvasFont,
    fitLabel,
    roundedRect,
  });
}

function t(key) {
  const table = translations[state.language] || translations.zh;
  return table[key] || translations.en[key] || translations.zh[key] || key;
}

function fmt(key, vars = {}) {
  return t(key).replace(/\{(\w+)\}/g, (_, name) => (vars[name] ?? `{${name}}`));
}

function setMessage(key, vars = {}) {
  state.messageKey = key;
  state.messageVars = vars;
  state.message = fmt(key, vars);
}

function getMessage() {
  return state.messageKey ? fmt(state.messageKey, state.messageVars) : state.message;
}

function setLanguage(language) {
  state.language = language === "en" ? "en" : "zh";
  syncControlHints();
  saveGame();
}

function upgradeText(upgrade) {
  if (upgrade.textKey) return t(upgrade.textKey);
  return state.language === "zh" ? upgrade.text : upgrade.textEn || upgrade.text;
}

function upgradeShortText(upgrade) {
  if (upgrade.shortTextKey) return t(upgrade.shortTextKey);
  return upgradeText(upgrade);
}

function upgradeName(upgrade) {
  const key = `upgradeName.${upgrade.id}`;
  const translated = t(key);
  return translated === key ? upgrade.name : translated;
}

function rarityLabel(rarity) {
  const labels = {
    common: { zh: "Common", en: "Common" },
    rare: { zh: "Rare", en: "Rare" },
    relic: { zh: "Relic", en: "Relic" },
    legendary: { zh: "Legendary", en: "Legendary" },
    boss: { zh: "Boss", en: "Boss" },
    special: { zh: "Special", en: "Special" },
  };
  return (labels[rarity] && labels[rarity][state.language]) || rarity;
}

function enemyWeaknessLabel(enemy) {
  const keyByWeakness = {
    none: "weaknessNone",
    combo: "weaknessCombo",
    perfect: "weaknessPerfect",
    spin: "weaknessSpin",
    allspin: "weaknessAllSpin",
    "all-spin": "weaknessAllSpin",
    b2b: "weaknessB2B",
  };
  return t(keyByWeakness[enemy.weakness] || "weaknessNone");
}

function enemyWeaknessToken(enemy) {
  return {
    none: "-",
    combo: "Combo",
    perfect: "PC",
    spin: "Spin",
    allspin: "All",
    "all-spin": "All",
    b2b: "B2B",
  }[enemy.weakness] || "-";
}

function enemyName(enemy) {
  return t(`enemy.${enemy.id}.name`);
}

function enemyTrait(enemy) {
  return t(`enemy.${enemy.id}.trait`);
}

function drawSettings() {
  if (state.mode === "playing") {
    drawRunRiftEnergyHud();
    drawPauseButton();
  }
}

function drawRunRiftEnergyHud() {
  if (state.runMode === "ascension") return;
  const amount = getCurrentRunRiftEnergyEarned();
  const b = UI_LAYOUT.pauseButton;
  const w = 128;
  const h = 42;
  const x = b.x - w - 10;
  const y = b.y - 2;
  const pulse = amount > 0 ? 0.5 + Math.sin(performance.now() * 0.007) * 0.5 : 0;
  ctx.save();
  ctx.fillStyle = amount > 0 ? "rgba(25, 15, 46, 0.72)" : "rgba(8, 13, 20, 0.58)";
  ctx.shadowColor = `rgba(184, 141, 255, ${0.14 + pulse * 0.12})`;
  ctx.shadowBlur = amount > 0 ? 14 : 8;
  roundedRect(x, y, w, h, 10, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = amount > 0 ? "rgba(255, 240, 166, 0.38)" : "rgba(145, 232, 222, 0.22)";
  ctx.lineWidth = 1.5;
  roundedRect(x, y, w, h, 10, false, true);
  drawImageContain(riftEnergyIcon, x + 5, y + 1, 40, 40);
  fitLabel(String(amount), x + 51, y + 28, w - 61, 21, amount > 0 ? "#fff0a6" : "rgba(238,244,252,0.72)", 15, "900", true);
  ctx.restore();
}

function controlDisplayValue(action) {
  return getControlDisplayValue(action, { getControlKeys, formatControlKey });
}

function drawPauseButton() {
  const b = UI_LAYOUT.pauseButton;
  const hovered = pointInRect(state.pointer.x, state.pointer.y, b.x, b.y, b.w, b.h);
  ctx.save();
  ctx.fillStyle = hovered ? "rgba(112, 226, 218, 0.24)" : "rgba(8, 13, 20, 0.58)";
  roundedRect(b.x, b.y, b.w, b.h, 10, true, false);
  ctx.strokeStyle = "rgba(145, 232, 222, 0.32)";
  ctx.lineWidth = 2;
  roundedRect(b.x, b.y, b.w, b.h, 10, false, true);
  ctx.strokeStyle = "#d8f8f4";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(b.x + 18, b.y + 10);
  ctx.lineTo(b.x + 18, b.y + 28);
  ctx.moveTo(b.x + 32, b.y + 10);
  ctx.lineTo(b.x + 32, b.y + 28);
  ctx.stroke();
  ctx.restore();
}

function drawImageContain(img, x, y, w, h) {
  if (!isImageReady(img)) {
    drawImageFallbackBox(x, y, w, h, getMissingImageLabel(img, "IMAGE"));
    return;
  }
  const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function drawImageCoverRaw(img, x, y, w, h) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function drawImageCropContain(img, sx, sy, sw, sh, x, y, w, h) {
  if (!isImageReady(img) || sw <= 0 || sh <= 0) {
    drawImageFallbackBox(x, y, w, h, getMissingImageLabel(img, "CROP"));
    return;
  }
  const scale = Math.min(w / sw, h / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(img, sx, sy, sw, sh, x + (w - dw) / 2, y + h - dh, dw, dh);
}

function drawRosterSprite(id, x, y, w, h) {
  if (!isImageReady(rosterArt)) {
    drawImageFallbackBox(x, y, w, h, "ROSTER");
    return;
  }
  const cell = ROSTER_CELLS[id] || ROSTER_CELLS.slime;
  const cw = rosterArt.naturalWidth / 4;
  const ch = rosterArt.naturalHeight / 2;
  const sx = cell[0] * cw;
  const sy = cell[1] * ch;
  const scale = Math.min(w / cw, h / ch);
  const dw = cw * scale;
  const dh = ch * scale;
  ctx.drawImage(rosterArt, sx, sy, cw, ch, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function getMissingImageLabel(img, fallback) {
  const record = getImageAssetRecord(img);
  return record ? record.id.replace(/-/g, " ").toUpperCase() : fallback;
}

function drawImageFallbackBox(x, y, w, h, text = "MISSING IMAGE") {
  ctx.save();
  ctx.fillStyle = "rgba(7, 10, 16, 0.46)";
  roundedRect(x, y, w, h, 10, true, false);
  ctx.strokeStyle = "rgba(126, 231, 255, 0.2)";
  ctx.setLineDash([7, 5]);
  roundedRect(x, y, w, h, 10, false, true);
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(238, 244, 252, 0.58)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = canvasFont("800", Math.max(10, Math.min(14, w / 14)), text, true);
  ctx.fillText(text, x + w / 2, y + h / 2);
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}

const HAS_POINTER_EVENTS = typeof window.PointerEvent !== "undefined";
const CANVAS_POINTER_MOVE_EVENT = HAS_POINTER_EVENTS ? "pointermove" : "mousemove";
const CANVAS_POINTER_DOWN_EVENT = HAS_POINTER_EVENTS ? "pointerdown" : "mousedown";
const CANVAS_POINTER_UP_EVENT = HAS_POINTER_EVENTS ? "pointerup" : "mouseup";

window.addEventListener("keydown", (event) => {
  const key = event.key;
  const code = event.code;
  const normalized = normalizeControlKey(key);
  if (state.bindingAction) {
    event.preventDefault();
    if (normalized !== "escape") {
      bindControl(state.bindingAction, normalized);
      syncControlHints();
      saveGame();
      playSfx("hold");
    }
    state.bindingAction = null;
    return;
  }
  if (isGameKey(key, code)) {
    event.preventDefault();
  }

  if (state.mode === "upgrade" && state.currentBuildOpen) {
    if (key === "Escape") {
      state.currentBuildOpen = false;
      playSfx("uiCancel");
    }
    return;
  }

  if (state.mode === "upgrade" && state.upgradePickConfirm) return;

  if (state.mode === "upgrade") {
    if (key === "ArrowLeft" || key === "ArrowRight") {
      moveUpgradeSelection(key === "ArrowLeft" ? -1 : 1);
      return;
    }
    if (!event.repeat && isActionKey("hold", key)) {
      toggleUpgradeDetail();
      return;
    }
    if (code === "Space" || key === " ") {
      chooseUpgrade(state.upgradeSelectedIndex);
      return;
    }
    if (["1", "2", "3"].includes(key)) {
      chooseUpgrade(Number(key) - 1);
      return;
    }
  }
  if (key === "Enter" && state.mode !== "playing") {
    if (state.mode === "upgrade") chooseUpgrade(state.upgradeSelectedIndex);
    else if (state.mode === "ascensionResult") {
      if (state.ascensionRun?.status === "failed") startAscensionChallenge();
      else returnToMetaUpgradeFromAscension();
    }
    else if (state.mode === "start" && state.assetLoadingDone && !state.settingsOpen) resetGame("endless");
    return;
  }
  if (normalized === "r" && state.mode === "ascensionResult" && state.ascensionRun?.status === "failed") {
    startAscensionChallenge();
    return;
  }
  if (normalized === "r" && (state.mode === "victory" || state.mode === "defeat")) {
    resetGame(state.runMode);
    return;
  }
  if (normalized === "r" && state.mode === "paused" && state.pauseView === "menu") {
    resetGame(state.runMode);
    return;
  }
  if (normalized !== "escape" && isActionKey("pause", key)) {
    if (state.mode === "playing") {
      setGameMode("paused");
      state.pauseView = "menu";
      state.settingsOpen = false;
    }
    else if (state.mode === "paused") {
      setGameMode("playing");
      state.pauseView = "menu";
    }
    return;
  }
  if (key === "Escape") {
    unlockAudio();
    state.bindingAction = null;
    if (state.mode === "playing") {
      setGameMode("paused");
      state.pauseView = "menu";
      state.settingsOpen = false;
    }
    else if (state.mode === "start" && state.assetLoadingDone) {
      state.settingsOpen = !state.settingsOpen;
      if (state.settingsOpen) state.settingsTab = "controls";
    }
    else if (state.mode === "paused") {
      setGameMode("playing");
      state.pauseView = "menu";
      state.settingsOpen = false;
    } else if (state.mode === "ascensionResult") {
      returnToMetaUpgradeFromAscension();
    } else if (state.mode === "metaUpgrade" || state.mode === "guide" || state.mode === "victory" || state.mode === "defeat") {
      setGameMode("start");
      state.settingsOpen = false;
    } else {
      state.settingsOpen = !state.settingsOpen;
    }
    playSfx("uiCancel");
    return;
  }
  if (isActionKey("mute", key)) {
    toggleMute();
    return;
  }
  if (state.mode !== "playing") return;
  if (isBattleCountdownActive()) return;

  if (isActionKey("left", key) && !event.repeat) pressHorizontal(-1);
  else if (isActionKey("right", key) && !event.repeat) pressHorizontal(1);
  else if (isActionKey("softDrop", key)) {
    state.input.softDrop = true;
    if (!event.repeat) {
      state.input.softDropTimer = 0;
      move(0, 1);
    }
  }
  else if (!event.repeat && isActionKey("rotateCW", key)) rotate(1);
  else if (!event.repeat && isActionKey("rotateCCW", key)) rotate(-1);
  else if (!event.repeat && isActionKey("rotate180", key)) rotate180();
  else if (!event.repeat && isActionKey("hardDrop", key)) hardDrop();
  else if (!event.repeat && isActionKey("hold", key)) holdPiece();
});

window.addEventListener("keyup", (event) => {
  if (isActionKey("left", event.key)) releaseHorizontal(-1);
  else if (isActionKey("right", event.key)) releaseHorizontal(1);
  else if (isActionKey("softDrop", event.key)) {
    state.input.softDrop = false;
    state.input.softDropTimer = 0;
  }
});

function isGameKey(key, code) {
  const normalized = normalizeControlKey(key);
  return allControlKeys().includes(normalized)
    || key === "Enter"
    || key === "Escape"
    || (state.mode === "upgrade" && (key === "ArrowLeft" || key === "ArrowRight"))
    || ["1", "2", "3"].includes(key)
    || (state.mode === "paused" && state.pauseView === "menu" && normalized === "r")
    || ((state.mode === "victory" || state.mode === "defeat") && normalized === "r")
    || (state.mode === "ascensionResult" && normalized === "r")
    || code === "Space";
}

function isActionKey(action, key) {
  return getControlKeys(action).includes(normalizeControlKey(key));
}

function bindControl(action, key) {
  const normalized = normalizeControlKey(key);
  for (const { id } of CONTROL_ACTIONS) {
    if (id !== action) state.controls[id] = getControlKeys(id).filter((existing) => existing !== normalized);
  }
  state.controls[action] = [normalized];
}

function normalizeControlKey(key) {
  if (key === " ") return " ";
  if (key.length === 1) return key.toLowerCase();
  return key.toLowerCase();
}

canvas.addEventListener(CANVAS_POINTER_MOVE_EVENT, (event) => {
  const p = getCanvasPoint(event);
  state.pointer.x = p.x;
  state.pointer.y = p.y;
  const heroHovered = updateMenuHeroHoverFromPointer(p.x, p.y);
  canvas.style.cursor = heroHovered ? "pointer" : "";
  if (state.pointer.down && state.pointer.dragging) {
    event.preventDefault();
    updateSliderFromPointer(state.pointer.dragging, p.x);
  }
});

canvas.addEventListener(CANVAS_POINTER_DOWN_EVENT, (event) => {
  event.preventDefault();
  if (HAS_POINTER_EVENTS && typeof canvas.setPointerCapture === "function" && Number.isFinite(event.pointerId)) {
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is a drag convenience; losing it should not block input.
    }
  }
  unlockAudio();
  const p = getCanvasPoint(event);
  state.pointer = { ...state.pointer, x: p.x, y: p.y, down: true };
  const b = UI_LAYOUT.pauseButton;

  if (state.mode === "playing" && pointInRect(p.x, p.y, b.x, b.y, b.w, b.h)) {
    setGameMode("paused");
    state.pauseView = "menu";
    state.settingsOpen = false;
    state.bindingAction = null;
    playSfx("uiConfirm");
    return;
  }

  if (state.mode === "paused") {
    handlePausePointerDown(p.x, p.y);
    return;
  }

  if (state.mode === "start" && state.settingsOpen) {
    handleSettingsPointerDown(p.x, p.y, "start");
    return;
  }

  if (state.mode === "start" && state.assetLoadingDone && !state.settingsOpen && isPointOverMenuHero(p.x, p.y)) {
    triggerMenuHeroAction("click");
    return;
  }

  if (!state.settingsOpen && state.mode !== "playing") {
    if (state.mode === "ascensionResult") {
      handleAscensionResultPointerDown(p.x, p.y);
      return;
    }
    if (state.mode === "metaUpgrade") {
      handleMetaUpgradePointerDown(p.x, p.y);
      return;
    }
    if (state.mode === "upgrade") {
      if (state.upgradePickConfirm) return;
      if (state.currentBuildOpen) {
        handleCurrentBuildPointerDown(p.x, p.y);
        return;
      }
      const buildButton = getCurrentBuildButtonRect();
      if (pointInRect(p.x, p.y, buildButton.x, buildButton.y, buildButton.w, buildButton.h)) {
        state.currentBuildOpen = true;
        playSfx("uiConfirm");
        return;
      }
      const detailToggle = getUpgradeDetailToggleRect();
      if (pointInRect(p.x, p.y, detailToggle.x, detailToggle.y, detailToggle.w, detailToggle.h)) {
        toggleUpgradeDetail();
        return;
      }
      for (let i = 0; i < 3; i += 1) {
        const card = getUpgradeCardRect(i);
        if (pointInRect(p.x, p.y, card.x, card.y, card.w, card.h)) {
          previewUpgradeChoice(i);
          return;
        }
      }
    }
    if (state.mode === "start" && state.assetLoadingDone) {
      const buttons = getMainMenuButtonRects();
      if (pointInRect(p.x, p.y, buttons.start.x, buttons.start.y, buttons.start.w, buttons.start.h)) resetGame("endless");
      else if (pointInRect(p.x, p.y, buttons.mainStage.x, buttons.mainStage.y, buttons.mainStage.w, buttons.mainStage.h)) resetGame("storyEgypt");
      else if (pointInRect(p.x, p.y, buttons.metaUpgrade.x, buttons.metaUpgrade.y, buttons.metaUpgrade.w, buttons.metaUpgrade.h)) {
        setGameMode("metaUpgrade");
        state.metaProgress = loadMetaProgress();
        state.metaUpgradeMessage = { key: "", vars: {}, until: 0 };
        playSfx("uiConfirm");
      }
      else if (pointInRect(p.x, p.y, buttons.guide.x, buttons.guide.y, buttons.guide.w, buttons.guide.h)) {
        setGameMode("guide");
        playSfx("uiConfirm");
      }
      else if (pointInRect(p.x, p.y, buttons.settings.x, buttons.settings.y, buttons.settings.w, buttons.settings.h)) {
        state.settingsOpen = true;
        state.settingsTab = "controls";
        playSfx("uiConfirm");
      }
      return;
    }
    if (state.mode === "guide" && pointInRect(p.x, p.y, 232, 606, 180, 40)) {
      setGameMode("start");
      playSfx("uiCancel");
      return;
    }
    if (state.mode === "paused" && pointInRect(p.x, p.y, 384, 408, 178, 44)) {
      setGameMode("playing");
      return;
    }
    if (state.mode === "paused" && pointInRect(p.x, p.y, 578, 408, 178, 44)) {
      resetGame(state.runMode);
      return;
    }
    if (state.mode === "paused" && pointInRect(p.x, p.y, 772, 408, 122, 44)) {
      setGameMode("start");
      return;
    }
    if (state.mode === "victory" || state.mode === "defeat") {
      const buttons = getResultButtonRects();
      if (pointInRect(p.x, p.y, buttons.retry.x, buttons.retry.y, buttons.retry.w, buttons.retry.h)) {
        resetGame(state.runMode);
        return;
      }
      if (pointInRect(p.x, p.y, buttons.upgrade.x, buttons.upgrade.y, buttons.upgrade.w, buttons.upgrade.h)) {
        setGameMode("metaUpgrade");
        state.metaProgress = loadMetaProgress();
        state.metaUpgradeMessage = { key: "", vars: {}, until: 0 };
        playSfx("uiConfirm");
        return;
      }
      if (pointInRect(p.x, p.y, buttons.menu.x, buttons.menu.y, buttons.menu.w, buttons.menu.h)) {
        setGameMode("start");
        playSfx("uiCancel");
        return;
      }
    }
  }
});

function handleCurrentBuildPointerDown(x, y) {
  const closeRect = getCurrentBuildCloseRect();
  if (pointInRect(x, y, closeRect.x, closeRect.y, closeRect.w, closeRect.h)) {
    state.currentBuildOpen = false;
    playSfx("uiCancel");
  }
}

function handlePausePointerDown(x, y) {
  if (state.pauseView === "settings") {
    handleSettingsPointerDown(x, y, "pause");
    return;
  }
  const m = UI_LAYOUT.pauseMenu;
  if (pointInRect(x, y, m.x + 56, m.y + 156, m.w - 112, 48)) {
    setGameMode("playing");
    state.pauseView = "menu";
    playSfx("uiConfirm");
    return;
  }
  if (pointInRect(x, y, m.x + 56, m.y + 216, m.w - 112, 44)) {
    resetGame(state.runMode);
    return;
  }
  if (pointInRect(x, y, m.x + 56, m.y + 270, m.w - 112, 44)) {
    state.pauseView = "settings";
    state.settingsTab = "controls";
    playSfx("uiConfirm");
    return;
  }
  if (pointInRect(x, y, m.x + 56, m.y + 324, m.w - 112, 44)) {
    setGameMode("start");
    state.pauseView = "menu";
    state.settingsOpen = false;
    playSfx("uiCancel");
  }
}

function handleSettingsPointerDown(x, y, source) {
  const backButton = getSettingsBackButtonRect();
  if (pointInRect(x, y, backButton.x, backButton.y, backButton.w, backButton.h)) {
    state.bindingAction = null;
    if (source === "start") state.settingsOpen = false;
    else state.pauseView = "menu";
    playSfx("uiCancel");
    return;
  }
  const tab = hitSettingsTab(x, y);
  if (tab) {
    state.settingsTab = tab;
    state.bindingAction = null;
    playSfx("uiConfirm");
    return;
  }
  const resetAction = hitSettingsResetButton(x, y);
  if (resetAction) {
    if (resetAction === "keybinds") resetKeybindsToDefault();
    else if (resetAction === "handling") resetHandlingToDefault();
    playSfx("uiConfirm");
    return;
  }
  const feedbackUrl = hitSettingsFeedbackLink(x, y);
  if (feedbackUrl) {
    openFeedbackLink(feedbackUrl);
    playSfx("uiConfirm");
    return;
  }
  const slider = hitSlider(x, y);
  if (slider) {
    state.pointer.dragging = slider;
    updateSliderFromPointer(slider, x);
    previewSfx();
    return;
  }
  const origin = getSettingsContentOrigin();
  if (state.settingsTab === "audio" && pointInRect(x, y, origin.x + 116, origin.y + 250, 64, 30)) {
    toggleMute();
    playSfx("hold");
    return;
  }
  if (state.settingsTab === "language") {
    if (pointInRect(x, y, origin.x, origin.y + 72, 72, 34)) {
      setLanguage("zh");
      playSfx("hold");
      return;
    }
    if (pointInRect(x, y, origin.x + 80, origin.y + 72, 72, 34)) {
      setLanguage("en");
      playSfx("hold");
      return;
    }
  }
  const action = hitControlBind(x, y);
  if (action) {
    state.bindingAction = action;
    playSfx("hold");
  }
}

function hitSettingsTab(x, y) {
  const s = UI_LAYOUT.settings;
  for (let i = 0; i < SETTINGS_TABS.length; i += 1) {
    if (pointInRect(x, y, s.tabX, s.y + 112 + i * 62, 164, 46)) return SETTINGS_TABS[i];
  }
  return null;
}

function hitSettingsResetButton(x, y) {
  if (state.settingsTab === "controls") {
    const rect = getControlsResetButtonRect();
    if (pointInRect(x, y, rect.x, rect.y, rect.w, rect.h)) return "keybinds";
  }
  if (state.settingsTab === "handling") {
    const rect = getHandlingResetButtonRect();
    if (pointInRect(x, y, rect.x, rect.y, rect.w, rect.h)) return "handling";
  }
  return "";
}

function resetKeybindsToDefault() {
  state.controls = normalizeControlsMap(DEFAULT_CONTROLS);
  state.bindingAction = null;
  syncControlHints();
  saveGame();
}

function resetHandlingToDefault() {
  state.tuning = {
    ...state.tuning,
    das: DEFAULT_TUNING.das,
    arr: DEFAULT_TUNING.arr,
    softDrop: DEFAULT_TUNING.softDrop,
    lockDelay: DEFAULT_TUNING.lockDelay,
  };
  resetInputRepeat();
  saveGame();
}

function getSettingsSliderTrackX(kind) {
  const origin = getSettingsContentOrigin();
  return kind === "tuning" ? origin.x + 248 : origin.x;
}

function getSettingsSliderTrackWidth(kind) {
  return kind === "tuning" ? 278 : 270;
}

function hitSettingsFeedbackLink(x, y) {
  if (state.settingsTab !== "feedback") return "";
  const card = getSettingsFeedbackCardRect();
  const buttonRect = getSettingsFeedbackButtonRect(card.x, card.y, card.w, card.h);
  if (pointInRect(x, y, buttonRect.x, buttonRect.y, buttonRect.w, buttonRect.h)) return GITHUB_FEEDBACK_URL;
  return "";
}

function openFeedbackLink(url) {
  const opened = window.open(url, "_blank");
  if (opened) opened.opener = null;
}

window.addEventListener(CANVAS_POINTER_UP_EVENT, () => {
  const dragging = state.pointer.dragging;
  if (dragging?.startsWith("audio:") || dragging?.startsWith("tuning:")) {
    const slider = state.pointer.elasticSlider || {};
    state.pointer.elasticSlider = {
      key: "",
      overflow: 0,
      releaseKey: dragging,
      releaseOverflow: slider.key === dragging ? slider.overflow || 0 : 0,
      releaseStartedAt: performance.now(),
    };
  }
  state.pointer.down = false;
  state.pointer.dragging = null;
});

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * W,
    y: ((event.clientY - rect.top) / rect.height) * H,
  };
}

function hitSlider(x, y) {
  const origin = getSettingsContentOrigin();
  const sliders = [];
  if (state.settingsTab === "audio") {
    sliders.push(
      ["audio:masterVolume", origin.x, origin.y + 64, getSettingsSliderTrackWidth("audio")],
      ["audio:musicVolume", origin.x, origin.y + 128, getSettingsSliderTrackWidth("audio")],
      ["audio:sfxVolume", origin.x, origin.y + 192, getSettingsSliderTrackWidth("audio")],
    );
  } else if (state.settingsTab === "handling") {
    const trackX = getSettingsSliderTrackX("tuning");
    const trackW = getSettingsSliderTrackWidth("tuning");
    sliders.push(
      ["tuning:das", trackX, origin.y + 66 + 34, trackW],
      ["tuning:arr", trackX, origin.y + 154 + 34, trackW],
      ["tuning:softDrop", trackX, origin.y + 242 + 34, trackW],
      ["tuning:lockDelay", trackX, origin.y + 330 + 34, trackW],
    );
  }
  for (const [key, sx, sy, sw] of sliders) {
    if (pointInRect(x, y, sx - 16, sy - 18, sw + 32, 50)) return key;
  }
  return null;
}

function updateSliderFromPointer(key, x) {
  const [kind, name] = key.split(":");
  const sliderX = getSettingsSliderTrackX(kind);
  const trackW = getSettingsSliderTrackWidth(kind);
  if (kind === "audio") {
    const result = getElasticRiftSliderValueFromPointer({
      pointerX: x,
      trackX: sliderX,
      trackWidth: trackW,
      min: 0,
      max: 1,
    });
    audio[name] = result.value;
    state.pointer.elasticSlider = {
      key,
      overflow: result.overflow,
      releaseKey: "",
      releaseOverflow: 0,
      releaseStartedAt: 0,
    };
  } else if (kind === "tuning") {
    const spec = TUNING_SLIDERS[name];
    const result = getElasticRiftSliderValueFromPointer({
      pointerX: x,
      trackX: sliderX,
      trackWidth: trackW,
      min: spec.min,
      max: spec.max,
      step: 1,
    });
    state.tuning[name] = result.value;
    state.pointer.elasticSlider = {
      key,
      overflow: result.overflow,
      releaseKey: "",
      releaseOverflow: 0,
      releaseStartedAt: 0,
    };
  }
  applyAudioSettings();
  saveGame();
}

function hitControlBind(x, y) {
  if (state.settingsTab !== "controls") return null;
  const origin = getSettingsContentOrigin();
  const layout = UI_LAYOUT.controlsGrid;
  const baseX = origin.x;
  const baseY = origin.y + 112;
  for (let i = 0; i < CONTROL_ACTIONS.length; i += 1) {
    const col = i % layout.columns;
    const row = Math.floor(i / layout.columns);
    const rowX = baseX + col * layout.gapX;
    const rowY = baseY + row * layout.rowH;
    const keyX = rowX + layout.rowW - layout.keyW;
    if (pointInRect(x, y, keyX, rowY + 3, layout.keyW, layout.keyH)) return CONTROL_ACTIONS[i].id;
  }
  return null;
}

applySavedSettings();
syncControlHints();
initDomOverlayRoot({ canvasWidth: W, canvasHeight: H });
initFeedbackLayer({ canvasWidth: W, canvasHeight: H });
setFeedbackMode(state.mode);
try {
  draw();
} catch (error) {
  state.debug.drawError = String(error?.message || error);
  console.error("[T-Spin Traveler] Initial draw failed:", error);
}
if (DEBUG_HUD_ENABLED) {
  const initialDebugNow = performance.now();
  updateDebugDomHud({
    enabled: DEBUG_HUD_ENABLED,
    debugState: state.debug,
    readers: getDebugHudReaders(initialDebugNow),
    now: initialDebugNow,
  });
  updateDebugArtTuningDom({
    enabled: DEBUG_HUD_ENABLED,
    tuning: getDebugArtTuning({ enabled: DEBUG_HUD_ENABLED }),
  });
}
requestAnimationFrame(update);
