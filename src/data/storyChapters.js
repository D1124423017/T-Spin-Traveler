import {
  PROLOGUE_SCENE_ID,
  PROLOGUE_STORY_PANELS,
} from "./storyPanels.js";

export const STORY_SCENE_IDS = Object.freeze({
  prologue: PROLOGUE_SCENE_ID,
});

export const STORY_SCENES = Object.freeze({
  [PROLOGUE_SCENE_ID]: Object.freeze({
    id: PROLOGUE_SCENE_ID,
    chapterId: "prologue",
    titleKey: "story.prologue.title",
    panels: PROLOGUE_STORY_PANELS,
    afterCompleteAction: "startGameplay",
    returnRunMode: "endless",
  }),
});

export function getStoryScene(sceneId = PROLOGUE_SCENE_ID) {
  return STORY_SCENES[sceneId] || null;
}

export function getStoryScenePanels(sceneId = PROLOGUE_SCENE_ID) {
  return getStoryScene(sceneId)?.panels || [];
}
