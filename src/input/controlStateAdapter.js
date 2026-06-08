import {
  bindControl as bindControlForState,
  getAllControlKeys,
  getControlKeys as getControlKeysForState,
  normalizeControlsMap as normalizeControlsForActions,
  serializeControls as serializeControlsForActions,
} from "./controlBindings.js";

export function createControlStateAdapter({
  getState,
  controlActions,
  defaultControls,
} = {}) {
  function getCurrentControls() {
    const state = getState?.();
    return state?.controls || defaultControls;
  }

  function normalizeControlsMap(source = {}) {
    return normalizeControlsForActions(source, {
      controlActions,
      defaultControls,
    });
  }

  function serializeControls(controls) {
    return serializeControlsForActions(controls, {
      controlActions,
      defaultControls,
    });
  }

  function getControlKeys(action) {
    return getControlKeysForState(action, {
      controls: getCurrentControls(),
      defaultControls,
    });
  }

  function allControlKeys() {
    return getAllControlKeys({
      controlActions,
      controls: getCurrentControls(),
      defaultControls,
    });
  }

  function bindControl(action, key) {
    const state = getState?.();
    if (!state?.controls) return;
    bindControlForState(state.controls, action, key, {
      controlActions,
      defaultControls,
    });
  }

  return {
    allControlKeys,
    bindControl,
    getControlKeys,
    normalizeControlsMap,
    serializeControls,
  };
}
