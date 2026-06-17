import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { translations } from "../src/data/i18n.js";

const projectRoot = process.cwd();

class MockMedia {
  addEventListener() {}
  load() {}
}

globalThis.Image = MockMedia;
globalThis.Audio = MockMedia;

const {
  ASSET_REGISTRY,
  storyProloguePanels,
} = await import("../src/data/assets.js");
const {
  STORY_SCENE_IDS,
  getStoryScene,
} = await import("../src/data/storyChapters.js");

function readPngInfo(relativePath) {
  const buffer = fs.readFileSync(path.join(projectRoot, relativePath));
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    colorType: buffer.readUInt8(25),
  };
}

describe("story data", () => {
  it("defines the prologue as sixteen ordered non-empty comic panels", () => {
    const scene = getStoryScene(STORY_SCENE_IDS.prologue);

    expect(scene).toMatchObject({
      id: "prologue",
      titleKey: "story.prologue.title",
      afterCompleteAction: "startGameplay",
    });
    expect(scene.panels).toHaveLength(16);
    expect(scene.panels.map((panel) => panel.order)).toEqual([
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16,
    ]);

    for (const panel of scene.panels) {
      expect(panel.id).toMatch(/^prologue-panel-\d\d$/);
      expect(panel.imageAssetKey).toMatch(/^story-prologue-panel-\d\d$/);
      expect(panel.image).toBeTruthy();
      expect(panel.narrationKey || panel.dialogueKey).toBeTruthy();
      expect(panel.sceneId).toBe(scene.id);
    }
  });

  it("registers every prologue panel as a 1920 x 1080 runtime asset", () => {
    const records = new Map(ASSET_REGISTRY.images.map((record) => [record.id, record]));

    for (let index = 1; index <= 16; index += 1) {
      const key = `panel${String(index).padStart(2, "0")}`;
      const assetId = `story-prologue-panel-${String(index).padStart(2, "0")}`;
      const record = records.get(assetId);

      expect(storyProloguePanels[key]).toBeTruthy();
      expect(record, `${assetId} should be registered`).toBeTruthy();
      expect(record.path).toMatch(/^assets\/images\/story\/prologue\/prologue-panel-\d\d-/);
      expect(readPngInfo(record.path)).toEqual({ width: 1920, height: 1080, colorType: 6 });
    }
  });

  it("uses the rift mine as the prologue traversal point instead of the poker table", () => {
    const scene = getStoryScene(STORY_SCENE_IDS.prologue);
    const panel08 = scene.panels[7];
    const panel12 = scene.panels[11];

    expect(panel08.imageAssetKey).toBe("story-prologue-panel-08");
    expect(ASSET_REGISTRY.images.find((record) => record.id === panel08.imageAssetKey)?.path)
      .toBe("assets/images/story/prologue/prologue-panel-08-sent-to-rift-mine.png");
    expect(panel08.dialogueKey).toBe("story.prologue.panel08.king");
    expect(panel12.narrationKey).toBe("story.prologue.panel12.narration");
    expect(translations.zh[panel12.narrationKey]).toContain("礦坑崩裂");
    expect(translations.en[panel12.narrationKey]).toContain("mine split open");
  });

  it("continues from the rift core into Egypt before gameplay starts", () => {
    const scene = getStoryScene(STORY_SCENE_IDS.prologue);
    const panel13 = scene.panels[12];
    const panel14 = scene.panels[13];
    const panel15 = scene.panels[14];
    const panel16 = scene.panels[15];

    expect(panel13.imageAssetKey).toBe("story-prologue-panel-13");
    expect(panel13.narrationKey).toBe("story.prologue.panel13.narration");
    expect(ASSET_REGISTRY.images.find((record) => record.id === panel13.imageAssetKey)?.path)
      .toBe("assets/images/story/prologue/prologue-panel-13-falls-into-egypt-ruins.png");
    expect(translations.zh[panel13.narrationKey]).toContain("陌生神殿");
    expect(translations.en[panel13.narrationKey]).toContain("strange temple");

    expect(panel14.imageAssetKey).toBe("story-prologue-panel-14");
    expect(translations.zh[panel14.narrationKey]).toContain("埃及祭司");
    expect(translations.en[panel14.narrationKey]).toContain("Egyptian priests");

    expect(panel15.imageAssetKey).toBe("story-prologue-panel-15");
    expect(translations.zh[panel15.narrationKey]).toContain("反向湧回裝置");
    expect(translations.en[panel15.narrationKey]).toContain("surged backward");

    expect(panel16.imageAssetKey).toBe("story-prologue-panel-16");
    expect(translations.zh[panel16.narrationKey]).toContain("守衛包圍");
    expect(translations.en[panel16.narrationKey]).toContain("surrounded");
  });

  it("has zh and en story translations without internal spoiler terms", () => {
    const scene = getStoryScene(STORY_SCENE_IDS.prologue);
    const keys = new Set([
      scene.titleKey,
      "story.action.next",
      "story.action.skip",
      "story.hint.controls",
    ]);
    for (const panel of scene.panels) {
      if (panel.speakerKey) keys.add(panel.speakerKey);
      if (panel.narrationKey) keys.add(panel.narrationKey);
      if (panel.dialogueKey) keys.add(panel.dialogueKey);
    }

    for (const language of ["zh", "en"]) {
      for (const key of keys) {
        expect(translations[language][key], `${language}.${key}`).toBeTruthy();
      }
    }

    expect(translations.zh["story.action.next"]).toBe("下一張");
    expect(translations.zh["story.action.skip"]).toBe("跳過劇情");
    expect(translations.zh["story.hint.controls"]).toBe("Space 下一張　Esc 跳過劇情");
    expect(translations.en["story.action.next"]).toBe("Next");
    expect(translations.en["story.action.skip"]).toBe("Skip Story");
    expect(translations.en["story.hint.controls"]).toBe("Space Next   Esc Skip Story");

    const publicStoryText = [...keys]
      .flatMap((key) => [translations.zh[key], translations.en[key]])
      .join("\n");
    expect(publicStoryText).not.toMatch(/Crown Mind Cage|王冠腦籠|DLC|思想操控/);
  });
});
