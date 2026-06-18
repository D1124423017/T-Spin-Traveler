import {
  ASSET_REGISTRY,
  equipmentIcons,
  equipmentRarityEmblems,
  equipmentRewardPanelArts,
  equipmentRouletteLayers,
  equipmentRoulettePointer,
  enemyBattlePortraits,
  forestBg,
  getImageAssetRecord,
  heroIdleArt,
  isImageReady,
  mainMenuHomeKingdomBg,
  mainMenuDialogueFrame,
  mainMenuPrimaryFrame,
  mainMenuRuneArcBack,
  mainMenuRiftKingdomBg,
  mainMenuSecondaryFrame,
  metaUpgradeIcons,
  menuIdleCubeSheet,
  menuIdleMeditateSheet,
  menuIdleRiftWayfinderSheet,
  menuIdleStarMapListenerSheet,
  musicLoopAssets,
  noaBattleIdleArt,
  noaCheatHandArt,
  noaFeedbackBowArt,
  noaLevelUpSheet,
  oneShotAudioAssets,
  riftEnergyIcon,
  slimeArt,
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
  STORY_SCENE_IDS,
  getStoryScene,
} from "./src/data/storyChapters.js";
import { UPGRADES } from "./src/data/upgrades.js";
import {
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
  createEquipmentCombatState,
  getEquipmentBattleStartGuard,
  resolveEquipmentAttack,
  resolveEquipmentFatalHit,
  resolveEquipmentGuardImpact,
  resolveEquipmentGuardGain,
  startEquipmentCombatWave,
} from "./src/combat/equipmentEffects.js";
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
  getUtilityTraitBonus,
  isTraitHighValueClear,
} from "./src/combat/upgradeEffects.js";
import {
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
  grantRiftEnergy,
  loadMetaProgress,
  saveMetaProgress,
  spendRiftEnergy,
} from "./src/core/metaProgress.js";
import { createEquipmentController } from "./src/core/equipmentController.js";
import { getEquipmentLoadoutStats } from "./src/core/equipmentStats.js";
import {
  advanceAscensionChallengeRun,
  applyAscensionChallengeResult,
  canUnlockAscensionChallenge,
  createAscensionChallengeRun,
  failAscensionChallengeRun,
  getNextAscensionChallenge,
  recordAscensionChallengeLines,
  startAscensionChallengeRun,
} from "./src/core/ascensionChallenge.js";
import {
  getAssetLoadingSummary,
  isAssetLoadingComplete,
} from "./src/core/assetReadiness.js";
import { createAssetLoadingController } from "./src/core/assetLoadingController.js";
import { createBattleCountdownCueReader } from "./src/core/battleCountdownModel.js";
import { createBuildStatsController } from "./src/core/buildStatsController.js";
import { createGameModeSetter } from "./src/core/gameModeHelpers.js";
import {
  createModeOverlayRouter,
  resolveModeOverlayPath,
} from "./src/core/modeRouter.js";
import { createRunStatsFactory } from "./src/core/runStatsFactory.js";
import { createStoryModeController } from "./src/core/storyModeController.js";
import {
  clamp,
  drawRoundedRect,
  hexToRgba,
  OVERLAY_READABILITY,
  pointInRect,
  smoothstep,
} from "./src/render/drawUtils.js";
import { drawBattleBackground } from "./src/render/backgroundRenderer.js";
import {
  createAttackEffectRenderer,
  isHeroMeleeAttackStyle,
} from "./src/render/attackEffectRenderer.js";
import { createBattleBoardRenderer } from "./src/render/battleBoardRenderer.js";
import { createBattleParticleRenderer } from "./src/render/battleParticleRenderer.js";
import { createBattleParticleSpawner } from "./src/render/battleParticleSpawner.js";
import { createBattleSceneRenderer } from "./src/render/battleSceneRenderer.js";
import { createCombatAnimationStateController } from "./src/render/combatAnimationStateController.js";
import {
  alignDrawBoxToBaseline,
  createCharacterStageHelpers,
  getBaselineAnchorY,
} from "./src/render/characterStageHelpers.js";
import { createCombatCinematicRenderer } from "./src/render/combatCinematicRenderer.js";
import { createEnemyStageRenderer } from "./src/render/enemyStageRenderer.js";
import { createEffectStateUpdater } from "./src/render/effectStateUpdater.js";
import { createFallbackCharacterRenderer } from "./src/render/fallbackCharacterRenderer.js";
import { createGameplayFrameController } from "./src/render/gameplayFrameController.js";
import { drawGameplayFrame } from "./src/render/gameplayRenderer.js";
import { createHeroCombatFallbackRenderer } from "./src/render/heroCombatFallbackRenderer.js";
import { createImageRenderer } from "./src/render/imageRenderer.js";
import { createKeyedSpriteRenderer } from "./src/render/keyedSpriteRenderer.js";
import { createMainMenuSceneRenderer } from "./src/render/mainMenuSceneRenderer.js";
import { createStoryComicRenderer } from "./src/render/storyComicRenderer.js";
import { getAnimationDuration } from "./src/render/animationTiming.js";
import { createBattlePresentationConfig } from "./src/render/battlePresentationConfig.js";
import { createPlayerStageRenderer } from "./src/render/playerStageRenderer.js";
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
  getResultButtonRects,
  getSettingsBackButtonRect as getSettingsBackButtonRectForLayout,
  getSettingsContentOrigin as getSettingsContentOriginForLayout,
  getSettingsFeedbackCardRect as getSettingsFeedbackCardRectForLayout,
  getSettingsFeedbackButtonRect,
  getUltimateCountdownSeconds,
  getUltimateTimerRatio,
  shouldShowUltimateCountdownWarning,
} from "./src/ui/hudLayout.js";
import {
  drawAscensionChallengeHud as renderAscensionChallengeHud,
  drawAscensionResultOverlay as renderAscensionResultOverlay,
} from "./src/ui/ascensionChallengeOverlay.js";
import { createBattleHudRenderer } from "./src/ui/battleHud.js";
import { createBattleFeedbackController } from "./src/ui/battleFeedbackController.js";
import { createBattleUiPrimitives } from "./src/ui/battleUiPrimitives.js";
import { createCombatFeedbackRenderer } from "./src/ui/combatFeedbackRenderer.js";
import { createEnemyPanelRenderer } from "./src/ui/enemyPanel.js";
import { createEquipmentScreenRenderer } from "./src/ui/equipmentScreen.js";
import {
  createEquipmentSpinMotion,
  createEquipmentUpgradeMotion,
  getEquipmentMotionState,
} from "./src/ui/equipmentMotion.js";
import { createGameplayPromptRenderer } from "./src/ui/gameplayPromptRenderer.js";
import {
  createSidePieceLayout,
  createSidePieceRenderer,
} from "./src/ui/sidePieceRenderer.js";
import { getStoryComicLayout } from "./src/ui/storyComicOverlay.js";
import { buildDamageEquation } from "./src/ui/combatReadout.js";
import {
  formatControlKey,
} from "./src/ui/formatters.js";
import {
  createLoadingOverlayModel,
  drawLoadingOverlay,
} from "./src/ui/loadingOverlay.js";
import { createLoadingScreenRenderer } from "./src/ui/loadingScreenRenderer.js";
import {
  cleanupDomOverlay,
  initDomOverlayRoot,
  prefersReducedMotion,
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
import {
  createSettingsScreenRenderer,
  getControlDisplayValue,
} from "./src/ui/settingsScreen.js";
import {
  drawMetaUpgradeScreen,
  getMetaAscensionEntryRect,
  getMetaUpgradeBackButtonRect,
  getMetaUpgradeRowRects,
} from "./src/ui/metaUpgradeScreen.js";
import { createCanvasFont, createTextLayout } from "./src/ui/textLayout.js";
import {
  getCurrentBuildButtonRect,
  getCurrentBuildCloseRect,
  getUpgradeDetailToggleRect,
  getUpgradeCardRect,
  getNextUpgradeSelectionIndex,
} from "./src/ui/upgradeCards.js";
import { createUpgradeScreenRenderer } from "./src/ui/upgradeScreen.js";
import { createMenuScreenRenderer } from "./src/ui/menuScreen.js";
import {
  MAIN_MENU_HERO_DIALOGUE_KEYS,
  drawMainMenuHeroDialogue,
} from "./src/ui/mainMenuDialogueRenderer.js";
import {
  createMainMenuLayout,
  getMainMenuButtonRects as getMainMenuButtonRectsForLayout,
} from "./src/ui/mainMenuLayout.js";
import { createGameModeOverlayRenderer } from "./src/ui/gameModeOverlays.js";
import { createMoveGuideOverlayRenderer } from "./src/ui/moveGuideOverlay.js";
import { createPauseOverlayRenderer } from "./src/ui/pauseOverlay.js";
import { createResultOverlayRenderer } from "./src/ui/resultOverlayRenderer.js";
import { createResultOverlayModel } from "./src/ui/resultOverlayModel.js";
import { createOverlayRenderController } from "./src/ui/overlayRenderController.js";
import { createScreenPrimitives } from "./src/ui/screenPrimitives.js";
import { createScreenNoteController } from "./src/ui/screenNoteController.js";
import { createMenuButtonRenderer } from "./src/ui/menuButtonRenderer.js";
import { createUiTextHelpers } from "./src/ui/uiTextHelpers.js";
import { createCombatReadoutModel } from "./src/ui/combatReadoutModel.js";
import { createBondCalloutController } from "./src/ui/bondCalloutController.js";
import {
  DEBUG_HUD_BUILD,
  createDebugHudState,
  getDebugArtTuning,
  isDebugHudEnabled,
  updateDebugArtTuningDom,
  updateDebugDomHud,
} from "./src/debug/debugHud.js";
import { createDebugProgressTools } from "./src/debug/debugProgressTools.js";
import { createDebugUiController } from "./src/debug/debugUiController.js";
import {
  readActivePieceDebugInfo,
  readHiddenRowsDebugInfo,
} from "./src/debug/debugStateReaders.js";
import { createRuntimeSmokeReaderFactory } from "./src/debug/runtimeSmoke.js";
import { createGameState } from "./src/core/gameStateFactory.js";
import { normalizeControlKeys } from "./src/input/controlBindings.js";
import {
  CONTROL_ACTIONS,
  DEFAULT_CONTROLS,
  SETTINGS_TABS,
  TUNING_SLIDERS,
} from "./src/input/controlSettingsConfig.js";
import { createControlStateAdapter } from "./src/input/controlStateAdapter.js";
import { installInputController } from "./src/input/inputController.js";
import { createMetaScreenPointerRouter } from "./src/input/metaScreenPointerRouter.js";

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
const SIDE_PIECE_LAYOUT = createSidePieceLayout({
  boardX: BOARD_X,
  boardY: BOARD_Y,
  cols: COLS,
  tile: TILE,
});
const HOLD_PANEL_X = SIDE_PIECE_LAYOUT.hold.x;
const HOLD_PANEL_Y = SIDE_PIECE_LAYOUT.hold.y;
const NEXT_PANEL_X = SIDE_PIECE_LAYOUT.next.x;
const NEXT_PANEL_Y = SIDE_PIECE_LAYOUT.next.y;
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
const debugUiController = createDebugUiController({
  allowed: DEBUG_HUD_ENABLED,
  initialVisible: DEBUG_HUD_ENABLED,
});

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

const UI_LAYOUT = createHudLayout({
  boardX: BOARD_X,
  boardY: BOARD_Y,
  cols: COLS,
  rows: ROWS,
  tile: TILE,
});
const MAIN_MENU_LAYOUT = createMainMenuLayout({
  width: W,
  height: H,
});

const {
  feedbackPositions: GSAP_FEEDBACK_POSITIONS,
  characterBaselines: BATTLE_CHARACTER_BASELINES,
} = createBattlePresentationConfig({
  boardX: BOARD_X,
  boardY: BOARD_Y,
  cols: COLS,
  rows: ROWS,
  tile: TILE,
  uiLayout: UI_LAYOUT,
});

const MENU_HERO_DIALOGUE_KEYS = {
  hover: MAIN_MENU_HERO_DIALOGUE_KEYS,
  click: MAIN_MENU_HERO_DIALOGUE_KEYS,
};

const MENU_HERO_DIALOGUE_MS = {
  hover: 2600,
  click: 3400,
};

const MENU_HERO_IDLE_TRIGGER_COOLDOWN_MS = 5000;

const CHARACTER_BASELINES = {
  ...BATTLE_CHARACTER_BASELINES,
  menu: {
    localY: 116,
    shadowW: 118,
  },
};

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
  riftWayfinder: {
    id: "menu-idle-rift-wayfinder",
    image: menuIdleRiftWayfinderSheet,
    columns: 4,
    rows: 4,
    frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    frameMs: 110,
    draw: { x: -166, y: -382, w: 332, h: 498 },
    noKeying: true,
  },
  starMapListener: {
    id: "menu-idle-star-map-listener",
    image: menuIdleStarMapListenerSheet,
    columns: 4,
    rows: 4,
    frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    frameMs: 125,
    draw: { x: -166, y: -382, w: 332, h: 498 },
    noKeying: true,
  },
};

