import { describe, expect, it } from "vitest";
import {
  CANVAS_STATE_RECOVERY_DEPTH,
  recoverCanvasState,
  resetCanvasEffects,
  resetCanvasFrame,
  resetCanvasTransform,
} from "../src/render/renderStyles.js";

function createMockCanvasContext() {
  const calls = [];
  return {
    calls,
    globalAlpha: 0.3,
    globalCompositeOperation: "screen",
    lineWidth: 7,
    shadowBlur: 18,
    shadowColor: "#fff",
    restore: () => calls.push(["restore"]),
    setTransform: (...args) => calls.push(["setTransform", ...args]),
    resetTransform: () => calls.push(["resetTransform"]),
    clearRect: (...args) => calls.push(["clearRect", ...args]),
  };
}

describe("render style helpers", () => {
  it("resets canvas visual effects without touching draw order", () => {
    const ctx = createMockCanvasContext();

    resetCanvasEffects(ctx);

    expect(ctx.globalAlpha).toBe(1);
    expect(ctx.globalCompositeOperation).toBe("source-over");
    expect(ctx.shadowBlur).toBe(0);
    expect(ctx.shadowColor).toBe("transparent");
    expect(ctx.lineWidth).toBe(1);
    expect(ctx.calls).toEqual([]);
  });

  it("prefers setTransform for identity transform reset", () => {
    const ctx = createMockCanvasContext();

    resetCanvasTransform(ctx);

    expect(ctx.calls).toEqual([["setTransform", 1, 0, 0, 1, 0, 0]]);
  });

  it("falls back to resetTransform when setTransform is unavailable", () => {
    const ctx = createMockCanvasContext();
    delete ctx.setTransform;

    resetCanvasTransform(ctx);

    expect(ctx.calls).toEqual([["resetTransform"]]);
  });

  it("recovers the same number of canvas state stack levels", () => {
    const ctx = createMockCanvasContext();

    recoverCanvasState(ctx, 3);

    expect(ctx.calls).toEqual([["restore"], ["restore"], ["restore"]]);
  });

  it("clears a frame after state recovery, transform reset, and effect reset", () => {
    const ctx = createMockCanvasContext();

    resetCanvasFrame(ctx, 1280, 720);

    expect(ctx.calls.slice(0, CANVAS_STATE_RECOVERY_DEPTH)).toEqual(
      Array.from({ length: CANVAS_STATE_RECOVERY_DEPTH }, () => ["restore"]),
    );
    expect(ctx.calls[CANVAS_STATE_RECOVERY_DEPTH]).toEqual(["setTransform", 1, 0, 0, 1, 0, 0]);
    expect(ctx.calls[CANVAS_STATE_RECOVERY_DEPTH + 1]).toEqual(["clearRect", 0, 0, 1280, 720]);
    expect(ctx.globalAlpha).toBe(1);
    expect(ctx.globalCompositeOperation).toBe("source-over");
    expect(ctx.shadowBlur).toBe(0);
    expect(ctx.shadowColor).toBe("transparent");
    expect(ctx.lineWidth).toBe(1);
  });
});
