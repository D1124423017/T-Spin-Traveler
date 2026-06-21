import { describe, expect, it } from "vitest";
import {
  LOADING_OVERLAY_RECT,
  createLoadingOverlayModel,
} from "../src/ui/loadingOverlay.js";

describe("loading overlay helpers", () => {
  it("builds deterministic loading overlay display data", () => {
    const model = createLoadingOverlayModel({
      summary: { loading: 2, loaded: 3, error: 0, total: 10 },
      now: 1500,
      startedAt: 1000,
      debugEnabled: true,
      debugBuild: "debug-build",
    });

    expect(model.rect).toBe(LOADING_OVERLAY_RECT);
    expect(model.elapsed).toBe(500);
    expect(model.realProgress).toBe(0.3);
    expect(model.progress).toBeGreaterThan(0.3);
    expect(model.progress).toBeLessThan(1);
    expect(model.gateReady).toBe(false);
    expect(model.message).toBe("Preparing rift assets...");
    expect(model.title).toBe("Rift Synchronizing");
    expect(model.counterText).toBe("3/10");
    expect(model.orbit).toBeCloseTo(1.8);
    expect(model.scan).toBeCloseTo(0.27);
    expect(model.debugEnabled).toBe(true);
    expect(model.debugBuild).toBe("debug-build");
  });

  it("shows the fallback warning and counts failed assets as progress", () => {
    const model = createLoadingOverlayModel({
      summary: { loading: 0, loaded: 8, error: 2, total: 10 },
      now: 0,
      startedAt: 0,
      drawError: "draw failed",
    });

    expect(model.progress).toBe(1);
    expect(model.message).toBe("Some critical rift assets failed to load.");
    expect(model.counterText).toBe("10/10");
    expect(model.drawError).toBe("draw failed");
  });

  it("handles missing totals without claiming visual progress", () => {
    const model = createLoadingOverlayModel({
      summary: { loaded: 0, error: 0, total: 0 },
      now: 10,
      startedAt: 5,
    });

    expect(model.progress).toBe(0);
    expect(model.counterText).toBe("0/...");
  });

  it("uses critical first-paint progress without claiming gate readiness", () => {
    const model = createLoadingOverlayModel({
      summary: { loading: 90, loaded: 10, error: 0, total: 100 },
      firstPaintSummary: {
        ready: false,
        loaded: 7,
        error: 0,
        total: 9,
        loading: ["hero-idle-canonical", "menu-idle-cube-sheet-16"],
      },
      now: 1200,
      startedAt: 0,
    });

    expect(model.counterText).toBe("7/9");
    expect(model.realProgress).toBeCloseTo(7 / 9);
    expect(model.progress).toBeLessThan(1);
    expect(model.gateReady).toBe(false);
  });

  it("shows complete shimmer state after first-paint is ready", () => {
    const model = createLoadingOverlayModel({
      summary: { loading: 0, loaded: 100, error: 0, total: 100 },
      firstPaintSummary: {
        ready: true,
        loaded: 9,
        error: 0,
        total: 9,
        loading: [],
      },
      now: 1160,
      startedAt: 0,
      completionStartedAt: 1000,
      completionDelayMs: 320,
    });

    expect(model.gateReady).toBe(true);
    expect(model.completionProgress).toBe(0.5);
    expect(model.progress).toBe(1);
    expect(model.message).toBe("Rift gate aligned");
  });
});
