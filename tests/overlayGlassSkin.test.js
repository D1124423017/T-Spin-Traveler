import { describe, expect, it, vi } from "vitest";
import {
  drawOverlayGlassPanel,
  drawOverlayGlassSection,
  getOverlayPanelMotion,
  isOverlayPointerInRect,
} from "../src/ui/overlayGlassSkin.js";

function createContext() {
  const gradient = { addColorStop: vi.fn() };
  return new Proxy({
    createLinearGradient: vi.fn(() => gradient),
    createRadialGradient: vi.fn(() => gradient),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
  }, {
    get(target, key) {
      if (key in target) return target[key];
      return "";
    },
    set(target, key, value) {
      target[key] = value;
      return true;
    },
  });
}

describe("overlay glass skin", () => {
  it("draws settings-style panels and sections without owning input state", () => {
    const ctx = createContext();
    const roundedRect = vi.fn();
    const deps = {
      ctx,
      roundedRect,
      state: { pointer: { x: 24, y: 28 } },
      now: 1200,
      prefersReducedMotion: () => true,
    };
    const rect = { x: 10, y: 20, w: 100, h: 40 };

    expect(isOverlayPointerInRect(deps, rect)).toBe(true);
    expect(() => drawOverlayGlassPanel(deps, rect)).not.toThrow();
    expect(() => drawOverlayGlassSection(deps, rect, { color: "#fff0a6" })).not.toThrow();
    expect(roundedRect).toHaveBeenCalled();
  });

  it("keeps entrance motion bounded and reduced-motion safe", () => {
    expect(getOverlayPanelMotion(100, 100, { reducedMotion: true })).toEqual({
      alpha: 1,
      y: 0,
    });
    expect(getOverlayPanelMotion(100, 100, { duration: 200, y: 20 })).toMatchObject({
      alpha: 0,
      y: 20,
    });
    expect(getOverlayPanelMotion(400, 100, { duration: 200, y: 20 })).toMatchObject({
      alpha: 1,
      y: 0,
    });
  });
});
