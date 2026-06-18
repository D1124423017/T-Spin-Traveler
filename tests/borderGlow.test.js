import { describe, expect, it } from "vitest";
import { getBorderGlowState } from "../src/ui/borderGlow.js";

describe("border glow helpers", () => {
  const rect = { x: 100, y: 80, w: 220, h: 90 };

  it("activates when the pointer is near an interactive edge", () => {
    const nearEdge = getBorderGlowState({ x: 104, y: 122 }, rect, {
      edgeSensitivity: 30,
    });
    const center = getBorderGlowState({ x: 210, y: 125 }, rect, {
      edgeSensitivity: 30,
    });

    expect(nearEdge.active).toBe(true);
    expect(nearEdge.side).toBe("left");
    expect(nearEdge.edgeProximity).toBeGreaterThan(center.edgeProximity);
    expect(nearEdge.intensity).toBeGreaterThan(center.intensity);
  });

  it("stays inactive when the pointer is outside the sensitivity zone", () => {
    const state = getBorderGlowState({ x: 20, y: 20 }, rect, {
      edgeSensitivity: 24,
    });

    expect(state.active).toBe(false);
    expect(state.edgeProximity).toBe(0);
    expect(state.intensity).toBe(0);
  });

  it("keeps selected controls readable even without pointer input", () => {
    const state = getBorderGlowState(null, rect, {
      selected: true,
      selectedIntensity: 0.38,
    });

    expect(state.active).toBe(true);
    expect(state.intensity).toBe(0.38);
    expect(state.localX).toBe(0.5);
    expect(state.localY).toBe(0.5);
  });

  it("respects disabled state over selected state", () => {
    const state = getBorderGlowState({ x: 100, y: 80 }, rect, {
      disabled: true,
      selected: true,
    });

    expect(state.active).toBe(false);
    expect(state.intensity).toBe(0);
  });
});
