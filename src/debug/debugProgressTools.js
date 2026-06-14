import {
  DEFAULT_META_PROGRESS,
  LEGACY_META_PROGRESS_STORAGE_KEY,
} from "../core/metaProgress.js";

export const DEBUG_RIFT_ENERGY_GRANT = 10000;
export const DEBUG_RESET_CONFIRM_MS = 3200;
export const DEBUG_RESET_DONE_MS = 2200;

export function createDebugProgressTools({
  state,
  loadMetaProgress,
  saveMetaProgress,
  grantRiftEnergy,
  amount = DEBUG_RIFT_ENERGY_GRANT,
  persistGameSave = () => {},
  storage = globalThis?.localStorage,
  now = () => Date.now(),
} = {}) {
  let resetConfirmUntil = 0;
  let resetDoneUntil = 0;

  function addRiftEnergy() {
    const next = grantRiftEnergy(loadMetaProgress(), amount);
    state.metaProgress = next;
    saveMetaProgress(next);
    return next.riftEnergy;
  }

  function resetAllProgress() {
    const currentTime = now();
    if (resetConfirmUntil <= currentTime) {
      resetConfirmUntil = currentTime + DEBUG_RESET_CONFIRM_MS;
      resetDoneUntil = 0;
      return { status: "confirm" };
    }

    resetConfirmUntil = 0;
    saveMetaProgress(DEFAULT_META_PROGRESS);
    storage?.removeItem?.(LEGACY_META_PROGRESS_STORAGE_KEY);
    state.metaProgress = loadMetaProgress();
    state.save = resetGameSaveProgress(state.save);
    resetEquipmentUiState(state);
    persistGameSave(state.save);
    resetDoneUntil = currentTime + DEBUG_RESET_DONE_MS;
    return {
      status: "reset",
      metaProgress: state.metaProgress,
      save: state.save,
    };
  }

  function getResetStatus() {
    const currentTime = now();
    if (resetConfirmUntil > currentTime) return "confirm";
    if (resetDoneUntil > currentTime) return "reset";
    return "idle";
  }

  return {
    addRiftEnergy,
    getResetStatus,
    resetAllProgress,
  };
}

export function resetGameSaveProgress(save = {}) {
  return {
    bestWave: 0,
    bestCombo: 0,
    bestB2B: 0,
    bestDamage: 0,
    bestHit: 0,
    perfectClears: 0,
    tutorialCompleted: false,
    settings: { ...(save.settings || {}) },
  };
}

function resetEquipmentUiState(state) {
  if (!state.equipmentUi) return;
  state.equipmentUi.view = "inventory";
  state.equipmentUi.filter = "all";
  state.equipmentUi.motion = null;
  state.equipmentUi.message = { key: "", vars: {}, until: 0 };
  state.equipmentUi.selectedOwnedIndex = 0;
}
