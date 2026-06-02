import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  GSAP_FEEDBACK_CDN_URL,
  canvasPointToLayerPercent,
  getComboFeedbackIntensity,
  getDamageFeedbackStrength,
  getFeedbackVisualProfile,
  makeFeedbackText,
} from "../src/dom/gsapFeedback.js";

const projectRoot = process.cwd();

function readDomOverlayCss() {
  return fs.readFileSync(path.join(projectRoot, "src/dom/domOverlay.css"), "utf8");
}

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

  it("keeps combo, B2B, T-Spin, and Perfect feedback frameless and icon-free", () => {
    const css = readDomOverlayCss();
    expect(css).toContain(".tst-feedback-combo .tst-feedback-rune");
    expect(css).toContain(".tst-feedback-tspin .tst-feedback-streak");
    expect(css).toContain(".tst-feedback-perfect .tst-feedback-rune");
    expect(css).toContain(".tst-feedback-perfect .tst-feedback-ring");
    expect(css).toContain("border: 0;");
    expect(css).toContain("background: transparent;");
    expect(css).toContain("box-shadow: none;");
    expect(css).toContain("display: none;");
  });
});
