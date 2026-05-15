const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const ASSET_VERSION = "2026-05-13-133e4ee";

function assetPath(path) {
  const isFilePreview = typeof location !== "undefined" && location.protocol === "file:";
  return isFilePreview ? path : `${path}?v=${ASSET_VERSION}`;
}

const forestBg = new Image();
forestBg.src = assetPath("assets/magic-forest-bg-v2.png");
const noaArt = new Image();
noaArt.src = assetPath("assets/noa.png");
const slimeArt = new Image();
slimeArt.src = assetPath("assets/forest-slime.png");
const rosterArt = new Image();
rosterArt.src = assetPath("assets/character-roster-v4-alpha.png");
const heroIdleArt = new Image();
heroIdleArt.src = assetPath("assets/images/clean/ET_Character_alpha.png");
const heroMeleeSheet = new Image();
heroMeleeSheet.src = assetPath("assets/images/clean/Knife_alpha.png");
const heroRangedSheet = new Image();
heroRangedSheet.src = assetPath("assets/images/clean/Gun_alpha.png");
const heroCombo1Sheet = new Image();
heroCombo1Sheet.src = assetPath("assets/images/clean/hero_combo_01_spritesheet_alpha.png");
const heroCombo2Sheet = new Image();
heroCombo2Sheet.src = assetPath("assets/images/clean/hero_combo_02_spritesheet_alpha.png");
const heroCombo3Sheet = new Image();
heroCombo3Sheet.src = assetPath("assets/images/clean/hero_combo_03_spritesheet_alpha.png");
const heroUltimateSheet = new Image();
heroUltimateSheet.src = assetPath("assets/images/clean/hero_perfect_clear_ultimate_alpha.png");
const enemyConceptSheetA = new Image();
enemyConceptSheetA.src = assetPath("assets/images/clean/Enemy01_alpha.png");
const enemyConceptSheetB = new Image();
enemyConceptSheetB.src = assetPath("assets/images/clean/Enemy02_alpha.png");
const enemyAttackSheets = {
  slime: new Image(),
  vine: new Image(),
  mushroom: new Image(),
  beetle: new Image(),
  mist: new Image(),
  king: new Image(),
};
enemyAttackSheets.slime.src = assetPath("assets/images/clean/enemy_attack_slime_redesign.png");
enemyAttackSheets.vine.src = assetPath("assets/images/clean/enemy_attack_vine_redesign.png");
enemyAttackSheets.mushroom.src = assetPath("assets/images/clean/enemy_attack_mushroom_redesign.png");
enemyAttackSheets.beetle.src = assetPath("assets/images/clean/enemy_attack_beetle_redesign.png");
enemyAttackSheets.mist.src = assetPath("assets/images/clean/enemy_attack_mist_redesign.png");
enemyAttackSheets.king.src = assetPath("assets/images/clean/enemy_attack_king_redesign.png");

const HERO_FRAME_RECTS = [
  { x: 0, y: 58, w: 362, h: 386 },
  { x: 362, y: 58, w: 362, h: 386 },
  { x: 724, y: 58, w: 362, h: 386 },
  { x: 1086, y: 58, w: 362, h: 386 },
  { x: 0, y: 592, w: 362, h: 390 },
  { x: 362, y: 592, w: 362, h: 390 },
  { x: 724, y: 592, w: 362, h: 390 },
];

const HERO_ANIMATIONS = {
  // Replace frame rects here if a future spritesheet uses uneven cells.
  melee: {
    id: "melee",
    image: heroMeleeSheet,
    columns: 4,
    rows: 2,
    frameRects: HERO_FRAME_RECTS,
    frames: [0, 1, 2, 3, 4, 5, 6],
    frameMs: 120,
    hitFrame: 3,
    label: "Tetr Blade",
  },
  ranged: {
    id: "ranged",
    image: heroRangedSheet,
    columns: 4,
    rows: 2,
    frameRects: HERO_FRAME_RECTS,
    frames: [0, 1, 2, 3, 4, 5, 6],
    frameMs: 105,
    hitFrame: 4,
    label: "Tetr Pistol",
  },
  combo1: {
    id: "combo1",
    image: heroCombo1Sheet,
    columns: 4,
    rows: 2,
    frames: [0, 1, 2, 3, 4, 5, 6, 7],
    frameMs: 105,
    hitFrame: 3,
    label: "Combo Blade I",
  },
  combo2: {
    id: "combo2",
    image: heroCombo2Sheet,
    columns: 4,
    rows: 2,
    frames: [0, 1, 2, 3, 4, 5, 6, 7],
    frameMs: 100,
    hitFrame: 3,
    label: "Combo Blade II",
  },
  combo3: {
    id: "combo3",
    image: heroCombo3Sheet,
    columns: 4,
    rows: 2,
    frames: [0, 1, 2, 3, 4, 5, 6, 7],
    frameMs: 95,
    hitFrame: 4,
    label: "Combo Blade III",
  },
  ultimate: {
    id: "ultimate",
    image: heroUltimateSheet,
    columns: 8,
    rows: 2,
    frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    frameMs: 85,
    hitRatio: 0.55,
    label: "Perfect Clear Rift",
    draw: { x: -168, y: -250, w: 336, h: 500 },
    noKeying: true,
  },
};

const spriteFrameCache = new Map();

const audio = {
  ctx: null,
  master: null,
  musicGain: null,
  sfxGain: null,
  currentSfxBus: null,
  musicTimer: null,
  step: 0,
  energy: 0,
  targetEnergy: 0,
  muted: false,
  masterVolume: 1,
  musicVolume: 0.92,
  sfxVolume: 0.78,
  outputBoost: 4.4,
};

const MUSIC_BPM = 105;
const MUSIC_STEP_MS = 60000 / (MUSIC_BPM * 4);
const MUSIC_ROOT = 146.83; // D minor, stable fantasy battle color.

const W = canvas.width;
const H = canvas.height;
const COLS = 10;
const ROWS = 20;
const HIDDEN = 2;
const TILE = 29;
const BOARD_X = 476;
const BOARD_Y = 72;
const HOLD_PANEL_X = BOARD_X - 108;
const HOLD_PANEL_Y = BOARD_Y + 42;
const NEXT_PANEL_X = BOARD_X + COLS * TILE + 22;
const NEXT_PANEL_Y = BOARD_Y + 42;
const DROP_MS = 760;
const SOFT_DROP_MS = 4;
const LOCK_DELAY_MS = 500;
const DAS_MS = 128;
const ARR_MS = 28;
const PLAYER_MAX_HP = 100;
const ENEMY_DEFEAT_HEAL = 15;
const PERFECT_CLEAR_BASE_DAMAGE = 90;
const SPIN_DAMAGE_BY_LINES = [0, 30, 70, 100, 140];
const ATTACK_ROW_DAMAGE = 15;
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

const BALANCE = {
  enemyWaveHp: 10,
  miniBossMultiplier: 1.18,
  bossMultiplier: 1.3,
  enemyDamageEveryWaves: 3,
  enemyDamageStep: 2,
  miniBossDamageBonus: 2,
  waveHeal: ENEMY_DEFEAT_HEAL,
  firstUpgradeAt: 8,
  upgradeGrowthPerTier: 4,
  comboMilestoneEvery: 5,
  comboMilestoneDamage: 50,
  gravityStepWaves: 5,
  gravityStepMs: 45,
  minGravityMs: 145,
  garbageDelayStepWaves: 10,
  guardMax: 18,
  guardPerLine: 2,
  guardSpinBonus: 3,
  perfectClear4WideExtendMs: 3000,
  ...(window.TST_BALANCE || {}),
};

const SFX_MIX = {
  move: 0.42,
  rotate: 0.52,
  rotateT: 0.72,
  drop: 0.72,
  hold: 0.55,
  clear: 0.82,
  bigClear: 1,
  combo: 1.08,
  b2b: 1.08,
  tspin: 1.12,
  perfect: 1.18,
  hitLight: 0.76,
  hitHeavy: 1.08,
  hitArcane: 1.22,
  weakness: 1.05,
  cancel: 0.86,
  enemy: 0.95,
  wave: 0.84,
  upgrade: 0.82,
  upgradeReady: 0.66,
  start: 0.78,
  defeat: 0.9,
  ...(window.TST_SFX_MIX || {}),
};

const TUTORIAL_STEPS = [
  { id: "line", promptKey: "tutorialPrompt.line", detailKey: "tutorialStep.line" },
  { id: "hold", promptKey: "tutorialPrompt.hold", detailKey: "tutorialStep.hold" },
  { id: "combo", promptKey: "tutorialPrompt.combo", detailKey: "tutorialStep.combo" },
  { id: "spin", promptKey: "tutorialPrompt.spin", detailKey: "tutorialStep.spin" },
  { id: "cancel", promptKey: "tutorialPrompt.cancel", detailKey: "tutorialStep.cancel" },
];

const DAMAGE_SOURCE_KEYS = ["base", "spin", "combo", "b2b", "perfect", "weakness", "upgrade"];

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

const RARITY = {
  common: { label: "Common", color: "#9df7da" },
  rare: { label: "Rare", color: "#9fb4ff" },
  relic: { label: "Relic", color: "#fff0a6" },
};

const BUILD_FAMILY = {
  spin: { labelKey: "family.spin", color: "#d7c2ff" },
  combo: { labelKey: "family.combo", color: "#7ef7ff" },
  defense: { labelKey: "family.defense", color: "#9df7da" },
  garbage: { labelKey: "family.garbage", color: "#9df7da" },
  burst: { labelKey: "family.burst", color: "#fff0a6" },
  perfect: { labelKey: "family.perfect", color: "#fff0a6" },
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
};

const DEFAULT_CONTROLS = {
  left: "arrowleft",
  right: "arrowright",
  softDrop: "arrowdown",
  hardDrop: " ",
  rotateCW: "arrowup",
  rotateCCW: "z",
  rotate180: "a",
  hold: "shift",
  pause: "p",
  mute: "m",
};

const UI_LAYOUT = {
  panelPadding: 24,
  playerPanel: { x: 38, y: 84, w: 312, h: 190 },
  enemyPanel: { x: 884, y: 84, w: 356, h: 254 },
  playerStage: { x: 18, y: 188, w: 380, h: 392 },
  enemyStage: { x: 858, y: 246, w: 410, h: 320 },
  boardFrame: { x: BOARD_X - 18, y: BOARD_Y - 18, w: COLS * TILE + 36, h: ROWS * TILE + 36 },
  menuHero: { x: 386, y: 464, scale: 1.04 },
  menu: {
    x: 804,
    y: 96,
    w: 390,
    h: 548,
    padding: 34,
    titleY: 104,
    subtitleY: 154,
    primaryY: 250,
    tutorialY: 344,
    utilityY: 426,
    primaryH: 72,
    buttonH: 56,
    buttonGap: 18,
  },
  countdown: { cardW: 236, cardH: 108, yOffset: -18, barGap: 16 },
  pauseButton: { x: 1192, y: 24, w: 50, h: 38 },
  pauseMenu: { x: 414, y: 122, w: 452, h: 462 },
  settings: { x: 142, y: 58, w: 996, h: 604, tabX: 184, contentX: 388, contentY: 166 },
  ultimateMeter: { x: 0, y: ROWS * TILE + 10, w: COLS * TILE, h: 30 },
  compactHints: ["screenMove", "screenSoftDrop", "screenHardDrop", "screenRotate"],
};

const SETTINGS_TABS = ["general", "controls", "audio", "language"];

const MENU_IDLE_SEQUENCE = [
  { id: "idleA", duration: 2800 },
  { id: "idleB", duration: 3400 },
  { id: "idleA", duration: 2400 },
  { id: "idleC", duration: 3200 },
  { id: "idleA", duration: 2600 },
  { id: "idleD", duration: 3600 },
];

const MENU_IDLE_TRANSITION_MS = 520;

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