let mainMenuHitMotion = { groupOffsetX: 0, buttonOffsets: {} };
const getMainMenuButtonRects = () => getMainMenuButtonRectsForLayout(
  MAIN_MENU_LAYOUT,
  mainMenuHitMotion,
);
const getSettingsContentOrigin = () => getSettingsContentOriginForLayout(UI_LAYOUT.settings);
const getSettingsBackButtonRect = () => getSettingsBackButtonRectForLayout(UI_LAYOUT.settings);
const getSettingsFeedbackCardRect = () => getSettingsFeedbackCardRectForLayout(getSettingsContentOrigin());
const getControlsResetButtonRect = () => getControlsResetButtonRectForLayout(
  getSettingsContentOrigin(),
  UI_LAYOUT.controlsGrid,
  CONTROL_ACTIONS.length,
);
const getHandlingResetButtonRect = () => getHandlingResetButtonRectForLayout(getSettingsContentOrigin());

const {
  allControlKeys,
  bindControl,
  getControlKeys,
  normalizeControlsMap,
  serializeControls,
} = createControlStateAdapter({
  getState: () => state,
  controlActions: CONTROL_ACTIONS,
  defaultControls: DEFAULT_CONTROLS,
});

const controlDisplayValue = (action) => getControlDisplayValue(action, {
  getControlKeys,
  formatControlKey,
});

