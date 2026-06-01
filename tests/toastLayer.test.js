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
      text: "Rift route opened",
      tone: "rift",
      durationMs: 1200,
    })).toEqual({
      type: "run-start",
      text: "Rift route opened",
      tone: "rift",
      durationMs: 1200,
    });
    expect(normalizeToastEvent({ text: "Fallback" }).durationMs).toBe(1800);
  });

  it("does not require DOM during tests", () => {
    expect(showToast({ text: "No DOM" })).toBeNull();
    expect(getToastDiagnostics()).toMatchObject({ activeToasts: 0, maxToasts: 4 });
  });

  it("localizes run-start toast text", () => {
    expect(translations.zh.toastRunStart).toBe("裂隙航道啟動");
    expect(translations.en.toastRunStart).toBe("Rift route opened");
  });
});
