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
    expect(model.progress).toBe(0.3);
    expect(model.message).toBe("Loading assets...");
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
    expect(model.message).toBe("Some assets failed to load. The game will use fallback visuals.");
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
});