const TEXT = translations;

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

const {
  makeRunStats,
  makeStats,
} = createRunStatsFactory({
  damageSourceKeys: DAMAGE_SOURCE_KEYS,
});

const state = createGameState({
  makeBoard,
  makeStats,
  loadSave,
  loadMetaProgress,
  makeRunStats,
  createDebugHudState,
  createEquipmentCombatState,
  normalizeControlsMap,
  defaultControls: DEFAULT_CONTROLS,
  defaultTuning: DEFAULT_TUNING,
  playerMaxHp: PLAYER_MAX_HP,
  guardMax: BALANCE.guardMax,
  firstEnemy: ENEMIES[0],
  ultimateDurationMs: ULTIMATE_DURATION_MS,
});

const {
  enemyName,
  enemyTrait,
  enemyWeaknessLabel,
  enemyWeaknessToken,
  fmt,
  getMessage,
  rarityLabel,
  setMessage,
  t,
  upgradeName,
  upgradeShortText,
  upgradeText,
} = createUiTextHelpers({
  state,
  translations,
});

const {
  getAcquiredRelicGroups,
  getCurrentBuildDirectionText,
  getCurrentBuildFamilyStats,
  getTraitBonus,
  getTraitChangeHintsForUpgrade,
  getTraitCount,
  getTraitEffectText,
  getTraitEntries,
  getTraitFullCount,
  getTraitNextThreshold,
  getTraitProgress,
  getTraitStage,
} = createBuildStatsController({
  state,
  translate: t,
  format: fmt,
});

const getCountdownCue = createBattleCountdownCueReader({
  state,
  durationMs: BATTLE_COUNTDOWN_MS,
  startWindowMs: BATTLE_COUNTDOWN_START_WINDOW_MS,
});

const updateAssetLoading = createAssetLoadingController({
  state,
  getSummary: () => getAssetLoadingSummary(window.TST_ASSETS),
  minMs: ASSET_LOADING_MIN_MS,
  maxMs: ASSET_LOADING_MAX_MS,
  isComplete: isAssetLoadingComplete,
  onCompleted: () => playSfx("loadingComplete"),
});

const setGameMode = createGameModeSetter({
  state,
  setDomOverlayMode,
  setFeedbackMode,
});

const storyModeController = createStoryModeController({
  state,
  getScene: getStoryScene,
  setGameMode,
  startGameplay: (runMode) => resetGame(runMode),
  playSfx,
  now: () => performance.now(),
});

function startStoryScene(sceneId = STORY_SCENE_IDS.prologue, runMode = "endless") {
  unlockAudio();
  cleanupDomOverlay();
  return storyModeController.startStory(sceneId, runMode);
}

function nextStoryPanel() {
  return storyModeController.nextStoryPanel();
}

function skipStoryScene() {
  return storyModeController.skipStory();
}

const debugProgressTools = createDebugProgressTools({
  state,
  loadMetaProgress,
  saveMetaProgress,
  grantRiftEnergy,
  persistGameSave: saveGame,
});

function updateDebugTools(now) {
  const enabled = DEBUG_HUD_ENABLED && debugUiController.isVisible();
  updateDebugDomHud({
    enabled,
    debugState: state.debug,
    readers: getDebugHudReaders(now),
    now,
  });
  updateDebugArtTuningDom({
    enabled,
    tuning: getDebugArtTuning({ enabled }),
    progressTool: {
      toggleHint: t("debugToggleHint"),
      energyButtonLabel: t("debugAddRiftEnergy10000"),
      energyValueLabel: fmt("debugRiftEnergyValue", {
        amount: state.metaProgress?.riftEnergy || 0,
      }),
      formatEnergyValue: (amount) => fmt("debugRiftEnergyValue", { amount }),
      addRiftEnergy: debugProgressTools.addRiftEnergy,
      resetButtonLabel: t("debugResetAll"),
      resetConfirmLabel: t("debugResetAllConfirm"),
      resetDoneLabel: t("debugResetAllDone"),
      getResetStatus: debugProgressTools.getResetStatus,
      resetAllProgress: debugProgressTools.resetAllProgress,
    },
  });
}

const {
  drawEquipmentRoulette,
  equipEquipmentItem,
  openEquipmentScreen,
  openEquipmentRoulette,
  returnToEquipmentInventory,
  upgradeEquipmentRoulette,
} = createEquipmentController({
  state,
  loadMetaProgress,
  saveMetaProgress,
  spendRiftEnergy,
  setGameMode,
  translate: t,
  format: fmt,
  prefersReducedMotion,
  createSpinMotion: createEquipmentSpinMotion,
  createUpgradeMotion: createEquipmentUpgradeMotion,
  getMotionState: getEquipmentMotionState,
  showToast,
  playSfx,
});

const {
  buildCombatPopup,
  buildOperationReadout,
  getOperationTitle,
} = createCombatReadoutModel({
  translate: t,
  format: fmt,
  buildDamageEquation,
  boardX: BOARD_X,
  boardY: BOARD_Y,
});

const {
  addCombatPopup,
  pushOperationReadout,
  showBattleClearFeedback,
  showEnemyDamageFeedback,
  showPlayerDamageFeedback,
} = createBattleFeedbackController({
  state,
  translate: t,
  format: fmt,
  positions: GSAP_FEEDBACK_POSITIONS,
  buildOperationReadout,
  buildCombatPopup,
  showComboFeedback,
  showB2BFeedback,
  showTSpinFeedback,
  showPerfectClearFeedback,
  showDamageNumber,
});

const {
  showSpecialBondEffectCallout,
  showSpecialBondUpgradeCallout,
} = createBondCalloutController({
  translate: t,
  format: fmt,
  showBondCallout,
});

