import { describe, expect, it } from "vitest";
import { PIECE_TYPES, createSevenBag, refillQueue } from "../src/tetris/pieces.js";

describe("7-bag queue", () => {
  it("creates one of each tetromino per bag", () => {
    const bag = createSevenBag(() => 0);
    expect([...bag].sort()).toEqual([...PIECE_TYPES].sort());
  });

  it("refills without dropping pieces", () => {
    const result = refillQueue([], [], { min: 14, rng: () => 0 });
    const firstBag = result.queue.slice(0, 7).sort();
    const secondBag = result.queue.slice(7, 14).sort();

    expect(firstBag).toEqual([...PIECE_TYPES].sort());
    expect(secondBag).toEqual([...PIECE_TYPES].sort());
  });
});
