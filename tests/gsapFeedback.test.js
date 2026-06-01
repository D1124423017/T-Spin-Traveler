import { describe, expect, it } from "vitest";
import {
  GSAP_FEEDBACK_CDN_URL,
  canvasPointToLayerPercent,
  getComboFeedbackIntensity,
  getDamageFeedbackStrength,
  getFeedbackVisualProfile,
  makeFeedbackText,
} from "../src/dom/gsapFeedback.js";

describe("gsap feedback helpers", () => {
  it("uses a pinned CDN URL instead of a bare package import", () => {
    expect(GSAP_FEEDBACK_CDN_URL).toBe("https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js");
  });

  it("maps canvas coordinates into shell-relative percentages", () => {
    expect(canvasPointToLayerPercent({ x: 640, y: 360 })).toEqual({
      left: "50.000%",
      top: "50.000%",
    });
    expect(canvasPointToLayerPercent({ x: 476, y: 72 })).toEqual({
      left: "37.188%",
      top: "10.000%",
    });
  });

  it("formats fallback feedback labels without touching gameplay state", () => {
    expect(makeFeedbackText("combo", { combo: 4 })).toBe("4 COMBO");
    expect(makeFeedbackText("b2b", { chain: 3 })).toBe("B2B CHAIN 3");
    expect(makeFeedbackText("tspin", { spinType: "mini" })).toBe("T-SPIN MINI");
    expect(makeFeedbackText("perfect")).toBe("PERFECT CLEAR");
    expect(makeFeedbackText("damage", { amount: 128.8 })).toBe("-128");
  });

  it("assigns visual weight without changing gameplay values", () => {
    expect(getComboFeedbackIntensity(2)).toBe("small");
    expect(getComboFeedbackIntensity(4)).toBe("medium");
    expect(getComboFeedbackIntensity(7)).toBe("high");
    expect(getDamageFeedbackStrength(64)).toBe("normal");
    expect(getDamageFeedbackStrength(128)).toBe("heavy");
    expect(getDamageFeedbackStrength(640)).toBe("critical");
  });

  it("uses separate animation profiles for feedback types", () => {
    expect(getFeedbackVisualProfile("combo", { combo: 8 })).toMatchObject({
      intensity: "high",
      durationMs: 860,
    });
    expect(getFeedbackVisualProfile("b2b", { chain: 1 }).intensity).toBe("medium");
    expect(getFeedbackVisualProfile("tspin", { spinType: "full" }).intensity).toBe("high");
    expect(getFeedbackVisualProfile("perfect").intensity).toBe("ultimate");
  });
});
