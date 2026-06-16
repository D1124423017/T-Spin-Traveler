import { describe, expect, it } from "vitest";
import {
  createStoryComicOverlayModel,
  getStoryComicLayout,
} from "../src/ui/storyComicOverlay.js";

describe("story comic overlay model", () => {
  it("builds current panel display data from progress and scene data", () => {
    const scene = {
      id: "prologue",
      titleKey: "story.prologue.title",
      panels: [
        {
          id: "p1",
          speakerKey: "",
          narrationKey: "story.prologue.panel01.narration",
          dialogueKey: "",
        },
        {
          id: "p2",
          speakerKey: "story.speaker.noa",
          narrationKey: "",
          dialogueKey: "story.prologue.panel04.noa",
        },
      ],
    };
    const model = createStoryComicOverlayModel({
      story: { sceneId: "prologue", panelIndex: 1, totalPanels: 2 },
      scene,
      translate: (key) => `t:${key}`,
    });

    expect(model).toMatchObject({
      sceneId: "prologue",
      title: "t:story.prologue.title",
      panel: { id: "p2" },
      progress: { current: 2, total: 2, panelIndex: 1 },
      speaker: "t:story.speaker.noa",
      text: "t:story.prologue.panel04.noa",
      isDialogue: true,
    });
  });

  it("keeps skip and next button rects inside the canvas", () => {
    const layout = getStoryComicLayout(1280, 720);

    for (const rect of [layout.skipButton, layout.nextButton, layout.textBox, layout.frameRect]) {
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.y).toBeGreaterThanOrEqual(0);
      expect(rect.x + rect.w).toBeLessThanOrEqual(1280);
      expect(rect.y + rect.h).toBeLessThanOrEqual(720);
    }
  });
});
