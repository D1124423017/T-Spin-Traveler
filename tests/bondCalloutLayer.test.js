import { describe, expect, it } from "vitest";
import { translations } from "../src/data/i18n.js";
import {
  getBondCalloutDiagnostics,
  normalizeBondCallout,
  showBondCallout,
} from "../src/dom/bondCalloutLayer.js";

describe("bond callout layer helpers", () => {
  it("normalizes angel and devil event payloads without reading game state", () => {
    expect(normalizeBondCallout({
      family: "devil",
      text: "Devil Pact triggered",
      detail: "Bond effect",
      durationMs: 900,
    })).toEqual({
      family: "devil",
      text: "Devil Pact triggered",
      detail: "Bond effect",
      durationMs: 900,
    });
    expect(normalizeBondCallout({ family: "unknown", text: "Angel Bond 1/3" }).family).toBe("angel");
  });

  it("does not require DOM during tests", () => {
    expect(showBondCallout({ family: "angel", text: "No DOM" })).toBeNull();
    expect(getBondCalloutDiagnostics()).toMatchObject({ activeCallouts: 0, maxCallouts: 3 });
  });

  it("localizes short bond callout labels", () => {
    expect(translations.zh.bondCalloutActivated).toBe("羈絆啟動");
    expect(translations.en.bondCalloutActivated).toBe("Bond awakened");
    expect(translations.zh.bondCalloutEffect).toBe("羈絆效果");
    expect(translations.en.bondCalloutEffect).toBe("Bond effect");
  });
});
