import { describe, expect, it, vi } from "vitest";
import {
  createEquipmentHeroPreviewRenderer,
  createEquipmentHeroIdlePlayback,
  getEquipmentHeroDrawRect,
  getEquipmentHeroFrameIndex,
  getEquipmentHeroFrameSource,
} from "../src/ui/equipmentHeroPreview.js";

describe("equipment hero preview", () => {
  it("selects a slow looping frame and respects reduced motion", () => {
    expect(getEquipmentHeroFrameIndex(0)).toBe(0);
    expect(getEquipmentHeroFrameIndex(190)).toBe(1);
    expect(getEquipmentHeroFrameIndex(190 * 15)).toBe(15);
    expect(getEquipmentHeroFrameIndex(190 * 16)).toBe(0);
    expect(getEquipmentHeroFrameIndex(190 * 8, { reducedMotion: true })).toBe(0);
  });

  it("maps the 4x4 sheet into 512x768 source frames", () => {
    expect(getEquipmentHeroFrameSource({
      naturalWidth: 2048,
      naturalHeight: 3072,
    }, 6)).toEqual({
      x: 1024,
      y: 768,
      w: 512,
      h: 768,
    });
  });

  it("positions the full-body preview lower without resizing it", () => {
    const rect = getEquipmentHeroDrawRect({ x: 50, y: 86, w: 316, h: 438 });

    expect(rect).toEqual({ x: 50, y: 110, w: 316, h: 438 });
    expect(rect.y + rect.h).toBeLessThanOrEqual(666);
  });

  it("schedules one-shot idle bursts after random rest windows", () => {
    const animations = [
      { id: "menu-idle-cube", image: {}, frameMs: 100, frameCount: 10 },
      { id: "menu-idle-meditate", image: {}, frameMs: 100, frameCount: 8 },
    ];
    const random = vi.fn()
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.6)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(0);
    const playback = createEquipmentHeroIdlePlayback({
      animations,
      delayMinMs: 3000,
      delayMaxMs: 5000,
      fadeMs: 100,
      resetGapMs: Number.POSITIVE_INFINITY,
      random,
    });

    expect(playback.get(0)).toBeNull();
    expect(playback.get(2999)).toBeNull();
    expect(playback.get(3000)).toMatchObject({
      animation: { id: "menu-idle-meditate" },
      elapsed: 0,
    });
    expect(playback.get(3400)).toMatchObject({
      animation: { id: "menu-idle-meditate" },
      elapsed: 400,
    });
    expect(playback.get(3800)).toBeNull();
    expect(playback.get(8799)).toBeNull();
    expect(playback.get(8800)).toMatchObject({
      animation: { id: "menu-idle-cube" },
      elapsed: 0,
    });
    expect(playback.get(8820, { reducedMotion: true })).toBeNull();
  });

  it("keeps the destination box fixed while the fallback idle sheet stays static", () => {
    const ctx = createCanvasContextStub();
    const idleSheet = { naturalWidth: 2048, naturalHeight: 3072 };
    const fallbackArt = {};
    let elapsed = 0;
    const renderer = createEquipmentHeroPreviewRenderer({
      ctx,
      idleSheet,
      fallbackArt,
      isImageReady: (image) => image === idleSheet,
      drawImageContain: vi.fn(),
      now: () => elapsed,
      reducedMotion: () => false,
    });
    const imageRect = { x: 50, y: 86, w: 316, h: 438 };
    const stageRect = { x: 40, y: 104, w: 336, h: 420 };

    renderer.draw({ stageRect, imageRect });
    elapsed = 190 * 6;
    renderer.draw({ stageRect, imageRect });

    const firstDraw = ctx.drawImage.mock.calls[0];
    const secondDraw = ctx.drawImage.mock.calls[1];
    expect(firstDraw.slice(5)).toEqual([50, 110, 316, 438]);
    expect(secondDraw.slice(5)).toEqual([50, 110, 316, 438]);
    expect(firstDraw.slice(1, 5)).toEqual([0, 0, 512, 768]);
    expect(secondDraw.slice(1, 5)).toEqual([0, 0, 512, 768]);
  });

  it("falls back to the canonical full-body art while the sheet loads", () => {
    const ctx = createCanvasContextStub();
    const drawImageContain = vi.fn();
    const fallbackArt = {};
    const renderer = createEquipmentHeroPreviewRenderer({
      ctx,
      idleSheet: {},
      fallbackArt,
      isImageReady: () => false,
      drawImageContain,
      now: () => 0,
      reducedMotion: () => true,
    });
    const imageRect = { x: 50, y: 86, w: 316, h: 438 };

    renderer.draw({
      stageRect: { x: 40, y: 104, w: 336, h: 420 },
      imageRect,
    });

    expect(drawImageContain).toHaveBeenCalledWith(
      fallbackArt,
      imageRect.x,
      imageRect.y + 24,
      imageRect.w,
      imageRect.h,
    );
  });

  it("plays the provided idle sheet as a one-shot burst without extra wiring", () => {
    const ctx = createCanvasContextStub();
    const idleSheet = { naturalWidth: 2048, naturalHeight: 3072 };
    const fallbackArt = {};
    let elapsed = 0;
    const renderer = createEquipmentHeroPreviewRenderer({
      ctx,
      idleSheet,
      fallbackArt,
      isImageReady: (image) => image === idleSheet || image === fallbackArt,
      drawImageContain: vi.fn(),
      now: () => elapsed,
      reducedMotion: () => false,
      idleDelayMinMs: 3000,
      idleDelayMaxMs: 3000,
      idleRandom: vi.fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0),
    });
    const imageRect = { x: 50, y: 86, w: 316, h: 438 };
    const stageRect = { x: 40, y: 104, w: 336, h: 420 };

    const drawAt = (time) => {
      elapsed = time;
      renderer.draw({ stageRect, imageRect });
    };

    drawAt(0);
    drawAt(1000);
    drawAt(2000);
    expect(ctx.drawImage).not.toHaveBeenCalled();

    drawAt(3000);
    drawAt(3600);
    const draw = ctx.drawImage.mock.calls.at(-1);
    expect(draw[0]).toBe(idleSheet);
    expect(draw.slice(1, 5)).toEqual([1536, 0, 512, 768]);
    expect(draw.slice(5)).toEqual([50, 110, 316, 438]);
  });

  it("uses one active idle burst without moving the preview box", () => {
    const ctx = createCanvasContextStub();
    const cubeSheet = { naturalWidth: 2048, naturalHeight: 3072 };
    const meditateSheet = { naturalWidth: 2048, naturalHeight: 3072 };
    const fallbackArt = {};
    let elapsed = 0;
    const renderer = createEquipmentHeroPreviewRenderer({
      ctx,
      idleAnimations: [
        { id: "menu-idle-cube", image: cubeSheet, frameMs: 100, frameCount: 16 },
        { id: "menu-idle-meditate", image: meditateSheet, frameMs: 100, frameCount: 16 },
      ],
      fallbackArt,
      isImageReady: (image) => image === cubeSheet || image === meditateSheet || image === fallbackArt,
      drawImageContain: vi.fn(),
      now: () => elapsed,
      reducedMotion: () => false,
      idleDelayMinMs: 3000,
      idleDelayMaxMs: 3000,
      idleRandom: vi.fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0.6)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0),
    });
    const imageRect = { x: 50, y: 86, w: 316, h: 438 };
    const stageRect = { x: 40, y: 104, w: 336, h: 420 };

    const drawAt = (time) => {
      elapsed = time;
      renderer.draw({ stageRect, imageRect });
    };

    drawAt(0);
    expect(ctx.drawImage).not.toHaveBeenCalled();

    [1000, 2000, 3000, 3600].forEach(drawAt);

    const draw = ctx.drawImage.mock.calls.at(-1);
    expect(draw[0]).toBe(meditateSheet);
    expect(draw.slice(1, 5)).toEqual([1024, 768, 512, 768]);
    expect(draw.slice(5)).toEqual([50, 110, 316, 438]);

    ctx.drawImage.mockClear();
    drawAt(4600);
    drawAt(5600);
    drawAt(6600);
    expect(ctx.drawImage).not.toHaveBeenCalled();

    [7599].forEach(drawAt);
    expect(ctx.drawImage).not.toHaveBeenCalled();

    drawAt(7600);
    expect(ctx.drawImage).toHaveBeenCalled();
  });

  it("resets the equipment idle scheduler after the preview stops drawing", () => {
    const ctx = createCanvasContextStub();
    const cubeSheet = { naturalWidth: 2048, naturalHeight: 3072 };
    const fallbackArt = {};
    const random = vi.fn()
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0);
    let elapsed = 0;
    const renderer = createEquipmentHeroPreviewRenderer({
      ctx,
      idleAnimations: [
        { id: "menu-idle-cube", image: cubeSheet, frameMs: 100, frameCount: 16 },
      ],
      fallbackArt,
      isImageReady: (image) => image === cubeSheet || image === fallbackArt,
      drawImageContain: vi.fn(),
      now: () => elapsed,
      reducedMotion: () => false,
      idleDelayMinMs: 3000,
      idleDelayMaxMs: 3000,
      idleRandom: random,
    });
    const imageRect = { x: 50, y: 86, w: 316, h: 438 };
    const stageRect = { x: 40, y: 104, w: 336, h: 420 };

    const drawAt = (time) => {
      elapsed = time;
      renderer.draw({ stageRect, imageRect });
    };

    drawAt(0);
    [1000, 2000, 3000].forEach(drawAt);
    expect(ctx.drawImage).toHaveBeenCalled();

    ctx.drawImage.mockClear();
    drawAt(20000);
    expect(ctx.drawImage).not.toHaveBeenCalled();

    [21000, 22000, 22999].forEach(drawAt);
    expect(ctx.drawImage).not.toHaveBeenCalled();

    drawAt(23000);
    expect(ctx.drawImage).toHaveBeenCalled();
  });
});

function createCanvasContextStub() {
  const gradient = { addColorStop: vi.fn() };
  return new Proxy({
    createRadialGradient: () => gradient,
    drawImage: vi.fn(),
    globalAlpha: 1,
    restore: vi.fn(),
    save: vi.fn(),
  }, {
    get(target, property) {
      if (!(property in target)) target[property] = vi.fn();
      return target[property];
    },
  });
}
