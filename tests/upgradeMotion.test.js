import { describe, expect, it } from "vitest";
import {
  getUpgradeCardMotion,
  getUpgradeDetailMotion,
  getUpgradeOverlayMotion,
} from "../src/ui/upgradeMotion.js";

describe("upgrade motion helpers", () => {
  it("staggers card reveal by card index", () => {
    const first = getUpgradeCardMotion({ now: 210, openedAt: 0, index: 0 });
    const third = getUpgradeCardMotion({ now: 210, openedAt: 0, index: 2 });
    expect(first.alpha).toBeGreaterThan(third.alpha);
    expect(first.reveal).toBeGreaterThan(third.reveal);
  });

  it("lifts and scales the selected upgrade card", () => {
    const normal = getUpgradeCardMotion({ now: 700, openedAt: 0, index: 0 });
    const selected = getUpgradeCardMotion({ now: 700, openedAt: 0, selectedAt: 520, index: 0, selected: true });
    expect(selected.y).toBeLessThan(normal.y);
    expect(selected.scale).toBeGreaterThan(normal.scale);
    expect(selected.glow).toBeGreaterThan(normal.glow);
  });

  it("returns stable values for reduced motion", () => {
    const overlay = getUpgradeOverlayMotion({ reducedMotion: true });
    const card = getUpgradeCardMotion({ selected: true, reducedMotion: true });
    const detail = getUpgradeDetailMotion({ reducedMotion: true });
    expect(overlay).toEqual({ alpha: 1, y: 0, glow: 0 });
    expect(card.alpha).toBe(1);
    expect(card.y).toBe(-4);
    expect(detail.alpha).toBe(1);
    expect(detail.shimmer).toBe(0);
  });
});
