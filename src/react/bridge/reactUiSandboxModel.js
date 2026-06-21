import { createResultOverlayModel } from "../../ui/resultOverlayModel.js";
import {
  formatSettingsPercent,
  formatTuningSliderValue,
  getControlActionLabel,
  getSettingsTabLabelKey,
} from "../../ui/settingsScreen.js";

const REACT_UI_LABEL_KEYS = [
  "reactSandboxKicker",
  "reactSandboxOverlay",
  "reactSandboxDebugPanel",
  "reactSandboxUnavailable",
  "reactSandboxShow",
  "reactSandboxHide",
  "reactSandboxAssets",
  "reactSandboxMode",
  "reactSandboxScreen",
  "reactSandboxActive",
  "reactSandboxErrors",
  "reactSandboxDrawAge",
  "reactSandboxDomLayers",
  "reactSandboxRefresh",
  "reactSandboxShowLegacyHud",
  "reactSandboxHideLegacyHud",
  "reactSandboxFallback",
  "reactSandboxSettingsHint",
  "reactSandboxCurrentBuildHint",
  "pauseMenu",
  "pauseMenuHint",
  "resume",
  "restart",
  "settings",
  "menu",
  "moveGuide",
  "back",
  "defeat",
  "victory",
  "retry",
  "upgradeMenu",
  "waveLabel",
  "bestLabel",
  "hp",
  "enemy",
  "riftEnergy",
  "summaryDamageSources",
  "currentBuildTitle",
  "currentBuildEmpty",
  "currentBuildStats",
  "currentBuildList",
  "currentBuildTraits",
  "currentBuildNoDirection",
  "currentBuildClose",
  "on",
  "off",
];

function getNextRunGoalText(state, format) {
  const currentPeak = state.stats?.peakWave || state.wave || 0;
  const wave = Math.max(20, Math.ceil((Math.max(0, currentPeak) + 1) / 10) * 10);
  return format("nextRunHookDynamic", { wave });
}

function getLabels(translate) {
  return REACT_UI_LABEL_KEYS.reduce((labels, key) => {
    labels[key] = translate(key);
    return labels;
  }, {});
}

function getGuideRows(translate) {
  return [
    { id: "tspin", title: "T-Spin", text: translate("guideTSpinText"), color: "#f2d36b" },
    { id: "tspin-mini", title: "T-Spin Mini", text: translate("guideTSpinMiniText"), color: "#d7c2ff" },
    { id: "allspin-mini", title: "All-Spin Mini", text: translate("guideAllSpinMiniText"), color: "#9df7da" },
    { id: "b2b", title: "Back-to-Back", text: translate("guideB2BText"), color: "#fff0a6" },
    { id: "perfect-clear", title: "Perfect Clear", text: translate("guidePerfectClearText"), color: "#fff0a6" },
    { id: "incoming-cancel", title: "Incoming Cancel", text: translate("guideIncomingCancelText"), color: "#ffb7bd" },
  ];
}

function getResultRows({ state, translate }) {
  const stats = state.stats || {};
  const save = state.save || {};
  return [
    { id: "wave", label: translate("waveLabel"), value: stats.peakWave || 0, meta: `${translate("bestLabel")} ${save.bestWave || 0}` },
    { id: "combo", label: translate("runMaxCombo"), value: stats.maxCombo || 0, meta: `${translate("bestLabel")} ${save.bestCombo || 0}` },
    { id: "b2b", label: translate("runB2BCount"), value: stats.b2bCount || 0, meta: `${translate("bestLabel")} ${save.bestB2B || 0}` },
    { id: "pc", label: translate("runPerfectClear"), value: stats.perfectClears || 0, meta: `${translate("bestLabel")} ${save.perfectClears || 0}` },
    { id: "spin", label: translate("runSpinCount"), value: `${stats.spins || 0} / ${translate("allSpinShort")} ${stats.allSpins || 0}` },
    { id: "damage", label: translate("summaryDamage"), value: stats.damage || 0, meta: `${translate("bestLabel")} ${save.bestDamage || 0}` },
    { id: "bestHit", label: translate("summaryBestHit"), value: stats.bestHit || 0, meta: `${translate("bestLabel")} ${save.bestHit || 0}` },
  ];
}

