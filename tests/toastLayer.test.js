import { describe, expect, it } from "vitest";
import { translations } from "../src/data/i18n.js";
import {
  getToastDiagnostics,
  normalizeToastEvent,
  showToast,
} from "../src/dom/toastLayer.js";

describe("toast layer helpers", () => {
  it("normalizes event-only toast payloads", () => {
    expect(normalizeToastEvent({
      type: "run-start",
      text: "Ascension Challenge Started",
      tone: "rift",
      durationMs: 1200,
    })).toEqual({
      type: "run-start",
      text: "Ascension Challenge Started",
      tone: "rift",
      durationMs: 1200,
    });
    expect(normalizeToastEvent({ text: "Fallback" }).durationMs).toBe(1800);
  });

  it("does not require DOM during tests", () => {
    expect(showToast({ text: "No DOM" })).toBeNull();
    expect(getToastDiagnostics()).toMatchObject({ activeToasts: 0, maxToasts: 4 });
  });

  it("localizes ascension challenge toast text", () => {
    expect(translations.zh.ascensionChallengeStarted).toBe("升階挑戰開始");
    expect(translations.en.ascensionChallengeStarted).toBe("Ascension Challenge Started");
  });
});