const {
  syncControlHints,
  updateScreenNoteMode,
} = createScreenNoteController({
  state,
  uiLayout: UI_LAYOUT,
  translate: t,
  isBattleCountdownActive,
  documentTarget: document,
});

const {
  drawCard,
  drawCornerGlyph,
} = createScreenPrimitives({
  ctx,
  roundedRect,
  overlayReadability: OVERLAY_READABILITY,
});

const drawMenuButton = createMenuButtonRenderer({
  ctx,
  state,
  canvasFont,
  fitLabel,
  roundedRect,
  mainMenuPrimaryFrame,
  mainMenuSecondaryFrame,
  isImageReady,
});

const {
  drawAscensionChallengeHud,
  drawAscensionResultOverlay,
  drawEquipmentOverlay,
  drawMetaUpgradeOverlay,
  drawSettingsOverlay,
  drawStartOverlay,
  drawUpgradeOverlay,
} = createOverlayRenderController(() => ({
  ctx,
  state,
  t,
  fmt,
  getMessage,
  canvasFont,
  label,
  fitLabel,
  wrapText,
  roundedRect,
  drawImageContain,
  drawMainMenuScene,
  drawStartMenuOverlay,
  drawDimOverlay,
  drawCard,
  drawCornerGlyph,
  drawMenuButton,
  drawMetaUpgradeScreen,
  equipmentScreenRenderer,
  renderAscensionResultOverlay,
  renderAscensionChallengeHud,
  settingsScreenRenderer,
  upgradeScreenRenderer,
  resultScrim: OVERLAY_READABILITY.scrim.result,
  metaUpgradeIcons,
  riftEnergyIcon,
  now: () => performance.now(),
}));

const {
  drawCharacterShadow,
  drawCountdownBadge,
  drawHpBar,
  drawStatChip,
} = createBattleUiPrimitives({
  ctx,
  t,
  clamp,
  hexToRgba,
  roundedRect,
  canvasFont,
});

const {
  drawImageContain,
  drawImageCoverRaw,
  drawImageCropContain,
  drawImageFallbackBox,
} = createImageRenderer({
  ctx,
  isImageReady,
  getImageAssetRecord,
  roundedRect,
  canvasFont,
});

const {
  drawStoryComicOverlay,
} = createStoryComicRenderer({
  ctx,
  width: W,
  height: H,
  state,
  getScene: getStoryScene,
  t,
  canvasFont,
  fitLabel,
  wrapText,
  roundedRect,
  drawMenuButton,
  isImageReady,
});

const {
  drawKeyedImageCropContain,
  drawSpriteAnimationFrame,
  drawSpriteSheetFrame,
} = createKeyedSpriteRenderer({
  ctx,
  documentTarget: document,
  drawImageCropContain,
});

const {
  drawAttackEffects,
} = createAttackEffectRenderer({
  ctx,
  state,
  isImageReady,
  roundedRect,
  drawSpriteAnimationFrame,
  resolvePlayerAttackVfx,
  resolveEnemyAttackVfx,
  enemyAttackAnimations: ENEMY_ATTACK_ANIMATIONS,
});

const {
  drawBossPhaseWarning,
  drawPerfectClearFx,
} = createCombatCinematicRenderer({
  ctx,
  state,
  width: W,
  height: H,
  boardX: BOARD_X,
  boardY: BOARD_Y,
  cols: COLS,
  rows: ROWS,
  tileSize: TILE,
  heroUltimateAnimation: HERO_ANIMATIONS.ultimate,
  roundedRect,
  label,
  t,
  fmt,
  canvasFont,
  isImageReady,
  drawSpriteAnimationFrame,
});

const {
  drawFallbackHeroAttackAnimation,
  drawHeroIdleEnergy,
  drawNoaAttackPose,
} = createHeroCombatFallbackRenderer({
  ctx,
  roundedRect,
  drawHeroIdleBase,
});

const {
  tickEffects,
} = createEffectStateUpdater({
  state,
  processPendingHits,
});

const {
  drawPresentationSigil,
  drawStageGlow,
  scaleAroundBaseline,
} = createCharacterStageHelpers({
  ctx,
  hexToRgba,
});

const {
  drawEnemyOverlay,
  drawEnemySilhouette,
  drawNoaFallback,
  drawSlimeFallback,
} = createFallbackCharacterRenderer({
  ctx,
  hexToRgba,
  roundedRect,
});

const {
  drawBlock,
  drawBoard,
} = createBattleBoardRenderer({
  ctx,
  state,
  boardX: BOARD_X,
  boardY: BOARD_Y,
  cols: COLS,
  rows: ROWS,
  hiddenRows: HIDDEN,
  tileSize: TILE,
  colors: COLORS,
  ultimateWall: ULTIMATE_WALL,
  ultimateDurationMs: ULTIMATE_DURATION_MS,
  uiLayout: UI_LAYOUT,
  roundedRect,
  canvasFont,
  label,
  t,
  collides,
  getUltimateWellRange,
  getVisiblePieceCells,
  getUltimateTimerRatio,
  getUltimateCountdownSeconds,
  shouldShowUltimateCountdownWarning,
});

const {
  drawBattleCountdown,
  drawDimOverlay,
  drawFirstWaveCombatHint,
  drawTutorialPrompt,
} = createGameplayPromptRenderer({
  ctx,
  state,
  width: W,
  height: H,
  uiLayout: UI_LAYOUT,
  tutorialSteps: TUTORIAL_STEPS,
  battleCountdownMs: BATTLE_COUNTDOWN_MS,
  firstWaveHintMs: FIRST_WAVE_HINT_MS,
  firstWaveHintFadeMs: FIRST_WAVE_HINT_FADE_MS,
  overlayScrim: OVERLAY_READABILITY.scrim.standard,
  t,
  clamp,
  canvasFont,
  label,
  fitLabel,
  roundedRect,
  isBattleCountdownActive,
  getCountdownCue,
});

const {
  drawAssetLoadingScreen,
} = createLoadingScreenRenderer({
  ctx,
  state,
  debugHudEnabled: DEBUG_HUD_ENABLED,
  debugHudBuild: DEBUG_HUD_BUILD,
  getAssetLoadingSummary,
  createLoadingOverlayModel,
  drawLoadingOverlay,
  canvasFont,
  drawCornerGlyph,
  drawDimOverlay,
  roundedRect,
});

const {
  drawBursts,
  drawParticles,
} = createBattleParticleRenderer({
  ctx,
  state,
});