const translations = {
  zh: {
    startTitle: "T-Spin Traveler",
    startSubtitle: "用消行、Spin 與 Combo 把方塊轉化成符文攻擊。",
    startTagline: "方塊消除 × 奇幻戰鬥",
    startWorldHint: "Noa 穿過魔法裂隙，把每一次消行變成戰鬥指令。",
    startPanelHint: "先進無盡模式。教學可選，不會強制。",
    endless: "無盡模式",
    startGame: "開始遊戲",
    tutorialHintShort: "建議",
    settings: "設定",
    moveGuide: "招式圖鑑",
    moreOptions: "更多",
    startHint: "Enter 開始無盡模式",
    paused: "暫停",
    pauseMenu: "暫停選單",
    pauseMenuHint: "戰鬥已停止。調整設定或回到主選單。",
    settingsBack: "返回暫停",
    settingsBackMenu: "返回主選單",
    settingsTabGeneral: "一般",
    settingsTabControls: "操作",
    settingsTabAudio: "音訊",
    settingsTabLanguage: "語言",
    generalSettingsTitle: "一般設定",
    generalSettingsHelp: "主畫面維持 Minimal HUD：只保留棋盤、HP、Guard、Intent、Hold、Next 與 Wave。詳細公式與教學放在暫停或招式圖鑑。",
    hudLayerTitle: "HUD 資訊層級",
    hudMinimal: "Minimal HUD",
    hudFloatingText: "Combo / B2B / T-Spin / Perfect Clear 以棋盤旁魔法浮字呈現，不常駐佔版面。",
    audioSettingsTitle: "音樂與音效",
    controlsSettingsTitle: "操作設定",
    languageSettingsTitle: "語言設定",
    languageHelp: "切換後會立即刷新遊戲介面文字。B2B、T-Spin 等招式名稱保留英文。",
    countdownStart: "START",
    resume: "繼續",
    restart: "重新開始",
    menu: "主選單",
    retry: "再打一場",
    defeat: "失敗",
    victory: "勝利",
    audio: "音量",
    master: "主音量",
    music: "音樂",
    sfx: "音效",
    mute: "靜音",
    language: "語言",
    controls: "按鍵設定",
    feel: "操作手感",
    das: "DAS 延遲",
    arr: "ARR 連移",
    softDropMs: "軟降速度",
    lockDelayMs: "鎖定延遲",
    bindHelp: "點擊任一按鍵欄位後按下新按鍵，Esc 取消。",
    binding: "請按下新按鍵，Esc 取消",
    closeHint: "Esc / 齒輪關閉設定",
    back: "返回",
    hold: "保留",
    pauseSettingsTitle: "暫停與設定",
    menuActions: "選單",
    battleStats: "戰鬥紀錄",
    waveLabel: "波次",
    bestLabel: "最佳",
    piecesLabel: "方塊",
    nextBossLabel: "下一個 Boss",
    incomingHelp: "消行可抵銷",
    noUpgrades: "尚無強化",
    chooseUpgrade: "選擇導航強化",
    upgradeHelp: "按 1 / 2 / 3 或點擊卡片",
    endlessDescription: "無限波次，敵人會逐步變強。",
    ally: "我方",
    enemy: "敵人",
    hp: "HP",
    traveler: "旅人",
    travelerNote: "冷靜的外星旅人",
    build: "Build",
    navigationCore: "導航核心：森林邊境",
    topQuest: "祕法導航裂隙",
    next: "下一個",
    hex: "干擾",
    attackPanel: "攻擊",
    upgradeMeterShort: "升級",
    ultimateShort: "大招",
    ultimate4Wide: "4-WIDE 爆發",
    ultimateEnd: "4-WIDE 結束",
    ultimateBurstTimed: "4-WIDE 爆發 {seconds}s",
    ultimateComboExtend: "Combo 延長 +{seconds}s",
    incomingShort: "垃圾",
    enemyStrike: "敵人攻擊",
    enemyIntent: "意圖",
    intentAttackLabel: "攻擊",
    intentGarbageLabel: "垃圾",
    intentCountdownLabel: "倒數",
    turnsLater: "{count} 回合後",
    kos: "擊破",
    bossPhase: "Boss 階段 {phase}",
    miniBoss: "小 Boss",
    comboLabel: "Combo",
    incomingLabel: "垃圾預告",
    on: "開",
    off: "關",
    pcShort: "PC",
    dmgShort: "DMG",
    guardLabel: "護盾",
    guardBlocked: "護盾抵擋",
    floaterGuard: "護盾 +{amount}",
    floaterB2BGuard: "B2B 保護",
    b2bReady: "B2B Ready",
    b2bBroken: "B2B Broken",
    b2bChain: "B2B Chain {count}",
    enemyInfoCancel: "抵銷",
    enemyCancelable: "可抵銷",
    enemyUncancelable: "不可抵銷",
    bossPhaseBar: "階段壓力",
    firstRunHint: "首次遊玩建議先完成 3 分鐘教學。",
    nextRunHook: "下一局目標：撐到第 20 波並擊破 Boss。",
    nextRunHookDynamic: "下一局目標：撐到第 {wave} 波並擊破 Boss。",
    damageEquationHint: "消行 + 技術 + Combo + 弱點 + 升級 = 總傷害",
    damageDetailHint: "暫停可看完整來源",
    lastHit: "最後命中",
    detailPauseHint: "P 暫停看完整公式",
    buildCompact: "流派",
    buildDetailPause: "詳細 Build 在暫停",
    threatShort: "威脅",
    boardEffectShort: "盤面",
    weakShort: "弱點",
    relicDraft: "遺物選擇",
    safeNodeDraft: "安全節點，不打斷操作",
    damageRuleLine: "Single 10 / Double 25 / Triple 45 / Tetris 70 / Spin 30-140 / B2B +15 / Weak x1.35",
    upgradeReadyShort: "升級待命",
    upgradeReadyHint: "下一波選強化",
    floaterUpgradeReady: "升級待命：下一波安全選擇",
    ultimateExtend: "4-Wide +{seconds}s",
    practice: "練習挑戰",
    practiceHint: "從右側挑戰開始，完成目標即可獲得獎勵並學會招式。",
    audioMixHelp: "混音：操作低音量，消行/命中突出，Perfect Clear 會壓低 BGM 後爆發。",
    effectTierTitle: "特效分級",
    effectTierText: "Single 低調，Tetris/Spin 強化，B2B 金光，Perfect Clear 霸屏。",
    noaRole: "Tetr 能量劍士 / 導航術士",
    dasHelp: "按住左右後，開始自動連移前的等待時間。",
    arrHelp: "自動連移的間隔；0ms 代表貼牆瞬移。",
    softDropHelp: "按住軟降時每格下降間隔；越低越快。",
    lockDelayHelp: "方塊碰地後可微調的鎖定時間。",
    gravityCurveHelp: "難度曲線：每 5 波重力提升；第 10 波後垃圾延遲逐步縮短。",
    challengePanel: "互動挑戰",
    challengeStart: "挑戰開始",
    clickToStart: "點擊開始挑戰",
    moveGuideSubtitle: "把進階消行當成戰鬥招式。規則保持短，方便邊玩邊查。",
    waveClearPick: "波次 {wave} 已清除。選一個強化後進入下一波。",
    runMaxCombo: "最高 Combo",
    runB2BCount: "B2B 次數",
    runPerfectClear: "Perfect Clear",
    runSpinCount: "Spin 次數",
    allSpinShort: "All",
    "build.maxHp": "最大 HP +{value}",
    "build.damage": "傷害 x{value}",
    "build.lineDmg": "消行傷害 +{value}",
    "build.tCore": "T-Core +{value}",
    "build.garbageCancel": "垃圾抵銷 +{value}",
    "build.comboDelay": "Combo 延後 +{value}",
    "build.b2bBlade": "B2B Blade +{value}",
    "build.waveHeal": "波次回血 +{value}",
    "build.spinFlow": "Spin Flow +{value}",
    "build.comboFlow": "Combo Flow +{value}",
    "build.guard": "防禦 -{value}",
    "build.bossbreaker": "Bossbreaker +{value}",
    "build.clearHeal": "消行回血 +{value}",
    "build.spinHeal": "Spin 回血 +{value}",
    "family.spin": "Spin 流派",
    "family.combo": "Combo 流派",
    "family.defense": "防禦流派",
    "family.garbage": "垃圾控制",
    "family.burst": "爆發流派",
    "family.perfect": "Perfect 流派",
    "tutorial": "新手教學",
    "tutorialTitle": "3 分鐘戰鬥教學",
    "tutorialSubtitle": "用最短流程理解消行、HOLD、Combo、Spin 與垃圾抵銷。",
    "tutorialStart": "開始教學",
    "tutorialSkip": "跳過教學",
    "tutorialActive": "教學",
    "tutorialDone": "教學完成",
    "tutorialStep.line": "先消除任意 1 行，確認攻擊會如何產生。",
    "tutorialStep.hold": "使用 HOLD 保留方塊，理解保留限制。",
    "tutorialStep.combo": "連續消行達到 2 Combo，觀察傷害提升。",
    "tutorialStep.spin": "打出任意 Spin 消行，觸發技術加成。",
    "tutorialStep.cancel": "抵銷 1 行 Incoming Garbage，理解防禦節奏。",
    "tutorialPrompt.line": "教學 1/5：消除任意 1 行",
    "tutorialPrompt.hold": "教學 2/5：使用 HOLD 一次",
    "tutorialPrompt.combo": "教學 3/5：達到 2 Combo",
    "tutorialPrompt.spin": "教學 4/5：打出任意 Spin 消行",
    "tutorialPrompt.cancel": "教學 5/5：消行抵銷垃圾",
    "damageFormula": "傷害公式",
    "damageTotal": "總傷害",
    "damageBase": "基礎",
    "damageLineBonus": "消行強化",
    "damageTBonus": "T 方塊加成",
    "damageSpinBonus": "Spin 強化",
    "damageAllSpinBonus": "All-Spin 強化",
    "damageCombo": "Combo",
    "damageComboBurst": "Combo 爆發",
    "damageB2B": "B2B",
    "damageBoss": "Bossbreaker",
    "damagePerfect": "Perfect Clear",
    "damageMultiplier": "倍率",
    "damageWeakness": "弱點倍率",
    "damageExecute": "處決補正",
    "enemyInfoDamage": "傷害",
    "enemyInfoGarbage": "垃圾",
    "enemyInfoSpecial": "特性",
    "enemyInfoWeakness": "弱點",
    "special.none": "無特殊",
    "special.slime": "基礎攻擊",
    "special.vine": "施加藤蔓壓力",
    "special.mushroom": "干擾 Next",
    "special.beetle": "單行傷害減半",
    "special.mist": "垃圾洞漂移",
    "special.king": "分階段壓迫",
    "summaryDamage": "總傷害",
    "summaryBestHit": "最高單擊",
    "summaryDamageSources": "傷害來源",
    "summaryUpgradeSource": "強化",
    rating: "評級 {rating}",
    settingPressKey: "按新鍵",
    languageZhShort: "中文",
    languageEnShort: "EN",
    screenMove: "← → 移動",
    screenSoftDrop: "↓ 軟降",
    screenHardDrop: "Space 硬降",
    screenRotate: "↑ / X 旋轉",
    screenRotateCCW: "Z 逆轉",
    screenRotate180: "A 180°",
    screenHold: "Shift / C 保留",
    screenMusic: "M 音樂",
    ariaPrototype: "T-Spin Traveler 可玩原型",
    "control.left": "左移",
    "control.right": "右移",
    "control.softDrop": "加速下降",
    "control.hardDrop": "瞬間落下",
    "control.rotateCW": "順時針旋轉",
    "control.rotateCCW": "逆時針旋轉",
    "control.rotate180": "180 度旋轉",
    "control.hold": "保留方塊",
    "control.pause": "暫停",
    "control.mute": "靜音",
    messageSpawnTop: "方塊堆到盤面頂端",
    messageHoldBlocked: "保留方塊交換後無法生成",
    messageLockAbove: "方塊鎖定在盤面上方",
    messagePlayerDefeat: "Noa 失去戰鬥能力",
    messageVictory: "Noa 取得導航核心碎片，森林邊境航道已重新點亮。",
    messageGarbageTop: "垃圾行把盤面推到頂端",
    floaterComboDelay: "Combo {combo}: 延後 +{delay}",
    floaterCancelGarbage: "抵銷 {count} 行垃圾",
    floaterArmored: "護甲減傷",
    floaterFullHp: "HP 全滿",
    floaterTBonus: "T 加成",
    floaterB2BRow: "B2B +{rows} 行",
    floaterComboRow: "Combo +{rows} 行",
    floaterComboBurst: "Combo 爆發 +{damage}",
    floaterPerfectClear: "Perfect Clear",
    floaterFullRecovery: "完全回復",
    floaterCombo: "{combo} Combo",
    floaterGarbageRise: "垃圾上升 +{count}",
    floaterChallengeClear: "挑戰完成：{title}",
    floaterReward: "獎勵：{name}",
    floaterIncoming: "垃圾預告 +{count}",
    floaterRootPressure: "藤蔓壓迫",
    floaterMistHolesDrift: "霧洞漂移",
    floaterBossPressure: "Boss 壓迫 +1",
    floaterQueueHex: "Next 干擾",
    floaterVineBlocksRemoved: "藤蔓障礙清除",
    floaterRelicWave: "Relic 波次 {wave}",
    floaterMiniBossClear: "小 Boss 擊破",
    floaterWave: "波次 {wave}",
    floaterWaveHeal: "+{amount} HP",
    floaterUpgrade: "升級 {tier}",
    intentSporeHex: "孢子干擾",
    intentSporeHexDetail: "{damage} 傷害 / 28% +1 垃圾",
    intentArmorCrush: "甲殼重擊",
    intentArmorCrushDetail: "{damage} 傷害 / +{garbage} 垃圾",
    intentBossPhase: "階段 {phase}",
    intentBossPhaseDetail: "{damage} 傷害 / Next 干擾 + 垃圾",
    intentGarbageSurge: "垃圾湧升",
    intentGarbageSurgeDetail: "{damage} 傷害 / +{garbage} 垃圾",
    intentStrike: "攻擊",
    intentStrikeDetail: "{damage} 傷害",
    weaknessNone: "無弱點",
    weaknessCombo: "弱點：Combo",
    weaknessPerfect: "弱點：Perfect Clear",
    weaknessSpin: "弱點：Spin",
    weaknessAllSpin: "弱點：All-Spin",
    weaknessB2B: "弱點：B2B",
    weaknessHit: "弱點 x1.35",
    perfectClearTitle: "PERFECT CLEAR",
    perfectClearSubtitle: "祕法導航裂隙",
    perfectClearDamage: "虛空處決  -{damage}",
    guideTSpinText: "T 方塊旋轉卡洞並消行。高傷害，吃 T-Core 強化。",
    guideTSpinMiniText: "T 方塊小型卡洞消行。傷害較低，但仍可觸發 Spin 系統。",
    guideAllSpinMiniText: "I/J/L/S/Z 旋轉卡進洞中消行。用於觸發非 T 方塊 Spin。",
    guideB2BText: "連續 Tetris 或 Spin 消行，中間不能用普通消行打斷。",
    guidePerfectClearText: "消行後整個盤面清空。高爆發並回血。",
    guideIncomingCancelText: "敵人垃圾先進預告池；你消行會先抵銷垃圾。",
    "challenge.tspinMini": "完成 1 次 T-Spin Mini 消行",
    "challenge.cancel3": "累積抵銷 3 行垃圾",
    "challenge.b2b2": "維持 Back-to-Back 2 次",
    "line.single": "一行",
    "line.double": "兩行",
    "line.triple": "三行",
    "line.tetris": "四行",
    "line.generic": "{lines} 行",
    "upgrade.tspin_amp": "T-Spin / T-Spin Mini 額外 +10 傷害。",
    "upgrade.garbage_guard": "每次消行抵銷 Incoming Garbage 額外 +1。",
    "upgrade.combo_clock": "3 Combo 以上延後敵人攻擊額外 +1 回合。",
    "upgrade.b2b_blade": "Back-to-Back 額外 +8 傷害。",
    "upgrade.star_mender": "每波勝利額外回復 +12 HP。",
    "upgrade.vital_core": "最大 HP +15，並立刻回復 +15 HP。",
    "upgrade.blade_polish": "所有消行攻擊額外 +5 傷害。",
    "upgrade.recovery_glyph": "每次有消行時額外回復 +3 HP。",
    "upgrade.spin_circuit": "Spin 類招式額外 +8 傷害，All-Spin 也吃加成。",
    "upgrade.combo_resonator": "2 Combo 以上，每段 Combo 額外 +3 傷害。",
    "upgrade.aegis_shell": "敵人每次攻擊傷害 -2。",
    "upgrade.all_spin_codex": "All-Spin Mini 額外 +18 傷害，並多抵銷 1 垃圾。",
    "upgrade.tempo_engine": "Combo 延後敵人攻擊 +1，Combo 傷害再 +4。",
    "upgrade.null_barrier": "敵人攻擊傷害 -3，垃圾預告上升前多等 1 回合。",
    "upgrade.void_carapace": "最大 HP +25，敵人每次攻擊傷害 -1。",
    "upgrade.stellar_caliber": "所有造成的傷害提高 12%。",
    "upgrade.arcane_suture": "最大 HP +10，Spin 類招式命中時額外回復 +5 HP。",
    "upgrade.bossbreaker_relic": "B2B 與 Spin 對 Boss 額外 +20 傷害。",
    "upgrade.grey_star_reactor": "最大 HP +40，所有傷害提高 10%。",
    "upgrade.guard_lattice": "護盾上限 +8，每次消行額外獲得 +1 護盾。",
    "upgrade.b2b_preserver": "獲得 2 層 B2B 保護；普通消行不會立刻打斷 B2B。",
    "upgrade.spin_vamp": "Spin 命中額外回復 +6 HP，並額外獲得護盾。",
    "upgrade.combo_aegis": "3 Combo 以上時，每次消行額外獲得 +2 護盾。",
    "upgradeName.tspin_amp": "T-Core 增幅器",
    "upgradeName.garbage_guard": "重力濾鏡",
    "upgradeName.combo_clock": "節奏錨點",
    "upgradeName.b2b_blade": "Back-to-Back 刃",
    "upgradeName.star_mender": "星光修補",
    "upgradeName.vital_core": "生命核心",
    "upgradeName.blade_polish": "Tetr 刃研磨",
    "upgradeName.recovery_glyph": "回復符文",
    "upgradeName.spin_circuit": "Spin 迴路",
    "upgradeName.combo_resonator": "Combo 共鳴器",
    "upgradeName.aegis_shell": "守護甲殼",
    "upgradeName.all_spin_codex": "All-Spin 法典",
    "upgradeName.tempo_engine": "節奏引擎",
    "upgradeName.null_barrier": "虛無屏障",
    "upgradeName.void_carapace": "虛空甲殼",
    "upgradeName.stellar_caliber": "星核校準",
    "upgradeName.arcane_suture": "祕法縫合",
    "upgradeName.bossbreaker_relic": "Bossbreaker 遺物",
    "upgradeName.grey_star_reactor": "灰星反應爐",
    "upgradeName.guard_lattice": "導航護盾格",
    "upgradeName.b2b_preserver": "B2B 記憶護符",
    "upgradeName.spin_vamp": "Spin 吸能刃",
    "upgradeName.combo_aegis": "Combo 守勢",
    "enemy.slime.name": "森林黏液幼體",
    "enemy.slime.trait": "基礎打擊",
    "enemy.vine.name": "藤蔓跳躍獸",
    "enemy.vine.trait": "跳躍種彈",
    "enemy.mushroom.name": "花冠薩滿",
    "enemy.mushroom.trait": "花瓣干擾",
    "enemy.beetle.name": "荊棘甲蟲",
    "enemy.beetle.trait": "甲殼衝撞",
    "enemy.mist.name": "迷霧燈靈",
    "enemy.mist.trait": "幽光護盾",
    "enemy.king.name": "古樹巨像",
    "enemy.king.trait": "Boss：大地重擊",
  },
  en: {
    startTitle: "T-Spin Traveler",
    startSubtitle: "Turn clears, Spins, and Combos into rune attacks.",
    startTagline: "Falling Blocks x Fantasy Combat",
    startWorldHint: "Noa crosses the magic rift and turns every line clear into a battle command.",
    startPanelHint: "Start Endless first. Tutorial is optional.",
    endless: "Endless",
    startGame: "Start Game",
    tutorialHintShort: "Optional",
    settings: "Settings",
    moveGuide: "Move Guide",
    moreOptions: "More",
    startHint: "Enter starts Endless",
    paused: "Paused",
    pauseMenu: "Pause Menu",
    pauseMenuHint: "Battle is stopped. Adjust settings or return to the main menu.",
    settingsBack: "Back to Pause",
    settingsBackMenu: "Back to Menu",
    settingsTabGeneral: "General",
    settingsTabControls: "Controls",
    settingsTabAudio: "Audio",
    settingsTabLanguage: "Language",
    generalSettingsTitle: "General Settings",
    generalSettingsHelp: "The main screen uses Minimal HUD: board, HP, Guard, Intent, Hold, Next, and Wave stay visible. Full formulas and teaching text live in Pause or Move Guide.",
    hudLayerTitle: "HUD Information Layers",
    hudMinimal: "Minimal HUD",
    hudFloatingText: "Combo / B2B / T-Spin / Perfect Clear appear as short magical popups near the board instead of permanent side text.",
    audioSettingsTitle: "Music & Sound",
    controlsSettingsTitle: "Control Settings",
    languageSettingsTitle: "Language",
    languageHelp: "Text updates immediately. B2B, T-Spin, and move names stay in English.",
    countdownStart: "START",
    resume: "Resume",
    restart: "Restart",
    menu: "Menu",
    retry: "Retry",
    defeat: "Defeat",
    victory: "Victory",
    audio: "Audio",
    master: "Master",
    music: "Music",
    sfx: "SFX",
    mute: "Mute",
    language: "Language",
    controls: "Controls",
    feel: "Handling",
    das: "DAS Delay",
    arr: "ARR Repeat",
    softDropMs: "Soft Drop",
    lockDelayMs: "Lock Delay",
    bindHelp: "Click a key field, then press a new key. Esc cancels.",
    binding: "Press a new key. Esc cancels",
    closeHint: "Esc / gear closes settings",
    back: "Back",
    hold: "Hold",
    pauseSettingsTitle: "Pause & Settings",
    menuActions: "Menu",
    battleStats: "Run Stats",
    waveLabel: "Wave",
    bestLabel: "Best",
    piecesLabel: "Pieces",
    nextBossLabel: "Next Boss",
    incomingHelp: "clear lines to cancel",
    noUpgrades: "No upgrades yet",
    chooseUpgrade: "Choose A Navigation Upgrade",
    upgradeHelp: "Press 1 / 2 / 3 or click a card",
    endlessDescription: "Endless waves. Enemies grow stronger over time.",
    ally: "Ally",
    enemy: "Enemy",
    hp: "HP",
    traveler: "Traveler",
    travelerNote: "Calm alien traveler",
    build: "Build",
    navigationCore: "Navigation Core: Forest Border",
    topQuest: "Arcane Navigation Rift",
    next: "Next",
    hex: "Hex",
    attackPanel: "Attack",
    upgradeMeterShort: "UP",
    ultimateShort: "ULT",
    ultimate4Wide: "4-WIDE Burst",
    ultimateEnd: "4-WIDE End",
    ultimateBurstTimed: "4-WIDE Burst {seconds}s",
    ultimateComboExtend: "Combo Extend +{seconds}s",
    incomingShort: "INC",
    enemyStrike: "Enemy Strike",
    enemyIntent: "Intent",
    intentAttackLabel: "Attack",
    intentGarbageLabel: "Garbage",
    intentCountdownLabel: "Countdown",
    turnsLater: "in {count} turns",
    kos: "KOs",
    bossPhase: "Boss Phase {phase}",
    miniBoss: "Mini Boss",
    comboLabel: "Combo",
    incomingLabel: "Incoming",
    on: "ON",
    off: "OFF",
    pcShort: "PC",
    dmgShort: "DMG",
    guardLabel: "Guard",
    guardBlocked: "Guard blocked",
    floaterGuard: "Guard +{amount}",
    floaterB2BGuard: "B2B Preserved",
    b2bReady: "B2B Ready",
    b2bBroken: "B2B Broken",
    b2bChain: "B2B Chain {count}",
    enemyInfoCancel: "Cancel",
    enemyCancelable: "Cancelable",
    enemyUncancelable: "Uncancelable",
    bossPhaseBar: "Phase Pressure",
    firstRunHint: "Suggested first run: try the 3-minute tutorial.",
    nextRunHook: "Next run goal: reach Wave 20 and defeat the Boss.",
    nextRunHookDynamic: "Next run goal: reach Wave {wave} and defeat the Boss.",
    damageEquationHint: "Clear + Technique + Combo + Weakness + Upgrade = Total Damage",
    damageDetailHint: "Pause for full source details",
    lastHit: "Last Hit",
    detailPauseHint: "Press P for full formula",
    buildCompact: "Build",
    buildDetailPause: "Build details in pause",
    threatShort: "Threat",
    boardEffectShort: "Board",
    weakShort: "Weak",
    relicDraft: "Relic Draft",
    safeNodeDraft: "Safe node, never interrupts play",
    damageRuleLine: "Single 10 / Double 25 / Triple 45 / Tetris 70 / Spin 30-140 / B2B +15 / Weak x1.35",
    upgradeReadyShort: "Upgrade Ready",
    upgradeReadyHint: "Pick after wave",
    floaterUpgradeReady: "UPGRADE READY: PICK AFTER WAVE",
    ultimateExtend: "4-Wide +{seconds}s",
    practice: "Practice Challenges",
    practiceHint: "Start a challenge on the right. Complete the goal to learn the technique and earn a reward.",
    audioMixHelp: "Mix: quiet inputs, clear hits, and Perfect Clear ducks BGM before impact.",
    effectTierTitle: "Effect Tiers",
    effectTierText: "Single is restrained, Tetris/Spin hit harder, B2B glows gold, Perfect Clear takes over the screen.",
    noaRole: "Tetr energy swordsman / navigator",
    dasHelp: "Delay before held left/right starts repeating.",
    arrHelp: "Repeat interval after DAS; 0ms means instant wall movement.",
    softDropHelp: "Cell interval while holding Soft Drop; lower is faster.",
    lockDelayHelp: "Time to adjust a grounded piece before it locks.",
    gravityCurveHelp: "Curve: gravity rises every 5 waves; garbage delay shrinks after Wave 10.",
    challengePanel: "Challenges",
    challengeStart: "Challenge Start",
    clickToStart: "Click to start",
    moveGuideSubtitle: "Use advanced clears as combat moves. Kept short for mid-run reference.",
    waveClearPick: "Wave {wave} clear. Pick one before the next enemy appears.",
    runMaxCombo: "Max Combo",
    runB2BCount: "B2B Count",
    runPerfectClear: "Perfect Clear",
    runSpinCount: "Spin Count",
    allSpinShort: "All",
    "build.maxHp": "Max HP +{value}",
    "build.damage": "Damage x{value}",
    "build.lineDmg": "Line DMG +{value}",
    "build.tCore": "T-Core +{value}",
    "build.garbageCancel": "Garbage Cancel +{value}",
    "build.comboDelay": "Combo Delay +{value}",
    "build.b2bBlade": "B2B Blade +{value}",
    "build.waveHeal": "Wave Heal +{value}",
    "build.spinFlow": "Spin Flow +{value}",
    "build.comboFlow": "Combo Flow +{value}",
    "build.guard": "Guard -{value}",
    "build.bossbreaker": "Bossbreaker +{value}",
    "build.clearHeal": "Clear Heal +{value}",
    "build.spinHeal": "Spin Heal +{value}",
    "family.spin": "Spin Flow",
    "family.combo": "Combo Flow",
    "family.defense": "Defense Flow",
    "family.garbage": "Garbage Control",
    "family.burst": "Burst Flow",
    "family.perfect": "Perfect Flow",
    "tutorial": "Tutorial",
    "tutorialTitle": "3-Minute Combat Tutorial",
    "tutorialSubtitle": "Learn line clears, HOLD, Combo, Spin, and garbage canceling in one short run.",
    "tutorialStart": "Start Tutorial",
    "tutorialSkip": "Skip Tutorial",
    "tutorialActive": "Tutorial",
    "tutorialDone": "Tutorial Complete",
    "tutorialStep.line": "Clear any 1 line to see how attacks are generated.",
    "tutorialStep.hold": "Use HOLD once and learn the hold restriction.",
    "tutorialStep.combo": "Reach 2 Combo and watch damage scale up.",
    "tutorialStep.spin": "Clear with any Spin to trigger a technique bonus.",
    "tutorialStep.cancel": "Cancel 1 Incoming Garbage to learn defense timing.",
    "tutorialPrompt.line": "Tutorial 1/5: Clear any 1 line",
    "tutorialPrompt.hold": "Tutorial 2/5: Use HOLD once",
    "tutorialPrompt.combo": "Tutorial 3/5: Reach 2 Combo",
    "tutorialPrompt.spin": "Tutorial 4/5: Clear with any Spin",
    "tutorialPrompt.cancel": "Tutorial 5/5: Cancel incoming garbage",
    "damageFormula": "Damage Formula",
    "damageTotal": "Total Damage",
    "damageBase": "Base",
    "damageLineBonus": "Line Upgrade",
    "damageTBonus": "T Piece Bonus",
    "damageSpinBonus": "Spin Upgrade",
    "damageAllSpinBonus": "All-Spin Upgrade",
    "damageCombo": "Combo",
    "damageComboBurst": "Combo Burst",
    "damageB2B": "B2B",
    "damageBoss": "Bossbreaker",
    "damagePerfect": "Perfect Clear",
    "damageMultiplier": "Multiplier",
    "damageWeakness": "Weakness Multiplier",
    "damageExecute": "Execute Adjustment",
    "enemyInfoDamage": "Damage",
    "enemyInfoGarbage": "Garbage",
    "enemyInfoSpecial": "Special",
    "enemyInfoWeakness": "Weakness",
    "special.none": "No special",
    "special.slime": "Basic strike",
    "special.vine": "Applies root pressure",
    "special.mushroom": "Scrambles Next",
    "special.beetle": "Halves Single damage",
    "special.mist": "Garbage hole drift",
    "special.king": "Phase pressure",
    "summaryDamage": "Total Damage",
    "summaryBestHit": "Best Hit",
    "summaryDamageSources": "Damage Sources",
    "summaryUpgradeSource": "Upgrade",
    rating: "Rating {rating}",
    settingPressKey: "PRESS KEY",
    languageZhShort: "ZH",
    languageEnShort: "EN",
    screenMove: "← → Move",
    screenSoftDrop: "↓ Soft Drop",
    screenHardDrop: "Space Hard Drop",
    screenRotate: "↑ / X Rotate",
    screenRotateCCW: "Z Rotate CCW",
    screenRotate180: "A 180°",
    screenHold: "Shift / C Hold",
    screenMusic: "M Music",
    ariaPrototype: "T-Spin Traveler playable prototype",
    "control.left": "Move Left",
    "control.right": "Move Right",
    "control.softDrop": "Soft Drop",
    "control.hardDrop": "Hard Drop",
    "control.rotateCW": "Rotate CW",
    "control.rotateCCW": "Rotate CCW",
    "control.rotate180": "Rotate 180",
    "control.hold": "Hold Piece",
    "control.pause": "Pause",
    "control.mute": "Mute",
    messageSpawnTop: "Blocks reached the top of the board.",
    messageHoldBlocked: "Hold swap could not spawn a valid piece.",
    messageLockAbove: "A piece locked above the playfield.",
    messagePlayerDefeat: "Noa can no longer fight.",
    messageVictory: "Noa recovered a navigation core shard. The Forest Border route is lit again.",
    messageGarbageTop: "Garbage pushed the board to the top.",
    floaterComboDelay: "COMBO {combo}: DELAY +{delay}",
    floaterCancelGarbage: "CANCEL {count} GARBAGE",
    floaterArmored: "ARMORED",
    floaterFullHp: "FULL HP",
    floaterTBonus: "T BONUS",
    floaterB2BRow: "B2B +{rows} ROW",
    floaterComboRow: "COMBO +{rows} ROW",
    floaterComboBurst: "COMBO BURST +{damage}",
    floaterPerfectClear: "PERFECT CLEAR",
    floaterFullRecovery: "FULL RECOVERY",
    floaterCombo: "{combo} COMBO",
    floaterGarbageRise: "GARBAGE RISE +{count}",
    floaterChallengeClear: "CHALLENGE CLEAR: {title}",
    floaterReward: "REWARD: {name}",
    floaterIncoming: "INCOMING +{count}",
    floaterRootPressure: "ROOT PRESSURE",
    floaterMistHolesDrift: "MIST HOLES DRIFT",
    floaterBossPressure: "BOSS PRESSURE +1",
    floaterQueueHex: "QUEUE HEX",
    floaterVineBlocksRemoved: "VINE BLOCKS REMOVED",
    floaterRelicWave: "RELIC WAVE {wave}",
    floaterMiniBossClear: "MINI BOSS CLEAR",
    floaterWave: "WAVE {wave}",
    floaterWaveHeal: "+{amount} HP",
    floaterUpgrade: "UPGRADE {tier}",
    intentSporeHex: "Spore Hex",
    intentSporeHexDetail: "{damage} dmg / 28% +1 incoming",
    intentArmorCrush: "Armor Crush",
    intentArmorCrushDetail: "{damage} dmg / +{garbage} incoming",
    intentBossPhase: "Phase {phase}",
    intentBossPhaseDetail: "{damage} dmg / queue + incoming",
    intentGarbageSurge: "Garbage Surge",
    intentGarbageSurgeDetail: "{damage} dmg / +{garbage} incoming",
    intentStrike: "Strike",
    intentStrikeDetail: "{damage} damage",
    weaknessNone: "No weakness",
    weaknessCombo: "Weak: Combo",
    weaknessPerfect: "Weak: Perfect Clear",
    weaknessSpin: "Weak: Spin",
    weaknessAllSpin: "Weak: All-Spin",
    weaknessB2B: "Weak: B2B",
    weaknessHit: "WEAKNESS x1.35",
    perfectClearTitle: "PERFECT CLEAR",
    perfectClearSubtitle: "ARCANE NAVIGATION RIFT",
    perfectClearDamage: "VOID EXECUTION  -{damage}",
    guideTSpinText: "Rotate a T into a slot and clear lines. High damage.",
    guideTSpinMiniText: "A smaller T slot clear. Lower damage, still counts as Spin.",
    guideAllSpinMiniText: "I/J/L/S/Z rotate into a tight slot and clear lines.",
    guideB2BText: "Chain Tetris or Spin clears without a normal clear between.",
    guidePerfectClearText: "Clear lines and leave the board empty. Burst damage and heal.",
    guideIncomingCancelText: "Enemy garbage waits in preview; line clears cancel it first.",
    "challenge.tspinMini": "Clear once with T-Spin Mini",
    "challenge.cancel3": "Cancel 3 incoming garbage",
    "challenge.b2b2": "Reach a 2-chain Back-to-Back",
    "line.single": "SINGLE",
    "line.double": "DOUBLE",
    "line.triple": "TRIPLE",
    "line.tetris": "TETRIS",
    "line.generic": "{lines} LINE",
    "upgrade.tspin_amp": "T-Spin / T-Spin Mini deal +10 damage.",
    "upgrade.garbage_guard": "Line clears cancel +1 additional Incoming Garbage.",
    "upgrade.combo_clock": "At 3+ Combo, delay enemy attacks by +1 extra turn.",
    "upgrade.b2b_blade": "Back-to-Back deals +8 damage.",
    "upgrade.star_mender": "After each wave, recover +12 HP.",
    "upgrade.vital_core": "Max HP +15 and immediately recover +15 HP.",
    "upgrade.blade_polish": "All line-clear attacks deal +5 damage.",
    "upgrade.recovery_glyph": "Whenever you clear lines, recover +3 HP.",
    "upgrade.spin_circuit": "Spin moves deal +8 damage. All-Spin also benefits.",
    "upgrade.combo_resonator": "At 2+ Combo, each Combo segment deals +3 damage.",
    "upgrade.aegis_shell": "Enemy attack damage -2.",
    "upgrade.all_spin_codex": "All-Spin Mini deals +18 damage and cancels +1 more garbage.",
    "upgrade.tempo_engine": "Combo delays enemy attacks by +1 and Combo damage +4.",
    "upgrade.null_barrier": "Enemy attack damage -3. Incoming garbage waits +1 extra turn.",
    "upgrade.void_carapace": "Max HP +25. Enemy attack damage -1.",
    "upgrade.stellar_caliber": "All damage dealt increases by 12%.",
    "upgrade.arcane_suture": "Max HP +10. Spin hits recover +5 extra HP.",
    "upgrade.bossbreaker_relic": "B2B and Spin deal +20 extra damage to Bosses.",
    "upgrade.grey_star_reactor": "Max HP +40. All damage dealt increases by 10%.",
    "upgrade.guard_lattice": "Guard cap +8. Every line clear grants +1 extra Guard.",
    "upgrade.b2b_preserver": "Gain 2 B2B preserves. Normal clears do not immediately break B2B.",
    "upgrade.spin_vamp": "Spin hits recover +6 extra HP and gain extra Guard.",
    "upgrade.combo_aegis": "At 3+ Combo, each line clear grants +2 extra Guard.",
    "upgradeName.tspin_amp": "T-Core Amplifier",
    "upgradeName.garbage_guard": "Gravity Filter",
    "upgradeName.combo_clock": "Tempo Anchor",
    "upgradeName.b2b_blade": "Back-to-Back Blade",
    "upgradeName.star_mender": "Star Mender",
    "upgradeName.vital_core": "Vital Core",
    "upgradeName.blade_polish": "Tetr Blade Polish",
    "upgradeName.recovery_glyph": "Recovery Glyph",
    "upgradeName.spin_circuit": "Spin Circuit",
    "upgradeName.combo_resonator": "Combo Resonator",
    "upgradeName.aegis_shell": "Aegis Shell",
    "upgradeName.all_spin_codex": "All-Spin Codex",
    "upgradeName.tempo_engine": "Tempo Engine",
    "upgradeName.null_barrier": "Null Barrier",
    "upgradeName.void_carapace": "Void Carapace",
    "upgradeName.stellar_caliber": "Stellar Caliber",
    "upgradeName.arcane_suture": "Arcane Suture",
    "upgradeName.bossbreaker_relic": "Bossbreaker Relic",
    "upgradeName.grey_star_reactor": "Grey Star Reactor",
    "upgradeName.guard_lattice": "Navigation Guard Lattice",
    "upgradeName.b2b_preserver": "B2B Memory Charm",
    "upgradeName.spin_vamp": "Spin Siphon Blade",
    "upgradeName.combo_aegis": "Combo Aegis",
    "enemy.slime.name": "FOREST SLIME HATCHLING",
    "enemy.slime.trait": "BASIC STRIKE",
    "enemy.vine.name": "VINE HOPPER",
    "enemy.vine.trait": "LEAP SEED",
    "enemy.mushroom.name": "BLOOM SHAMAN",
    "enemy.mushroom.trait": "PETAL HEX",
    "enemy.beetle.name": "BRAMBLE BEETLE",
    "enemy.beetle.trait": "ARMORED CHARGE",
    "enemy.mist.name": "MIST LANTERN SPRITE",
    "enemy.mist.trait": "WISP SHIELD",
    "enemy.king.name": "ANCIENT BARK COLOSSUS",
    "enemy.king.trait": "BOSS: EARTH SLAM",
  },
};

