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

export function createReactDebugSnapshot({
  state = {},
  assetSummary = {},
  domDiagnostics = {},
  legacyDebugVisible = false,
  reactDebug = {},
  now = 0,
} = {}) {
  const debug = state.debug || {};
  const asset = normalizeAssetSummary(assetSummary);
  const timestamp = finiteNumber(now);
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
  now = () => performance.now(),
} = {}) {
  return () => createReactDebugSnapshot({
    state,
    assetSummary: readAssetSummary(getAssetLoadingSummary),
    domDiagnostics: readDomDiagnostics(getDomOverlayDiagnostics),
    legacyDebugVisible: getLegacyDebugVisible(),
    reactDebug: getReactDebugLoadState(),
    now: now(),
  });
}
