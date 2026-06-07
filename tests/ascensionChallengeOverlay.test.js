import { describe, expect, it, vi } from "vitest";
import {
  drawAscensionChallengeHud,
  drawAscensionResultOverlay,
} from "../src/ui/ascensionChallengeOverlay.js";

function createContext() {
  return {
    save() {},
    restore() {},
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
  };
}

function createResultDeps(status) {
  return {
    ctx: createContext(),
    run: {
      status,
      linesCleared: status === "success" ? 40 : 12,
      targetLines: 40,
      remainingMs: 25000,
    },
    metaProgress: { ascensionTier: status === "success" ? 1 : 0 },
    message: status,
    t: (key) => key,
    fmt: (key) => key,
    drawDimOverlay() {},
    resultScrim: 0.8,
    drawCard() {},
    drawCornerGlyph() {},
    label() {},
    wrapText() {},
    roundedRect() {},
    drawMenuButton: vi.fn(),
  };
}

describe("ascension challenge overlay renderer", () => {
  it("draws one return action for success and retry plus return for failure", () => {
    const success = createResultDeps("success");
    const failed = createResultDeps("failed");

    expect(() => drawAscensionResultOverlay(success)).not.toThrow();
    expect(() => drawAscensionResultOverlay(failed)).not.toThrow();
    expect(success.drawMenuButton).toHaveBeenCalledTimes(1);
    expect(failed.drawMenuButton).toHaveBeenCalledTimes(2);
  });

  it("draws active challenge time and line progress", () => {
    const fitLabel = vi.fn();

    expect(() => drawAscensionChallengeHud({
      ctx: createContext(),
      run: {
        status: "active",
        durationMs: 120000,
        remainingMs: 14000,
        linesCleared: 24,
        targetLines: 40,
      },
      fmt: (key) => key,
      fitLabel,
      roundedRect() {},
    })).not.toThrow();
    expect(fitLabel).toHaveBeenCalledTimes(3);
  });
});
