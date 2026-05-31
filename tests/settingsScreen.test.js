import { describe, expect, it } from "vitest";
import {
  formatSettingsPercent,
  formatTuningSliderValue,
  getControlActionLabel,
  getControlDisplayValue,
  getSettingsTabLabelKey,
} from "../src/ui/settingsScreen.js";

describe("settings screen helpers", () => {
  it("formats settings tab translation keys", () => {
    expect(getSettingsTabLabelKey("controls")).toBe("settingsTabControls");
    expect(getSettingsTabLabelKey("audio")).toBe("settingsTabAudio");
  });

  it("formats volume and tuning values without canvas", () => {
    expect(formatSettingsPercent(0.735)).toBe("74%");
    expect(formatTuningSliderValue("arr", 0, { unit: "ms" })).toBe("0 ms");
    expect(formatTuningSliderValue("lockDelay", 498.5, { unit: "ms" })).toBe("499 ms");
  });

  it("formats control labels and display values", () => {
    const actions = [{ id: "left", labelKey: "control.left" }];
    const translate = (key) => ({ "control.left": "Move Left" })[key] || key;
    expect(getControlActionLabel("left", actions, translate)).toBe("Move Left");
    expect(getControlActionLabel("missing", actions, translate)).toBe("missing");

    expect(getControlDisplayValue("hold", {
      getControlKeys: () => ["shift", "c"],
      formatControlKey: (key) => key.toUpperCase(),
    })).toBe("SHIFT / C");
    expect(getControlDisplayValue("hold", { getControlKeys: () => [] })).toBe("-");
  });
});
