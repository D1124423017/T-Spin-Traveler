import {
  getCurrentStoryPanel,
  getStoryPanelProgress,
} from "./storyProgressModel.js";

export function getStoryComicLayout(width = 1280, height = 720) {
  const safeX = Math.max(92, width * 0.075);
  const rightSafeX = Math.max(72, width * 0.056);
  const top = Math.max(44, height * 0.06);
  const bottom = Math.max(62, height * 0.086);
  const controlsW = Math.min(292, Math.max(250, width * 0.19));
  const controlGap = Math.max(28, width * 0.022);
  const textHeight = Math.min(132, Math.max(112, height * 0.17));
  const controlsX = width - rightSafeX - controlsW;
  const textX = safeX;
  const textMaxW = controlsX - textX - controlGap;
  const textW = Math.max(width * 0.52, Math.min(width * 0.61, textMaxW));
  const textY = height - bottom - textHeight;
  const controlsY = textY + Math.max(8, textHeight * 0.06);
  const titleW = Math.min(520, Math.max(380, width * 0.31));
  const titleH = Math.min(60, Math.max(52, height * 0.075));
  const nextW = Math.min(250, Math.max(214, controlsW * 0.88));
  const skipW = Math.min(218, Math.max(188, controlsW * 0.76));
  const nextH = Math.min(50, Math.max(44, height * 0.064));
  const skipH = Math.min(44, Math.max(38, height * 0.054));
  const nextX = controlsX + (controlsW - nextW) / 2;
  const skipX = controlsX + (controlsW - skipW) / 2;
  const nextY = controlsY + Math.max(40, textHeight * 0.34);
  const skipY = nextY + nextH + Math.max(8, textHeight * 0.06);
  return {
    screen: { x: 0, y: 0, w: width, h: height },
    imageRect: { x: 0, y: 0, w: width, h: height },
    panelHitRect: { x: 0, y: 0, w: width, h: height },
    frameRect: {
      x: safeX * 0.72,
      y: top * 0.68,
      w: width - safeX * 0.72 - rightSafeX * 0.72,
      h: height - top * 0.68 - bottom * 0.68,
    },
    titleRect: {
      x: safeX,
      y: top,
      w: titleW,
      h: titleH,
    },
    textBox: {
      x: textX,
      y: textY,
      w: textW,
      h: textHeight,
    },
    controlPanel: {
      x: controlsX,
      y: controlsY,
      w: controlsW,
      h: Math.max(118, skipY + skipH - controlsY),
    },
    skipButton: {
      x: skipX,
      y: skipY,
      w: skipW,
      h: skipH,
    },
    nextButton: {
      x: nextX,
      y: nextY,
      w: nextW,
      h: nextH,
    },
    hintRect: {
      x: controlsX + Math.max(10, controlsW * 0.05),
      y: controlsY,
      w: controlsW - Math.max(20, controlsW * 0.1),
      h: Math.max(22, height * 0.032),
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
