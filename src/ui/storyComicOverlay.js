import {
  getCurrentStoryPanel,
  getStoryPanelProgress,
} from "./storyProgressModel.js";

export function getStoryComicLayout(width = 1280, height = 720) {
  const marginX = Math.max(28, width * 0.035);
  const top = Math.max(24, height * 0.045);
  const bottom = Math.max(24, height * 0.04);
  const textHeight = Math.max(132, height * 0.22);
  const textW = Math.min(width - marginX * 2 - 230, 890);
  const textX = marginX + 18;
  const textY = height - bottom - textHeight;
  return {
    screen: { x: 0, y: 0, w: width, h: height },
    imageRect: { x: 0, y: 0, w: width, h: height },
    panelHitRect: { x: 0, y: 0, w: width, h: height },
    frameRect: {
      x: marginX,
      y: top,
      w: width - marginX * 2,
      h: height - top - bottom,
    },
    titleRect: {
      x: marginX + 20,
      y: top + 18,
      w: Math.min(520, width - marginX * 2 - 220),
      h: 42,
    },
    progressRect: {
      x: width - marginX - 148,
      y: top + 16,
      w: 110,
      h: 34,
    },
    skipButton: {
      x: width - marginX - 130,
      y: top + 62,
      w: 118,
      h: 40,
    },
    textBox: {
      x: textX,
      y: textY,
      w: textW,
      h: textHeight,
    },
    nextButton: {
      x: width - marginX - 188,
      y: height - bottom - 64,
      w: 168,
      h: 48,
    },
    hintRect: {
      x: width - marginX - 300,
      y: height - bottom - 92,
      w: 280,
      h: 22,
    },
  };
}

export function createStoryComicOverlayModel({
  story,
  scene,
  translate = (key) => key,
} = {}) {
  if (!story || !scene) return null;
  const panel = getCurrentStoryPanel(story, scene.panels);
  if (!panel) return null;
  const progress = getStoryPanelProgress(story, scene.panels);
  const speaker = panel.speakerKey ? translate(panel.speakerKey) : "";
  const narration = panel.narrationKey ? translate(panel.narrationKey) : "";
  const dialogue = panel.dialogueKey ? translate(panel.dialogueKey) : "";
  return {
    sceneId: scene.id,
    title: translate(scene.titleKey),
    panel,
    progress,
    speaker,
    text: dialogue || narration,
    isDialogue: Boolean(dialogue),
  };
}