const {
  spawnClearBurst,
  spawnEnemyDeathParticles,
  spawnGarbageParticles,
  spawnLineParticles,
} = createBattleParticleSpawner({
  state,
  boardX: BOARD_X,
  boardY: BOARD_Y,
  cols: COLS,
  rows: ROWS,
  hiddenRows: HIDDEN,
  tileSize: TILE,
  uiLayout: UI_LAYOUT,
  enemyBaseline: CHARACTER_BASELINES.enemy,
  enemyDeathParticleCount: ENEMY_DEATH_TRANSITION.particleCount,
  getUltimateWellRange,
  isUltimateWellColumn,
});

const {
  getEnemyAnimationDuration,
  getEnemyHitDelay,
  getHeroAnimationDuration,
  getHeroHitDelay,
  startBossWindup,
  startEnemyAttackAnimation,
  startEnemyAttackPresentation,
  startEnemyDeathTransition,
  startHeroAttackAnimation,
  startHeroLevelUpEffect,
  startPlayerAttackPresentation,
  triggerHeavyAttackWarning,
  triggerBossPhaseSignal,
} = createCombatAnimationStateController({
  state,
  heroAnimations: HERO_ANIMATIONS,
  heroLevelUpEffect: HERO_LEVEL_UP_EFFECT,
  enemyAttackAnimations: ENEMY_ATTACK_ANIMATIONS,
  enemyAttackDurationMs: ENEMY_ATTACK_DURATION_MS,
  enemyHitDelayMs: ENEMY_HIT_DELAY_MS,
  bossWindupMs: BOSS_WINDUP_MS,
  bossPhaseBannerMs: BOSS_PHASE_BANNER_MS,
  enemyDeathDurationMs: ENEMY_DEATH_DURATION_MS,
  heavyAttackWarningDamage: HEAVY_ATTACK_WARNING_DAMAGE,
  boardX: BOARD_X,
  boardY: BOARD_Y,
  cols: COLS,
  tileSize: TILE,
  resolvePlayerAttackVfx,
  resolveEnemyAttackVfx,
  getAnimationDuration,
  getBossPhase,
  format: fmt,
  translate: t,
  playSfx,
  spawnEnemyDeathParticles,
});

const {
  drawFallbackModeOverlay,
} = createGameModeOverlayRenderer({
  ctx,
  state,
  overlayReadability: OVERLAY_READABILITY,
  t,
  getMessage,
  label,
  wrapText,
  drawDimOverlay,
  drawCard,
  drawMenuButton,
});

const {
  drawSidePieces,
} = createSidePieceRenderer({
  ctx,
  state,
  pieces: PIECES,
  colors: COLORS,
  layout: SIDE_PIECE_LAYOUT,
  t,
  label,
  roundedRect,
  drawBlock,
});

const {
  drawCombatPopups,
  drawFloaters,
} = createCombatFeedbackRenderer({
  ctx,
  state,
  clamp,
  hexToRgba,
  canvasFont,
  label,
});

const {
  drawMainMenuScene: drawMainMenuSceneBackground,
} = createMainMenuSceneRenderer({
  ctx,
  width: W,
  height: H,
  state,
  mainMenuBackground: mainMenuHomeKingdomBg,
  mainMenuRuneArcBack,
  fallbackBackground: mainMenuRiftKingdomBg,
  isImageReady,
  mainMenuLayout: MAIN_MENU_LAYOUT,
  prefersReducedMotion,
});

const {
  drawMainMenuScene,
  drawStartMenuOverlay,
} = createMenuScreenRenderer({
  ctx,
  state,
  mainMenuLayout: MAIN_MENU_LAYOUT,
  t,
  canvasFont,
  label,
  wrapText,
  drawMenuButton,
  drawMainMenuScene: drawMainMenuSceneBackground,
  drawMenuHeroShowcase,
  drawMenuHeroDialogueBubble,
  onMenuMotionUpdate: (motion) => {
    mainMenuHitMotion = motion;
  },
  prefersReducedMotion,
});

const equipmentScreenRenderer = createEquipmentScreenRenderer({
  ctx,
  state,
  t,
  fmt,
  canvasFont,
  label,
  fitLabel,
  wrapText,
  roundedRect,
  drawImageContain,
  drawMainMenuScene: drawMainMenuSceneBackground,
  drawDimOverlay,
  drawCard,
  drawMenuButton,
  equipmentIcons,
  equipmentRarityEmblems,
  equipmentRewardPanelArts,
  equipmentWheelLayers: equipmentRouletteLayers,
  equipmentWheelPointerArt: equipmentRoulettePointer,
  noaCheatHandArt,
  noaPreviewArt: heroIdleArt,
  noaIdleSheet: menuIdleRiftWayfinderSheet,
  noaIdleAnimations: Object.values(MENU_HERO_SPECIAL_ANIMATIONS).map((config) => ({
    id: config.id,
    image: config.image,
    frameCount: config.frames.length,
    frameMs: Math.round(config.frameMs * 1.45),
  })),
  riftEnergyIcon,
  isImageReady,
});

const {
  drawPauseOverlay,
} = createPauseOverlayRenderer({
  ctx,
  state,
  uiLayout: UI_LAYOUT,
  overlayReadability: OVERLAY_READABILITY,
  t,
  label,
  wrapText,
  roundedRect,
  drawDimOverlay,
  drawCard,
  drawMenuButton,
  drawSettingsOverlay,
  controlDisplayValue,
});

const {
  drawMoveGuideOverlay,
} = createMoveGuideOverlayRenderer({
  ctx,
  overlayReadability: OVERLAY_READABILITY,
  t,
  label,
  fitLabel,
  wrapText,
  roundedRect,
  hexToRgba,
  drawDimOverlay,
  drawCard,
  drawMenuButton,
});

const resultOverlayRenderer = createResultOverlayRenderer({
  ctx,
  state,
  overlayReadability: OVERLAY_READABILITY,
  riftEnergyIcon,
  t,
  fmt,
  label,
  fitLabel,
  wrapText,
  roundedRect,
  drawDimOverlay,
  drawCard,
  drawMenuButton,
  drawImageContain,
});

const settingsScreenRenderer = createSettingsScreenRenderer(() => ({
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
  getSettingsSliderTrackWidth: inputController.getSettingsSliderTrackWidth,
  getSettingsSliderTrackX: inputController.getSettingsSliderTrackX,
  label,
  layout: UI_LAYOUT,
  noaFeedbackBowArt,
  roundedRect,
  settingsTabs: SETTINGS_TABS,
  state,
  t,
  tuningSliders: TUNING_SLIDERS,
  wrapText,
}));

const getDebugHudReaders = createRuntimeSmokeReaderFactory({
  state,
  hiddenRows: HIDDEN,
  isPieceAboveTopBuffer,
  collides,
  isActivePieceOverlappingBoard,
  getHiddenRowsDebugInfo: () => readHiddenRowsDebugInfo(
    state.board,
    HIDDEN,
    rowHasPlayableCells,
  ),
  isSpawnBlockedForDefeat,
  getAssetLoadingSummary,
});

