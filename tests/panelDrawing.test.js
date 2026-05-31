import { describe, expect, it } from "vitest";
import { getMenuButtonVisualState } from "../src/ui/panelDrawing.js";

describe("panel drawing helpers", () => {
  it("detects menu button hover and primary state without canvas", () => {
    expect(getMenuButtonVisualState({
      pointer: { x: 15, y: 18 },
      rect: { x: 10, y: 10, w: 40, h: 20 },
      variant: "primary",
    })).toEqual({ hovered: true, primary: true });

    expect(getMenuButtonVisualState({
      pointer: { x: 60, y: 18 },
      rect: { x: 10, y: 10, w: 40, h: 20 },
      variant: "secondary",
    })).toEqual({ hovered: false, primary: false });
  });
});
