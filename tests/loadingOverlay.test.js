import { describe, expect, it } from "vitest";
import {
  LOADING_HUD_LAYOUT,
  LOADING_OVERLAY_RECT,
  LOADING_PERCENT_TYPOGRAPHY,
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
    expect(model.layout).toBe(LOADING_HUD_LAYOUT);
    expect(model.elapsed).toBe(500);
    expect(model.realProgress).toBe(0.3);
    expect(model.progress).toBeGreaterThan(0.3);
    expect(model.progress).toBeLessThan(1);
    expect(model.displayProgress).toBeGreaterThan(0);
    expect(model.displayProgress).toBeLessThanOrEqual(model.progress);
    expect(model.percentText).toMatch(/^\d+%$/);
    expect(model.gateReady).toBe(false);
    expect(model.message).toBe("Preparing rift assets...");
    expect(model.title).toBe("Rift Synchronizing");
    expect(model.counterText).toBe("3/10");
    expect(model.orbit).toBeCloseTo(1.8);
    expect(model.scan).toBeCloseTo(0.27);
    expect(model.debugEnabled).toBe(true);
    expect(model.debugBuild).toBe("debug-build");
    expect(model.backgroundMotion.reducedMotion).toBe(false);
  });

  it("uses a bottom cinematic HUD instead of the former large center panel", () => {
    const model = createLoadingOverlayModel({
      summary: { loading: 1, loaded: 8, error: 0, total: 10 },
      now: 1000,
      startedAt: 0,
    });

    expect(model.rect.y).toBeGreaterThanOrEqual(500);
    expect(model.rect.h).toBeLessThanOrEqual(140);
    expect(model.layout.barY).toBeGreaterThanOrEqual(600);
    expect(model.layout.barY + model.layout.barH).toBeLessThanOrEqual(640);
    expect(model.layout.barW).toBeGreaterThanOrEqual(1280 * 0.58);
    expect(model.layout.barW).toBeLessThanOrEqual(1280 * 0.66);
    expect(model.layout.percentY).toBeLessThan(model.layout.barY);
    expect(model.layout.messageY).toBeGreaterThan(model.layout.barY);
  });

  it("keeps the CountUp percentage typography compact", () => {
    expect(LOADING_PERCENT_TYPOGRAPHY.fontSize).toBeGreaterThanOrEqual(30);
    expect(LOADING_PERCENT_TYPOGRAPHY.fontSize).toBeLessThanOrEqual(38);
    expect(LOADING_PERCENT_TYPOGRAPHY.shadowBlur).toBeLessThanOrEqual(16);
    expect(LOADING_PERCENT_TYPOGRAPHY.lighterAlpha).toBeLessThan(0.2);
  });

  it("shows the fallback warning and counts failed assets as progress", () => {
    const model = createLoadingOverlayModel({
      summary: { loading: 0, loaded: 8, error: 2, total: 10 },
      now: 0,
      startedAt: 0,
      drawError: "draw failed",
    });

    expect(model.progress).toBe(1);
    expect(model.percentText).toMatch(/^\d+%$/);
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
    expect(model.displayProgress).toBe(0);
    expect(model.percentText).toBe("0%");
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
    expect(model.displayProgress).toBeLessThanOrEqual(model.progress);
    expect(model.gateReady).toBe(false);
  });

  it("does not show a critical warning for optional errors when first-paint assets are still valid", () => {
    const model = createLoadingOverlayModel({
      summary: { loading: 0, loaded: 98, error: 2, total: 100 },
      firstPaintSummary: {
        ready: true,
        loaded: 9,
        error: 0,
        total: 9,
        loading: [],
      },
      now: 900,
      startedAt: 0,
    });

    expect(model.hasCriticalError).toBe(false);
    expect(model.message).toBe("Preparing rift assets...");
    expect(model.gateReady).toBe(true);
  });

  it("reduces drift and particles when reduced motion is requested", () => {
    const normal = createLoadingOverlayModel({
      summary: { loading: 1, loaded: 5, error: 0, total: 10 },
      now: 2000,
      startedAt: 0,
      reducedMotion: false,
    });
    const reduced = createLoadingOverlayModel({
      summary: { loading: 1, loaded: 5, error: 0, total: 10 },
      now: 2000,
      startedAt: 0,
      reducedMotion: true,
    });

    expect(reduced.backgroundMotion.reducedMotion).toBe(true);
    expect(reduced.backgroundMotion.particleCount).toBeLessThan(normal.backgroundMotion.particleCount);
    expect(reduced.backgroundMotion.maxDriftPx).toBeLessThan(normal.backgroundMotion.maxDriftPx);
    expect(reduced.backgroundMotion.intensity).toBeLessThan(normal.backgroundMotion.intensity);
  });

  it("keeps debug information disabled by default", () => {
    const model = createLoadingOverlayModel({
      summary: { loading: 1, loaded: 5, error: 0, total: 10 },
      now: 0,
      startedAt: 0,
    });

    expect(model.debugEnabled).toBe(false);
    expect(model.layout.debugX).toBeLessThan(model.layout.x);
    expect(model.layout.debugY).toBeGreaterThan(model.layout.y);
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
    expect(model.displayProgress).toBeGreaterThan(0.98);
    expect(model.message).toBe("Rift gate aligned");
  });
});
