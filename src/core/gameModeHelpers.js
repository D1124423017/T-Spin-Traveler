export function createGameModeSetter({
  state,
  setDomOverlayMode,
  setFeedbackMode,
} = {}) {
  return function setGameMode(mode) {
    state.mode = mode;
    setDomOverlayMode(mode);
    setFeedbackMode(mode);
    return mode;
  };
}
