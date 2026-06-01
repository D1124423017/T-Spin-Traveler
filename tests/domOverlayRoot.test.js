import { describe, expect, it } from "vitest";
import {
  GSAP_FEEDBACK_CDN_URL,
  canvasPointToLayerPercent,
  getDomOverlayDiagnostics,
  normalizeCanvasSize,
} from "../src/dom/domOverlayRoot.js";

describe("DOM overlay root helpers", () => {
  it("keeps the GSAP CDN pinned for GitHub Pages", () => {
    expect(GSAP_FEEDBACK_CDN_URL).toBe("https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js");
  });

  it("normalizes canvas size and coordinate percentages", () => {
    expect(normalizeCanvasSize({ width: 0, height: -1 })).toEqual({ width: 1280, height: 720 });
    expect(canvasPointToLayerPercent({ x: 640, y: 360 })).toEqual({
      left: "50.000%",
      top: "50.000%",
    });
    expect(canvasPointToLayerPercent({ x: 476, y: 72 })).toEqual({
      left: "37.188%",
      top: "10.000%",
    });
  });

  it("reports a safe no-DOM diagnostic shape in node tests", () => {
    expect(getDomOverlayDiagnostics()).toMatchObject({
      rootReady: false,
      gsapReady: false,
      reducedMotion: false,
    });
  });
});
