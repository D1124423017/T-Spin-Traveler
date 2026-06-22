import {
  getMainMenuActions,
  normalizeMainMenuSelectedIndex,
} from "../../ui/mainMenuModel.js";

function canUseMainMenu(state = {}) {
  return state.mode === "start" && state.assetLoadingDone !== false && !state.settingsOpen;
}

function getActionIndex(intent = {}, actions = getMainMenuActions()) {
  if (intent.actionId) {
    const index = actions.findIndex((action) => action.id === intent.actionId);
    if (index >= 0) return index;
  }
  if (Number.isFinite(intent.index)) {
    return normalizeMainMenuSelectedIndex(intent.index, actions.length);
  }
  return -1;
}

export function createReactMainMenuIntentHandlers({
  loadMetaProgress = () => ({}),
  openEquipmentScreen = () => false,
  playSfx = () => {},
  resetGame = () => false,
  setGameMode = () => false,
  startStoryScene = () => false,
  state = {},
  unlockAudio = () => {},
} = {}) {
  function hoverMenuAction(intent = {}) {
    if (!canUseMainMenu(state)) return false;
    const actions = getMainMenuActions();
    const index = getActionIndex(intent, actions);
    if (index < 0 || !actions[index] || actions[index].enabled === false) return false;
    const nextIndex = normalizeMainMenuSelectedIndex(index, actions.length);
    if (state.mainMenuSelectedIndex !== nextIndex) {
      state.mainMenuSelectedIndex = nextIndex;
      playSfx("uiHover");
    }
    return true;
  }

  function activateMenuAction(intent = {}) {
    if (!canUseMainMenu(state)) return false;
    const actions = getMainMenuActions();
    const index = getActionIndex(intent, actions);
    const action = index >= 0 ? actions[normalizeMainMenuSelectedIndex(index, actions.length)] : null;
    if (!action || action.enabled === false) return false;

    state.mainMenuSelectedIndex = normalizeMainMenuSelectedIndex(index, actions.length);
    unlockAudio();
    switch (action.id) {
      case "start":
        resetGame("endless");
        return true;
      case "mainStage":
        startStoryScene("prologue", "storyEgypt");
        return true;
      case "equipment":
        openEquipmentScreen();
        return true;
      case "metaUpgrade":
        setGameMode("metaUpgrade");
        state.metaProgress = loadMetaProgress();
        state.metaUpgradeMessage = { key: "", vars: {}, until: 0 };
        playSfx("uiConfirm");
        return true;
      case "guide":
        setGameMode("guide");
        playSfx("uiConfirm");
        return true;
      case "settings":
        state.settingsOpen = true;
        state.settingsTab = "controls";
        playSfx("uiConfirm");
        return true;
      default:
        return false;
    }
  }

  return Object.freeze({
    activateMenuAction,
    hoverMenuAction,
  });
}
