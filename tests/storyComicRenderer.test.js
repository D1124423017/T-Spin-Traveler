import { describe, expect, it, vi } from "vitest";
import { createStoryComicRenderer } from "../src/render/storyComicRenderer.js";

function createMockContext() {
  const gradient = { addColorStop: vi.fn() };
  const calls = [];
  return {
    calls,
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    drawImage: vi.fn((image, ...args) => calls.push({ image, args })),
    createRadialGradient: vi.fn(() => gradient),
    createLinearGradient: vi.fn(() => gradient),
    set fillStyle(value) {
      this._fillStyle = value;
    },
    get fillStyle() {
      return this._fillStyle;
    },
    set font(value) {
      this._font = value;
    },
    get font() {
      return this._font;
    },
    set globalAlpha(value) {
      this._globalAlpha = value;
    },
    get globalAlpha() {
      return this._globalAlpha ?? 1;
    },
    set globalCompositeOperation(value) {
      this._globalCompositeOperation = value;
    },
    get globalCompositeOperation() {
      return this._globalCompositeOperation || "source-over";
    },
    set shadowBlur(value) {
      this._shadowBlur = value;
    },
    get shadowBlur() {
      return this._shadowBlur || 0;
    },
    set shadowColor(value) {
      this._shadowColor = value;
    },
    get shadowColor() {
      return this._shadowColor || "";
    },
    set textAlign(value) {
      this._textAlign = value;
    },
    get textAlign() {
      return this._textAlign || "left";
    },
    set textBaseline(value) {
      this._textBaseline = value;
    },
    get textBaseline() {
      return this._textBaseline || "alphabetic";
    },
  };
}

function createReadyImage(id, width = 512, height = 192) {
  return {
    id,
    complete: true,
    naturalWidth: width,
    naturalHeight: height,
  };
}

describe("story comic renderer", () => {
  it("draws the story chrome with settings-style canvas glass panels", () => {
    const ctx = createMockContext();
    const panelImage = createReadyImage("story-panel", 1920, 1080);
    const storyUiAssets = {
      titlePlaque: createReadyImage("title-plaque", 1024, 256),
      dialoguePanel: createReadyImage("dialogue-panel", 1600, 360),
      nextButton: createReadyImage("next-button", 512, 192),
      skipButton: createReadyImage("skip-button", 512, 192),
    };
    const renderer = createStoryComicRenderer({
      ctx,
      width: 1280,
      height: 720,
      state: {
        story: { sceneId: "prologue", panelIndex: 0, totalPanels: 1 },
        pointer: { x: 0, y: 0, down: false },
      },
      getScene: () => ({
        id: "prologue",
        titleKey: "story.prologue.title",
        panels: [{
          id: "panel-01",
          image: panelImage,
          narrationKey: "story.prologue.panel01.narration",
        }],
      }),
      t: (key) => key,
      canvasFont: (weight, size) => `${weight} ${size}px sans-serif`,
      fitLabel: vi.fn(),
      wrapText: vi.fn(),
      storyUiAssets,
      isImageReady: (image) => Boolean(image?.complete && image.naturalWidth > 0),
      now: () => 1200,
      prefersReducedMotion: () => true,
    });

    renderer.drawStoryComicOverlay();

    expect(ctx.drawImage).toHaveBeenCalled();
    expect(ctx.calls.map((call) => call.image)).toEqual([panelImage]);
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  it("replays the staged UI entry when the story panel changes", () => {
    const ctx = createMockContext();
    const panelImage = createReadyImage("story-panel", 1920, 1080);
    const storyUiAssets = {
      titlePlaque: createReadyImage("title-plaque", 2048, 256),
      dialoguePanel: createReadyImage("dialogue-panel", 2048, 512),
      nextButton: createReadyImage("next-button", 1024, 256),
      skipButton: createReadyImage("skip-button", 1024, 256),
    };
    const state = {
      story: { sceneId: "prologue", panelIndex: 0, totalPanels: 2 },
      pointer: { x: 0, y: 0, down: false },
    };
    let currentNow = 1000;
    const renderer = createStoryComicRenderer({
      ctx,
      width: 1280,
      height: 720,
      state,
      getScene: () => ({
        id: "prologue",
        titleKey: "story.prologue.title",
        panels: [
          {
            id: "panel-01",
            image: panelImage,
            narrationKey: "story.prologue.panel01.narration",
          },
          {
            id: "panel-02",
            image: panelImage,
            narrationKey: "story.prologue.panel02.narration",
          },
        ],
      }),
      t: (key) => key,
      canvasFont: (weight, size) => `${weight} ${size}px sans-serif`,
      fitLabel: vi.fn(),
      wrapText: vi.fn(),
      storyUiAssets,
      isImageReady: (image) => Boolean(image?.complete && image.naturalWidth > 0),
      now: () => currentNow,
      prefersReducedMotion: () => false,
    });

    renderer.drawStoryComicOverlay();
    expect(ctx.translate).toHaveBeenCalledWith(-30, -4);

    ctx.translate.mockClear();
    currentNow = 1800;
    renderer.drawStoryComicOverlay();
    expect(ctx.translate.mock.calls.some(([x, y]) => x < -1 || y > 1)).toBe(false);

    ctx.translate.mockClear();
    state.story.panelIndex = 1;
    renderer.drawStoryComicOverlay();
    expect(ctx.translate).not.toHaveBeenCalledWith(-30, -4);
    expect(ctx.translate).toHaveBeenCalledWith(0, 22);
    expect(ctx.translate).toHaveBeenCalledWith(14, 12);
  });
});
