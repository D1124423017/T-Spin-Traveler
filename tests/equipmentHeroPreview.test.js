import { describe, expect, it, vi } from "vitest";
import {
  createEquipmentHeroPreviewRenderer,
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

  it("keeps the destination box fixed while the idle frame advances", () => {
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
    expect(firstDraw.slice(5)).toEqual([50, 86, 316, 438]);
    expect(secondDraw.slice(5)).toEqual([50, 86, 316, 438]);
    expect(firstDraw.slice(1, 5)).toEqual([0, 0, 512, 768]);
    expect(secondDraw.slice(1, 5)).toEqual([1024, 768, 512, 768]);
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
      imageRect.y,
      imageRect.w,
      imageRect.h,
    );
  });
});

function createCanvasContextStub() {
  const gradient = { addColorStop: vi.fn() };
  return new Proxy({
    createRadialGradient: () => gradient,
    drawImage: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
  }, {
    get(target, property) {
      if (!(property in target)) target[property] = vi.fn();
      return target[property];
    },
  });
}
