import {
  advanceStoryProgress,
  createStoryProgressState,
  skipStoryProgress,
} from "../ui/storyProgressModel.js";

export function createStoryModeController({
  state,
  getScene,
  setGameMode,
  startGameplay,
  playSfx = () => {},
  now = () => 0,
} = {}) {
  function getActiveScene() {
    return getScene?.(state.story?.sceneId) || null;
  }

  function completeStory() {
    const runMode = state.story?.runMode || getActiveScene()?.returnRunMode || "endless";
    state.story = null;
    startGameplay?.(runMode);
    return true;
  }

  function startStory(sceneId, runMode = "endless") {
    const scene = getScene?.(sceneId);
    if (!scene || scene.panels.length === 0) {
      startGameplay?.(runMode);
      return false;
    }

    state.story = createStoryProgressState({
      sceneId: scene.id,
      runMode,
      totalPanels: scene.panels.length,
      startedAt: now(),
    });
    setGameMode?.("story");
    playSfx("uiConfirm");
    return true;
  }

  function nextStoryPanel() {
    const scene = getActiveScene();
    if (!scene || !state.story) return false;
    const result = advanceStoryProgress(state.story, scene.panels);
    state.story = result.progress;
    if (result.completed) return completeStory();
    playSfx("uiConfirm");
    return true;
  }

  function skipStory() {
    if (!state.story) return false;
    state.story = skipStoryProgress(state.story);
    playSfx("uiCancel");
    return completeStory();
  }

  return {
    completeStory,
    nextStoryPanel,
    skipStory,
    startStory,
  };
}