function getSettingsModel({
  audio,
  controlActions,
  controlDisplayValue,
  defaultTuning,
  githubFeedbackUrl,
  settingsTabs,
  state,
  translate,
  tuningSliders,
}) {
  const currentTab = settingsTabs.includes(state.settingsTab) ? state.settingsTab : "controls";
  const handlingHelpKeys = {
    das: "dasHelp",
    arr: "arrHelp",
    softDrop: "softDropHelp",
    lockDelay: "lockDelayHelp",
  };
  const handlingLabelKeys = {
    das: "das",
    arr: "arr",
    softDrop: "softDropMs",
    lockDelay: "lockDelayMs",
  };
  return {
    currentTab,
    tabs: settingsTabs.map((id) => ({
      id,
      label: translate(getSettingsTabLabelKey(id)),
    })),
    controls: controlActions.map((action) => ({
      id: action.id,
      label: getControlActionLabel(action.id, controlActions, translate),
      value: controlDisplayValue(action.id),
    })),
    handling: Object.entries(tuningSliders).map(([id, spec]) => ({
      id,
      label: translate(handlingLabelKeys[id] || id),
      value: formatTuningSliderValue(id, state.tuning?.[id] ?? defaultTuning[id], spec),
      help: translate(handlingHelpKeys[id] || id),
    })),
    audio: [
      { id: "master", label: translate("master"), value: formatSettingsPercent(audio.masterVolume) },
      { id: "music", label: translate("music"), value: formatSettingsPercent(audio.musicVolume) },
      { id: "sfx", label: translate("sfx"), value: formatSettingsPercent(audio.sfxVolume) },
      { id: "mute", label: translate("mute"), value: audio.muted ? translate("on") : translate("off") },
    ],
    languages: [
      { id: "zh", label: "繁體中文", value: state.language === "zh" ? translate("on") : translate("off") },
      { id: "en", label: "English", value: state.language === "en" ? translate("on") : translate("off") },
    ],
    feedback: {
      id: "feedback",
      label: translate("feedbackOpenGithub"),
      value: githubFeedbackUrl,
      help: translate("feedbackHelp"),
    },
  };
}

function getCurrentBuildModel({
  getAcquiredRelicGroups,
  getCurrentBuildDirectionText,
  getCurrentBuildFamilyStats,
  getTraitEffectText,
  getTraitEntries,
  rarityLabel,
  translate,
  upgradeName,
}) {
  const groups = getAcquiredRelicGroups();
  const stats = getCurrentBuildFamilyStats(groups);
  const traits = getTraitEntries(groups)
    .filter((trait) => trait.count > 0)
    .slice(0, 4)
    .map((trait) => ({
      id: trait.tag,
      label: `${trait.label} x${trait.count}`,
      effect: getTraitEffectText(trait),
      color: trait.color,
    }));
  return {
    direction: getCurrentBuildDirectionText(stats),
    stats: stats.slice(0, 5).map((stat) => ({
      id: stat.label,
      label: `${stat.label} x${stat.count}`,
      color: stat.color,
    })),
    traits,
    upgrades: groups.slice(0, 9).map((group) => ({
      id: group.id,
      rarity: `${rarityLabel(group.rarity).toUpperCase()}${group.count > 1 ? ` x${group.count}` : ""}`,
      name: upgradeName(group.upgrade),
      tags: group.tags.map((tag) => translate(`traitHud.${tag}`)).join(" / "),
      color: group.family?.color || "#8fe8dc",
    })),
  };
}

function getResultModel({
  format,
  getMessage,
  getResultButtonRects,
  state,
  translate,
}) {
  if (state.mode !== "victory" && state.mode !== "defeat") return {};
  const model = createResultOverlayModel({
    state,
    message: getMessage(),
    buttons: getResultButtonRects(),
    translate,
  });
  return {
    victory: model.victory,
    message: model.message,
    rating: format("rating", { rating: state.stats?.rating || "-" }),
    rows: getResultRows({ state, translate }),
    damageSources: model.damageSources,
    riftEnergyEarned: format("riftEnergyEarned", { amount: state.runStats?.riftEnergyEarned || 0 }),
    riftEnergyTotal: format("riftEnergyTotal", { amount: state.metaProgress?.riftEnergy || 0 }),
    nextRunGoal: getNextRunGoalText(state, format),
  };
}