const TEXT = translations;

const ROSTER_CELLS = {
  noa: [0, 0],
  slime: [1, 0],
  vine: [2, 0],
  mushroom: [3, 0],
  beetle: [0, 1],
  mist: [1, 1],
  stalker: [2, 1],
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

const UPGRADES = [
  {
    id: "tspin_amp",
    name: "T-Core Amplifier",
    rarity: "rare",
    textKey: "upgrade.tspin_amp",
    apply: () => {
      state.upgrades.tspinBonus += 10;
    },
  },
  {
    id: "garbage_guard",
    name: "Gravity Filter",
    rarity: "common",
    textKey: "upgrade.garbage_guard",
    apply: () => {
      state.upgrades.garbageCancel += 1;
    },
  },
  {
    id: "combo_clock",
    name: "Tempo Anchor",
    rarity: "common",
    textKey: "upgrade.combo_clock",
    apply: () => {
      state.upgrades.comboDelay += 1;
    },
  },
  {
    id: "b2b_blade",
    name: "Back-to-Back Blade",
    rarity: "rare",
    textKey: "upgrade.b2b_blade",
    apply: () => {
      state.upgrades.b2bBonus += 8;
    },
  },
  {
    id: "star_mender",
    name: "Star Mender",
    rarity: "common",
    textKey: "upgrade.star_mender",
    apply: () => {
      state.upgrades.waveHeal += 12;
    },
  },
  {
    id: "vital_core",
    name: "Vital Core",
    rarity: "common",
    textKey: "upgrade.vital_core",
    apply: () => {
      increasePlayerMaxHp(15, 15);
    },
  },
  {
    id: "blade_polish",
    name: "Tetr Blade Polish",
    rarity: "common",
    textKey: "upgrade.blade_polish",
    apply: () => {
      state.upgrades.lineDamage += 5;
    },
  },
  {
    id: "recovery_glyph",
    name: "Recovery Glyph",
    rarity: "common",
    textKey: "upgrade.recovery_glyph",
    apply: () => {
      state.upgrades.clearHeal += 3;
    },
  },
  {
    id: "spin_circuit",
    name: "Spin Circuit",
    rarity: "common",
    textKey: "upgrade.spin_circuit",
    apply: () => {
      state.upgrades.spinBonus += 8;
    },
  },
  {
    id: "combo_resonator",
    name: "Combo Resonator",
    rarity: "common",
    textKey: "upgrade.combo_resonator",
    apply: () => {
      state.upgrades.comboDamage += 3;
    },
  },
  {
    id: "aegis_shell",
    name: "Aegis Shell",
    rarity: "common",
    textKey: "upgrade.aegis_shell",
    apply: () => {
      state.upgrades.defense += 2;
    },
  },
  {
    id: "guard_lattice",
    name: "Navigation Guard Lattice",
    rarity: "common",
    textKey: "upgrade.guard_lattice",
    apply: () => {
      state.maxGuard += 8;
      state.upgrades.guardGain += 1;
      state.guard = Math.min(state.maxGuard, state.guard + 8);
    },
  },
  {
    id: "combo_aegis",
    name: "Combo Aegis",
    rarity: "rare",
    textKey: "upgrade.combo_aegis",
    apply: () => {
      state.upgrades.comboGuardGain += 2;
    },
  },
  {
    id: "b2b_preserver",
    name: "B2B Memory Charm",
    rarity: "rare",
    textKey: "upgrade.b2b_preserver",
    apply: () => {
      state.upgrades.b2bShield += 2;
    },
  },
  {
    id: "all_spin_codex",
    name: "All-Spin Codex",
    rarity: "rare",
    textKey: "upgrade.all_spin_codex",
    apply: () => {
      state.upgrades.allSpinBonus += 18;
      state.upgrades.garbageCancel += 1;
    },
  },
  {
    id: "tempo_engine",
    name: "Tempo Engine",
    rarity: "rare",
    textKey: "upgrade.tempo_engine",
    apply: () => {
      state.upgrades.comboDelay += 1;
      state.upgrades.comboDamage += 4;
    },
  },
  {
    id: "null_barrier",
    name: "Null Barrier",
    rarity: "rare",
    textKey: "upgrade.null_barrier",
    apply: () => {
      state.upgrades.defense += 3;
      state.upgrades.garbageGrace += 1;
    },
  },
  {
    id: "void_carapace",
    name: "Void Carapace",
    rarity: "rare",
    textKey: "upgrade.void_carapace",
    apply: () => {
      increasePlayerMaxHp(25, 20);
      state.upgrades.defense += 1;
    },
  },
  {
    id: "stellar_caliber",
    name: "Stellar Caliber",
    rarity: "rare",
    textKey: "upgrade.stellar_caliber",
    apply: () => {
      state.upgrades.damageMultiplier += 0.12;
    },
  },
  {
    id: "arcane_suture",
    name: "Arcane Suture",
    rarity: "rare",
    textKey: "upgrade.arcane_suture",
    apply: () => {
      increasePlayerMaxHp(10, 10);
      state.upgrades.spinHeal += 5;
    },
  },
  {
    id: "spin_vamp",
    name: "Spin Siphon Blade",
    rarity: "rare",
    textKey: "upgrade.spin_vamp",
    apply: () => {
      state.upgrades.spinHeal += 6;
      state.upgrades.guardGain += 1;
    },
  },
  {
    id: "bossbreaker_relic",
    name: "Bossbreaker Relic",
    rarity: "relic",
    textKey: "upgrade.bossbreaker_relic",
    apply: () => {
      state.upgrades.bossDamage += 20;
    },
  },
  {
    id: "grey_star_reactor",
    name: "Grey Star Reactor",
    rarity: "relic",
    textKey: "upgrade.grey_star_reactor",
    apply: () => {
      increasePlayerMaxHp(40, 30);
      state.upgrades.damageMultiplier += 0.1;
    },
  },
];

const ENEMIES = [
  {
    id: "slime",
    name: "FOREST SLIME HATCHLING",
    trait: "BASIC STRIKE",
    hp: 120,
    hpScale: 24,
    damage: 8,
    countdown: 7,
    garbage: 0,
    color: "#86ef8f",
    weakness: "none",
    filter: "none",
    artSheet: "enemy01",
    artRect: { x: 235, y: 128, w: 335, h: 240 },
    artDraw: { x: -132, y: -146, w: 264, h: 238 },
    artKey: "forest-slime-hatchling",
  },
  {
    id: "vine",
    name: "VINE HOPPER",
    trait: "LEAP SEED",
    hp: 150,
    hpScale: 30,
    damage: 7,
    countdown: 7,
    garbage: 1,
    color: "#9de06c",
    weakness: "combo",
    filter: "hue-rotate(42deg) saturate(1.05)",
    artSheet: "enemy02",
    artRect: { x: 118, y: 118, w: 360, h: 230 },
    artDraw: { x: -144, y: -150, w: 288, h: 236 },
    artKey: "vine-hopper",
  },
  {
    id: "mushroom",
    name: "BLOOM SHAMAN",
    trait: "PETAL HEX",
    hp: 110,
    hpScale: 22,
    damage: 6,
    countdown: 5,
    garbage: 0,
    color: "#77e8ff",
    weakness: "perfect",
    filter: "hue-rotate(118deg) saturate(1.25) brightness(1.06)",
    artSheet: "enemy02",
    artRect: { x: 116, y: 715, w: 350, h: 250 },
    artDraw: { x: -140, y: -170, w: 280, h: 264 },
    artKey: "bloom-shaman",
  },
  {
    id: "beetle",
    name: "BRAMBLE BEETLE",
    trait: "ARMORED CHARGE",
    hp: 210,
    hpScale: 42,
    damage: 10,
    countdown: 8,
    garbage: 1,
    color: "#c6b38a",
    weakness: "spin",
    filter: "grayscale(0.65) sepia(0.28) brightness(0.82) saturate(0.9)",
    armorSingle: 0.5,
    artSheet: "enemy02",
    artRect: { x: 770, y: 132, w: 380, h: 235 },
    artDraw: { x: -150, y: -138, w: 300, h: 226 },
    artKey: "bramble-beetle",
  },
  {
    id: "mist",
    name: "MIST LANTERN SPRITE",
    trait: "WISP SHIELD",
    hp: 145,
    hpScale: 28,
    damage: 8,
    countdown: 6,
    garbage: 1,
    color: "#d2ceff",
    weakness: "allspin",
    filter: "hue-rotate(220deg) saturate(0.9) brightness(1.12)",
    artSheet: "enemy02",
    artRect: { x: 195, y: 455, w: 255, h: 250 },
    artDraw: { x: -122, y: -170, w: 244, h: 270 },
    artKey: "mist-lantern-sprite",
  },
  {
    id: "king",
    name: "ANCIENT BARK COLOSSUS",
    trait: "BOSS: EARTH SLAM",
    hp: 360,
    hpScale: 55,
    damage: 14,
    countdown: 7,
    garbage: 1,
    color: "#f1d36b",
    weakness: "b2b",
    filter: "hue-rotate(18deg) saturate(1.25) brightness(1.08)",
    artSheet: "enemy02",
    artRect: { x: 825, y: 690, w: 365, h: 260 },
    artDraw: { x: -156, y: -176, w: 312, h: 278 },
    artKey: "ancient-bark-colossus",
  },
];

const ENEMY_ATTACK_ANIMATIONS = {
  slime: {
    id: "enemy-attack-slime",
    image: enemyAttackSheets.slime,
    columns: 8,
    rows: 1,
    frames: [0, 1, 2, 3, 4, 5, 6, 7],
    frameMs: ENEMY_ATTACK_FRAME_MS,
    draw: { x: -198, y: -162, w: 392, h: 306 },
    noKeying: true,
  },
  vine: {
    id: "enemy-attack-vine",
    image: enemyAttackSheets.vine,
    columns: 8,
    rows: 1,
    frames: [0, 1, 2, 3, 4, 5, 6, 7],
    frameMs: ENEMY_ATTACK_FRAME_MS,
    draw: { x: -204, y: -158, w: 402, h: 304 },
    noKeying: true,
  },
  mushroom: {
    id: "enemy-attack-mushroom",
    image: enemyAttackSheets.mushroom,
    columns: 8,
    rows: 1,
    frames: [0, 1, 2, 3, 4, 5, 6, 7],
    frameMs: ENEMY_ATTACK_FRAME_MS,
    draw: { x: -204, y: -174, w: 400, h: 318 },
    noKeying: true,
  },
  beetle: {
    id: "enemy-attack-beetle",
    image: enemyAttackSheets.beetle,
    columns: 8,
    rows: 1,
    frames: [0, 1, 2, 3, 4, 5, 6, 7],
    frameMs: ENEMY_ATTACK_FRAME_MS,
    draw: { x: -212, y: -154, w: 414, h: 304 },
    noKeying: true,
  },
  mist: {
    id: "enemy-attack-mist",
    image: enemyAttackSheets.mist,
    columns: 8,
    rows: 1,
    frames: [0, 1, 2, 3, 4, 5, 6, 7],
    frameMs: ENEMY_ATTACK_FRAME_MS,
    draw: { x: -202, y: -176, w: 400, h: 324 },
    noKeying: true,
  },
  king: {
    id: "enemy-attack-king",
    image: enemyAttackSheets.king,
    columns: 8,
    rows: 1,
    frames: [0, 1, 2, 3, 4, 5, 6, 7],
    frameMs: ENEMY_ATTACK_FRAME_MS,
    draw: { x: -216, y: -174, w: 424, h: 318 },
    noKeying: true,
  },
};

const PIECES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

const JLSTZ_KICKS = {
  "0>1": [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  "1>0": [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  "1>2": [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  "2>1": [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  "2>3": [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  "3>2": [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  "3>0": [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  "0>3": [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
};

const I_KICKS = {
  "0>1": [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
  "1>0": [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  "1>2": [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
  "2>1": [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
  "2>3": [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  "3>2": [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
  "3>0": [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
  "0>3": [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
};

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
  playerHit: 0,
  heroAnimation: null,
  enemyAnimation: null,
  placed: 0,
  combo: 0,
  pendingGarbage: 0,
  garbageGrace: 0,
  queueHex: 0,
  mistGarbage: 0,
  lastGarbageHole: null,
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
  runFinalized: false,
  challenge: null,
  tutorial: null,
  upgradeChoices: [],
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
  },
  message: "",
  messageKey: "",
  messageVars: {},
  settingsOpen: false,
  settingsTab: "general",
  pauseView: "menu",
  bindingAction: null,
  language: "zh",
  controls: { ...DEFAULT_CONTROLS },
  tuning: { ...DEFAULT_TUNING },
  pointer: { x: 0, y: 0, down: false, dragging: null },
  countdownMs: 0,
  countdownCue: "",
  lastMoveWasRotate: false,
  lastRotationKind: null,
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
  return Array.from({ length: ROWS + HIDDEN }, () => Array(COLS).fill(null));
}

function isUltimateWellColumn(x) {
  return x >= ULTIMATE_WELL_START && x < ULTIMATE_WELL_START + ULTIMATE_WELL_WIDTH;
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
  return row.some((cell) => cell && cell !== ULTIMATE_WALL);
}

function cloneMatrix(matrix) {
  return matrix.map((row) => row.slice());
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
            controls: { ...DEFAULT_CONTROLS },
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
      audioRevision: 3,
      language: state.language,
      controls: { ...state.controls },
      tuning: { ...state.tuning },
    };
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state.save));
  } catch {
    // Local saves are optional; gameplay should continue if storage is blocked.
  }
}

function applySavedSettings() {
  const settings = state.save.settings || {};
  if (typeof settings.masterVolume === "number") audio.masterVolume = settings.masterVolume;
  if (typeof settings.musicVolume === "number") audio.musicVolume = settings.musicVolume;
  if (typeof settings.sfxVolume === "number") audio.sfxVolume = settings.sfxVolume;
  if (typeof settings.muted === "boolean") audio.muted = settings.muted;
  if (settings.language === "en" || settings.language === "zh") state.language = settings.language;
  state.controls = { ...DEFAULT_CONTROLS, ...(settings.controls || {}) };
  state.tuning = { ...DEFAULT_TUNING, ...(settings.tuning || {}) };
  if ((settings.audioRevision || 0) < 3) state.tuning.softDrop = DEFAULT_TUNING.softDrop;
  if (typeof settings.pause === "string") state.controls.pause = settings.pause;
  applyAudioSettings();
  syncControlHints();
}

function refillQueue() {
  while (state.queue.length < 7) {
    if (state.bag.length === 0) {
      state.bag = Object.keys(PIECES);
      for (let i = state.bag.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.bag[i], state.bag[j]] = [state.bag[j], state.bag[i]];
      }
    }
    state.queue.push(state.bag.pop());
  }
}

function newPiece(type) {
  const shape = cloneMatrix(PIECES[type]);
  const spawnLeft = state.ultimateActive ? ULTIMATE_WELL_START : 0;
  const spawnWidth = state.ultimateActive ? ULTIMATE_WELL_WIDTH : COLS;
  return {
    type,
    shape,
    x: spawnLeft + Math.floor((spawnWidth - shape[0].length) / 2),
    y: type === "I" ? -1 : 0,
    rotation: 0,
  };
}

function spawnPiece() {
  refillQueue();
  state.active = newPiece(state.queue.shift());
  state.canHold = true;
  state.lockTimer = null;
  state.lastMoveWasRotate = false;
  state.lastRotationKind = null;
  if (collides(state.active, state.active.x, state.active.y, state.active.shape)) {
    state.mode = "defeat";
    setMessage("messageSpawnTop");
    finishRun("defeat");
  }
}

function resetGame(runMode = state.runMode || "endless", challengeId = null) {
  unlockAudio();
  state.mode = "playing";
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
  state.playerHit = 0;
  state.heroAnimation = null;
  state.enemyAnimation = null;
  state.placed = 0;
  state.combo = 0;
  state.pendingGarbage = 0;
  state.garbageGrace = 0;
  state.queueHex = 0;
  state.mistGarbage = 0;
  state.lastGarbageHole = null;
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
  state.runFinalized = false;
  state.challenge = challengeId ? makeChallengeState(challengeId) : null;
  state.tutorial = null;
  state.upgradeChoices = [];
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
  };
  state.message = "";
  state.messageKey = "";
  state.messageVars = {};
  state.lastMoveWasRotate = false;
  state.lastRotationKind = null;
  state.input.left = false;
  state.input.right = false;
  state.input.softDrop = false;
  state.input.softDropTimer = 0;
  resetInputRepeat();
  refillQueue();
  spawnPiece();
  startBattleCountdown();
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

function rotateMatrix(matrix, dir) {
  const n = matrix.length;
  const result = Array.from({ length: n }, () => Array(n).fill(0));
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      if (dir > 0) result[x][n - 1 - y] = matrix[y][x];
      else result[n - 1 - x][y] = matrix[y][x];
    }
  }
  return result;
}

function collides(piece, x, y, shape) {
  for (let r = 0; r < shape.length; r += 1) {
    for (let c = 0; c < shape[r].length; c += 1) {
      if (!shape[r][c]) continue;
      const bx = x + c;
      const by = y + r;
      if (bx < 0 || bx >= COLS || by >= ROWS + HIDDEN) return true;
      if (by >= 0 && state.board[by][bx]) return true;
    }
  }
  return false;
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
  for (const [dx, dy] of kicks) {
    if (!collides(piece, piece.x + dx, piece.y - dy, next)) {
      piece.shape = next;
      piece.x += dx;
      piece.y -= dy;
      piece.rotation = to;
      state.lastMoveWasRotate = true;
      state.lastRotationKind = dir > 0 ? "cw" : "ccw";
      if (touchingGround()) resetLockDelay();
      playSfx(piece.type === "T" ? "rotateT" : "rotate");
      return;
    }
  }
}

function rotate180() {
  if (state.mode !== "playing" || !state.active) return;
  const piece = state.active;
  if (piece.type === "O") return;
  const next = rotateMatrix(rotateMatrix(piece.shape, 1), 1);
  const to = (piece.rotation + 2) % 4;
  const kicks = get180Kicks(piece.type);
  for (const [dx, dy] of kicks) {
    if (!collides(piece, piece.x + dx, piece.y + dy, next)) {
      piece.shape = next;
      piece.x += dx;
      piece.y += dy;
      piece.rotation = to;
      state.lastMoveWasRotate = true;
      state.lastRotationKind = "180";
      if (touchingGround()) resetLockDelay();
      playSfx(piece.type === "T" ? "rotateT" : "rotate");
      return;
    }
  }
}

function get180Kicks(type) {
  if (type === "I") {
    return [
      [0, 0],
      [1, 0],
      [-1, 0],
      [2, 0],
      [-2, 0],
      [0, -1],
      [0, 1],
      [1, -1],
      [-1, -1],
      [1, 1],
      [-1, 1],
    ];
  }
  return [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, -1],
    [0, 1],
    [1, -1],
    [-1, -1],
    [1, 1],
    [-1, 1],
  ];
}

function touchingGround() {
  const piece = state.active;
  return piece && collides(piece, piece.x, piece.y + 1, piece.shape);
}

function hardDrop() {
  if (state.mode !== "playing" || !state.active) return;
  const wasRotate = state.lastMoveWasRotate;
  const rotationKind = state.lastRotationKind;
  while (move(0, 1)) {}
  state.lastMoveWasRotate = wasRotate;
  state.lastRotationKind = rotationKind;
  playSfx("drop");
  lockPiece();
}

function holdPiece() {
  if (state.mode !== "playing" || !state.active || !state.canHold) return;
  const current = state.active.type;
  if (!state.hold) {
    state.hold = current;
    spawnPiece();
  } else {
    const next = state.hold;
    state.hold = current;
    state.active = newPiece(next);
    if (collides(state.active, state.active.x, state.active.y, state.active.shape)) {
      state.mode = "defeat";
      setMessage("messageHoldBlocked");
      finishRun("defeat");
    }
  }
  state.canHold = false;
  state.lastMoveWasRotate = false;
  state.lastRotationKind = null;
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

function lockPiece() {
  const piece = state.active;
  if (!piece) return;
  const spinType = detectSpin(piece);
  for (let r = 0; r < piece.shape.length; r += 1) {
    for (let c = 0; c < piece.shape[r].length; c += 1) {
      if (!piece.shape[r][c]) continue;
      const y = piece.y + r;
      const x = piece.x + c;
      if (y < 0) {
        state.mode = "defeat";
        setMessage("messageLockAbove");
        finishRun("defeat");
        return;
      }
      state.board[y][x] = piece.type;
    }
  }

  const cleared = clearLines();
  applyBattle(cleared, piece.type, spinType);
  state.placed += 1;
  state.queueHex = Math.max(0, state.queueHex - 1);
  state.lastMoveWasRotate = false;
  state.lastRotationKind = null;
  state.active = null;
  if (state.mode === "playing") spawnPiece();
}

function detectSpin(piece) {
  if (!state.lastMoveWasRotate) return null;
  if (piece.type !== "T") return isImmobileSpin(piece) ? "all-mini" : null;
  const cx = piece.x + 1;
  const cy = piece.y + 1;
  const corners = [
    [cx - 1, cy - 1],
    [cx + 1, cy - 1],
    [cx - 1, cy + 1],
    [cx + 1, cy + 1],
  ];
  let blocked = 0;
  for (const [x, y] of corners) {
    if (x < 0 || x >= COLS || y >= ROWS + HIDDEN) blocked += 1;
    else if (y >= 0 && state.board[y][x]) blocked += 1;
  }
  if (blocked >= 3) return "full";
  if (blocked === 2 || isImmobileSpin(piece)) return "mini";
  return null;
}

function isImmobileSpin(piece) {
  if (piece.type === "O") return false;
  return collides(piece, piece.x, piece.y - 1, piece.shape);
}

function clearLines() {
  state.lastPerfectClear = false;
  const lines = [];
  for (let y = 0; y < state.board.length; y += 1) {
    if (state.board[y].every(Boolean)) lines.push(y);
  }
  if (lines.length === 0) {
    state.combo = 0;
    return 0;
  }
  state.combo += 1;
  state.lineFlash = lines.map((y) => ({ y, life: 190 }));
  spawnLineParticles(lines);
  spawnClearBurst(lines.length, state.combo);
  state.board = state.board.filter((_, y) => !lines.includes(y));
  while (state.board.length < ROWS + HIDDEN) state.board.unshift(state.ultimateActive ? makeUltimateRow(null) : Array(COLS).fill(null));
  applyUltimateWalls();
  state.lastPerfectClear = isBoardEmpty();
  if (state.lastPerfectClear) state.perfectClears += 1;
  return lines.length;
}

function isBoardEmpty() {
  return state.board.every((row) => row.every((cell) => !cell || cell === ULTIMATE_WALL));
}

function spawnLineParticles(lines) {
  for (const line of lines) {
    const py = BOARD_Y + (line - HIDDEN) * TILE + TILE / 2;
    if (py < BOARD_Y) continue;
    const colStart = state.ultimateActive ? ULTIMATE_WELL_START : 0;
    const colEnd = state.ultimateActive ? ULTIMATE_WELL_START + ULTIMATE_WELL_WIDTH : COLS;
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
  const centerX = state.ultimateActive
    ? BOARD_X + (ULTIMATE_WELL_START + ULTIMATE_WELL_WIDTH / 2) * TILE
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

function makeDamageSourceMap() {
  return Object.fromEntries(DAMAGE_SOURCE_KEYS.map((key) => [key, 0]));
}

function addDamagePart(parts, sources, key, value, source) {
  if (!value) return;
  parts.push({ key, value, source });
  if (source && sources[source] !== undefined) sources[source] += value;
}

function getHeroAnimationDuration(kind) {
  const config = HERO_ANIMATIONS[kind] || HERO_ANIMATIONS.ranged;
  return config.frames.length * config.frameMs;
}

function getHeroHitDelay(kind) {
  const config = HERO_ANIMATIONS[kind] || HERO_ANIMATIONS.ranged;
  const duration = getHeroAnimationDuration(kind);
  if (typeof config.hitRatio === "number") return Math.floor(duration * config.hitRatio);
  const frame = typeof config.hitFrame === "number" ? config.hitFrame : Math.floor(config.frames.length * 0.55);
  return Math.min(duration - 40, Math.floor((frame + 0.5) * config.frameMs));
}

function getEnemyAnimationDuration(kind) {
  const config = ENEMY_ATTACK_ANIMATIONS[kind];
  return config ? config.frames.length * config.frameMs : ENEMY_ATTACK_DURATION_MS;
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

  state.enemyHp = Math.max(0, state.enemyHp - damage);
  state.enemyHit = 260;
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
  if (state.enemyCountdown <= 0) resolveEnemyAttack();
  if (context.lines === 0 && state.pendingGarbage > 0 && state.mode === "playing") {
    applyIncomingGarbage();
  }
}

function applyEnemyHit(hit) {
  if (state.mode !== "playing") return;
  const { enemy, damageTaken, garbageAdded } = hit;
  const blocked = Math.min(state.guard, damageTaken);
  state.guard -= blocked;
  const finalDamage = Math.max(0, damageTaken - blocked);
  state.playerHp = Math.max(0, state.playerHp - finalDamage);
  state.pendingGarbage += garbageAdded;
  if (garbageAdded > 0) state.garbageGrace = getGarbageDelayForWave();
  applyEnemyBoardEffect(enemy);
  state.playerHit = 300;
  state.shake = Math.max(state.shake, 9 + garbageAdded * 2);
  playSfx("enemy");
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
  if (state.playerHp <= 0) {
    state.mode = "defeat";
    setMessage("messagePlayerDefeat");
    finishRun("defeat");
    playSfx("defeat");
  }
}

function applyBattle(lines, pieceType, spinType) {
  const isTSpin = spinType === "full";
  const isTSpinMini = spinType === "mini";
  const isAllSpinMini = spinType === "all-mini";
  const isDifficultClear = lines === 4 || (spinType && lines > 0);
  const rotationBonus = getRotationDamageBonus(lines, pieceType, spinType, state.lastRotationKind);
  const weaknessBonus = getWeaknessBonus(lines, spinType);
  const comboAttackRows = getComboAttackRows(state.combo);
  const comboMilestoneBonus = getComboMilestoneDamage(state.combo);
  const b2bAttackRows = isDifficultClear && state.b2bActive ? 1 : 0;
  const effectiveLines = getEffectiveClearLines(lines, spinType);
  const b2bBonus = b2bAttackRows * ATTACK_ROW_DAMAGE + (b2bAttackRows > 0 ? state.upgrades.b2bBonus : 0);
  const comboBonus = comboAttackRows * ATTACK_ROW_DAMAGE;
  const parts = [];
  const sources = makeDamageSourceMap();
  let damage = spinType && lines > 0 ? (SPIN_DAMAGE_BY_LINES[lines] || 0) : ([0, 10, 25, 45, 70][lines] || 0);
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
  const bossBonus = lines > 0 && state.enemyType.id === "king" && (spinType || state.b2bActive) ? state.upgrades.bossDamage : 0;
  damage += bossBonus;
  addDamagePart(parts, sources, "damageBoss", bossBonus, "upgrade");
  if (state.lastPerfectClear) {
    damage += PERFECT_CLEAR_BASE_DAMAGE;
    addDamagePart(parts, sources, "damagePerfect", PERFECT_CLEAR_BASE_DAMAGE, "perfect");
  }
  damage += b2bBonus;
  addDamagePart(parts, sources, "damageB2B", b2bBonus, "b2b");

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
  if (state.lastPerfectClear) {
    const before = damage;
    damage = Math.max(damage, state.enemyHp);
    if (damage > before) {
      addDamagePart(parts, sources, "damageExecute", damage - before, "perfect");
    }
    startPerfectClearFx(damage);
    extendUltimateOnPerfectClear();
  }
  extendUltimateOnCombo(lines);

  const canceled = cancelIncomingGarbage(lines);
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
  addUltimateCharge(lines);
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
  if (damage > 0) state.lastDamageBreakdown = breakdown;
  pushOperationReadout(lines, pieceType, spinType, {
    combo: state.combo,
    b2b: b2bAttackRows > 0,
    effectiveLines,
    perfect: state.lastPerfectClear,
    damage,
    breakdown,
  });

  let heal = [0, 2, 4, 6, 10][lines] || 0;
  if (isTSpin) heal += lines >= 2 ? 10 : 6;
  if (isTSpinMini) heal += 4;
  if (isAllSpinMini) heal += 3;
  if (lines > 0) heal += state.upgrades.clearHeal;
  if (spinType) heal += state.upgrades.spinHeal;
  if (state.lastPerfectClear) heal = state.playerMaxHp;

  const context = {
    lines,
    combo: state.combo,
    spinType,
    perfect: state.lastPerfectClear,
  };
  if (damage <= 0) {
    finishPlayerTurnAfterHit(context);
    return;
  }

  const comboAttackStyle = getComboAttackStyle(state.combo);
  const attackStyle = getHeroAttackStyle(lines, spinType, state.lastPerfectClear, b2bBonus, comboAttackStyle);
  const attackDuration = getHeroAnimationDuration(attackStyle);
  const special = state.lastPerfectClear ? "perfect" : comboAttackStyle ? "combo" : spinType ? "spin" : b2bBonus > 0 ? "b2b" : lines >= 4 ? "tetris" : "clear";
  const floaters = [
    { x: 930, y: 246, text: `-${damage}`, color: pieceType === "T" && lines > 0 ? "#c7a7ff" : "#f8f3cf", life: 900 },
  ];
  if (rotationBonus.label) floaters.push({ x: 930, y: 398, text: rotationBonus.label, color: rotationBonus.color, life: 980 });
  if (weaknessBonus.label) floaters.push({ x: 904, y: 438, text: weaknessBonus.label, color: "#ffdf8a", life: 1100 });
  if (state.lastPerfectClear) {
    floaters.push({ x: 930, y: 476, text: t("floaterFullRecovery"), color: "#8ff7ff", life: 1250 });
  }

  startHeroAttackAnimation(attackStyle);
  state.attacks.push({
    type: "player",
    x0: 244,
    y0: 358,
    x1: 994,
    y1: 346,
    life: attackDuration,
    duration: attackDuration,
    damage,
    spin: isTSpin,
    heroStyle: attackStyle,
    special,
    lines,
  });
  schedulePendingHit({
    type: "player",
    delay: getHeroHitDelay(attackStyle),
    damage,
    heal,
    context,
    breakdown,
    floaters,
    weaknessHit: weaknessBonus.multiplier > 1,
    b2bHit: b2bBonus > 0,
    comboBurst: comboMilestoneBonus > 0 || state.combo >= 3,
    sfx: state.lastPerfectClear ? "perfect" : spinType ? "tspin" : lines >= 4 ? "bigClear" : "clear",
    shake: state.lastPerfectClear ? 12 : Math.max(4 + lines * 1.8 + Math.min(4, state.combo * 0.7), spinType || lines >= 4 ? 8 : 0),
    burst: spinType || lines >= 4 || state.lastPerfectClear ? {
      x: 994,
      y: 346,
      radius: 18,
      color: state.lastPerfectClear ? "#fff0a6" : spinType ? "#d7c2ff" : "#9df7da",
      life: state.lastPerfectClear ? 620 : 440,
      duration: state.lastPerfectClear ? 620 : 440,
      intensity: state.lastPerfectClear ? 2.2 : 1.65,
    } : null,
  });
}

function getBaseAttackRows(lines, spinType) {
  if (lines <= 0) return 0;
  if (spinType) return [0, 2, 4, 6, 8][lines] || 0;
  return [0, 0, 1, 2, 4][lines] || 0;
}

function getComboAttackRows(combo) {
  if (combo < 3) return 0;
  return Math.floor((combo - 1) / 2);
}

function getComboMilestoneDamage(combo) {
  if (combo < BALANCE.comboMilestoneEvery) return 0;
  return Math.floor(combo / BALANCE.comboMilestoneEvery) * BALANCE.comboMilestoneDamage;
}

function gainGuardFromClear(lines, spinType) {
  if (lines <= 0) return;
  const comboGuard = state.combo >= 3 ? state.upgrades.comboGuardGain : 0;
  const gain = lines * BALANCE.guardPerLine + (spinType ? BALANCE.guardSpinBonus : 0) + state.upgrades.guardGain + comboGuard;
  const before = state.guard;
  state.guard = Math.min(state.maxGuard, state.guard + gain);
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
  return Math.max(0, 1 + state.upgrades.garbageGrace - Math.floor((state.wave - 1) / BALANCE.garbageDelayStepWaves));
}

function addUltimateCharge(lines) {
  if (lines <= 0 || state.ultimateActive) return;
  state.ultimateCharge = Math.min(ULTIMATE_REQUIRED_LINES, state.ultimateCharge + lines);
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

function getEffectiveClearLines(lines, spinType) {
  if (lines <= 0) return 0;
  return lines * (spinType ? 2 : 1);
}

function getComboAttackStyle(combo) {
  if (combo < 2) return "";
  return `combo${((combo - 2) % 3) + 1}`;
}

function getHeroAttackStyle(lines, spinType, perfectClear, b2bBonus, comboAttackStyle = "") {
  if (perfectClear) return "ultimate";
  if (!perfectClear && comboAttackStyle) return comboAttackStyle;
  if (spinType || b2bBonus > 0 || lines >= 4) return "melee";
  if (lines > 0) return "ranged";
  return "ranged";
}

function startPerfectClearFx(damage) {
  const now = performance.now();
  duckMusic(0.42, 1.35);
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

function startHeroAttackAnimation(kind) {
  const config = HERO_ANIMATIONS[kind] || HERO_ANIMATIONS.ranged;
  state.heroAnimation = {
    kind,
    startedAt: performance.now(),
    duration: config.frames.length * config.frameMs,
  };
}

function startEnemyAttackAnimation(kind) {
  const config = ENEMY_ATTACK_ANIMATIONS[kind];
  if (!config) return;
  state.enemyAnimation = {
    kind,
    startedAt: performance.now(),
    duration: config.frames.length * config.frameMs,
  };
}

function getRotationDamageBonus(lines, pieceType, spinType, rotationKind) {
  if (lines <= 0 || !rotationKind) return { multiplier: 1, label: "", color: "#f8f3cf" };
  if (spinType === "full") {
    return { multiplier: 1, label: `T-${formatRotationKind(rotationKind)} SPIN`, color: "#f2d36b" };
  }
  if (spinType === "mini") {
    return { multiplier: 1, label: `MINI ${formatRotationKind(rotationKind)} SPIN`, color: "#d7c2ff" };
  }
  if (spinType === "all-mini") {
    return { multiplier: 1, label: `${pieceType}-${formatRotationKind(rotationKind)} SPIN`, color: "#9df7da" };
  }
  if (pieceType === "T") {
    return { multiplier: rotationKind === "180" ? 1.2 : rotationKind === "ccw" ? 1.14 : 1.1, label: `T ${formatRotationKind(rotationKind)} BONUS`, color: "#c7a7ff" };
  }
  if (rotationKind === "180") return { multiplier: 1.15, label: "180 STRIKE x1.15", color: "#fff0a6" };
  if (rotationKind === "ccw") return { multiplier: 1.08, label: "Z ROT BONUS x1.08", color: "#9fb4ff" };
  return { multiplier: 1.05, label: "ROT BONUS x1.05", color: "#9df7da" };
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

function getMoveRating(lines, spinType, perfect) {
  if (perfect) return "PERFECT";
  if (spinType === "full" || state.b2bActive) return "ARCANE";
  if (lines >= 4 || spinType || state.combo >= 4) return "BRUTAL";
  if (lines >= 2 || state.combo >= 2) return "CLEAN";
  return "GOOD";
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
    equation: meta.breakdown ? buildDamageEquation(meta.breakdown, true) : "",
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
  const popupBase = {
    x: BOARD_X - 54,
    y: BOARD_Y + 318,
    life: 1040,
    maxLife: 1040,
    seed: Math.random() * 1000,
  };

  if (perfect) {
    addCombatPopup({
      ...popupBase,
      text: "Perfect Clear!",
      subText: meta.damage ? `-${meta.damage} ${t("dmgShort")}` : "",
      x: BOARD_X + 54,
      y: BOARD_Y + 118,
      color: "#fff0a6",
      accent: "#8ff7ff",
      scale: 1.08,
      type: "perfect",
      life: 1180,
      maxLife: 1180,
    });
    return;
  }

  if (spinType) {
    const spinText = spinType === "full"
      ? "T-Spin!"
      : spinType === "mini"
        ? "T-Spin Mini!"
        : `${pieceType}-Spin!`;
    addCombatPopup({
      ...popupBase,
      text: spinText,
      subText: hasCombo ? `Combo x${combo}` : "",
      color: spinType === "full" ? "#ffb7ff" : "#d7c2ff",
      accent: "#8ff7ff",
      scale: spinType === "full" ? 1.08 : 0.96,
      type: spinType === "full" ? "tspin" : "spin",
      life: 1080,
      maxLife: 1080,
    });
  } else if (hasCombo) {
    addCombatPopup({
      ...popupBase,
      text: `Combo x${combo}`,
      subText: lines >= 4 ? "Tetris" : getLineClearPopupText(lines),
      color: combo >= 4 ? "#7ef7ff" : "#d7c2ff",
      accent: "#ffb7ff",
      scale: 0.9 + Math.min(0.22, combo * 0.025),
      type: "combo",
      life: 940,
      maxLife: 940,
    });
  } else {
    addCombatPopup({
      ...popupBase,
      text: getLineClearPopupText(lines),
      subText: "",
      color: lines >= 4 ? "#9df7da" : "#b9c2ff",
      accent: "#8ff7ff",
      scale: lines >= 4 ? 0.86 : 0.7,
      type: lines >= 4 ? "tetris" : "lineClear",
      life: lines >= 4 ? 860 : 760,
      maxLife: lines >= 4 ? 860 : 760,
    });
  }

  if (b2b) {
    addCombatPopup({
      ...popupBase,
      text: "B2B",
      subText: "Back-to-Back!",
      y: BOARD_Y + 252,
      color: "#fff0a6",
      accent: "#d7c2ff",
      scale: 0.92,
      type: "b2b",
      life: 960,
      maxLife: 960,
    });
  }
}

function addCombatPopup(popup) {
  state.combatPopups.unshift(popup);
  state.combatPopups = state.combatPopups.slice(0, 5);
}

function getLineClearPopupText(lines) {
  return {
    1: "Single",
    2: "Double",
    3: "Triple",
    4: "Tetris",
  }[lines] || `${lines} Lines`;
}

function buildDamageEquation(breakdown, compact = false) {
  if (!breakdown) return t("damageEquationHint");
  const terms = getDamageEquationTerms(breakdown);
  const addParts = terms.filter((term) => term.source !== "multiplier").map((term) => term.text);
  const multiplierParts = terms.filter((term) => term.source === "multiplier").map((term) => term.text);
  const parts = [...addParts, ...multiplierParts.map((part) => `× ${part}`)];
  const maxParts = compact ? 5 : 9;
  const shown = parts.slice(0, maxParts);
  if (parts.length > maxParts) shown.push("+...");
  return `${shown.join(" + ").replace(/\+ ×/g, "×")} = ${breakdown.total} ${t("dmgShort")}`;
}

function getDamageEquationTerms(breakdown) {
  if (!breakdown) return [];
  const terms = [];
  for (const part of breakdown.parts || []) {
    if (!part.value) continue;
    terms.push({
      text: `${t(part.key)} +${part.value}`,
      label: t(part.key),
      value: `+${part.value}`,
      source: part.source || "base",
      color: damageSourceColor(part.source || "base"),
    });
  }
  for (const multi of breakdown.multipliers || []) {
    const name = multi.key ? t(multi.key) : multi.label;
    terms.push({
      text: `${name} ${multi.value}`,
      label: name,
      value: multi.value,
      source: "multiplier",
      color: "#d7c2ff",
    });
  }
  return terms;
}

function damageSourceColor(source) {
  return {
    base: "#b9c2ff",
    spin: "#d7c2ff",
    combo: "#7ef7ff",
    b2b: "#fff0a6",
    perfect: "#fff0a6",
    weakness: "#ffdf8a",
    upgrade: "#9df7da",
    multiplier: "#d7c2ff",
  }[source] || "#f5f1e6";
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

function formatRotationKind(kind) {
  if (kind === "180") return "180";
  if (kind === "ccw") return "Z";
  return "CW";
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
  if (reward) reward.apply();
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
  const garbageAdded = getEnemyAttackGarbage(enemy);
  const damageTaken = Math.max(1, state.enemyAttackDamage - state.upgrades.defense);
  state.enemyCountdown = getEnemyCountdownForWave();
  if (enemy.id === "king" && getBossPhase() >= 3) state.enemyCountdown = Math.max(4, state.enemyCountdown - 1);
  if (enemy.id === "king" && getBossPhase() >= 4) state.enemyCountdown = Math.max(3, state.enemyCountdown - 1);
  startEnemyAttackAnimation(enemy.id);
  const enemyAttackDuration = getEnemyAnimationDuration(enemy.id);
  state.attacks.push({
    type: "enemy",
    attackKind: enemy.id,
    x0: 994,
    y0: 344,
    x1: 266,
    y1: 330,
    life: enemyAttackDuration,
    duration: enemyAttackDuration,
  });
  schedulePendingHit({
    type: "enemy",
    delay: Math.floor(enemyAttackDuration * 0.6),
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

function getBossPhase() {
  if (state.enemyType.id !== "king") return 1;
  const hpRatio = state.enemyMaxHp ? state.enemyHp / state.enemyMaxHp : 1;
  if (hpRatio <= 0.2) return 4;
  if (hpRatio <= 0.4) return 3;
  if (hpRatio <= 0.7) return 2;
  return 1;
}

function startNextWave() {
  const clearedBoss = state.enemyType.id === "king";
  const clearedMiniBoss = state.miniBoss;
  state.defeated += 1;
  if (state.defeated >= RUN_MODES[state.runMode].targetWaves) {
    state.mode = "victory";
    setMessage("messageVictory");
    state.shake = 10;
    finishRun("victory");
    playSfx("wave");
    return;
  }
  state.wave += 1;
  configureEnemyForWave();
  state.enemyHit = 0;
  state.enemyAnimation = null;
  state.shake = 14;
  state.lastClearedBoss = clearedBoss;
  state.upgradeChoices = [];
  state.mode = "playing";
  const beforeHeal = state.playerHp;
  const waveHeal = BALANCE.waveHeal + state.upgrades.waveHeal;
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
  playSfx("wave");
}

function createUpgradeChoices(forceRelic = false, forceRare = false) {
  const pool = UPGRADES.slice();
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const choices = [];
  if (forceRelic) {
    const relic = pool.find((upgrade) => upgrade.rarity === "relic");
    if (relic) choices.push(relic);
  } else if (forceRare) {
    const rare = pool.find((upgrade) => upgrade.rarity === "rare");
    if (rare) choices.push(rare);
  }
  for (const upgrade of pool) {
    if (!choices.includes(upgrade)) choices.push(upgrade);
    if (choices.length >= 3) break;
  }
  return choices;
}

function addUpgradeProgress(effectiveLines) {
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
  }
}

function triggerUpgradeIfReady(forceRelic = false, forceRare = false) {
  if (state.mode !== "playing") return false;
  const ready = state.upgradeMeter >= state.nextUpgradeAt;
  if (!ready && !forceRelic && !forceRare) return false;
  if (!ready) state.upgradeMeter = state.nextUpgradeAt;
  state.upgradeTier += 1;
  state.nextUpgradeAt += BALANCE.upgradeGrowthPerTier * state.upgradeTier;
  state.upgradeReady = false;
  state.upgradeChoices = createUpgradeChoices(forceRelic, forceRare);
  state.mode = "upgrade";
  state.floaters.push({
    x: 454,
    y: 178,
    text: fmt("floaterUpgrade", { tier: state.upgradeTier }),
    color: forceRelic ? "#fff0a6" : forceRare ? "#d7c2ff" : "#9df7da",
    life: 1300,
  });
  playSfx("upgrade");
  return true;
}

function increasePlayerMaxHp(amount, healAmount = amount) {
  state.upgrades.maxHpBonus += amount;
  state.playerMaxHp = PLAYER_MAX_HP + state.upgrades.maxHpBonus;
  state.playerHp = Math.min(state.playerMaxHp, state.playerHp + healAmount);
}

function chooseUpgrade(index) {
  const upgrade = state.upgradeChoices[index];
  if (!upgrade) return;
  upgrade.apply();
  state.floaters.push({
    x: 454,
    y: 178,
    text: upgradeName(upgrade),
    color: "#fff0a6",
    life: 1200,
  });
  state.upgradeChoices = [];
  state.mode = "playing";
  state.upgradeReady = state.upgradeMeter >= state.nextUpgradeAt;
  if (!state.active) spawnPiece();
  playSfx("upgrade");
}

function finishRun(outcome) {
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

function getEnemyForWave(wave) {
  if (wave % 10 === 0) return ENEMIES.find((enemy) => enemy.id === "king");
  if (wave % 5 === 0) return ENEMIES.find((enemy) => enemy.id === (Math.floor(wave / 5) % 2 === 0 ? "mist" : "beetle"));
  return ENEMIES[(wave - 1) % (ENEMIES.length - 1)];
}

function configureEnemyForWave() {
  const enemy = getEnemyForWave(state.wave);
  const tier = Math.floor((state.wave - 1) / ENEMIES.length);
  state.miniBoss = state.wave % 5 === 0 && state.wave % 10 !== 0;
  state.enemyType = enemy;
  const bossMultiplier = enemy.id === "king" ? BALANCE.bossMultiplier : state.miniBoss ? BALANCE.miniBossMultiplier : 1;
  state.enemyMaxHp = Math.floor((enemy.hp + tier * enemy.hpScale + Math.floor((state.wave - 1) * BALANCE.enemyWaveHp)) * bossMultiplier);
  state.enemyHp = state.enemyMaxHp;
  state.enemyAttackDamage = enemy.damage + Math.floor((state.wave - 1) / BALANCE.enemyDamageEveryWaves) * BALANCE.enemyDamageStep + (state.miniBoss ? BALANCE.miniBossDamageBonus : 0);
  state.enemyCountdown = getEnemyCountdownForWave();
}

function addGarbageLines(count) {
  for (let i = 0; i < count; i += 1) {
    const removed = state.board.shift();
    if (removed && rowHasPlayableCells(removed)) {
      state.mode = "defeat";
      setMessage("messageGarbageTop");
      finishRun("defeat");
      playSfx("defeat");
      return;
    }
    const holeMin = state.ultimateActive ? ULTIMATE_WELL_START : 0;
    const holeMax = state.ultimateActive ? ULTIMATE_WELL_START + ULTIMATE_WELL_WIDTH - 1 : COLS - 1;
    let hole = holeMin + Math.floor(Math.random() * (holeMax - holeMin + 1));
    if (state.mistGarbage > 0 && state.lastGarbageHole !== null) {
      hole = clamp(state.lastGarbageHole + (Math.random() > 0.5 ? 1 : -1), holeMin, holeMax);
      state.mistGarbage -= 1;
    }
    state.lastGarbageHole = hole;
    const row = Array.from({ length: COLS }, (_, x) => {
      if (state.ultimateActive && !isUltimateWellColumn(x)) return ULTIMATE_WALL;
      return x === hole ? null : "G";
    });
    state.board.push(row);
    spawnGarbageParticles(hole);
  }
  applyUltimateWalls();
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
  const dt = Math.min(34, time - (state.lastTime || time));
  state.lastTime = time;

  try {
    if (state.mode === "playing") {
      purgeLegacyVineBlocks();
      if (isBattleCountdownActive()) {
        updateBattleCountdown(dt);
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

    tickEffects(dt);
    updateScreenNoteMode();
    draw();
  } catch (error) {
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
    resetInputRepeat();
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
    if (audio.ctx.state === "suspended") audio.ctx.resume();
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
}

function applyAudioSettings() {
  if (!audio.master || !audio.musicGain || !audio.sfxGain) return;
  audio.master.gain.value = audio.muted ? 0 : audio.masterVolume * audio.outputBoost;
  audio.musicGain.gain.value = audio.musicVolume;
  audio.sfxGain.gain.value = audio.sfxVolume;
}

function startMusic() {
  if (!audio.ctx || audio.musicTimer) return;
  audio.step = 0;
  playMusicStep();
  audio.musicTimer = window.setInterval(playMusicStep, MUSIC_STEP_MS);
}

function playMusicStep() {
  if (!audio.ctx || audio.muted) return;
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
  const boss = state.enemyType?.id === "king" || state.miniBoss;
  const danger = state.playerHp / state.playerMaxHp < 0.36 || state.pendingGarbage >= 4;
  const chain = state.combo >= 3 || state.b2bActive;
  const playing = state.mode === "playing";
  const sectionEnergy = section === "intro" ? 0.32 : section === "build" ? 0.56 : section === "climax" ? 0.82 : 0.48;
  audio.targetEnergy = (playing ? sectionEnergy : 0.24) + (chain ? 0.12 : 0) + (boss ? 0.12 : 0) + (danger ? 0.1 : 0);
  audio.energy += (Math.min(1, audio.targetEnergy) - audio.energy) * 0.14;

  const energy = audio.energy;
  const root = MUSIC_ROOT;
  const stepSec = MUSIC_STEP_MS / 1000;
  const chord = [0, -5, -2, -7, 3, -5, 5, 0][bar];
  const bassPattern = [0, 0, -12, 0, -5, -5, -12, -5, -2, -2, -12, -2, -7, -7, -12, -7];
  const motifA = [0, null, 3, null, 5, 7, null, 10, 12, null, 10, 7, 5, null, 3, null];
  const motifB = [12, null, 10, 7, 5, null, 7, 10, 12, 15, null, 12, 10, 7, 5, null];
  const motifC = [7, 10, 12, null, 15, 12, 10, 7, 5, 7, 10, null, 12, 10, 7, null];
  const motifReturn = [0, null, 3, 5, null, 7, 10, null, 12, null, 10, 7, 5, null, 3, null];
  const motif = section === "intro" ? motifA : section === "build" ? motifB : section === "climax" ? motifC : motifReturn;
  const melodyDegree = motif[beat];
  const bassDegree = chord + bassPattern[beat];
  const bassNote = (root / 2) * Math.pow(2, bassDegree / 12);
  const drone = (root / 4) * Math.pow(2, chord / 12);
  const bellDegree = [12, 15, 19, 22, 24, 22, 19, 15, 17, 15, 12, 10, 12, 15, 19, 22][beat];

  if (beat === 0) tone(drone, stepSec * 12, "sine", 0.09 + energy * 0.045, audio.musicGain, t);
  if (beat % 4 === 0) tone(bassNote, stepSec * 3.6, "sine", 0.14 + energy * 0.09, audio.musicGain, t);
  if (beat % 8 === 0 || (section === "climax" && beat % 4 === 0)) deepDrum(82 + boss * 12, 0.18 + energy * 0.14, t);
  if (section !== "intro" && [3, 6, 10, 13].includes(beat)) handDrum(0.07 + energy * 0.07, t);
  if ((section === "build" || section === "climax") && [2, 5, 7, 11, 14].includes(beat)) woodClick(0.045 + energy * 0.045, t);
  if (section === "climax" && beat % 2 === 1) shaker(0.028 + energy * 0.025, t);
  if (section === "return" && [6, 14].includes(beat)) handDrum(0.055 + energy * 0.045, t);

  if (melodyDegree !== null && (playing || beat % 4 === 0)) {
    const note = root * Math.pow(2, (melodyDegree + chord * 0.16) / 12);
    pluck(note, section === "climax" ? 0.13 + energy * 0.08 : 0.09 + energy * 0.06, t);
    if (section === "climax" && beat % 4 === 0) pluck(note * 2, 0.05 + energy * 0.04, t + 0.02);
  }
  if ([4, 12].includes(beat) || (section === "climax" && [3, 7, 11, 15].includes(beat))) {
    const bell = root * Math.pow(2, (bellDegree + chord * 0.12) / 12);
    mysticBell(bell, 0.055 + energy * 0.055, t + 0.012);
  }
  if (chain && beat % 4 === 2) mysticBell(root * Math.pow(2, (24 + chord * 0.1) / 12), 0.05 + energy * 0.04, t + 0.03);
  if (boss && beat % 8 === 0) {
    deepDrum(64, 0.18 + energy * 0.12, t + 0.035);
    filteredNoise(0.09, 0.05 + energy * 0.035, "lowpass", 420, 1.2, audio.musicGain, t + 0.02);
  }
  if (danger && beat % 8 === 4) deepDrum(96, 0.16 + energy * 0.08, t);
  audio.step += 1;
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
  const t = audio.ctx.currentTime;
  const out = beginSfxBus(name);
  audio.currentSfxBus = out;
  if (name === "start") {
    arpeggio([220, 293.66, 369.99, 440, 587.33], 0.04, "triangle", 0.16);
  } else if (name === "countdown") {
    tone(392, 0.075, "triangle", 0.13, out, t);
    tone(784, 0.055, "sine", 0.08, out, t + 0.012);
    filteredNoise(0.045, 0.035, "bandpass", 1800, 5, out, t);
  } else if (name === "countdownStart") {
    arpeggio([392, 587.33, 783.99, 1174.66], 0.035, "triangle", 0.18);
    sweep(240, 980, 0.18, "sawtooth", 0.1, t, out);
  } else if (name === "move") {
    tone(360, 0.028, "triangle", 0.055, out, t);
  } else if (name === "rotate") {
    tone(520, 0.036, "square", 0.075, out, t);
    tone(780, 0.026, "triangle", 0.04, out, t + 0.012);
  } else if (name === "rotateT") {
    arpeggio([392, 493.88, 739.99], 0.028, "triangle", 0.12);
  } else if (name === "drop") {
    sweep(170, 58, 0.09, "sawtooth", 0.18);
    noise(0.04, 0.11, out, t);
  } else if (name === "hold") {
    arpeggio([330, 247, 392], 0.032, "sine", 0.11);
  } else if (name === "clear") {
    arpeggio([440, 554.37, 659.25], 0.045, "triangle", 0.14);
    noise(0.032, 0.045, out, t + 0.02);
  } else if (name === "bigClear") {
    arpeggio([392, 493.88, 659.25, 880], 0.04, "triangle", 0.18);
    sweep(920, 1320, 0.16, "square", 0.11, t + 0.03);
    noise(0.06, 0.08, out, t + 0.04);
  } else if (name === "b2b") {
    arpeggio([554.37, 739.99, 987.77, 1479.98], 0.035, "square", 0.16);
    tone(196, 0.16, "sawtooth", 0.08, out, t);
  } else if (name === "combo") {
    arpeggio([659.25, 783.99, 987.77, 1174.66], 0.032, "square", 0.13);
    noise(0.045, 0.08, out, t + 0.06);
  } else if (name === "cancel") {
    arpeggio([392, 523.25, 659.25, 783.99], 0.034, "sine", 0.13);
    sweep(720, 260, 0.11, "triangle", 0.08, t + 0.02);
  } else if (name === "perfect") {
    arpeggio([523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98], 0.042, "triangle", 0.18);
    tone(261.63, 0.45, "sine", 0.12, out, t);
    noise(0.11, 0.1, out, t + 0.09);
  } else if (name === "hitLight") {
    tone(620, 0.045, "triangle", 0.075, out, t);
    noise(0.025, 0.035, out, t + 0.012);
  } else if (name === "hitHeavy") {
    tone(130, 0.11, "sawtooth", 0.12, out, t);
    sweep(480, 1080, 0.12, "triangle", 0.095, t + 0.014);
    noise(0.055, 0.075, out, t + 0.026);
  } else if (name === "hitArcane") {
    arpeggio([392, 523.25, 783.99, 1046.5], 0.034, "triangle", 0.16);
    tone(98, 0.32, "sine", 0.13, out, t);
    filteredNoise(0.14, 0.105, "bandpass", 1400, 4, out, t + 0.04);
  } else if (name === "upgrade") {
    arpeggio([293.66, 369.99, 440, 587.33, 739.99], 0.052, "triangle", 0.15);
  } else if (name === "upgradeReady") {
    arpeggio([369.99, 440, 587.33], 0.042, "triangle", 0.11);
  } else if (name === "tspin") {
    arpeggio([493.88, 659.25, 987.77, 1318.51], 0.038, "square", 0.19);
    sweep(260, 980, 0.18, "sawtooth", 0.11, t + 0.04);
    noise(0.1, 0.09, out, t + 0.08);
  } else if (name === "enemy") {
    sweep(220, 70, 0.26, "sawtooth", 0.22);
    noise(0.09, 0.12, out, t + 0.02);
  } else if (name === "weakness") {
    arpeggio([783.99, 987.77, 1174.66], 0.03, "triangle", 0.15);
    sweep(520, 1480, 0.13, "square", 0.08, t + 0.02);
  } else if (name === "wave") {
    arpeggio([196, 246.94, 293.66, 392, 493.88, 587.33], 0.058, "triangle", 0.16);
    tone(98, 0.36, "sawtooth", 0.1, out, t);
  } else if (name === "defeat") {
    arpeggio([220, 174.61, 146.83, 110, 73.42], 0.11, "sine", 0.17);
    noise(0.18, 0.08, out, t + 0.08);
  }
  audio.currentSfxBus = null;
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
  note.replaceChildren(...hints.map((hint, index) => makeHint(hint, "play-hint", `hint-${index}`)));
  updateScreenNoteMode();
}

function updateScreenNoteMode() {
  const note = document.querySelector(".screen-note");
  if (!note) return;
  const showPlayHints = state.mode === "playing";
  note.classList.toggle("menu", !showPlayHints);
  note.classList.toggle("compact", showPlayHints);
  note.classList.toggle("countdown", isBattleCountdownActive());
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
      vy: p.vy + 0.08,
      life: p.life - dt,
    }))
    .filter((p) => p.life > 0);
}

function draw() {
  resetCanvasFrame();
  ctx.save();
  try {
    const jitter = state.shake ? Math.sin(performance.now() * 0.06) * state.shake : 0;
    ctx.translate(jitter, 0);
    drawBackground();
    drawPanels();
    drawPlayer();
    drawEnemy();
    drawBoard();
    drawSidePieces();
    drawAttackEffects();
    drawBursts();
    drawParticles();
    drawFloaters();
    drawCombatPopups();
    drawBattleCountdown();
    drawTutorialPrompt();
    drawOverlay();
    if (!["start", "guide", "upgrade", "victory", "defeat"].includes(state.mode)) drawSettings();
    drawPerfectClearFx();
  } finally {
    ctx.restore();
    resetCanvasTransform();
  }
}

function resetCanvasFrame() {
  // Recover from any leaked canvas state after a draw error, then clear the frame.
  for (let i = 0; i < 24; i += 1) ctx.restore();
  resetCanvasTransform();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
  ctx.lineWidth = 1;
  ctx.clearRect(0, 0, W, H);
}

function resetCanvasTransform() {
  if (typeof ctx.setTransform === "function") {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  } else if (typeof ctx.resetTransform === "function") {
    ctx.resetTransform();
  }
}

function drawBackground() {
  if (forestBg.complete && forestBg.naturalWidth > 0) {
    ctx.drawImage(forestBg, 0, 0, W, H);
    ctx.fillStyle = "rgba(4, 7, 12, 0.72)";
    ctx.fillRect(0, 0, W, H);
    drawVignette();
    return;
  }

  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#14202d");
  g.addColorStop(0.46, "#172a25");
  g.addColorStop(1, "#0c1114");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(62, 92, 90, 0.38)";
  for (let i = 0; i < 6; i += 1) {
    const x = 60 + i * 235;
    drawTree(x, 95 + (i % 2) * 35, 190 + (i % 3) * 34, 0.48);
  }
  ctx.fillStyle = "rgba(28, 43, 38, 0.72)";
  for (let i = 0; i < 8; i += 1) {
    drawTree(-70 + i * 190, 210 + (i % 2) * 12, 260, 0.9);
  }

  ctx.fillStyle = "#111716";
  ctx.beginPath();
  ctx.moveTo(0, 613);
  ctx.bezierCurveTo(240, 570, 420, 642, 660, 590);
  ctx.bezierCurveTo(900, 540, 1090, 602, 1280, 566);
  ctx.lineTo(1280, 720);
  ctx.lineTo(0, 720);
  ctx.closePath();
  ctx.fill();

  drawMushrooms();
  drawRunes();
  drawVignette();
}

function drawTree(x, y, h, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#111b1a";
  ctx.beginPath();
  ctx.moveTo(x + 48, y + h);
  ctx.bezierCurveTo(x + 28, y + h * 0.62, x + 62, y + h * 0.32, x + 35, y);
  ctx.bezierCurveTo(x + 84, y + h * 0.32, x + 64, y + h * 0.72, x + 86, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(130, 151, 151, 0.22)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function drawMushrooms() {
  const spots = [
    [116, 594, 0.9],
    [370, 626, 0.65],
    [1116, 580, 1.0],
    [1212, 610, 0.72],
  ];
  for (const [x, y, s] of spots) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = "rgba(123, 228, 198, 0.18)";
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#abc9b7";
    ctx.fillRect(-5, -8, 10, 24);
    ctx.fillStyle = "#73d4bd";
    ctx.beginPath();
    ctx.arc(0, -10, 22, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawRunes() {
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

function drawVignette() {
  const g = ctx.createRadialGradient(W / 2, H / 2, 180, W / 2, H / 2, 720);
  g.addColorStop(0, "rgba(0, 0, 0, 0)");
  g.addColorStop(0.58, "rgba(0, 0, 0, 0.16)");
  g.addColorStop(1, "rgba(0, 0, 0, 0.78)");
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
  ctx.font = "900 28px Georgia, Trebuchet MS, serif";
  ctx.shadowColor = "rgba(175, 112, 255, 0.38)";
  ctx.shadowBlur = 14;
  const g = ctx.createLinearGradient(48, 20, 318, 48);
  g.addColorStop(0, "#f9f5e6");
  g.addColorStop(0.45, "#ffe0a3");
  g.addColorStop(1, "#c7a7ff");
  ctx.fillStyle = g;
  ctx.fillText(t("startTitle"), 48, 40);
  ctx.font = "700 13px Trebuchet MS";
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
  g.addColorStop(0, "rgba(6, 11, 20, 0.66)");
  g.addColorStop(0.52, "rgba(4, 7, 13, 0.58)");
  g.addColorStop(1, "rgba(20, 13, 31, 0.54)");
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
  ctx.fillStyle = "rgba(126, 231, 255, 0.02)";
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
  ctx.font = "800 12px Trebuchet MS";
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
  ctx.save();
  ctx.fillStyle = "rgba(4, 7, 14, 0.8)";
  roundedRect(438, 15, 404, 30, 10, true, false);
  ctx.strokeStyle = "rgba(255, 210, 128, 0.28)";
  ctx.lineWidth = 1.5;
  roundedRect(438, 15, 404, 30, 10, false, true);
  ctx.font = "800 15px Trebuchet MS";
  ctx.fillStyle = "#d7c2ff";
  ctx.fillText(t("topQuest").toUpperCase(), 484, 36);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(238,244,252,0.58)";
  ctx.fillText(`${t("waveLabel")} ${state.wave}`, 818, 36);
  ctx.fillStyle = "#ffb95f";
  ctx.beginPath();
  ctx.arc(461, 30, 7, 0, Math.PI * 2);
  ctx.fill();
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
  drawBuildChip(left, panel.y + 156, innerW);
  ctx.save();
  drawStageGlow(stage.x + stage.w / 2, stage.y + 322, 164, "#6de8ff");
  drawPresentationSigil(stage.x + stage.w / 2, stage.y + 318, 128, "#6de8ff");
  ctx.translate(stage.x + stage.w / 2, stage.y + 236);
  if (hit) ctx.translate(-10, 0);
  const bob = Math.sin(performance.now() * 0.0025) * 4;
  const attackMotion = playerAttack ? Math.sin((playerAttack.life / playerAttack.duration) * Math.PI) * 10 : 0;
  ctx.translate(attackMotion, bob);
  if (hit) ctx.scale(1.08, 0.92);
  ctx.scale(1.28, 1.28);
  drawCharacterShadow(0, 170, 128, "#6de8ff");
  drawHeroSprite(hit);
  if (playerAttack) drawNoaAttackPose(playerAttack);
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
  const ratio = state.maxGuard ? state.guard / state.maxGuard : 0;
  ctx.save();
  ctx.fillStyle = "rgba(7, 10, 16, 0.5)";
  roundedRect(x, y, w, 20, 6, true, false);
  ctx.fillStyle = "rgba(157, 247, 218, 0.22)";
  roundedRect(x, y, w * ratio, 20, 6, true, false);
  ctx.strokeStyle = "rgba(157, 247, 218, 0.3)";
  roundedRect(x, y, w, 20, 6, false, true);
  label(`${t("guardLabel")} ${state.guard}/${state.maxGuard}`, x + 10, y + 14, 11, state.guard > 0 ? "#9df7da" : "rgba(238,244,252,0.46)");
  ctx.restore();
}

function drawHeroSprite(hit) {
  ctx.save();
  ctx.shadowColor = "rgba(98, 221, 255, 0.45)";
  ctx.shadowBlur = 24;
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
  ctx.restore();
}

function drawHeroIdleBase() {
  if (heroMeleeSheet.complete && heroMeleeSheet.naturalWidth > 0) {
    drawSpriteSheetFrame(HERO_ANIMATIONS.melee, 0, -132, -222, 264, 410);
  } else if (heroIdleArt.complete && heroIdleArt.naturalWidth > 0) {
    // Concept sheet fallback: crop the clearest full-body pose from the lower stance strip.
    drawKeyedImageCropContain(heroIdleArt, 820, 1198, 178, 312, -114, -206, 228, 390, "idle-concept");
  } else if (rosterArt.complete && rosterArt.naturalWidth > 0) {
    drawRosterSprite("noa", -118, -214, 236, 402);
  } else if (noaArt.complete && noaArt.naturalWidth > 0) {
    drawImageContain(noaArt, -112, -210, 224, 392);
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
  const frameIndex = Math.min(config.frames.length - 1, Math.floor(elapsed / config.frameMs));
  if (config.image.complete && config.image.naturalWidth > 0) {
    const draw = config.draw || { x: -132, y: -222, w: 264, h: 410 };
    drawSpriteAnimationFrame(config, elapsed, draw.x, draw.y, draw.w, draw.h);
  } else {
    drawFallbackHeroAttackAnimation(state.heroAnimation.kind, elapsed / state.heroAnimation.duration, frameIndex);
  }
  return true;
}

function drawFallbackHeroAttackAnimation(kind, progress, frameIndex) {
  const meleeLike = kind === "melee" || kind === "ultimate" || kind.startsWith("combo");
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
  const slot = Math.floor(elapsed / config.frameMs);
  const frameIndex = Math.min(config.frames.length - 1, slot);
  const local = (elapsed % config.frameMs) / config.frameMs;
  const currentFrame = config.frames[frameIndex];
  const previousFrame = config.frames[Math.max(0, frameIndex - 1)];
  const nextFrame = config.frames[Math.min(config.frames.length - 1, frameIndex + 1)];
  const motion = String(config.id || "").startsWith("enemy") ? 7 : 10;
  if (previousFrame !== currentFrame && local < 0.42) {
    const ghostAlpha = (1 - local / 0.42) * 0.18;
    drawSpriteSheetFrame(config, previousFrame, x - motion * ghostAlpha, y, w, h, ghostAlpha);
  }
  drawSpriteSheetFrame(config, currentFrame, x, y, w, h);
  const blend = smoothstep(0.5, 1, local);
  if (blend > 0 && nextFrame !== currentFrame) {
    drawSpriteSheetFrame(config, nextFrame, x + motion * 0.04 * blend, y, w, h, blend * 0.48);
  }
}

function drawSpriteSheetFrame(config, frame, x, y, w, h, alpha = 1) {
  const img = config.image;
  const rect = getSpriteFrameRect(config, frame);
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

function getSpriteFrameRect(config, frame) {
  if (config.frameRects && config.frameRects[frame]) return config.frameRects[frame];
  const cols = config.columns;
  const cellW = config.image.naturalWidth / cols;
  const cellH = config.image.naturalHeight / config.rows;
  return {
    x: (frame % cols) * cellW,
    y: Math.floor(frame / cols) * cellH,
    w: cellW,
    h: cellH,
  };
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
  const enemy = state.enemyType;
  const panel = UI_LAYOUT.enemyPanel;
  const stage = UI_LAYOUT.enemyStage;
  const pad = UI_LAYOUT.panelPadding;
  const left = panel.x + pad;
  const innerW = panel.w - pad * 2;
  drawHpBar(left, panel.y + 84, innerW, 20, state.enemyHp, state.enemyMaxHp, hit ? "#fff2ad" : "#75e298", t("hp"));
  if (enemy.id === "king") drawBossPhaseBar(left, panel.y + 112);
  const intentY = panel.y + (enemy.id === "king" ? 130 : 118);
  drawEnemyIntent(left, intentY, getEnemyIntent(enemy), innerW);
  drawEnemyBehaviorChips(left, intentY + 96, enemy, innerW);
  ctx.save();
  drawStageGlow(stage.x + stage.w / 2, stage.y + 288, 184, enemy.color);
  drawPresentationSigil(stage.x + stage.w / 2, stage.y + 292, 150, enemy.color);
  ctx.translate(stage.x + stage.w / 2, stage.y + 238);
  if (hit) ctx.scale(1.08, 0.92);
  const pulse = 1 + Math.sin(performance.now() * 0.006) * 0.018;
  ctx.scale(pulse * 1.32, pulse * 1.32);
  drawCharacterShadow(0, 116, 140, enemy.color);
  if (drawEnemyAttackAnimationFrame(enemy, hit)) {
    // Attack animations use the enemy concept sheet attack vignettes.
  } else if (drawEnemyConceptArt(enemy, hit)) {
    // Project-local concept sheets are now the primary enemy source.
  } else if (rosterArt.complete && rosterArt.naturalWidth > 0) {
    ctx.save();
    ctx.shadowColor = hexToRgba(enemy.color, 0.55);
    ctx.shadowBlur = hit ? 34 : 22;
    if (hit) {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.88;
    }
    const tall = enemy.id === "vine" || enemy.id === "king" || enemy.id === "mist";
    drawRosterSprite(enemy.id, tall ? -132 : -126, tall ? -158 : -132, tall ? 264 : 252, tall ? 260 : 222);
    ctx.restore();
  } else if (enemy.id !== "slime") {
    drawEnemySilhouette(enemy, hit);
  } else if (slimeArt.complete && slimeArt.naturalWidth > 0) {
    ctx.save();
    ctx.shadowColor = hexToRgba(enemy.color, 0.55);
    ctx.shadowBlur = hit ? 34 : 22;
    ctx.filter = enemy.filter;
    if (hit) {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.88;
    }
    drawImageContain(slimeArt, -122, -126, 244, 206);
    ctx.restore();
    drawEnemyOverlay(enemy);
  } else {
    drawSlimeFallback(hit);
  }
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
  const sheet = enemy.artSheet === "enemy02" ? enemyConceptSheetB : enemyConceptSheetA;
  if (!sheet.complete || sheet.naturalWidth <= 0 || !enemy.artRect) return false;
  const rect = enemy.artRect;
  const draw = enemy.artDraw || { x: -130, y: -150, w: 260, h: 240 };
  ctx.save();
  ctx.shadowColor = hexToRgba(enemy.color, hit ? 0.82 : 0.56);
  ctx.shadowBlur = hit ? 36 : 22;
  ctx.filter = enemy.filter;
  if (hit) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.88;
  }
  drawKeyedImageCropContain(sheet, rect.x, rect.y, rect.w, rect.h, draw.x, draw.y, draw.w, draw.h, enemy.artKey || enemy.id);
  ctx.restore();
  return true;
}

function drawEnemyAttackAnimationFrame(enemy, hit) {
  if (!state.enemyAnimation || state.enemyAnimation.kind !== enemy.id) return false;
  const config = ENEMY_ATTACK_ANIMATIONS[enemy.id];
  if (!config) return false;
  const elapsed = performance.now() - state.enemyAnimation.startedAt;
  if (elapsed >= state.enemyAnimation.duration) {
    state.enemyAnimation = null;
    return false;
  }
  const draw = config.draw || enemy.artDraw || { x: -140, y: -150, w: 280, h: 240 };
  ctx.save();
  const anticipation = Math.sin((elapsed / state.enemyAnimation.duration) * Math.PI);
  ctx.translate(anticipation * (enemy.id === "beetle" || enemy.id === "vine" ? -10 : 0), anticipation * -4);
  ctx.shadowColor = hexToRgba(enemy.color, hit ? 0.86 : 0.62);
  ctx.shadowBlur = hit ? 38 : 26;
  ctx.filter = config.noKeying ? "none" : enemy.filter;
  if (hit) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.9;
  }
  if (config.image) {
    if (!config.image.complete || config.image.naturalWidth <= 0) {
      ctx.restore();
      return false;
    }
    drawSpriteAnimationFrame(config, elapsed, draw.x, draw.y, draw.w, draw.h);
    ctx.restore();
    return true;
  }

  const sheet = config.sheet === "enemy02" ? enemyConceptSheetB : enemyConceptSheetA;
  if (!sheet.complete || sheet.naturalWidth <= 0) {
    ctx.restore();
    return false;
  }
  const frameIndex = Math.min(config.frames.length - 1, Math.floor(elapsed / config.frameMs));
  const local = (elapsed % config.frameMs) / config.frameMs;
  const rect = config.frames[frameIndex];
  const nextFrameIndex = Math.min(config.frames.length - 1, frameIndex + 1);
  const nextRect = config.frames[nextFrameIndex];
  drawKeyedImageCropContain(
    sheet,
    rect.x,
    rect.y,
    rect.w,
    rect.h,
    draw.x,
    draw.y,
    draw.w,
    draw.h,
    `${enemy.artKey || enemy.id}-attack-${frameIndex}`
  );
  const blend = clamp((local - 0.68) / 0.32, 0, 1);
  if (blend > 0 && nextFrameIndex !== frameIndex) {
    drawKeyedImageCropContain(
      sheet,
      nextRect.x,
      nextRect.y,
      nextRect.w,
      nextRect.h,
      draw.x,
      draw.y,
      draw.w,
      draw.h,
      `${enemy.artKey || enemy.id}-attack-${nextFrameIndex}`,
      blend * 0.36
    );
  }
  ctx.restore();
  return true;
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
    king: "B",
  }[enemy.id] || "!";
  if (enemy.id === "mushroom") {
    return { icon, title: t("intentSporeHex"), detail: `${fmt("intentSporeHexDetail", { damage: state.enemyAttackDamage })} / ${cancelText}`, color: "#77e8ff" };
  }
  if (enemy.id === "beetle") {
    return { icon, title: t("intentArmorCrush"), detail: `${fmt("intentArmorCrushDetail", { damage: state.enemyAttackDamage, garbage })} / ${cancelText}`, color: "#c6b38a" };
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
  ctx.font = "900 18px Trebuchet MS";
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

function drawHpBar(x, y, w, h, value, max, color, caption) {
  const ratio = max ? clamp(value / max, 0, 1) : 0;
  const valueText = `${value}/${max}`;
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  roundedRect(x, y, w, h, 7, true, false);
  const g = ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0, color);
  g.addColorStop(1, ratio < 0.35 ? "#ff7782" : "#8ff1d2");
  ctx.fillStyle = g;
  roundedRect(x, y, Math.max(0, w * ratio), h, 7, true, false);
  ctx.strokeStyle = "rgba(241,244,250,0.34)";
  ctx.lineWidth = 2;
  roundedRect(x, y, w, h, 7, false, true);
  ctx.textBaseline = "middle";
  ctx.font = "800 11px Trebuchet MS";
  ctx.fillStyle = "rgba(8, 11, 18, 0.78)";
  ctx.fillText(caption, x + 10, y + h / 2 + 1);
  ctx.font = "800 12px Trebuchet MS";
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
  ctx.font = "800 12px Trebuchet MS";
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
  ctx.font = "800 12px Trebuchet MS";
  ctx.fillStyle = danger ? "#ffb7bd" : "rgba(216, 238, 229, 0.72)";
  ctx.fillText(t("enemyStrike").toUpperCase(), x + 12, y + 14);
  ctx.font = "900 22px Trebuchet MS";
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
    const flashX = state.ultimateActive ? ULTIMATE_WELL_START * TILE : 0;
    const flashW = state.ultimateActive ? ULTIMATE_WELL_WIDTH * TILE : COLS * TILE;
    ctx.fillRect(flashX, y, flashW, TILE);
  }
  ctx.restore();
  drawIncomingGarbageMeter();
}

function drawUltimateWellMask() {
  if (!state.ultimateActive) return;
  const wellX = ULTIMATE_WELL_START * TILE;
  const wellW = ULTIMATE_WELL_WIDTH * TILE;
  const leftW = wellX;
  const rightX = wellX + wellW;
  ctx.save();
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
  drawUltimateCountdownBar();
  ctx.restore();
}

function drawUltimateCountdownBar() {
  const meter = UI_LAYOUT.ultimateMeter;
  const total = Math.max(1, state.ultimateTimerMax || ULTIMATE_DURATION_MS);
  const remaining = Math.max(0, state.ultimateTimer);
  const ratio = clamp(remaining / total, 0, 1);
  const secondsText = `${Math.max(0, Math.ceil(remaining / 1000))}s`;
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

  ctx.font = "900 12px Trebuchet MS";
  ctx.textAlign = "left";
  ctx.fillStyle = danger ? "#ff9aa2" : "#ffbe5f";
  ctx.shadowColor = danger ? "#ff7782" : "#ffbe5f";
  ctx.shadowBlur = danger ? 12 : 8;
  ctx.fillText("4-WIDE", meter.x + 12, meter.y + 17);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  roundedRect(barX, barY, barW, barH, 8, true, false);
  const fillW = Math.max(4, barW * ratio);
  const g = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  g.addColorStop(0, danger ? "#ff7782" : "#d7c2ff");
  g.addColorStop(0.58, danger ? "#ffbe5f" : "#ffbe5f");
  g.addColorStop(1, "#8fe8dc");
  ctx.fillStyle = g;
  roundedRect(barX, barY, fillW, barH, 8, true, false);
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.fillRect(barX + 2, barY + 2, Math.max(0, fillW - 4), 1);

  ctx.font = "900 13px Trebuchet MS";
  ctx.textAlign = "right";
  ctx.fillStyle = danger ? "#ffb7bd" : "#f5f1e6";
  ctx.fillText(secondsText, meter.x + meter.w - 12, meter.y + 18);
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
  for (let r = 0; r < piece.shape.length; r += 1) {
    for (let c = 0; c < piece.shape[r].length; c += 1) {
      if (!piece.shape[r][c]) continue;
      const y = piece.y + r - HIDDEN;
      const x = piece.x + c;
      if (y < 0) continue;
      drawBlock(x * TILE, y * TILE, ghost ? "rgba(228,235,245,0.16)" : COLORS[piece.type], ghost);
    }
  }
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
  const w = 88;
  const h = 90;
  ctx.fillStyle = "rgba(3, 5, 10, 0.62)";
  roundedRect(HOLD_PANEL_X, HOLD_PANEL_Y, w, h, 14, true, false);
  ctx.strokeStyle = state.canHold ? "rgba(255, 224, 162, 0.38)" : "rgba(223, 243, 255, 0.12)";
  ctx.lineWidth = 1.3;
  roundedRect(HOLD_PANEL_X, HOLD_PANEL_Y, w, h, 14, false, true);
  label(t("hold").toUpperCase(), HOLD_PANEL_X + 11, HOLD_PANEL_Y + 22, 13, state.canHold ? "#ffe0a3" : "rgba(245,241,230,0.42)");
  ctx.fillStyle = "rgba(126, 231, 255, 0.035)";
  roundedRect(HOLD_PANEL_X + 10, HOLD_PANEL_Y + 33, w - 20, 44, 10, true, false);
  drawMiniPiece(state.hold, HOLD_PANEL_X + 14, HOLD_PANEL_Y + 44, 10, 60, 34);
  ctx.restore();
}

function drawNextQueuePanel() {
  ctx.save();
  const w = 78;
  const h = 292;
  ctx.fillStyle = "rgba(3, 5, 10, 0.62)";
  roundedRect(NEXT_PANEL_X, NEXT_PANEL_Y, w, h, 14, true, false);
  ctx.strokeStyle = "rgba(255, 224, 162, 0.38)";
  ctx.lineWidth = 1.3;
  roundedRect(NEXT_PANEL_X, NEXT_PANEL_Y, w, h, 14, false, true);
  label(t("next").toUpperCase(), NEXT_PANEL_X + 11, NEXT_PANEL_Y + 22, 13, "#ffe0a3");
  for (let i = 0; i < 4; i += 1) {
    ctx.fillStyle = "rgba(126, 231, 255, 0.03)";
    roundedRect(NEXT_PANEL_X + 9, NEXT_PANEL_Y + 34 + i * 58, w - 18, 46, 9, true, false);
    drawMiniPiece(state.queue[i], NEXT_PANEL_X + 13, NEXT_PANEL_Y + 46 + i * 58, 9.5, 52, 32);
  }
  if (state.queueHex > 0) {
    ctx.fillStyle = "rgba(119, 232, 255, 0.11)";
    roundedRect(NEXT_PANEL_X + 8, NEXT_PANEL_Y + h - 31, w - 16, 20, 8, true, false);
    label(`${t("hex").toUpperCase()} ${state.queueHex}`, NEXT_PANEL_X + 13, NEXT_PANEL_Y + h - 17, 10, "#77e8ff");
  }
  ctx.restore();
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
    ctx.font = `${i === 0 ? "900" : "800"} ${titleSize}px Trebuchet MS`;
    ctx.textAlign = "left";
    ctx.fillText(readout.title, x + 10, yy - 7);
    ctx.font = "800 12px Trebuchet MS";
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
  const melee = attack.heroStyle === "melee" || attack.heroStyle === "ultimate" || String(attack.heroStyle || "").startsWith("combo");
  const glow =
    special === "perfect" ? "#8ff7ff" :
    special === "combo" ? "#ffbe5f" :
    special === "spin" ? "#caa2ff" :
    special === "b2b" || special === "tetris" ? "#ffbe5f" :
    "#9fb4ff";
  const core = special === "perfect" ? "#ffffff" : special === "combo" ? "#fff0a6" : special === "spin" ? "#f1d36b" : "#d9f0ff";
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
  if (t > 0.78) drawImpactBurst(attack.x1, attack.y1, glow, t, special);
  ctx.restore();
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
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const kind = attack.attackKind || "slime";
  const palette = {
    vine: "#9de06c",
    mushroom: "#b690ff",
    beetle: "#c6b38a",
    mist: "#d2ceff",
    king: "#ffb95f",
    slime: "#82f28f",
  };
  const color = palette[kind] || palette.slime;
  const garbageAttack = ["vine", "mushroom", "beetle", "mist", "king"].includes(kind);
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
  } else if (kind === "mushroom") {
    ctx.fillStyle = hexToRgba(color, 0.72);
    for (let i = 0; i < 10; i += 1) {
      const a = t * 8 + i * 1.9;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * (14 + i * 2), y + Math.sin(a) * 16, 3 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === "mist") {
    ctx.strokeStyle = hexToRgba(color, 0.64);
    ctx.lineWidth = 5;
    for (let i = 0; i < 2; i += 1) {
      ctx.beginPath();
      ctx.ellipse(x, y + i * 8, 30 + t * 10, 12, t * 5 + i, 0, Math.PI * 1.8);
      ctx.stroke();
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
  if (t > 0.78) drawImpactBurst(attack.x1, attack.y1, garbageAttack ? color : "#ff7782", t, kind);
  ctx.restore();
}

function drawImpactBurst(x, y, color, t, kind = "clear") {
  const k = Math.min(1, (t - 0.78) / 0.22);
  const strong = kind === "perfect" || kind === "spin" || kind === "b2b" || kind === "combo" || kind === "king";
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
  ctx.fillStyle = `rgba(2, 3, 10, ${0.58 * alpha})`;
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

  if (heroUltimateSheet.complete && heroUltimateSheet.naturalWidth > 0) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.96 * alpha;
    ctx.shadowColor = "rgba(199, 167, 255, 0.9)";
    ctx.shadowBlur = 36 + burst * 28;
    const heroW = 430 + burst * 34;
    const heroH = 532 + burst * 42;
    drawSpriteAnimationFrame(HERO_ANIMATIONS.ultimate, elapsed, 72, 116 - burst * 16, heroW, heroH);
    ctx.restore();
  }

  ctx.globalCompositeOperation = "source-over";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(255, 240, 166, 0.9)";
  ctx.shadowBlur = 26 + burst * 24;
  ctx.font = "900 64px Georgia, Trebuchet MS, serif";
  const titleY = 132 + Math.sin(progress * Math.PI) * -8;
  const titleGradient = ctx.createLinearGradient(380, titleY - 54, 900, titleY + 18);
  titleGradient.addColorStop(0, "#ffffff");
  titleGradient.addColorStop(0.5, "#fff0a6");
  titleGradient.addColorStop(1, "#8ff7ff");
  ctx.fillStyle = titleGradient;
  ctx.globalAlpha = alpha;
  ctx.fillText(t("perfectClearTitle"), W / 2, titleY);
  ctx.font = "900 22px Trebuchet MS";
  ctx.fillStyle = "#d7c2ff";
  ctx.fillText(t("perfectClearSubtitle").toUpperCase(), W / 2, titleY + 34);
  ctx.font = "900 28px Trebuchet MS";
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
    ctx.globalAlpha = Math.min(0.72, p.life / 260);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawMiniPiece(type, x, y, size = 14, boxW = 92, boxH = 58) {
  ctx.save();
  ctx.fillStyle = "rgba(5,8,12,0.66)";
  roundedRect(x - 8, y - 8, boxW, boxH, 6, true, false);
  ctx.strokeStyle = "rgba(152, 228, 235, 0.16)";
  ctx.lineWidth = 1.5;
  roundedRect(x - 8, y - 8, boxW, boxH, 6, false, true);
  if (type) {
    const shape = PIECES[type];
    const offX = x + (boxW - 16 - shape[0].length * size) / 2;
    const offY = y + (boxH - 16 - shape.length * size) / 2;
    for (let r = 0; r < shape.length; r += 1) {
      for (let c = 0; c < shape[r].length; c += 1) {
        if (shape[r][c]) drawBlock(offX + c * size, offY + r * size, COLORS[type], false, size);
      }
    }
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
  const titleSize = perfect ? 36 : big ? 34 : popup.type === "b2b" ? 28 : 24;
  const subSize = perfect ? 17 : 20;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(perfect ? 0 : -0.08);
  ctx.scale(scale, scale);
  ctx.globalCompositeOperation = "lighter";

  drawCombatPopupGlyphs(popup, progress, primary, accent);
  drawCombatPopupTrail(popup, primary, accent, progress);

  ctx.shadowColor = primary;
  ctx.shadowBlur = perfect ? 28 : big ? 24 : 16;
  ctx.lineWidth = perfect ? 5 : big ? 4 : 3;
  ctx.strokeStyle = hexToRgba(accent, 0.68);
  ctx.font = `900 ${titleSize}px Georgia, Trebuchet MS, serif`;
  ctx.strokeText(popup.text, 0, 0);

  const gradient = ctx.createLinearGradient(0, -titleSize, 220, 8);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.5, primary);
  gradient.addColorStop(1, accent);
  ctx.fillStyle = gradient;
  ctx.fillText(popup.text, 0, 0);

  if (popup.subText) {
    ctx.shadowBlur = 16;
    ctx.font = `900 ${subSize}px Georgia, Trebuchet MS, serif`;
    ctx.strokeStyle = "rgba(10, 8, 24, 0.64)";
    ctx.lineWidth = 3;
    ctx.strokeText(popup.subText, 4, subSize + 14);
    ctx.fillStyle = popup.type === "b2b" ? "#fff0a6" : "#f5d6ff";
    ctx.fillText(popup.subText, 4, subSize + 14);
  }
  ctx.restore();
}

function drawCombatPopupTrail(popup, primary, accent, progress) {
  const lineCount = popup.type === "perfect" ? 5 : popup.type === "lineClear" ? 2 : 4;
  for (let i = 0; i < lineCount; i += 1) {
    const offset = i * 12;
    ctx.strokeStyle = hexToRgba(i % 2 ? accent : primary, 0.42 * (1 - progress));
    ctx.lineWidth = popup.type === "perfect" ? 2.4 : 1.8;
    ctx.beginPath();
    ctx.moveTo(-72 - offset, 10 + i * 8);
    ctx.quadraticCurveTo(-30 - offset * 0.4, -8 - i * 4, 142 + offset * 0.2, -28 + i * 10);
    ctx.stroke();
  }
}

function drawCombatPopupGlyphs(popup, progress, primary, accent) {
  const sparkCount = popup.type === "perfect" ? 16 : popup.type === "lineClear" ? 6 : 10;
  const orbit = popup.type === "perfect" ? 86 : 58;
  for (let i = 0; i < sparkCount; i += 1) {
    const angle = popup.seed + i * 2.399 + progress * 1.6;
    const radius = orbit + Math.sin(progress * Math.PI + i) * 12;
    const sx = Math.cos(angle) * radius + 64;
    const sy = Math.sin(angle) * radius * 0.44 - 18;
    const size = (popup.type === "perfect" ? 4.2 : 3.2) * (0.35 + (1 - progress) * 0.65);
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle);
    ctx.fillStyle = i % 3 === 0 ? accent : primary;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 12;
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

function drawDimOverlay(alpha = 0.76) {
  ctx.save();
  ctx.fillStyle = `rgba(2, 4, 8, ${alpha})`;
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 620);
  g.addColorStop(0, "rgba(48, 34, 70, 0.1)");
  g.addColorStop(0.62, "rgba(0, 0, 0, 0.2)");
  g.addColorStop(1, "rgba(0, 0, 0, 0.58)");
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
  ctx.font = numeric ? "900 76px Georgia, Trebuchet MS, serif" : "900 42px Georgia, Trebuchet MS, serif";
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

function drawStartMenuOverlay() {
  const m = UI_LAYOUT.menu;
  const pad = m.padding || 36;
  const bx = m.x + pad;
  const bw = m.w - pad * 2;
  drawMainMenuScene();
  drawMenuHeroShowcase();
  ctx.save();
  ctx.textAlign = "left";
  ctx.shadowColor = "rgba(190, 140, 255, 0.58)";
  ctx.shadowBlur = 24;
  ctx.font = "900 70px Georgia, Trebuchet MS, serif";
  const titleGradient = ctx.createLinearGradient(72, 48, 540, 166);
  titleGradient.addColorStop(0, "#fff8dc");
  titleGradient.addColorStop(0.52, "#ffe0a3");
  titleGradient.addColorStop(1, "#d7c2ff");
  ctx.fillStyle = titleGradient;
  const titleParts = t("startTitle").split(" ");
  ctx.fillText(titleParts[0] || t("startTitle"), 72, 92);
  ctx.fillText(titleParts.slice(1).join(" ") || "", 72, 152);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(215, 194, 255, 0.28)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(92, 178);
  ctx.lineTo(410, 178);
  ctx.stroke();
  label(t("startTagline").toUpperCase(), 106, 210, 17, "#d7c2ff");
  wrapText(t("startWorldHint"), 106, 246, 360, 22, "rgba(238,244,252,0.7)", 15);

  drawCard(m.x, m.y, m.w, m.h);
  drawCornerGlyph(m.x + m.w / 2, m.y - 2, "#9fb4ff");
  label(t("menuActions").toUpperCase(), bx, m.y + 58, 15, "#fff0a6");
  wrapText(t("startPanelHint"), bx, m.y + 92, bw, 21, "rgba(238,244,252,0.58)", 13);
  drawMenuButton(bx, m.primaryY, bw, m.primaryH, t("startGame"), "Enter", "primary");
  drawMenuButton(bx, m.tutorialY, bw, m.buttonH, t("tutorialStart"), t("tutorialHintShort"));
  drawMenuButton(bx, m.utilityY, bw, m.buttonH, t("settings"), "");
  drawMenuButton(bx, m.utilityY + m.buttonH + m.buttonGap, bw, m.buttonH, t("moveGuide"), "Spin");
  label(t("startHint"), bx, m.y + m.h - 42, 13, "#9fb4ff");
  ctx.restore();
}

function drawMainMenuScene() {
  ctx.save();
  if (forestBg.complete && forestBg.naturalWidth > 0) ctx.drawImage(forestBg, 0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "rgba(3, 6, 14, 0.74)");
  g.addColorStop(0.46, "rgba(4, 7, 14, 0.48)");
  g.addColorStop(1, "rgba(1, 2, 6, 0.92)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  drawMenuAmbientRift();
  ctx.strokeStyle = "rgba(255, 240, 166, 0.18)";
  ctx.beginPath();
  ctx.moveTo(86, 642);
  ctx.bezierCurveTo(262, 602, 462, 674, 700, 614);
  ctx.stroke();
  ctx.restore();
}

function drawMenuAmbientRift() {
  const now = performance.now() * 0.001;
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
}

function drawMenuHeroShowcase() {
  const now = performance.now();
  const pose = getMenuIdlePose(now);
  const motion = getMenuIdleMotion(pose, now);
  const hero = UI_LAYOUT.menuHero;
  const anchorX = hero.x;
  const anchorY = hero.y;
  drawMenuIdleParticles(anchorX, anchorY, pose, motion, now);
  ctx.save();
  ctx.translate(anchorX + motion.x, anchorY + motion.y);
  ctx.rotate(motion.rotate);
  ctx.scale(hero.scale * motion.scaleX, hero.scale * motion.scaleY);
  drawCharacterShadow(0, 174, 146 + motion.shadow, "#6de8ff");
  if (motion.afterimage > 0.02) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = motion.afterimage;
    ctx.translate(-motion.x * 0.55 - 3, 2);
    ctx.scale(1.01, 1);
    drawHeroIdleBase();
    ctx.restore();
  }
  drawHeroIdleBase();
  drawMenuCloakSway(motion, now);
  drawMenuWeaponPulse(motion, now);
  drawMenuEyeGlow(motion, now);
  drawMenuIdleAura(motion, now);
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
  const breath = Math.sin(time * 2.15);
  const slowBreath = Math.sin(time * 1.1);
  const focus = pose.intensity * Math.sin(pose.progress * Math.PI);
  const motion = {
    x: slowBreath * 0.8,
    y: breath * 3.2,
    rotate: slowBreath * 0.006,
    scaleX: 1 - breath * 0.004,
    scaleY: 1 + breath * 0.01,
    weapon: 0.48 + (Math.sin(time * 3.4) + 1) * 0.12,
    eye: 0.18,
    cloak: 0.34 + (Math.sin(time * 1.55) + 1) * 0.18,
    shadow: breath * 4,
    afterimage: 0,
    particles: 0.34,
  };

  if (pose.id === "idleB") {
    motion.x -= focus * 4.5;
    motion.y += focus * 5;
    motion.rotate += focus * 0.04;
    motion.scaleY -= focus * 0.012;
    motion.weapon += focus * 0.52;
    motion.eye += focus * 0.1;
    motion.cloak += focus * 0.24;
    motion.particles += focus * 0.38;
  } else if (pose.id === "idleC") {
    motion.y -= focus * 6;
    motion.rotate -= focus * 0.018;
    motion.scaleY += focus * 0.014;
    motion.weapon += focus * 0.18;
    motion.eye += focus * 0.74;
    motion.cloak += focus * 0.18;
    motion.particles += focus * 0.28;
  } else if (pose.id === "idleD") {
    const shift = Math.sin(pose.progress * Math.PI * 2);
    const settle = Math.sin(pose.progress * Math.PI);
    motion.x += shift * 8 * pose.intensity;
    motion.y += settle * 2.5;
    motion.rotate += shift * 0.035 * pose.intensity;
    motion.scaleX += Math.abs(shift) * 0.016;
    motion.scaleY -= Math.abs(shift) * 0.008;
    motion.weapon += settle * 0.22;
    motion.eye += settle * 0.18;
    motion.cloak += Math.abs(shift) * 0.46;
    motion.afterimage = Math.abs(shift) * 0.1;
    motion.particles += settle * 0.22;
  }

  return motion;
}

function drawMenuCloakSway(motion, now) {
  const time = now * 0.001;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  for (let i = 0; i < 4; i += 1) {
    const sway = Math.sin(time * 1.7 + i * 0.8) * 7 * motion.cloak;
    ctx.globalAlpha = 0.06 + motion.cloak * 0.045;
    ctx.strokeStyle = i % 2 ? "rgba(121, 230, 255, 0.52)" : "rgba(190, 126, 255, 0.55)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-74 + i * 42, 22);
    ctx.quadraticCurveTo(-88 + i * 44 + sway, 86, -68 + i * 40 - sway * 0.45, 164);
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
  ctx.shadowBlur = 10 + pulse * 10;
  const coreX = -52 + Math.sin(time * 2.2) * 1.6;
  const coreY = 76 + Math.cos(time * 1.8) * 1.2;
  const aura = 18 + pulse * 8;
  const glow = ctx.createRadialGradient(coreX, coreY, 3, coreX, coreY, aura);
  glow.addColorStop(0, `rgba(244, 232, 255, ${0.34 + pulse * 0.18})`);
  glow.addColorStop(0.42, `rgba(154, 84, 255, ${0.16 + pulse * 0.12})`);
  glow.addColorStop(1, "rgba(154, 84, 255, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(coreX, coreY, aura, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.18 + pulse * 0.14;
  ctx.fillStyle = "#d7b8ff";
  ctx.fillRect(coreX - 4, coreY - 4, 8, 8);
  for (let i = 0; i < 6; i += 1) {
    const p = (time * 0.34 + i * 0.21) % 1;
    const angle = i * 1.48 + time * 0.42;
    const radius = 10 + p * 30;
    const x = coreX + Math.cos(angle) * radius * 0.8;
    const y = coreY + Math.sin(angle) * radius * 0.5 - p * 10;
    ctx.globalAlpha = (0.12 + pulse * 0.12) * (1 - p);
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
  ctx.strokeStyle = `rgba(174, 123, 255, ${0.2 + motion.particles * 0.12})`;
  ctx.shadowColor = "#9b78ff";
  ctx.shadowBlur = 16;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 132, 66 + Math.sin(time * 1.4) * 4, 18, 0, Math.PI * 0.05, Math.PI * 1.86);
  ctx.stroke();
  ctx.restore();
}

function drawMenuIdleParticles(anchorX, anchorY, pose, motion, now) {
  const time = now * 0.001;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const count = 9 + Math.floor(motion.particles * 8);
  for (let i = 0; i < count; i += 1) {
    const drift = (time * (0.18 + i * 0.012) + i * 0.173) % 1;
    const angle = i * 1.78 + time * 0.32;
    const radius = 78 + (i % 4) * 22 + pose.intensity * 10;
    const x = anchorX - 18 + Math.cos(angle) * radius * 0.78;
    const y = anchorY + 108 - drift * 236 + Math.sin(angle * 1.3) * 18;
    ctx.globalAlpha = (0.12 + motion.particles * 0.16) * (1 - Math.abs(drift - 0.5));
    ctx.fillStyle = i % 3 === 0 ? "#7ff2ff" : i % 3 === 1 ? "#b889ff" : "#fff0a6";
    ctx.fillRect(x, y, 3 + (i % 2), 3 + (i % 2));
  }
  ctx.restore();
}

function drawOverlay() {
  if (state.mode === "playing") return;
  if (state.mode === "upgrade") {
    drawUpgradeOverlay();
    return;
  }
  if (state.mode === "art") state.mode = "start";
  if (state.mode === "guide") {
    drawMoveGuideOverlay();
    return;
  }
  if (state.mode === "paused") {
    drawPauseOverlay();
    return;
  }
  if (state.mode === "start") {
    drawStartMenuOverlay();
    if (state.settingsOpen) drawSettingsOverlay("start");
    return;
  }
  if (state.mode === "victory" || state.mode === "defeat") {
    drawResultOverlay();
    return;
  }
  ctx.save();
  drawDimOverlay(0.74);
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
    drawMenuButton(384, 386, 510, 44, t("tutorialStart"), "3 min");
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
  const victory = state.mode === "victory";
  const accent = victory ? "#fff0a6" : "#ff8f98";
  ctx.save();
  drawDimOverlay(0.82);
  drawCard(318, 82, 644, 456);
  ctx.textAlign = "left";
  label(victory ? t("victory") : t("defeat"), 382, 154, 48, "#f5f1e6");
  ctx.fillStyle = accent;
  roundedRect(384, 176, 210, 4, 8, true, false);
  wrapText(getMessage(), 384, 206, 504, 28, "rgba(238,244,252,0.76)", 19);
  drawRunSummary();
  drawMenuButton(384, 468, 248, 44, t("retry"), "Enter", "primary");
  drawMenuButton(646, 468, 248, 44, t("menu"), "Esc");
  ctx.restore();
}

function drawPauseOverlay() {
  if (state.pauseView === "settings") {
    drawSettingsOverlay("pause");
    return;
  }
  const m = UI_LAYOUT.pauseMenu;
  ctx.save();
  drawDimOverlay(0.72);
  drawCard(m.x, m.y, m.w, m.h);
  label(t("pauseMenu"), m.x + 48, m.y + 76, 42, "#f5f1e6");
  wrapText(t("pauseMenuHint"), m.x + 50, m.y + 112, m.w - 100, 22, "rgba(238,244,252,0.62)", 15);
  drawMenuButton(m.x + 56, m.y + 156, m.w - 112, 48, t("resume"), formatControlKey(state.controls.pause), "primary");
  drawMenuButton(m.x + 56, m.y + 216, m.w - 112, 44, t("restart"), "Enter");
  drawMenuButton(m.x + 56, m.y + 270, m.w - 112, 44, t("settings"), "");
  drawMenuButton(m.x + 56, m.y + 324, m.w - 112, 44, t("menu"), "Esc");
  drawPauseStat(m.x + 58, m.y + 400, t("waveLabel"), state.wave);
  drawPauseStat(m.x + 252, m.y + 400, t("comboLabel"), state.combo);
  ctx.restore();
}

function drawSettingsOverlay(source = "pause") {
  const s = UI_LAYOUT.settings;
  ctx.save();
  drawDimOverlay(source === "start" ? 0.84 : 0.78);
  drawCard(s.x, s.y, s.w, s.h);
  label(t("settings"), s.x + 42, s.y + 58, 40, "#f5f1e6");
  const backText = source === "start" ? t("settingsBackMenu") : t("settingsBack");
  drawMenuButton(s.x + s.w - 216, s.y + 26, 172, 40, backText, "Esc");
  drawSettingsTabs(s.tabX, s.y + 112);
  drawSettingsContent(s.contentX, s.contentY);
  ctx.restore();
}

function drawSettingsTabs(x, y) {
  for (let i = 0; i < SETTINGS_TABS.length; i += 1) {
    const tab = SETTINGS_TABS[i];
    const active = state.settingsTab === tab;
    const yy = y + i * 62;
    ctx.save();
    ctx.fillStyle = active ? "rgba(183, 146, 255, 0.22)" : "rgba(8, 13, 20, 0.4)";
    roundedRect(x, yy, 164, 46, 12, true, false);
    ctx.strokeStyle = active ? "rgba(255, 240, 166, 0.54)" : "rgba(145, 232, 222, 0.14)";
    roundedRect(x, yy, 164, 46, 12, false, true);
    label(t(`settingsTab${tab[0].toUpperCase()}${tab.slice(1)}`), x + 22, yy + 29, 16, active ? "#fff0a6" : "rgba(238,244,252,0.64)");
    ctx.restore();
  }
}

function drawSettingsContent(x, y) {
  if (state.settingsTab === "general") {
    label(t("generalSettingsTitle"), x, y, 26, "#8fe8dc");
    drawSettingsInfoCard(x, y + 46, 420, 112, t("hudLayerTitle"), t("generalSettingsHelp"), "#7ef7ff");
    drawSettingsInfoCard(x, y + 184, 420, 98, t("hudMinimal"), t("hudFloatingText"), "#d7c2ff");
    drawSettingsInfoCard(x + 450, y + 46, 260, 98, t("startTitle"), t("startTagline"), "#fff0a6");
    drawSettingsInfoCard(x + 450, y + 166, 260, 116, t("moveGuide"), t("practiceHint"), "#9df7da");
    return;
  }
  if (state.settingsTab === "audio") {
    label(t("audioSettingsTitle"), x, y, 26, "#8fe8dc");
    drawSlider(t("master"), "masterVolume", x, y + 64, audio.masterVolume);
    drawSlider(t("music"), "musicVolume", x, y + 128, audio.musicVolume);
    drawSlider(t("sfx"), "sfxVolume", x, y + 192, audio.sfxVolume);
    drawToggle(x, y + 250, t("mute"), audio.muted);
    wrapText(t("audioMixHelp"), x, y + 316, 430, 18, "rgba(238,244,252,0.48)", 12);
    return;
  }
  if (state.settingsTab === "controls") {
    label(t("controlsSettingsTitle"), x, y, 26, "#8fe8dc");
    label(t("feel"), x, y + 46, 16, "#fff0a6");
    drawTuningSlider(t("das"), "das", x, y + 84);
    drawTuningSlider(t("arr"), "arr", x, y + 140);
    drawTuningSlider(t("softDropMs"), "softDrop", x, y + 196);
    drawTuningSlider(t("lockDelayMs"), "lockDelay", x, y + 252);
    wrapText(state.bindingAction ? t("binding") : t("bindHelp"), x + 412, y + 42, 370, 16, "rgba(238,244,252,0.56)", 12);
    drawControlGrid(x + 412, y + 72, 1, 304);
    return;
  }
  label(t("languageSettingsTitle"), x, y, 26, "#8fe8dc");
  drawLanguageToggle(x, y + 72);
  wrapText(t("languageHelp"), x, y + 142, 480, 22, "rgba(238,244,252,0.62)", 15);
}

function drawSettingsInfoCard(x, y, w, h, title, body, color) {
  ctx.save();
  ctx.fillStyle = "rgba(8, 13, 20, 0.52)";
  roundedRect(x, y, w, h, 12, true, false);
  ctx.strokeStyle = hexToRgba(color, 0.24);
  roundedRect(x, y, w, h, 12, false, true);
  label(String(title).toUpperCase(), x + 18, y + 30, 14, color);
  wrapText(body, x + 18, y + 58, w - 36, 20, "rgba(238,244,252,0.62)", 13);
  ctx.restore();
}

function drawPauseStat(x, y, name, value) {
  ctx.save();
  ctx.fillStyle = "rgba(8, 13, 20, 0.52)";
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
  ctx.fillStyle = "rgba(8, 13, 20, 0.52)";
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
  wrapText(buildDamageEquation(breakdown), x + 14, y + 62, w - 28, 14, "rgba(238,244,252,0.64)", 10);
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
  label(fmt("rating", { rating: state.stats.rating }), 384, 264, 23, getRatingColor(state.stats.rating));
  for (let i = 0; i < rows.length; i += 1) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 384 + col * 258;
    const y = 298 + row * 32;
    ctx.fillStyle = "rgba(8, 13, 20, 0.5)";
    roundedRect(x, y - 20, 244, 24, 6, true, false);
    label(rows[i][0], x + 12, y - 3, 13, "rgba(238,244,252,0.54)");
    label(String(rows[i][1]), x + 118, y - 3, 15, "#f5f1e6");
    if (rows[i][2]) label(rows[i][2], x + 168, y - 3, 11, "#9fb4ff");
  }
  label(t("summaryDamageSources"), 384, 436, 14, "#8fe8dc");
  wrapText(formatDamageSources(), 520, 436, 360, 18, "rgba(238,244,252,0.66)", 12);
  label(getNextRunGoalText(), 384, 458, 13, "#fff0a6");
  ctx.restore();
}

function getNextRunGoalText() {
  const currentPeak = Math.max(0, state.stats.peakWave || state.wave || 0);
  const nextBossWave = Math.max(20, Math.ceil((currentPeak + 1) / 10) * 10);
  return fmt("nextRunHookDynamic", { wave: nextBossWave });
}

function formatDamageSources() {
  const labels = {
    base: t("damageBase"),
    spin: "Spin",
    combo: "Combo",
    b2b: "B2B",
    perfect: "Perfect",
    weakness: t("enemyInfoWeakness"),
    upgrade: t("summaryUpgradeSource"),
  };
  const top = Object.entries(state.stats.damageSources || {})
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  if (!top.length) return "-";
  return top.map(([key, value]) => `${labels[key] || key} ${value}`).join(" / ");
}

function getRatingColor(rating) {
  if (rating === "PERFECT") return "#fff0a6";
  if (rating === "ARCANE") return "#d7c2ff";
  if (rating === "BRUTAL") return "#ff8f98";
  if (rating === "CLEAN") return "#9df7da";
  return "#f5f1e6";
}

function drawUpgradeOverlay() {
  ctx.save();
  ctx.fillStyle = "rgba(4, 6, 10, 0.76)";
  ctx.fillRect(0, 0, W, H);
  drawCard(286, 126, 708, 442);
  label(t("relicDraft").toUpperCase(), 348, 198, 35, "#f5f1e6");
  label(fmt("waveClearPick", { wave: state.wave - 1 }), 350, 230, 17, "rgba(238,244,252,0.62)");
  label(t("safeNodeDraft"), 350, 252, 13, "#9df7da");
  for (let i = 0; i < 3; i += 1) {
    const upgrade = state.upgradeChoices[i];
    if (!upgrade) continue;
    const rarity = RARITY[upgrade.rarity] || RARITY.common;
    const family = getUpgradeFamily(upgrade);
    const x = 342 + i * 204;
    const y = 292;
    const hovered = pointInRect(state.pointer.x, state.pointer.y, x, y, 180, 186);
    const cardG = ctx.createLinearGradient(x, y, x, y + 186);
    cardG.addColorStop(0, hovered ? hexToRgba(rarity.color, 0.22) : "rgba(13, 18, 28, 0.78)");
    cardG.addColorStop(1, hovered ? "rgba(33, 18, 46, 0.82)" : "rgba(7, 10, 16, 0.76)");
    ctx.fillStyle = cardG;
    roundedRect(x, y, 180, 186, 12, true, false);
    ctx.strokeStyle = hovered ? rarity.color : hexToRgba(rarity.color, 0.42);
    ctx.lineWidth = hovered ? 3 : 2;
    roundedRect(x, y, 180, 186, 12, false, true);
    drawUpgradeSigil(x + 90, y + 42, family.color, i + 1);
    label(rarityLabel(upgrade.rarity).toUpperCase(), x + 18, y + 28, 11, rarity.color);
    label(t(family.labelKey).toUpperCase(), x + 18, y + 48, 11, family.color);
    wrapText(upgradeName(upgrade), x + 18, y + 89, 142, 23, "#f5f1e6", 18);
    wrapText(upgradeText(upgrade), x + 18, y + 134, 142, 18, "rgba(238,244,252,0.64)", 12);
  }
  label(t("upgradeHelp"), 350, 522, 17, "#9fb4ff");
  ctx.restore();
}

function drawUpgradeSigil(x, y, color, number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = color;
  ctx.shadowBlur = 16;
  ctx.strokeStyle = hexToRgba(color, 0.72);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.rotate(Math.PI / 4);
  ctx.strokeRect(-13, -13, 26, 26);
  ctx.rotate(-Math.PI / 4);
  ctx.fillStyle = hexToRgba(color, 0.18);
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();
  label(String(number), -4, 5, 16, "#fff0a6");
  ctx.restore();
}

function getUpgradeFamily(upgrade) {
  if (["tspin_amp", "spin_circuit", "all_spin_codex"].includes(upgrade.id)) return BUILD_FAMILY.spin;
  if (["combo_clock", "combo_resonator", "tempo_engine"].includes(upgrade.id)) return BUILD_FAMILY.combo;
  if (["combo_aegis", "guard_lattice", "b2b_preserver"].includes(upgrade.id)) return BUILD_FAMILY.defense;
  if (["garbage_guard", "null_barrier"].includes(upgrade.id)) return BUILD_FAMILY.garbage;
  if (["b2b_blade", "bossbreaker_relic", "blade_polish", "stellar_caliber", "grey_star_reactor"].includes(upgrade.id)) return BUILD_FAMILY.burst;
  if (["star_mender", "aegis_shell", "vital_core", "recovery_glyph", "void_carapace", "arcane_suture", "spin_vamp"].includes(upgrade.id)) return BUILD_FAMILY.defense;
  return BUILD_FAMILY.burst;
}

function drawMoveGuideOverlay() {
  ctx.save();
  ctx.fillStyle = "rgba(4, 6, 10, 0.76)";
  ctx.fillRect(0, 0, W, H);
  drawCard(176, 70, 928, 580);
  label(t("moveGuide"), 232, 136, 44, "#f5f1e6");
  label(t("moveGuideSubtitle"), 236, 174, 16, "#9fb4ff");
  label(t("practiceHint"), 820, 190, 12, "rgba(255,240,166,0.62)");
  const rows = [
    ["T-Spin", t("guideTSpinText"), "#f2d36b"],
    ["T-Spin Mini", t("guideTSpinMiniText"), "#d7c2ff"],
    ["All-Spin Mini", t("guideAllSpinMiniText"), "#9df7da"],
    ["Back-to-Back", t("guideB2BText"), "#fff0a6"],
    ["Perfect Clear", t("guidePerfectClearText"), "#fff0a6"],
    ["Incoming Cancel", t("guideIncomingCancelText"), "#ffb7bd"],
  ];
  rows.forEach((row, i) => drawGuideRow(232, 216 + i * 52, row[0], row[1], row[2], 558));
  drawDamageRulesBox(232, 528, 558, 56);
  drawChallengePanel(820, 216);
  drawMenuButton(232, 596, 180, 40, t("back"), "Esc");
  ctx.restore();
}

function drawDamageRulesBox(x, y, w, h) {
  ctx.save();
  ctx.fillStyle = "rgba(8, 13, 20, 0.62)";
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
  ctx.fillStyle = "rgba(8, 13, 20, 0.6)";
  roundedRect(x, y, width, 42, 8, true, false);
  ctx.strokeStyle = hexToRgba(color, 0.25);
  roundedRect(x, y, width, 42, 8, false, true);
  label(title, x + 16, y + 27, 17, color);
  label(text, x + 146, y + 27, 13, "rgba(238,244,252,0.68)");
  ctx.restore();
}

function drawChallengePanel(x, y) {
  ctx.save();
  label(t("challengePanel"), x, y - 18, 20, "#fff0a6");
  for (let i = 0; i < CHALLENGES.length; i += 1) {
    const challenge = CHALLENGES[i];
    const cy = y + i * 94;
    const hovered = pointInRect(state.pointer.x, state.pointer.y, x, cy, 230, 78);
    ctx.fillStyle = hovered ? "rgba(241, 211, 107, 0.22)" : "rgba(8, 13, 20, 0.62)";
    roundedRect(x, cy, 230, 78, 9, true, false);
    ctx.strokeStyle = hovered ? "rgba(255, 244, 168, 0.58)" : "rgba(255, 244, 168, 0.2)";
    ctx.lineWidth = 2;
    roundedRect(x, cy, 230, 78, 9, false, true);
    label(challenge.title, x + 16, cy + 25, 18, "#f5f1e6");
    wrapText(t(challenge.descKey), x + 16, cy + 48, 196, 18, "rgba(238,244,252,0.64)", 13);
  }
  label(t("clickToStart"), x, y + 292, 14, "rgba(238,244,252,0.52)");
  ctx.restore();
}

function drawMenuButton(x, y, w, h, text, hint, variant = "secondary") {
  const hovered = pointInRect(state.pointer.x, state.pointer.y, x, y, w, h);
  ctx.save();
  const primary = variant === "primary";
  if (primary) {
    const fill = ctx.createLinearGradient(x, y, x + w, y + h);
    fill.addColorStop(0, hovered ? "rgba(255, 236, 180, 0.34)" : "rgba(255, 224, 162, 0.22)");
    fill.addColorStop(0.48, hovered ? "rgba(184, 141, 255, 0.28)" : "rgba(184, 141, 255, 0.18)");
    fill.addColorStop(1, hovered ? "rgba(119, 237, 255, 0.2)" : "rgba(119, 237, 255, 0.12)");
    ctx.fillStyle = fill;
    ctx.shadowColor = "rgba(255, 224, 162, 0.26)";
    ctx.shadowBlur = hovered ? 18 : 12;
  } else {
    ctx.fillStyle = hovered ? "rgba(109, 232, 255, 0.2)" : "rgba(10, 16, 25, 0.62)";
  }
  roundedRect(x, y, w, h, 8, true, false);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = primary
    ? (hovered ? "rgba(255, 244, 168, 0.84)" : "rgba(255, 224, 162, 0.52)")
    : (hovered ? "rgba(255, 244, 168, 0.5)" : "rgba(145, 232, 222, 0.26)");
  ctx.lineWidth = primary ? 2.5 : 2;
  roundedRect(x, y, w, h, 8, false, true);
  if (primary) {
    ctx.fillStyle = hovered ? "rgba(255, 240, 166, 0.78)" : "rgba(255, 240, 166, 0.58)";
    roundedRect(x + 14, y + 14, 5, h - 28, 4, true, false);
  }
  ctx.font = `800 ${primary ? 21 : 17}px Trebuchet MS`;
  ctx.fillStyle = primary ? "#fff7d2" : "#f3f2ea";
  ctx.textBaseline = "middle";
  fitLabel(text, x + 22, y + h / 2 + 1, w - (hint ? 126 : 44), primary ? 21 : 17, primary ? "#fff7d2" : "#f3f2ea", primary ? 16 : 14, "800");
  if (hint) {
    ctx.font = "800 12px Trebuchet MS";
    ctx.fillStyle = "rgba(238,244,252,0.56)";
    ctx.textAlign = "right";
    ctx.fillText(hint, x + w - 18, y + h / 2 + 1);
    ctx.textAlign = "left";
  }
  ctx.textBaseline = "alphabetic";
  ctx.restore();
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

function controlLabel(action) {
  const item = CONTROL_ACTIONS.find((entry) => entry.id === action);
  if (!item) return action;
  return t(item.labelKey);
}

function drawSettings() {
  if (state.mode === "playing") drawPauseButton();
}

function drawLanguageToggle(x, y) {
  ctx.save();
  label(t("language"), x, y - 10, 15, "#8fe8dc");
  const zhActive = state.language === "zh";
  drawLanguagePill(x, y, 72, 34, t("languageZhShort"), zhActive);
  drawLanguagePill(x + 80, y, 72, 34, t("languageEnShort"), !zhActive);
  ctx.restore();
}

function drawLanguagePill(x, y, w, h, text, active) {
  ctx.save();
  ctx.fillStyle = active ? "rgba(241, 211, 107, 0.28)" : "rgba(109, 232, 255, 0.12)";
  roundedRect(x, y, w, h, 8, true, false);
  ctx.strokeStyle = active ? "rgba(255, 244, 168, 0.62)" : "rgba(145, 232, 222, 0.24)";
  ctx.lineWidth = 2;
  roundedRect(x, y, w, h, 8, false, true);
  label(text, x + 18, y + 23, 15, active ? "#fff0a6" : "rgba(238,244,252,0.68)");
  ctx.restore();
}

function drawControlGrid(x, y, columns = 2, gapX = 304) {
  for (let i = 0; i < CONTROL_ACTIONS.length; i += 1) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const rx = x + col * gapX;
    const ry = y + row * 34;
    drawKeyBindRow(rx, ry, controlLabel(CONTROL_ACTIONS[i].id), state.controls[CONTROL_ACTIONS[i].id], state.bindingAction === CONTROL_ACTIONS[i].id);
  }
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

function drawSlider(labelText, key, x, y, value) {
  const trackW = 270;
  const knobX = x + value * trackW;
  ctx.save();
  label(labelText, x, y - 10, 17, "#f3f2ea");
  ctx.font = "800 14px Trebuchet MS";
  ctx.fillStyle = "rgba(238,244,252,0.62)";
  ctx.fillText(`${Math.round(value * 100)}%`, x + trackW + 28, y - 10);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  roundedRect(x, y, trackW, 12, 6, true, false);
  const g = ctx.createLinearGradient(x, y, x + trackW, y);
  g.addColorStop(0, "#6de8ff");
  g.addColorStop(1, "#b690ff");
  ctx.fillStyle = g;
  roundedRect(x, y, value * trackW, 12, 6, true, false);
  ctx.strokeStyle = "rgba(231,244,255,0.26)";
  ctx.lineWidth = 2;
  roundedRect(x, y, trackW, 12, 6, false, true);
  ctx.fillStyle = state.pointer.dragging === `audio:${key}` ? "#fff4a8" : "#f3f2ea";
  ctx.beginPath();
  ctx.arc(knobX, y + 6, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#101620";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function drawTuningSlider(labelText, key, x, y) {
  const spec = TUNING_SLIDERS[key];
  const value = state.tuning[key];
  const ratio = (value - spec.min) / (spec.max - spec.min);
  const trackW = 270;
  const knobX = x + ratio * trackW;
  ctx.save();
  label(labelText, x, y - 10, 17, "#f3f2ea");
  ctx.font = "800 14px Trebuchet MS";
  ctx.fillStyle = "rgba(238,244,252,0.62)";
  const shown = key === "arr" && value === 0 ? "0 ms" : `${Math.round(value)} ${spec.unit}`;
  ctx.fillText(shown, x + trackW + 28, y - 10);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  roundedRect(x, y, trackW, 12, 6, true, false);
  const g = ctx.createLinearGradient(x, y, x + trackW, y);
  g.addColorStop(0, "#fff0a6");
  g.addColorStop(1, "#7ef7ff");
  ctx.fillStyle = g;
  roundedRect(x, y, ratio * trackW, 12, 6, true, false);
  ctx.strokeStyle = "rgba(231,244,255,0.26)";
  ctx.lineWidth = 2;
  roundedRect(x, y, trackW, 12, 6, false, true);
  ctx.fillStyle = state.pointer.dragging === `tuning:${key}` ? "#fff4a8" : "#f3f2ea";
  ctx.beginPath();
  ctx.arc(knobX, y + 6, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#101620";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function drawToggle(x, y, text, enabled) {
  ctx.save();
  label(text, x, y + 18, 17, "#f3f2ea");
  ctx.fillStyle = enabled ? "rgba(255, 119, 130, 0.72)" : "rgba(109, 232, 255, 0.28)";
  roundedRect(x + 116, y, 64, 30, 15, true, false);
  ctx.fillStyle = "#f3f2ea";
  ctx.beginPath();
  ctx.arc(x + 131 + (enabled ? 32 : 0), y + 15, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawKeyBindRow(x, y, text, value, binding) {
  ctx.save();
  label(text, x, y + 22, 17, "#f3f2ea");
  ctx.fillStyle = binding ? "rgba(241, 211, 107, 0.34)" : "rgba(109, 232, 255, 0.18)";
  roundedRect(x + 116, y, 132, 34, 7, true, false);
  ctx.strokeStyle = binding ? "rgba(255, 244, 168, 0.62)" : "rgba(145, 232, 222, 0.32)";
  ctx.lineWidth = 2;
  roundedRect(x + 116, y, 132, 34, 7, false, true);
  ctx.font = "800 15px Trebuchet MS";
  ctx.fillStyle = "#f3f2ea";
  ctx.fillText(binding ? t("settingPressKey") : formatControlKey(value), x + 134, y + 22);
  ctx.restore();
}

function formatControlKey(key) {
  const map = {
    arrowleft: "LEFT",
    arrowright: "RIGHT",
    arrowdown: "DOWN",
    arrowup: "UP",
    shift: "SHIFT",
    enter: "ENTER",
    escape: "ESC",
    control: "CTRL",
    alt: "ALT",
    tab: "TAB",
    backspace: "BACKSPACE",
  };
  if (key === " ") return "SPACE";
  if (map[key]) return map[key];
  if (key.length === 1) return key.toUpperCase();
  return key.toUpperCase();
}

function roundedRect(x, y, w, h, r, fill, stroke) {
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
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function drawImageContain(img, x, y, w, h) {
  const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function drawImageCropContain(img, sx, sy, sw, sh, x, y, w, h) {
  const scale = Math.min(w / sw, h / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(img, sx, sy, sw, sh, x + (w - dw) / 2, y + h - dh, dw, dh);
}

function drawRosterSprite(id, x, y, w, h) {
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

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const value = parseInt(clean.length === 3 ? clean.replace(/(.)/g, "$1$1") : clean, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function label(text, x, y, size, color) {
  ctx.font = `700 ${size}px Trebuchet MS`;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function fitLabel(text, x, y, maxWidth, size, color, minSize = 12, weight = "700") {
  const content = String(text);
  let fontSize = size;
  ctx.fillStyle = color;
  while (fontSize > minSize) {
    ctx.font = `${weight} ${fontSize}px Trebuchet MS`;
    if (ctx.measureText(content).width <= maxWidth) break;
    fontSize -= 1;
  }
  ctx.fillText(content, x, y);
}

function wrapText(text, x, y, maxWidth, lineHeight, color, size) {
  ctx.font = `700 ${size}px Trebuchet MS`;
  ctx.fillStyle = color;
  const tokens = tokenizeForWrap(String(text));
  let line = "";
  let cy = y;
  for (const token of tokens) {
    if (token === "\n") {
      if (line.trim()) ctx.fillText(line.trimEnd(), x, cy);
      line = "";
      cy += lineHeight;
      continue;
    }
    const next = line ? line + token : token.trimStart();
    const test = next.trimStart();
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trimEnd(), x, cy);
      line = token.trimStart();
      cy += lineHeight;
      if (ctx.measureText(line).width > maxWidth) {
        const broken = breakOversizedToken(line, maxWidth);
        for (let i = 0; i < broken.length - 1; i += 1) {
          ctx.fillText(broken[i], x, cy);
          cy += lineHeight;
        }
        line = broken[broken.length - 1] || "";
      }
    } else {
      line = next;
    }
  }
  if (line.trim()) ctx.fillText(line.trimEnd(), x, cy);
}

function tokenizeForWrap(text) {
  const tokens = [];
  let word = "";
  const flush = () => {
    if (word) tokens.push(word);
    word = "";
  };
  for (const ch of [...text]) {
    if (ch === "\n") {
      flush();
      tokens.push("\n");
    } else if (/\s/.test(ch)) {
      flush();
      tokens.push(" ");
    } else if (isCjkChar(ch)) {
      flush();
      tokens.push(ch);
    } else {
      word += ch;
    }
  }
  flush();
  return tokens;
}

function isCjkChar(ch) {
  return /[\u3400-\u9fff\u3000-\u303f\uff00-\uffef]/.test(ch);
}

function breakOversizedToken(token, maxWidth) {
  const parts = [];
  let current = "";
  for (const ch of [...token]) {
    const test = current + ch;
    if (ctx.measureText(test).width > maxWidth && current) {
      parts.push(current);
      current = ch;
    } else {
      current = test;
    }
  }
  if (current) parts.push(current);
  return parts;
}

window.addEventListener("keydown", (event) => {
  const key = event.key;
  const code = event.code;
  const normalized = normalizeControlKey(key);
  if (state.bindingAction) {
    event.preventDefault();
    if (key !== "Escape") {
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

  if (state.mode === "upgrade" && ["1", "2", "3"].includes(key)) {
    chooseUpgrade(Number(key) - 1);
    return;
  }
  if (key === "Enter" && state.mode !== "playing") {
    if (state.mode === "upgrade") chooseUpgrade(0);
    else if (state.mode === "start" && !state.settingsOpen) resetGame("endless");
    else if (state.mode === "victory" || state.mode === "defeat") resetGame("endless");
    return;
  }
  if (isActionKey("pause", key)) {
    if (state.mode === "playing") {
      state.mode = "paused";
      state.pauseView = "menu";
      state.settingsOpen = false;
    }
    else if (state.mode === "paused") {
      state.mode = "playing";
      state.pauseView = "menu";
    }
    return;
  }
  if (key === "Escape") {
    unlockAudio();
    state.bindingAction = null;
    if (state.mode === "playing") {
      state.mode = "paused";
      state.pauseView = "menu";
      state.settingsOpen = false;
    }
    else if (state.mode === "start") {
      state.settingsOpen = !state.settingsOpen;
      if (state.settingsOpen) state.settingsTab = "general";
    }
    else if (state.mode === "paused") {
      state.mode = "playing";
      state.pauseView = "menu";
      state.settingsOpen = false;
    } else if (state.mode === "guide" || state.mode === "victory" || state.mode === "defeat") {
      state.mode = "start";
      state.settingsOpen = false;
    } else {
      state.settingsOpen = !state.settingsOpen;
    }
    playSfx("hold");
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
  return Object.values(state.controls).includes(normalized) || key === "Enter" || key === "Escape" || ["1", "2", "3"].includes(key) || code === "Space";
}

function isActionKey(action, key) {
  return normalizeControlKey(key) === state.controls[action];
}

function bindControl(action, key) {
  for (const id of Object.keys(state.controls)) {
    if (id !== action && state.controls[id] === key) state.controls[id] = "";
  }
  state.controls[action] = key;
}

function normalizeControlKey(key) {
  if (key === " ") return " ";
  if (key.length === 1) return key.toLowerCase();
  return key.toLowerCase();
}

canvas.addEventListener("mousemove", (event) => {
  const p = getCanvasPoint(event);
  state.pointer.x = p.x;
  state.pointer.y = p.y;
  if (state.pointer.down && state.pointer.dragging) {
    updateSliderFromPointer(state.pointer.dragging, p.x);
  }
});

canvas.addEventListener("mousedown", (event) => {
  unlockAudio();
  const p = getCanvasPoint(event);
  state.pointer = { ...state.pointer, x: p.x, y: p.y, down: true };
  const b = UI_LAYOUT.pauseButton;

  if (state.mode === "playing" && pointInRect(p.x, p.y, b.x, b.y, b.w, b.h)) {
    state.mode = "paused";
    state.pauseView = "menu";
    state.settingsOpen = false;
    state.bindingAction = null;
    playSfx("hold");
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

  if (!state.settingsOpen && state.mode !== "playing") {
    if (state.mode === "upgrade") {
      for (let i = 0; i < 3; i += 1) {
        if (pointInRect(p.x, p.y, 342 + i * 204, 292, 180, 186)) {
          chooseUpgrade(i);
          return;
        }
      }
    }
    if (state.mode === "start") {
      const m = UI_LAYOUT.menu;
      const pad = m.padding || 36;
      const bx = m.x + pad;
      const bw = m.w - pad * 2;
      if (pointInRect(p.x, p.y, bx, m.primaryY, bw, m.primaryH)) resetGame("endless");
      else if (pointInRect(p.x, p.y, bx, m.tutorialY, bw, m.buttonH)) startTutorial();
      else if (pointInRect(p.x, p.y, bx, m.utilityY, bw, m.buttonH)) {
        state.settingsOpen = true;
        state.settingsTab = "general";
        playSfx("hold");
      }
      else if (pointInRect(p.x, p.y, bx, m.utilityY + m.buttonH + m.buttonGap, bw, m.buttonH)) {
        state.mode = "guide";
        playSfx("hold");
      }
      return;
    }
    if (state.mode === "guide") {
      for (let i = 0; i < CHALLENGES.length; i += 1) {
        if (pointInRect(p.x, p.y, 820, 216 + i * 94, 230, 78)) {
          startChallenge(CHALLENGES[i].id);
          return;
        }
      }
    }
    if (state.mode === "guide" && pointInRect(p.x, p.y, 232, 596, 180, 40)) {
      state.mode = "start";
      playSfx("hold");
      return;
    }
    if (state.mode === "paused" && pointInRect(p.x, p.y, 384, 408, 178, 44)) {
      state.mode = "playing";
      return;
    }
    if (state.mode === "paused" && pointInRect(p.x, p.y, 578, 408, 178, 44)) {
      resetGame(state.runMode);
      return;
    }
    if (state.mode === "paused" && pointInRect(p.x, p.y, 772, 408, 122, 44)) {
      state.mode = "start";
      return;
    }
    if ((state.mode === "victory" || state.mode === "defeat") && pointInRect(p.x, p.y, 646, 468, 248, 44)) {
      state.mode = "start";
      return;
    }
    if ((state.mode === "victory" || state.mode === "defeat") && pointInRect(p.x, p.y, 384, 468, 248, 44)) {
      resetGame("endless");
      return;
    }
  }
});

function handlePausePointerDown(x, y) {
  if (state.pauseView === "settings") {
    handleSettingsPointerDown(x, y, "pause");
    return;
  }
  const m = UI_LAYOUT.pauseMenu;
  if (pointInRect(x, y, m.x + 56, m.y + 156, m.w - 112, 48)) {
    state.mode = "playing";
    state.pauseView = "menu";
    playSfx("hold");
    return;
  }
  if (pointInRect(x, y, m.x + 56, m.y + 216, m.w - 112, 44)) {
    resetGame(state.runMode);
    return;
  }
  if (pointInRect(x, y, m.x + 56, m.y + 270, m.w - 112, 44)) {
    state.pauseView = "settings";
    state.settingsTab = "general";
    playSfx("hold");
    return;
  }
  if (pointInRect(x, y, m.x + 56, m.y + 324, m.w - 112, 44)) {
    state.mode = "start";
    state.pauseView = "menu";
    state.settingsOpen = false;
    playSfx("hold");
  }
}

function handleSettingsPointerDown(x, y, source) {
  const s = UI_LAYOUT.settings;
  if (pointInRect(x, y, s.x + s.w - 216, s.y + 26, 172, 40)) {
    state.bindingAction = null;
    if (source === "start") state.settingsOpen = false;
    else state.pauseView = "menu";
    playSfx("hold");
    return;
  }
  const tab = hitSettingsTab(x, y);
  if (tab) {
    state.settingsTab = tab;
    state.bindingAction = null;
    playSfx("hold");
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

function getSettingsContentOrigin() {
  return { x: UI_LAYOUT.settings.contentX, y: UI_LAYOUT.settings.contentY };
}

window.addEventListener("mouseup", () => {
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
  const sliders = state.settingsTab === "audio"
    ? [
        ["audio:masterVolume", origin.x, origin.y + 64],
        ["audio:musicVolume", origin.x, origin.y + 128],
        ["audio:sfxVolume", origin.x, origin.y + 192],
      ]
    : state.settingsTab === "controls"
      ? [
          ["tuning:das", origin.x, origin.y + 84],
          ["tuning:arr", origin.x, origin.y + 140],
          ["tuning:softDrop", origin.x, origin.y + 196],
          ["tuning:lockDelay", origin.x, origin.y + 252],
        ]
      : [];
  for (const [key, sx, sy] of sliders) {
    if (pointInRect(x, y, sx - 14, sy - 16, 298, 44)) return key;
  }
  return null;
}

function updateSliderFromPointer(key, x) {
  const [kind, name] = key.split(":");
  const sliderX = getSettingsContentOrigin().x;
  const value = clamp((x - sliderX) / 270, 0, 1);
  if (kind === "audio") {
    audio[name] = value;
  } else if (kind === "tuning") {
    const spec = TUNING_SLIDERS[name];
    state.tuning[name] = Math.round(spec.min + value * (spec.max - spec.min));
  }
  applyAudioSettings();
  saveGame();
}

function hitControlBind(x, y) {
  if (state.settingsTab !== "controls") return null;
  const origin = getSettingsContentOrigin();
  const baseX = origin.x + 412;
  const baseY = origin.y + 72;
  const columns = 1;
  const gapX = 304;
  for (let i = 0; i < CONTROL_ACTIONS.length; i += 1) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const rx = baseX + col * gapX + 116;
    const ry = baseY + row * 34;
    if (pointInRect(x, y, rx, ry, 132, 34)) return CONTROL_ACTIONS[i].id;
  }
  return null;
}

function pointInRect(px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

applySavedSettings();
syncControlHints();
draw();
requestAnimationFrame(update);
