import { describe, expect, it } from "vitest";
import { createPiece } from "../src/tetris/pieces.js";
import { holdPieceState, resetHoldAfterPlacement } from "../src/tetris/hold.js";

describe("hold behavior", () => {
  it("stores the current piece on first hold", () => {
    const state = { active: createPiece("T"), hold: null, queue: ["I", "O"], canHold: true };
    const next = holdPieceState(state, createPiece);

    expect(next.hold).toBe("T");
    expect(next.active.type).toBe("I");
    expect(next.queue).toEqual(["O"]);
    expect(next.canHold).toBe(false);
  });

  it("does not allow repeated hold before placement", () => {
    const state = { active: createPiece("T"), hold: "I", queue: ["O"], canHold: false };
    const next = holdPieceState(state, createPiece);

    expect(next.held).toBe(false);
    expect(next.active.type).toBe("T");
    expect(next.hold).toBe("I");
  });

  it("resets canHold after placement", () => {
    const state = { active: createPiece("T"), hold: "I", queue: ["O"], canHold: false };
    expect(resetHoldAfterPlacement(state).canHold).toBe(true);
  });
});