export function createReactUiSandboxModelReader(deps = {}) {
  const {
    audio = {},
    controlActions = [],
    controlDisplayValue = () => "-",
    defaultTuning = {},
    format = (key) => key,
    getAcquiredRelicGroups = () => [],
    getCurrentBuildDirectionText = () => "",
    getCurrentBuildFamilyStats = () => [],
    getMessage = () => "",
    getResultButtonRects = () => ({}),
    getTraitEffectText = () => "",
    getTraitEntries = () => [],
    githubFeedbackUrl = "",
    playerMaxHp = 0,
    rarityLabel = (rarity) => rarity,
    settingsTabs = [],
    state = {},
    translate = (key) => key,
    tuningSliders = {},
    upgradeName = (upgrade) => upgrade?.name || "",
  } = deps;
  return function readReactUiSandboxModel() {
    return {
      labels: getLabels(translate),
      pause: {
        wave: state.wave || 1,
        runMode: translate(state.runMode || "endless"),
        playerHp: `${Math.max(0, Math.round(state.playerHp || 0))} / ${Math.max(0, Math.round(state.playerMaxHp || playerMaxHp))}`,
        enemyHp: `${Math.max(0, Math.round(state.enemyHp || 0))} / ${Math.max(0, Math.round(state.enemyMaxHp || state.enemy?.maxHp || 0))}`,
      },
      guide: {
        subtitle: translate("moveGuideSubtitle"),
        rows: getGuideRows(translate),
        damageFormula: translate("damageFormula"),
        damageRuleLine: translate("damageRuleLine"),
        effectTier: `${translate("effectTierTitle")}: ${translate("effectTierText")}`,
      },
      result: getResultModel({
        format,
        getMessage,
        getResultButtonRects,
        state,
        translate,
      }),
      settings: getSettingsModel({
        audio,
        controlActions,
        controlDisplayValue,
        defaultTuning,
        githubFeedbackUrl,
        settingsTabs,
        state,
        translate,
        tuningSliders,
      }),
      currentBuild: getCurrentBuildModel({
        getAcquiredRelicGroups,
        getCurrentBuildDirectionText,
        getCurrentBuildFamilyStats,
        getTraitEffectText,
        getTraitEntries,
        rarityLabel,
        translate,
        upgradeName,
      }),
    };
  };
}

export function createReactUiSandboxIntentHandlers({
  loadMetaProgress = () => ({}),
  playSfx = () => {},
  resetGame = () => false,
  setGameMode = () => {},
  settingsTabs = [],
  state = {},
} = {}) {
  return {
    closeCurrentBuild() {
      if (!state.currentBuildOpen) return false;
      state.currentBuildOpen = false;
      playSfx("uiCancel");
      return true;
    },
    closeGuide() {
      if (state.mode !== "guide") return false;
      setGameMode("start");
      playSfx("uiCancel");
      return true;
    },
    closeSettings() {
      if (state.pauseView === "settings") {
        state.pauseView = "menu";
        playSfx("uiCancel");
        return true;
      }
      if (state.settingsOpen) {
        state.settingsOpen = false;
        playSfx("uiCancel");
        return true;
      }
      return false;
    },
    openMetaUpgrade() {
      state.metaProgress = loadMetaProgress();
      state.metaUpgradeMessage = { key: "", vars: {}, until: 0 };
      setGameMode("metaUpgrade");
      playSfx("uiConfirm");
      return true;
    },
    openPauseSettings() {
      if (state.mode !== "paused") return false;
      state.pauseView = "settings";
      state.settingsTab = state.settingsTab || "controls";
      playSfx("uiConfirm");
      return true;
    },
    restartRun() {
      resetGame(state.runMode || "endless");
      return true;
    },
    resumeGame() {
      if (state.mode !== "paused") return false;
      state.pauseView = "menu";
      state.settingsOpen = false;
      setGameMode("playing");
      playSfx("uiConfirm");
      return true;
    },
    retryRun() {
      resetGame(state.runMode || "endless");
      return true;
    },
    returnToMainMenu() {
      state.pauseView = "menu";
      state.settingsOpen = false;
      setGameMode("start");
      playSfx("uiCancel");
      return true;
    },
    setSettingsTab(intent = {}) {
      if (!settingsTabs.includes(intent.tab)) return false;
      state.settingsTab = intent.tab;
      playSfx("uiConfirm");
      return true;
    },
  };
}