const battleHudRenderer = createBattleHudRenderer({
  ctx,
  state,
  uiLayout: UI_LAYOUT,
  upgradeGrowthPerTier: BALANCE.upgradeGrowthPerTier,
  riftEnergyIcon,
  t,
  fmt,
  canvasFont,
  label,
  fitLabel,
  roundedRect,
  drawAscensionChallengeHud,
  getTraitEntries,
  getTraitFullCount,
  drawCornerGlyph,
  getEffectiveMaxGuard,
  getCurrentRunRiftEnergyEarned,
  drawImageContain,
});

const battleSceneRenderer = createBattleSceneRenderer({
  ctx,
  state,
  uiLayout: UI_LAYOUT,
  t,
  canvasFont,
  fitLabel,
  roundedRect,
  drawCornerGlyph,
  drawTopQuestBar: battleHudRenderer.drawTopQuestBar,
  enemyName,
});

const enemyPanelRenderer = createEnemyPanelRenderer({
  ctx,
  state,
  t,
  fmt,
  canvasFont,
  label,
  fitLabel,
  roundedRect,
  getEnemyAttackGarbagePreview,
  getBossPhase,
  enemyWeaknessToken,
});

const {
  drawPlayer,
} = createPlayerStageRenderer({
  ctx,
  state,
  uiLayout: UI_LAYOUT,
  characterBaselines: CHARACTER_BASELINES,
  heroAnimations: HERO_ANIMATIONS,
  heroLevelUpEffect: HERO_LEVEL_UP_EFFECT,
  playerHitAnimation: PLAYER_HIT_ANIMATION,
  heroHitDurationMs: HERO_HIT_DURATION_MS,
  debugHudEnabled: DEBUG_HUD_ENABLED,
  getDebugArtTuning,
  getBaselineAnchorY,
  alignDrawBoxToBaseline,
  drawHpBar,
  drawGuardMeter: battleHudRenderer.drawGuardMeter,
  drawStageGlow,
  drawPresentationSigil,
  drawCharacterShadow,
  drawNoaAttackPose,
  drawHeroIdleBase,
  drawHeroIdleEnergy,
  drawFallbackHeroAttackAnimation,
  drawPlayerRelicProgress: battleHudRenderer.drawPlayerRelicProgress,
  drawSpriteAnimationFrame,
  isImageReady,
  t,
});

const {
  drawEnemy,
} = createEnemyStageRenderer({
  ctx,
  state,
  uiLayout: UI_LAYOUT,
  characterBaselines: CHARACTER_BASELINES,
  enemyBattlePortraits,
  slimeArt,
  enemyDeathAnimation: ENEMY_DEATH_ANIMATION,
  enemyAttackAnimations: ENEMY_ATTACK_ANIMATIONS,
  getEnemyDeathTransitionState,
  debugHudEnabled: DEBUG_HUD_ENABLED,
  getDebugArtTuning,
  getBaselineAnchorY,
  alignDrawBoxToBaseline,
  drawHpBar,
  drawStageGlow,
  drawPresentationSigil,
  drawCharacterShadow,
  scaleAroundBaseline,
  drawEnemyOverlay,
  drawEnemySilhouette,
  drawSlimeFallback,
  drawImageContain,
  drawSpriteAnimationFrame,
  isImageReady,
  enemyPanelRenderer,
  t,
});

const upgradeScreenRenderer = createUpgradeScreenRenderer({
  ctx,
  state,
  t,
  fmt,
  canvasFont,
  label,
  fitLabel,
  wrapText,
  roundedRect,
  drawDimOverlay,
  drawCard,
  drawMenuButton,
  drawLimitedWrapText,
  prefersReducedMotion,
  upgradeName,
  upgradeText,
  upgradeShortText,
  rarityLabel,
  getSpecialBondCountsForRun,
  getTraitChangeHintsForUpgrade,
  getAcquiredRelicGroups,
  getCurrentBuildFamilyStats,
  getTraitEntries,
  getTraitEffectText,
  getCurrentBuildDirectionText,
  getTraitFullCount,
});

const drawModeOverlay = createModeOverlayRouter({
  drawAscensionResultOverlay,
  drawEquipmentOverlay,
  drawMetaUpgradeOverlay,
  drawUpgradeOverlay,
  drawMoveGuideOverlay,
  drawPauseOverlay,
  drawAssetLoadingScreen,
  drawStartOverlay,
  drawStoryOverlay: drawStoryComicOverlay,
  drawFallbackModeOverlay,
});

const {
  draw,
} = createGameplayFrameController({
  ctx,
  width: W,
  height: H,
  state,
  drawBattleBackground,
  drawGameplayFrame,
  normalEnemyCyclesBeforeBoss: NORMAL_ENEMY_CYCLES_BEFORE_BOSS,
  getNormalEnemyCount: () => getStandardEnemyPool().length,
  drawImageCover: drawImageCoverRaw,
  roundedRect,
  battleSceneRenderer,
  battleHudRenderer,
  drawPlayer,
  drawEnemy,
  drawBoard,
  drawSidePieces,
  drawAttackEffects,
  drawBursts,
  drawParticles,
  drawFloaters,
  drawCombatPopups,
  drawBossPhaseWarning,
  drawBattleCountdown,
  drawFirstWaveCombatHint,
  drawTutorialPrompt,
  drawPerfectClearFx,
  drawOverlay,
});

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
    active: readActivePieceDebugInfo(state.active),
    lockTimer: state.lockTimer,
    countdownMs: state.countdownMs,
    hitStopMs: state.hitStopMs,
    pendingHits: state.pendingHits.length,
    hiddenRows: readHiddenRowsDebugInfo(state.board, HIDDEN, rowHasPlayableCells),
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

