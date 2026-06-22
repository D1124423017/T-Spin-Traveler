export const REACT_DEBUG_QUERY_FLAG = "reactDebug";

export const REACT_DEBUG_INTENTS = Object.freeze({
  closeCurrentBuild: "closeCurrentBuild",
  closeGuide: "closeGuide",
  closeSettings: "closeSettings",
  openMetaUpgrade: "openMetaUpgrade",
  openPauseSettings: "openPauseSettings",
  refreshSnapshot: "refreshSnapshot",
  restartRun: "restartRun",
  resumeGame: "resumeGame",
  retryRun: "retryRun",
  returnToMainMenu: "returnToMainMenu",
  setSettingsTab: "setSettingsTab",
  toggleLegacyDebugHud: "toggleLegacyDebugHud",
});

export const REACT_MAIN_MENU_INTENTS = Object.freeze({
  activateMenuAction: "activateMenuAction",
  hoverMenuAction: "hoverMenuAction",
  refreshSnapshot: "refreshSnapshot",
});

const INTENT_CALLBACK_NAMES = Object.freeze({
  [REACT_DEBUG_INTENTS.closeCurrentBuild]: "closeCurrentBuild",
  [REACT_DEBUG_INTENTS.closeGuide]: "closeGuide",
  [REACT_DEBUG_INTENTS.closeSettings]: "closeSettings",
  [REACT_DEBUG_INTENTS.openMetaUpgrade]: "openMetaUpgrade",
  [REACT_DEBUG_INTENTS.openPauseSettings]: "openPauseSettings",
  [REACT_DEBUG_INTENTS.restartRun]: "restartRun",
  [REACT_DEBUG_INTENTS.resumeGame]: "resumeGame",
  [REACT_DEBUG_INTENTS.retryRun]: "retryRun",
  [REACT_DEBUG_INTENTS.returnToMainMenu]: "returnToMainMenu",
  [REACT_DEBUG_INTENTS.setSettingsTab]: "setSettingsTab",
});

const MAIN_MENU_INTENT_CALLBACK_NAMES = Object.freeze({
  [REACT_MAIN_MENU_INTENTS.activateMenuAction]: "activateMenuAction",
  [REACT_MAIN_MENU_INTENTS.hoverMenuAction]: "hoverMenuAction",
});

export function isReactDebugEnabled(search = globalThis?.location?.search || "") {
  try {
    const params = new URLSearchParams(search);
    return params.get("debug") === "1" && params.get(REACT_DEBUG_QUERY_FLAG) === "1";
  } catch {
    return false;
  }
}

export function createReactDebugIntentBridge({
  closeCurrentBuild = () => false,
  closeGuide = () => false,
  closeSettings = () => false,
  openMetaUpgrade = () => false,
  openPauseSettings = () => false,
  refreshSnapshot = () => null,
  restartRun = () => false,
  resumeGame = () => false,
  retryRun = () => false,
  returnToMainMenu = () => false,
  setSettingsTab = () => false,
  toggleLegacyDebugHud = () => false,
} = {}) {
  const callbacks = {
    closeCurrentBuild,
    closeGuide,
    closeSettings,
    openMetaUpgrade,
    openPauseSettings,
    restartRun,
    resumeGame,
    retryRun,
    returnToMainMenu,
    setSettingsTab,
  };

  function dispatch(intent) {
    const type = typeof intent === "string" ? intent : intent?.type;
    if (type === REACT_DEBUG_INTENTS.refreshSnapshot) {
      return {
        ok: true,
        type,
        value: refreshSnapshot(),
      };
    }
    if (type === REACT_DEBUG_INTENTS.toggleLegacyDebugHud) {
      return {
        ok: true,
        type,
        value: Boolean(toggleLegacyDebugHud()),
      };
    }
    const callbackName = INTENT_CALLBACK_NAMES[type];
    if (callbackName) {
      return {
        ok: true,
        type,
        value: callbacks[callbackName](intent || {}),
      };
    }
    return {
      ok: false,
      reason: "unsupported-intent",
      type: type || "",
    };
  }

  return Object.freeze({ dispatch });
}

export function createReactMainMenuIntentBridge({
  activateMenuAction = () => false,
  hoverMenuAction = () => false,
  refreshSnapshot = () => null,
} = {}) {
  const callbacks = {
    activateMenuAction,
    hoverMenuAction,
  };

  function dispatch(intent) {
    const type = typeof intent === "string" ? intent : intent?.type;
    if (type === REACT_MAIN_MENU_INTENTS.refreshSnapshot) {
      return {
        ok: true,
        type,
        value: refreshSnapshot(),
      };
    }
    const callbackName = MAIN_MENU_INTENT_CALLBACK_NAMES[type];
    if (callbackName) {
      return {
        ok: true,
        type,
        value: callbacks[callbackName](intent || {}),
      };
    }
    return {
      ok: false,
      reason: "unsupported-intent",
      type: type || "",
    };
  }

  return Object.freeze({ dispatch });
}
