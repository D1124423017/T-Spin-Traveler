import {
  getMainMenuActions,
  normalizeMainMenuSelectedIndex,
} from "../../ui/mainMenuModel.js";

function finiteNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function clampRatio(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function roundMs(value) {
  return Math.max(0, Math.round(finiteNumber(value)));
}

function freezeDeep(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freezeDeep(nested);
  return Object.freeze(value);
}

function normalizeAssetSummary(summary = {}) {
  const loading = Math.max(0, Math.round(finiteNumber(summary.loading)));
  const error = Math.max(0, Math.round(finiteNumber(summary.error)));
  const loaded = Math.max(0, Math.round(finiteNumber(summary.loaded)));
  const total = Math.max(loading + error + loaded, Math.round(finiteNumber(summary.total)));
  return {
    loading,
    error,
    loaded,
    total,
    progress: total > 0 ? clampRatio((loaded + error) / total) : 0,
  };
}

const REACT_UI_MIGRATED_OVERLAYS = Object.freeze([
  "pause",
  "guide",
  "result",
  "settings",
  "currentBuild",
]);

function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeText(value, fallback = "") {
  return value == null ? fallback : String(value);
}

export function getReactUiSandboxOverlayKind(state = {}) {
  if (state.settingsOpen || state.pauseView === "settings") return "settings";
  if (state.currentBuildOpen) return "currentBuild";
  if (state.mode === "paused") return "pause";
  if (state.mode === "guide") return "guide";
  if (state.mode === "victory" || state.mode === "defeat") return "result";
  return "";
}

export function isReactUiSandboxMigratedOverlay(kind = "") {
  return REACT_UI_MIGRATED_OVERLAYS.includes(kind);
}

function createReactUiSandboxState(state = {}, uiModel = {}) {
  const overlayKind = normalizeText(uiModel.overlayKind || getReactUiSandboxOverlayKind(state));
  const migratedOverlay = isReactUiSandboxMigratedOverlay(overlayKind);
  const canvasMode = normalizeText(state.mode || "");
  return {
    enabled: true,
    overlayKind,
    migratedOverlay,
    fallbackCanvasMode: !migratedOverlay && canvasMode !== "start" ? canvasMode : "",
    canvasMainMenuActive: canvasMode === "start" && !state.settingsOpen,
    mainMenuManagedByReact: false,
  };
}

function normalizeUiModel(model = {}) {
  return {
    labels: model.labels || {},
    pause: model.pause || {},
    guide: {
      ...(model.guide || {}),
      rows: normalizeList(model.guide?.rows),
    },
    result: {
      ...(model.result || {}),
      rows: normalizeList(model.result?.rows),
      damageSources: normalizeText(model.result?.damageSources, "-"),
    },
    settings: {
      ...(model.settings || {}),
      tabs: normalizeList(model.settings?.tabs),
      controls: normalizeList(model.settings?.controls),
      handling: normalizeList(model.settings?.handling),
      audio: normalizeList(model.settings?.audio),
      languages: normalizeList(model.settings?.languages),
    },
    currentBuild: {
      ...(model.currentBuild || {}),
      stats: normalizeList(model.currentBuild?.stats),
      traits: normalizeList(model.currentBuild?.traits),
      upgrades: normalizeList(model.currentBuild?.upgrades),
    },
  };
}

function readAssetSummary(getAssetLoadingSummary) {
  try {
    return normalizeAssetSummary(getAssetLoadingSummary?.() || {});
  } catch {
    return normalizeAssetSummary();
  }
}

function readDomDiagnostics(getDomOverlayDiagnostics) {
  try {
    const diagnostics = getDomOverlayDiagnostics?.() || {};
    return {
      rootReady: Boolean(diagnostics.rootReady),
      gsapReady: Boolean(diagnostics.gsapReady),
      reducedMotion: Boolean(diagnostics.reducedMotion),
      layerCount: Object.keys(diagnostics.layers || {}).length,
    };
  } catch {
    return {
      rootReady: false,
      gsapReady: false,
      reducedMotion: false,
      layerCount: 0,
    };
  }
}

function normalizeMainMenuAction(action = {}, index = 0, {
  formatActionLabel,
  translate,
} = {}) {
  const label = typeof formatActionLabel === "function"
    ? formatActionLabel(action, index)
    : translate?.(action.labelKey) || action.labelKey || action.id || "";
  return {
    id: normalizeText(action.id, `action-${index}`),
    label: normalizeText(label),
    description: normalizeText(translate?.(action.descriptionKey) || action.descriptionKey || ""),
    hint: action.hintKey ? normalizeText(translate?.(action.hintKey) || action.hintKey) : "",
    enabled: action.enabled !== false,
  };
}

export function createReactMainMenuSnapshot({
  state = {},
  actions = getMainMenuActions(),
  buttonFrames = {},
  formatActionLabel,
  now = 0,
  translate = (key) => key,
} = {}) {
  const list = Array.isArray(actions) && actions.length > 0 ? actions : getMainMenuActions();
  const selectedIndex = normalizeMainMenuSelectedIndex(state.mainMenuSelectedIndex, list.length);
  const normalizedActions = list.map((action, index) => normalizeMainMenuAction(action, index, {
    formatActionLabel,
    translate,
  }));
  const selectedAction = normalizedActions[selectedIndex] || normalizedActions[0] || {};
  const snapshot = {
    enabled: state.mode === "start" && !state.settingsOpen && state.assetLoadingDone !== false,
    mode: normalizeText(state.mode),
    language: normalizeText(state.language || "zh"),
    title: normalizeText(translate("startTitle")),
    tagline: normalizeText(translate("startTagline")),
    worldHint: normalizeText(translate("startWorldHint")),
    location: normalizeText(translate("menuWorldLocation")),
    controlHint: normalizeText(translate("menuControlHint")),
    navigationLabel: normalizeText(translate("startTitle")),
    actions: normalizedActions,
    buttonFrames: {
      primary: normalizeText(buttonFrames.primary),
      secondary: normalizeText(buttonFrames.secondary),
    },
    selectedAction,
    selectedIndex,
    timestamp: Math.round(finiteNumber(now)),
    ui: {
      mainMenuManagedByReact: true,
      canvasMainMenuActive: false,
    },
  };
  return freezeDeep(snapshot);
}

export function createReactMainMenuSnapshotReader({
  actions = getMainMenuActions(),
  buttonFrames = {},
  formatActionLabel,
  now = () => performance.now(),
  state,
  translate = (key) => key,
} = {}) {
  return () => createReactMainMenuSnapshot({
    state,
    actions,
    buttonFrames,
    formatActionLabel,
    now: now(),
    translate,
  });
}

export function createReactDebugSnapshot({
  state = {},
  assetSummary = {},
  domDiagnostics = {},
  legacyDebugVisible = false,
  reactDebug = {},
  uiModel = {},
  now = 0,
} = {}) {
  const debug = state.debug || {};
  const asset = normalizeAssetSummary(assetSummary);
  const timestamp = finiteNumber(now);
  const normalizedUiModel = normalizeUiModel(uiModel);
  const snapshot = {
    mode: String(state.mode || "unknown"),
    runMode: String(state.runMode || ""),
    screen: state.settingsOpen ? "settings" : String(state.mode || "unknown"),
    overlay: String(state.overlay || ""),
    gameplay: {
      wave: Math.max(1, Math.round(finiteNumber(state.wave, 1))),
      activePiece: Boolean(state.active),
      playerHp: Math.round(finiteNumber(state.playerHp)),
      enemyHp: Math.round(finiteNumber(state.enemyHp)),
      upgradeChoicesOpen: Array.isArray(state.upgradeChoices) && state.upgradeChoices.length > 0,
    },
    asset,
    debug: {
      legacyHudVisible: Boolean(legacyDebugVisible),
      drawError: String(debug.drawError || ""),
      flowStuck: Boolean(debug.flowStuck),
      updateAgeMs: roundMs(timestamp - finiteNumber(debug.lastUpdateAt, timestamp)),
      drawAgeMs: roundMs(timestamp - finiteNumber(debug.lastDrawAt, timestamp)),
      triggerDefeatCalled: Boolean(debug.triggerDefeatCalled),
      finishRunCalled: Boolean(debug.finishRunCalled),
    },
    dom: {
      rootReady: Boolean(domDiagnostics.rootReady),
      gsapReady: Boolean(domDiagnostics.gsapReady),
      reducedMotion: Boolean(domDiagnostics.reducedMotion),
      layerCount: Math.max(0, Math.round(finiteNumber(domDiagnostics.layerCount))),
    },
    reactDebug: {
      enabled: Boolean(reactDebug.enabled),
      loaded: Boolean(reactDebug.loaded),
      loading: Boolean(reactDebug.loading),
      failed: Boolean(reactDebug.failed),
    },
    ui: createReactUiSandboxState(state, uiModel),
    ...normalizedUiModel,
    timestamp: Math.round(timestamp),
  };
  return freezeDeep(snapshot);
}

export function createReactDebugSnapshotReader({
  state,
  getAssetLoadingSummary,
  getDomOverlayDiagnostics,
  getLegacyDebugVisible = () => false,
  getReactDebugLoadState = () => ({}),
  getUiSandboxModel = () => ({}),
  now = () => performance.now(),
} = {}) {
  return () => createReactDebugSnapshot({
    state,
    assetSummary: readAssetSummary(getAssetLoadingSummary),
    domDiagnostics: readDomDiagnostics(getDomOverlayDiagnostics),
    legacyDebugVisible: getLegacyDebugVisible(),
    reactDebug: getReactDebugLoadState(),
    uiModel: getUiSandboxModel(),
    now: now(),
  });
}