function warnDefeatSource(source, messageKey) {
  console.warn("[T-Spin Traveler] Game Over", {
    source,
    messageKey,
    mode: state.mode,
    playerHp: state.playerHp,
    active: readActivePieceDebugInfo(state.active),
    hiddenRows: readHiddenRowsDebugInfo(state.board, HIDDEN, rowHasPlayableCells),
  });
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
  state.story = null;
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
  state.equipmentCombat = createEquipmentCombatState({ wave: 1 });
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
  const loadoutStats = getEquipmentLoadoutStats(state.metaProgress, {
    baseMaxHp: PLAYER_MAX_HP,
  });
  state.playerMaxHp = loadoutStats.finalStats.maxHp;
  state.playerHp = state.playerMaxHp;
  state.guard = 0;
  grantGuard(
    loadoutStats.finalStats.guard
      + getEquipmentBattleStartGuard(state.metaProgress.equipment),
  );
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

function damageEnemyFromUpgrade(amount, floaterKey, color, x = 920, y = 430) {
  const damage = Math.max(0, Math.floor(amount));
  if (damage <= 0 || state.enemyHp <= 0) return 0;
  const beforeEnemyHp = state.enemyHp;
  state.enemyHpDisplay = Math.max(state.enemyHpDisplay || beforeEnemyHp, beforeEnemyHp);
  state.enemyHpTrail = Math.max(state.enemyHpTrail || beforeEnemyHp, beforeEnemyHp);
  state.enemyHp = Math.max(0, state.enemyHp - damage);
  state.stats.damage += damage;
  showEnemyDamageFeedback(damage);
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
  const gained = grantGuard(guard);
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

function grantGuard(amount) {
  const result = resolveEquipmentGuardGain({
    progress: state.metaProgress?.equipment,
    combatState: state.equipmentCombat,
    wave: state.wave,
    currentHp: state.playerHp,
    maxHp: state.playerMaxHp,
    currentGuard: state.guard,
    maxGuard: getEffectiveMaxGuard(),
    baseGain: amount,
  });
  state.equipmentCombat = result.combatState;
  state.guard += result.gain;
  return result.gain;
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
  showPlayerDamageFeedback(hit);
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
  const fatalSave = resolveEquipmentFatalHit({
    progress: state.metaProgress?.equipment,
    combatState: state.equipmentCombat,
    wave: state.wave,
    currentHp: state.playerHp,
    damage: finalDamage,
  });
  state.equipmentCombat = fatalSave.combatState;
  finalDamage = fatalSave.damage;
  const equipmentGuardImpact = resolveEquipmentGuardImpact({
    progress: state.metaProgress?.equipment,
    combatState: state.equipmentCombat,
    wave: state.wave,
    currentGuard: state.guard,
    maxGuard: getEffectiveMaxGuard(),
    blocked,
    incomingDamage: damageTaken,
  });
  state.equipmentCombat = equipmentGuardImpact.combatState;
  state.guard = equipmentGuardImpact.guardAfter;
  state.playerHp = Math.max(0, state.playerHp - finalDamage);
  if (equipmentGuardImpact.retainedGuard > 0 || equipmentGuardImpact.restoredGuard > 0) {
    const retained = equipmentGuardImpact.retainedGuard > 0;
    state.floaters.push({
      x: 86,
      y: 258,
      text: fmt(
        retained ? "equipmentGuardRetained" : "equipmentGuardRestored",
        { guard: retained ? equipmentGuardImpact.retainedGuard : equipmentGuardImpact.restoredGuard },
      ),
      color: "#9df7da",
      life: 1100,
    });
    playSfx("shield");
  }
  if (fatalSave.saved) {
    grantGuard(fatalSave.guardGain);
    state.floaters.push({
      x: 86,
      y: 238,
      text: t("equipmentFatalSaveTriggered"),
      color: "#fff0a6",
      life: 1200,
    });
    playSfx("upgradeReady");
  }
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
      showEnemyDamageFeedback(reflectDamage, { intensity: 1.05 });
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
  const equipmentAttack = resolveEquipmentAttack({
    progress: state.metaProgress?.equipment,
    combatState: state.equipmentCombat,
    context: {
      lines,
      spinType,
      combo: state.combo,
      b2bActive: b2bAttackRows > 0,
      perfect: state.lastPerfectClear,
      ultimateActive: state.ultimateActive,
      wave: state.wave,
    },
  });
  state.equipmentCombat = equipmentAttack.combatState;
  damage += equipmentAttack.damageBonus;
  addDamagePart(parts, sources, "damageEquipment", equipmentAttack.damageBonus, "upgrade");
  if (equipmentAttack.enemyDelay > 0) {
    state.enemyCountdown += equipmentAttack.enemyDelay;
    state.floaters.push({
      x: BOARD_X + COLS * TILE + 36,
      y: BOARD_Y + 242,
      text: fmt("equipmentEnemyDelayed", { turns: equipmentAttack.enemyDelay }),
      color: "#9edff8",
      life: 1100,
    });
  }

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
      grantGuard(guardGain);
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
  gainGuardFromClear(lines, spinType, equipmentAttack.guardBonus);

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

function playDamageFeedback(result) {
  startPlayerAttackPresentation(result);
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

function getComboMilestoneDamage(combo) {
  return getComboMilestoneDamageBase(combo, BALANCE.comboMilestoneEvery, BALANCE.comboMilestoneDamage);
}

function gainGuardFromClear(lines, spinType, equipmentGuardBonus = 0) {
  if (lines <= 0) return;
  const traits = getTraitSnapshot();
  const comboGuard = state.combo >= 3 ? state.upgrades.comboGuardGain : 0;
  const traitDefenseGuard = getTraitBonus("Defense", [1, 2, 3]) + getDefenseTraitBonus(traits).clearGuard;
  const traitSpinGuard = spinType ? getTraitBonus("Spin", [1, 2, 4]) + getSpinTraitBonus(traits).guard : 0;
  const gain = lines * BALANCE.guardPerLine
    + (spinType ? BALANCE.guardSpinBonus : 0)
    + state.upgrades.guardGain
    + comboGuard
    + traitDefenseGuard
    + traitSpinGuard
    + equipmentGuardBonus;
  const gained = grantGuard(gain);
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
  startEnemyAttackPresentation(enemy, bossPhase, enemyVfx);
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

function checkBossPhaseTransition(beforeHp, afterHp) {
  if (state.enemyType.id !== "king" || afterHp <= 0) return;
  const beforePhase = getBossPhaseByHp(beforeHp, state.enemyMaxHp);
  const afterPhase = getBossPhaseByHp(afterHp, state.enemyMaxHp);
  if (afterPhase > beforePhase && afterPhase > state.lastBossPhase) triggerBossPhaseSignal(afterPhase);
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
  state.equipmentCombat = startEquipmentCombatWave(state.equipmentCombat, state.wave);
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
    basePlayerMaxHp: getRunBasePlayerMaxHp(),
    getEffectiveMaxGuard,
    grantGuard,
  });
}

function getRunBasePlayerMaxHp() {
  return getEquipmentLoadoutStats(state.metaProgress, {
    baseMaxHp: PLAYER_MAX_HP,
  }).finalStats.maxHp;
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
    updateDebugTools(time);
    draw();
  } catch (error) {
    state.debug.drawError = String(error?.message || error);
    console.error("T-Spin Traveler update failed:", error);
  }
  requestAnimationFrame(update);
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
  if (state.mode === "start" || state.mode === "story" || state.mode === "guide" || state.mode === "equipment" || state.mode === "metaUpgrade" || state.mode === "victory" || state.mode === "defeat") return "menu";
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

function previewSfx() {
  if (!audio.ctx || audio.muted) return;
  const t = audio.ctx.currentTime;
  tone(660, 0.05, "triangle", 0.24, audio.sfxGain, t);
}

function drawHeroIdleBase(context = "battle") {
  if (context === "menu") {
    const now = performance.now();
    if (getMenuHeroIdlePlayback(now).active && drawMenuHeroIdleSprite(now)) return;
    if (isImageReady(heroIdleArt)) {
      drawImageContain(heroIdleArt, -170, -328, 340, 510);
      return;
    }
  }
  if (context !== "menu" && isImageReady(noaBattleIdleArt)) {
    drawImageContain(noaBattleIdleArt, -150, -280, 300, 450);
    return;
  } else if (isImageReady(heroIdleArt)) {
    drawImageContain(heroIdleArt, -150, -280, 300, 450);
  } else if (isImageReady(HERO_ANIMATIONS.slash.image)) {
    drawSpriteSheetFrame(HERO_ANIMATIONS.slash, 0, -132, -222, 264, 410);
  } else {
    drawNoaFallback(false);
  }
}

function isMenuHeroInteractive() {
  return state.mode === "start" && state.assetLoadingDone && !state.settingsOpen;
}

function getMenuHeroHitRect() {
  const hero = MAIN_MENU_LAYOUT.hero;
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
    const idleKinds = Object.keys(MENU_HERO_SPECIAL_ANIMATIONS);
    const idleKind = idleKinds[interaction.idleTriggerCount % idleKinds.length];
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
  return MENU_HERO_SPECIAL_ANIMATIONS[kind] || MENU_HERO_SPECIAL_ANIMATIONS.cube;
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
  drawMainMenuHeroDialogue({
    ctx,
    frameImage: mainMenuDialogueFrame,
    interaction,
    now,
    language: state.language,
    text: interaction.lineKey ? t(interaction.lineKey) : "",
    hero: MAIN_MENU_LAYOUT.hero,
    menuX: MAIN_MENU_LAYOUT.menu.x,
    uiScale: MAIN_MENU_LAYOUT.scale,
    canvasFont,
    isImageReady,
    interactive: isMenuHeroInteractive(),
  });
}

function drawMenuHeroShowcase() {
  const now = performance.now();
  const pose = getMenuIdlePose(now);
  const motion = getMenuIdleMotion(pose, now);
  const interaction = getMenuHeroInteractionMotion(now);
  const specialIdle = getMenuHeroIdlePlayback(now).active ? null : getMenuSpecialIdle(now);
  const hero = MAIN_MENU_LAYOUT.hero;
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
  if (specialIdle) drawMenuSpecialIdleFrame(specialIdle);
  else drawHeroIdleBase("menu");
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
  const overlayPath = resolveModeOverlayPath({
    mode: state.mode,
    overlayPath: getOverlayRenderPath(state),
  });
  if (overlayPath === "none") return;
  if (overlayPath === "result") {
    if (state.mode === "defeat" && !state.defeatRenderTraceWarned) {
      state.defeatRenderTraceWarned = true;
      console.warn("[T-Spin Traveler] Defeat render trace", {
        mode: state.mode,
        runFinalized: state.runFinalized,
        overlayPath,
        hasResultOverlay: typeof drawResultOverlay === "function",
        active: readActivePieceDebugInfo(state.active),
        pendingHits: state.pendingHits.length,
        countdownMs: state.countdownMs,
        hitStopMs: state.hitStopMs,
      });
    }
    drawResultOverlay();
    return;
  }
  drawModeOverlay(overlayPath);
}

function drawResultOverlay() {
  state.debug.resultOverlayDrawn = true;
  resultOverlayRenderer.drawResultOverlay(createResultOverlayModel({
    state,
    message: getMessage(),
    buttons: getResultButtonRects(),
    translate: t,
  }));
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

function setLanguage(language) {
  state.language = language === "en" ? "en" : "zh";
  syncControlHints();
  saveGame();
}
const {
  handleAscensionResultPointerDown,
  handleMetaUpgradePointerDown,
} = createMetaScreenPointerRouter({
  state,
  metaUpgradeDefs: META_UPGRADE_DEFS,
  getMetaUpgradeBackButtonRect,
  getMetaAscensionEntryRect,
  getMetaUpgradeRowRects,
  getAscensionResultButtonRects,
  actions: {
    playSfx,
    purchaseMetaUpgrade,
    returnToMetaUpgradeFromAscension,
    setGameMode,
    startAscensionChallenge,
  },
});

const inputController = installInputController({
  canvas,
  state,
  audio,
  width: W,
  height: H,
  uiLayout: UI_LAYOUT,
  settingsTabs: SETTINGS_TABS,
  controlActions: CONTROL_ACTIONS,
  defaultControls: DEFAULT_CONTROLS,
  defaultTuning: DEFAULT_TUNING,
  tuningSliders: TUNING_SLIDERS,
  githubFeedbackUrl: GITHUB_FEEDBACK_URL,
  debugUiEnabled: DEBUG_HUD_ENABLED,
  getMainMenuButtonRects,
  getSettingsContentOrigin,
  getSettingsBackButtonRect,
  getSettingsFeedbackCardRect,
  getControlsResetButtonRect,
  getHandlingResetButtonRect,
  getStoryComicLayout: () => getStoryComicLayout(W, H),
  getCurrentBuildButtonRect,
  getCurrentBuildCloseRect,
  getUpgradeDetailToggleRect,
  getUpgradeCardRect,
  getResultButtonRects,
  actions: {
    applyAudioSettings,
    bindControl,
    chooseUpgrade,
    drawEquipmentRoulette,
    equipEquipmentItem,
    getAllControlKeys: allControlKeys,
    getControlKeys,
    handleAscensionResultPointerDown,
    handleMetaUpgradePointerDown,
    hardDrop,
    holdPiece,
    isBattleCountdownActive,
    isPointOverMenuHero,
    loadMetaProgress,
    move,
    moveUpgradeSelection,
    normalizeControlsMap,
    openEquipmentScreen,
    openEquipmentRoulette,
    playSfx,
    pressHorizontal,
    previewSfx,
    previewUpgradeChoice,
    releaseHorizontal,
    resetGame,
    resetInputRepeat,
    returnToEquipmentInventory,
    returnToMetaUpgradeFromAscension,
    rotate,
    rotate180,
    saveGame,
    setGameMode,
    setLanguage,
    skipStoryScene,
    startAscensionChallenge,
    startStoryScene,
    syncControlHints,
    toggleDebugUi: () => {
      if (!DEBUG_HUD_ENABLED) return;
      debugUiController.toggle();
      updateDebugTools(performance.now());
    },
    toggleMute,
    toggleUpgradeDetail,
    nextStoryPanel,
    triggerMenuHeroAction,
    unlockAudio,
    updateMenuHeroHoverFromPointer,
    upgradeEquipmentRoulette,
  },
});

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
updateDebugTools(performance.now());
requestAnimationFrame(update);
