import { describe, expect, it } from "vitest";
import {
  getStoryUiEntryMotion,
  getStoryUiShimmer,
} from "../src/ui/storyComicMotion.js";

describe("story comic motion", () => {
  it("stages title, dialogue, and controls into the story scene", () => {
    const start = getStoryUiEntryMotion({ elapsedMs: 0 });
    const settled = getStoryUiEntryMotion({ elapsedMs: 760 });

    expect(start.title.alpha).toBeLessThan(0.1);
    expect(start.title.offsetX).toBeLessThan(-20);
    expect(start.textBox.offsetY).toBeGreaterThan(15);
    expect(start.controls.offsetX).toBeGreaterThan(10);

    expect(settled.title).toMatchObject({ alpha: 1, offsetX: 0, offsetY: 0 });
    expect(settled.textBox).toMatchObject({ alpha: 1, offsetX: 0, offsetY: 0 });
    expect(settled.controls).toMatchObject({ alpha: 1, offsetX: 0, offsetY: 0 });
  });

  it("disables travel and shimmer when reduced motion is requested", () => {
    const entry = getStoryUiEntryMotion({ elapsedMs: 0, reducedMotion: true });
    const shimmer = getStoryUiShimmer({ now: 1200, reducedMotion: true });

    expect(entry.title).toEqual({ alpha: 1, offsetX: 0, offsetY: 0 });
    expect(entry.textBox).toEqual({ alpha: 1, offsetX: 0, offsetY: 0 });
    expect(entry.controls).toEqual({ alpha: 1, offsetX: 0, offsetY: 0 });
    expect(shimmer.intensity).toBe(0);
  });

  it("keeps shimmer subtle for royal rift chrome", () => {
    const shimmer = getStoryUiShimmer({ now: 900 });

    expect(shimmer.titlePhase).toBeGreaterThanOrEqual(0);
    expect(shimmer.titlePhase).toBeLessThan(1);
    expect(shimmer.panelPhase).toBeGreaterThanOrEqual(0);
    expect(shimmer.panelPhase).toBeLessThan(1);
    expect(shimmer.intensity).toBeGreaterThan(0);
    expect(shimmer.intensity).toBeLessThanOrEqual(0.12);
  });
});
